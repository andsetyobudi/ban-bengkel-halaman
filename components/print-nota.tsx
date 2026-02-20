"use client"

import { useCallback, useRef } from "react"
import type { TransactionRecord, PaymentMethodType } from "@/lib/outlet-context"
import { useOutlet } from "@/lib/outlet-context"
import type { Outlet } from "@/lib/outlet-context"

const PAYMENT_LABELS: Record<PaymentMethodType, string> = {
  tunai: "Tunai",
  qris: "QRIS",
  debit_kredit: "Debit/Kredit",
  piutang: "Piutang",
}

function formatRupiah(num: number) {
  if (num == null) return "Rp 0"
  return "Rp " + num.toLocaleString("id-ID")
}

function formatDate(dateStr: string, short = false) {
  if (short) {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  }
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

function formatDateSlash(dateStr: string) {
  const d = new Date(dateStr)
  const day = String(d.getDate()).padStart(2, "0")
  const month = String(d.getMonth() + 1).padStart(2, "0")
  const year = d.getFullYear()
  return `${day}/${month}/${year}`
}

type PaperSize = "a4" | "thermal"

function getOutletLogo(outletName: string): string {
  const name = outletName.toLowerCase()
  if (name.includes("cahaya")) return "/images/logo-cahayaban.png"
  return "/images/logo-carproban.png"
}

function buildNotaHTML(tx: TransactionRecord, paperSize: PaperSize, outlets: Outlet[]): string {
  const outlet = outlets.find((o) => o.id === tx.outletId)
  const outletName = outlet?.name ?? "Bengkel"
  const outletAddress = outlet?.address ?? ""
  const outletPhone = outlet?.phone || "0819-9793-6676"
  const logoUrl = getOutletLogo(outletName)

  const isThermal = paperSize === "thermal"
  const pageWidth = isThermal ? "58mm" : "210mm"
  const bodyPadding = isThermal ? "0" : "20px 30px"
  const fontSize = isThermal ? "14px" : "13px"
  const fontSizeSmall = isThermal ? "11px" : "11px"
  const fontSizeTitle = isThermal ? "16px" : "20px"
  const fontSizeSubtitle = isThermal ? "11px" : "11px"
  const logoSize = isThermal ? "44px" : "64px"
  const separatorChar = isThermal ? "-" : "-"
  const separatorRepeat = isThermal ? 24 : 80

  const separator = separatorChar.repeat(separatorRepeat)

  const thermalItemRows = tx.items
    .map((item) => {
      const lineTotal = item.qty * item.price
      const priceStr = formatRupiah(item.price)
      const totalStr = formatRupiah(lineTotal)
      return `
        <tr class="item-row">
          <td colspan="3">${item.name}</td>
        </tr>
        <tr class="item-price">
          <td>${item.qty}x</td>
          <td class="text-right">${priceStr}</td>
          <td class="text-right">${totalStr}</td>
        </tr>`
    })
    .join("")

  const itemRows = tx.items
    .map((item) => {
      const lineTotal = item.qty * item.price
      return `
        <tr>
          <td style="padding:4px 0;font-size:${fontSize};">${item.name}</td>
          <td style="padding:4px 0;text-align:center;font-size:${fontSize};">${item.qty}</td>
          <td style="padding:4px 0;text-align:right;font-size:${fontSize};">${formatRupiah(item.price)}</td>
          <td style="padding:4px 0;text-align:right;font-size:${fontSize};">${formatRupiah(lineTotal)}</td>
        </tr>`
    })
    .join("")

  const paymentRows = tx.payments
    .map(
      (p) =>
        `<tr>
          <td style="font-size:${fontSizeSmall};color:#555;padding:1px 0;">${PAYMENT_LABELS[p.method]}</td>
          <td style="font-size:${fontSize};text-align:right;padding:1px 0;">${formatRupiah(p.amount)}</td>
        </tr>`
    )
    .join("")

  const dateStr = formatDate(tx.date)

  if (isThermal) {
    const paymentMethodStr = tx.payments.map((p) => PAYMENT_LABELS[p.method]).join(", ")
    const statusStr = tx.sisa > 0 ? "Piutang" : "Lunas"
    return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nota #${tx.invoice}</title>
  <style>
    @page { size: 58mm auto; margin: 0; }
    body { font-family: monospace; font-size: 14px; width: 58mm; margin: 0; padding: 0; line-height: 1.4; }
    .container { width: 58mm; padding: 2mm; }
    .header, .footer { text-align: center; }
    h3, p { margin: 0; padding: 0; }
    h3 { font-size: 16px; font-weight: bold; }
    .header p, .footer p { font-size: 14px; }
    table { width: 100%; border-collapse: collapse; font-size: 14px; }
    th, td { text-align: left; padding: 3px 0; }
    .text-right { text-align: right; }
    .text-left { text-align: left; }
    .line { border-bottom: 1px dashed #000; margin: 5px 0; }
    .details { display: table; width: 100%; }
    .details p { display: table-row; }
    .details span.label { display: table-cell; font-size: 14px; padding-right: 5px; width: 30%; }
    .details span.label-small { width: 20%; }
    .details span.value { display: table-cell; font-size: 14px; }
    .item-row td { font-size: 15px; font-weight: bold; }
    .item-price td { font-size: 14px; }
    .summary-table { font-size: 15px; }
    .total-pay-table { font-size: 18px; font-weight: bold; }
    .notes { text-align: center; margin-top: 10px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="${logoUrl}" alt="Logo" style="width:40mm;max-height:20mm;object-fit:contain;margin-bottom:4px;" onerror="this.style.display='none'" />
      <h3>${outletName}</h3>
      <p>${outletAddress}</p>
      <p>Telp/WA : ${outletPhone}</p>
      <p>Instagram : @carproban</p>
    </div>
    <div class="line"></div>
    <div class="details">
      <p><span class="label">Invoice</span><span class="value">: #${tx.invoice}</span></p>
      <p><span class="label">Tanggal</span><span class="value">: ${formatDateSlash(tx.date)}</span></p>
      <p><span class="label">Pelanggan</span><span class="value">: ${tx.customerName}</span></p>
      ${tx.customerPhone ? `<p><span class="label">No. Telp</span><span class="value">: ${tx.customerPhone}</span></p>` : ""}
      <p><span class="label">Nopol</span><span class="value">: ${tx.nopol}</span></p>
      ${tx.vehicle ? `<p><span class="label">Mobil</span><span class="value">: ${tx.vehicle}</span></p>` : ""}
    </div>
    <div class="line"></div>
    <table>
      <tbody>${thermalItemRows}</tbody>
    </table>
    <div class="line"></div>
    <table class="summary-table">
      <tbody>
        <tr>
          <td class="text-left">Subtotal:</td>
          <td class="text-right">${formatRupiah(tx.subtotal)}</td>
        </tr>
        <tr>
          <td class="text-left">Diskon:</td>
          <td class="text-right">- ${formatRupiah(tx.discount)}</td>
        </tr>
        <tr>
          <td class="text-left">Total Tagihan:</td>
          <td class="text-right">${formatRupiah(tx.total)}</td>
        </tr>
      </tbody>
    </table>
    <div class="line"></div>
    <div class="details">
      <p><span class="label label-small">Status</span><span class="value">: <strong>${statusStr}</strong></span></p>
      <p><span class="label label-small">Metode</span><span class="value">: ${paymentMethodStr}</span></p>
    </div>
    <div class="line"></div>
    <table class="total-pay-table">
      <tbody>
        <tr>
          <td class="text-left">Diterima:</td>
          <td class="text-right">${formatRupiah(tx.nominalBayar)}</td>
        </tr>
      </tbody>
    </table>
    <div class="line"></div>
    ${tx.note ? `<div class="notes"><p>Catatan: ${tx.note}</p></div><div class="line"></div>` : ""}
    <div class="footer">
      <p>Terima kasih sudah berbelanja!</p>
    </div>
  </div>
</body>
</html>`
  }

  // A4
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8">
<title>Nota ${tx.invoice}</title>
<style>
  @page { size: A4; margin: 15mm 20mm; }
  * { margin:0; padding:0; box-sizing:border-box; }
  body { width: ${pageWidth}; font-family: 'Segoe UI', Arial, sans-serif; font-size: ${fontSize}; color: #222; padding: ${bodyPadding}; max-width: 800px; margin: 0 auto; }
  table { width:100%; border-collapse:collapse; }
  .sep { border-bottom:1px dashed #ccc; margin:12px 0; }
  .header-table td { vertical-align: top; }
</style>
</head><body>

<table class="header-table">
  <tr>
    <td style="width:${logoSize};">
      <div style="width:${logoSize};height:${logoSize};border:1px dashed #ccc;display:flex;align-items:center;justify-content:center;border-radius:8px;overflow:hidden;">
        <img src="${logoUrl}" alt="Logo" style="max-width:100%;max-height:100%;object-fit:contain;" onerror="this.style.display='none';this.parentElement.innerHTML='<span style=font-size:10px;color:#999>LOGO</span>'" />
      </div>
    </td>
    <td style="padding-left:16px;">
      <div style="font-size:${fontSizeTitle};font-weight:bold;margin-bottom:2px;">${outletName}</div>
      <div style="font-size:${fontSizeSubtitle};color:#555;">${outletAddress}</div>
      <div style="font-size:${fontSizeSubtitle};color:#555;">${outletPhone}</div>
    </td>
    <td style="text-align:right;">
      <div style="font-size:18px;font-weight:bold;color:#333;">INVOICE</div>
      <div style="font-size:${fontSize};color:#555;margin-top:4px;">${tx.invoice}</div>
      <div style="font-size:${fontSizeSubtitle};color:#888;">${formatDate(tx.date)}</div>
    </td>
  </tr>
</table>

<div class="sep"></div>

<table>
  <tr>
    <td style="width:50%;vertical-align:top;">
      <div style="font-size:${fontSizeSmall};color:#888;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">Pelanggan</div>
      <div style="font-size:${fontSize};font-weight:600;">${tx.customerName}</div>
      ${tx.customerPhone ? `<div style="font-size:${fontSizeSmall};color:#555;">${tx.customerPhone}</div>` : ""}
    </td>
    <td style="width:50%;vertical-align:top;">
      <div style="font-size:${fontSizeSmall};color:#888;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">Kendaraan</div>
      <div style="font-size:${fontSize};font-weight:600;">${tx.nopol}</div>
      ${tx.vehicle ? `<div style="font-size:${fontSizeSmall};color:#555;">${tx.vehicle}</div>` : ""}
    </td>
  </tr>
</table>

<div class="sep"></div>

<table>
  <thead>
    <tr style="border-bottom:2px solid #ddd;">
      <th style="text-align:left;padding:8px 0;font-size:${fontSizeSmall};color:#888;text-transform:uppercase;letter-spacing:1px;">Item</th>
      <th style="text-align:center;padding:8px 0;font-size:${fontSizeSmall};color:#888;text-transform:uppercase;letter-spacing:1px;width:60px;">Qty</th>
      <th style="text-align:right;padding:8px 0;font-size:${fontSizeSmall};color:#888;text-transform:uppercase;letter-spacing:1px;width:120px;">Harga</th>
      <th style="text-align:right;padding:8px 0;font-size:${fontSizeSmall};color:#888;text-transform:uppercase;letter-spacing:1px;width:130px;">Jumlah</th>
    </tr>
  </thead>
  <tbody>${itemRows}</tbody>
</table>

<div class="sep"></div>

<table>
  <tr>
    <td style="width:60%;"></td>
    <td>
      <table style="width:100%;">
        <tr><td style="padding:3px 0;font-size:${fontSize};color:#555;">Subtotal</td><td style="padding:3px 0;text-align:right;font-size:${fontSize};">${formatRupiah(tx.subtotal)}</td></tr>
        ${tx.discount > 0 ? `<tr><td style="padding:3px 0;font-size:${fontSize};color:#555;">Diskon</td><td style="padding:3px 0;text-align:right;font-size:${fontSize};color:red;">-${formatRupiah(tx.discount)}</td></tr>` : ""}
        <tr style="border-top:2px solid #333;">
          <td style="padding:8px 0 3px;font-size:16px;font-weight:bold;">TOTAL</td>
          <td style="padding:8px 0 3px;text-align:right;font-size:16px;font-weight:bold;">${formatRupiah(tx.total)}</td>
        </tr>
      </table>
    </td>
  </tr>
</table>

<div class="sep"></div>

<table>
  <tr><td colspan="2" style="font-size:${fontSizeSmall};color:#888;text-transform:uppercase;letter-spacing:1px;padding-bottom:6px;">Pembayaran</td></tr>
  ${paymentRows}
  <tr style="border-top:1px solid #eee;"><td style="font-size:${fontSize};padding-top:6px;">Nominal Bayar</td><td style="text-align:right;font-size:${fontSize};padding-top:6px;font-weight:600;">${formatRupiah(tx.nominalBayar)}</td></tr>
  ${tx.sisa > 0 ? `<tr><td style="font-size:${fontSize};color:red;padding-top:2px;">Sisa Piutang</td><td style="text-align:right;font-size:${fontSize};color:red;padding-top:2px;font-weight:600;">${formatRupiah(tx.sisa)}</td></tr>` : ""}
  ${tx.nominalBayar > tx.total ? `<tr><td style="font-size:${fontSize};padding-top:2px;">Kembalian</td><td style="text-align:right;font-size:${fontSize};padding-top:2px;font-weight:600;">${formatRupiah(tx.nominalBayar - tx.total)}</td></tr>` : ""}
</table>

${tx.note ? `<div class="sep"></div><div style="font-size:${fontSizeSmall};color:#888;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">Catatan</div><div style="font-size:${fontSize};color:#555;">${tx.note}</div>` : ""}

<div class="sep"></div>

<div style="text-align:center;margin-top:16px;">
  <div style="font-size:${fontSize};color:#555;">Terima kasih atas kunjungan Anda</div>
  <div style="font-size:${fontSizeSmall};color:#888;margin-top:4px;">${outletName} - ${outletPhone}</div>
</div>

</body></html>`
}

export function usePrintNota() {
  const printFrameRef = useRef<HTMLIFrameElement | null>(null)
  const { outlets } = useOutlet()

  const printNota = useCallback((tx: TransactionRecord, paperSize: PaperSize) => {
    console.log("Printing nota:", tx.invoice, paperSize)
    // Remove previous iframe if any
    if (printFrameRef.current) {
      document.body.removeChild(printFrameRef.current)
    }

    const iframe = document.createElement("iframe")
    iframe.style.position = "fixed"
    iframe.style.top = "-10000px"
    iframe.style.left = "-10000px"
    iframe.style.width = paperSize === "thermal" ? "58mm" : "210mm"
    iframe.style.height = "0"
    iframe.style.border = "none"
    document.body.appendChild(iframe)
    printFrameRef.current = iframe

    const doc = iframe.contentDocument || iframe.contentWindow?.document
    if (!doc) return

    const html = buildNotaHTML(tx, paperSize, outlets)
    // Inject print script
    const printScript = `
      <script>
        window.addEventListener('load', function() {
          setTimeout(function() {
            window.print();
            window.close();
          }, 500);
        });
      </script>
    `
    const finalHtml = html.replace('</body>', `${printScript}</body>`)

    doc.open()
    doc.write(finalHtml)
    doc.close()

    // Fallback if load event doesn't fire (e.g. no external resources)
    setTimeout(() => {
      if (iframe.contentWindow) {
        iframe.contentWindow.print()
      }
    }, 1000)

  }, [outlets])

  return { printNota }
}
