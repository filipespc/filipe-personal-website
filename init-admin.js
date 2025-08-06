import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import bcrypt from "bcrypt";
import { adminUsers } from "./shared/schema.ts";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";

const { Pool } = pg;

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgresql://localhost:5432/portfolio",
});

const db = drizzle(pool);

async function initializeAdmin() {
  try {
    console.log("🔧 Initializing admin user...");
    
    const username = "filipe";
    const password = "af52c1b8c4fdda3d33d1c5cd6ba05570";
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Check if admin user already exists
    const existingAdmin = await db
      .select()
      .from(adminUsers)
      .where(eq(adminUsers.username, username))
      .limit(1);
    
    if (existingAdmin.length > 0) {
      console.log("🔄 Admin user already exists, updating password...");
      await db
        .update(adminUsers)
        .set({ 
          password: hashedPassword,
          updatedAt: new Date()
        })
        .where(eq(adminUsers.username, username));
      console.log("✅ Admin password updated successfully");
    } else {
      console.log("➕ Creating new admin user...");
      await db.insert(adminUsers).values({
        id: randomUUID(),
        username,
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      console.log("✅ Admin user created successfully");
    }
    
    console.log("🔐 Admin credentials:");
    console.log("   Username: filipe");
    console.log("   Password: af52c1b8c4fdda3d33d1c5cd6ba05570");
    console.log("   Hash:", hashedPassword);
    
  } catch (error) {
    console.error("❌ Error initializing admin user:", error);
  } finally {
    await pool.end();
  }
}

initializeAdmin();