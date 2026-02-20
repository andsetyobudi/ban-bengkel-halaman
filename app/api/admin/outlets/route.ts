
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET: List outlets
export async function GET() {
    try {
        const outlets = await prisma.outlet.findMany({
            orderBy: { id: "asc" },
        });

        // Map to frontend format
        const formatted = outlets.map((o) => ({
            id: String(o.id), // Ensure string for frontend
            name: o.nama_outlet,
            address: o.alamat ?? "",
            phone: "", // Phone not in schema yet? Let's check schema. Checked: schema has no phone for outlet, only for pelanggan/users? Wait, let me check schema again.
            // Schema check: 
            // model outlet {
            //   id Int @id @default(autoincrement())
            //   nama_outlet String
            //   alamat String?
            //   kode_unik String?
            // }
            // Ah, schema does NOT have phone for outlet! 
            // But frontend expects `phone`. I should probably add it to schema or just return empty string for now.
            // Context: "soft delete tidak usah" -> keep it simple.
            // I will return empty string for phone and status "active" (dummy) for now to match frontend type.
            status: "active",
        }));

        return NextResponse.json({ outlets: formatted });
    } catch (e) {
        console.error("List outlets error:", e);
        return NextResponse.json(
            { error: "Gagal memuat outlet." },
            { status: 500 }
        );
    }
}

// POST: Create outlet
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const name = typeof body.name === "string" ? body.name.trim() : "";
        const address = typeof body.address === "string" ? body.address.trim() : "";
        // Phone is ignored for DB but accepted from frontend

        if (!name) {
            return NextResponse.json(
                { error: "Nama outlet wajib diisi." },
                { status: 400 }
            );
        }

        const outlet = await prisma.outlet.create({
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
        console.error("Create outlet error:", e);
        return NextResponse.json(
            { error: "Gagal membuat outlet." },
            { status: 500 }
        );
    }
}
