
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    console.log("Checking transactions with payments...");
    const transactions = await prisma.transaksi.findMany({
        include: {
            transaksi_pembayaran: true,
        },
        take: 5,
        orderBy: {
            tanggal: 'desc'
        }
    });

    console.log(`Found ${transactions.length} transactions.`);
    for (const t of transactions) {
        console.log(`Transaction ${t.nomor_invoice}:`);
        console.log(`  Total: ${t.total_pembayaran}`);
        console.log(`  Payments: ${t.transaksi_pembayaran.length}`);
        t.transaksi_pembayaran.forEach(p => {
            console.log(`    - Method: ${p.metode_pembayaran}, Amount: ${p.nominal_bayar}`);
        });
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
