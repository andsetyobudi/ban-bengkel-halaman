import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET: daftar pelanggan (opsional)
export async function GET() {
  try {
    const rows = await prisma.pelanggan.findMany({
      include: { outlet: true },
      orderBy: { id: "asc" },
    });

    const customers = rows.map((c) => ({
      id: String(c.id),
      name: c.nama_pelanggan,
      phone: c.nomer_hp ?? "",
      outletId: String(c.id_outlet),
      outletName: c.outlet?.nama_outlet ?? "",
    }));

    return NextResponse.json({ customers });
  } catch (e) {
    console.error("List customers error:", e);
    return NextResponse.json(
      { error: "Gagal memuat pelanggan." },
      { status: 500 }
    );
  }
}

// POST: buat pelanggan baru
export async function POST(request: NextRequest) {
  try {
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

    const pelanggan = await prisma.pelanggan.create({
      data: {
        nama_pelanggan: name,
        nomer_hp: phone,
        id_outlet: outletIdNum,
      },
    });

    return NextResponse.json(
      {
        success: true,
        customer: {
          id: String(pelanggan.id),
          name: pelanggan.nama_pelanggan,
          phone: pelanggan.nomer_hp ?? "",
          outletId: String(pelanggan.id_outlet),
        },
      },
      { status: 201 }
    );
  } catch (e) {
    console.error("Create customer error:", e);
    return NextResponse.json(
      { error: "Gagal membuat pelanggan." },
      { status: 500 }
    );
  }
}

