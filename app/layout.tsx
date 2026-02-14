import type { Metadata, Viewport } from 'next'
import { Inter, Space_Grotesk } from 'next/font/google'

import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-space-grotesk' })

export const metadata: Metadata = {
  title: 'CarProBan - Bengkel Ban Profesional Yogyakarta',
  description: 'Bengkel ban terpercaya di Jl. Ringroad Selatan, Bantul, Yogyakarta. Tambal ban, ganti ban, spooring, balancing, dan penjualan ban berkualitas.',
}

export const viewport: Viewport = {
  themeColor: '#0d2b5a',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="id">
      <body className={`${inter.variable} ${spaceGrotesk.variable} font-sans antialiased`}>{children}</body>
    </html>
  )
}
