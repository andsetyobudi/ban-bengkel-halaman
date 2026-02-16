"use client"

import { useState } from "react"
import {
  Search,
  ArrowLeftRight,
  Eye,
  CheckCircle2,
  Clock,
  PackageCheck,
  Store,
  CalendarIcon,
  Package,
  FileText,
  ArrowRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useOutlet, type Transfer, type TransferStatus } from "@/lib/outlet-context"
import { toast } from "sonner"

function getOutletName(id: string, outlets: { id: string; name: string }[]) {
  return outlets.find((o) => o.id === id)?.name ?? "-"
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })
}

function getStatusConfig(status: TransferStatus) {
  switch (status) {
    case "pending":
      return {
        label: "Menunggu",
        variant: "secondary" as const,
        className: "bg-amber-100 text-amber-800 hover:bg-amber-100",
        icon: Clock,
      }
    case "diterima":
      return {
        label: "Diterima",
        variant: "secondary" as const,
        className: "bg-blue-100 text-blue-800 hover:bg-blue-100",
        icon: PackageCheck,
      }
    case "selesai":
      return {
        label: "Selesai",
        variant: "secondary" as const,
        className: "bg-[hsl(142,70%,90%)] text-[hsl(142,70%,25%)] hover:bg-[hsl(142,70%,90%)]",
        icon: CheckCircle2,
      }
  }
}

export default function RiwayatTransferPage() {
  const { transfers, updateTransferStatus, selectedOutletId, isSuperAdmin, outlets, currentUser, setTransfers, setProducts } = useOutlet()

  const [search, setSearch] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("Semua")

  // Detail dialog
  const [detailOpen, setDetailOpen] = useState(false)
  const [selectedTransfer, setSelectedTransfer] = useState<Transfer | null>(null)

  // Confirm action dialog
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [confirmAction, setConfirmAction] = useState<{ transfer: Transfer; newStatus: TransferStatus } | null>(null)

  // Filter transfers based on outlet and search
  const filteredTransfers = transfers
    .filter((t) => {
      if (!isSuperAdmin) {
        return t.fromOutletId === selectedOutletId || t.toOutletId === selectedOutletId
      }
      if (selectedOutletId !== "all") {
        return t.fromOutletId === selectedOutletId || t.toOutletId === selectedOutletId
      }
      return true
    })
    .filter((t) => {
      if (filterStatus !== "Semua") return t.status === filterStatus
      return true
    })
    .filter((t) => {
      const q = search.toLowerCase()
      if (!q) return true
      return (
        t.id.toLowerCase().includes(q) ||
        getOutletName(t.fromOutletId, outlets).toLowerCase().includes(q) ||
        getOutletName(t.toOutletId, outlets).toLowerCase().includes(q) ||
        t.items.some(
          (i) =>
            i.productName.toLowerCase().includes(q) ||
            i.productCode.toLowerCase().includes(q)
        )
      )
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  const openDetail = (transfer: Transfer) => {
    setSelectedTransfer(transfer)
    setDetailOpen(true)
  }

  const openConfirm = (transfer: Transfer, newStatus: TransferStatus) => {
    setConfirmAction({ transfer, newStatus })
    setConfirmOpen(true)
  }

  const [updating, setUpdating] = useState(false)

  const handleConfirm = async () => {
    if (!confirmAction || !currentUser) return
    setUpdating(true)
    try {
      const res = await fetch(`/api/admin/transfer/${confirmAction.transfer.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: confirmAction.newStatus,
          userId: currentUser.id,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error ?? "Gagal mengubah status transfer.")
        setUpdating(false)
        return
      }
      updateTransferStatus(confirmAction.transfer.id, confirmAction.newStatus)
      toast.success("Status transfer berhasil diubah.")
      setConfirmOpen(false)
      setConfirmAction(null)
      if (selectedTransfer?.id === confirmAction.transfer.id) {
        setSelectedTransfer({ ...selectedTransfer, status: confirmAction.newStatus })
      }
      if (confirmAction.newStatus === "selesai") {
        fetch("/api/admin/initial-data")
          .then((r) => r.json())
          .then((refreshData) => {
            if (!refreshData.error) {
              if (Array.isArray(refreshData.transfers)) setTransfers(refreshData.transfers)
              if (Array.isArray(refreshData.products)) setProducts(refreshData.products)
            }
          })
          .catch(() => {})
      }
    } catch {
      toast.error("Koneksi gagal.")
    }
    setUpdating(false)
  }

  // Check if user is the destination outlet (can accept/complete)
  // Super admin hanya bisa melihat, tidak bisa melakukan aksi
  const canAct = (transfer: Transfer) => {
    if (isSuperAdmin) return false
    return transfer.toOutletId === selectedOutletId
  }

  const totalTransfers = filteredTransfers.length
  const pendingCount = filteredTransfers.filter((t) => t.status === "pending").length
  const diterimaCount = filteredTransfers.filter((t) => t.status === "diterima").length
  const selesaiCount = filteredTransfers.filter((t) => t.status === "selesai").length

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground">Riwayat Transfer</h1>
        <p className="text-sm text-muted-foreground">Lihat dan kelola semua transfer barang</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-3 pt-6">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <ArrowLeftRight className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Transfer</p>
              <p className="font-heading text-xl font-bold text-foreground">{totalTransfers}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 pt-6">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-100">
              <Clock className="h-5 w-5 text-amber-700" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Menunggu</p>
              <p className="font-heading text-xl font-bold text-foreground">{pendingCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 pt-6">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100">
              <PackageCheck className="h-5 w-5 text-blue-700" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Diterima</p>
              <p className="font-heading text-xl font-bold text-foreground">{diterimaCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 pt-6">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[hsl(142,70%,90%)]">
              <CheckCircle2 className="h-5 w-5 text-[hsl(142,70%,35%)]" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Selesai</p>
              <p className="font-heading text-xl font-bold text-foreground">{selesaiCount}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Cari ID, outlet, atau produk..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="Filter status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Semua">Semua Status</SelectItem>
            <SelectItem value="pending">Menunggu</SelectItem>
            <SelectItem value="diterima">Diterima</SelectItem>
            <SelectItem value="selesai">Selesai</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Transfer Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-28">ID</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Dari</TableHead>
                  <TableHead>Ke</TableHead>
                  <TableHead className="text-center">Produk</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="w-44 text-center">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransfers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-12 text-center text-muted-foreground">
                      Tidak ada transfer ditemukan.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTransfers.map((transfer) => {
                    const statusConfig = getStatusConfig(transfer.status)
                    const StatusIcon = statusConfig.icon
                    const totalQty = transfer.items.reduce((s, i) => s + i.qty, 0)
                    const isIncoming = transfer.toOutletId === selectedOutletId
                    return (
                      <TableRow key={transfer.id}>
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {transfer.id}
                        </TableCell>
                        <TableCell className="text-sm text-foreground">
                          {formatDate(transfer.date)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                            <Store className="h-3 w-3 shrink-0" />
                            <span className="truncate">{getOutletName(transfer.fromOutletId, outlets)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                            <Store className="h-3 w-3 shrink-0" />
                            <span className="truncate">{getOutletName(transfer.toOutletId, outlets)}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="text-sm text-muted-foreground">
                            {transfer.items.length} produk ({totalQty} unit)
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant={statusConfig.variant} className={statusConfig.className}>
                            <StatusIcon className="mr-1 h-3 w-3" />
                            {statusConfig.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openDetail(transfer)}
                              className="h-8 px-2 text-muted-foreground"
                            >
                              <Eye className="mr-1 h-3.5 w-3.5" />
                              Detail
                            </Button>
                            {transfer.status === "pending" && canAct(transfer) && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openConfirm(transfer, "diterima")}
                                className="h-8 px-2 text-blue-700 hover:bg-blue-50 hover:text-blue-800"
                              >
                                <PackageCheck className="mr-1 h-3.5 w-3.5" />
                                Terima
                              </Button>
                            )}
                            {transfer.status === "diterima" && canAct(transfer) && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openConfirm(transfer, "selesai")}
                                className="h-8 px-2 text-[hsl(142,70%,30%)] hover:bg-[hsl(142,70%,94%)] hover:text-[hsl(142,70%,25%)]"
                              >
                                <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                                Selesai
                              </Button>
                            )}
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

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-heading">
              Detail Transfer {selectedTransfer?.id}
            </DialogTitle>
            <DialogDescription>
              Informasi lengkap transfer barang
            </DialogDescription>
          </DialogHeader>
          {selectedTransfer && (
            <div className="flex flex-col gap-4">
              {/* Transfer info */}
              <div className="rounded-lg border bg-muted/30 p-4">
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex flex-1 flex-col items-center gap-1 text-center">
                      <Store className="h-5 w-5 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">Dari</p>
                      <p className="text-sm font-medium text-foreground">
                        {getOutletName(selectedTransfer.fromOutletId, outlets)}
                      </p>
                    </div>
                    <ArrowRight className="h-5 w-5 shrink-0 text-muted-foreground" />
                    <div className="flex flex-1 flex-col items-center gap-1 text-center">
                      <Store className="h-5 w-5 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">Ke</p>
                      <p className="text-sm font-medium text-foreground">
                        {getOutletName(selectedTransfer.toOutletId, outlets)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between border-t pt-3">
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <CalendarIcon className="h-3.5 w-3.5" />
                      {formatDate(selectedTransfer.date)}
                    </div>
                    {(() => {
                      const sc = getStatusConfig(selectedTransfer.status)
                      return (
                        <Badge variant={sc.variant} className={sc.className}>
                          <sc.icon className="mr-1 h-3 w-3" />
                          {sc.label}
                        </Badge>
                      )
                    })()}
                  </div>
                  {selectedTransfer.note && (
                    <div className="flex items-start gap-1.5 border-t pt-3 text-sm text-muted-foreground">
                      <FileText className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                      <span>{selectedTransfer.note}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Items - judul fixed, hanya isi tabel yang scroll */}
              <div>
                <p className="mb-2 flex items-center gap-1.5 text-sm font-medium text-foreground">
                  <Package className="h-4 w-4" />
                  Daftar Produk
                </p>
                <div className="rounded-lg border">
                  {/* Judul kolom: tabel header saja, tidak di dalam scroll */}
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-10 text-center">No</TableHead>
                        <TableHead>Produk</TableHead>
                        <TableHead>Kode</TableHead>
                        <TableHead className="text-center">Qty</TableHead>
                      </TableRow>
                    </TableHeader>
                  </Table>
                  {/* Isi: hanya tabel body, di dalam scroll */}
                  <div className="max-h-48 overflow-y-auto overflow-x-auto [&_table]:border-t-0">
                    <Table>
                      <TableBody>
                        {selectedTransfer.items.map((item, idx) => (
                          <TableRow key={item.productId}>
                            <TableCell className="w-10 text-center text-sm text-muted-foreground">
                              {idx + 1}
                            </TableCell>
                            <TableCell className="text-sm font-medium text-foreground">
                              {item.productName}
                            </TableCell>
                            <TableCell className="font-mono text-xs text-muted-foreground">
                              {item.productCode}
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge variant="secondary">{item.qty}</Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
                <p className="mt-2 text-right text-sm text-muted-foreground">
                  Total: {selectedTransfer.items.reduce((s, i) => s + i.qty, 0)} unit
                </p>
              </div>

              {/* Actions in detail */}
              {selectedTransfer.status === "pending" && canAct(selectedTransfer) && (
                <div className="flex justify-end border-t pt-3">
                  <Button
                    size="sm"
                    onClick={() => {
                      setDetailOpen(false)
                      openConfirm(selectedTransfer, "diterima")
                    }}
                    className="bg-blue-600 text-[hsl(0,0%,100%)] hover:bg-blue-700"
                  >
                    <PackageCheck className="mr-2 h-4 w-4" />
                    Terima Transfer
                  </Button>
                </div>
              )}
              {selectedTransfer.status === "diterima" && canAct(selectedTransfer) && (
                <div className="flex justify-end border-t pt-3">
                  <Button
                    size="sm"
                    onClick={() => {
                      setDetailOpen(false)
                      openConfirm(selectedTransfer, "selesai")
                    }}
                    className="bg-[hsl(142,70%,35%)] text-[hsl(0,0%,100%)] hover:bg-[hsl(142,70%,30%)]"
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Selesaikan Transfer
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Confirm Action Dialog */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-heading">
              {confirmAction?.newStatus === "diterima"
                ? "Konfirmasi Terima Transfer"
                : "Konfirmasi Selesaikan Transfer"}
            </DialogTitle>
            <DialogDescription>
              {confirmAction?.newStatus === "diterima"
                ? `Apakah Anda yakin ingin menerima transfer ${confirmAction?.transfer.id} dari ${getOutletName(confirmAction?.transfer.fromOutletId ?? "", outlets)}? Status akan berubah menjadi "Diterima".`
                : `Apakah Anda yakin ingin menyelesaikan transfer ${confirmAction?.transfer.id}? Status akan berubah menjadi "Selesai" dan tidak dapat diubah lagi.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)} disabled={updating}>
              Batal
            </Button>
            {confirmAction?.newStatus === "diterima" ? (
              <Button
                onClick={handleConfirm}
                disabled={updating}
                className="bg-blue-600 text-[hsl(0,0%,100%)] hover:bg-blue-700"
              >
                <PackageCheck className="mr-2 h-4 w-4" />
                {updating ? "Memproses..." : "Terima"}
              </Button>
            ) : (
              <Button
                onClick={handleConfirm}
                disabled={updating}
                className="bg-[hsl(142,70%,35%)] text-[hsl(0,0%,100%)] hover:bg-[hsl(142,70%,30%)]"
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                {updating ? "Memproses..." : "Selesai"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
