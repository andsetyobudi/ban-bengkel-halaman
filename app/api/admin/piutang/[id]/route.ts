
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Handle PATCH: Lunaskan Piutang
export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const transferId = Number(id);

        // Get current transaction
        const transaction = await prisma.transaksi.findUnique({
            where: { id: transferId },
        });

        if (!transaction) {
            return NextResponse.json({ error: "Transaksi tidak ditemukan" }, { status: 404 });
        }

        const sisa = Number(transaction.sisa_tagihan);

        if (sisa <= 0) {
            return NextResponse.json({ error: "Transaksi sudah lunas" }, { status: 400 });
        }

        // Process Full Payment
        const result = await prisma.$transaction(async (tx) => {
            // 1. Create Payment Record (default to 'Tunai' for now as per simple request)
            await tx.transaksi_pembayaran.create({
                data: {
                    id_transaksi: transferId,
                    metode_pembayaran: "Tunai", // Default method
                    nominal_bayar: sisa,
                    catatan: "Pelunasan Piutang",
                }
            });

            // 2. Update Transaction
            const updatedTx = await tx.transaksi.update({
                where: { id: transferId },
                data: {
                    total_terbayar: { increment: sisa },
                    sisa_tagihan: 0,
                    status_pembayaran: "Lunas",
                    tanggal_lunas: new Date(),
                }
            });

            return updatedTx;
        });

        return NextResponse.json({ success: true, transaction: result });

    } catch (error) {
        console.error("Error paying piutang:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Gagal memproses pelunasan" },
            { status: 500 }
        );
    }
}
