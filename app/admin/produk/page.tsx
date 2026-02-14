"use client"

import { useState } from "react"
import { Plus, Search, Pencil, Trash2, Filter, Store } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useOutlet, outlets } from "@/lib/outlet-context"

type StockPerOutlet = Record<string, number>

type Product = {
  id: string
  name: string
  code: string
  brand: string
  category: string
  costPrice: number
  sellPrice: number
  stock: StockPerOutlet
}

const initialProducts: Product[] = [
  {
    id: "P001",
    name: "Ecopia EP150",
    code: "185/65R15",
    brand: "Bridgestone",
    category: "Ban Mobil",
    costPrice: 600000,
    sellPrice: 750000,
    stock: { "OTL-001": 24, "OTL-002": 12 },
  },
  {
    id: "P002",
    name: "Champiro Eco",
    code: "175/65R14",
    brand: "GT Radial",
    category: "Ban Mobil",
    costPrice: 400000,
    sellPrice: 520000,
    stock: { "OTL-001": 18, "OTL-002": 10 },
  },
  {
    id: "P003",
    name: "Enasave EC300+",
    code: "195/60R16",
    brand: "Dunlop",
    category: "Ban Mobil",
    costPrice: 700000,
    sellPrice: 880000,
    stock: { "OTL-001": 12, "OTL-002": 8 },
  },
  {
    id: "P004",
    name: "Kinergy EX",
    code: "205/55R16",
    brand: "Hankook",
    category: "Ban Mobil",
    costPrice: 560000,
    sellPrice: 720000,
    stock: { "OTL-001": 15, "OTL-002": 6 },
  },
  {
    id: "P005",
    name: "PHI-R",
    code: "205/45R17",
    brand: "Accelera",
    category: "Ban Mobil",
    costPrice: 480000,
    sellPrice: 650000,
    stock: { "OTL-001": 10, "OTL-002": 20 },
  },
  {
    id: "P006",
    name: "Turanza T005A",
    code: "215/60R17",
    brand: "Bridgestone",
    category: "Ban SUV",
    costPrice: 980000,
    sellPrice: 1250000,
    stock: { "OTL-001": 4, "OTL-002": 8 },
  },
  {
    id: "P007",
    name: "Savero SUV",
    code: "225/65R17",
    brand: "GT Radial",
    category: "Ban SUV",
    costPrice: 720000,
    sellPrice: 950000,
    stock: { "OTL-001": 6, "OTL-002": 10 },
  },
  {
    id: "P008",
    name: "AT3",
    code: "265/65R17",
    brand: "Dunlop",
    category: "Ban SUV",
    costPrice: 1100000,
    sellPrice: 1450000,
    stock: { "OTL-001": 3, "OTL-002": 6 },
  },
  {
    id: "P009",
    name: "K415",
    code: "185/70R14",
    brand: "Hankook",
    category: "Ban Mobil",
    costPrice: 360000,
    sellPrice: 480000,
    stock: { "OTL-001": 22, "OTL-002": 14 },
  },
  {
    id: "P010",
    name: "Techno Sport",
    code: "195/50R16",
    brand: "Accelera",
    category: "Ban Mobil",
    costPrice: 420000,
    sellPrice: 580000,
    stock: { "OTL-001": 8, "OTL-002": 14 },
  },
  {
    id: "P011",
    name: "Ban Dalam Motor",
    code: "70/90-17",
    brand: "IRC",
    category: "Ban Motor",
    costPrice: 30000,
    sellPrice: 45000,
    stock: { "OTL-001": 50, "OTL-002": 30 },
  },
  {
    id: "P012",
    name: "NR76 Tubeless",
    code: "80/90-17",
    brand: "IRC",
    category: "Ban Motor",
    costPrice: 120000,
    sellPrice: 165000,
    stock: { "OTL-001": 30, "OTL-002": 20 },
  },
]

const brands = ["Semua", "Bridgestone", "GT Radial", "Dunlop", "Hankook", "Accelera", "IRC"]
const categories = ["Semua", "Ban Mobil", "Ban SUV", "Ban Motor"]

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
  stock: Object.fromEntries(outlets.map((o) => [o.id, 0])),
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
  const { selectedOutletId, isSuperAdmin } = useOutlet()
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [search, setSearch] = useState("")
  const [filterBrand, setFilterBrand] = useState("Semua")
  const [filterCategory, setFilterCategory] = useState("Semua")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null)
  const [form, setForm] = useState<ProductForm>(emptyForm)

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
    setForm(emptyForm)
    setDialogOpen(true)
  }

  const openEdit = (product: Product) => {
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

  const openDelete = (product: Product) => {
    setDeletingProduct(product)
    setDeleteDialogOpen(true)
  }

  const handleSave = () => {
    if (!form.name || !form.brand || !form.category || !form.code) return
    if (editingProduct) {
      setProducts((prev) =>
        prev.map((p) =>
          p.id === editingProduct.id
            ? { ...p, name: form.name, code: form.code, brand: form.brand, category: form.category, costPrice: form.costPrice, sellPrice: form.sellPrice, stock: { ...form.stock } }
            : p
        )
      )
    } else {
      const newId = "P" + String(products.length + 1).padStart(3, "0")
      setProducts((prev) => [
        ...prev,
        {
          id: newId,
          name: form.name,
          code: form.code,
          brand: form.brand,
          category: form.category,
          costPrice: form.costPrice,
          sellPrice: form.sellPrice,
          stock: { ...form.stock },
        },
      ])
    }
    setDialogOpen(false)
  }

  const handleDelete = () => {
    if (deletingProduct) {
      setProducts((prev) => prev.filter((p) => p.id !== deletingProduct.id))
    }
    setDeleteDialogOpen(false)
    setDeletingProduct(null)
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
                {brands.map((b) => (
                  <SelectItem key={b} value={b}>{b}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Kategori" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
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
                  <TableHead className="w-24 text-center">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8 + outlets.length} className="py-12 text-center text-muted-foreground">
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
                      </TableRow>
                    )
                  })
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
                <Input id="prod-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ecopia EP150" />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="prod-code">Kode/Ukuran</Label>
                <Input id="prod-code" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="185/65R15" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="prod-brand">Merek</Label>
                <Select value={form.brand} onValueChange={(v) => setForm({ ...form, brand: v })}>
                  <SelectTrigger id="prod-brand"><SelectValue placeholder="Pilih merek" /></SelectTrigger>
                  <SelectContent>
                    {brands.filter((b) => b !== "Semua").map((b) => (
                      <SelectItem key={b} value={b}>{b}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="prod-cat">Kategori</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger id="prod-cat"><SelectValue placeholder="Pilih kategori" /></SelectTrigger>
                  <SelectContent>
                    {categories.filter((c) => c !== "Semua").map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="prod-cost">Harga Modal (Rp)</Label>
                <Input id="prod-cost" type="number" value={form.costPrice || ""} onChange={(e) => setForm({ ...form, costPrice: Number(e.target.value) })} placeholder="600000" />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="prod-sell">Harga Jual (Rp)</Label>
                <Input id="prod-sell" type="number" value={form.sellPrice || ""} onChange={(e) => setForm({ ...form, sellPrice: Number(e.target.value) })} placeholder="750000" />
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
                {outlets.map((outlet) => (
                  <div key={outlet.id} className="flex flex-col gap-1">
                    <Label htmlFor={`stock-${outlet.id}`} className="text-xs text-muted-foreground">
                      {outlet.name}
                    </Label>
                    <Input
                      id={`stock-${outlet.id}`}
                      type="number"
                      value={form.stock[outlet.id] ?? 0}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          stock: { ...form.stock, [outlet.id]: Number(e.target.value) },
                        })
                      }
                      placeholder="0"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Batal</Button>
            <Button onClick={handleSave}>{editingProduct ? "Simpan Perubahan" : "Tambah Produk"}</Button>
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
            <Button variant="destructive" onClick={handleDelete}>Hapus</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
