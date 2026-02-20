import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET: daftar kategori (opsional, untuk keperluan lain)
export async function GET() {
  try {
    const rows = await prisma.kategori.findMany({ orderBy: { id: "asc" } });
    const categories = rows.map((c) => ({
      id: String(c.id),
      name: c.nama_kategori,
    }));
    return NextResponse.json({ categories });
  } catch (e) {
    console.error("List categories error:", e);
    return NextResponse.json(
      { error: "Gagal memuat kategori." },
      { status: 500 }
    );
  }
}

// POST: buat kategori baru
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const rawName = typeof body.name === "string" ? body.name : "";
    const name = rawName.trim();

    if (!name) {
      return NextResponse.json(
        { error: "Nama kategori wajib diisi." },
        { status: 400 }
      );
    }

    // Cek duplikasi nama (opsional)
    const existing = await prisma.kategori.findFirst({
      where: { nama_kategori: name },
    });
    if (existing) {
      return NextResponse.json(
        {
          error: "Kategori dengan nama tersebut sudah ada.",
        },
        { status: 409 }
      );
    }

    const kategori = await prisma.kategori.create({
      data: { nama_kategori: name },
    });

    return NextResponse.json(
      {
        success: true,
        category: {
          id: String(kategori.id),
          name: kategori.nama_kategori,
        },
      },
      { status: 201 }
    );
  } catch (e) {
    console.error("Create category error:", e);
    return NextResponse.json(
      { error: "Gagal membuat kategori." },
      { status: 500 }
    );
  }
}

