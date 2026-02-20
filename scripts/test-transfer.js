
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
    console.log("🚀 Starting Transfer Flow Test (JS)...");

    try {
        // 1. Setup Data: Get Outlets and a Product
        const outlets = await prisma.outlet.findMany({ take: 2 });
        if (outlets.length < 2) {
            console.error("❌ Need at least 2 outlets to test transfer.");
            return;
        }
        const fromOutlet = outlets[0];
        const toOutlet = outlets[1];

        const product = await prisma.produk.findFirst();
        if (!product) {
            console.error("❌ No products found.");
            return;
        }

        // Ensure ample stock in source
        let pshSource = await prisma.produk_stok_harga.findUnique({
            where: { uk_outlet_produk: { id_outlet: fromOutlet.id, id_produk: product.id } }
        });

        // If not exists or low stock, upsert
        if (!pshSource || pshSource.stok < 10) {
            console.log("  - Adjusting source stock...");
            pshSource = await prisma.produk_stok_harga.upsert({
                where: { uk_outlet_produk: { id_outlet: fromOutlet.id, id_produk: product.id } },
                create: {
                    id_outlet: fromOutlet.id, id_produk: product.id, stok: 50, harga_modal: 100000, harga_jual: 120000
                },
                update: { stok: 50 }
            });
        }

        const initialSourceStock = pshSource.stok;
        console.log(`  - Source Stock (${fromOutlet.name || fromOutlet.nama_outlet}): ${initialSourceStock}`); // Handle different field name if needed

        // Get/Create Destination Stock to know initial
        let pshDest = await prisma.produk_stok_harga.findUnique({
            where: { uk_outlet_produk: { id_outlet: toOutlet.id, id_produk: product.id } }
        });
        if (!pshDest) {
            pshDest = await prisma.produk_stok_harga.create({
                data: { id_outlet: toOutlet.id, id_produk: product.id, stok: 0, harga_modal: 100000, harga_jual: 120000 }
            });
        }
        const initialDestStock = pshDest.stok;
        console.log(`  - Dest Stock (${toOutlet.name || toOutlet.nama_outlet}): ${initialDestStock}`);

        const transferQty = 5;

        // Note: We need a User ID.
        let user = await prisma.users.findFirst({ where: { role: 'super_admin' } });
        if (!user) {
            user = await prisma.users.findFirst({ where: { role: 'admin' } });
        }
        if (!user) {
            user = await prisma.users.findFirst();
        }

        if (!user) {
            console.error("❌ No user found.");
            return;
        }

        console.log("\n📦 1. Creating Transfer via API...");
        const createPayload = {
            fromOutletId: String(fromOutlet.id),
            toOutletId: String(toOutlet.id),
            date: new Date().toISOString().split("T")[0],
            note: "Test Transfer Script JS",
            items: [{ productId: String(product.id), qty: transferQty }],
            userId: String(user.id)
        };

        const baseUrl = "http://localhost:3000"; // Assumption

        const createRes = await fetch(`${baseUrl}/api/admin/transfers`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(createPayload)
        });

        if (!createRes.ok) {
            const err = await createRes.text();
            throw new Error(`API Error: ${createRes.status} ${createRes.statusText} - ${err}`);
        }

        const createData = await createRes.json();
        const transferId = createData.transfer.id;
        console.log(`  ✅ Transfer Created! ID: ${transferId}`);

        // Verify Source Stock Deducted
        const pshSourceAfter = await prisma.produk_stok_harga.findUnique({
            where: { id: pshSource.id }
        });
        console.log(`  - Source Stock After Create: ${pshSourceAfter?.stok} (Expected: ${initialSourceStock - transferQty})`);

        // Use loose equality or parsing because BigInt or Decimal might be returned? Prisma returns int or BigInt depending on mapping.
        // Assuming update works fine.
        if (Number(pshSourceAfter?.stok) !== Number(initialSourceStock) - transferQty) {
            console.error("  ❌ Stock deduction failed!");
        } else {
            console.log("  ✅ Stock deduction verified.");
        }

        // 3. Update Status to 'diterima'
        console.log("\n🚚 2. Accepting Transfer (Update Status 'diterima')...");
        const acceptRes = await fetch(`${baseUrl}/api/admin/transfers/${transferId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "diterima", userId: String(user.id) })
        });
        if (!acceptRes.ok) throw new Error("Failed to accept transfer");
        console.log("  ✅ Transfer Accepted.");

        // 4. Update Status to 'selesai'
        console.log("\n🏁 3. Completing Transfer (Update Status 'selesai')...");
        const completeRes = await fetch(`${baseUrl}/api/admin/transfers/${transferId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "selesai", userId: String(user.id) })
        });
        if (!completeRes.ok) throw new Error("Failed to complete transfer");
        console.log("  ✅ Transfer Completed.");

        // Verify Destination Stock Added
        const pshDestAfter = await prisma.produk_stok_harga.findUnique({
            where: { id: pshDest.id }
        });
        console.log(`  - Dest Stock After Complete: ${pshDestAfter?.stok} (Expected: ${initialDestStock + transferQty})`);
        if (Number(pshDestAfter?.stok) !== Number(initialDestStock) + transferQty) {
            console.error("  ❌ Stock addition failed!");
        } else {
            console.log("  ✅ Stock addition verified.");
        }

    } catch (e) {
        console.error("❌ Test Failed:", e);
        console.log("\n⚠️  Note: Make sure the dev server is running on http://localhost:3000");
    } finally {
        await prisma.$disconnect();
    }
}

main();
