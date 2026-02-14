const stats = [
  { number: "10+", label: "Tahun Pengalaman" },
  { number: "15.000+", label: "Pelanggan Puas" },
  { number: "50+", label: "Merek Ban Tersedia" },
  { number: "24 Jam", label: "Layanan Darurat" },
]

export function Stats() {
  return (
    <section className="border-b border-border bg-card">
      <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-border md:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="flex flex-col items-center px-6 py-10 text-center">
            <span className="font-heading text-3xl font-bold text-primary md:text-4xl">
              {stat.number}
            </span>
            <span className="mt-2 text-sm font-medium text-muted-foreground">
              {stat.label}
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}
