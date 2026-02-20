import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { fromOutletId, toOutletId, date, note, items, userId } = body;

        if (!fromOutletId || !toOutletId || !items || !items.length || !userId) {
            return NextResponse.json(
                { error: "Data tidak lengkap" },
                { status: 400 }
            );
        }

        // Generate Nomor Transfer: TRF-YYYYMMDD-XXXX
        const dateObj = new Date(date);
        const dateStr = dateObj.toISOString().slice(0, 10).replace(/-/g, "");
        const randomSuffix = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
        const nomorTransfer = `TRF-${dateStr}-${randomSuffix}`;

        // Jalankan dalam transaction agar konsisten:
        // 1. Buat record transfer
        // 2. Buat detail transfer
        // 3. KURANGI stok outlet asal
        const result = await prisma.$transaction(async (tx) => {
            // 1. Create Header
            const transfer = await tx.transfer_stok.create({
                data: {
                    nomor_transfer: nomorTransfer,
                    id_outlet_asal: Number(fromOutletId),
                    id_outlet_tujuan: Number(toOutletId),
                    tanggal_kirim: dateObj,
                    status: "diajukan", // "pending"
                    catatan: note,
                    id_user_pengirim: Number(userId),
                },
            });

            // 2. Process Items & Deduct Stock
            for (const item of items) {
                // Create Detail
                await tx.transfer_stok_detail.create({
                    data: {
                        id_transfer: transfer.id,
                        id_produk: Number(item.productId),
                        jumlah: Number(item.qty),
                    },
                });

                // 3. Deduct Stock (Source)
                const psh = await tx.produk_stok_harga.findFirst({
                    where: {
                        id_outlet: Number(fromOutletId),
                        id_produk: Number(item.productId),
                    },
                });

                if (!psh) {
                    throw new Error(`Stok produk ID ${item.productId} tidak ditemukan di outlet asal.`);
                }

                if (Number(psh.stok) < Number(item.qty)) {
                    throw new Error(`Stok produk tidak mencukupi (Tersedia: ${psh.stok}).`);
                }

                await tx.produk_stok_harga.update({
                    where: { id: psh.id },
                    data: {
                        stok: {
                            decrement: Number(item.qty),
                        },
                    },
                });
            }

            return transfer;
        });

        return NextResponse.json({ success: true, transfer: result });
    } catch (error) {
        console.error("Error creating transfer:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Gagal membuat transfer" },
            { status: 500 }
        );
    }
}
