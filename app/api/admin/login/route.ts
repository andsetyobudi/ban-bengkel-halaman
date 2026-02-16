import { NextRequest, NextResponse } from "next/server"
import { compare } from "bcryptjs"
import { prisma } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const username = typeof body.username === "string" ? body.username.trim() : ""
    const password = typeof body.password === "string" ? body.password : ""

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username dan password wajib diisi." },
        { status: 400 }
      )
    }

    const user = await prisma.users.findUnique({
      where: { username },
      include: { outlet: true },
    })

    if (!user) {
      return NextResponse.json(
        { error: "Username atau password salah." },
        { status: 401 }
      )
    }

    const storedPassword = user.password
    const isBcrypt = storedPassword.startsWith("$2") && storedPassword.length > 50
    let passwordValid = false

    if (isBcrypt) {
      passwordValid = await compare(password, storedPassword)
    } else {
      passwordValid = password === storedPassword
    }

    if (!passwordValid) {
      return NextResponse.json(
        { error: "Username atau password salah." },
        { status: 401 }
      )
    }

    const role = user.role === "admin" ? "super_admin" : "outlet_admin"
    return NextResponse.json({
      user: {
        id: String(user.id),
        name: user.name,
        email: user.username,
        role,
        outletId: user.id_outlet != null ? String(user.id_outlet) : undefined,
      },
    })
  } catch (e) {
    console.error("Login error:", e)
    return NextResponse.json(
      { error: "Terjadi kesalahan. Coba lagi." },
      { status: 500 }
    )
  }
}
