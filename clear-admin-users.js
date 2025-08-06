import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { adminUsers } from "./shared/schema.js";

const { Pool } = pg;

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgresql://localhost:5432/portfolio",
});

const db = drizzle(pool);

async function clearAdminUsers() {
  try {
    console.log("🗑️  Clearing all admin users from database...");
    
    // Delete all admin users
    await db.delete(adminUsers);
    
    console.log("✅ All admin users cleared from database");
    console.log("🔐 System now uses only hardcoded credentials:");
    console.log("   Username: filipe");
    console.log("   Password: af52c1b8c4fdda3d33d1c5cd6ba05570");
    
  } catch (error) {
    console.error("❌ Error clearing admin users:", error);
  } finally {
    await pool.end();
  }
}

clearAdminUsers();