"use client"

import { useCallback, useRef } from "react"
import type { TransactionRecord, PaymentMethodType } from "@/lib/outlet-context"
import { outlets } from "@/lib/outlet-context"

const PAYMENT_LABELS: Record<PaymentMethodType, string> = {
  tunai: "Tunai",
  qris: "QRIS",
  debit_kredit: "Debit/Kredit",
  piutang: "Piutang",
}

function formatRupiah(num: number) {
  return "Rp " + num.toLocaleString("id-ID")
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

type PaperSize = "a4" | "thermal"

function buildNotaHTML(tx: TransactionRecord, paperSize: PaperSize): string {
  const outlet = outlets.find((o) => o.id === tx.outletId)
  const outletName = outlet?.name ?? "Bengkel"
  const outletAddress = outlet?.address ?? ""
  const outletPhone = outlet?.phone ?? ""

  const isThermal = paperSize === "thermal"
  const pageWidth = isThermal ? "58mm" : "210mm"
  const bodyPadding = isThermal ? "4px 6px" : "20px 30px"
  const fontSize = isThermal ? "12px" : "13px"
  const fontSizeSmall = isThermal ? "10px" : "11px"
  const fontSizeTitle = isThermal ? "14px" : "20px"
  const fontSizeSubtitle = isThermal ? "10px" : "11px"
  const logoSize = isThermal ? "40px" : "64px"
  const separatorChar = isThermal ? "-" : "-"
  const separatorRepeat = isThermal ? 32 : 80

  const separator = separatorChar.repeat(separatorRepeat)

  const itemRows = tx.items
    .map((item) => {
      const lineTotal = item.qty * item.price
      if (isThermal) {
        return `
          <tr>
            <td colspan="4" style="padding:1px 0 0 0;font-size:${fontSize};">${item.name}</td>
          </tr>
          <tr>
            <td style="padding:0 0 1px 0;font-size:${fontSizeSmall};color:#666;">&nbsp;${item.qty}x ${formatRupiah(item.price)}</td>
            <td colspan="3" style="padding:0 0 1px 0;text-align:right;font-size:${fontSize};">${formatRupiah(lineTotal)}</td>
          </tr>`
      }
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

  if (isThermal) {
    return `<!DOCTYPE html>
<html><head><meta charset="utf-8">
<title>Nota ${tx.invoice}</title>
<style>
  @page { size: 58mm auto; margin: 0; }
  * { margin:0; padding:0; box-sizing:border-box; }
  body { width: 58mm; font-family: 'Courier New', monospace; font-size: ${fontSize}; color: #000; padding: ${bodyPadding}; }
  table { width:100%; border-collapse:collapse; }
  .sep { text-align:center; color:#999; font-size:${fontSizeSmall}; margin:2px 0; overflow:hidden; white-space:nowrap; }
</style>
</head><body>

<div style="text-align:center;margin-bottom:4px;">
  <div style="margin:0 auto 4px auto;width:${logoSize};height:${logoSize};border:1px dashed #ccc;display:flex;align-items:center;justify-content:center;border-radius:4px;">
    <img src="/images/logo-nota.jpg" alt="Logo" style="max-width:100%;max-height:100%;object-fit:contain;" onerror="this.style.display='none';this.parentElement.innerHTML='<span style=font-size:6px;color:#999>LOGO</span>'" />
  </div>
  <div style="font-size:${fontSizeTitle};font-weight:bold;">${outletName}</div>
  <div style="font-size:${fontSizeSmall};color:#555;">${outletAddress}</div>
  <div style="font-size:${fontSizeSmall};color:#555;">${outletPhone}</div>
</div>

<div class="sep">${separator}</div>

<table>
  <tr><td style="font-size:${fontSizeSmall};color:#555;">No</td><td style="font-size:${fontSize};text-align:right;">${tx.invoice}</td></tr>
  <tr><td style="font-size:${fontSizeSmall};color:#555;">Tgl</td><td style="font-size:${fontSize};text-align:right;">${formatDate(tx.date)}</td></tr>
  <tr><td style="font-size:${fontSizeSmall};color:#555;">Plg</td><td style="font-size:${fontSize};text-align:right;">${tx.customerName}</td></tr>
  <tr><td style="font-size:${fontSizeSmall};color:#555;">Nopol</td><td style="font-size:${fontSize};text-align:right;">${tx.nopol}</td></tr>
  ${tx.vehicle ? `<tr><td style="font-size:${fontSizeSmall};color:#555;">Kndr</td><td style="font-size:${fontSize};text-align:right;">${tx.vehicle}</td></tr>` : ""}
</table>

<div class="sep">${separator}</div>

<table>${itemRows}</table>

<div class="sep">${separator}</div>

<table>
  <tr><td style="font-size:${fontSize};">Subtotal</td><td style="text-align:right;font-size:${fontSize};">${formatRupiah(tx.subtotal)}</td></tr>
  ${tx.discount > 0 ? `<tr><td style="font-size:${fontSize};">Diskon</td><td style="text-align:right;font-size:${fontSize};color:red;">-${formatRupiah(tx.discount)}</td></tr>` : ""}
  <tr><td style="font-size:${fontSizeTitle};font-weight:bold;padding-top:2px;">TOTAL</td><td style="text-align:right;font-size:${fontSizeTitle};font-weight:bold;padding-top:2px;">${formatRupiah(tx.total)}</td></tr>
</table>

<div class="sep">${separator}</div>

<table>
  <tr><td colspan="2" style="font-size:${fontSizeSmall};color:#555;padding-bottom:1px;">Pembayaran:</td></tr>
  ${paymentRows}
  <tr><td style="font-size:${fontSize};padding-top:2px;">Bayar</td><td style="text-align:right;font-size:${fontSize};padding-top:2px;">${formatRupiah(tx.nominalBayar)}</td></tr>
  ${tx.sisa > 0 ? `<tr><td style="font-size:${fontSize};color:red;">Sisa</td><td style="text-align:right;font-size:${fontSize};color:red;">${formatRupiah(tx.sisa)}</td></tr>` : ""}
  ${tx.nominalBayar > tx.total ? `<tr><td style="font-size:${fontSize};">Kembalian</td><td style="text-align:right;font-size:${fontSize};">${formatRupiah(tx.nominalBayar - tx.total)}</td></tr>` : ""}
</table>

${tx.note ? `<div class="sep">${separator}</div><div style="font-size:${fontSizeSmall};color:#555;">Catatan: ${tx.note}</div>` : ""}

<div class="sep">${separator}</div>

<div style="text-align:center;margin-top:4px;">
  <div style="font-size:${fontSizeSmall};color:#555;">Terima kasih</div>
  <div style="font-size:${fontSizeSmall};color:#555;">atas kunjungan Anda</div>
</div>

</body></html>`
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
        <img src="/images/logo-nota.jpg" alt="Logo" style="max-width:100%;max-height:100%;object-fit:contain;" onerror="this.style.display='none';this.parentElement.innerHTML='<span style=font-size:10px;color:#999>LOGO</span>'" />
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

  const printNota = useCallback((tx: TransactionRecord, paperSize: PaperSize) => {
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

    const html = buildNotaHTML(tx, paperSize)
    doc.open()
    doc.write(html)
    doc.close()

    // Wait for content to render, then print
    iframe.onload = () => {
      setTimeout(() => {
        iframe.contentWindow?.print()
      }, 300)
    }

    // Fallback: trigger print after a short delay
    setTimeout(() => {
      iframe.contentWindow?.print()
    }, 600)
  }, [])

  return { printNota }
}
