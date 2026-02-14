"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  MapPin,
  Phone,
  Store,
  Users,
  Shield,
  CheckCircle2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useOutlet, outlets as initialOutlets, adminUsers as initialAdminUsers, type Outlet, type AdminUser } from "@/lib/outlet-context"

export default function OutletManagementPage() {
  const { isSuperAdmin } = useOutlet()
  const router = useRouter()

  const [outletsList, setOutletsList] = useState<Outlet[]>(initialOutlets)
  const [adminUsersList, setAdminUsersList] = useState<AdminUser[]>(initialAdminUsers)
  const [search, setSearch] = useState("")

  // Outlet dialog
  const [outletDialogOpen, setOutletDialogOpen] = useState(false)
  const [editingOutlet, setEditingOutlet] = useState<Outlet | null>(null)
  const [outletForm, setOutletForm] = useState({ name: "", address: "", phone: "", status: "active" as "active" | "inactive" })

  // Admin dialog
  const [adminDialogOpen, setAdminDialogOpen] = useState(false)
  const [editingAdmin, setEditingAdmin] = useState<AdminUser | null>(null)
  const [adminForm, setAdminForm] = useState({ name: "", email: "", role: "outlet_admin" as "super_admin" | "outlet_admin", outletId: "" })

  // Delete dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletingItem, setDeletingItem] = useState<{ type: "outlet" | "admin"; id: string; name: string } | null>(null)

  if (!isSuperAdmin) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <Shield className="h-12 w-12 text-muted-foreground" />
        <div className="text-center">
          <h2 className="font-heading text-lg font-bold text-foreground">Akses Terbatas</h2>
          <p className="text-sm text-muted-foreground">Halaman ini hanya tersedia untuk Super Admin.</p>
        </div>
        <Button onClick={() => router.push("/admin")}>Kembali ke Dashboard</Button>
      </div>
    )
  }

  const filteredOutlets = outletsList.filter(
    (o) =>
      o.name.toLowerCase().includes(search.toLowerCase()) ||
      o.address.toLowerCase().includes(search.toLowerCase())
  )

  // Outlet CRUD
  const openAddOutlet = () => {
    setEditingOutlet(null)
    setOutletForm({ name: "", address: "", phone: "", status: "active" })
    setOutletDialogOpen(true)
  }

  const openEditOutlet = (outlet: Outlet) => {
    setEditingOutlet(outlet)
    setOutletForm({ name: outlet.name, address: outlet.address, phone: outlet.phone, status: outlet.status })
    setOutletDialogOpen(true)
  }

  const handleSaveOutlet = () => {
    if (!outletForm.name || !outletForm.address) return
    if (editingOutlet) {
      setOutletsList((prev) =>
        prev.map((o) => (o.id === editingOutlet.id ? { ...o, ...outletForm } : o))
      )
    } else {
      const newId = "OTL-" + String(outletsList.length + 1).padStart(3, "0")
      setOutletsList((prev) => [...prev, { id: newId, ...outletForm }])
    }
    setOutletDialogOpen(false)
  }

  // Admin CRUD
  const openAddAdmin = () => {
    setEditingAdmin(null)
    setAdminForm({ name: "", email: "", role: "outlet_admin", outletId: "" })
    setAdminDialogOpen(true)
  }

  const openEditAdmin = (admin: AdminUser) => {
    setEditingAdmin(admin)
    setAdminForm({ name: admin.name, email: admin.email, role: admin.role, outletId: admin.outletId || "" })
    setAdminDialogOpen(true)
  }

  const handleSaveAdmin = () => {
    if (!adminForm.name || !adminForm.email) return
    if (editingAdmin) {
      setAdminUsersList((prev) =>
        prev.map((a) =>
          a.id === editingAdmin.id
            ? { ...a, name: adminForm.name, email: adminForm.email, role: adminForm.role, outletId: adminForm.role === "outlet_admin" ? adminForm.outletId : undefined }
            : a
        )
      )
    } else {
      const newId = "USR-" + String(adminUsersList.length + 1).padStart(3, "0")
      setAdminUsersList((prev) => [
        ...prev,
        {
          id: newId,
          name: adminForm.name,
          email: adminForm.email,
          role: adminForm.role,
          outletId: adminForm.role === "outlet_admin" ? adminForm.outletId : undefined,
        },
      ])
    }
    setAdminDialogOpen(false)
  }

  // Delete
  const openDelete = (type: "outlet" | "admin", id: string, name: string) => {
    setDeletingItem({ type, id, name })
    setDeleteDialogOpen(true)
  }

  const handleDelete = () => {
    if (!deletingItem) return
    if (deletingItem.type === "outlet") {
      setOutletsList((prev) => prev.filter((o) => o.id !== deletingItem.id))
    } else {
      setAdminUsersList((prev) => prev.filter((a) => a.id !== deletingItem.id))
    }
    setDeleteDialogOpen(false)
    setDeletingItem(null)
  }

  const activeOutlets = outletsList.filter((o) => o.status === "active").length
  const totalAdmins = adminUsersList.length
  const superAdminCount = adminUsersList.filter((a) => a.role === "super_admin").length

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground">Kelola Outlet</h1>
        <p className="text-sm text-muted-foreground">Kelola semua outlet dan admin</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-3 pt-6">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <Store className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Outlet</p>
              <p className="font-heading text-xl font-bold text-foreground">{outletsList.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 pt-6">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[hsl(142,70%,90%)]">
              <CheckCircle2 className="h-5 w-5 text-[hsl(142,70%,35%)]" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Outlet Aktif</p>
              <p className="font-heading text-xl font-bold text-foreground">{activeOutlets}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 pt-6">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/20">
              <Users className="h-5 w-5 text-accent-foreground" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Admin</p>
              <p className="font-heading text-xl font-bold text-foreground">{totalAdmins}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 pt-6">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Super Admin</p>
              <p className="font-heading text-xl font-bold text-foreground">{superAdminCount}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Outlets Section */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="font-heading text-base">Daftar Outlet</CardTitle>
              <CardDescription>Semua outlet terdaftar</CardDescription>
            </div>
            <Button size="sm" onClick={openAddOutlet}>
              <Plus className="mr-2 h-4 w-4" />
              Tambah Outlet
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Cari outlet..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-24">ID</TableHead>
                  <TableHead>Nama Outlet</TableHead>
                  <TableHead>Alamat</TableHead>
                  <TableHead>Telepon</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-center">Admin</TableHead>
                  <TableHead className="w-24 text-center">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOutlets.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-12 text-center text-muted-foreground">
                      Tidak ada outlet ditemukan.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOutlets.map((outlet) => {
                    const assignedAdmins = adminUsersList.filter(
                      (a) => a.role === "outlet_admin" && a.outletId === outlet.id
                    )
                    return (
                      <TableRow key={outlet.id}>
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {outlet.id}
                        </TableCell>
                        <TableCell className="font-medium text-foreground">{outlet.name}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                            <MapPin className="h-3 w-3 shrink-0" />
                            <span className="truncate">{outlet.address}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                            <Phone className="h-3 w-3 shrink-0" />
                            {outlet.phone}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant={outlet.status === "active" ? "default" : "secondary"}
                            className={
                              outlet.status === "active"
                                ? "bg-[hsl(142,70%,40%)] text-[hsl(0,0%,100%)] hover:bg-[hsl(142,70%,35%)]"
                                : ""
                            }
                          >
                            {outlet.status === "active" ? "Aktif" : "Nonaktif"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="text-sm font-medium text-foreground">
                            {assignedAdmins.length}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => openEditOutlet(outlet)}
                              className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                              aria-label={`Edit ${outlet.name}`}
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => openDelete("outlet", outlet.id, outlet.name)}
                              className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                              aria-label={`Hapus ${outlet.name}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
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

      {/* Admin Users Section */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="font-heading text-base">Daftar Admin</CardTitle>
              <CardDescription>Semua pengguna admin sistem</CardDescription>
            </div>
            <Button size="sm" onClick={openAddAdmin}>
              <Plus className="mr-2 h-4 w-4" />
              Tambah Admin
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-24">ID</TableHead>
                  <TableHead>Nama</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead className="text-center">Role</TableHead>
                  <TableHead>Outlet</TableHead>
                  <TableHead className="w-24 text-center">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {adminUsersList.map((admin) => {
                  const assignedOutlet = outletsList.find((o) => o.id === admin.outletId)
                  return (
                    <TableRow key={admin.id}>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {admin.id}
                      </TableCell>
                      <TableCell className="font-medium text-foreground">{admin.name}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{admin.email}</TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant="secondary"
                          className={
                            admin.role === "super_admin"
                              ? "bg-primary/10 text-primary"
                              : "bg-accent/30 text-accent-foreground"
                          }
                        >
                          {admin.role === "super_admin" ? "Super Admin" : "Admin Outlet"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {assignedOutlet
                          ? assignedOutlet.name
                          : admin.role === "super_admin"
                          ? "Semua Outlet"
                          : "--"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => openEditAdmin(admin)}
                            className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                            aria-label={`Edit ${admin.name}`}
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => openDelete("admin", admin.id, admin.name)}
                            className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                            aria-label={`Hapus ${admin.name}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Outlet Add/Edit Dialog */}
      <Dialog open={outletDialogOpen} onOpenChange={setOutletDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-heading">
              {editingOutlet ? "Edit Outlet" : "Tambah Outlet Baru"}
            </DialogTitle>
            <DialogDescription>
              {editingOutlet ? "Ubah informasi outlet di bawah ini." : "Isi detail outlet baru di bawah ini."}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="outlet-name">Nama Outlet</Label>
              <Input
                id="outlet-name"
                value={outletForm.name}
                onChange={(e) => setOutletForm({ ...outletForm, name: e.target.value })}
                placeholder="Nama outlet baru"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="outlet-address">Alamat</Label>
              <Input
                id="outlet-address"
                value={outletForm.address}
                onChange={(e) => setOutletForm({ ...outletForm, address: e.target.value })}
                placeholder="Jl. Contoh No. 10"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="outlet-phone">Telepon</Label>
                <Input
                  id="outlet-phone"
                  value={outletForm.phone}
                  onChange={(e) => setOutletForm({ ...outletForm, phone: e.target.value })}
                  placeholder="0274-123456"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="outlet-status">Status</Label>
                <Select
                  value={outletForm.status}
                  onValueChange={(v) => setOutletForm({ ...outletForm, status: v as "active" | "inactive" })}
                >
                  <SelectTrigger id="outlet-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Aktif</SelectItem>
                    <SelectItem value="inactive">Nonaktif</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOutletDialogOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleSaveOutlet}>
              {editingOutlet ? "Simpan Perubahan" : "Tambah Outlet"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Admin Add/Edit Dialog */}
      <Dialog open={adminDialogOpen} onOpenChange={setAdminDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-heading">
              {editingAdmin ? "Edit Admin" : "Tambah Admin Baru"}
            </DialogTitle>
            <DialogDescription>
              {editingAdmin ? "Ubah informasi admin di bawah ini." : "Isi detail admin baru di bawah ini."}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="admin-name">Nama</Label>
              <Input
                id="admin-name"
                value={adminForm.name}
                onChange={(e) => setAdminForm({ ...adminForm, name: e.target.value })}
                placeholder="Nama admin"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="admin-email">Username</Label>
              <Input
                id="admin-email"
                type="text"
                value={adminForm.email}
                onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
                placeholder="admin.outlet"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="admin-role">Role</Label>
              <Select
                value={adminForm.role}
                onValueChange={(v) => setAdminForm({ ...adminForm, role: v as "super_admin" | "outlet_admin" })}
              >
                <SelectTrigger id="admin-role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="super_admin">Super Admin</SelectItem>
                  <SelectItem value="outlet_admin">Admin Outlet</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {adminForm.role === "outlet_admin" && (
              <div className="flex flex-col gap-2">
                <Label htmlFor="admin-outlet">Outlet</Label>
                <Select
                  value={adminForm.outletId}
                  onValueChange={(v) => setAdminForm({ ...adminForm, outletId: v })}
                >
                  <SelectTrigger id="admin-outlet">
                    <SelectValue placeholder="Pilih outlet" />
                  </SelectTrigger>
                  <SelectContent>
                    {outletsList
                      .filter((o) => o.status === "active")
                      .map((o) => (
                        <SelectItem key={o.id} value={o.id}>
                          {o.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAdminDialogOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleSaveAdmin}>
              {editingAdmin ? "Simpan Perubahan" : "Tambah Admin"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-heading">
              Hapus {deletingItem?.type === "outlet" ? "Outlet" : "Admin"}
            </DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus{" "}
              <span className="font-medium text-foreground">{deletingItem?.name}</span>? Tindakan
              ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
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
