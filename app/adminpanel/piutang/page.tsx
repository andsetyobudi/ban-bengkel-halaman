"use client"

import { useState, useMemo } from "react"
import { Search, Receipt, AlertTriangle, CheckCircle2, CreditCard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
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
import { Badge } from "@/components/ui/badge"
import { useOutlet } from "@/lib/outlet-context"
import type { PiutangItem } from "@/lib/outlet-context"

function formatCurrency(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

export default function PiutangPage() {
  const { piutang, lunaskanPiutang, selectedOutletId, isSuperAdmin, outlets } = useOutlet()

  const [search, setSearch] = useState("")
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<PiutangItem | null>(null)

  // Filter by outlet
  const outletFiltered = useMemo(() => {
    return piutang.filter((p) => {
      if (!isSuperAdmin) return p.outletId === selectedOutletId
      if (selectedOutletId !== "all") return p.outletId === selectedOutletId
      return true
    })
  }, [piutang, selectedOutletId, isSuperAdmin])

  // Filter by search
  const filteredPiutang = useMemo(() => {
    if (!search.trim()) return outletFiltered
    const q = search.toLowerCase()
    return outletFiltered.filter(
      (p) =>
        p.invoice.toLowerCase().includes(q) ||
        p.customerName.toLowerCase().includes(q) ||
        p.nopol.toLowerCase().includes(q)
    )
  }, [outletFiltered, search])

  // Stats
  const totalPiutang = outletFiltered
    .filter((p) => p.status === "belum_lunas")
    .reduce((sum, p) => sum + (p.total - p.paid), 0)
  const countBelumLunas = outletFiltered.filter((p) => p.status === "belum_lunas").length
  const countLunas = outletFiltered.filter((p) => p.status === "lunas").length

  const getOutletName = (outletId: string) => {
    return outlets.find((o) => o.id === outletId)?.name ?? "-"
  }

  const handleOpenConfirm = (item: PiutangItem) => {
    setSelectedItem(item)
    setConfirmOpen(true)
  }

  const handleLunaskan = () => {
    if (!selectedItem) return
    lunaskanPiutang(selectedItem.id)
    setConfirmOpen(false)
    setSelectedItem(null)
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground">
          Manajemen Piutang
        </h1>
        <p className="text-sm text-muted-foreground">
          Kelola piutang pelanggan dan pelunasan tagihan
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Piutang</p>
              <p className="font-heading text-xl font-bold text-destructive">
                {formatCurrency(totalPiutang)}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
              <CreditCard className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Belum Lunas</p>
              <p className="font-heading text-2xl font-bold text-foreground">
                {countBelumLunas}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Lunas</p>
              <p className="font-heading text-2xl font-bold text-foreground">
                {countLunas}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Cari invoice, pelanggan, atau nopol..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-14 text-center">No</TableHead>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Pelanggan</TableHead>
                  <TableHead>Nopol</TableHead>
                  {isSuperAdmin && selectedOutletId === "all" && (
                    <TableHead>Outlet</TableHead>
                  )}
                  <TableHead className="text-right">Total Tagihan</TableHead>
                  <TableHead className="text-right">Sudah Dibayar</TableHead>
                  <TableHead className="text-right">Kekurangan</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  {!isSuperAdmin && <TableHead className="w-28 text-center">Aksi</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPiutang.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={isSuperAdmin && selectedOutletId === "all" ? 11 : 10}
                      className="py-12 text-center text-muted-foreground"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <Receipt className="h-8 w-8 text-muted-foreground/50" />
                        <p>
                          {search
                            ? "Tidak ada data piutang ditemukan."
                            : "Belum ada data piutang."}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPiutang.map((item, index) => {
                    const kekurangan = item.total - item.paid
                    const isLunas = item.status === "lunas"

                    return (
                      <TableRow key={item.id}>
                        <TableCell className="text-center text-sm text-muted-foreground">
                          {index + 1}
                        </TableCell>
                        <TableCell className="font-mono text-sm font-medium text-foreground">
                          {item.invoice}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(item.date)}
                        </TableCell>
                        <TableCell className="font-medium text-foreground">
                          {item.customerName}
                        </TableCell>
                        <TableCell className="font-mono text-sm text-muted-foreground">
                          {item.nopol}
                        </TableCell>
                        {isSuperAdmin && selectedOutletId === "all" && (
                          <TableCell className="text-sm text-muted-foreground">
                            {getOutletName(item.outletId)}
                          </TableCell>
                        )}
                        <TableCell className="text-right font-mono text-sm text-foreground">
                          {formatCurrency(item.total)}
                        </TableCell>
                        <TableCell className="text-right font-mono text-sm text-emerald-600">
                          {formatCurrency(item.paid)}
                        </TableCell>
                        <TableCell className="text-right font-mono text-sm">
                          <span className={isLunas ? "text-muted-foreground" : "font-semibold text-destructive"}>
                            {formatCurrency(kekurangan)}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant={isLunas ? "default" : "destructive"}
                            className={
                              isLunas
                                ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
                                : ""
                            }
                          >
                            {isLunas ? "Lunas" : "Belum Lunas"}
                          </Badge>
                        </TableCell>
                        {!isSuperAdmin && (
                          <TableCell className="text-center">
                            {!isLunas ? (
                              <Button
                                size="sm"
                                variant="outline"
                                className="gap-1.5 border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800"
                                onClick={() => handleOpenConfirm(item)}
                              >
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                Lunaskan
                              </Button>
                            ) : (
                              <span className="text-xs text-muted-foreground">-</span>
                            )}
                          </TableCell>
                        )}
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Confirm Lunaskan Dialog */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading">Konfirmasi Pelunasan</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin melunaskan piutang berikut?
            </DialogDescription>
          </DialogHeader>
          {selectedItem && (
            <div className="flex flex-col gap-3 rounded-lg border border-border bg-muted/30 p-4">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Invoice</span>
                <span className="font-mono text-sm font-medium text-foreground">{selectedItem.invoice}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Pelanggan</span>
                <span className="text-sm font-medium text-foreground">{selectedItem.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Nopol</span>
                <span className="font-mono text-sm text-foreground">{selectedItem.nopol}</span>
              </div>
              <div className="my-1 border-t border-border" />
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Total Tagihan</span>
                <span className="font-mono text-sm text-foreground">{formatCurrency(selectedItem.total)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Sudah Dibayar</span>
                <span className="font-mono text-sm text-emerald-600">{formatCurrency(selectedItem.paid)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-muted-foreground">Kekurangan</span>
                <span className="font-mono text-sm font-bold text-destructive">
                  {formatCurrency(selectedItem.total - selectedItem.paid)}
                </span>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Batal
            </Button>
            <Button
              className="gap-1.5 bg-emerald-600 hover:bg-emerald-700"
              onClick={handleLunaskan}
            >
              <CheckCircle2 className="h-4 w-4" />
              Lunaskan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
