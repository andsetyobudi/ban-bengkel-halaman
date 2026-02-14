"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Eye, EyeOff, ArrowLeft, Shield, Store } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { adminUsers, type AdminUser } from "@/lib/outlet-context"

const credentials: Record<string, { password: string; userId: string }> = {
  "admin": { password: "admin123", userId: "USR-001" },
  "admin.bantul": { password: "admin123", userId: "USR-002" },
  "admin.wiyoro": { password: "admin123", userId: "USR-003" },
}

export default function AdminLoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    const cred = credentials[username]
    if (cred && cred.password === password) {
      const user = adminUsers.find((u) => u.id === cred.userId)
      if (user) {
        localStorage.setItem("carproban_admin", "true")
        localStorage.setItem("carproban_user", JSON.stringify(user))
        if (user.role === "outlet_admin" && user.outletId) {
          localStorage.setItem("carproban_selected_outlet", user.outletId)
        } else {
          localStorage.setItem("carproban_selected_outlet", "all")
        }
        router.push("/admin")
      } else {
        setError("User tidak ditemukan.")
      }
    } else {
      setError("Username atau password salah.")
    }
    setLoading(false)
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-primary px-4">
      <div className="absolute left-6 top-6">
        <Button variant="ghost" size="sm" className="text-primary-foreground hover:bg-primary-foreground/10" asChild>
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali
          </Link>
        </Button>
      </div>

      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent">
          <span className="text-xl font-bold text-accent-foreground">C</span>
        </div>
        <span className="font-heading text-2xl font-bold text-primary-foreground">CarProBan</span>
      </div>

      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="font-heading text-xl">Login Admin</CardTitle>
          <CardDescription>Masuk ke dashboard admin</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Masukkan password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Memproses..." : "Masuk"}
            </Button>

            {/* Credential hints */}
            <div className="flex flex-col gap-2 rounded-lg bg-muted p-3">
              <p className="text-xs font-medium text-foreground">Akun Demo:</p>
              <div className="flex items-start gap-2">
                <Shield className="mt-0.5 h-3 w-3 shrink-0 text-primary" />
                <div>
                  <p className="text-xs font-medium text-foreground">Super Admin</p>
                  <p className="text-xs text-muted-foreground">admin / admin123</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Store className="mt-0.5 h-3 w-3 shrink-0 text-accent-foreground" />
                <div>
                  <p className="text-xs font-medium text-foreground">Admin Outlet</p>
                  <p className="text-xs text-muted-foreground">admin.bantul / admin123</p>
                  <p className="text-xs text-muted-foreground">admin.wiyoro / admin123</p>
                </div>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
