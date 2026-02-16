"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import {
  ShoppingCart,
  Plus,
  Trash2,
  Minus,
  ChevronRight,
  ChevronLeft,
  Check,
  Search,
  Store,
  User,
  Car,
  CreditCard,
  FileText,
  AlertTriangle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { useOutlet, outlets } from "@/lib/outlet-context"
import { cn } from "@/lib/utils"
import type { TransactionItem, PaymentMethodType, PaymentEntry } from "@/lib/outlet-context"

// Product data for selection
type ProductData = {
  id: string
  name: string
  code: string
  brand: string
  sellPrice: number
}

const productCatalog: ProductData[] = [
  { id: "P001", name: "Ecopia EP150", code: "185/65R15", brand: "Bridgestone", sellPrice: 750000 },
  { id: "P002", name: "Champiro Eco", code: "175/65R14", brand: "GT Radial", sellPrice: 520000 },
  { id: "P003", name: "Enasave EC300+", code: "195/60R16", brand: "Dunlop", sellPrice: 880000 },
  { id: "P004", name: "Kinergy EX", code: "205/55R16", brand: "Hankook", sellPrice: 720000 },
  { id: "P005", name: "PHI-R", code: "205/45R17", brand: "Accelera", sellPrice: 650000 },
  { id: "P006", name: "Turanza T005A", code: "215/60R17", brand: "Bridgestone", sellPrice: 1250000 },
  { id: "P007", name: "Savero SUV", code: "225/65R17", brand: "GT Radial", sellPrice: 950000 },
  { id: "P008", name: "AT3", code: "265/65R17", brand: "Dunlop", sellPrice: 1450000 },
  { id: "P009", name: "K415", code: "185/70R14", brand: "Hankook", sellPrice: 480000 },
  { id: "P010", name: "Techno Sport", code: "195/50R16", brand: "Accelera", sellPrice: 580000 },
  { id: "P011", name: "Ban Dalam Motor", code: "70/90-17", brand: "IRC", sellPrice: 45000 },
  { id: "P012", name: "NR76 Tubeless", code: "80/90-17", brand: "IRC", sellPrice: 165000 },
]

const serviceCatalog = [
  { name: "Tambal Ban Tubeless", price: 50000 },
  { name: "Balancing (per ban)", price: 25000 },
  { name: "Spooring", price: 150000 },
  { name: "Isi Nitrogen (4 ban)", price: 40000 },
  { name: "Pasang Ban (per ban)", price: 20000 },
]

function formatRupiah(num: number) {
  return "Rp " + num.toLocaleString("id-ID")
}

function getTodayString() {
  const d = new Date()
  return d.toISOString().split("T")[0]
}

const STEPS = [
  { label: "Produk", icon: ShoppingCart },
  { label: "Pelanggan", icon: User },
  { label: "Pembayaran", icon: CreditCard },
]

const PAYMENT_METHOD_LABELS: Record<PaymentMethodType, string> = {
  tunai: "Tunai",
  qris: "QRIS",
  debit_kredit: "Debit/Kredit",
  piutang: "Piutang",
}

export default function TransaksiBaruPage() {
  const router = useRouter()
  const { selectedOutletId, addTransaction, nextInvoiceNumber } = useOutlet()
  const [step, setStep] = useState(0)

  // Step 1 - Cart
  const [cart, setCart] = useState<TransactionItem[]>([])
  const [productSearch, setProductSearch] = useState("")
  const [manualName, setManualName] = useState("")
  const [manualPrice, setManualPrice] = useState<number | "">("")
  const [showSearchDialog, setShowSearchDialog] = useState(false)
  const [showManualDialog, setShowManualDialog] = useState(false)

  // Step 2 - Customer
  const [invoice] = useState(() => nextInvoiceNumber())
  const [txDate, setTxDate] = useState(getTodayString())
  const [customerName, setCustomerName] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")
  const [nopol, setNopol] = useState("")
  const [vehicle, setVehicle] = useState("")

  // Step 3 - Payment
  const [discount, setDiscount] = useState<number | "">("")
  const [paymentType, setPaymentType] = useState<"penuh" | "campuran">("penuh")
  const [singleMethod, setSingleMethod] = useState<PaymentMethodType>("tunai")
  const [multiPayments, setMultiPayments] = useState<PaymentEntry[]>([
    { method: "tunai", amount: 0 },
    { method: "qris", amount: 0 },
  ])
  const [nominalBayar, setNominalBayar] = useState<number | "">("")
  const [note, setNote] = useState("")

  // Computed values
  const subtotal = cart.reduce((s, item) => s + item.price * item.qty, 0)
  const discountVal = typeof discount === "number" ? discount : 0
  const total = Math.max(0, subtotal - discountVal)
  const nominalVal = typeof nominalBayar === "number" ? nominalBayar : 0
  const sisa = total - nominalVal
  const isPiutang = nominalVal > 0 && nominalVal < total

  // Filtered products for search
  const filteredProducts = useMemo(() => {
    if (!productSearch.trim()) return [...productCatalog, ...serviceCatalog.map((s, i) => ({ id: `SVC-${i}`, name: s.name, code: "Jasa", brand: "Servis", sellPrice: s.price }))]
    const q = productSearch.toLowerCase()
    const prods = productCatalog.filter(
      (p) => p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q)
    )
    const services = serviceCatalog
      .filter((s) => s.name.toLowerCase().includes(q))
      .map((s, i) => ({ id: `SVC-${i}`, name: s.name, code: "Jasa", brand: "Servis", sellPrice: s.price }))
    return [...prods, ...services]
  }, [productSearch])

  // Cart actions
  const addToCart = (name: string, price: number) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.name === name)
      if (existing) {
        return prev.map((item) => (item.name === name ? { ...item, qty: item.qty + 1 } : item))
      }
      return [...prev, { name, price, qty: 1 }]
    })
  }

  const updateCartItem = (index: number, field: "price" | "qty", value: number) => {
    setCart((prev) => prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)))
  }

  const removeCartItem = (index: number) => {
    setCart((prev) => prev.filter((_, i) => i !== index))
  }

  const addManualItem = () => {
    if (!manualName.trim() || !manualPrice) return
    addToCart(manualName.trim(), Number(manualPrice))
    setManualName("")
    setManualPrice("")
  }

  // Process transaction
  const processTransaction = () => {
    const payments: PaymentEntry[] =
      paymentType === "penuh"
        ? [{ method: singleMethod, amount: nominalVal }]
        : multiPayments.filter((p) => p.amount > 0)

    const outletId = selectedOutletId === "all" ? "OTL-001" : selectedOutletId

    addTransaction({
      invoice,
      date: txDate,
      customerName,
      customerPhone,
      nopol,
      vehicle,
      items: cart,
      subtotal,
      discount: discountVal,
      total,
      paymentType,
      payments,
      nominalBayar: nominalVal,
      sisa: Math.max(0, sisa),
      isPiutang,
      note,
      outletId,
      status: "Selesai",
    })

    router.push("/admin/transaksi/riwayat")
  }

  const canProceedStep1 = cart.length > 0
  const canProceedStep2 = customerName.trim() !== "" && nopol.trim() !== ""
  const canProcess = nominalVal > 0

  const outletLabel =
    selectedOutletId === "all" ? "Semua Outlet" : outlets.find((o) => o.id === selectedOutletId)?.name || ""

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground">Transaksi Baru</h1>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Store className="h-3.5 w-3.5" />
          <span>{outletLabel}</span>
        </div>
      </div>

      {/* Stepper */}
      <div className="flex items-center justify-center gap-0">
        {STEPS.map((s, idx) => {
          const isDone = idx < step
          const isActive = idx === step
          const Icon = s.icon
          return (
            <div key={s.label} className="flex items-center">
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors",
                    isDone && "border-primary bg-primary text-primary-foreground",
                    isActive && "border-primary bg-primary/10 text-primary",
                    !isDone && !isActive && "border-muted-foreground/30 text-muted-foreground/50"
                  )}
                >
                  {isDone ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                </div>
                <span
                  className={cn(
                    "text-xs font-medium",
                    isActive ? "text-primary" : isDone ? "text-foreground" : "text-muted-foreground/50"
                  )}
                >
                  {s.label}
                </span>
              </div>
              {idx < STEPS.length - 1 && (
                <div
                  className={cn(
                    "mx-2 mb-5 h-0.5 w-12 sm:w-20",
                    idx < step ? "bg-primary" : "bg-muted-foreground/20"
                  )}
                />
              )}
            </div>
          )
        })}
      </div>

      {/* Step Content */}
      {step === 0 && (
        <StepProduk
          productSearch={productSearch}
          setProductSearch={setProductSearch}
          filteredProducts={filteredProducts}
          addToCart={addToCart}
          manualName={manualName}
          setManualName={setManualName}
          manualPrice={manualPrice}
          setManualPrice={setManualPrice}
          addManualItem={addManualItem}
          cart={cart}
          updateCartItem={updateCartItem}
          removeCartItem={removeCartItem}
          subtotal={subtotal}
          showSearchDialog={showSearchDialog}
          setShowSearchDialog={setShowSearchDialog}
          showManualDialog={showManualDialog}
          setShowManualDialog={setShowManualDialog}
        />
      )}

      {step === 1 && (
        <StepPelanggan
          invoice={invoice}
          txDate={txDate}
          setTxDate={setTxDate}
          customerName={customerName}
          setCustomerName={setCustomerName}
          customerPhone={customerPhone}
          setCustomerPhone={setCustomerPhone}
          nopol={nopol}
          setNopol={setNopol}
          vehicle={vehicle}
          setVehicle={setVehicle}
        />
      )}

      {step === 2 && (
        <StepPembayaran
          cart={cart}
          subtotal={subtotal}
          discount={discount}
          setDiscount={setDiscount}
          discountVal={discountVal}
          total={total}
          paymentType={paymentType}
          setPaymentType={setPaymentType}
          singleMethod={singleMethod}
          setSingleMethod={setSingleMethod}
          multiPayments={multiPayments}
          setMultiPayments={setMultiPayments}
          nominalBayar={nominalBayar}
          setNominalBayar={setNominalBayar}
          nominalVal={nominalVal}
          sisa={sisa}
          isPiutang={isPiutang}
          note={note}
          setNote={setNote}
        />
      )}

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => setStep((s) => s - 1)}
          disabled={step === 0}
          className="gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Kembali
        </Button>

        {step < 2 ? (
          <Button
            onClick={() => setStep((s) => s + 1)}
            disabled={step === 0 ? !canProceedStep1 : !canProceedStep2}
            className="gap-2"
          >
            Lanjut
            <ChevronRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button onClick={processTransaction} disabled={!canProcess} className="gap-2">
            <Check className="h-4 w-4" />
            Proses Transaksi
          </Button>
        )}
      </div>
    </div>
  )
}

// ======================
// STEP 1: PRODUK
// ======================
function StepProduk({
  productSearch,
  setProductSearch,
  filteredProducts,
  addToCart,
  manualName,
  setManualName,
  manualPrice,
  setManualPrice,
  addManualItem,
  cart,
  updateCartItem,
  removeCartItem,
  subtotal,
  showSearchDialog,
  setShowSearchDialog,
  showManualDialog,
  setShowManualDialog,
}: {
  productSearch: string
  setProductSearch: (v: string) => void
  filteredProducts: { id: string; name: string; code: string; brand: string; sellPrice: number }[]
  addToCart: (name: string, price: number) => void
  manualName: string
  setManualName: (v: string) => void
  manualPrice: number | ""
  setManualPrice: (v: number | "") => void
  addManualItem: () => void
  cart: TransactionItem[]
  updateCartItem: (index: number, field: "price" | "qty", value: number) => void
  removeCartItem: (index: number) => void
  subtotal: number
  showSearchDialog: boolean
  setShowSearchDialog: (v: boolean) => void
  showManualDialog: boolean
  setShowManualDialog: (v: boolean) => void
}) {
  return (
    <div className="flex flex-col gap-4">
      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => setShowSearchDialog(true)}
          className="group flex flex-col items-center gap-2.5 rounded-xl border border-border bg-card p-5 text-center transition-all hover:border-primary/40 hover:bg-primary/5 hover:shadow-sm"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
            <Search className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Cari Produk / Jasa</p>
            <p className="mt-0.5 text-xs text-muted-foreground">Pilih dari data produk</p>
          </div>
        </button>
        <button
          onClick={() => setShowManualDialog(true)}
          className="group flex flex-col items-center gap-2.5 rounded-xl border border-border bg-card p-5 text-center transition-all hover:border-primary/40 hover:bg-primary/5 hover:shadow-sm"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
            <Plus className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Input Manual</p>
            <p className="mt-0.5 text-xs text-muted-foreground">Tambah produk / jasa manual</p>
          </div>
        </button>
      </div>

      {/* Search Product Dialog */}
      <Dialog open={showSearchDialog} onOpenChange={setShowSearchDialog}>
        <DialogContent className="flex max-h-[85vh] flex-col sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Cari Produk / Jasa
            </DialogTitle>
            <DialogDescription>Pilih produk atau jasa untuk ditambahkan ke keranjang.</DialogDescription>
          </DialogHeader>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Cari nama, kode, atau merek..."
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto rounded-lg border border-border">
            {filteredProducts.length === 0 ? (
              <div className="p-6 text-center text-sm text-muted-foreground">Produk tidak ditemukan.</div>
            ) : (
              filteredProducts.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    addToCart(
                      `${p.brand !== "Servis" ? `${p.brand} ` : ""}${p.name}${p.code !== "Jasa" ? ` ${p.code}` : ""}`,
                      p.sellPrice
                    )
                    setShowSearchDialog(false)
                    setProductSearch("")
                  }}
                  className="flex w-full items-center justify-between border-b border-border px-4 py-3 text-left text-sm transition-colors last:border-b-0 hover:bg-muted"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-foreground">
                      {p.brand !== "Servis" ? `${p.brand} ` : ""}
                      {p.name}
                    </p>
                    <p className="text-xs text-muted-foreground">{p.code}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="text-sm font-semibold text-foreground">{formatRupiah(p.sellPrice)}</span>
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Plus className="h-3.5 w-3.5" />
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Manual Input Dialog */}
      <Dialog open={showManualDialog} onOpenChange={setShowManualDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Input Manual
            </DialogTitle>
            <DialogDescription>Masukkan nama dan harga produk atau jasa secara manual.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="manual-name">Nama Produk / Jasa</Label>
              <Input
                id="manual-name"
                value={manualName}
                onChange={(e) => setManualName(e.target.value)}
                placeholder="Contoh: Tambal Ban"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="manual-price">Harga (Rp)</Label>
              <Input
                id="manual-price"
                type="number"
                value={manualPrice}
                onChange={(e) => setManualPrice(e.target.value ? Number(e.target.value) : "")}
                placeholder="50000"
              />
            </div>
            <Button
              onClick={() => {
                if (manualName.trim() && manualPrice) {
                  addManualItem()
                  setShowManualDialog(false)
                }
              }}
              disabled={!manualName.trim() || !manualPrice}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Tambah ke Keranjang
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Cart */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-base">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              Keranjang
            </div>
            {cart.length > 0 && (
              <Badge variant="secondary">{cart.length} item</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {cart.length === 0 ? (
            <div className="px-6 py-8 text-center text-sm text-muted-foreground">
              Keranjang masih kosong. Tambahkan produk atau jasa di atas.
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nama</TableHead>
                      <TableHead className="w-36 text-right">Harga Satuan</TableHead>
                      <TableHead className="w-24 text-center">Qty</TableHead>
                      <TableHead className="w-32 text-right">Subtotal</TableHead>
                      <TableHead className="w-16 text-center">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cart.map((item, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-medium text-foreground">{item.name}</TableCell>
                        <TableCell className="text-right">
                          <Input
                            type="number"
                            value={item.price}
                            onChange={(e) => updateCartItem(idx, "price", Number(e.target.value))}
                            className="h-8 w-full text-right text-sm"
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => updateCartItem(idx, "qty", Math.max(1, item.qty - 1))}
                              className="flex h-7 w-7 items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-muted"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <Input
                              type="number"
                              value={item.qty}
                              onChange={(e) => updateCartItem(idx, "qty", Math.max(1, Number(e.target.value)))}
                              className="h-8 w-12 text-center text-sm"
                            />
                            <button
                              onClick={() => updateCartItem(idx, "qty", item.qty + 1)}
                              className="flex h-7 w-7 items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-muted"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-semibold text-foreground">
                          {formatRupiah(item.price * item.qty)}
                        </TableCell>
                        <TableCell className="text-center">
                          <button
                            onClick={() => removeCartItem(idx)}
                            className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                            aria-label={`Hapus ${item.name}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <Separator />
              <div className="flex items-center justify-between px-6 py-3">
                <span className="text-sm font-medium text-muted-foreground">Total Sementara</span>
                <span className="font-heading text-lg font-bold text-foreground">{formatRupiah(subtotal)}</span>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// ======================
// STEP 2: PELANGGAN
// ======================
function StepPelanggan({
  invoice,
  txDate,
  setTxDate,
  customerName,
  setCustomerName,
  customerPhone,
  setCustomerPhone,
  nopol,
  setNopol,
  vehicle,
  setVehicle,
}: {
  invoice: string
  txDate: string
  setTxDate: (v: string) => void
  customerName: string
  setCustomerName: (v: string) => void
  customerPhone: string
  setCustomerPhone: (v: string) => void
  nopol: string
  setNopol: (v: string) => void
  vehicle: string
  setVehicle: (v: string) => void
}) {
  return (
    <div className="flex flex-col gap-4">
      {/* Info Transaksi + Data Pelanggan - 2 columns */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Invoice & Date */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="h-4 w-4" />
              Data Transaksi
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="invoice">Nomor Invoice</Label>
              <Input id="invoice" value={invoice} readOnly className="bg-muted font-mono" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="tx-date">Tanggal Transaksi</Label>
              <Input id="tx-date" type="date" value={txDate} onChange={(e) => setTxDate(e.target.value)} />
            </div>
          </CardContent>
        </Card>

        {/* Customer Data */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <User className="h-4 w-4" />
              Data Pelanggan
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="cust-name">
                Nama Pelanggan <span className="text-destructive">*</span>
              </Label>
              <Input
                id="cust-name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Nama lengkap"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="cust-phone">Nomor WhatsApp</Label>
              <Input
                id="cust-phone"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="08xxxxxxxxxx"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Vehicle Data - full width below */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Car className="h-4 w-4" />
            Data Kendaraan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="nopol">
                Nomor Polisi <span className="text-destructive">*</span>
              </Label>
              <Input
                id="nopol"
                value={nopol}
                onChange={(e) => setNopol(e.target.value.toUpperCase())}
                placeholder="AB 1234 CD"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="vehicle">Mobil / Kendaraan</Label>
              <Input
                id="vehicle"
                value={vehicle}
                onChange={(e) => setVehicle(e.target.value)}
                placeholder="Toyota Avanza 2021"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ======================
// STEP 3: PEMBAYARAN
// ======================
function StepPembayaran({
  cart,
  subtotal,
  discount,
  setDiscount,
  discountVal,
  total,
  paymentType,
  setPaymentType,
  singleMethod,
  setSingleMethod,
  multiPayments,
  setMultiPayments,
  nominalBayar,
  setNominalBayar,
  nominalVal,
  sisa,
  isPiutang,
  note,
  setNote,
}: {
  cart: TransactionItem[]
  subtotal: number
  discount: number | ""
  setDiscount: (v: number | "") => void
  discountVal: number
  total: number
  paymentType: "penuh" | "campuran"
  setPaymentType: (v: "penuh" | "campuran") => void
  singleMethod: PaymentMethodType
  setSingleMethod: (v: PaymentMethodType) => void
  multiPayments: PaymentEntry[]
  setMultiPayments: (v: PaymentEntry[]) => void
  nominalBayar: number | ""
  setNominalBayar: (v: number | "") => void
  nominalVal: number
  sisa: number
  isPiutang: boolean
  note: string
  setNote: (v: string) => void
}) {
  return (
    <div className="flex flex-col gap-4">
      {/* Order Summary */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <ShoppingCart className="h-4 w-4" />
            Ringkasan Produk
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama</TableHead>
                  <TableHead className="text-center">Qty</TableHead>
                  <TableHead className="text-right">Harga</TableHead>
                  <TableHead className="text-right">Subtotal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cart.map((item, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="font-medium text-foreground">{item.name}</TableCell>
                    <TableCell className="text-center">{item.qty}</TableCell>
                    <TableCell className="text-right text-sm text-muted-foreground">{formatRupiah(item.price)}</TableCell>
                    <TableCell className="text-right font-semibold text-foreground">{formatRupiah(item.price * item.qty)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Payment Detail */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <CreditCard className="h-4 w-4" />
            Detail Pembayaran
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          {/* Subtotal & Discount */}
          <div className="flex flex-col gap-3 rounded-lg bg-muted p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium text-foreground">{formatRupiah(subtotal)}</span>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="discount" className="text-sm text-muted-foreground">
                Diskon
              </Label>
              <div className="flex items-center gap-0">
                <span className="flex h-9 items-center rounded-l-md border border-r-0 border-border bg-card px-3 text-sm text-muted-foreground">
                  Rp
                </span>
                <Input
                  id="discount"
                  type="number"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value ? Number(e.target.value) : "")}
                  placeholder="0"
                  className="h-9 rounded-l-none bg-card text-right text-sm"
                />
              </div>
            </div>
            {discountVal > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Potongan Diskon</span>
                <span className="font-medium text-destructive">- {formatRupiah(discountVal)}</span>
              </div>
            )}
            <Separator />
            <div className="flex items-center justify-between">
              <span className="font-heading text-sm font-bold text-foreground">Total</span>
              <span className="font-heading text-lg font-bold text-foreground">{formatRupiah(total)}</span>
            </div>
          </div>

          {/* Payment Method */}
          <div className="flex flex-col gap-3">
            <Label className="text-sm font-medium">Metode Pembayaran</Label>
            <RadioGroup
              value={paymentType}
              onValueChange={(v) => setPaymentType(v as "penuh" | "campuran")}
              className="flex gap-4"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="penuh" id="pm-penuh" />
                <Label htmlFor="pm-penuh" className="cursor-pointer text-sm">Penuh</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="campuran" id="pm-campuran" />
                <Label htmlFor="pm-campuran" className="cursor-pointer text-sm">Campuran (Multi Payment)</Label>
              </div>
            </RadioGroup>

            {paymentType === "penuh" ? (
              <Select value={singleMethod} onValueChange={(v) => setSingleMethod(v as PaymentMethodType)}>
                <SelectTrigger className="w-full sm:w-56">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tunai">Tunai</SelectItem>
                  <SelectItem value="qris">QRIS</SelectItem>
                  <SelectItem value="debit_kredit">Debit/Kredit</SelectItem>
                  <SelectItem value="piutang">Piutang</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <div className="flex flex-col gap-3 rounded-lg border border-border p-3">
                {multiPayments.map((mp, idx) => (
                  <div key={idx} className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <Label className="shrink-0 text-xs text-muted-foreground sm:w-20">
                      Metode {idx + 1}
                    </Label>
                    <Select
                      value={mp.method}
                      onValueChange={(v) => {
                        const updated = [...multiPayments]
                        updated[idx] = { ...updated[idx], method: v as PaymentMethodType }
                        setMultiPayments(updated)
                      }}
                    >
                      <SelectTrigger className="w-full sm:w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tunai">Tunai</SelectItem>
                        <SelectItem value="qris">QRIS</SelectItem>
                        <SelectItem value="debit_kredit">Debit/Kredit</SelectItem>
                        <SelectItem value="piutang">Piutang</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      type="number"
                      value={mp.amount || ""}
                      onChange={(e) => {
                        const updated = [...multiPayments]
                        updated[idx] = { ...updated[idx], amount: Number(e.target.value) }
                        setMultiPayments(updated)
                      }}
                      placeholder="Nominal"
                      className="h-9 text-right"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Nominal Bayar */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="nominal-bayar">Nominal Bayar</Label>
            <div className="flex items-center gap-0">
              <span className="flex h-10 items-center rounded-l-md border border-r-0 border-border bg-muted px-3 text-sm font-medium text-muted-foreground">
                Rp
              </span>
              <Input
                id="nominal-bayar"
                type="number"
                value={nominalBayar}
                onChange={(e) => setNominalBayar(e.target.value ? Number(e.target.value) : "")}
                placeholder="Masukkan nominal pembayaran"
                className="h-10 rounded-l-none text-right text-lg font-semibold"
              />
            </div>
          </div>

          {/* Piutang Warning */}
          {isPiutang && sisa > 0 && (
            <div className="flex items-start gap-3 rounded-lg border border-accent bg-accent/10 p-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
              <div>
                <p className="text-sm font-semibold text-foreground">Pembayaran kurang</p>
                <p className="text-sm text-muted-foreground">
                  Kekurangan: <span className="font-bold text-destructive">{formatRupiah(sisa)}</span> -- otomatis masuk sebagai piutang.
                </p>
              </div>
            </div>
          )}

          {/* Kembalian */}
          {nominalVal > 0 && sisa < 0 && (
            <div className="flex items-center justify-between rounded-lg bg-muted p-3">
              <span className="text-sm text-muted-foreground">Kembalian</span>
              <span className="font-heading text-lg font-bold text-foreground">{formatRupiah(Math.abs(sisa))}</span>
            </div>
          )}

          {/* Note */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="note">Catatan (opsional)</Label>
            <Textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Catatan tambahan..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
