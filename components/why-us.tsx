import { Clock, Award, BadgeCheck, Banknote } from "lucide-react"

const reasons = [
  {
    icon: Clock,
    number: "1",
    title: "Layanan Cepat & Tepat",
    description:
      "Proses pengerjaan yang efisien tanpa mengorbankan kualitas. Rata-rata waktu tambal ban hanya 15 menit.",
  },
  {
    icon: Award,
    number: "2",
    title: "Teknisi Berpengalaman",
    description:
      "Tim teknisi kami sudah tersertifikasi dan berpengalaman lebih dari 10 tahun di bidang perawatan ban.",
  },
  {
    icon: BadgeCheck,
    number: "3",
    title: "Garansi Kualitas",
    description:
      "Setiap layanan kami bergaransi. Jika ada masalah dalam masa garansi, kami perbaiki tanpa biaya tambahan.",
  },
  {
    icon: Banknote,
    number: "4",
    title: "Harga Transparan",
    description:
      "Tidak ada biaya tersembunyi. Kami selalu memberikan estimasi harga sebelum pengerjaan dimulai.",
  },
]

export function WhyUs() {
  return (
    <section id="keunggulan" className="bg-primary py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-16 text-center">
          <span className="text-sm font-semibold uppercase tracking-widest text-accent">
            Mengapa Memilih Kami
          </span>
          <h2 className="font-heading mt-3 text-balance text-3xl font-bold tracking-tight text-primary-foreground md:text-4xl">
            Keunggulan Bengkel CarProBan
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-pretty leading-relaxed text-primary-foreground/70">
            Kami berkomitmen memberikan layanan terbaik dengan standar profesional untuk setiap kendaraan yang dipercayakan kepada kami.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {reasons.map((reason) => (
            <div
              key={reason.title}
              className="flex gap-6 rounded-xl border border-primary-foreground/10 bg-primary-foreground/5 p-8"
            >
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-accent text-2xl font-bold text-accent-foreground font-heading">
                {reason.number}
              </div>
              <div>
                <h3 className="font-heading text-lg font-semibold text-primary-foreground">
                  {reason.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-primary-foreground/70">
                  {reason.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
