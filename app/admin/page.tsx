"use client"

import { DollarSign, Package, Receipt, TrendingUp, ArrowUpRight, ArrowDownRight } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const summaryCards = [
  {
    title: "Total Pendapatan",
    value: "Rp 47.850.000",
    change: "+12.5%",
    trend: "up" as const,
    description: "dari bulan lalu",
    icon: DollarSign,
  },
  {
    title: "Total Produk",
    value: "128",
    change: "+8",
    trend: "up" as const,
    description: "produk baru bulan ini",
    icon: Package,
  },
  {
    title: "Total Transaksi",
    value: "342",
    change: "+18.2%",
    trend: "up" as const,
    description: "dari bulan lalu",
    icon: Receipt,
  },
  {
    title: "Rata-rata/Hari",
    value: "Rp 1.595.000",
    change: "-3.1%",
    trend: "down" as const,
    description: "dari bulan lalu",
    icon: TrendingUp,
  },
]

const recentTransactions = [
  { id: "TRX-001", customer: "Ahmad Rizky", item: "Ban Bridgestone Ecopia 195/65R15", amount: "Rp 850.000", date: "14 Feb 2026", status: "Selesai" },
  { id: "TRX-002", customer: "Siti Nurhaliza", item: "Tambal Ban Tubeless + Balancing", amount: "Rp 120.000", date: "14 Feb 2026", status: "Selesai" },
  { id: "TRX-003", customer: "Budi Santoso", item: "Ban GT Radial Champiro 205/55R16 x4", amount: "Rp 3.200.000", date: "13 Feb 2026", status: "Selesai" },
  { id: "TRX-004", customer: "Dewi Lestari", item: "Spooring + Balancing", amount: "Rp 250.000", date: "13 Feb 2026", status: "Proses" },
  { id: "TRX-005", customer: "Joko Widodo", item: "Ban Dunlop Enasave 185/70R14 x2", amount: "Rp 1.400.000", date: "12 Feb 2026", status: "Selesai" },
]

const topProducts = [
  { name: "Bridgestone Ecopia EP150", sold: 45, revenue: "Rp 38.250.000" },
  { name: "GT Radial Champiro Eco", sold: 38, revenue: "Rp 22.800.000" },
  { name: "Dunlop Enasave EC300+", sold: 32, revenue: "Rp 22.400.000" },
  { name: "Hankook Kinergy EX", sold: 28, revenue: "Rp 19.600.000" },
  { name: "Accelera PHI-R", sold: 24, revenue: "Rp 12.000.000" },
]

export default function AdminDashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground">Ringkasan Dashboard</h1>
        <p className="text-sm text-muted-foreground">Selamat datang kembali di panel admin CarProBan.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
              <card.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="font-heading text-2xl font-bold text-foreground">{card.value}</p>
              <div className="mt-1 flex items-center gap-1">
                {card.trend === "up" ? (
                  <ArrowUpRight className="h-3 w-3 text-[hsl(142,70%,40%)]" />
                ) : (
                  <ArrowDownRight className="h-3 w-3 text-destructive" />
                )}
                <span className={card.trend === "up" ? "text-xs text-[hsl(142,70%,40%)]" : "text-xs text-destructive"}>
                  {card.change}
                </span>
                <span className="text-xs text-muted-foreground">{card.description}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* Recent Transactions */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="font-heading text-base">Transaksi Terbaru</CardTitle>
            <CardDescription>5 transaksi terakhir</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              {recentTransactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-foreground truncate">{tx.customer}</p>
                      <Badge
                        variant={tx.status === "Selesai" ? "default" : "secondary"}
                        className={tx.status === "Selesai" ? "bg-[hsl(142,70%,40%)] text-[hsl(0,0%,100%)] hover:bg-[hsl(142,70%,35%)]" : ""}
                      >
                        {tx.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{tx.item}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold text-foreground">{tx.amount}</p>
                    <p className="text-xs text-muted-foreground">{tx.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-heading text-base">Produk Terlaris</CardTitle>
            <CardDescription>Bulan ini</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              {topProducts.map((product, i) => (
                <div key={product.name} className="flex items-center gap-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary text-xs font-bold text-primary-foreground">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{product.name}</p>
                    <p className="text-xs text-muted-foreground">{product.sold} terjual</p>
                  </div>
                  <p className="text-xs font-semibold text-foreground shrink-0">{product.revenue}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
