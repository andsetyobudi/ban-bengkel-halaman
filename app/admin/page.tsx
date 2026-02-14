"use client"

import {
  DollarSign,
  Package,
  Receipt,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Store,
  MapPin,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useOutlet, outlets } from "@/lib/outlet-context"

const outletData: Record<
  string,
  {
    revenue: number
    revenueChange: string
    revenueUp: boolean
    products: number
    newProducts: number
    transactions: number
    transactionsChange: string
    transactionsUp: boolean
    avgPerDay: number
    avgChange: string
    avgUp: boolean
    recentTransactions: {
      id: string
      customer: string
      item: string
      amount: string
      date: string
      status: string
    }[]
    topProducts: { name: string; sold: number; revenue: string }[]
  }
> = {
  "OTL-001": {
    revenue: 25350000,
    revenueChange: "+15.2%",
    revenueUp: true,
    products: 58,
    newProducts: 4,
    transactions: 186,
    transactionsChange: "+22.1%",
    transactionsUp: true,
    avgPerDay: 845000,
    avgChange: "+5.3%",
    avgUp: true,
    recentTransactions: [
      { id: "TRX-001", customer: "Ahmad Rizky", item: "Ban Bridgestone Ecopia 195/65R15", amount: "Rp 850.000", date: "14 Feb 2026", status: "Selesai" },
      { id: "TRX-002", customer: "Siti Nurhaliza", item: "Tambal Ban Tubeless + Balancing", amount: "Rp 120.000", date: "14 Feb 2026", status: "Selesai" },
      { id: "TRX-003", customer: "Budi Santoso", item: "Ban GT Radial Champiro 205/55R16 x4", amount: "Rp 3.200.000", date: "13 Feb 2026", status: "Selesai" },
      { id: "TRX-004", customer: "Dewi Lestari", item: "Spooring + Balancing", amount: "Rp 250.000", date: "13 Feb 2026", status: "Proses" },
      { id: "TRX-005", customer: "Joko Widodo", item: "Ban Dunlop Enasave 185/70R14 x2", amount: "Rp 1.400.000", date: "12 Feb 2026", status: "Selesai" },
    ],
    topProducts: [
      { name: "Bridgestone Ecopia EP150", sold: 24, revenue: "Rp 18.000.000" },
      { name: "GT Radial Champiro Eco", sold: 18, revenue: "Rp 10.800.000" },
      { name: "Dunlop Enasave EC300+", sold: 15, revenue: "Rp 10.500.000" },
      { name: "Hankook Kinergy EX", sold: 12, revenue: "Rp 8.640.000" },
      { name: "Accelera PHI-R", sold: 10, revenue: "Rp 5.000.000" },
    ],
  },
  "OTL-002": {
    revenue: 12800000,
    revenueChange: "+8.7%",
    revenueUp: true,
    products: 42,
    newProducts: 2,
    transactions: 98,
    transactionsChange: "+12.4%",
    transactionsUp: true,
    avgPerDay: 426667,
    avgChange: "-1.2%",
    avgUp: false,
    recentTransactions: [
      { id: "TRX-101", customer: "Eko Prasetyo", item: "Ban Bridgestone Turanza 205/65R16", amount: "Rp 1.100.000", date: "14 Feb 2026", status: "Selesai" },
      { id: "TRX-102", customer: "Rina Susanti", item: "Spooring + Balancing 4 Ban", amount: "Rp 300.000", date: "14 Feb 2026", status: "Proses" },
      { id: "TRX-103", customer: "Andi Wijaya", item: "Ban GT Radial Savero SUV 225/65R17 x4", amount: "Rp 3.800.000", date: "13 Feb 2026", status: "Selesai" },
      { id: "TRX-104", customer: "Maya Putri", item: "Tambal Ban Tubeless", amount: "Rp 50.000", date: "13 Feb 2026", status: "Selesai" },
      { id: "TRX-105", customer: "Doni Setiawan", item: "Ban Dunlop AT3 265/65R17 x4", amount: "Rp 5.800.000", date: "12 Feb 2026", status: "Selesai" },
    ],
    topProducts: [
      { name: "GT Radial Savero SUV", sold: 12, revenue: "Rp 11.400.000" },
      { name: "Bridgestone Turanza", sold: 10, revenue: "Rp 11.000.000" },
      { name: "Dunlop AT3", sold: 8, revenue: "Rp 11.600.000" },
      { name: "Hankook Kinergy EX", sold: 6, revenue: "Rp 4.320.000" },
      { name: "Accelera PHI-R", sold: 5, revenue: "Rp 2.500.000" },
    ],
  },
}

function formatRupiah(num: number) {
  return "Rp " + num.toLocaleString("id-ID")
}

function getAggregatedData() {
  const allOutlets = Object.values(outletData)
  const totalRevenue = allOutlets.reduce((s, o) => s + o.revenue, 0)
  const totalProducts = allOutlets.reduce((s, o) => s + o.products, 0)
  const totalTransactions = allOutlets.reduce((s, o) => s + o.transactions, 0)
  const avgPerDay = Math.round(totalRevenue / 30)
  return { totalRevenue, totalProducts, totalTransactions, avgPerDay }
}

export default function AdminDashboardPage() {
  const { selectedOutletId, isSuperAdmin, currentUser } = useOutlet()

  const isAllView = selectedOutletId === "all"
  const currentData = !isAllView ? outletData[selectedOutletId] : null
  const aggregated = getAggregatedData()

  const summaryCards = currentData
    ? [
        {
          title: "Total Pendapatan",
          value: formatRupiah(currentData.revenue),
          change: currentData.revenueChange,
          trend: currentData.revenueUp ? ("up" as const) : ("down" as const),
          description: "dari bulan lalu",
          icon: DollarSign,
        },
        {
          title: "Total Produk",
          value: String(currentData.products),
          change: `+${currentData.newProducts}`,
          trend: "up" as const,
          description: "produk baru bulan ini",
          icon: Package,
        },
        {
          title: "Total Transaksi",
          value: String(currentData.transactions),
          change: currentData.transactionsChange,
          trend: currentData.transactionsUp ? ("up" as const) : ("down" as const),
          description: "dari bulan lalu",
          icon: Receipt,
        },
        {
          title: "Rata-rata/Hari",
          value: formatRupiah(currentData.avgPerDay),
          change: currentData.avgChange,
          trend: currentData.avgUp ? ("up" as const) : ("down" as const),
          description: "dari bulan lalu",
          icon: TrendingUp,
        },
      ]
    : [
        {
          title: "Total Pendapatan",
          value: formatRupiah(aggregated.totalRevenue),
          change: "+12.5%",
          trend: "up" as const,
          description: "dari bulan lalu",
          icon: DollarSign,
        },
        {
          title: "Total Produk",
          value: String(aggregated.totalProducts),
          change: "+6",
          trend: "up" as const,
          description: "produk baru bulan ini",
          icon: Package,
        },
        {
          title: "Total Transaksi",
          value: String(aggregated.totalTransactions),
          change: "+18.2%",
          trend: "up" as const,
          description: "dari bulan lalu",
          icon: Receipt,
        },
        {
          title: "Rata-rata/Hari",
          value: formatRupiah(aggregated.avgPerDay),
          change: "-3.1%",
          trend: "down" as const,
          description: "dari bulan lalu",
          icon: TrendingUp,
        },
      ]

  const recentTransactions = currentData
    ? currentData.recentTransactions
    : Object.entries(outletData)
        .flatMap(([outletId, data]) =>
          data.recentTransactions.map((tx) => ({
            ...tx,
            outletId,
            outletName: outlets.find((o) => o.id === outletId)?.name || "",
          }))
        )
        .slice(0, 7)

  const topProducts = currentData
    ? currentData.topProducts
    : [
        { name: "Bridgestone Ecopia EP150", sold: 45, revenue: "Rp 38.250.000" },
        { name: "GT Radial Champiro Eco", sold: 38, revenue: "Rp 22.800.000" },
        { name: "Dunlop Enasave EC300+", sold: 32, revenue: "Rp 22.400.000" },
        { name: "Hankook Kinergy EX", sold: 28, revenue: "Rp 19.600.000" },
        { name: "Accelera PHI-R", sold: 24, revenue: "Rp 12.000.000" },
      ]

  const outletLabel = isAllView
    ? "Semua Outlet"
    : outlets.find((o) => o.id === selectedOutletId)?.name || ""

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">Ringkasan Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Selamat datang kembali, {currentUser?.name || "Admin"}.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-1.5">
          <Store className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">{outletLabel}</span>
        </div>
      </div>

      {/* Super Admin: Outlet Comparison (shown only on "all" view) */}
      {isSuperAdmin && isAllView && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {outlets
            .filter((o) => o.status === "active")
            .map((outlet) => {
              const data = outletData[outlet.id]
              if (!data) return null
              return (
                <Card key={outlet.id} className="relative overflow-hidden">
                  <div className="absolute inset-x-0 top-0 h-1 bg-primary" />
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium text-foreground">
                        {outlet.name}
                      </CardTitle>
                      <Badge
                        variant="secondary"
                        className="bg-[hsl(142,70%,90%)] text-[hsl(142,70%,25%)]"
                      >
                        Aktif
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {outlet.address}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-muted-foreground">Pendapatan</p>
                        <p className="font-heading text-sm font-bold text-foreground">
                          {formatRupiah(data.revenue)}
                        </p>
                        <div className="flex items-center gap-0.5">
                          {data.revenueUp ? (
                            <ArrowUpRight className="h-3 w-3 text-[hsl(142,70%,40%)]" />
                          ) : (
                            <ArrowDownRight className="h-3 w-3 text-destructive" />
                          )}
                          <span
                            className={
                              data.revenueUp
                                ? "text-[10px] text-[hsl(142,70%,40%)]"
                                : "text-[10px] text-destructive"
                            }
                          >
                            {data.revenueChange}
                          </span>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Transaksi</p>
                        <p className="font-heading text-sm font-bold text-foreground">
                          {data.transactions}
                        </p>
                        <div className="flex items-center gap-0.5">
                          {data.transactionsUp ? (
                            <ArrowUpRight className="h-3 w-3 text-[hsl(142,70%,40%)]" />
                          ) : (
                            <ArrowDownRight className="h-3 w-3 text-destructive" />
                          )}
                          <span
                            className={
                              data.transactionsUp
                                ? "text-[10px] text-[hsl(142,70%,40%)]"
                                : "text-[10px] text-destructive"
                            }
                          >
                            {data.transactionsChange}
                          </span>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Produk</p>
                        <p className="font-heading text-sm font-bold text-foreground">
                          {data.products}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Rata-rata/Hari</p>
                        <p className="font-heading text-sm font-bold text-foreground">
                          {formatRupiah(data.avgPerDay)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
        </div>
      )}

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
                <span
                  className={
                    card.trend === "up" ? "text-xs text-[hsl(142,70%,40%)]" : "text-xs text-destructive"
                  }
                >
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
            <CardDescription>
              {isAllView ? "Transaksi terbaru dari semua outlet" : "5 transaksi terakhir"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              {recentTransactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-medium text-foreground">{tx.customer}</p>
                      <Badge
                        variant={tx.status === "Selesai" ? "default" : "secondary"}
                        className={
                          tx.status === "Selesai"
                            ? "bg-[hsl(142,70%,40%)] text-[hsl(0,0%,100%)] hover:bg-[hsl(142,70%,35%)]"
                            : ""
                        }
                      >
                        {tx.status}
                      </Badge>
                    </div>
                    <p className="truncate text-xs text-muted-foreground">{tx.item}</p>
                    {isAllView && "outletName" in tx && (
                      <p className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">
                        <Store className="h-3 w-3" />
                        {(tx as { outletName: string }).outletName}
                      </p>
                    )}
                  </div>
                  <div className="shrink-0 text-right">
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
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{product.name}</p>
                    <p className="text-xs text-muted-foreground">{product.sold} terjual</p>
                  </div>
                  <p className="shrink-0 text-xs font-semibold text-foreground">{product.revenue}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
