
import "dotenv/config";
import { prisma } from "../lib/db";

async function main() {
    console.log("Starting Admin & Outlet API verification...");

    // 1. Create Outlet
    console.log("\n1. Testing Outlet API...");
    const outlet = await prisma.outlet.create({
        data: {
            nama_outlet: "Test Outlet API",
            alamat: "Test Address",
        },
    });
    console.log("Created Outlet:", outlet.id, outlet.nama_outlet);

    // 2. Create Admin User
    console.log("\n2. Testing Admin User API...");
    const admin = await prisma.users.create({
        data: {
            name: "Test Admin",
            username: "admin.test",
            password: "hashedpassword",
            role: "outlet",
            id_outlet: outlet.id,
        },
    });
    console.log("Created Admin:", admin.id, admin.name);

    // 3. Update Admin
    const updatedAdmin = await prisma.users.update({
        where: { id: admin.id },
        data: { name: "Test Admin Updated" },
    });
    console.log("Updated Admin:", updatedAdmin.name);

    // 4. Delete Admin
    await prisma.users.delete({ where: { id: admin.id } });
    console.log("Deleted Admin");

    // 5. Delete Outlet
    await prisma.outlet.delete({ where: { id: outlet.id } });
    console.log("Deleted Outlet");

    console.log("\nVerification Complete!");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
