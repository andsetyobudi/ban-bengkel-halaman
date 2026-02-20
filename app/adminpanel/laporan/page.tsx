"use client"

import { useState, useMemo, useRef } from "react"
import { Printer, Package, Store, Filter, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useOutlet } from "@/lib/outlet-context"

type StockPerOutlet = Record<string, number>

type Product = {
  id: string
  name: string
  code: string
  brand: string
  category: string
  costPrice: number
  sellPrice: number
  stock: StockPerOutlet
}

// Remove mock data


function formatRupiah(num: number) {
  return "Rp " + num.toLocaleString("id-ID")
}

function getStock(stock: StockPerOutlet, outletId: string): number {
  if (outletId === "all") {
    return Object.values(stock).reduce((s, v) => s + v, 0)
  }
  return stock[outletId] ?? 0
}

type ReportType = "semua" | "ban" | "oli"

const reportTypes: { value: ReportType; label: string; icon: typeof Package; description: string }[] = [
  { value: "semua", label: "Semua Produk", icon: Package, description: "Laporan seluruh produk yang tersedia" },
  { value: "ban", label: "Produk Ban", icon: Package, description: "Laporan produk kategori ban (Mobil, SUV, Motor)" },
  { value: "oli", label: "Produk Oli", icon: Package, description: "Laporan produk kategori oli (Mesin, Diesel)" },
]

function ReportTable({
  products,
  outletId,
  title,
  printRef,
  outletLabel,
  outlets,
}: {
  products: Product[]
  outletId: string
  title: string
  printRef: React.RefObject<HTMLDivElement | null>
  outletLabel: string
  outlets: import("@/lib/outlet-context").Outlet[]
}) {

  if (products.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <Package className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">Tidak ada produk ditemukan untuk laporan ini.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <div ref={printRef}>
        {/* Print-only header */}
        <div className="hidden print:block print:px-6 print:pt-6">
          <h2 className="text-lg font-bold">{title}</h2>
          <p className="text-sm text-muted-foreground">
            Outlet: {outletLabel} &bull; Tanggal cetak: {new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
          </p>
          <p className="text-sm text-muted-foreground">Total: {products.length} produk</p>
        </div>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-14 text-center">No</TableHead>
                  <TableHead>Nama Produk</TableHead>
                  <TableHead>Kode/Ukuran</TableHead>
                  <TableHead>Merek</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead className="text-right">Harga Jual</TableHead>
                  {outletId === "all" ? (
                    outlets.map((o) => (
                      <TableHead key={o.id} className="text-center">
                        <span className="text-xs">{o.name}</span>
                      </TableHead>
                    ))
                  ) : (
                    <TableHead className="text-center">Stok</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product, index) => {
                  const stock = getStock(product.stock, outletId)
                  return (
                    <TableRow key={product.id}>
                      <TableCell className="text-center text-sm text-muted-foreground">{index + 1}</TableCell>
                      <TableCell className="font-medium text-foreground">{product.name}</TableCell>
                      <TableCell className="font-mono text-sm text-muted-foreground">{product.code}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{product.brand}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{product.category}</TableCell>
                      <TableCell className="text-right font-medium text-foreground">{formatRupiah(product.sellPrice)}</TableCell>
                      {outletId === "all" ? (
                        outlets.map((o) => {
                          const stk = product.stock[o.id] ?? 0
                          return (
                            <TableCell key={o.id} className="text-center">
                              <Badge
                                variant={stk === 0 ? "destructive" : stk <= 5 ? "outline" : "default"}
                                className={stk > 5 ? "bg-[hsl(142,70%,40%)] text-[hsl(0,0%,100%)] hover:bg-[hsl(142,70%,35%)]" : ""}
                              >
                                {stk}
                              </Badge>
                            </TableCell>
                          )
                        })
                      ) : (
                        <TableCell className="text-center">
                          <Badge
                            variant={stock === 0 ? "destructive" : stock <= 5 ? "outline" : "default"}
                            className={stock > 5 ? "bg-[hsl(142,70%,40%)] text-[hsl(0,0%,100%)] hover:bg-[hsl(142,70%,35%)]" : ""}
                          >
                            {stock}
                          </Badge>
                        </TableCell>
                      )}
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        {/* Print-only footer */}
        <div className="hidden print:block print:px-6 print:pb-6 print:pt-3">
          <p className="text-xs text-muted-foreground">Dicetak oleh sistem - {new Date().toLocaleString("id-ID")}</p>
        </div>
      </div>
    </Card>
  )
}

export default function LaporanPage() {
  const { selectedOutletId, outlets, products } = useOutlet()
  const [activeReport, setActiveReport] = useState<ReportType>("semua")
  const [onlyEmpty, setOnlyEmpty] = useState(false)
  const printRef = useRef<HTMLDivElement>(null)

  const outletLabel =
    selectedOutletId === "all"
      ? "Semua Outlet"
      : outlets.find((o) => o.id === selectedOutletId)?.name || ""

  const filteredProducts = useMemo(() => {
    let list = products

    // Filter by report type
    if (activeReport === "ban") {
      list = list.filter((p) => p.category.toLowerCase().includes("ban"))
    } else if (activeReport === "oli") {
      list = list.filter((p) => p.category.toLowerCase().includes("oli"))
    }

    // Filter by outlet stock visibility
    if (selectedOutletId !== "all") {
      list = list.filter((p) => (p.stock[selectedOutletId] ?? 0) >= 0)
    }

    // Filter only empty stock
    if (onlyEmpty) {
      list = list.filter((p) => getStock(p.stock, selectedOutletId) === 0)
    }

    return list
  }, [activeReport, onlyEmpty, selectedOutletId])

  const reportLabel = reportTypes.find((r) => r.value === activeReport)?.label ?? "Laporan"
  const title = onlyEmpty ? `${reportLabel} - Stok Kosong` : reportLabel

  const handlePrint = () => {
    const content = printRef.current
    if (!content) return

    const printWindow = window.open("", "_blank")
    if (!printWindow) return

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title} - ${outletLabel}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; padding: 24px; color: #1a1a1a; }
            h2 { font-size: 18px; margin-bottom: 4px; }
            .meta { font-size: 12px; color: #666; margin-bottom: 16px; }
            table { width: 100%; border-collapse: collapse; font-size: 12px; }
            th, td { border: 1px solid #ddd; padding: 8px 10px; text-align: left; }
            th { background: #f5f5f5; font-weight: 600; }
            .text-center { text-align: center; }
            .text-right { text-align: right; }
            .mono { font-family: monospace; }
            .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 500; }
            .badge-ok { background: #22c55e; color: white; }
            .badge-warn { background: #f1f5f9; border: 1px solid #ccc; color: #333; }
            .badge-empty { background: #ef4444; color: white; }
            .footer { margin-top: 16px; font-size: 10px; color: #999; }
          </style>
        </head>
        <body>
          <h2>${title}</h2>
          <p class="meta">Outlet: ${outletLabel} &bull; Tanggal cetak: ${new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</p>
          <p class="meta">Total: ${filteredProducts.length} produk</p>
          <table>
            <thead>
              <tr>
                <th class="text-center" style="width:40px">No</th>
                <th>Nama Produk</th>
                <th>Kode/Ukuran</th>
                <th>Merek</th>
                <th>Kategori</th>
                <th class="text-right">Harga Jual</th>
                ${selectedOutletId === "all"
        ? outlets.map((o) => `<th class="text-center">${o.name}</th>`).join("")
        : '<th class="text-center">Stok</th>'
      }
              </tr>
            </thead>
            <tbody>
              ${filteredProducts
        .map(
          (p, i) => `
                <tr>
                  <td class="text-center">${i + 1}</td>
                  <td><strong>${p.name}</strong></td>
                  <td class="mono">${p.code}</td>
                  <td>${p.brand}</td>
                  <td>${p.category}</td>
                  <td class="text-right">${formatRupiah(p.sellPrice)}</td>
                  ${selectedOutletId === "all"
              ? outlets
                .map((o) => {
                  const stk = p.stock[o.id] ?? 0
                  const cls = stk === 0 ? "badge-empty" : stk <= 5 ? "badge-warn" : "badge-ok"
                  return `<td class="text-center"><span class="badge ${cls}">${stk}</span></td>`
                })
                .join("")
              : (() => {
                const stk = p.stock[selectedOutletId] ?? 0
                const cls = stk === 0 ? "badge-empty" : stk <= 5 ? "badge-warn" : "badge-ok"
                return `<td class="text-center"><span class="badge ${cls}">${stk}</span></td>`
              })()
            }
                </tr>
              `
        )
        .join("")}
            </tbody>
          </table>
          <p class="footer">Dicetak oleh sistem - ${new Date().toLocaleString("id-ID")}</p>
        </body>
      </html>
    `)

    printWindow.document.close()
    printWindow.focus()
    printWindow.print()
  }

  const totalProducts = filteredProducts.length
  const totalEmptyStock = products.filter((p) => {
    if (activeReport === "ban" && !p.category.toLowerCase().includes("ban")) return false
    if (activeReport === "oli" && !p.category.toLowerCase().includes("oli")) return false
    return getStock(p.stock, selectedOutletId) === 0
  }).length

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">Cetak Laporan</h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Store className="h-3.5 w-3.5" />
            <span>{outletLabel}</span>
          </div>
        </div>
        <Button onClick={handlePrint} disabled={filteredProducts.length === 0}>
          <Printer className="mr-2 h-4 w-4" />
          Cetak Laporan
        </Button>
      </div>

      {/* Report Type Selector */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {reportTypes.map((report) => {
          const isActive = activeReport === report.value
          return (
            <button
              key={report.value}
              onClick={() => {
                setActiveReport(report.value)
                setOnlyEmpty(false)
              }}
              className={`flex items-start gap-3 rounded-lg border p-4 text-left transition-colors ${isActive
                ? "border-primary bg-primary/5 ring-1 ring-primary"
                : "border-border hover:bg-muted/50"
                }`}
            >
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}
              >
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <p className={`text-sm font-semibold ${isActive ? "text-primary" : "text-foreground"}`}>{report.label}</p>
                <p className="text-xs text-muted-foreground">{report.description}</p>
              </div>
            </button>
          )
        })}
      </div>

      {/* Options */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Filter className="h-4 w-4" />
            Opsi Laporan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <Switch
                id="only-empty"
                checked={onlyEmpty}
                onCheckedChange={setOnlyEmpty}
              />
              <Label htmlFor="only-empty" className="cursor-pointer text-sm">
                Tampilkan hanya stok kosong
              </Label>
              {totalEmptyStock > 0 && (
                <Badge variant="destructive" className="text-xs">{totalEmptyStock} kosong</Badge>
              )}
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>
                Total: <span className="font-semibold text-foreground">{totalProducts}</span> produk
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Table */}
      <ReportTable
        products={filteredProducts}
        outletId={selectedOutletId}
        title={title}
        printRef={printRef}
        outletLabel={outletLabel}
        outlets={outlets}
      />

    </div>
  )
}
