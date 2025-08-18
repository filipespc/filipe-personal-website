# CareerCanvas - Complete Portfolio Management System

## Overview
CareerCanvas is a comprehensive portfolio management system that allows professionals to create, manage, and showcase their career experiences, education, and case studies through a clean, professional interface with powerful admin capabilities.

## 🏗️ Architecture Overview

### Frontend Architecture
- **Framework**: React 18 with Vite
- **Routing**: Wouter (lightweight router)
- **State Management**: TanStack Query (React Query)
- **Styling**: Tailwind CSS with Shadcn/UI components
- **Forms**: React Hook Form with Zod validation
- **Rich Text**: Editor.js with custom tools
- **Drag & Drop**: @dnd-kit for sortable interfaces
- **Animations**: Framer Motion + Tailwind Animate

### Backend Architecture
- **Runtime**: Node.js with Express
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Express Session + Passport Local
- **File Upload**: Multer + Cloudinary integration
- **API**: RESTful with comprehensive admin endpoints

## 📊 Database Schema

### Core Tables

#### `profile` - System Configuration
```sql
- id (serial, primary key)
- name (text, default: "Your Name")
- briefIntro (text, professional summary)
- educationCategories (text[], predefined categories)
- toolsOrder (text[], admin-defined tool ordering)
- industriesOrder (text[], admin-defined industry ordering)
- updatedAt (timestamp)
```

#### `experiences` - Professional Experience
```sql
- id (serial, primary key)
- jobTitle (text, required)
- company (text, required)
- industry (text, required)
- startDate (text, YYYY-MM format)
- endDate (text, YYYY-MM format, nullable)
- isCurrentJob (boolean, default false)
- description (text, job description)
- accomplishments (text, key achievements)
- tools (text[], JSON objects: {name, usage})
```

#### `education` - Learning & Certifications
```sql
- id (serial, primary key)
- name (text, course/certification name)
- category (text, from predefined categories)
- link (text, optional URL)
- date (text, completion date or description)
- sortOrder (integer, manual ordering within categories)
```

#### `caseStudies` - Portfolio Projects
```sql
- id (serial, primary key)
- title (text, case study title)
- slug (text, unique URL slug)
- description (text, brief summary)
- content (text, Editor.js JSON content)
- featuredImage (text, Cloudinary URL)
- tags (text[], categorization tags)
- isPublished (boolean, visibility control)
- isFeatured (boolean, highlight control)
- createdAt/updatedAt (timestamps)
```

#### `adminUsers` - Authentication
```sql
- id (varchar, primary key)
- username (text, unique)
- password (text, bcrypt hashed)
- createdAt/updatedAt (timestamps)
```

#### `sessions` - Session Management
```sql
- sid (varchar, primary key)
- sess (jsonb, session data)
- expire (timestamp, expiration)
```

## 🎨 Component Architecture

### Public Interface Components

#### `HeroSection`
- Displays profile name (large typography)
- Orange accent line separator
- Professional bio paragraph
- Loading states with skeleton UI

#### `ExperienceManagement`
- Main content orchestrator
- Tab navigation (Work Experience, Education, Playground)
- View mode switching (All, By Tools, By Industries)
- Data processing and filtering logic

### Admin Interface Components

#### `ExperienceModal`
- Rich form for experience creation/editing
- Tool management with usage descriptions
- Date range handling (current job toggle)
- Zod validation integration

#### `EducationModal`
- Category-based education management
- Optional link handling
- Sort order management

#### `CaseStudyModal`
- Full Editor.js integration
- Featured image upload
- Tag management
- Publish/draft status control
- Slug generation and validation

### Utility Components

#### `FormattedText`
- Renders formatted text with proper line breaks
- Handles whitespace preservation
- Link detection and formatting

#### `SortableExperienceList`
- Drag-and-drop experience reordering
- Visual feedback during drag operations
- Auto-save functionality

### Editor.js Custom Tools

#### `HtmlParagraphTool`
- Custom paragraph tool with HTML preservation
- Enhanced formatting options
- Consistent styling integration

#### `InlineLinkTool`
- Inline link creation within paragraphs
- URL validation and preview
- Seamless text flow integration

#### `SimpleLinkTool`
- Standalone link blocks
- URL fetching for metadata
- Title and description extraction

## 🛠️ Complete UI Component Library

### Core Components (35+ Shadcn/UI)
- **Layout**: accordion, aspect-ratio, card, separator, sheet, sidebar
- **Navigation**: breadcrumb, command, menubar, navigation-menu, pagination
- **Forms**: form, input, input-otp, label, radio-group, select, switch, textarea, checkbox
- **Feedback**: alert, alert-dialog, toast, progress, skeleton
- **Overlays**: dialog, drawer, hover-card, popover, tooltip, context-menu, dropdown-menu
- **Data Display**: avatar, badge, table, calendar, carousel, chart
- **Interactive**: button, toggle, toggle-group, slider, collapsible, resizable-panels
- **Visualization**: scroll-area

## 🔌 API Endpoints

### Public Endpoints
```typescript
GET /api/profile              // Get profile information
GET /api/experiences          // List all experiences (public view)
GET /api/education           // List education items
GET /api/case-studies        // List published case studies
GET /api/case-studies/:slug  // Get individual case study
```

### Admin Endpoints
```typescript
// Authentication
POST /api/auth/login         // Admin login
POST /api/auth/logout        // Admin logout
GET /api/auth/check          // Check auth status
POST /api/auth/setup         // Initial admin setup

// Profile Management
PATCH /api/profile           // Update profile settings
PATCH /api/admin/tools-order      // Reorder tools display
PATCH /api/admin/industries-order // Reorder industries display

// Experience Management
GET /api/admin/experiences        // List experiences (admin view)
GET /api/admin/experiences/:id    // Get single experience
POST /api/admin/experiences       // Create experience
PUT /api/admin/experiences/:id    // Update experience
DELETE /api/admin/experiences/:id // Delete experience

// Education Management
POST /api/admin/education         // Create education item
PUT /api/admin/education/:id      // Update education item
DELETE /api/admin/education/:id   // Delete education item
PUT /api/admin/education/reorder  // Reorder education items

// Case Study Management
GET /api/admin/case-studies       // List case studies (admin)
POST /api/admin/case-studies      // Create case study
PUT /api/admin/case-studies/:id   // Update case study
DELETE /api/admin/case-studies/:id // Delete case study

// File Management
POST /api/upload-image       // Cloudinary image upload
GET /api/fetch-url           // URL metadata fetching
```

## 🎯 Key Features

### Content Management
1. **Rich Text Editing**: Full Editor.js implementation with custom tools
2. **File Upload**: Cloudinary integration with automatic resizing
3. **Drag & Drop**: Sortable interfaces for experience ordering
4. **Real-time Validation**: Zod schemas with React Hook Form
5. **Toast Notifications**: User feedback system

### Portfolio Display
1. **Multi-view Modes**: All, By Tools, By Industries filtering
2. **Professional Presentation**: Clean, responsive design
3. **Case Study Showcase**: Individual pages with rich content
4. **SEO-friendly**: Proper slug-based routing

### Admin Interface
1. **Complete CRUD**: All content types manageable
2. **Image Management**: Upload with preview and optimization
3. **Content Organization**: Custom ordering and categorization
4. **Publishing Control**: Draft/publish workflow

## 🛠️ Development Setup

### Local Development Server
**IMPORTANT**: Always use port 5173 for the local development server to ensure consistent development experience.

The Vite configuration is set to specifically use port 5173:
```typescript
// vite.config.ts
server: {
  port: 5173,  // Fixed port to avoid conflicts
  // ... other config
}
```

When starting the development server:
1. Kill any existing processes on port 5173: `pkill -f "npm run dev"`
2. Start the server: `npm run dev`
3. The client will always run on http://localhost:5173
4. The backend runs on http://localhost:5000

This ensures consistent URLs across development sessions and prevents port conflicts that could cause timeout issues.

## 🔧 Development Dependencies

### Core Frontend
```json
{
  "react": "^18.3.1",
  "react-dom": "^18.3.1",
  "vite": "^5.4.14",
  "@vitejs/plugin-react": "^4.3.2"
}
```

### Editor.js Ecosystem
```json
{
  "@editorjs/editorjs": "^2.30.8",
  "@editorjs/header": "^2.8.8",
  "@editorjs/paragraph": "^2.11.7",
  "@editorjs/list": "^2.0.8",
  "@editorjs/quote": "^2.7.6",
  "@editorjs/code": "^2.9.3",
  "@editorjs/delimiter": "^1.4.2",
  "@editorjs/inline-code": "^1.5.2",
  "@editorjs/marker": "^1.4.0",
  "@editorjs/image": "^2.10.2",
  "@editorjs/link": "^2.6.2"
}
```

### UI & Interaction
```json
{
  "@dnd-kit/core": "^6.3.1",
  "@dnd-kit/sortable": "^10.0.0",
  "@dnd-kit/utilities": "^3.2.2",
  "framer-motion": "^11.13.1",
  "tailwindcss-animate": "^1.0.7",
  "tw-animate-css": "^1.2.5",
  "react-icons": "^5.4.0"
}
```

### Radix UI Components (Complete Set)
```json
{
  "@radix-ui/react-accordion": "^1.2.4",
  "@radix-ui/react-alert-dialog": "^1.1.7",
  "@radix-ui/react-aspect-ratio": "^1.1.3",
  "@radix-ui/react-avatar": "^1.1.4",
  "@radix-ui/react-checkbox": "^1.1.5",
  "@radix-ui/react-collapsible": "^1.1.4",
  "@radix-ui/react-context-menu": "^2.2.7",
  "@radix-ui/react-dialog": "^1.1.7",
  "@radix-ui/react-dropdown-menu": "^2.1.7",
  "@radix-ui/react-hover-card": "^1.1.7",
  "@radix-ui/react-label": "^2.1.3",
  "@radix-ui/react-menubar": "^1.1.7",
  "@radix-ui/react-navigation-menu": "^1.2.6",
  "@radix-ui/react-popover": "^1.1.7",
  "@radix-ui/react-progress": "^1.1.3",
  "@radix-ui/react-radio-group": "^1.2.4",
  "@radix-ui/react-scroll-area": "^1.2.4",
  "@radix-ui/react-select": "^2.1.7",
  "@radix-ui/react-separator": "^1.1.3",
  "@radix-ui/react-slider": "^1.2.4",
  "@radix-ui/react-switch": "^1.1.4",
  "@radix-ui/react-tabs": "^1.1.4",
  "@radix-ui/react-toast": "^1.2.7",
  "@radix-ui/react-toggle": "^1.1.3",
  "@radix-ui/react-toggle-group": "^1.1.3",
  "@radix-ui/react-tooltip": "^1.2.0"
}
```

### Advanced UI Components
```json
{
  "embla-carousel-react": "^8.6.0",
  "react-resizable-panels": "^2.1.7",
  "recharts": "^2.15.2",
  "vaul": "^1.1.2",
  "input-otp": "^1.4.2",
  "react-day-picker": "^8.10.1",
  "cmdk": "^1.1.1"
}
```

### Backend & Database
```json
{
  "express": "^4.21.2",
  "drizzle-orm": "^0.39.1",
  "@neondatabase/serverless": "^0.10.4",
  "express-session": "^1.18.1",
  "connect-pg-simple": "^10.0.0",
  "passport": "^0.7.0",
  "passport-local": "^1.0.0",
  "bcrypt": "^6.0.0",
  "multer": "^2.0.1",
  "cloudinary": "^2.7.0"
}
```

### Utilities & Validation
```json
{
  "zod": "^3.24.2",
  "drizzle-zod": "^0.7.0",
  "zod-validation-error": "^3.4.0",
  "@hookform/resolvers": "^3.10.0",
  "react-hook-form": "^7.55.0",
  "memoizee": "^0.4.17",
  "date-fns": "^3.6.0"
}
```

## 🔒 Security Features

### Authentication
- Session-based authentication with secure cookies
- Bcrypt password hashing
- PostgreSQL session storage
- CSRF protection via session validation

### File Upload Security
- Cloudinary integration prevents direct server uploads
- File type validation
- Size restrictions
- Automatic image optimization

### Input Validation
- Zod schema validation on all inputs
- SQL injection prevention via Drizzle ORM
- XSS protection through proper escaping

## 📱 Mobile Responsiveness

### Responsive Design Features
- Mobile-first Tailwind CSS approach
- Touch-friendly drag & drop interfaces
- Optimized image loading and display
- Responsive typography scaling
- Mobile navigation patterns

### Device Detection
- `use-mobile` hook for device-specific logic
- Adaptive component rendering
- Performance optimizations for mobile

## 🚀 Performance Optimizations

### Frontend Optimizations
- React Query caching and background updates
- Lazy loading of heavy components
- Image optimization via Cloudinary
- Bundle splitting and code splitting
- Memoization of expensive computations

### Backend Optimizations
- Database query optimization
- Connection pooling
- Response caching where appropriate
- Efficient file upload handling

## 🎨 Design System

### Typography
- **Baron Neue**: Headlines and emphasis
- **Apercu**: Body text and UI elements
- Consistent scale and spacing
- Proper line height ratios

### Color Palette
- **Sollo Red**: `hsl(358, 69%, 50%)` - Primary actions, active states
- **Sollo Gold**: `hsl(39, 100%, 44%)` - Accents, call-to-action
- **Gray Scale**: Consistent neutral palette
- **Status Colors**: Success, warning, error states

### Spacing & Layout
- 8px grid system
- Consistent component spacing
- Responsive breakpoints
- Proper content max-widths

## 🧪 Testing Considerations

### Recommended Testing Strategy
1. **Unit Tests**: Component logic and utilities
2. **Integration Tests**: API endpoints and database operations
3. **E2E Tests**: Critical user flows (admin workflows)
4. **Visual Regression**: Design consistency

### Key Testing Areas
- Authentication flows
- CRUD operations
- File upload functionality
- Drag & drop interactions
- Form validations
- Rich text editing

## 📚 Documentation Standards

### Code Documentation
- TypeScript interfaces for all data structures
- JSDoc comments for complex functions
- README files for each major feature
- API endpoint documentation

### User Documentation
- Admin interface guides
- Content creation workflows
- Deployment instructions
- Configuration options

---

*This documentation serves as the complete reference for the CareerCanvas portfolio management system architecture, features, and implementation details.*