import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// PATCH: update data pelanggan
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await params;
    const id = parseInt(idStr, 10);
    if (Number.isNaN(id)) {
      return NextResponse.json(
        { error: "ID pelanggan tidak valid." },
        { status: 400 }
      );
    }

    const body = await request.json();
    const rawName = typeof body.name === "string" ? body.name : "";
    const rawPhone = typeof body.phone === "string" ? body.phone : "";
    const rawOutletId = typeof body.outletId === "string" ? body.outletId : "";

    const name = rawName.trim();
    const phone = rawPhone.trim();
    const outletIdNum = parseInt(rawOutletId, 10);

    if (!name || !phone || !rawOutletId) {
      return NextResponse.json(
        { error: "Nama, nomor HP, dan outlet wajib diisi." },
        { status: 400 }
      );
    }

    if (Number.isNaN(outletIdNum)) {
      return NextResponse.json(
        { error: "ID outlet tidak valid." },
        { status: 400 }
      );
    }

    const outlet = await prisma.outlet.findUnique({ where: { id: outletIdNum } });
    if (!outlet) {
      return NextResponse.json(
        { error: "Outlet tidak ditemukan." },
        { status: 404 }
      );
    }

    await prisma.pelanggan.update({
      where: { id },
      data: {
        nama_pelanggan: name,
        nomer_hp: phone,
        id_outlet: outletIdNum,
      },
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Update customer error:", e);
    return NextResponse.json(
      { error: "Gagal mengubah pelanggan." },
      { status: 500 }
    );
  }
}

// DELETE: hapus pelanggan
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await params;
    const id = parseInt(idStr, 10);
    if (Number.isNaN(id)) {
      return NextResponse.json(
        { error: "ID pelanggan tidak valid." },
        { status: 400 }
      );
    }

    await prisma.pelanggan.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Delete customer error:", e);
    return NextResponse.json(
      { error: "Gagal menghapus pelanggan." },
      { status: 500 }
    );
  }
}

