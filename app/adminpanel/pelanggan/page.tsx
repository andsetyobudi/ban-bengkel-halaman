"use client"

import { useState } from "react"
import { Plus, Search, Pencil, Trash2, Users, Phone, Store } from "lucide-react"
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
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useOutlet } from "@/lib/outlet-context"
import type { CustomerItem } from "@/lib/outlet-context"

export default function PelangganPage() {
  const {
    customers,
    addCustomer,
    updateCustomer,
    removeCustomer,
    selectedOutletId,
    isSuperAdmin,
    outlets,
  } = useOutlet()

  const [search, setSearch] = useState("")

  // Dialog states
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<CustomerItem | null>(null)
  const [deletingItem, setDeletingItem] = useState<CustomerItem | null>(null)
  const [formName, setFormName] = useState("")
  const [formPhone, setFormPhone] = useState("")
  const [formOutletId, setFormOutletId] = useState("")

  // Filter customers by selected outlet (if not "all") and search
  const filteredCustomers = customers
    .filter((c) => {
      if (!isSuperAdmin) return c.outletId === selectedOutletId
      if (selectedOutletId !== "all") return c.outletId === selectedOutletId
      return true
    })
    .filter(
      (c) =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.phone.includes(search)
    )

  const openAdd = () => {
    setEditingItem(null)
    setFormName("")
    setFormPhone("")
    setFormOutletId(selectedOutletId !== "all" ? selectedOutletId : "")
    setDialogOpen(true)
  }

  const openEdit = (item: CustomerItem) => {
    setEditingItem(item)
    setFormName(item.name)
    setFormPhone(item.phone)
    setFormOutletId(item.outletId)
    setDialogOpen(true)
  }

  const openDelete = (item: CustomerItem) => {
    setDeletingItem(item)
    setDeleteDialogOpen(true)
  }

  const handleSave = () => {
    const trimmedName = formName.trim()
    const trimmedPhone = formPhone.trim()
    if (!trimmedName || !trimmedPhone || !formOutletId) return

    if (editingItem) {
      updateCustomer(editingItem.id, trimmedName, trimmedPhone, formOutletId)
    } else {
      addCustomer(trimmedName, trimmedPhone, formOutletId)
    }
    setDialogOpen(false)
    setFormName("")
    setFormPhone("")
    setFormOutletId("")
    setEditingItem(null)
  }

  const handleDelete = () => {
    if (!deletingItem) return
    removeCustomer(deletingItem.id)
    setDeleteDialogOpen(false)
    setDeletingItem(null)
  }

  const getOutletName = (outletId: string) => {
    const outlet = outlets.find((o) => o.id === outletId)
    return outlet?.name ?? "-"
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground">
          Data Pelanggan
        </h1>
        <p className="text-sm text-muted-foreground">
          Kelola data pelanggan toko Anda
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Pelanggan</p>
              <p className="font-heading text-2xl font-bold text-foreground">
                {filteredCustomers.length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Store className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Outlet Dipilih</p>
              <p className="font-heading text-lg font-bold text-foreground">
                {selectedOutletId === "all"
                  ? "Semua Outlet"
                  : getOutletName(selectedOutletId)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search + Add */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Cari nama atau nomor HP..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button onClick={openAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Pelanggan
        </Button>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-14 text-center">No</TableHead>
                  <TableHead>Nama Pelanggan</TableHead>
                  <TableHead>Nomor HP</TableHead>
                  <TableHead>Outlet</TableHead>
                  <TableHead className="w-24 text-center">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="py-12 text-center text-muted-foreground"
                    >
                      {search
                        ? "Tidak ada pelanggan ditemukan."
                        : 'Belum ada pelanggan. Klik "Tambah Pelanggan" untuk menambahkan.'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCustomers.map((item, index) => (
                    <TableRow key={item.id}>
                      <TableCell className="text-center text-sm text-muted-foreground">
                        {index + 1}
                      </TableCell>
                      <TableCell className="font-medium text-foreground">
                        {item.name}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <Phone className="h-3 w-3 shrink-0" />
                          {item.phone}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <Store className="h-3 w-3 shrink-0" />
                          {getOutletName(item.outletId)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => openEdit(item)}
                            className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                            aria-label={`Edit ${item.name}`}
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => openDelete(item)}
                            className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                            aria-label={`Hapus ${item.name}`}
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
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading">
              {editingItem ? "Edit Pelanggan" : "Tambah Pelanggan Baru"}
            </DialogTitle>
            <DialogDescription>
              {editingItem
                ? "Ubah data pelanggan di bawah ini."
                : "Masukkan data pelanggan baru."}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="customer-name">Nama Pelanggan</Label>
              <Input
                id="customer-name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Masukkan nama pelanggan"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="customer-phone">Nomor HP</Label>
              <Input
                id="customer-phone"
                value={formPhone}
                onChange={(e) => setFormPhone(e.target.value)}
                placeholder="08xxxxxxxxxx"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="customer-outlet">Outlet</Label>
              <Select
                value={formOutletId}
                onValueChange={(v) => setFormOutletId(v)}
              >
                <SelectTrigger id="customer-outlet">
                  <SelectValue placeholder="Pilih outlet" />
                </SelectTrigger>
                <SelectContent>
                  {outlets
                    .filter((o) => o.status === "active")
                    .map((o) => (
                      <SelectItem key={o.id} value={o.id}>
                        {o.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Batal
            </Button>
            <Button
              onClick={handleSave}
              disabled={!formName.trim() || !formPhone.trim() || !formOutletId}
            >
              {editingItem ? "Simpan Perubahan" : "Tambah Pelanggan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-heading">Hapus Pelanggan</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus{" "}
              <span className="font-medium text-foreground">
                {deletingItem?.name}
              </span>
              ? Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Batal
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
