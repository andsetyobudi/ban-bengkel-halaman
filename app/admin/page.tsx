"use client"

import { useMemo } from "react"
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
import { useOutlet } from "@/lib/outlet-context"
import type { TransactionRecord } from "@/lib/outlet-context"

function formatRupiah(num: number) {
  return "Rp " + num.toLocaleString("id-ID")
}

function formatDateShort(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

function getSummaryFromTransactions(
  transactions: TransactionRecord[],
  selectedOutletId: string,
  productCount: number,
  outlets: { id: string; name: string }[]
) {
  const filtered =
    selectedOutletId === "all"
      ? transactions
      : transactions.filter((t) => t.outletId === selectedOutletId)

  const completed = filtered.filter((t) => t.status === "Selesai")
  const totalRevenue = completed.reduce((s, t) => s + t.total, 0)
  const totalTransactions = filtered.length
  const daysInMonth = 30
  const avgPerDay = totalTransactions > 0 ? Math.round(totalRevenue / daysInMonth) : 0

  const recentList = [...filtered]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 7)
    .map((tx) => ({
      id: tx.id,
      customer: tx.customerName,
      item: tx.items.map((i) => `${i.name}${i.qty > 1 ? ` x${i.qty}` : ""}`).join(", "),
      amount: formatRupiah(tx.total),
      date: formatDateShort(tx.date),
      status: tx.status,
      outletName: outlets.find((o) => o.id === tx.outletId)?.name ?? "",
    }))

  const itemAgg = new Map<string, { sold: number; revenue: number }>()
  for (const tx of completed) {
    for (const it of tx.items) {
      const key = it.name
      const cur = itemAgg.get(key) ?? { sold: 0, revenue: 0 }
      itemAgg.set(key, {
        sold: cur.sold + it.qty,
        revenue: cur.revenue + it.qty * it.price,
      })
    }
  }
  const topProducts = [...itemAgg.entries()]
    .sort((a, b) => b[1].revenue - a[1].revenue)
    .slice(0, 5)
    .map(([name, data]) => ({ name, sold: data.sold, revenue: formatRupiah(data.revenue) }))

  return {
    totalRevenue,
    totalTransactions,
    productCount,
    avgPerDay,
    recentTransactions: recentList,
    topProducts,
  }
}

function getPerOutletSummary(
  transactions: TransactionRecord[],
  productCount: number,
  outlets: { id: string; name: string; status: string }[]
) {
  return outlets.filter((o) => o.status === "active").map((outlet) => {
    const data = getSummaryFromTransactions(transactions, outlet.id, productCount, outlets)
    return {
      outletId: outlet.id,
      outlet,
      ...data,
    }
  })
}

export default function AdminDashboardPage() {
  const { selectedOutletId, isSuperAdmin, currentUser, transactions, products, outlets } = useOutlet()

  const isAllView = selectedOutletId === "all"
  const productCount = products.length

  const summary = useMemo(
    () => getSummaryFromTransactions(transactions, selectedOutletId, productCount, outlets),
    [transactions, selectedOutletId, productCount, outlets]
  )

  const perOutletSummary = useMemo(
    () => getPerOutletSummary(transactions, productCount, outlets),
    [transactions, productCount, outlets]
  )

  const summaryCards = [
    {
      title: "Total Pendapatan",
      value: formatRupiah(summary.totalRevenue),
      change: "—",
      trend: "up" as const,
      description: "total transaksi selesai",
      icon: DollarSign,
    },
    {
      title: "Total Produk",
      value: String(summary.productCount),
      change: "—",
      trend: "up" as const,
      description: "produk dalam katalog",
      icon: Package,
    },
    {
      title: "Total Transaksi",
      value: String(summary.totalTransactions),
      change: "—",
      trend: "up" as const,
      description: "semua status",
      icon: Receipt,
    },
    {
      title: "Rata-rata/Hari",
      value: formatRupiah(summary.avgPerDay),
      change: "—",
      trend: "up" as const,
      description: "dari pendapatan bulan ini",
      icon: TrendingUp,
    },
  ]

  const recentTransactions = summary.recentTransactions
  const topProducts = summary.topProducts

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
          {perOutletSummary.map(({ outlet, totalRevenue, totalTransactions, productCount, avgPerDay }) => (
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
                      {formatRupiah(totalRevenue)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Transaksi</p>
                    <p className="font-heading text-sm font-bold text-foreground">
                      {totalTransactions}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Produk</p>
                    <p className="font-heading text-sm font-bold text-foreground">
                      {productCount}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Rata-rata/Hari</p>
                    <p className="font-heading text-sm font-bold text-foreground">
                      {formatRupiah(avgPerDay)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
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
