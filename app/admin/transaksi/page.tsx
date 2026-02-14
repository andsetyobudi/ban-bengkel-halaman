"use client"

import { useState } from "react"
import { Search, Filter, Eye, Calendar } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Separator } from "@/components/ui/separator"

type Transaction = {
  id: string
  customer: string
  phone: string
  items: { name: string; qty: number; price: number }[]
  total: number
  date: string
  status: "Selesai" | "Proses" | "Batal"
  paymentMethod: string
  vehicle: string
}

const transactions: Transaction[] = [
  {
    id: "TRX-001",
    customer: "Ahmad Rizky",
    phone: "0812-3456-7890",
    items: [{ name: "Bridgestone Ecopia EP150 195/65R15", qty: 2, price: 750000 }],
    total: 1500000,
    date: "2026-02-14",
    status: "Selesai",
    paymentMethod: "Transfer BCA",
    vehicle: "Toyota Avanza 2021",
  },
  {
    id: "TRX-002",
    customer: "Siti Nurhaliza",
    phone: "0856-1234-5678",
    items: [
      { name: "Tambal Ban Tubeless", qty: 1, price: 50000 },
      { name: "Balancing", qty: 1, price: 70000 },
    ],
    total: 120000,
    date: "2026-02-14",
    status: "Selesai",
    paymentMethod: "Tunai",
    vehicle: "Honda Jazz 2019",
  },
  {
    id: "TRX-003",
    customer: "Budi Santoso",
    phone: "0878-9012-3456",
    items: [{ name: "GT Radial Champiro Eco 205/55R16", qty: 4, price: 800000 }],
    total: 3200000,
    date: "2026-02-13",
    status: "Selesai",
    paymentMethod: "QRIS",
    vehicle: "Mitsubishi Xpander 2023",
  },
  {
    id: "TRX-004",
    customer: "Dewi Lestari",
    phone: "0813-5678-1234",
    items: [
      { name: "Spooring", qty: 1, price: 150000 },
      { name: "Balancing", qty: 4, price: 25000 },
    ],
    total: 250000,
    date: "2026-02-13",
    status: "Proses",
    paymentMethod: "Tunai",
    vehicle: "Suzuki Ertiga 2020",
  },
  {
    id: "TRX-005",
    customer: "Joko Prasetyo",
    phone: "0821-2345-6789",
    items: [{ name: "Dunlop Enasave EC300+ 185/70R14", qty: 2, price: 700000 }],
    total: 1400000,
    date: "2026-02-12",
    status: "Selesai",
    paymentMethod: "Transfer Mandiri",
    vehicle: "Daihatsu Xenia 2018",
  },
  {
    id: "TRX-006",
    customer: "Rina Wijaya",
    phone: "0857-6789-0123",
    items: [
      { name: "Hankook Kinergy EX 205/55R16", qty: 4, price: 720000 },
      { name: "Balancing", qty: 4, price: 25000 },
      { name: "Spooring", qty: 1, price: 150000 },
    ],
    total: 3030000,
    date: "2026-02-12",
    status: "Selesai",
    paymentMethod: "Transfer BRI",
    vehicle: "Toyota Innova 2022",
  },
  {
    id: "TRX-007",
    customer: "Agus Hermawan",
    phone: "0838-4567-8901",
    items: [{ name: "Isi Nitrogen 4 Ban", qty: 1, price: 40000 }],
    total: 40000,
    date: "2026-02-11",
    status: "Selesai",
    paymentMethod: "Tunai",
    vehicle: "Honda Brio 2020",
  },
  {
    id: "TRX-008",
    customer: "Putri Handayani",
    phone: "0819-0123-4567",
    items: [{ name: "IRC NR76 80/90-17 Tubeless", qty: 2, price: 165000 }],
    total: 330000,
    date: "2026-02-11",
    status: "Batal",
    paymentMethod: "-",
    vehicle: "Honda Vario 150",
  },
  {
    id: "TRX-009",
    customer: "Hendra Gunawan",
    phone: "0852-3456-7890",
    items: [
      { name: "Bridgestone Turanza T005A 215/60R17", qty: 4, price: 1250000 },
      { name: "Spooring", qty: 1, price: 150000 },
      { name: "Balancing", qty: 4, price: 25000 },
    ],
    total: 5250000,
    date: "2026-02-10",
    status: "Selesai",
    paymentMethod: "Transfer BCA",
    vehicle: "Toyota Fortuner 2023",
  },
  {
    id: "TRX-010",
    customer: "Lina Sari",
    phone: "0823-8901-2345",
    items: [
      { name: "Tambal Ban Tubeless", qty: 1, price: 50000 },
    ],
    total: 50000,
    date: "2026-02-10",
    status: "Selesai",
    paymentMethod: "Tunai",
    vehicle: "Honda HRV 2021",
  },
]

const statusOptions = ["Semua", "Selesai", "Proses", "Batal"]

function formatRupiah(num: number) {
  return "Rp " + num.toLocaleString("id-ID")
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })
}

function statusColor(status: string) {
  switch (status) {
    case "Selesai":
      return "bg-[hsl(142,70%,40%)] text-[hsl(0,0%,100%)] hover:bg-[hsl(142,70%,35%)]"
    case "Proses":
      return "bg-accent text-accent-foreground hover:bg-accent/80"
    case "Batal":
      return ""
    default:
      return ""
  }
}

export default function TransaksiPage() {
  const [search, setSearch] = useState("")
  const [filterStatus, setFilterStatus] = useState("Semua")
  const [detailOpen, setDetailOpen] = useState(false)
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null)

  const filtered = transactions.filter((tx) => {
    const matchSearch =
      tx.customer.toLowerCase().includes(search.toLowerCase()) ||
      tx.id.toLowerCase().includes(search.toLowerCase()) ||
      tx.vehicle.toLowerCase().includes(search.toLowerCase())
    const matchStatus = filterStatus === "Semua" || tx.status === filterStatus
    return matchSearch && matchStatus
  })

  const totalRevenue = transactions.filter((t) => t.status === "Selesai").reduce((s, t) => s + t.total, 0)
  const totalCount = transactions.filter((t) => t.status === "Selesai").length
  const pendingCount = transactions.filter((t) => t.status === "Proses").length

  const openDetail = (tx: Transaction) => {
    setSelectedTx(tx)
    setDetailOpen(true)
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground">Riwayat Transaksi</h1>
        <p className="text-sm text-muted-foreground">Lihat dan kelola semua transaksi CarProBan</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total Pendapatan</p>
            <p className="font-heading text-2xl font-bold text-foreground">{formatRupiah(totalRevenue)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Transaksi Selesai</p>
            <p className="font-heading text-2xl font-bold text-foreground">{totalCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Dalam Proses</p>
            <p className="font-heading text-2xl font-bold text-accent">{pendingCount}</p>
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
                placeholder="Cari nama pelanggan, ID, atau kendaraan..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-28">ID</TableHead>
                  <TableHead>Pelanggan</TableHead>
                  <TableHead>Kendaraan</TableHead>
                  <TableHead className="text-center">
                    <span className="flex items-center justify-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Tanggal
                    </span>
                  </TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="w-16 text-center">Detail</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-12 text-center text-muted-foreground">
                      Tidak ada transaksi ditemukan.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell className="font-mono text-xs text-muted-foreground">{tx.id}</TableCell>
                      <TableCell className="font-medium text-foreground">{tx.customer}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{tx.vehicle}</TableCell>
                      <TableCell className="text-center text-sm text-muted-foreground">{formatDate(tx.date)}</TableCell>
                      <TableCell className="text-right font-semibold text-foreground">{formatRupiah(tx.total)}</TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant={tx.status === "Batal" ? "destructive" : "default"}
                          className={statusColor(tx.status)}
                        >
                          {tx.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <button
                          onClick={() => openDetail(tx)}
                          className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                          aria-label={`Lihat detail ${tx.id}`}
                        >
                          <Eye className="h-4 w-4" />
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

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading">Detail Transaksi</DialogTitle>
            <DialogDescription>{selectedTx?.id}</DialogDescription>
          </DialogHeader>
          {selectedTx && (
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Pelanggan</p>
                  <p className="font-medium text-foreground">{selectedTx.customer}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Telepon</p>
                  <p className="font-medium text-foreground">{selectedTx.phone}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Kendaraan</p>
                  <p className="font-medium text-foreground">{selectedTx.vehicle}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Pembayaran</p>
                  <p className="font-medium text-foreground">{selectedTx.paymentMethod}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Tanggal</p>
                  <p className="font-medium text-foreground">{formatDate(selectedTx.date)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <Badge
                    variant={selectedTx.status === "Batal" ? "destructive" : "default"}
                    className={statusColor(selectedTx.status)}
                  >
                    {selectedTx.status}
                  </Badge>
                </div>
              </div>

              <Separator />

              <div>
                <p className="mb-2 text-sm font-medium text-foreground">Item</p>
                <div className="flex flex-col gap-2">
                  {selectedTx.items.map((item, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <div>
                        <p className="text-foreground">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{item.qty}x {formatRupiah(item.price)}</p>
                      </div>
                      <p className="font-medium text-foreground">{formatRupiah(item.qty * item.price)}</p>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <p className="font-heading text-sm font-bold text-foreground">Total</p>
                <p className="font-heading text-lg font-bold text-foreground">{formatRupiah(selectedTx.total)}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
