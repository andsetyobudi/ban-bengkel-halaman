"use client"

import { useCallback, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, PackagePlus, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { useOutlet, type ProductItem, type StockPerOutlet } from "@/lib/outlet-context"

type ProductFormState = {
  name: string
  code: string
  brand: string
  category: string
  costPrice: number
  sellPrice: number
  stock: StockPerOutlet
}

function formatRupiah(num: number) {
  return "Rp " + num.toLocaleString("id-ID")
}

export function ProductForm({
  mode,
  productId,
  initial,
}: {
  mode: "create" | "edit"
  productId?: string
  initial?: ProductItem
}) {
  const router = useRouter()
  const { isSuperAdmin, outlets, brands, categories, reloadInitialData } = useOutlet()

  const stockKeys = useMemo(() => outlets.map((o) => o.id), [outlets])

  const [form, setForm] = useState<ProductFormState>(() => {
    const baseStock: StockPerOutlet = Object.fromEntries(stockKeys.map((id) => [id, 0]))
    if (!initial) {
      return {
        name: "",
        code: "",
        brand: "",
        category: "",
        costPrice: 0,
        sellPrice: 0,
        stock: baseStock,
      }
    }
    return {
      name: initial.name,
      code: initial.code,
      brand: initial.brand,
      category: initial.category,
      costPrice: initial.costPrice,
      sellPrice: initial.sellPrice,
      stock: { ...baseStock, ...initial.stock },
    }
  })

  const updateField = useCallback((field: keyof ProductFormState, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }, [])

  const updateStock = useCallback((outletId: string, value: number) => {
    setForm((prev) => ({
      ...prev,
      stock: { ...prev.stock, [outletId]: value },
    }))
  }, [])

  const [saving, setSaving] = useState(false)

  const handleSubmit = async () => {
    if (!isSuperAdmin) return
    const payload = {
      name: form.name,
      code: form.code,
      brand: form.brand,
      category: form.category,
      costPrice: form.costPrice,
      sellPrice: form.sellPrice,
      stock: form.stock,
    }

    if (!payload.name || !payload.code || !payload.brand || !payload.category) {
      toast.error("Nama, kode/ukuran, merek, dan kategori wajib diisi.")
      return
    }

    setSaving(true)
    try {
      const url =
        mode === "edit" && productId ? `/api/admin/produk/${productId}` : "/api/admin/produk"
      const method = mode === "edit" ? "PATCH" : "POST"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        toast.error((data as any)?.error ?? "Gagal menyimpan produk.")
        setSaving(false)
        return
      }

      toast.success(mode === "edit" ? "Produk berhasil diubah." : "Produk berhasil ditambahkan.")
      await reloadInitialData()
      router.push("/adminpanel/produk")
    } catch {
      toast.error("Koneksi gagal.")
    }
    setSaving(false)
  }

  if (!isSuperAdmin) {
    return (
      <div className="py-20 text-center text-muted-foreground">
        Akses terbatas. Halaman ini hanya untuk Super Admin.
      </div>
    )
  }

  const margin = form.sellPrice > 0 && form.costPrice > 0 ? form.sellPrice - form.costPrice : 0

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">
            {mode === "edit" ? "Edit Produk" : "Tambah Produk"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {mode === "edit"
              ? "Ubah informasi produk dan stok per outlet."
              : "Isi detail produk baru dan stok per outlet."}
          </p>
        </div>
        <Button variant="outline" onClick={() => router.push("/adminpanel/produk")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kembali
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <PackagePlus className="h-4 w-4" />
            Detail Produk
          </CardTitle>
          <CardDescription>Nama, kode/ukuran, merek, kategori, harga, dan stok.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="prod-name">Nama Produk</Label>
              <Input
                id="prod-name"
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
                placeholder="Ecopia EP150"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="prod-code">Kode/Ukuran</Label>
              <Input
                id="prod-code"
                value={form.code}
                onChange={(e) => updateField("code", e.target.value)}
                placeholder="185/65R15"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="prod-brand">Merek</Label>
              <Select value={form.brand} onValueChange={(v) => updateField("brand", v)}>
                <SelectTrigger id="prod-brand">
                  <SelectValue placeholder="Pilih merek" />
                </SelectTrigger>
                <SelectContent>
                  {brands.map((b) => (
                    <SelectItem key={b.id} value={b.name}>
                      {b.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="prod-cat">Kategori</Label>
              <Select value={form.category} onValueChange={(v) => updateField("category", v)}>
                <SelectTrigger id="prod-cat">
                  <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.name}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="prod-cost">Harga Modal (Rp)</Label>
              <Input
                id="prod-cost"
                type="number"
                value={form.costPrice || ""}
                onChange={(e) => updateField("costPrice", Number(e.target.value))}
                placeholder="600000"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="prod-sell">Harga Jual (Rp)</Label>
              <Input
                id="prod-sell"
                type="number"
                value={form.sellPrice || ""}
                onChange={(e) => updateField("sellPrice", Number(e.target.value))}
                placeholder="750000"
              />
            </div>
          </div>

          {margin !== 0 && form.costPrice > 0 && (
            <div className="rounded-md bg-muted px-3 py-2">
              <p className="text-xs text-muted-foreground">
                Margin:{" "}
                <span className="font-medium text-foreground">{formatRupiah(margin)}</span>{" "}
                ({((margin / form.costPrice) * 100).toFixed(1)}%)
              </p>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <Label>Stok per Outlet</Label>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {outlets.map((outlet) => (
                <div key={outlet.id} className="flex flex-col gap-1">
                  <Label
                    htmlFor={`stock-${outlet.id}`}
                    className="text-xs text-muted-foreground"
                  >
                    {outlet.name}
                  </Label>
                  <Input
                    id={`stock-${outlet.id}`}
                    type="number"
                    value={form.stock[outlet.id] ?? 0}
                    onChange={(e) => updateStock(outlet.id, Number(e.target.value))}
                    placeholder="0"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => router.push("/adminpanel/produk")}>
              Batal
            </Button>
            <Button onClick={handleSubmit} disabled={saving}>
              <Save className="mr-2 h-4 w-4" />
              {saving ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

