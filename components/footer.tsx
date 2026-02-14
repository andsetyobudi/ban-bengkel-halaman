import Link from "next/link"

const footerLinks = {
  Layanan: [
    { label: "Tambal Ban", href: "#layanan" },
    { label: "Ganti Ban", href: "#layanan" },
    { label: "Spooring & Balancing", href: "#layanan" },
    { label: "Isi Nitrogen", href: "#layanan" },
    { label: "Layanan Darurat", href: "#layanan" },
  ],
  Perusahaan: [
    { label: "Tentang Kami", href: "#" },
    { label: "Karir", href: "#" },
    { label: "Blog", href: "#" },
    { label: "Kontak", href: "#kontak" },
  ],
  Informasi: [
    { label: "FAQ", href: "#" },
    { label: "Syarat & Ketentuan", href: "#" },
    { label: "Kebijakan Privasi", href: "#" },
  ],
}

export function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-12 md:grid-cols-4">
          <div>
            <Link href="#" className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <span className="text-lg font-bold text-primary-foreground">C</span>
              </div>
              <span className="font-heading text-xl font-bold tracking-tight text-card-foreground">
                CarProBan
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              Bengkel ban profesional terpercaya di Yogyakarta. Melayani dengan sepenuh hati untuk kenyamanan berkendara Anda.
            </p>
          </div>

          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="font-heading text-sm font-semibold text-card-foreground">
                {category}
              </h4>
              <ul className="mt-4 flex flex-col gap-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 md:flex-row">
          <p className="text-sm text-muted-foreground">
            {'© 2026 CarProBan. Semua hak dilindungi.'}
          </p>
          <p className="text-sm text-muted-foreground">
            Jl. Ringroad Selatan, Bantul, Yogyakarta
          </p>
        </div>
      </div>
    </footer>
  )
}
