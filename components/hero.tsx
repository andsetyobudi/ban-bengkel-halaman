import Image from "next/image"
import Link from "next/link"
import { ArrowRight, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

const WA_LINK = "https://wa.me/6281997936676"

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/hero-tire.jpg"
          alt="Interior bengkel ban profesional"
          fill
          sizes="100vw"
          className="object-cover brightness-[0.25]"
          priority
        />
        <div className="absolute inset-0 bg-[hsl(215,80%,12%)]/60" />
      </div>

      <div className="relative z-10 mx-auto flex max-w-7xl flex-col items-center px-6 py-28 text-center md:py-40">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[hsl(48,100%,54%)]/30 bg-[hsl(48,100%,54%)]/10 px-4 py-1.5">
          <span className="h-2 w-2 rounded-full bg-accent" />
          <span className="text-sm font-medium text-accent">Buka Setiap Hari 07:00 - 21:00</span>
        </div>

        <h1 className="font-heading max-w-3xl text-balance text-4xl font-bold leading-tight tracking-tight text-[hsl(0,0%,98%)] md:text-6xl md:leading-tight">
          Bengkel Ban Terpercaya di Yogyakarta
        </h1>

        <p className="mt-6 max-w-xl text-pretty text-lg leading-relaxed text-[hsl(210,15%,75%)]">
          Layanan tambal ban, ganti ban, spooring & balancing dengan peralatan modern dan teknisi berpengalaman di Jl. Ringroad Selatan, Bantul.
        </p>

        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
          <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90" asChild>
            <Link href="#layanan">
              Lihat Layanan
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button size="lg" className="bg-[hsl(142,70%,40%)] text-[hsl(0,0%,100%)] hover:bg-[hsl(142,70%,35%)]" asChild>
            <Link href={WA_LINK} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="mr-2 h-4 w-4" />
              Chat WhatsApp
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
