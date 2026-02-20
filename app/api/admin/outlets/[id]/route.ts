
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// PATCH: Update outlet
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: idStr } = await params;
        const id = parseInt(idStr, 10);
        if (Number.isNaN(id)) {
            return NextResponse.json({ error: "ID tidak valid" }, { status: 400 });
        }

        const body = await request.json();
        const name = typeof body.name === "string" ? body.name.trim() : "";
        const address = typeof body.address === "string" ? body.address.trim() : "";

        if (!name) {
            return NextResponse.json(
                { error: "Nama outlet wajib diisi." },
                { status: 400 }
            );
        }

        const outlet = await prisma.outlet.update({
            where: { id },
            data: {
                nama_outlet: name,
                alamat: address,
            },
        });

        return NextResponse.json({
            success: true,
            outlet: {
                id: String(outlet.id),
                name: outlet.nama_outlet,
                address: outlet.alamat ?? "",
                phone: "",
                status: "active",
            },
        });
    } catch (e) {
        console.error("Update outlet error:", e);
        return NextResponse.json(
            { error: "Gagal mengupdate outlet." },
            { status: 500 }
        );
    }
}

// DELETE: Delete outlet
export async function DELETE(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: idStr } = await params;
        const id = parseInt(idStr, 10);
        if (Number.isNaN(id)) {
            return NextResponse.json({ error: "ID tidak valid" }, { status: 400 });
        }

        // Check constraints manually to give better error messages
        const userCount = await prisma.users.count({ where: { id_outlet: id } });
        if (userCount > 0) {
            return NextResponse.json(
                { error: `Gagal: Outlet ini masih memiliki ${userCount} admin/user.` },
                { status: 400 }
            );
        }

        // Check transactions? (Assuming transaction relation exists)
        // prisma.transaksi.count... let's trust foreign key or check if needed.
        // For now, let's just try delete and catch generic error if constraint fails

        await prisma.outlet.delete({ where: { id } });

        return NextResponse.json({ success: true });
    } catch (e: any) {
        console.error("Delete outlet error:", e);
        // P2003 = Foreign key constraint failed
        if (e.code === 'P2003') {
            return NextResponse.json(
                { error: "Outlet tidak dapat dihapus karena masih memiliki data terkait (transaksi/stok)." },
                { status: 400 }
            );
        }
        return NextResponse.json(
            { error: "Gagal menghapus outlet." },
            { status: 500 }
        );
    }
}
