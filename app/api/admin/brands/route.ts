import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET: daftar merek (opsional)
export async function GET() {
  try {
    const rows = await prisma.merek.findMany({ orderBy: { id: "asc" } });
    const brands = rows.map((b) => ({
      id: String(b.id),
      name: b.nama_merek,
    }));
    return NextResponse.json({ brands });
  } catch (e) {
    console.error("List brands error:", e);
    return NextResponse.json(
      { error: "Gagal memuat merek." },
      { status: 500 }
    );
  }
}

// POST: buat merek baru
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const rawName = typeof body.name === "string" ? body.name : "";
    const name = rawName.trim();

    if (!name) {
      return NextResponse.json(
        { error: "Nama merek wajib diisi." },
        { status: 400 }
      );
    }

    const existing = await prisma.merek.findFirst({
      where: { nama_merek: name },
    });
    if (existing) {
      return NextResponse.json(
        { error: "Merek dengan nama tersebut sudah ada." },
        { status: 409 }
      );
    }

    const now = new Date();
    const merek = await prisma.merek.create({
      data: {
        nama_merek: name,
        created_at: now,
        updated_at: now,
      },
    });

    return NextResponse.json(
      {
        success: true,
        brand: {
          id: String(merek.id),
          name: merek.nama_merek,
        },
      },
      { status: 201 }
    );
  } catch (e) {
    console.error("Create brand error:", e);
    return NextResponse.json(
      { error: "Gagal membuat merek." },
      { status: 500 }
    );
  }
}

