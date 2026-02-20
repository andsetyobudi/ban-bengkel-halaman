import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// PATCH: update nama merek
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await params;
    const id = parseInt(idStr, 10);
    if (Number.isNaN(id)) {
      return NextResponse.json(
        { error: "ID merek tidak valid." },
        { status: 400 }
      );
    }

    const body = await request.json();
    const rawName = typeof body.name === "string" ? body.name : "";
    const name = rawName.trim();

    if (!name) {
      return NextResponse.json(
        { error: "Nama merek wajib diisi." },
        { status: 400 }
      );
    }

    await prisma.merek.update({
      where: { id },
      data: { nama_merek: name, updated_at: new Date() },
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Update brand error:", e);
    return NextResponse.json(
      { error: "Gagal mengubah merek." },
      { status: 500 }
    );
  }
}

// DELETE: hapus merek (akan gagal jika masih dipakai produk)
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await params;
    const id = parseInt(idStr, 10);
    if (Number.isNaN(id)) {
      return NextResponse.json(
        { error: "ID merek tidak valid." },
        { status: 400 }
      );
    }

    await prisma.merek.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Delete brand error:", e);
    return NextResponse.json(
      { error: "Gagal menghapus merek. Pastikan tidak ada produk yang masih memakai merek ini." },
      { status: 500 }
    );
  }
}

