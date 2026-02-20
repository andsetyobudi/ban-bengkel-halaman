import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/** DELETE: Hapus transaksi beserta detail dan pembayaran (cascade) */
export async function DELETE(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: idStr } = await params;
        const id = parseInt(idStr, 10);
        if (Number.isNaN(id)) {
            return NextResponse.json(
                { error: "ID transaksi tidak valid." },
                { status: 400 }
            );
        }

        const existing = await prisma.transaksi.findUnique({ where: { id } });
        if (!existing) {
            return NextResponse.json(
                { error: "Transaksi tidak ditemukan." },
                { status: 404 }
            );
        }

        // Delete (cascade will handle transaksi_detail and transaksi_pembayaran)
        await prisma.transaksi.delete({ where: { id } });

        return NextResponse.json({ success: true });
    } catch (e) {
        console.error("Delete transaksi error:", e);
        return NextResponse.json(
            { error: "Gagal menghapus transaksi." },
            { status: 500 }
        );
    }
}
