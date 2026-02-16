import { NextRequest, NextResponse } from "next/server"
import { compare, hash } from "bcryptjs"
import { prisma } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const userId = typeof body.userId === "string" ? body.userId.trim() : ""
    const currentPassword = typeof body.currentPassword === "string" ? body.currentPassword : ""
    const newPassword = typeof body.newPassword === "string" ? body.newPassword : ""

    if (!userId || !currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "Data tidak lengkap." },
        { status: 400 }
      )
    }

    if (newPassword.length < 4) {
      return NextResponse.json(
        { error: "Password baru minimal 4 karakter." },
        { status: 400 }
      )
    }

    const id = parseInt(userId, 10)
    if (Number.isNaN(id)) {
      return NextResponse.json({ error: "User tidak valid." }, { status: 400 })
    }

    const user = await prisma.users.findUnique({ where: { id } })
    if (!user) {
      return NextResponse.json({ error: "User tidak ditemukan." }, { status: 404 })
    }

    const storedPassword = user.password
    const isBcrypt = storedPassword.startsWith("$2") && storedPassword.length > 50
    let currentValid = false
    if (isBcrypt) {
      currentValid = await compare(currentPassword, storedPassword)
    } else {
      currentValid = currentPassword === storedPassword
    }

    if (!currentValid) {
      return NextResponse.json(
        { error: "Password saat ini salah." },
        { status: 401 }
      )
    }

    const hashedPassword = await hash(newPassword, 10)
    await prisma.users.update({
      where: { id },
      data: { password: hashedPassword },
    })

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error("Change password error:", e)
    return NextResponse.json(
      { error: "Gagal mengubah password." },
      { status: 500 }
    )
  }
}
