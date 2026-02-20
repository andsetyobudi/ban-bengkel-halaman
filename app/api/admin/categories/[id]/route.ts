import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// PATCH: update nama kategori
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await params;
    const id = parseInt(idStr, 10);
    if (Number.isNaN(id)) {
      return NextResponse.json(
        { error: "ID kategori tidak valid." },
        { status: 400 }
      );
    }

    const body = await request.json();
    const rawName = typeof body.name === "string" ? body.name : "";
    const name = rawName.trim();

    if (!name) {
      return NextResponse.json(
        { error: "Nama kategori wajib diisi." },
        { status: 400 }
      );
    }

    await prisma.kategori.update({
      where: { id },
      data: { nama_kategori: name },
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Update category error:", e);
    return NextResponse.json(
      { error: "Gagal mengubah kategori." },
      { status: 500 }
    );
  }
}

// DELETE: hapus kategori (akan gagal jika masih terpakai di produk)
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await params;
    const id = parseInt(idStr, 10);
    if (Number.isNaN(id)) {
      return NextResponse.json(
        { error: "ID kategori tidak valid." },
        { status: 400 }
      );
    }

    await prisma.kategori.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Delete category error:", e);
    return NextResponse.json(
      { error: "Gagal menghapus kategori. Pastikan tidak ada produk yang masih memakai kategori ini." },
      { status: 500 }
    );
  }
}

