"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowLeftRight,
  Plus,
  Trash2,
  Store,
  CalendarIcon,
  FileText,
  Package,
  Search,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useOutlet, outlets, type TransferItem } from "@/lib/outlet-context"

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

const allProducts: Product[] = [
  { id: "P001", name: "Ecopia EP150", code: "185/65R15", brand: "Bridgestone", category: "Ban Mobil", costPrice: 600000, sellPrice: 750000, stock: { "OTL-001": 24, "OTL-002": 12 } },
  { id: "P002", name: "Champiro Eco", code: "175/65R14", brand: "GT Radial", category: "Ban Mobil", costPrice: 400000, sellPrice: 520000, stock: { "OTL-001": 18, "OTL-002": 10 } },
  { id: "P003", name: "Enasave EC300+", code: "195/60R16", brand: "Dunlop", category: "Ban Mobil", costPrice: 700000, sellPrice: 880000, stock: { "OTL-001": 12, "OTL-002": 8 } },
  { id: "P004", name: "Kinergy EX", code: "205/55R16", brand: "Hankook", category: "Ban Mobil", costPrice: 560000, sellPrice: 720000, stock: { "OTL-001": 15, "OTL-002": 6 } },
  { id: "P005", name: "PHI-R", code: "205/45R17", brand: "Accelera", category: "Ban Mobil", costPrice: 480000, sellPrice: 650000, stock: { "OTL-001": 10, "OTL-002": 20 } },
  { id: "P006", name: "Turanza T005A", code: "215/60R17", brand: "Bridgestone", category: "Ban SUV", costPrice: 980000, sellPrice: 1250000, stock: { "OTL-001": 4, "OTL-002": 8 } },
  { id: "P007", name: "Savero SUV", code: "225/65R17", brand: "GT Radial", category: "Ban SUV", costPrice: 720000, sellPrice: 950000, stock: { "OTL-001": 6, "OTL-002": 10 } },
  { id: "P008", name: "AT3", code: "265/65R17", brand: "Dunlop", category: "Ban SUV", costPrice: 1100000, sellPrice: 1450000, stock: { "OTL-001": 3, "OTL-002": 6 } },
  { id: "P009", name: "K415", code: "185/70R14", brand: "Hankook", category: "Ban Mobil", costPrice: 360000, sellPrice: 480000, stock: { "OTL-001": 22, "OTL-002": 14 } },
  { id: "P010", name: "Techno Sport", code: "195/50R16", brand: "Accelera", category: "Ban Mobil", costPrice: 420000, sellPrice: 580000, stock: { "OTL-001": 8, "OTL-002": 14 } },
  { id: "P011", name: "Ban Dalam Motor", code: "70/90-17", brand: "IRC", category: "Ban Motor", costPrice: 30000, sellPrice: 45000, stock: { "OTL-001": 50, "OTL-002": 30 } },
  { id: "P012", name: "NR76 Tubeless", code: "80/90-17", brand: "IRC", category: "Ban Motor", costPrice: 120000, sellPrice: 165000, stock: { "OTL-001": 30, "OTL-002": 20 } },
]

export default function TransferBarangPage() {
  const { addTransfer, isSuperAdmin, selectedOutletId } = useOutlet()
  const router = useRouter()

  // Super admin tidak bisa akses halaman transfer barang
  if (isSuperAdmin) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">Transfer Barang</h1>
          <p className="text-sm text-muted-foreground">Buat transfer barang antar outlet</p>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <Store className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="font-medium text-foreground">Akses Terbatas</p>
            <p className="max-w-sm text-sm text-muted-foreground">
              Halaman transfer barang hanya dapat diakses oleh admin outlet. Super admin dapat melihat riwayat transfer di halaman Riwayat Transfer.
            </p>
            <Button variant="outline" size="sm" className="mt-2" onClick={() => router.push("/admin/transfer/riwayat")}>
              Lihat Riwayat Transfer
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Outlet asal otomatis dari session outlet yang sedang aktif
  const fromOutletId = selectedOutletId
  const [toOutletId, setToOutletId] = useState("")
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0])
  const [note, setNote] = useState("")
  const [selectedItems, setSelectedItems] = useState<(TransferItem & { maxStock: number })[]>([])

  // Product picker dialog
  const [pickerOpen, setPickerOpen] = useState(false)
  const [productSearch, setProductSearch] = useState("")

  // Success dialog
  const [successOpen, setSuccessOpen] = useState(false)

  // Products available at source outlet
  const availableProducts = useMemo(() => {
    if (!fromOutletId || fromOutletId === "all") return []
    return allProducts
      .filter((p) => (p.stock[fromOutletId] ?? 0) > 0)
      .filter((p) => !selectedItems.some((s) => s.productId === p.id))
  }, [fromOutletId, selectedItems])

  const filteredPickerProducts = availableProducts.filter(
    (p) =>
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.code.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.brand.toLowerCase().includes(productSearch.toLowerCase())
  )

  const destinationOutlets = outlets.filter((o) => o.id !== fromOutletId && o.status === "active")

  const handleAddProduct = (product: Product) => {
    const maxStock = product.stock[fromOutletId] ?? 0
    setSelectedItems((prev) => [
      ...prev,
      {
        productId: product.id,
        productName: product.name,
        productCode: product.code,
        qty: 1,
        maxStock,
      },
    ])
    setPickerOpen(false)
    setProductSearch("")
  }

  const handleRemoveProduct = (productId: string) => {
    setSelectedItems((prev) => prev.filter((i) => i.productId !== productId))
  }

  const handleQtyChange = (productId: string, qty: number) => {
    setSelectedItems((prev) =>
      prev.map((i) =>
        i.productId === productId
          ? { ...i, qty: Math.max(1, Math.min(qty, i.maxStock)) }
          : i
      )
    )
  }

  const isValid = fromOutletId && fromOutletId !== "all" && toOutletId && date && selectedItems.length > 0

  const handleSubmit = () => {
    if (!isValid) return
    const items: TransferItem[] = selectedItems.map(({ productId, productName, productCode, qty }) => ({
      productId,
      productName,
      productCode,
      qty,
    }))
    addTransfer(fromOutletId, toOutletId, date, note.trim(), items)
    setSuccessOpen(true)
  }

  const handleSuccessClose = () => {
    setSuccessOpen(false)
    router.push("/admin/transfer/riwayat")
  }

  const handleReset = () => {
    setToOutletId("")
    setDate(new Date().toISOString().split("T")[0])
    setNote("")
    setSelectedItems([])
    setSuccessOpen(false)
  }

  const getOutletName = (id: string) => outlets.find((o) => o.id === id)?.name ?? "-"

  const totalItems = selectedItems.reduce((sum, i) => sum + i.qty, 0)

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground">Transfer Barang</h1>
        <p className="text-sm text-muted-foreground">Buat transfer barang antar outlet</p>
      </div>

      {/* Transfer Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ArrowLeftRight className="h-4 w-4" />
            Informasi Transfer
          </CardTitle>
          <CardDescription>Tentukan outlet asal, tujuan, dan tanggal transfer</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label>Outlet Asal</Label>
                <div className="flex h-10 items-center gap-2 rounded-md border border-input bg-muted/50 px-3">
                  <Store className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">
                    {getOutletName(fromOutletId)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">Otomatis sesuai outlet Anda</p>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="to-outlet">Outlet Tujuan</Label>
                <Select
                  value={toOutletId}
                  onValueChange={setToOutletId}
                  disabled={!fromOutletId}
                >
                  <SelectTrigger id="to-outlet">
                    <SelectValue placeholder={fromOutletId ? "Pilih outlet tujuan" : "Pilih outlet asal dulu"} />
                  </SelectTrigger>
                  <SelectContent>
                    {destinationOutlets.map((o) => (
                      <SelectItem key={o.id} value={o.id}>
                        {o.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="transfer-date">Tanggal Transfer</Label>
                <div className="relative">
                  <CalendarIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="transfer-date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="transfer-note">
                  Catatan <span className="text-muted-foreground">(opsional)</span>
                </Label>
                <Textarea
                  id="transfer-note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Catatan tambahan..."
                  rows={1}
                  className="min-h-[40px] resize-none"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Selected Products Card */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-base">
                <Package className="h-4 w-4" />
                Daftar Produk Transfer
              </CardTitle>
              <CardDescription>
                {selectedItems.length > 0
                  ? `${selectedItems.length} produk (${totalItems} unit)`
                  : "Tambahkan produk yang akan ditransfer"}
              </CardDescription>
            </div>
            <Button
              size="sm"
              onClick={() => {
                setProductSearch("")
                setPickerOpen(true)
              }}
              disabled={!fromOutletId}
            >
              <Plus className="mr-2 h-4 w-4" />
              Tambah Produk
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-14 text-center">No</TableHead>
                  <TableHead>Produk</TableHead>
                  <TableHead>Kode/Ukuran</TableHead>
                  <TableHead className="text-center">Stok Tersedia</TableHead>
                  <TableHead className="w-32 text-center">Jumlah</TableHead>
                  <TableHead className="w-20 text-center">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {selectedItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-12 text-center text-muted-foreground">
                      {fromOutletId
                        ? 'Belum ada produk. Klik "Tambah Produk" untuk memilih.'
                        : "Pilih outlet asal terlebih dahulu."}
                    </TableCell>
                  </TableRow>
                ) : (
                  selectedItems.map((item, idx) => (
                    <TableRow key={item.productId}>
                      <TableCell className="text-center text-sm text-muted-foreground">
                        {idx + 1}
                      </TableCell>
                      <TableCell className="font-medium text-foreground">
                        {item.productName}
                      </TableCell>
                      <TableCell className="font-mono text-sm text-muted-foreground">
                        {item.productCode}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary">{item.maxStock}</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Input
                          type="number"
                          min={1}
                          max={item.maxStock}
                          value={item.qty}
                          onChange={(e) => handleQtyChange(item.productId, Number(e.target.value))}
                          className="mx-auto w-20 text-center"
                        />
                      </TableCell>
                      <TableCell className="text-center">
                        <button
                          onClick={() => handleRemoveProduct(item.productId)}
                          className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                          aria-label={`Hapus ${item.productName}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Summary & Submit */}
      {selectedItems.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-muted-foreground">
                    Dari: <span className="font-medium text-foreground">{getOutletName(fromOutletId)}</span>
                  </span>
                  <ArrowLeftRight className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    Ke: <span className="font-medium text-foreground">{toOutletId ? getOutletName(toOutletId) : "-"}</span>
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {selectedItems.length} produk, {totalItems} total unit
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={handleReset}>
                  Reset
                </Button>
                <Button onClick={handleSubmit} disabled={!isValid}>
                  <FileText className="mr-2 h-4 w-4" />
                  Buat Transfer
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Product Picker Dialog */}
      <Dialog open={pickerOpen} onOpenChange={setPickerOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-heading">Pilih Produk</DialogTitle>
            <DialogDescription>
              Pilih produk dari stok {getOutletName(fromOutletId)}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Cari produk..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="max-h-72 overflow-y-auto">
              {filteredPickerProducts.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  {availableProducts.length === 0
                    ? "Semua produk sudah ditambahkan."
                    : "Produk tidak ditemukan."}
                </div>
              ) : (
                <div className="flex flex-col gap-1">
                  {filteredPickerProducts.map((product) => {
                    const stock = product.stock[fromOutletId] ?? 0
                    return (
                      <button
                        key={product.id}
                        onClick={() => handleAddProduct(product)}
                        className="flex items-center justify-between rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-muted"
                      >
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-foreground">
                            {product.name}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {product.code} - {product.brand}
                          </span>
                        </div>
                        <Badge variant="secondary" className="shrink-0">
                          Stok: {stock}
                        </Badge>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Success Dialog */}
      <Dialog open={successOpen} onOpenChange={setSuccessOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-heading">Transfer Berhasil Dibuat</DialogTitle>
            <DialogDescription>
              Transfer dari {getOutletName(fromOutletId)} ke {getOutletName(toOutletId)} dengan {selectedItems.length} produk ({totalItems} unit) telah berhasil dibuat dengan status <span className="font-medium text-foreground">Menunggu</span>.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={handleReset}>
              Buat Transfer Lagi
            </Button>
            <Button onClick={handleSuccessClose}>
              Lihat Riwayat
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
