"use client"

import { useState, useCallback } from "react"
import { Plus, Search, Pencil, Trash2, Filter, Store } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useOutlet, type ProductItem, type StockPerOutlet } from "@/lib/outlet-context"
import { toast } from "sonner"



type ProductForm = {
  name: string
  code: string
  brand: string
  category: string
  costPrice: number
  sellPrice: number
  stock: StockPerOutlet
}

const emptyForm: ProductForm = {
  name: "",
  code: "",
  brand: "",
  category: "",
  costPrice: 0,
  sellPrice: 0,
  stock: {} as StockPerOutlet,
}

function getEmptyProduct(outlets: { id: string }[]): ProductItem {
  return {
    id: "",
    name: emptyForm.name,
    code: emptyForm.code,
    brand: emptyForm.brand,
    category: emptyForm.category,
    costPrice: emptyForm.costPrice,
    sellPrice: emptyForm.sellPrice,
    stock: Object.fromEntries(outlets.map((o) => [o.id, 0])),
  }
}

function formatRupiah(num: number) {
  return "Rp " + num.toLocaleString("id-ID")
}

function getTotalStock(stock: StockPerOutlet, outletId: string): number {
  if (outletId === "all") {
    return Object.values(stock).reduce((s, v) => s + v, 0)
  }
  return stock[outletId] ?? 0
}

export default function ProdukPage() {
  const { selectedOutletId, isSuperAdmin, availableOutlets, outlets, products, setProducts, brands: brandItems, categories: categoryItems } = useOutlet()

  const brandNames = ["Semua", ...brandItems.map((b) => b.name)]
  const categoryNames = ["Semua", ...categoryItems.map((c) => c.name)]
  const [search, setSearch] = useState("")
  const [filterBrand, setFilterBrand] = useState("Semua")
  const [filterCategory, setFilterCategory] = useState("Semua")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null)
  const [deletingProduct, setDeletingProduct] = useState<ProductItem | null>(null)
  const [form, setForm] = useState<ProductForm>(emptyForm)

  const updateFormField = useCallback((field: keyof ProductForm, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }, [])

  const updateStock = useCallback((outletId: string, value: number) => {
    setForm((prev) => ({
      ...prev,
      stock: { ...prev.stock, [outletId]: value },
    }))
  }, [])

  const filtered = products.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.code.toLowerCase().includes(search.toLowerCase()) ||
      p.brand.toLowerCase().includes(search.toLowerCase())
    const matchBrand = filterBrand === "Semua" || p.brand === filterBrand
    const matchCategory = filterCategory === "Semua" || p.category === filterCategory
    return matchSearch && matchBrand && matchCategory
  })

  const openAdd = () => {
    setEditingProduct(null)
    setForm({
      ...emptyForm,
      stock: Object.fromEntries(outlets.map((o) => [o.id, 0])),
    })
    setDialogOpen(true)
  }

  const openEdit = (product: ProductItem) => {
    setEditingProduct(product)
    setForm({
      name: product.name,
      code: product.code,
      brand: product.brand,
      category: product.category,
      costPrice: product.costPrice,
      sellPrice: product.sellPrice,
      stock: { ...product.stock },
    })
    setDialogOpen(true)
  }

  const openDelete = (product: ProductItem) => {
    setDeletingProduct(product)
    setDeleteDialogOpen(true)
  }

  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!form.name || !form.brand || !form.category || !form.code) return
    setSaving(true)
    try {
      if (editingProduct) {
        const res = await fetch(`/api/admin/produk/${editingProduct.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.name,
            code: form.code,
            brand: form.brand,
            category: form.category,
            costPrice: form.costPrice,
            sellPrice: form.sellPrice,
            stock: form.stock,
          }),
        })
        const data = await res.json()
        if (!res.ok) {
          toast.error(data.error ?? "Gagal menyimpan perubahan.")
          setSaving(false)
          return
        }
        setProducts((prev) =>
          prev.map((p) =>
            p.id === editingProduct.id
              ? { ...p, name: form.name, code: form.code, brand: form.brand, category: form.category, costPrice: form.costPrice, sellPrice: form.sellPrice, stock: { ...form.stock } }
              : p
          )
        )
        toast.success("Produk berhasil diubah.")
      } else {
        const res = await fetch("/api/admin/produk", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.name,
            code: form.code,
            brand: form.brand,
            category: form.category,
            costPrice: form.costPrice,
            sellPrice: form.sellPrice,
            stock: form.stock,
          }),
        })
        const data = await res.json()
        if (!res.ok) {
          toast.error(data.error ?? "Gagal menambah produk.")
          setSaving(false)
          return
        }
        if (data.product) {
          setProducts((prev) => [...prev, data.product])
          toast.success("Produk berhasil ditambahkan.")
        }
      }
      setDialogOpen(false)
    } catch {
      toast.error("Koneksi gagal.")
    }
    setSaving(false)
  }

  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    if (!deletingProduct) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/admin/produk/${deletingProduct.id}`, { method: "DELETE" })
      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error ?? "Gagal menghapus produk.")
        setDeleting(false)
        return
      }
      setProducts((prev) => prev.filter((p) => p.id !== deletingProduct.id))
      toast.success("Produk berhasil dihapus.")
      setDeleteDialogOpen(false)
      setDeletingProduct(null)
    } catch {
      toast.error("Koneksi gagal.")
    }
    setDeleting(false)
  }

  const totalProducts = filtered.length
  const totalStock = filtered.reduce((sum, p) => sum + getTotalStock(p.stock, selectedOutletId), 0)
  const uniqueBrands = new Set(filtered.map((p) => p.brand)).size
  const uniqueCategories = new Set(filtered.map((p) => p.category)).size

  const outletLabel = selectedOutletId === "all"
    ? "Semua Outlet"
    : outlets.find((o) => o.id === selectedOutletId)?.name || ""

  const isAllView = selectedOutletId === "all"

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">Manajemen Produk</h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Store className="h-3.5 w-3.5" />
            <span>{outletLabel}</span>
          </div>
        </div>
        {isSuperAdmin && (
          <Button onClick={openAdd}>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Produk
          </Button>
        )}
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total Produk</p>
            <p className="font-heading text-2xl font-bold text-foreground">{totalProducts}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total Stok</p>
            <p className="font-heading text-2xl font-bold text-foreground">{totalStock}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Merek</p>
            <p className="font-heading text-2xl font-bold text-foreground">{uniqueBrands}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Kategori</p>
            <p className="font-heading text-2xl font-bold text-foreground">{uniqueCategories}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Filter className="h-4 w-4" />
            Filter & Pencarian
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Cari nama, kode/ukuran, atau merek..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={filterBrand} onValueChange={setFilterBrand}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Merek" />
              </SelectTrigger>
              <SelectContent>
                {brandNames.map((b) => (
                  <SelectItem key={b} value={b}>{b}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Kategori" />
              </SelectTrigger>
              <SelectContent>
                {categoryNames.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-14 text-center">No</TableHead>
                  <TableHead>Nama Produk</TableHead>
                  <TableHead>Kode/Ukuran</TableHead>
                  <TableHead>Merek</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead className="text-right">Harga Modal</TableHead>
                  <TableHead className="text-right">Harga Jual</TableHead>
                  {outlets.map((o) => (
                    <TableHead key={o.id} className="text-center">
                      <span className="text-xs">{o.name}</span>
                    </TableHead>
                  ))}
                  {isSuperAdmin && (
                    <TableHead className="w-24 text-center">Aksi</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7 + outlets.length + (isSuperAdmin ? 1 : 0)} className="py-12 text-center text-muted-foreground">
                      Tidak ada produk ditemukan.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((product, index) => (
                    <TableRow key={product.id}>
                      <TableCell className="text-center text-sm text-muted-foreground">{index + 1}</TableCell>
                      <TableCell className="font-medium text-foreground">{product.name}</TableCell>
                      <TableCell className="font-mono text-sm text-muted-foreground">{product.code}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{product.brand}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{product.category}</TableCell>
                      <TableCell className="text-right text-sm text-muted-foreground">{formatRupiah(product.costPrice)}</TableCell>
                      <TableCell className="text-right font-medium text-foreground">{formatRupiah(product.sellPrice)}</TableCell>
                      {outlets.map((o) => {
                        const stk = product.stock[o.id] ?? 0
                        return (
                          <TableCell key={o.id} className="text-center">
                            <Badge
                              variant={stk <= 5 ? "destructive" : "default"}
                              className={stk > 5 ? "bg-[hsl(142,70%,40%)] text-[hsl(0,0%,100%)] hover:bg-[hsl(142,70%,35%)]" : ""}
                            >
                              {stk}
                            </Badge>
                          </TableCell>
                        )
                      })}
                      {isSuperAdmin && (
                        <TableCell>
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => openEdit(product)}
                              className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                              aria-label={`Edit ${product.name}`}
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => openDelete(product)}
                              className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                              aria-label={`Hapus ${product.name}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-heading">{editingProduct ? "Edit Produk" : "Tambah Produk Baru"}</DialogTitle>
            <DialogDescription>
              {editingProduct ? "Ubah informasi produk di bawah ini." : "Isi detail produk baru di bawah ini."}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="prod-name">Nama Produk</Label>
                <Input id="prod-name" value={form.name} onChange={(e) => updateFormField("name", e.target.value)} placeholder="Ecopia EP150" />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="prod-code">Kode/Ukuran</Label>
                <Input id="prod-code" value={form.code} onChange={(e) => updateFormField("code", e.target.value)} placeholder="185/65R15" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="prod-brand">Merek</Label>
                <Select value={form.brand} onValueChange={(v) => updateFormField("brand", v)}>
                  <SelectTrigger id="prod-brand"><SelectValue placeholder="Pilih merek" /></SelectTrigger>
                  <SelectContent>
                    {brandItems.map((b) => (
                      <SelectItem key={b.id} value={b.name}>{b.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="prod-cat">Kategori</Label>
                <Select value={form.category} onValueChange={(v) => updateFormField("category", v)}>
                  <SelectTrigger id="prod-cat"><SelectValue placeholder="Pilih kategori" /></SelectTrigger>
                  <SelectContent>
                    {categoryItems.map((c) => (
                      <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="prod-cost">Harga Modal (Rp)</Label>
                <Input id="prod-cost" type="number" value={form.costPrice || ""} onChange={(e) => updateFormField("costPrice", Number(e.target.value))} placeholder="600000" />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="prod-sell">Harga Jual (Rp)</Label>
                <Input id="prod-sell" type="number" value={form.sellPrice || ""} onChange={(e) => updateFormField("sellPrice", Number(e.target.value))} placeholder="750000" />
              </div>
            </div>
            {form.sellPrice > 0 && form.costPrice > 0 && (
              <div className="rounded-md bg-muted px-3 py-2">
                <p className="text-xs text-muted-foreground">
                  Margin: <span className="font-medium text-foreground">{formatRupiah(form.sellPrice - form.costPrice)}</span>
                  {" "}({((form.sellPrice - form.costPrice) / form.costPrice * 100).toFixed(1)}%)
                </p>
              </div>
            )}
            {/* Stok per Outlet */}
            <div className="flex flex-col gap-2">
              <Label>Stok per Outlet</Label>
              <div className="grid grid-cols-2 gap-3">
                {availableOutlets.map((outlet) => (
                  <div key={outlet.id} className="flex flex-col gap-1">
                    <Label htmlFor={`stock-${outlet.id}`} className="text-xs text-muted-foreground">
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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Batal</Button>
            <Button onClick={handleSave} disabled={saving}>{saving ? "Menyimpan..." : editingProduct ? "Simpan Perubahan" : "Tambah Produk"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-heading">Hapus Produk</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus <span className="font-medium text-foreground">{deletingProduct?.name} ({deletingProduct?.code})</span>? Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Batal</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>{deleting ? "Menghapus..." : "Hapus"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
