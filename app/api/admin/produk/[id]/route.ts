import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

/** PATCH: Update produk + stok per outlet */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await params
    const id = parseInt(idStr, 10)
    if (Number.isNaN(id)) {
      return NextResponse.json({ error: "ID produk tidak valid." }, { status: 400 })
    }

    const body = await request.json()
    const name = typeof body.name === "string" ? body.name.trim() : ""
    const code = typeof body.code === "string" ? body.code.trim() : ""
    const brandName = typeof body.brand === "string" ? body.brand.trim() : ""
    const categoryName = typeof body.category === "string" ? body.category.trim() : ""
    const costPrice = Number(body.costPrice) || 0
    const sellPrice = Number(body.sellPrice) || 0
    const stockPerOutlet = body.stock && typeof body.stock === "object" ? body.stock as Record<string, number> : {}

    const existing = await prisma.produk.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: "Produk tidak ditemukan." }, { status: 404 })
    }

    if (!name || !brandName || !categoryName) {
      return NextResponse.json(
        { error: "Nama produk, merek, dan kategori wajib diisi." },
        { status: 400 }
      )
    }

    const kategori = await prisma.kategori.findFirst({ where: { nama_kategori: categoryName } })
    const merek = await prisma.merek.findFirst({ where: { nama_merek: brandName } })
    if (!kategori) {
      return NextResponse.json({ error: `Kategori "${categoryName}" tidak ditemukan.` }, { status: 400 })
    }
    if (!merek) {
      return NextResponse.json({ error: `Merek "${brandName}" tidak ditemukan.` }, { status: 400 })
    }

    await prisma.produk.update({
      where: { id },
      data: {
        nama_produk: name,
        ukuran: code || null,
        id_kategori: kategori.id,
        id_merek: merek.id,
      },
    })

    const outletIds = Object.keys(stockPerOutlet).filter((k) => /^\d+$/.test(k))
    for (const outletIdStr of outletIds) {
      const id_outlet = parseInt(outletIdStr, 10)
      const stok = Math.max(0, Math.floor(Number(stockPerOutlet[outletIdStr]) || 0))
      await prisma.produk_stok_harga.upsert({
        where: {
          id_outlet_id_produk: { id_outlet, id_produk: id },
        },
        create: {
          id_outlet,
          id_produk: id,
          harga_modal: costPrice,
          harga_jual: sellPrice,
          stok,
        },
        update: {
          harga_modal: costPrice,
          harga_jual: sellPrice,
          stok,
        },
      })
    }

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error("Update product error:", e)
    return NextResponse.json(
      { error: "Gagal mengubah produk." },
      { status: 500 }
    )
  }
}

/** DELETE: Hapus produk (cascade ke produk_stok_harga) */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await params
    const id = parseInt(idStr, 10)
    if (Number.isNaN(id)) {
      return NextResponse.json({ error: "ID produk tidak valid." }, { status: 400 })
    }
    await prisma.produk.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (e) {
    console.error("Delete product error:", e)
    return NextResponse.json(
      { error: "Gagal menghapus produk." },
      { status: 500 }
    )
  }
}
