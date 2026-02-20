"use client"

import { useEffect, useState } from "react"
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
import { useOutlet } from "@/lib/outlet-context"

export function AdminSidebar({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)
  const {
    currentUser,
    selectedOutletId,
    setSelectedOutletId,
    isSuperAdmin,
    availableOutlets,
    outlets,
    logout,
  } = useOutlet()

  useEffect(() => setMounted(true), [])

  const showSuperAdminUI = mounted && isSuperAdmin
  const sidebarSections = [
    {
      title: null,
      links: [
        { label: "Ringkasan", href: "/adminpanel", icon: LayoutDashboard },
      ],
    },
    {
      title: "Stok & Inventaris",
      links: [
        { label: "Daftar Produk", href: "/adminpanel/produk", icon: Package },
        ...(!showSuperAdminUI
          ? [{ label: "Transfer Barang", href: "/adminpanel/transfer", icon: ArrowLeftRight }]
          : []),
        { label: "Riwayat Transfer", href: "/adminpanel/transfer/riwayat", icon: History },
        { label: "Cetak Laporan", href: "/adminpanel/laporan", icon: Printer },
      ],
    },
    {
      title: "Penjualan",
      links: [
        ...(!showSuperAdminUI
          ? [{ label: "Transaksi Baru", href: "/adminpanel/transaksi", icon: ShoppingCart }]
          : []),
        { label: "Riwayat Transaksi", href: "/adminpanel/transaksi/riwayat", icon: Receipt },
        { label: "Manajemen Piutang", href: "/adminpanel/piutang", icon: CreditCard },
        { label: "Data Pelanggan", href: "/adminpanel/pelanggan", icon: Users },
      ],
    },
    ...(showSuperAdminUI
      ? [
        {
          title: "Master Data",
          links: [
            { label: "Kelola Outlet", href: "/adminpanel/outlets", icon: Building2 },
            { label: "Kategori & Merek", href: "/adminpanel/kategori-merek", icon: Tags },
          ],
        },
      ]
      : []),
  ]

  const handleLogout = () => {
    logout()
    window.location.href = "/adminpanel/login"
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
        {/* Header: Admin Info */}
        <div className="border-b border-border p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary">
                {showSuperAdminUI ? (
                  <Shield className="h-4 w-4 text-primary-foreground" />
                ) : (
                  <User className="h-4 w-4 text-primary-foreground" />
                )}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground leading-tight">
                  {mounted ? (currentUser?.name || "Admin") : "Admin"}
                </p>
                <p className="truncate text-xs text-muted-foreground mt-0.5">
                  {mounted ? (currentUser?.email || "admin@carproban.com") : "admin@carproban.com"}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="shrink-0 rounded-md p-1 text-muted-foreground hover:text-foreground lg:hidden"
              aria-label="Tutup sidebar"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="mt-2.5 flex items-center justify-between">
            <Badge
              variant="secondary"
              className={cn(
                "text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5",
                showSuperAdminUI
                  ? "bg-primary/10 text-primary"
                  : "bg-accent/30 text-accent-foreground"
              )}
            >
              {showSuperAdminUI ? "Super Admin" : "Admin Outlet"}
            </Badge>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" />
              Keluar
            </button>
          </div>
        </div>

        {/* Outlet Switcher */}
        <div className="border-b border-border px-4 py-3">
          <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            {showSuperAdminUI ? "Pilih Outlet" : "Outlet Anda"}
          </p>
          {showSuperAdminUI ? (
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
                {mounted ? (availableOutlets[0]?.name || "--") : "--"}
              </span>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 py-3">
          <div className="flex flex-col gap-4">
            {sidebarSections.map((section, idx) => (
              <div key={section.title ?? idx}>
                {section.title && (
                  <p className="mb-1 px-3 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
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
      </aside>
    </>
  )
}
