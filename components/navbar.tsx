"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X, MessageCircle, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"

const WA_LINK = "https://wa.me/6281997936676"

const navLinks = [
  { label: "Beranda", href: "#" },
  { label: "Layanan", href: "#layanan" },
  { label: "Keunggulan", href: "#keunggulan" },
  { label: "Testimoni", href: "#testimoni" },
  { label: "Kontak", href: "#kontak" },
]

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="#" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <span className="text-lg font-bold text-primary-foreground">C</span>
          </div>
          <span className="font-heading text-xl font-bold tracking-tight text-foreground">
            CarProBan
          </span>
        </Link>

        <ul className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <li key={link.label}>
              <Link
                href={link.href}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-3 md:flex">
          <Button size="sm" className="bg-[hsl(142,70%,40%)] text-[hsl(0,0%,100%)] hover:bg-[hsl(142,70%,35%)]" asChild>
            <Link href={WA_LINK} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="mr-2 h-4 w-4" />
              WhatsApp
            </Link>
          </Button>
          <Button size="sm" variant="outline" asChild>
            <Link href="/admin/login">
              <Lock className="mr-2 h-4 w-4" />
              Admin
            </Link>
          </Button>
        </div>

        <button
          className="flex items-center justify-center rounded-md p-2 text-foreground md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? "Tutup menu" : "Buka menu"}
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {mobileOpen && (
        <div className="border-t border-border bg-background px-6 pb-6 md:hidden">
          <ul className="flex flex-col gap-4 pt-4">
            {navLinks.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex flex-col gap-2">
            <Button size="sm" className="w-full bg-[hsl(142,70%,40%)] text-[hsl(0,0%,100%)] hover:bg-[hsl(142,70%,35%)]" asChild>
              <Link href={WA_LINK} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="mr-2 h-4 w-4" />
                WhatsApp
              </Link>
            </Button>
            <Button size="sm" variant="outline" className="w-full" asChild>
              <Link href="/admin/login">
                <Lock className="mr-2 h-4 w-4" />
                Admin
              </Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  )
}
