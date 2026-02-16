import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

/** POST: Buat transfer barang baru */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const fromOutletId = typeof body.fromOutletId === "string" ? body.fromOutletId.trim() : ""
    const toOutletId = typeof body.toOutletId === "string" ? body.toOutletId.trim() : ""
    const date = typeof body.date === "string" ? body.date : ""
    const note = typeof body.note === "string" ? body.note.trim() : null
    const items = Array.isArray(body.items) ? body.items : []
    const userId = typeof body.userId === "string" ? body.userId.trim() : ""

    if (!fromOutletId || !toOutletId || !date || items.length === 0 || !userId) {
      return NextResponse.json(
        { error: "Data transfer tidak lengkap." },
        { status: 400 }
      )
    }

    const id_outlet_asal = parseInt(fromOutletId, 10)
    const id_outlet_tujuan = parseInt(toOutletId, 10)
    const id_user_pengirim = parseInt(userId, 10)

    if (Number.isNaN(id_outlet_asal) || Number.isNaN(id_outlet_tujuan) || Number.isNaN(id_user_pengirim)) {
      return NextResponse.json({ error: "ID tidak valid." }, { status: 400 })
    }

    if (id_outlet_asal === id_outlet_tujuan) {
      return NextResponse.json({ error: "Outlet asal dan tujuan tidak boleh sama." }, { status: 400 })
    }

    const tanggal_kirim = new Date(date + "T00:00:00")
    if (isNaN(tanggal_kirim.getTime())) {
      return NextResponse.json({ error: "Tanggal tidak valid." }, { status: 400 })
    }

    const year = new Date().getFullYear()
    const count = await prisma.transfer_stok.count({
      where: {
        nomor_transfer: { startsWith: `TRF-${year}-` },
      },
    })
    const nomor_transfer = `TRF-${year}-${String(count + 1).padStart(4, "0")}`

    const transfer = await prisma.transfer_stok.create({
      data: {
        nomor_transfer,
        id_outlet_asal,
        id_outlet_tujuan,
        tanggal_kirim,
        status: "diajukan",
        catatan: note,
        id_user_pengirim,
      },
    })

    for (const item of items) {
      const id_produk = parseInt(item.productId, 10)
      const jumlah = Math.max(1, Math.floor(Number(item.qty) || 0))
      if (!Number.isNaN(id_produk) && jumlah > 0) {
        await prisma.transfer_stok_detail.create({
          data: {
            id_transfer: transfer.id,
            id_produk,
            jumlah,
          },
        })
      }
    }

    return NextResponse.json({
      success: true,
      transfer: {
        id: String(transfer.id),
        nomor_transfer: transfer.nomor_transfer,
        fromOutletId: fromOutletId,
        toOutletId: toOutletId,
        date,
        note: note || "",
        status: "pending",
        createdAt: transfer.created_at.toISOString(),
      },
    })
  } catch (e) {
    console.error("Create transfer error:", e)
    return NextResponse.json(
      { error: "Gagal membuat transfer." },
      { status: 500 }
    )
  }
}
