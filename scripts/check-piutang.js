
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
    console.log("🚀 Checking Piutang...");
    const piutang = await prisma.transaksi.findMany({
        where: {
            OR: [
                { sisa_tagihan: { gt: 0 } },
                { status_pembayaran: { not: "Lunas" } }
            ]
        },
        include: { pelanggan: true }
    });

    console.log(`Found ${piutang.length} piutang records.`);
    piutang.forEach(p => {
        console.log(`- Invoice: ${p.nomor_invoice}, Total: ${p.total_pembayaran}, Paid: ${p.total_terbayar}, Sisa: ${p.sisa_tagihan}, Status: ${p.status_pembayaran}, Customer: ${p.pelanggan?.nama_pelanggan}`);
    });

    // If no piutang, create one for testing
    if (piutang.length === 0) {
        console.log("\n⚠️ No piutang found. Creating a test transaction with piutang...");

        // Need customer and outlet
        const outlet = await prisma.outlet.findFirst();
        const customer = await prisma.pelanggan.findFirst({ where: { id_outlet: outlet.id } });

        if (!outlet || !customer) {
            console.log("❌ Cannot create test piutang: missing outlet or customer.");
            return;
        }

        const tx = await prisma.transaksi.create({
            data: {
                id_outlet: outlet.id,
                id_pelanggan: customer.id,
                nomor_invoice: `INV-TEST-PIUTANG-${Date.now()}`,
                tanggal: new Date(),
                total_pembayaran: 1000000,
                total_terbayar: 200000,
                sisa_tagihan: 800000,
                status_pembayaran: "Belum Lunas",
                catatan: "Test Piutang Created by Script"
            }
        });
        console.log(`✅ Created test piutang: ${tx.nomor_invoice}`);
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
