import { NextRequest, NextResponse } from "next/server"
import { hash } from "bcryptjs"
import { prisma } from "@/lib/db"

/** Dipanggil dari halaman Kelola Outlet (Super Admin) untuk set/reset password user. */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const userId = typeof body.userId === "string" ? body.userId.trim() : ""
    const newPassword = typeof body.newPassword === "string" ? body.newPassword : ""

    if (!userId || !newPassword) {
      return NextResponse.json(
        { error: "UserId dan password baru wajib diisi." },
        { status: 400 }
      )
    }

    if (newPassword.length < 4) {
      return NextResponse.json(
        { error: "Password minimal 4 karakter." },
        { status: 400 }
      )
    }

    const id = parseInt(userId, 10)
    if (Number.isNaN(id)) {
      return NextResponse.json({ error: "User tidak valid." }, { status: 400 })
    }

    const exists = await prisma.users.findUnique({ where: { id } })
    if (!exists) {
      return NextResponse.json({ error: "User tidak ditemukan." }, { status: 404 })
    }

    const hashedPassword = await hash(newPassword, 10)
    await prisma.users.update({
      where: { id },
      data: { password: hashedPassword },
    })

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error("Set password error:", e)
    return NextResponse.json(
      { error: "Gagal menyimpan password." },
      { status: 500 }
    )
  }
}
