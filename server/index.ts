import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { getSession, requireAuth, hashPassword, verifyPassword } from "./auth.js";
import { storage } from "./storage.js";
import { insertExperienceSchema, insertProfileSchema, insertAdminUserSchema, insertEducationSchema, insertCaseStudySchema } from "@shared/schema";
import { z } from "zod";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 5000;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

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

app.patch("/api/admin/experiences/reorder", requireAuth, async (req, res) => {
  try {
    const { experienceIds } = req.body;
    if (!Array.isArray(experienceIds) || experienceIds.some(id => typeof id !== 'number')) {
      return res.status(400).json({ message: "Invalid experience IDs array" });
    }
    await storage.reorderExperiences(experienceIds);
    res.json({ message: "Experiences reordered successfully" });
  } catch (error) {
    console.error("Reorder experiences error:", error);
    res.status(500).json({ message: "Failed to reorder experiences" });
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

app.patch("/api/admin/education/reorder", requireAuth, async (req, res) => {
  try {
    const { educationIds } = req.body;
    if (!Array.isArray(educationIds) || educationIds.some(id => typeof id !== 'number')) {
      return res.status(400).json({ message: "Invalid education IDs array" });
    }
    await storage.reorderEducation(educationIds);
    res.json({ message: "Education reordered successfully" });
  } catch (error) {
    console.error("Reorder education error:", error);
    res.status(500).json({ message: "Failed to reorder education" });
  }
});

// Case studies routes
app.get("/api/case-studies", async (req, res) => {
  try {
    const caseStudies = await storage.getPublishedCaseStudies();
    res.json(caseStudies);
  } catch (error) {
    console.error("Get case studies error:", error);
    res.status(500).json({ message: "Failed to fetch case studies" });
  }
});

app.get("/api/case-studies/:slug", async (req, res) => {
  try {
    const { slug } = req.params;
    const caseStudy = await storage.getCaseStudyBySlug(slug);
    if (!caseStudy || !caseStudy.isPublished) {
      return res.status(404).json({ message: "Case study not found" });
    }
    res.json(caseStudy);
  } catch (error) {
    console.error("Get case study by slug error:", error);
    res.status(500).json({ message: "Failed to fetch case study" });
  }
});

// Admin case studies management endpoints
app.get("/api/admin/case-studies", requireAuth, async (req, res) => {
  try {
    const caseStudies = await storage.getAllCaseStudies();
    res.json(caseStudies);
  } catch (error) {
    console.error("Get admin case studies error:", error);
    res.status(500).json({ message: "Failed to fetch case studies" });
  }
});

app.post("/api/admin/case-studies", requireAuth, async (req, res) => {
  try {
    const validatedData = insertCaseStudySchema.parse(req.body);
    const caseStudy = await storage.createCaseStudy(validatedData);
    res.status(201).json(caseStudy);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: "Validation error", 
        errors: error.errors 
      });
    }
    console.error("Create case study error:", error);
    res.status(500).json({ message: "Failed to create case study" });
  }
});

app.put("/api/admin/case-studies/:id", requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const validatedData = insertCaseStudySchema.partial().parse(req.body);
    const caseStudy = await storage.updateCaseStudy(id, validatedData);
    if (!caseStudy) {
      return res.status(404).json({ message: "Case study not found" });
    }
    res.json(caseStudy);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: "Validation error", 
        errors: error.errors 
      });
    }
    console.error("Update case study error:", error);
    res.status(500).json({ message: "Failed to update case study" });
  }
});

app.delete("/api/admin/case-studies/:id", requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const deleted = await storage.deleteCaseStudy(id);
    if (!deleted) {
      return res.status(404).json({ message: "Case study not found" });
    }
    res.json({ message: "Case study deleted successfully" });
  } catch (error) {
    console.error("Delete case study error:", error);
    res.status(500).json({ message: "Failed to delete case study" });
  }
});

// File Upload endpoints
app.post("/api/upload-image", requireAuth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: 0, message: "No file uploaded" });
    }

    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: "image",
          folder: "portfolio-uploads",
          transformation: [
            { width: 1200, height: 800, crop: "limit" },
            { quality: "auto:good" },
            { format: "auto" }
          ]
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(req.file!.buffer);
    });

    const uploadResult = result as any;

    // Return in Editor.js expected format
    res.json({
      success: 1,
      file: {
        url: uploadResult.secure_url,
        width: uploadResult.width,
        height: uploadResult.height
      }
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ 
      success: 0, 
      message: "Failed to upload image" 
    });
  }
});

// Security: Helper function to validate URLs for SSRF protection
function isExternalSafeUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return false;
    }
    
    // Block internal/private network ranges to prevent SSRF
    const hostname = parsed.hostname.toLowerCase();
    
    // Block localhost and loopback
    if (hostname === 'localhost' || hostname.startsWith('127.') || hostname === '::1') {
      return false;
    }
    
    // Block private IP ranges (10.x.x.x, 172.16-31.x.x, 192.168.x.x)
    if (hostname.match(/^10\./) || 
        hostname.match(/^172\.(1[6-9]|2[0-9]|3[01])\./) ||
        hostname.match(/^192\.168\./)) {
      return false;
    }
    
    // Block link-local addresses (169.254.x.x)
    if (hostname.match(/^169\.254\./)) {
      return false;
    }
    
    return true;
  } catch {
    return false;
  }
}

app.get("/api/fetch-url", requireAuth, async (req, res) => {
  try {
    const { url } = req.query;
    
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ 
        success: 0, 
        message: "URL parameter is required" 
      });
    }

    // Validate URL format and safety (prevent SSRF)
    if (!isExternalSafeUrl(url)) {
      return res.status(400).json({ 
        success: 0, 
        message: "Invalid or unsafe URL" 
      });
    }

    // Fetch URL metadata (simplified - you can enhance this with meta scraping)
    const response = await fetch(url, { 
      method: 'HEAD',
      headers: {
        'User-Agent': 'CareerCanvas-LinkFetcher/1.0'
      }
    });

    if (!response.ok) {
      return res.status(400).json({ 
        success: 0, 
        message: "URL is not accessible" 
      });
    }

    // Return basic link data for now
    res.json({
      success: 1,
      link: url,
      meta: {
        title: url,
        description: "External link",
        image: {
          url: ""
        }
      }
    });
  } catch (error) {
    console.error("URL fetch error:", error);
    res.status(500).json({ 
      success: 0, 
      message: "Failed to fetch URL metadata" 
    });
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