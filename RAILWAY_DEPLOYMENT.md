# Railway Deployment Guide

> **Platform**: Railway.app  
> **Application**: filipe-personal-website (CareerCanvas Portfolio)  
> **Database**: PostgreSQL (Railway-managed)  
> **File Storage**: Cloudinary CDN

## 🚂 Railway Configuration

### Current Railway Setup
```toml
# railway.toml
[build]
builder = "nixpacks"

[deploy]
startCommand = "npm run start"
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 10
```

### Build Process
1. **Build Command**: `npm run build`
   - Runs Vite build for frontend assets
   - Bundles server with esbuild for production
   - Outputs to `dist/` directory

2. **Start Command**: `npm run start`
   - Runs `NODE_ENV=production node dist/index.js`
   - Serves both API and static assets

## 🔧 Environment Variables Setup

### Required Environment Variables in Railway

#### Database Configuration
```bash
# Database URL (automatically provided by Railway PostgreSQL service)
DATABASE_URL=postgresql://user:password@host:port/database

# Alternative individual database config (if not using DATABASE_URL)
DB_HOST=your-railway-postgres-host
DB_PORT=5432
DB_NAME=railway
DB_USER=postgres
DB_PASSWORD=your-generated-password
```

#### Authentication & Security
```bash
# Session secret (generate a strong random string)
SESSION_SECRET=your-super-secure-session-secret-here

# Node environment
NODE_ENV=production

# Application port (Railway auto-assigns, usually 3000)
PORT=3000
```

#### File Upload Configuration (When Implemented)
```bash
# Cloudinary configuration for image uploads
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

# Optional: Upload folder organization
CLOUDINARY_FOLDER=filipe-portfolio
```

#### Optional Configuration
```bash
# Enable detailed logging in production
DEBUG=false

# Database connection pool settings
DB_MAX_CONNECTIONS=20
DB_IDLE_TIMEOUT=30000
```

## 🗄️ Database Setup

### Railway PostgreSQL Service
1. **Add PostgreSQL Service**:
   ```bash
   # In Railway dashboard:
   # 1. Go to your project
   # 2. Click "Add Service" → "Database" → "PostgreSQL"
   # 3. Railway automatically provisions and connects the database
   ```

2. **Database URL**: Railway automatically provides `DATABASE_URL` environment variable

### Database Migration & Setup
```bash
# Run these commands after deployment or during setup

# Generate migration files (if schema changes)
npm run db:generate

# Push schema to database (creates tables)
npm run db:push

# Alternative: Run migrations (if using migration files)
npm run db:migrate
```

### Initial Database Setup Script
```sql
-- This runs automatically via Drizzle schema
-- Tables created: profile, experiences, education, caseStudies, adminUsers, sessions

-- Optional: Insert default profile data
INSERT INTO profile (name, brief_intro) VALUES (
  'Filipe Carneiro',
  'Professional with extensive experience in building scalable digital products and leading cross-functional teams across various industries.'
) ON CONFLICT (id) DO NOTHING;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_experiences_company ON experiences(company);
CREATE INDEX IF NOT EXISTS idx_experiences_industry ON experiences(industry);
CREATE INDEX IF NOT EXISTS idx_case_studies_slug ON case_studies(slug);
CREATE INDEX IF NOT EXISTS idx_case_studies_published ON case_studies(is_published);
```

## 🚀 Deployment Process

### Method 1: Git Integration (Recommended)
1. **Connect GitHub Repository**:
   ```bash
   # In Railway dashboard:
   # 1. Connect your GitHub account
   # 2. Select the repository: filipe-personal-website
   # 3. Railway auto-deploys on push to main branch
   ```

2. **Automatic Deployments**:
   - Push to `main` branch triggers automatic deployment
   - Railway builds and deploys automatically
   - Zero-downtime deployment with health checks

### Method 2: Railway CLI
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Initialize project (run in project root)
railway init

# Deploy manually
railway up
```

### Method 3: Docker Deployment (Advanced)
```dockerfile
# Dockerfile (if needed for custom deployment)
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Build application
RUN npm run build

# Expose port
EXPOSE 3000

# Start application
CMD ["npm", "start"]
```

## 🔒 Security Configuration

### Railway Security Settings
```bash
# Environment variables in Railway dashboard:
# 1. Go to project → Variables tab
# 2. Add all required environment variables
# 3. Mark sensitive variables as "SECRET"

# Security headers (handled in Express app)
# - CORS configuration
# - Session security
# - CSRF protection (via session validation)
```

### Production Security Checklist
- [ ] Strong `SESSION_SECRET` (minimum 32 characters)
- [ ] Database credentials secure (Railway manages this)
- [ ] HTTPS enabled (Railway provides SSL certificates)
- [ ] Environment variables properly configured
- [ ] Session configuration secure
- [ ] File upload restrictions configured (when implemented)

## 📊 Monitoring & Logs

### Railway Monitoring
```bash
# View logs in Railway dashboard
# 1. Go to project → Deployments
# 2. Click on active deployment
# 3. View "Logs" tab for real-time logs

# Or use Railway CLI
railway logs
```

### Health Check Endpoint
```typescript
// Add to server/index.ts for Railway health checks
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  });
});
```

### Performance Monitoring
- Railway provides built-in metrics
- Monitor CPU, memory, and request metrics
- Set up alerts for deployment failures

## 🔄 Deployment Workflow

### Pre-Deployment Checklist
- [ ] All environment variables configured in Railway
- [ ] Database service connected and running
- [ ] Build command works locally (`npm run build`)
- [ ] Start command works locally (`npm run start`)
- [ ] All sensitive data removed from code
- [ ] Dependencies properly listed in package.json

### Deployment Steps
1. **Push Code to Repository**:
   ```bash
   git add .
   git commit -m "Deploy to production"
   git push origin main
   ```

2. **Railway Auto-Deployment**:
   - Railway detects push
   - Runs build process
   - Deploys new version
   - Health checks ensure success

3. **Post-Deployment Verification**:
   - Check deployment status in Railway dashboard
   - Verify application is accessible
   - Test critical functionality
   - Monitor logs for errors

### Rollback Process
```bash
# In Railway dashboard:
# 1. Go to Deployments
# 2. Find previous successful deployment
# 3. Click "Redeploy" to rollback
```

## 🗄️ Database Management

### Database Backup
```bash
# Railway provides automatic backups
# Manual backup via Railway CLI:
railway db backup

# Export database (if needed)
pg_dump $DATABASE_URL > backup.sql
```

### Database Maintenance
```bash
# Connect to Railway database
railway db connect

# Or use external tools with DATABASE_URL
psql $DATABASE_URL
```

### Schema Updates
```bash
# When making schema changes:
1. Update shared/schema.ts
2. Generate migration: npm run db:generate
3. Test locally with: npm run db:push
4. Deploy code (Railway will run migrations)
```

## 🌐 Custom Domain Setup (Optional)

### Domain Configuration
1. **Add Custom Domain in Railway**:
   ```bash
   # In Railway dashboard:
   # 1. Go to project → Settings
   # 2. Click "Domains"
   # 3. Add your custom domain
   # 4. Configure DNS records as instructed
   ```

2. **DNS Configuration**:
   ```bash
   # Add CNAME record in your DNS provider:
   # CNAME: your-domain.com → your-app.railway.app
   ```

3. **SSL Certificate**:
   - Railway automatically provisions SSL certificates
   - HTTPS enforced automatically

## 🐛 Troubleshooting

### Common Deployment Issues

#### Build Failures
```bash
# Check build logs in Railway dashboard
# Common issues:
# - Missing dependencies in package.json
# - TypeScript errors
# - Environment variable issues

# Solution: Fix issues locally and redeploy
npm run build  # Test locally first
```

#### Database Connection Issues
```bash
# Check if DATABASE_URL is set correctly
echo $DATABASE_URL

# Verify database service is running in Railway dashboard
# Check connection in application logs
```

#### Port Binding Issues
```bash
# Ensure application listens on Railway-provided PORT
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
```

#### Memory/Resource Issues
```bash
# Monitor resource usage in Railway dashboard
# Upgrade plan if needed
# Optimize build process if memory issues during build
```

### Debugging Commands
```bash
# View deployment logs
railway logs --follow

# Check service status
railway status

# Connect to database for debugging
railway db connect

# Access deployed application shell (if available)
railway shell
```

## 📈 Scaling & Performance

### Railway Scaling Options
- **Vertical Scaling**: Upgrade to higher tier plans for more CPU/memory
- **Horizontal Scaling**: Currently not supported on Railway (single instance)
- **Database Scaling**: Upgrade PostgreSQL plan for more connections/storage

### Performance Optimization
```javascript
// Add to server configuration
// Enable gzip compression
app.use(compression());

// Static file caching
app.use(express.static('dist', {
  maxAge: '1d',
  etag: true
}));

// Database connection pooling
// Configure in db.ts with appropriate pool settings
```

## 💰 Cost Management

### Railway Pricing Tiers
- **Hobby Plan**: $5/month (sufficient for personal portfolio)
- **Pro Plan**: $20/month (for higher traffic/resource needs)
- **Database**: Additional cost based on usage

### Cost Optimization
- Monitor resource usage regularly
- Optimize database queries
- Use Cloudinary's free tier for image storage
- Implement proper caching strategies

---

## 🚀 Quick Deployment Summary

```bash
# 1. Environment Setup
# Set all required environment variables in Railway dashboard

# 2. Database Setup
# Add PostgreSQL service in Railway, run db:push after deployment

# 3. Deploy
git push origin main  # Auto-deploys via GitHub integration

# 4. Verify
# Check Railway dashboard for deployment status and logs
```

---

*Last Updated: [Current Date]*  
*This deployment guide covers the current Railway setup and should be updated as the application evolves.*