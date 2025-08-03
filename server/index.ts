import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { getSession, requireAuth, hashPassword, verifyPassword } from "./auth.js";
import { storage } from "./storage.js";
import { insertExperienceSchema, insertProfileSchema, insertAdminUserSchema, insertEducationSchema, insertCaseStudySchema } from "@shared/schema";
import { z } from "zod";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Setup session middleware
app.use(getSession());

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

// Auth routes
app.post("/api/admin/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password required" });
    }

    const adminUser = await storage.getAdminUserByUsername(username);
    if (!adminUser) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isValid = await verifyPassword(password, adminUser.password);
    if (!isValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    (req.session as any).adminId = adminUser.id;
    console.log("Login successful - setting session adminId:", adminUser.id);
    res.json({ message: "Login successful", user: { id: adminUser.id, username: adminUser.username } });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Login failed" });
  }
});

app.post("/api/admin/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: "Logout failed" });
    }
    res.json({ message: "Logout successful" });
  });
});

app.get("/api/admin/me", requireAuth, async (req, res) => {
  try {
    const adminId = (req.session as any).adminId;
    console.log("Admin me request - adminId:", adminId, "session:", req.session);
    const adminUser = await storage.getAdminUser(adminId);
    if (!adminUser) {
      console.log("Admin user not found for ID:", adminId);
      return res.status(401).json({ message: "User not found" });
    }
    res.json({ id: adminUser.id, username: adminUser.username });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ message: "Failed to fetch user" });
  }
});

// Create initial admin user (for setup)
app.post("/api/admin/setup", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password required" });
    }

    // Check if admin already exists
    const existingAdmin = await storage.getAdminUserByUsername(username);
    if (existingAdmin) {
      return res.status(400).json({ message: "Admin user already exists" });
    }

    const hashedPassword = await hashPassword(password);
    const adminUser = await storage.createAdminUser({ username, password: hashedPassword });
    
    res.json({ message: "Admin user created successfully", user: { id: adminUser.id, username: adminUser.username } });
  } catch (error) {
    console.error("Setup error:", error);
    res.status(500).json({ message: "Failed to create admin user" });
  }
});

// Profile routes
app.get("/api/profile", async (req, res) => {
  try {
    const profileData = await storage.getProfile();
    res.json(profileData);
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ message: "Failed to fetch profile" });
  }
});

app.put("/api/admin/profile", requireAuth, async (req, res) => {
  try {
    const validatedData = insertProfileSchema.partial().parse(req.body);
    const updatedProfile = await storage.updateProfile(validatedData);
    res.json(updatedProfile);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: "Validation error", 
        errors: error.errors 
      });
    }
    console.error("Update profile error:", error);
    res.status(500).json({ message: "Failed to update profile" });
  }
});

// API routes placeholder
app.get("/api/test", (req, res) => {
  res.json({ message: "API is working!" });
});

// Serve static files in production
if (process.env.NODE_ENV === "production") {
  const publicPath = path.join(__dirname, "../dist/public");
  app.use(express.static(publicPath));
  
  // Catch all handler for client-side routing
  app.get("*", (req, res) => {
    res.sendFile(path.join(publicPath, "index.html"));
  });
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});