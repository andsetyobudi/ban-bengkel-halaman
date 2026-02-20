"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Plus, Search, Pencil, Trash2, Tag, Layers } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useOutlet } from "@/lib/outlet-context"
import type { BrandItem, CategoryItem } from "@/lib/outlet-context"

type ActiveTab = "kategori" | "merek"

export default function KategoriMerekPage() {
  const router = useRouter()
  const {
    isSuperAdmin,
    brands,
    addBrand,
    updateBrand,
    removeBrand,
    categories,
    addCategory,
    updateCategory,
    removeCategory,
  } = useOutlet()

  const [activeTab, setActiveTab] = useState<ActiveTab>("kategori")
  const [search, setSearch] = useState("")

  // Dialog states
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<BrandItem | CategoryItem | null>(null)
  const [deletingItem, setDeletingItem] = useState<BrandItem | CategoryItem | null>(null)
  const [formName, setFormName] = useState("")

  // Guard: redirect non-superadmin
  useEffect(() => {
    if (!isSuperAdmin) {
      router.replace("/adminpanel")
    }
  }, [isSuperAdmin, router])

  if (!isSuperAdmin) return null

  // Data based on active tab
  const items = activeTab === "kategori" ? categories : brands
  const filtered = items.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  )

  const openAdd = () => {
    setEditingItem(null)
    setFormName("")
    setDialogOpen(true)
  }

  const openEdit = (item: BrandItem | CategoryItem) => {
    setEditingItem(item)
    setFormName(item.name)
    setDialogOpen(true)
  }

  const openDelete = (item: BrandItem | CategoryItem) => {
    setDeletingItem(item)
    setDeleteDialogOpen(true)
  }

  const handleSave = () => {
    const trimmed = formName.trim()
    if (!trimmed) return

    if (editingItem) {
      if (activeTab === "kategori") {
        updateCategory(editingItem.id, trimmed)
      } else {
        updateBrand(editingItem.id, trimmed)
      }
    } else {
      if (activeTab === "kategori") {
        addCategory(trimmed)
      } else {
        addBrand(trimmed)
      }
    }
    setDialogOpen(false)
    setFormName("")
    setEditingItem(null)
  }

  const handleDelete = () => {
    if (!deletingItem) return
    if (activeTab === "kategori") {
      removeCategory(deletingItem.id)
    } else {
      removeBrand(deletingItem.id)
    }
    setDeleteDialogOpen(false)
    setDeletingItem(null)
  }

  const tabLabel = activeTab === "kategori" ? "Kategori" : "Merek"

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground">
          Kategori & Merek
        </h1>
        <p className="text-sm text-muted-foreground">
          Kelola kategori dan merek produk
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Layers className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Kategori</p>
              <p className="font-heading text-2xl font-bold text-foreground">
                {categories.length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Tag className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Merek</p>
              <p className="font-heading text-2xl font-bold text-foreground">
                {brands.length}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tab Switcher */}
      <div className="flex items-center gap-2 border-b border-border">
        <button
          onClick={() => {
            setActiveTab("kategori")
            setSearch("")
          }}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${activeTab === "kategori"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
        >
          <Layers className="h-4 w-4" />
          Kategori
          <Badge variant="secondary" className="ml-1 text-xs">
            {categories.length}
          </Badge>
        </button>
        <button
          onClick={() => {
            setActiveTab("merek")
            setSearch("")
          }}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${activeTab === "merek"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
        >
          <Tag className="h-4 w-4" />
          Merek
          <Badge variant="secondary" className="ml-1 text-xs">
            {brands.length}
          </Badge>
        </button>
      </div>

      {/* Search + Add */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={`Cari ${tabLabel.toLowerCase()}...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button onClick={openAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Tambah {tabLabel}
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
                  <TableHead>Nama {tabLabel}</TableHead>
                  <TableHead className="w-24 text-center">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      className="py-12 text-center text-muted-foreground"
                    >
                      {search
                        ? `Tidak ada ${tabLabel.toLowerCase()} ditemukan.`
                        : `Belum ada ${tabLabel.toLowerCase()}. Klik "Tambah ${tabLabel}" untuk menambahkan.`}
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((item, index) => (
                    <TableRow key={item.id}>
                      <TableCell className="text-center text-sm text-muted-foreground">
                        {index + 1}
                      </TableCell>
                      <TableCell className="font-medium text-foreground">
                        {item.name}
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
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-heading">
              {editingItem ? `Edit ${tabLabel}` : `Tambah ${tabLabel} Baru`}
            </DialogTitle>
            <DialogDescription>
              {editingItem
                ? `Ubah nama ${tabLabel.toLowerCase()} di bawah ini.`
                : `Masukkan nama ${tabLabel.toLowerCase()} baru.`}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="item-name">Nama {tabLabel}</Label>
              <Input
                id="item-name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder={
                  activeTab === "kategori" ? "Ban Mobil" : "Bridgestone"
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSave()
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleSave} disabled={!formName.trim()}>
              {editingItem ? "Simpan Perubahan" : `Tambah ${tabLabel}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-heading">
              Hapus {tabLabel}
            </DialogTitle>
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
