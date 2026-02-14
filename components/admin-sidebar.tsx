"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Package, Receipt, LogOut, Home, X, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const sidebarLinks = [
  { label: "Ringkasan", href: "/admin", icon: LayoutDashboard },
  { label: "Produk", href: "/admin/produk", icon: Package },
  { label: "Transaksi", href: "/admin/transaksi", icon: Receipt },
]

export function AdminSidebar({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const pathname = usePathname()

  const handleLogout = () => {
    localStorage.removeItem("carproban_admin")
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

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4">
          <ul className="flex flex-col gap-1">
            {sidebarLinks.map((link) => {
              const isActive = pathname === link.href
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={onClose}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
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
        </nav>

        {/* Footer: Admin info + actions */}
        <div className="border-t border-border px-3 py-4">
          {/* Active admin info */}
          <div className="mb-3 flex items-center gap-3 rounded-lg bg-muted px-3 py-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary">
              <User className="h-4 w-4 text-primary-foreground" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground">Admin</p>
              <p className="truncate text-xs text-muted-foreground">admin@carproban.com</p>
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
