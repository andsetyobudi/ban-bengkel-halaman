"use client"

import { useState, useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Menu } from "lucide-react"
import { AdminSidebar } from "@/components/admin-sidebar"
import { OutletProvider } from "@/lib/outlet-context"

function AdminLayoutInner({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  const isLoginPage = pathname === "/admin/login"

  useEffect(() => {
    if (!isLoginPage) {
      const isAdmin = localStorage.getItem("carproban_admin")
      if (!isAdmin) {
        router.push("/admin/login")
      }
    }
  }, [isLoginPage, router])

  if (isLoginPage) {
    return <>{children}</>
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="flex-1 overflow-y-auto">
        {/* Mobile menu button */}
        <div className="sticky top-0 z-30 flex items-center bg-background/80 px-4 py-3 backdrop-blur-sm lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg border border-border bg-card p-2 text-muted-foreground hover:text-foreground"
            aria-label="Buka menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
        <div className="p-4 pt-0 lg:p-6">
          {children}
        </div>
      </main>
    </div>
  )
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <OutletProvider>
      <AdminLayoutInner>{children}</AdminLayoutInner>
    </OutletProvider>
  )
}
