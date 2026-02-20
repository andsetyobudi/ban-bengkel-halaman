import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

/** PATCH: Update status transfer */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await params
    const id = parseInt(idStr, 10)
    if (Number.isNaN(id)) {
      return NextResponse.json({ error: "ID transfer tidak valid." }, { status: 400 })
    }

    const body = await request.json()
    const newStatus = typeof body.status === "string" ? body.status : ""
    const userId = typeof body.userId === "string" ? body.userId.trim() : ""

    const statusMap: Record<string, "diajukan" | "dikirim" | "diterima" | "ditolak"> = {
      pending: "diajukan",
      diterima: "dikirim",
      selesai: "diterima",
      dibatalkan: "ditolak",
    }

    const dbStatus = statusMap[newStatus]
    if (!dbStatus) {
      return NextResponse.json({ error: "Status tidak valid." }, { status: 400 })
    }

    const transfer = await prisma.transfer_stok.findUnique({
      where: { id },
      include: { transfer_stok_detail: { include: { produk: true } } },
    })

    if (!transfer) {
      return NextResponse.json({ error: "Transfer tidak ditemukan." }, { status: 404 })
    }

    // Guard: aturan batalkan
    // - hanya boleh jika masih "diajukan" (menunggu)
    // - hanya boleh oleh user pengirim (outlet asal)
    if (dbStatus === "ditolak") {
      if (transfer.status !== "diajukan") {
        return NextResponse.json({ error: "Transfer tidak bisa dibatalkan karena status sudah berubah." }, { status: 400 })
      }
      const uid = parseInt(userId, 10)
      if (Number.isNaN(uid)) {
        return NextResponse.json({ error: "User tidak valid." }, { status: 400 })
      }
      const user = await prisma.users.findUnique({ where: { id: uid } })
      if (!user || user.id_outlet == null || user.id_outlet !== transfer.id_outlet_asal) {
        return NextResponse.json({ error: "Anda tidak berhak membatalkan transfer ini." }, { status: 403 })
      }
    }

    const updateData: {
      status: typeof dbStatus
      tanggal_terima?: Date
      id_user_penerima?: number
    } = { status: dbStatus }

    if (dbStatus === "dikirim" && !transfer.tanggal_terima) {
      updateData.tanggal_terima = new Date()
      if (userId) {
        const id_user_penerima = parseInt(userId, 10)
        if (!Number.isNaN(id_user_penerima)) {
          updateData.id_user_penerima = id_user_penerima
        }
      }
    }

    await prisma.transfer_stok.update({
      where: { id },
      data: updateData,
    })

    if (dbStatus === "diterima") {
      for (const detail of transfer.transfer_stok_detail) {
        const stokAsal = await prisma.produk_stok_harga.findUnique({
          where: {
            id_outlet_id_produk: {
              id_outlet: transfer.id_outlet_asal,
              id_produk: detail.id_produk,
            },
          },
        })

        if (stokAsal && stokAsal.stok >= detail.jumlah) {
          await prisma.produk_stok_harga.update({
            where: {
              id_outlet_id_produk: {
                id_outlet: transfer.id_outlet_asal,
                id_produk: detail.id_produk,
              },
            },
            data: { stok: stokAsal.stok - detail.jumlah },
          })

          const stokTujuan = await prisma.produk_stok_harga.findUnique({
            where: {
              id_outlet_id_produk: {
                id_outlet: transfer.id_outlet_tujuan,
                id_produk: detail.id_produk,
              },
            },
          })

          if (stokTujuan) {
            await prisma.produk_stok_harga.update({
              where: {
                id_outlet_id_produk: {
                  id_outlet: transfer.id_outlet_tujuan,
                  id_produk: detail.id_produk,
                },
              },
              data: { stok: stokTujuan.stok + detail.jumlah },
            })
          } else {
            await prisma.produk_stok_harga.create({
              data: {
                id_outlet: transfer.id_outlet_tujuan,
                id_produk: detail.id_produk,
                harga_modal: stokAsal.harga_modal,
                harga_jual: stokAsal.harga_jual,
                stok: detail.jumlah,
              },
            })
          }
        }
      }
    }

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error("Update transfer error:", e)
    return NextResponse.json(
      { error: "Gagal mengubah status transfer." },
      { status: 500 }
    )
  }
}
