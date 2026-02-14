"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Eye, EyeOff, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function AdminLoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    // Temporary hardcoded credentials
    if (email === "admin@carproban.com" && password === "admin123") {
      localStorage.setItem("carproban_admin", "true")
      router.push("/admin")
    } else {
      setError("Email atau password salah. Gunakan: admin@carproban.com / admin123")
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
          <CardDescription>Masuk ke dashboard admin CarProBan</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@carproban.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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

            <div className="rounded-md bg-muted px-3 py-2">
              <p className="text-center text-xs text-muted-foreground">
                Akses sementara: <span className="font-medium text-foreground">admin@carproban.com</span> / <span className="font-medium text-foreground">admin123</span>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
