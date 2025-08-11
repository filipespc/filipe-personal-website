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

// Admin authentication endpoints
app.post("/api/admin/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password required" });
    }

    // Get admin user from database
    const adminUser = await storage.getAdminUserByUsername(username);
    if (!adminUser) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Verify password against hash
    const isValid = await verifyPassword(password, adminUser.password);
    if (!isValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Create session
    req.session.userId = adminUser.id.toString();
    req.session.username = adminUser.username;
    
    res.json({ 
      id: adminUser.id, 
      username: adminUser.username 
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Login failed" });
  }
});

app.post("/api/admin/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Logout error:", err);
      return res.status(500).json({ message: "Logout failed" });
    }
    res.clearCookie('connect.sid');
    res.json({ message: "Logged out successfully" });
  });
});

app.get("/api/admin/me", async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const adminUser = await storage.getAdminUser(req.session.userId);
    if (!adminUser) {
      return res.status(401).json({ message: "User not found" });
    }
    
    res.json({
      id: adminUser.id,
      username: adminUser.username
    });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ message: "Failed to fetch user" });
  }
});

// Setup endpoint removed - using fixed credentials now

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

// Experiences routes
app.get("/api/experiences", async (req, res) => {
  try {
    const experiences = await storage.getAllExperiences();
    res.json(experiences);
  } catch (error) {
    console.error("Get experiences error:", error);
    res.status(500).json({ message: "Failed to fetch experiences" });
  }
});

// Admin experience management endpoints
app.get("/api/admin/experiences", requireAuth, async (req, res) => {
  try {
    const experiences = await storage.getAllExperiences();
    res.json(experiences);
  } catch (error) {
    console.error("Get admin experiences error:", error);
    res.status(500).json({ message: "Failed to fetch experiences" });
  }
});

app.post("/api/admin/experiences", requireAuth, async (req, res) => {
  try {
    const validatedData = insertExperienceSchema.parse(req.body);
    const experience = await storage.createExperience(validatedData);
    res.status(201).json(experience);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: "Validation error", 
        errors: error.errors 
      });
    }
    console.error("Create experience error:", error);
    res.status(500).json({ message: "Failed to create experience" });
  }
});

app.put("/api/admin/experiences/:id", requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const validatedData = insertExperienceSchema.parse(req.body);
    const experience = await storage.updateExperience(id, validatedData);
    if (!experience) {
      return res.status(404).json({ message: "Experience not found" });
    }
    res.json(experience);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: "Validation error", 
        errors: error.errors 
      });
    }
    console.error("Update experience error:", error);
    res.status(500).json({ message: "Failed to update experience" });
  }
});

app.delete("/api/admin/experiences/:id", requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const deleted = await storage.deleteExperience(id);
    if (!deleted) {
      return res.status(404).json({ message: "Experience not found" });
    }
    res.json({ message: "Experience deleted successfully" });
  } catch (error) {
    console.error("Delete experience error:", error);
    res.status(500).json({ message: "Failed to delete experience" });
  }
});

// Education routes
app.get("/api/education", async (req, res) => {
  try {
    const education = await storage.getAllEducation();
    res.json(education);
  } catch (error) {
    console.error("Get education error:", error);
    res.status(500).json({ message: "Failed to fetch education" });
  }
});

// Admin education management endpoints
app.get("/api/admin/education", requireAuth, async (req, res) => {
  try {
    const education = await storage.getAllEducation();
    res.json(education);
  } catch (error) {
    console.error("Get admin education error:", error);
    res.status(500).json({ message: "Failed to fetch education" });
  }
});

app.post("/api/admin/education", requireAuth, async (req, res) => {
  try {
    const validatedData = insertEducationSchema.parse(req.body);
    const newEducation = await storage.createEducation(validatedData);
    res.json(newEducation);
  } catch (error) {
    console.error("Create education error:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Validation error", errors: error.errors });
    }
    res.status(500).json({ message: "Failed to create education" });
  }
});

app.put("/api/admin/education/:id", requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const validatedData = insertEducationSchema.partial().parse(req.body);
    const updatedEducation = await storage.updateEducation(id, validatedData);
    if (!updatedEducation) {
      return res.status(404).json({ message: "Education not found" });
    }
    res.json(updatedEducation);
  } catch (error) {
    console.error("Update education error:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Validation error", errors: error.errors });
    }
    res.status(500).json({ message: "Failed to update education" });
  }
});

app.delete("/api/admin/education/:id", requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const deleted = await storage.deleteEducation(id);
    if (!deleted) {
      return res.status(404).json({ message: "Education not found" });
    }
    res.json({ message: "Education deleted successfully" });
  } catch (error) {
    console.error("Delete education error:", error);
    res.status(500).json({ message: "Failed to delete education" });
  }
});

// Case studies routes
app.get("/api/case-studies", async (req, res) => {
  try {
    const caseStudies = await storage.getAllCaseStudies();
    res.json(caseStudies);
  } catch (error) {
    console.error("Get case studies error:", error);
    res.status(500).json({ message: "Failed to fetch case studies" });
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