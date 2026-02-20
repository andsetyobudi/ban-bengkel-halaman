
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hash } from "bcryptjs";

// GET: List users
export async function GET() {
    try {
        const users = await prisma.users.findMany({
            orderBy: { id: "asc" },
        });

        const formatted = users.map((u) => ({
            id: String(u.id),
            name: u.name,
            email: u.username,
            role: u.role === "admin" ? "super_admin" : "outlet_admin",
            outletId: u.id_outlet ? String(u.id_outlet) : undefined,
        }));

        return NextResponse.json({ users: formatted });
    } catch (e) {
        console.error("List users error:", e);
        return NextResponse.json(
            { error: "Gagal memuat pengguna." },
            { status: 500 }
        );
    }
}

// POST: Create user
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const name = typeof body.name === "string" ? body.name.trim() : "";
        const username = typeof body.email === "string" ? body.email.trim() : ""; // Frontend sends 'email' as username
        const roleFrontend = typeof body.role === "string" ? body.role : "outlet_admin";
        const outletIdStr = typeof body.outletId === "string" ? body.outletId : "";

        if (!name || !username) {
            return NextResponse.json(
                { error: "Nama dan username wajib diisi." },
                { status: 400 }
            );
        }

        // Check duplicate
        const existing = await prisma.users.findUnique({ where: { username } });
        if (existing) {
            return NextResponse.json(
                { error: "Username sudah digunakan." },
                { status: 409 }
            );
        }

        // Default password for new users? Or provided? 
        // Usually admin sets a default password. Let's say "123456" for now or check if provided.
        // In `outlet-context.tsx` `addAdmin` doesn't seem to pass password.
        // I'll set default to "1234" as per common dev practice, or maybe handle password set separately.
        // The `handleSaveAdmin` in frontend doesn't prompt for password.
        // I will set a default password.
        const hashedPassword = await hash("1234", 10);

        const roleDB = roleFrontend === "super_admin" ? "admin" : "outlet";
        const outletId = outletIdStr ? parseInt(outletIdStr, 10) : null;

        const user = await prisma.users.create({
            data: {
                name,
                username,
                password: hashedPassword,
                role: roleDB,
                id_outlet: outletId,
            },
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
        console.error("Create user error:", e);
        return NextResponse.json(
            { error: "Gagal membuat pengguna." },
            { status: 500 }
        );
    }
}
