// Tes koneksi MySQL (tanpa Prisma)
import "dotenv/config";
import mysql from "mysql2/promise";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("❌ DATABASE_URL tidak ada di .env");
  process.exit(1);
}

async function test() {
  try {
    const conn = await mysql.createConnection(url);
    const [rows] = await conn.execute("SELECT 1 AS ok");
    await conn.end();
    console.log("✅ Database berhasil terkoneksi.", rows);
  } catch (e) {
    console.error("❌ Gagal konek:", e.message);
    process.exit(1);
  }
}
test();
