import { Star } from "lucide-react"

const testimonials = [
  {
    name: "Ahmad Fauzi",
    role: "Pengemudi Ojek Online",
    content:
      "Sudah langganan di CarProBan lebih dari 3 tahun. Pelayanannya cepat dan harga terjangkau. Sangat cocok buat driver yang butuh layanan cepat.",
    rating: 5,
  },
  {
    name: "Siti Rahmawati",
    role: "Ibu Rumah Tangga",
    content:
      "Pertama kali ke bengkel ban yang menjelaskan dengan detail kondisi ban mobil saya. Teknisinya ramah dan profesional. Recommended!",
    rating: 5,
  },
  {
    name: "Budi Santoso",
    role: "Pengusaha Transportasi",
    content:
      "Kami percayakan seluruh armada truk kami ke CarProBan. Kualitas kerja konsisten dan selalu tepat waktu. Mitra bisnis yang bisa diandalkan.",
    rating: 5,
  },
]

export function Testimonials() {
  return (
    <section id="testimoni" className="bg-background py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-16 text-center">
          <span className="text-sm font-semibold uppercase tracking-widest text-accent">
            Testimoni
          </span>
          <h2 className="font-heading mt-3 text-balance text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Apa Kata Pelanggan Kami
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-pretty leading-relaxed text-muted-foreground">
            Kepercayaan pelanggan adalah kebanggaan kami. Berikut pengalaman mereka bersama CarProBan.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.name}
              className="flex flex-col rounded-xl border border-border bg-card p-8"
            >
              <div className="mb-4 flex gap-1">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star
                    key={i}
                    className="h-4 w-4 fill-accent text-accent"
                  />
                ))}
              </div>
              <p className="flex-1 text-sm leading-relaxed text-muted-foreground">
                {`"${testimonial.content}"`}
              </p>
              <div className="mt-6 border-t border-border pt-6">
                <p className="font-heading text-sm font-semibold text-card-foreground">
                  {testimonial.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {testimonial.role}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
