import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

function toOutlet(o: { id: number; nama_outlet: string; alamat: string | null }) {
  return {
    id: String(o.id),
    name: o.nama_outlet,
    address: o.alamat ?? "",
    phone: "",
    status: "active" as const,
  };
}

function toAdminUser(u: { id: number; name: string; username: string; role: string; id_outlet: number | null }) {
  return {
    id: String(u.id),
    name: u.name,
    email: u.username,
    role: u.role === "admin" ? ("super_admin" as const) : ("outlet_admin" as const),
    outletId: u.id_outlet != null ? String(u.id_outlet) : undefined,
  };
}

export async function GET() {
  try {
    const [
      outletsRows,
      usersRows,
      categoriesRows,
      brandsRows,
      productsRows,
      stokRows,
      customersRows,
      transfersRows,
      transaksiRows,
      piutangRows,
    ] = await Promise.all([
      prisma.outlet.findMany({ orderBy: { id: "asc" } }),
      prisma.users.findMany({ orderBy: { id: "asc" } }),
      prisma.kategori.findMany({ orderBy: { id: "asc" } }),
      prisma.merek.findMany({ orderBy: { id: "asc" } }),
      prisma.produk.findMany({
        include: { kategori: true, merek: true },
        orderBy: { id: "asc" },
      }),
      prisma.produk_stok_harga.findMany({ include: { outlet: true, produk: true } }),
      prisma.pelanggan.findMany({ include: { outlet: true }, orderBy: { id: "asc" } }),
      prisma.transfer_stok.findMany({
        include: {
          outlet_transfer_stok_id_outlet_asalTooutlet: true,
          outlet_transfer_stok_id_outlet_tujuanTooutlet: true,
          transfer_stok_detail: { include: { produk: true } },
        },
        orderBy: { created_at: "desc" },
      }),
      prisma.transaksi.findMany({
        include: {
          pelanggan: true,
          outlet: true,
          transaksi_detail: { include: { produk: true } },
          transaksi_pembayaran: true,
        },
        orderBy: { tanggal: "desc" },
        take: 200,
      }),
      // Separate query for piutang: fetch ALL transactions with outstanding balance
      // This ensures piutang data is not limited by the `take: 200` on general transactions
      prisma.transaksi.findMany({
        where: {
          OR: [
            { sisa_tagihan: { gt: 0 } },
            { status_pembayaran: { not: "Lunas" } },
          ],
        },
        include: {
          pelanggan: true,
          outlet: true,
        },
        orderBy: { tanggal: "desc" },
      }),
    ]);

    const outlets = outletsRows.map(toOutlet);
    const adminUsers = usersRows.map(toAdminUser);

    const categories = categoriesRows.map((c) => ({ id: String(c.id), name: c.nama_kategori }));
    const brands = brandsRows.map((b) => ({ id: String(b.id), name: b.nama_merek }));

    const stockByKey: Record<string, number> = {};
    stokRows.forEach((s) => {
      stockByKey[`${s.id_outlet}-${s.id_produk}`] = s.stok;
    });

    const products = productsRows.map((p) => {
      const stock: Record<string, number> = {};
      outlets.forEach((o) => {
        stock[o.id] = stockByKey[`${o.id}-${p.id}`] ?? 0;
      });
      const firstStok = stokRows.find((s) => s.id_produk === p.id);
      return {
        id: String(p.id),
        name: p.nama_produk,
        code: p.ukuran ?? "",
        brand: p.merek.nama_merek,
        category: p.kategori.nama_kategori,
        costPrice: Number(firstStok?.harga_modal ?? 0),
        sellPrice: Number(firstStok?.harga_jual ?? 0),
        stock,
      };
    });

    const customers = customersRows.map((c) => ({
      id: String(c.id),
      name: c.nama_pelanggan,
      phone: c.nomer_hp ?? "",
      outletId: String(c.id_outlet),
    }));

    const transferStatusMap: Record<string, "pending" | "diterima" | "selesai" | "dibatalkan"> = {
      diajukan: "pending",
      dikirim: "diterima",
      diterima: "selesai",
      ditolak: "dibatalkan",
    };
    const transfers = transfersRows.map((t) => ({
      id: String(t.id),
      fromOutletId: String(t.id_outlet_asal),
      toOutletId: String(t.id_outlet_tujuan),
      date: t.tanggal_kirim.toISOString().slice(0, 10),
      note: t.catatan ?? "",
      items: t.transfer_stok_detail.map((d) => ({
        productId: String(d.id_produk),
        productName: d.produk.nama_produk,
        productCode: d.produk.ukuran ?? "",
        qty: d.jumlah,
      })),
      status: transferStatusMap[t.status] ?? "pending",
      createdAt: t.created_at.toISOString(),
    }));

    const piutang = piutangRows.map((t) => ({
      id: String(t.id),
      invoice: t.nomor_invoice,
      date: t.tanggal.toISOString().slice(0, 10),
      customerId: t.id_pelanggan != null ? String(t.id_pelanggan) : "",
      customerName: t.pelanggan?.nama_pelanggan ?? "",
      nopol: t.nopol ?? "",
      total: Number(t.total_pembayaran),
      paid: Number(t.total_terbayar),
      outletId: String(t.id_outlet),
      status: Number(t.sisa_tagihan) > 0 ? ("belum_lunas" as const) : ("lunas" as const),
    }));

    const transactions = transaksiRows.map((t) => {
      const items = t.transaksi_detail.map((d) => ({
        name: d.nama_produk_manual ?? d.produk?.nama_produk ?? "",
        price: Number(d.harga_satuan),
        qty: d.jumlah,
        productId: d.id_produk != null ? String(d.id_produk) : undefined,
      }));
      const total = Number(t.total_pembayaran);
      const nominalBayar = Number(t.total_terbayar);
      const sisa = Number(t.sisa_tagihan);

      const payments = t.transaksi_pembayaran.map((p) => ({
        method: p.metode_pembayaran,
        amount: Number(p.nominal_bayar),
      }));

      // Fallback if no payments recorded but it's paid (legacy data?)
      if (payments.length === 0 && nominalBayar > 0) {
        payments.push({ method: "tunai", amount: nominalBayar });
      }

      return {
        id: String(t.id),
        invoice: t.nomor_invoice,
        date: t.tanggal.toISOString().slice(0, 10),
        customerName: t.pelanggan?.nama_pelanggan ?? "",
        customerPhone: t.pelanggan?.nomer_hp ?? "",
        nopol: t.nopol ?? "",
        vehicle: t.mobil ?? "",
        items,
        subtotal: total,
        discount: Number(t.diskon ?? 0),
        total,
        paymentType: sisa > 0 ? ("campuran" as const) : ("penuh" as const),
        payments,
        nominalBayar,
        sisa,
        isPiutang: sisa > 0,
        note: t.catatan ?? "",
        outletId: String(t.id_outlet),
        status: "Selesai" as const,
      };
    });

    return NextResponse.json({
      outlets,
      adminUsers,
      categories,
      brands,
      products,
      customers,
      transfers,
      piutang,
      transactions,
    });
  } catch (e) {
    console.error("initial-data error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to load initial data" },
      { status: 500 }
    );
  }
}
