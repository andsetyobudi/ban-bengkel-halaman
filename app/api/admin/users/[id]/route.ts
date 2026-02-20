
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// PATCH: Update user
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
        const username = typeof body.email === "string" ? body.email.trim() : "";
        const roleFrontend = typeof body.role === "string" ? body.role : "";
        const outletIdStr = typeof body.outletId === "string" ? body.outletId : "";

        if (!name || !username) {
            return NextResponse.json(
                { error: "Nama dan username wajib diisi." },
                { status: 400 }
            );
        }

        // Check unique username if validation needed (skip for now to keep simple, assuming not changing username to existing one)

        const dataToUpdate: any = {
            name,
            username,
        };

        if (roleFrontend) {
            dataToUpdate.role = roleFrontend === "super_admin" ? "admin" : "outlet";
        }

        // Handle outletId logic
        // If role is super_admin (admin), outletId usually null? Or can be assigned?
        // If outlet_admin (outlet), outletId is mandatory?
        // Let's just follow what frontend sends.
        if (outletIdStr) {
            dataToUpdate.id_outlet = parseInt(outletIdStr, 10);
        } else {
            // If empty string passed, maybe set to null?
            // Frontend sends "" if undefined.
            if (body.outletId === "") dataToUpdate.id_outlet = null;
        }

        const user = await prisma.users.update({
            where: { id },
            data: dataToUpdate,
        });

        return NextResponse.json({
            success: true,
            user: {
                id: String(user.id),
                name: user.name,
                email: user.username,
                role: user.role === "admin" ? "super_admin" : "outlet_admin",
                outletId: user.id_outlet ? String(user.id_outlet) : undefined,
            },
        });
    } catch (e) {
        console.error("Update user error:", e);
        return NextResponse.json(
            { error: "Gagal mengupdate pengguna." },
            { status: 500 }
        );
    }
}

// DELETE: Delete user
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

        await prisma.users.delete({ where: { id } });

        return NextResponse.json({ success: true });
    } catch (e: any) {
        console.error("Delete user error:", e);
        if (e.code === 'P2003') {
            return NextResponse.json(
                { error: "User tidak dapat dihapus karena memiliki riwayat transaksi/transfer." },
                { status: 400 }
            );
        }
        return NextResponse.json(
            { error: "Gagal menghapus pengguna." },
            { status: 500 }
        );
    }
}
