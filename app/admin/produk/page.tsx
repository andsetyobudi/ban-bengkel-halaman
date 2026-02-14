"use client"

import { useState } from "react"
import { Plus, Search, Pencil, Trash2, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

type Product = {
  id: string
  name: string
  brand: string
  category: string
  size: string
  price: number
  stock: number
}

const initialProducts: Product[] = [
  { id: "P001", name: "Ecopia EP150 185/65R15", brand: "Bridgestone", category: "Ban Mobil", size: "R15", price: 750000, stock: 24 },
  { id: "P002", name: "Champiro Eco 175/65R14", brand: "GT Radial", category: "Ban Mobil", size: "R14", price: 520000, stock: 18 },
  { id: "P003", name: "Enasave EC300+ 195/60R16", brand: "Dunlop", category: "Ban Mobil", size: "R16", price: 880000, stock: 12 },
  { id: "P004", name: "Kinergy EX 205/55R16", brand: "Hankook", category: "Ban Mobil", size: "R16", price: 720000, stock: 15 },
  { id: "P005", name: "PHI-R 205/45R17", brand: "Accelera", category: "Ban Mobil", size: "R17", price: 650000, stock: 20 },
  { id: "P006", name: "Turanza T005A 215/60R17", brand: "Bridgestone", category: "Ban SUV", size: "R17", price: 1250000, stock: 8 },
  { id: "P007", name: "Savero SUV 225/65R17", brand: "GT Radial", category: "Ban SUV", size: "R17", price: 950000, stock: 10 },
  { id: "P008", name: "AT3 265/65R17", brand: "Dunlop", category: "Ban SUV", size: "R17", price: 1450000, stock: 6 },
  { id: "P009", name: "K415 185/70R14", brand: "Hankook", category: "Ban Mobil", size: "R14", price: 480000, stock: 22 },
  { id: "P010", name: "Techno Sport 195/50R16", brand: "Accelera", category: "Ban Mobil", size: "R16", price: 580000, stock: 14 },
  { id: "P011", name: "Ban Dalam Motor 70/90-17", brand: "IRC", category: "Ban Motor", size: "Ring 17", price: 45000, stock: 50 },
  { id: "P012", name: "NR76 80/90-17 Tubeless", brand: "IRC", category: "Ban Motor", size: "Ring 17", price: 165000, stock: 30 },
]

const brands = ["Semua", "Bridgestone", "GT Radial", "Dunlop", "Hankook", "Accelera", "IRC"]
const categories = ["Semua", "Ban Mobil", "Ban SUV", "Ban Motor"]

const emptyProduct: Omit<Product, "id"> = {
  name: "",
  brand: "",
  category: "",
  size: "",
  price: 0,
  stock: 0,
}

function formatRupiah(num: number) {
  return "Rp " + num.toLocaleString("id-ID")
}

export default function ProdukPage() {
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [search, setSearch] = useState("")
  const [filterBrand, setFilterBrand] = useState("Semua")
  const [filterCategory, setFilterCategory] = useState("Semua")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null)
  const [form, setForm] = useState(emptyProduct)

  const filtered = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.brand.toLowerCase().includes(search.toLowerCase())
    const matchBrand = filterBrand === "Semua" || p.brand === filterBrand
    const matchCategory = filterCategory === "Semua" || p.category === filterCategory
    return matchSearch && matchBrand && matchCategory
  })

  const openAdd = () => {
    setEditingProduct(null)
    setForm(emptyProduct)
    setDialogOpen(true)
  }

  const openEdit = (product: Product) => {
    setEditingProduct(product)
    setForm({ name: product.name, brand: product.brand, category: product.category, size: product.size, price: product.price, stock: product.stock })
    setDialogOpen(true)
  }

  const openDelete = (product: Product) => {
    setDeletingProduct(product)
    setDeleteDialogOpen(true)
  }

  const handleSave = () => {
    if (!form.name || !form.brand || !form.category) return
    if (editingProduct) {
      setProducts((prev) => prev.map((p) => (p.id === editingProduct.id ? { ...editingProduct, ...form } : p)))
    } else {
      const newId = "P" + String(products.length + 1).padStart(3, "0")
      setProducts((prev) => [...prev, { id: newId, ...form }])
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

  const totalStock = products.reduce((sum, p) => sum + p.stock, 0)
  const uniqueBrands = new Set(products.map((p) => p.brand)).size
  const uniqueCategories = new Set(products.map((p) => p.category)).size

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">Manajemen Produk</h1>
          <p className="text-sm text-muted-foreground">Kelola data produk ban CarProBan</p>
        </div>
        <Button onClick={openAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Produk
        </Button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total Produk</p>
            <p className="font-heading text-2xl font-bold text-foreground">{products.length}</p>
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
                placeholder="Cari nama produk atau merek..."
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
                  <TableHead className="w-20">ID</TableHead>
                  <TableHead>Nama Produk</TableHead>
                  <TableHead>Merek</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead>Ukuran</TableHead>
                  <TableHead className="text-right">Harga</TableHead>
                  <TableHead className="text-center">Stok</TableHead>
                  <TableHead className="w-24 text-center">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="py-12 text-center text-muted-foreground">
                      Tidak ada produk ditemukan.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-mono text-xs text-muted-foreground">{product.id}</TableCell>
                      <TableCell className="font-medium text-foreground">{product.name}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{product.brand}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{product.category}</TableCell>
                      <TableCell className="text-muted-foreground">{product.size}</TableCell>
                      <TableCell className="text-right font-medium text-foreground">{formatRupiah(product.price)}</TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant={product.stock <= 10 ? "destructive" : "default"}
                          className={product.stock > 10 ? "bg-[hsl(142,70%,40%)] text-[hsl(0,0%,100%)] hover:bg-[hsl(142,70%,35%)]" : ""}
                        >
                          {product.stock}
                        </Badge>
                      </TableCell>
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
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-heading">{editingProduct ? "Edit Produk" : "Tambah Produk Baru"}</DialogTitle>
            <DialogDescription>
              {editingProduct ? "Ubah informasi produk di bawah ini." : "Isi detail produk baru di bawah ini."}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="prod-name">Nama Produk</Label>
              <Input id="prod-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ecopia EP150 185/65R15" />
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
            <div className="flex flex-col gap-2">
              <Label htmlFor="prod-size">Ukuran</Label>
              <Input id="prod-size" value={form.size} onChange={(e) => setForm({ ...form, size: e.target.value })} placeholder="R15" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="prod-price">Harga (Rp)</Label>
                <Input id="prod-price" type="number" value={form.price || ""} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} placeholder="750000" />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="prod-stock">Stok</Label>
                <Input id="prod-stock" type="number" value={form.stock || ""} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} placeholder="24" />
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
              Apakah Anda yakin ingin menghapus <span className="font-medium text-foreground">{deletingProduct?.name}</span>? Tindakan ini tidak dapat dibatalkan.
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
