import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/** GET: Generate next invoice number from DB */
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const action = searchParams.get("action");

        if (action === "next-invoice") {
            const year = new Date().getFullYear();
            const prefix = `INV-${year}-`;

            // Count existing invoices for this year
            const count = await prisma.transaksi.count({
                where: {
                    nomor_invoice: { startsWith: prefix },
                },
            });

            const invoice = `${prefix}${String(count + 1).padStart(4, "0")}`;
            return NextResponse.json({ invoice });
        }

        return NextResponse.json({ error: "Action tidak valid." }, { status: 400 });
    } catch (e) {
        console.error("transaksi GET error:", e);
        return NextResponse.json(
            { error: "Gagal mengambil data." },
            { status: 500 }
        );
    }
}

type ItemPayload = {
    name: string;
    price: number;
    qty: number;
    productId?: string; // string ID from frontend, maps to produk.id (int)
};

type PaymentPayload = {
    method: string;
    amount: number;
};

type TransactionPayload = {
    userId: number;
    outletId: string; // string ID from frontend
    invoice: string;
    date: string; // YYYY-MM-DD
    customerName: string;
    customerPhone?: string;
    nopol?: string;
    vehicle?: string;
    items: ItemPayload[];
    subtotal: number;
    discount: number;
    total: number;
    payments: PaymentPayload[];
    nominalBayar: number;
    sisa: number;
    note?: string;
};

export async function POST(req: Request) {
    try {
        const body: TransactionPayload = await req.json();

        const {
            userId,
            outletId,
            invoice,
            date,
            customerName,
            customerPhone,
            nopol,
            vehicle,
            items,
            subtotal,
            discount,
            total,
            payments,
            nominalBayar,
            sisa,
            note,
        } = body;

        // Validate required fields
        if (!outletId || !invoice || !date || !customerName || !items?.length) {
            return NextResponse.json(
                { error: "Data transaksi tidak lengkap." },
                { status: 400 }
            );
        }

        // Validate user is outlet admin
        if (userId) {
            const user = await prisma.users.findUnique({ where: { id: userId } });
            if (user && user.role === "admin") {
                return NextResponse.json(
                    { error: "Super Admin tidak dapat membuat transaksi. Gunakan akun outlet." },
                    { status: 403 }
                );
            }
        }

        const outletIdNum = Number(outletId);
        const statusPembayaran = sisa > 0 ? "Belum Lunas" : "Lunas";

        // Use Prisma interactive transaction for atomicity
        const result = await prisma.$transaction(async (tx) => {
            // 1. Upsert pelanggan
            let pelangganId: number | null = null;
            if (customerName.trim()) {
                const existing = await tx.pelanggan.findFirst({
                    where: {
                        nama_pelanggan: customerName.trim(),
                        id_outlet: outletIdNum,
                    },
                });

                if (existing) {
                    pelangganId = existing.id;
                    // Update phone if provided
                    if (customerPhone?.trim()) {
                        await tx.pelanggan.update({
                            where: { id: existing.id },
                            data: { nomer_hp: customerPhone.trim() },
                        });
                    }
                } else {
                    const newPelanggan = await tx.pelanggan.create({
                        data: {
                            nama_pelanggan: customerName.trim(),
                            nomer_hp: customerPhone?.trim() || null,
                            id_outlet: outletIdNum,
                        },
                    });
                    pelangganId = newPelanggan.id;
                }
            }

            // 2. Create transaksi
            const transaksi = await tx.transaksi.create({
                data: {
                    id_pelanggan: pelangganId,
                    id_outlet: outletIdNum,
                    id_user: userId || null,
                    nomor_invoice: invoice,
                    tanggal: new Date(date),
                    nopol: nopol || null,
                    mobil: vehicle || null,
                    catatan: note || null,
                    total_pembayaran: total,
                    total_terbayar: nominalBayar,
                    status_pembayaran: statusPembayaran,
                    tanggal_lunas: sisa <= 0 ? new Date() : null,
                    sisa_tagihan: Math.max(0, sisa),
                    diskon: discount,
                },
            });

            // 3. Create transaksi_detail + deduct stock
            for (const item of items) {
                const produkId = item.productId ? Number(item.productId) : null;
                const lineSubtotal = item.price * item.qty;

                await tx.transaksi_detail.create({
                    data: {
                        id_transaksi: transaksi.id,
                        id_produk: produkId,
                        nama_produk_manual: produkId ? null : item.name,
                        harga_satuan: item.price,
                        jumlah: item.qty,
                        subtotal: lineSubtotal,
                    },
                });

                // Deduct stock for real products
                if (produkId) {
                    await tx.produk_stok_harga.updateMany({
                        where: {
                            id_produk: produkId,
                            id_outlet: outletIdNum,
                        },
                        data: {
                            stok: { decrement: item.qty },
                        },
                    });
                }
            }

            // 4. Create transaksi_pembayaran
            for (const payment of payments) {
                if (payment.amount > 0) {
                    await tx.transaksi_pembayaran.create({
                        data: {
                            id_transaksi: transaksi.id,
                            metode_pembayaran: payment.method,
                            nominal_bayar: payment.amount,
                        },
                    });
                }
            }

            return transaksi;
        });

        return NextResponse.json({ success: true, id: result.id, invoice: result.nomor_invoice });
    } catch (e) {
        console.error("transaksi POST error:", e);

        // Handle unique constraint violation (duplicate invoice)
        if (e instanceof Error && e.message.includes("Unique constraint")) {
            return NextResponse.json(
                { error: "Nomor invoice sudah digunakan. Silakan coba lagi." },
                { status: 409 }
            );
        }

        return NextResponse.json(
            { error: e instanceof Error ? e.message : "Gagal menyimpan transaksi." },
            { status: 500 }
        );
    }
}
