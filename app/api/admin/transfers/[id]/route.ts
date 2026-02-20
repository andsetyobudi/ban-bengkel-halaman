import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Handle PATCH: Update Status (Terima, Selesai, Batalkan)
export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await req.json();
        const { status, userId } = body; // status: "diterima" | "selesai" | "dibatalkan"

        if (!id || !status || !userId) {
            return NextResponse.json(
                { error: "Data tidak lengkap" },
                { status: 400 }
            );
        }

        // Map frontend status to DB status enum
        // Frontend: pending, diterima (Received), selesai (Completed), dibatalkan (Cancelled)
        // DB Enum: diajukan, dikirim, diterima, ditolak
        // Mapping:
        // pending -> diajukan
        // diterima -> dikirim (Intermediate state)
        // selesai -> diterima (Final state)
        // dibatalkan -> ditolak

        let dbStatus: "diajukan" | "dikirim" | "diterima" | "ditolak";

        if (status === "diterima") {
            dbStatus = "dikirim";
        } else if (status === "selesai") {
            dbStatus = "diterima";
        } else if (status === "dibatalkan") {
            dbStatus = "ditolak";
        } else {
            return NextResponse.json({ error: "Status tidak valid" }, { status: 400 });
        }

        const result = await prisma.$transaction(async (tx) => {
            const transferId = Number(id);

            // 1. Get current transfer
            const transfer = await tx.transfer_stok.findUnique({
                where: { id: transferId },
                include: { transfer_stok_detail: true },
            });

            if (!transfer) {
                throw new Error("Transfer tidak ditemukan");
            }

            // 2. Handle Status Logic
            if (status === "dibatalkan") {
                // If cancelling, RETURN stock to Source Outlet
                // Only allow cancelling if it's currently 'diajukan' (pending)
                if (transfer.status !== "diajukan") {
                    throw new Error("Hanya transfer status 'pending' yang bisa dibatalkan.");
                }

                for (const item of transfer.transfer_stok_detail) {
                    // Find source stock record (must exist because we deducted it)
                    const psh = await tx.produk_stok_harga.findFirst({
                        where: {
                            id_outlet: transfer.id_outlet_asal,
                            id_produk: item.id_produk,
                        },
                    });

                    if (psh) {
                        await tx.produk_stok_harga.update({
                            where: { id: psh.id },
                            data: { stok: { increment: item.jumlah } },
                        });
                    }
                }
            } else if (status === "selesai") {
                // If completing, ADD stock to Destination Outlet
                // Only allow if current status is 'dikirim' (diterima frontend) or 'diajukan' (pending frontend - if allowed direct completion)
                // But logic usually: Sent -> Received.
                if (transfer.status === "diterima" || transfer.status === "ditolak") {
                    throw new Error("Transfer sudah selesai atau ditolak.");
                }

                for (const item of transfer.transfer_stok_detail) {
                    // Find destination stock record
                    const psh = await tx.produk_stok_harga.findFirst({
                        where: {
                            id_outlet: transfer.id_outlet_tujuan,
                            id_produk: item.id_produk,
                        }
                    });

                    if (psh) {
                        await tx.produk_stok_harga.update({
                            where: { id: psh.id },
                            data: { stok: { increment: item.jumlah } }
                        });
                    } else {
                        // Create new stock record
                        // Get price info from source or product master
                        const sourcePsh = await tx.produk_stok_harga.findFirst({
                            where: {
                                id_outlet: transfer.id_outlet_asal,
                                id_produk: item.id_produk,
                            }
                        });

                        await tx.produk_stok_harga.create({
                            data: {
                                id_outlet: transfer.id_outlet_tujuan,
                                id_produk: item.id_produk,
                                stok: item.jumlah,
                                harga_modal: sourcePsh?.harga_modal ?? 0,
                                harga_jual: sourcePsh?.harga_jual ?? 0,
                            }
                        });
                    }
                }

                // Update receive date
                await tx.transfer_stok.update({
                    where: { id: transferId },
                    data: { tanggal_terima: new Date() }
                });
            }

            // 3. Update Status
            const updatedTransfer = await tx.transfer_stok.update({
                where: { id: transferId },
                data: {
                    status: dbStatus,
                    id_user_penerima: Number(userId),
                    updated_at: new Date(),
                },
            });

            return updatedTransfer;
        });

        return NextResponse.json({ success: true, transfer: result });
    } catch (error) {
        console.error("Error updating transfer:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Gagal update transfer" },
            { status: 500 }
        );
    }
}
