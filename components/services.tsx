import Image from "next/image"
import { Wrench, RotateCcw, CircleDot, Gauge, ShieldCheck, Truck } from "lucide-react"

const services = [
  {
    icon: Wrench,
    title: "Tambal Ban",
    description: "Tambal ban tubeless dan ban dalam dengan teknik panas maupun dingin. Cepat, rapi, dan tahan lama.",
  },
  {
    icon: RotateCcw,
    title: "Ganti Ban",
    description: "Penggantian ban dengan berbagai pilihan merek ternama. Konsultasi gratis untuk pemilihan ban terbaik.",
  },
  {
    icon: CircleDot,
    title: "Spooring & Balancing",
    description: "Pengaturan keselarasan roda dan balancing menggunakan mesin komputerisasi berteknologi tinggi.",
  },
  {
    icon: Gauge,
    title: "Isi Nitrogen",
    description: "Pengisian nitrogen untuk tekanan ban yang lebih stabil dan awet, meningkatkan kenyamanan berkendara.",
  },
  {
    icon: ShieldCheck,
    title: "Cek Kondisi Ban",
    description: "Pemeriksaan kondisi ban secara menyeluruh termasuk kedalaman alur, tekanan, dan keausan ban.",
  },
  {
    icon: Truck,
    title: "Layanan Darurat",
    description: "Panggilan darurat untuk ban bocor di jalan. Tim kami siap datang ke lokasi Anda kapan saja.",
  },
]

const serviceImages = [
  { src: "/images/service-repair.jpg", alt: "Proses tambal ban oleh teknisi ahli" },
  { src: "/images/service-balancing.jpg", alt: "Mesin balancing roda modern" },
  { src: "/images/service-replacement.jpg", alt: "Koleksi ban baru berkualitas" },
]

export function Services() {
  return (
    <section id="layanan" className="bg-background py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-16 text-center">
          <span className="text-sm font-semibold uppercase tracking-widest text-accent">
            Layanan Kami
          </span>
          <h2 className="font-heading mt-3 text-balance text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Solusi Lengkap untuk Ban Kendaraan Anda
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-pretty text-muted-foreground leading-relaxed">
            Kami menyediakan layanan bengkel ban terlengkap dengan peralatan modern dan teknisi bersertifikat untuk menjamin kualitas terbaik.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <div
              key={service.title}
              className="group rounded-xl border border-border bg-card p-8 transition-all hover:border-accent/40 hover:shadow-lg"
            >
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
                <service.icon className="h-6 w-6 text-accent" />
              </div>
              <h3 className="font-heading text-lg font-semibold text-card-foreground">
                {service.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {service.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-16">
          <h3 className="font-heading mb-8 text-center text-2xl font-bold text-foreground">
            Fasilitas Bengkel Kami
          </h3>
          <div className="grid gap-4 md:grid-cols-3">
            {serviceImages.map((img) => (
              <div key={img.src} className="group relative aspect-[4/3] overflow-hidden rounded-xl">
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
