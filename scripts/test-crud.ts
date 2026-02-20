
import "dotenv/config";
import { prisma } from "../lib/db";

async function main() {
    console.log("Starting CRUD verification...");

    // 1. Categories
    console.log("\n--- Testing Categories ---");
    const catName = "Test Category " + Date.now();
    console.log("Creating category:", catName);
    const cat = await prisma.kategori.create({ data: { nama_kategori: catName } });
    console.log("Created category ID:", cat.id);

    const fetchedCat = await prisma.kategori.findUnique({ where: { id: cat.id } });
    if (fetchedCat?.nama_kategori === catName) console.log("Category Read: OK");
    else console.error("Category Read: FAILED");

    // 2. Brands
    console.log("\n--- Testing Brands ---");
    const brandName = "Test Brand " + Date.now();
    console.log("Creating brand:", brandName);
    const brand = await prisma.merek.create({ data: { nama_merek: brandName } });
    console.log("Created brand ID:", brand.id);

    const fetchedBrand = await prisma.merek.findUnique({ where: { id: brand.id } });
    if (fetchedBrand?.nama_merek === brandName) console.log("Brand Read: OK");
    else console.error("Brand Read: FAILED");

    // 3. Outlets
    console.log("\n--- Testing Outlets ---");
    const outletName = "Test Outlet " + Date.now();
    console.log("Creating outlet:", outletName);
    const outlet = await prisma.outlet.create({
        data: {
            nama_outlet: outletName,
            alamat: "Test Address"
        }
    });
    console.log("Created outlet ID:", outlet.id);

    // 4. Products
    console.log("\n--- Testing Products ---");
    const prodName = "Test Product " + Date.now();
    console.log("Creating product:", prodName);
    const product = await prisma.produk.create({
        data: {
            nama_produk: prodName,
            id_kategori: cat.id,
            id_merek: brand.id,
            ukuran: "123",
            produk_stok_harga: {
                create: {
                    id_outlet: outlet.id,
                    stok: 10,
                    harga_modal: 10000,
                    harga_jual: 12000
                }
            }
        }
    });
    console.log("Created product ID:", product.id);

    // Update Product
    console.log("Updating product...");
    const updatedProd = await prisma.produk.update({
        where: { id: product.id },
        data: { nama_produk: prodName + " Updated" }
    });
    console.log("Product Updated:", updatedProd.nama_produk);

    // 5. Customers
    console.log("\n--- Testing Customers ---");
    const custName = "Test Customer " + Date.now();
    console.log("Creating customer:", custName);
    const customer = await prisma.pelanggan.create({
        data: {
            nama_pelanggan: custName,
            nomer_hp: "08123456789",
            id_outlet: outlet.id
        }
    });
    console.log("Created customer ID:", customer.id);

    // Cleanup (Optional, but good for repetitive testing)
    console.log("\n--- Cleanup ---");
    // Order matters due to invalid foreign keys
    await prisma.pelanggan.delete({ where: { id: customer.id } });
    console.log("Deleted Customer");

    await prisma.produk.delete({ where: { id: product.id } });
    console.log("Deleted Product");

    await prisma.outlet.delete({ where: { id: outlet.id } });
    console.log("Deleted Outlet");

    await prisma.kategori.delete({ where: { id: cat.id } });
    console.log("Deleted Category");

    await prisma.merek.delete({ where: { id: brand.id } });
    console.log("Deleted Brand");

    console.log("\n✅ CRUD Verification Complete!");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
