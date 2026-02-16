"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Package,
  Receipt,
  LogOut,
  Home,
  X,
  User,
  Store,
  Shield,
  Building2,
  Tags,
  ArrowLeftRight,
  History,
  Printer,
  ShoppingCart,
  CreditCard,
  Users,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useOutlet, outlets } from "@/lib/outlet-context"

export function AdminSidebar({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const pathname = usePathname()
  const {
    currentUser,
    selectedOutletId,
    setSelectedOutletId,
    isSuperAdmin,
    availableOutlets,
    logout,
  } = useOutlet()

  const sidebarSections = [
    {
      title: null,
      links: [
        { label: "Ringkasan", href: "/admin", icon: LayoutDashboard },
      ],
    },
    {
      title: "Stok & Inventaris",
      links: [
        { label: "Daftar Produk", href: "/admin/produk", icon: Package },
        ...(!isSuperAdmin
          ? [{ label: "Transfer Barang", href: "/admin/transfer", icon: ArrowLeftRight }]
          : []),
        { label: "Riwayat Transfer", href: "/admin/transfer/riwayat", icon: History },
        { label: "Cetak Laporan", href: "/admin/laporan", icon: Printer },
      ],
    },
    {
      title: "Penjualan",
      links: [
        { label: "Transaksi Baru", href: "/admin/transaksi", icon: ShoppingCart },
        { label: "Riwayat Transaksi", href: "/admin/transaksi/riwayat", icon: Receipt },
        { label: "Manajemen Piutang", href: "/admin/piutang", icon: CreditCard },
        { label: "Data Pelanggan", href: "/admin/pelanggan", icon: Users },
      ],
    },
    ...(isSuperAdmin
      ? [
          {
            title: "Master Data",
            links: [
              { label: "Kelola Outlet", href: "/admin/outlets", icon: Building2 },
              { label: "Kategori & Merek", href: "/admin/kategori-merek", icon: Tags },
            ],
          },
        ]
      : []),
  ]

  const handleLogout = () => {
    logout()
    window.location.href = "/admin/login"
  }

  return (
    <>
      {/* Overlay for mobile */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-foreground/30 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed left-0 top-0 z-50 flex h-full w-64 flex-col border-r border-border bg-card transition-transform duration-200 lg:static lg:z-auto lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <Link href="/admin" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <span className="text-sm font-bold text-primary-foreground">C</span>
            </div>
            <div>
              <p className="font-heading text-sm font-bold text-foreground">CarProBan</p>
              <p className="text-xs text-muted-foreground">Admin Panel</p>
            </div>
          </Link>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-muted-foreground hover:text-foreground lg:hidden"
            aria-label="Tutup sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Outlet Switcher */}
        <div className="border-b border-border px-3 py-3">
          <p className="mb-1.5 px-1 text-xs font-medium text-muted-foreground">
            {isSuperAdmin ? "Pilih Outlet" : "Outlet Anda"}
          </p>
          {isSuperAdmin ? (
            <Select value={selectedOutletId} onValueChange={setSelectedOutletId}>
              <SelectTrigger className="w-full text-xs">
                <div className="flex items-center gap-2">
                  <Store className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  <SelectValue placeholder="Pilih outlet" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  <span className="font-medium">Semua Outlet</span>
                </SelectItem>
                {outlets
                  .filter((o) => o.status === "active")
                  .map((outlet) => (
                    <SelectItem key={outlet.id} value={outlet.id}>
                      {outlet.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          ) : (
            <div className="flex items-center gap-2 rounded-md bg-muted px-3 py-2">
              <Store className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              <span className="truncate text-xs font-medium text-foreground">
                {availableOutlets[0]?.name || "--"}
              </span>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <div className="flex flex-col gap-5">
            {sidebarSections.map((section, idx) => (
              <div key={section.title ?? idx}>
                {section.title && (
                  <p className="mb-1.5 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {section.title}
                  </p>
                )}
                <ul className="flex flex-col gap-0.5">
                  {section.links.map((link) => {
                    const isActive = pathname === link.href
                    return (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          onClick={onClose}
                          className={cn(
                            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                            isActive
                              ? "bg-primary text-primary-foreground"
                              : "text-muted-foreground hover:bg-muted hover:text-foreground"
                          )}
                        >
                          <link.icon className="h-4 w-4" />
                          {link.label}
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </div>
            ))}
          </div>
        </nav>

        {/* Footer: Admin info + actions */}
        <div className="border-t border-border px-3 py-4">
          {/* Active admin info */}
          <div className="mb-3 flex items-center gap-3 rounded-lg bg-muted px-3 py-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary">
              {isSuperAdmin ? (
                <Shield className="h-4 w-4 text-primary-foreground" />
              ) : (
                <User className="h-4 w-4 text-primary-foreground" />
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="truncate text-sm font-medium text-foreground">
                  {currentUser?.name || "Admin"}
                </p>
                <Badge
                  variant="secondary"
                  className={cn(
                    "shrink-0 px-1.5 py-0 text-[10px]",
                    isSuperAdmin
                      ? "bg-primary/10 text-primary"
                      : "bg-accent/30 text-accent-foreground"
                  )}
                >
                  {isSuperAdmin ? "Super" : "Outlet"}
                </Badge>
              </div>
              <p className="truncate text-xs text-muted-foreground">
                {currentUser?.email || "admin@carproban.com"}
              </p>
            </div>
          </div>

          <Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground" asChild>
            <Link href="/">
              <Home className="mr-3 h-4 w-4" />
              Halaman Utama
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={handleLogout}
          >
            <LogOut className="mr-3 h-4 w-4" />
            Keluar
          </Button>
        </div>
      </aside>
    </>
  )
}
