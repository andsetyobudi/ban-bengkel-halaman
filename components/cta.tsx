import Link from "next/link"
import { MessageCircle, MapPin, Clock, Mail, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

const WA_LINK = "https://wa.me/6281997936676"

export function CTA() {
  return (
    <section id="kontak" className="bg-primary py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col items-center gap-12 lg:flex-row lg:justify-between">
          <div className="max-w-lg text-center lg:text-left">
            <h2 className="font-heading text-balance text-3xl font-bold tracking-tight text-primary-foreground md:text-4xl">
              Siap Melayani Kendaraan Anda
            </h2>
            <p className="mt-4 text-pretty leading-relaxed text-primary-foreground/70">
              Kunjungi bengkel kami atau hubungi via WhatsApp untuk layanan cepat. Tim CarProBan siap membantu Anda kapan saja.
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center lg:justify-start">
              <Button
                size="lg"
                className="bg-[hsl(142,70%,40%)] text-[hsl(0,0%,100%)] hover:bg-[hsl(142,70%,35%)]"
                asChild
              >
                <Link href={WA_LINK} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Chat WhatsApp
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10"
                asChild
              >
                <Link href="https://maps.google.com/?q=Jl.+Ringroad+Selatan+Bantul+Yogyakarta" target="_blank" rel="noopener noreferrer">
                  Lihat di Peta
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>

          <div className="grid w-full max-w-sm gap-4">
            <div className="flex items-start gap-4 rounded-xl bg-primary-foreground/10 p-6">
              <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-primary-foreground" />
              <div>
                <p className="text-sm font-semibold text-primary-foreground">Alamat</p>
                <p className="mt-1 text-sm leading-relaxed text-primary-foreground/70">
                  Jl. Ringroad Selatan, Bantul, Yogyakarta
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4 rounded-xl bg-primary-foreground/10 p-6">
              <MessageCircle className="mt-0.5 h-5 w-5 shrink-0 text-primary-foreground" />
              <div>
                <p className="text-sm font-semibold text-primary-foreground">WhatsApp</p>
                <Link href={WA_LINK} target="_blank" rel="noopener noreferrer" className="mt-1 block text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                  0819-9793-6676
                </Link>
              </div>
            </div>
            <div className="flex items-start gap-4 rounded-xl bg-primary-foreground/10 p-6">
              <Mail className="mt-0.5 h-5 w-5 shrink-0 text-primary-foreground" />
              <div>
                <p className="text-sm font-semibold text-primary-foreground">Email</p>
                <Link href="mailto:carproban@gmail.com" className="mt-1 block text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                  carproban@gmail.com
                </Link>
              </div>
            </div>
            <div className="flex items-start gap-4 rounded-xl bg-primary-foreground/10 p-6">
              <Clock className="mt-0.5 h-5 w-5 shrink-0 text-primary-foreground" />
              <div>
                <p className="text-sm font-semibold text-primary-foreground">Jam Operasional</p>
                <p className="mt-1 text-sm text-primary-foreground/70">
                  Setiap Hari, 07:00 - 21:00
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
