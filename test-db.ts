// Tes koneksi dengan Prisma client (lib/db.ts)
import "dotenv/config";
import { prisma } from "./lib/db";

async function main() {
  try {
    await prisma.$connect();
    console.log("✅ Mantap! Database berhasil terkoneksi.");
    // Tes query sederhana
    const count = await prisma.outlet.count();
    console.log("   Jumlah outlet:", count);
  } catch (e) {
    console.error("❌ Waduh, gagal konek:", e);
  } finally {
    await prisma.$disconnect();
  }
}

main();