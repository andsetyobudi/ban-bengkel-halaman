"use client"

import { useState } from "react"
import { Search, Filter, Eye, Calendar, Store, CreditCard } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Separator } from "@/components/ui/separator"
import { useOutlet, outlets } from "@/lib/outlet-context"
import type { TransactionRecord, PaymentMethodType } from "@/lib/outlet-context"

const statusOptions = ["Semua", "Selesai", "Proses", "Batal"]

function formatRupiah(num: number) {
  return "Rp " + num.toLocaleString("id-ID")
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })
}

const PAYMENT_METHOD_LABELS: Record<PaymentMethodType, string> = {
  tunai: "Tunai",
  qris: "QRIS",
  debit_kredit: "Debit/Kredit",
  piutang: "Piutang",
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

export default function RiwayatTransaksiPage() {
  const { selectedOutletId, transactions } = useOutlet()
  const [search, setSearch] = useState("")
  const [filterStatus, setFilterStatus] = useState("Semua")
  const [detailOpen, setDetailOpen] = useState(false)
  const [selectedTx, setSelectedTx] = useState<TransactionRecord | null>(null)

  const outletFiltered = selectedOutletId === "all"
    ? transactions
    : transactions.filter((tx) => tx.outletId === selectedOutletId)

  const filtered = outletFiltered.filter((tx) => {
    const matchSearch =
      tx.customerName.toLowerCase().includes(search.toLowerCase()) ||
      tx.invoice.toLowerCase().includes(search.toLowerCase()) ||
      tx.nopol.toLowerCase().includes(search.toLowerCase()) ||
      tx.vehicle.toLowerCase().includes(search.toLowerCase())
    const matchStatus = filterStatus === "Semua" || tx.status === filterStatus
    return matchSearch && matchStatus
  })

  const totalRevenue = outletFiltered.filter((t) => t.status === "Selesai").reduce((s, t) => s + t.total, 0)
  const totalCount = outletFiltered.filter((t) => t.status === "Selesai").length
  const piutangCount = outletFiltered.filter((t) => t.isPiutang).length

  const outletLabel = selectedOutletId === "all"
    ? "Semua Outlet"
    : outlets.find((o) => o.id === selectedOutletId)?.name || ""

  const openDetail = (tx: TransactionRecord) => {
    setSelectedTx(tx)
    setDetailOpen(true)
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground">Riwayat Transaksi</h1>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Store className="h-3.5 w-3.5" />
          <span>{outletLabel}</span>
        </div>
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
            <p className="text-sm text-muted-foreground">Ada Piutang</p>
            <p className="font-heading text-2xl font-bold text-accent">{piutangCount}</p>
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
                placeholder="Cari pelanggan, invoice, nopol, atau kendaraan..."
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
                  <TableHead className="w-36">Invoice</TableHead>
                  <TableHead>Pelanggan</TableHead>
                  <TableHead>Nopol</TableHead>
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
                      <TableCell className="font-mono text-xs text-muted-foreground">{tx.invoice}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-foreground">{tx.customerName}</p>
                          {tx.isPiutang && (
                            <Badge variant="destructive" className="mt-0.5 text-[10px] px-1.5 py-0">
                              Piutang
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm text-muted-foreground">{tx.nopol}</TableCell>
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
                          aria-label={`Lihat detail ${tx.invoice}`}
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
            <DialogDescription>{selectedTx?.invoice}</DialogDescription>
          </DialogHeader>
          {selectedTx && (
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Pelanggan</p>
                  <p className="font-medium text-foreground">{selectedTx.customerName}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">WhatsApp</p>
                  <p className="font-medium text-foreground">{selectedTx.customerPhone || "-"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Nopol</p>
                  <p className="font-medium text-foreground">{selectedTx.nopol}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Kendaraan</p>
                  <p className="font-medium text-foreground">{selectedTx.vehicle || "-"}</p>
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

              <div className="flex flex-col gap-1.5 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="text-foreground">{formatRupiah(selectedTx.subtotal)}</span>
                </div>
                {selectedTx.discount > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Diskon</span>
                    <span className="text-destructive">-{formatRupiah(selectedTx.discount)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="font-heading font-bold text-foreground">Total</span>
                  <span className="font-heading text-lg font-bold text-foreground">{formatRupiah(selectedTx.total)}</span>
                </div>
              </div>

              <Separator />

              <div className="flex flex-col gap-1.5 text-sm">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-muted-foreground">Pembayaran</span>
                </div>
                {selectedTx.payments.map((p, i) => (
                  <div key={i} className="flex items-center justify-between pl-5">
                    <span className="text-muted-foreground">{PAYMENT_METHOD_LABELS[p.method]}</span>
                    <span className="font-medium text-foreground">{formatRupiah(p.amount)}</span>
                  </div>
                ))}
                {selectedTx.isPiutang && selectedTx.sisa > 0 && (
                  <div className="mt-1 flex items-center justify-between rounded bg-destructive/10 px-3 py-1.5">
                    <span className="text-sm font-medium text-destructive">Sisa Piutang</span>
                    <span className="text-sm font-bold text-destructive">{formatRupiah(selectedTx.sisa)}</span>
                  </div>
                )}
              </div>

              {selectedTx.note && (
                <>
                  <Separator />
                  <div className="text-sm">
                    <p className="text-muted-foreground">Catatan</p>
                    <p className="text-foreground">{selectedTx.note}</p>
                  </div>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
