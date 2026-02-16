import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

/** POST: Tambah produk baru + stok per outlet */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const name = typeof body.name === "string" ? body.name.trim() : ""
    const code = typeof body.code === "string" ? body.code.trim() : ""
    const brandName = typeof body.brand === "string" ? body.brand.trim() : ""
    const categoryName = typeof body.category === "string" ? body.category.trim() : ""
    const costPrice = Number(body.costPrice) || 0
    const sellPrice = Number(body.sellPrice) || 0
    const stockPerOutlet = body.stock && typeof body.stock === "object" ? body.stock as Record<string, number> : {}

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

    const produk = await prisma.produk.create({
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
      await prisma.produk_stok_harga.create({
        data: {
          id_outlet,
          id_produk: produk.id,
          harga_modal: costPrice,
          harga_jual: sellPrice,
          stok,
        },
      })
    }

    return NextResponse.json({
      success: true,
      product: {
        id: String(produk.id),
        name: produk.nama_produk,
        code: produk.ukuran ?? "",
        brand: brandName,
        category: categoryName,
        costPrice,
        sellPrice,
        stock: stockPerOutlet,
      },
    })
  } catch (e) {
    console.error("Create product error:", e)
    return NextResponse.json(
      { error: "Gagal menyimpan produk." },
      { status: 500 }
    )
  }
}
