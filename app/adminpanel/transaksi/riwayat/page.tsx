"use client"

import { useState, useMemo, Fragment } from "react"
import { Search, Filter, Eye, Calendar, Store, CreditCard, Trash2, Printer, FileText, ReceiptText } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Separator } from "@/components/ui/separator"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import { useOutlet } from "@/lib/outlet-context"
import { usePrintNota } from "@/components/print-nota"
import type { TransactionRecord, PaymentMethodType } from "@/lib/outlet-context"

const statusOptions = ["Semua", "Lunas", "Kredit"]
const YEAR_RANGE = [2025, 2026, 2027, 2028, 2029, 2030]

const MONTH_NAMES = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
]

function formatRupiah(num: number) {
  if (num == null) return "Rp 0"
  return "Rp " + num.toLocaleString("id-ID")
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })
}

function formatDateLong(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
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
  const { selectedOutletId, outlets, transactions, removeTransaction, isSuperAdmin } = useOutlet()
  const [search, setSearch] = useState("")
  const [filterStatus, setFilterStatus] = useState("Semua")
  const [detailOpen, setDetailOpen] = useState(false)
  const [selectedTx, setSelectedTx] = useState<TransactionRecord | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deletingTx, setDeletingTx] = useState<TransactionRecord | null>(null)
  const { printNota } = usePrintNota()

  const now = new Date()
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth())
  const [selectedYear, setSelectedYear] = useState(now.getFullYear())



  // Filter by outlet
  const outletFiltered = useMemo(() =>
    selectedOutletId === "all"
      ? transactions
      : transactions.filter((tx) => tx.outletId === selectedOutletId),
    [transactions, selectedOutletId]
  )

  // Filter by month + year
  const monthYearFiltered = useMemo(() =>
    outletFiltered.filter((tx) => {
      const d = new Date(tx.date)
      return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear
    }),
    [outletFiltered, selectedMonth, selectedYear]
  )

  // Filter by search + status
  const filtered = useMemo(() =>
    monthYearFiltered.filter((tx) => {
      const matchSearch =
        tx.customerName.toLowerCase().includes(search.toLowerCase()) ||
        tx.invoice.toLowerCase().includes(search.toLowerCase()) ||
        tx.nopol.toLowerCase().includes(search.toLowerCase()) ||
        tx.vehicle.toLowerCase().includes(search.toLowerCase())
      const matchStatus =
        filterStatus === "Semua" ||
        (filterStatus === "Lunas" && !tx.isPiutang) ||
        (filterStatus === "Kredit" && tx.isPiutang)
      return matchSearch && matchStatus
    }),
    [monthYearFiltered, search, filterStatus]
  )

  // Stats for the selected month
  const totalRevenue = monthYearFiltered.filter((t) => t.status === "Selesai").reduce((s, t) => s + t.total, 0)
  const totalCount = monthYearFiltered.filter((t) => t.status === "Selesai").length
  const piutangCount = monthYearFiltered.filter((t) => t.isPiutang).length

  // Daily revenue breakdown (only Selesai)
  const dailyRevenue = useMemo(() => {
    const map = new Map<string, { date: string; total: number; count: number }>()
    monthYearFiltered
      .filter((t) => t.status === "Selesai")
      .forEach((t) => {
        const key = t.date
        const existing = map.get(key)
        if (existing) {
          existing.total += t.total
          existing.count += 1
        } else {
          map.set(key, { date: key, total: t.total, count: 1 })
        }
      })
    return Array.from(map.values()).sort((a, b) => b.date.localeCompare(a.date))
  }, [monthYearFiltered])

  // Group filtered transactions by date for inline daily subtotals
  const groupedByDate = useMemo(() => {
    const map = new Map<string, TransactionRecord[]>()
    filtered.forEach((tx) => {
      const key = tx.date
      const arr = map.get(key)
      if (arr) arr.push(tx)
      else map.set(key, [tx])
    })
    return Array.from(map.entries())
      .sort(([a], [b]) => b.localeCompare(a))
  }, [filtered])

  const outletLabel = selectedOutletId === "all"
    ? "Semua Outlet"
    : outlets.find((o) => o.id === selectedOutletId)?.name || ""

  const openDetail = (tx: TransactionRecord) => {
    setSelectedTx(tx)
    setDetailOpen(true)
  }

  const openDelete = (tx: TransactionRecord) => {
    setDeletingTx(tx)
    setDeleteOpen(true)
  }

  const handleDelete = () => {
    if (!deletingTx) return
    removeTransaction(deletingTx.id)
    toast.success("Transaksi berhasil dihapus", {
      description: `${deletingTx.invoice} - ${deletingTx.customerName}`,
    })
    setDeleteOpen(false)
    setDeletingTx(null)
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

      {/* Month/Year Filter */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Calendar className="h-4 w-4" />
            Periode
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Select
              value={String(selectedMonth)}
              onValueChange={(v) => setSelectedMonth(Number(v))}
            >
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Bulan" />
              </SelectTrigger>
              <SelectContent>
                {MONTH_NAMES.map((name, i) => (
                  <SelectItem key={i} value={String(i)}>{name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={String(selectedYear)}
              onValueChange={(v) => setSelectedYear(Number(v))}
            >
              <SelectTrigger className="w-full sm:w-32">
                <SelectValue placeholder="Tahun" />
              </SelectTrigger>
              <SelectContent>
                {YEAR_RANGE.map((y) => (
                  <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Stats Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">
              Total Pendapatan - {MONTH_NAMES[selectedMonth]}
            </p>
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

      {/* Search & Status Filter */}
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
                  {isSuperAdmin && <TableHead>Outlet</TableHead>}
                  {!isSuperAdmin && (
                    <TableHead className="text-center">
                      <span className="flex items-center justify-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Tanggal
                      </span>
                    </TableHead>
                  )}
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="w-32 text-center">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={isSuperAdmin ? 8 : 7} className="py-12 text-center text-muted-foreground">
                      Tidak ada transaksi ditemukan untuk {MONTH_NAMES[selectedMonth]} {selectedYear}.
                    </TableCell>
                  </TableRow>
                ) : (
                  groupedByDate.map(([date, txs]) => {
                    const dailyTotal = txs.filter((t) => t.status === "Selesai").reduce((s, t) => s + t.total, 0)
                    const dailyCount = txs.length
                    return (
                      <Fragment key={date}>
                        {/* Date header row */}
                        <TableRow className="bg-muted/50 hover:bg-muted/50">
                          <TableCell colSpan={isSuperAdmin ? 5 : 4} className="py-2.5">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                              <span className="text-sm font-semibold text-foreground">{formatDateLong(date)}</span>
                              <span className="text-xs text-muted-foreground">({dailyCount} transaksi)</span>
                            </div>
                          </TableCell>
                          <TableCell className="py-2.5 text-right">
                            <span className="text-sm font-bold text-foreground">{formatRupiah(dailyTotal)}</span>
                          </TableCell>
                          <TableCell colSpan={2} className="py-2.5" />
                        </TableRow>

                        {/* Transaction rows for this date */}
                        {txs.map((tx) => (
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
                            {isSuperAdmin && (
                              <TableCell className="text-sm text-muted-foreground">
                                {outlets.find((o) => o.id === tx.outletId)?.name || tx.outletId}
                              </TableCell>
                            )}
                            {!isSuperAdmin && (
                              <TableCell className="text-center text-sm text-muted-foreground">{formatDate(tx.date)}</TableCell>
                            )}
                            <TableCell className="text-right font-semibold text-foreground">{formatRupiah(tx.total)}</TableCell>
                            <TableCell className="text-center">
                              <Badge
                                variant={tx.status === "Batal" ? "destructive" : "default"}
                                className={statusColor(tx.status)}
                              >
                                {tx.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  onClick={() => openDetail(tx)}
                                  className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                                  aria-label={`Lihat detail ${tx.invoice}`}
                                >
                                  <Eye className="h-4 w-4" />
                                </button>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <button
                                      className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                                      aria-label={`Print nota ${tx.invoice}`}
                                    >
                                      <Printer className="h-4 w-4" />
                                    </button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="w-48">
                                    <DropdownMenuItem onClick={() => printNota(tx, "a4")}>
                                      <FileText className="mr-2 h-4 w-4" />
                                      Print A4
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => printNota(tx, "thermal")}>
                                      <ReceiptText className="mr-2 h-4 w-4" />
                                      Print Thermal 58mm
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                                {!isSuperAdmin && (
                                  <button
                                    onClick={() => openDelete(tx)}
                                    className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                                    aria-label={`Hapus transaksi ${tx.invoice}`}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </Fragment>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-5xl overflow-hidden max-h-[90vh] flex flex-col p-6">
          <DialogHeader>
            <DialogTitle className="font-heading">Detail Transaksi</DialogTitle>
            <DialogDescription>{selectedTx?.invoice}</DialogDescription>
          </DialogHeader>
          {selectedTx && (
            <div className="flex flex-col gap-6 overflow-hidden min-h-0 flex-1">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 min-h-0 flex-1">
                {/* Left Column: Info, Date, Status, Payment */}
                <div className="flex flex-col gap-4 overflow-y-auto pr-2">
                  <div className="rounded-lg border bg-muted/30 p-4">
                    <h4 className="mb-3 flex items-center gap-2 font-medium text-foreground">
                      <CreditCard className="h-4 w-4" />
                      Informasi
                    </h4>
                    <div className="flex flex-col gap-4 text-sm">
                      {/* Row 1: Customer & Phone */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-muted-foreground">Pelanggan</p>
                          <p className="font-medium text-foreground">{selectedTx.customerName}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">WhatsApp</p>
                          <p className="font-medium text-foreground">{selectedTx.customerPhone || "-"}</p>
                        </div>
                      </div>

                      {/* Row 2: Nopol & Vehicle */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-muted-foreground">Nopol</p>
                          <p className="font-medium text-foreground">{selectedTx.nopol}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Kendaraan</p>
                          <p className="font-medium text-foreground">{selectedTx.vehicle || "-"}</p>
                        </div>
                      </div>

                      <Separator />

                      {/* Date & Status */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-muted-foreground">Tanggal</p>
                          <p className="font-medium text-foreground">{formatDate(selectedTx.date)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Status</p>
                          <Badge
                            variant={selectedTx.status === "Batal" ? "destructive" : "default"}
                            className={statusColor(selectedTx.status) + " mt-1"}
                          >
                            {selectedTx.status}
                          </Badge>
                        </div>
                      </div>

                      <Separator />

                      {/* Payment & Notes */}
                      <div>
                        <p className="mb-2 font-medium text-foreground">Riwayat Pembayaran</p>
                        <div className="flex flex-col gap-2">
                          {selectedTx.payments.map((p, i) => (
                            <div key={i} className="flex justify-between">
                              <span className="text-muted-foreground">{PAYMENT_METHOD_LABELS[p.method]}</span>
                              <span className="font-medium">{formatRupiah(p.amount)}</span>
                            </div>
                          ))}
                          {selectedTx.isPiutang && selectedTx.sisa > 0 && (
                            <div className="mt-1 flex items-center justify-between rounded bg-destructive/10 px-3 py-2">
                              <span className="font-medium text-destructive">Sisa Piutang</span>
                              <span className="font-bold text-destructive">{formatRupiah(selectedTx.sisa)}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {selectedTx.note && (
                        <>
                          <Separator />
                          <div>
                            <p className="text-muted-foreground">Catatan</p>
                            <p className="text-foreground">{selectedTx.note}</p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Column: Items & Actions */}
                <div className="flex flex-col gap-4 overflow-hidden min-h-0 flex-1">
                  <div className="flex flex-1 flex-col rounded-lg border overflow-hidden min-h-0">
                    {/* Fixed Header */}
                    <Table>
                      <TableHeader className="bg-muted/50">
                        <TableRow>
                          <TableHead className="w-10 text-center">No</TableHead>
                          <TableHead>Produk</TableHead>
                          <TableHead className="text-right">Total</TableHead>
                        </TableRow>
                      </TableHeader>
                    </Table>
                    {/* Scrollable Body */}
                    <div className="flex-1 overflow-y-auto min-h-0 [&_table]:border-t-0">
                      <Table>
                        <TableBody>
                          {selectedTx.items.map((item, i) => (
                            <TableRow key={i}>
                              <TableCell className="w-10 text-center text-xs text-muted-foreground align-top py-2">
                                {i + 1}
                              </TableCell>
                              <TableCell className="py-2">
                                <div>
                                  <p className="text-sm font-medium text-foreground">{item.name}</p>
                                  <p className="text-xs text-muted-foreground">{item.qty}x {formatRupiah(item.price)}</p>
                                </div>
                              </TableCell>
                              <TableCell className="text-right font-medium text-foreground align-top py-2">
                                {formatRupiah(item.qty * item.price)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>

                  {/* Summary & Buttons */}
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2 rounded-lg border bg-muted/30 p-4 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span>{formatRupiah(selectedTx.subtotal)}</span>
                      </div>
                      {selectedTx.discount > 0 && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Diskon</span>
                          <span className="text-destructive">-{formatRupiah(selectedTx.discount)}</span>
                        </div>
                      )}
                      <Separator className="my-1" />
                      <div className="flex justify-between">
                        <span className="text-lg font-bold">Total</span>
                        <span className="text-lg font-bold">{formatRupiah(selectedTx.total)}</span>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        onClick={() => printNota(selectedTx, "a4")}
                      >
                        <FileText className="mr-2 h-4 w-4" />
                        Print A4
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => printNota(selectedTx, "thermal")}
                      >
                        <ReceiptText className="mr-2 h-4 w-4" />
                        Thermal
                      </Button>
                      <Button variant="default" onClick={() => setDetailOpen(false)}>
                        Tutup
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-heading">Hapus Transaksi</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus transaksi{" "}
              <span className="font-semibold text-foreground">{deletingTx?.invoice}</span> atas nama{" "}
              <span className="font-semibold text-foreground">{deletingTx?.customerName}</span>?
              Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
