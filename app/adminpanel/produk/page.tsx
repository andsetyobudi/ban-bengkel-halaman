"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, Search, Pencil, Trash2, Filter, Store } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useOutlet, type ProductItem, type StockPerOutlet } from "@/lib/outlet-context"
import { toast } from "sonner"

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
  const router = useRouter()
  const { selectedOutletId, isSuperAdmin, outlets, products, setProducts, brands: brandItems, categories: categoryItems } = useOutlet()

  const brandNames = ["Semua", ...brandItems.map((b) => b.name)]
  const categoryNames = ["Semua", ...categoryItems.map((c) => c.name)]
  const [search, setSearch] = useState("")
  const [filterBrand, setFilterBrand] = useState("Semua")
  const [filterCategory, setFilterCategory] = useState("Semua")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletingProduct, setDeletingProduct] = useState<ProductItem | null>(null)

  const filtered = products.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.code.toLowerCase().includes(search.toLowerCase()) ||
      p.brand.toLowerCase().includes(search.toLowerCase())
    const matchBrand = filterBrand === "Semua" || p.brand === filterBrand
    const matchCategory = filterCategory === "Semua" || p.category === filterCategory
    return matchSearch && matchBrand && matchCategory
  })

  const openDelete = (product: ProductItem) => {
    setDeletingProduct(product)
    setDeleteDialogOpen(true)
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
          <Button onClick={() => router.push("/adminpanel/produk/tambah")}>
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
                              onClick={() => router.push(`/adminpanel/produk/${product.id}/edit`)}
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
