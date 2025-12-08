# System Architecture

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENT (Browser)                        │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │   Homepage   │  │    Tools     │  │  Workspace   │    │
│  │              │  │   Catalog    │  │              │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │ Auth Pages   │  │ Submit Tool  │  │    Admin     │    │
│  │              │  │              │  │  Dashboard   │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
└─────────────────────────────────────────────────────────────┘
                            │
                            ↓ HTTP/HTTPS
┌─────────────────────────────────────────────────────────────┐
│                   NEXT.JS 14 (App Router)                   │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │              SERVER COMPONENTS (SSR)                   │ │
│  │  • Homepage Layout     • Tool Pages                    │ │
│  │  • Auth Pages          • Admin Pages                   │ │
│  │  • Workspace Pages     • Tool Submission               │ │
│  └───────────────────────────────────────────────────────┘ │
│                            │                                │
│  ┌───────────────────────────────────────────────────────┐ │
│  │           API ROUTES (Backend)                        │ │
│  │                                                        │ │
│  │  /api/auth/*           Authentication                 │ │
│  │  /api/tools/*          Tool Management                │ │
│  │  /api/workspace/*      Workspace Management           │ │
│  │  /api/submissions/*    Tool Submissions               │ │
│  │  /api/admin/*          Admin Operations               │ │
│  │  /api/categories/*     Category Management            │ │
│  └───────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            │
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                  MIDDLEWARE LAYER                           │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │  NextAuth.js │  │  Validation  │  │     CORS     │    │
│  │      JWT     │  │    (Zod)     │  │   Security   │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
└─────────────────────────────────────────────────────────────┘
                            │
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                     PRISMA ORM                              │
│                                                             │
│  • Query Builder        • Type Safety                      │
│  • Migrations          • Client Generation                 │
│  • Relations           • Transactions                      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                 DATABASE (SQLite/PostgreSQL)                │
│                                                             │
│  ┌──────┐ ┌──────────┐ ┌──────────┐ ┌────────────────┐   │
│  │ User │ │Workspace │ │   Tool   │ │ToolSubmission  │   │
│  └──────┘ └──────────┘ └──────────┘ └────────────────┘   │
│                                                             │
│  ┌────────────┐ ┌──────────┐ ┌────────────────┐          │
│  │WorkspaceTool│ │ Category │ │ Advertisement │          │
│  └────────────┘ └──────────┘ └────────────────┘          │
└─────────────────────────────────────────────────────────────┘
```

## Component Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   UI COMPONENT LIBRARY                      │
│                                                             │
│  Radix UI Primitives:                                      │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐    │
│  │  Button  │ │   Card   │ │  Dialog  │ │   Tabs   │    │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘    │
│                                                             │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐    │
│  │  Input   │ │  Label   │ │  Badge   │ │  Toast   │    │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘    │
│                                                             │
│  Custom Components:                                        │
│  ┌────────────────┐ ┌────────────────┐                   │
│  │ WorkspaceGrid  │ │  ToolPicker    │                   │
│  └────────────────┘ └────────────────┘                   │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow

### User Authentication Flow
```
1. User enters credentials
   ↓
2. POST /api/auth/signin
   ↓
3. NextAuth validates credentials
   ↓
4. Bcrypt verifies password hash
   ↓
5. JWT token generated
   ↓
6. Session created
   ↓
7. User redirected to workspace
```

### Tool Addition to Workspace Flow
```
1. User clicks "Add Tools" button
   ↓
2. ToolPicker dialog opens
   ↓
3. GET /api/tools (fetch available tools)
   ↓
4. User selects a tool
   ↓
5. POST /api/workspace/{id}/tools
   ↓
6. Prisma creates WorkspaceTool record
   ↓
7. Workspace refreshes with new tool
```

### Tool Submission & Approval Flow
```
1. Developer fills submission form
   ↓
2. POST /api/submissions
   ↓
3. Validation with Zod
   ↓
4. ToolSubmission created (status: PENDING)
   ↓
5. Admin views in dashboard
   ↓
6. Admin approves submission
   ↓
7. PATCH /api/admin/submissions/{id}
   ↓
8. Tool created from submission
   ↓
9. ToolSubmission status updated (APPROVED)
   ↓
10. Tool appears in catalog
```

## Database Schema Relationships

```
┌────────────────────────────────────────────────────────┐
│                    User (1)                            │
│  • id, email, password, role                          │
└─────────┬──────────────────────────┬───────────────────┘
          │                          │
          │ (1:N)                    │ (1:N)
          ↓                          ↓
┌──────────────────┐        ┌───────────────────┐
│  Workspace (N)   │        │ ToolSubmission(N) │
│  • userId        │        │ • userId          │
│  • name, theme   │        │ • status          │
└────────┬─────────┘        └───────────────────┘
         │
         │ (1:N)
         ↓
┌─────────────────────┐
│ WorkspaceTool (N)   │
│ • workspaceId       │
│ • toolId            │───────┐
│ • position, grid    │       │
└─────────────────────┘       │ (N:1)
                              ↓
                    ┌──────────────────┐
                    │    Tool (1)      │
                    │ • name, slug     │
                    │ • category       │
                    │ • pricing        │
                    └──────────────────┘
                              │
                              │ (N:1)
                              ↓
                    ┌──────────────────┐
                    │  Category (1)    │
                    │ • name, slug     │
                    └──────────────────┘
```

## API Endpoint Structure

```
/api
├── auth/
│   ├── [...nextauth]/           # NextAuth endpoints
│   │   └── route.ts
│   └── signup/
│       └── route.ts             # User registration
│
├── tools/
│   ├── route.ts                 # GET (list), POST (create)
│   └── [id]/
│       ├── route.ts             # GET, PATCH, DELETE
│       └── click/
│           └── route.ts         # POST (track clicks)
│
├── workspace/
│   ├── route.ts                 # GET, POST
│   └── [id]/
│       ├── route.ts             # PATCH, DELETE
│       └── tools/
│           ├── route.ts         # POST, PATCH
│           └── [toolId]/
│               └── route.ts     # DELETE
│
├── submissions/
│   └── route.ts                 # GET, POST
│
├── admin/
│   ├── stats/
│   │   └── route.ts             # GET
│   ├── tools/
│   │   ├── route.ts             # GET
│   │   └── [id]/
│   │       └── route.ts         # PATCH, DELETE
│   └── submissions/
│       ├── route.ts             # GET
│       └── [id]/
│           └── route.ts         # PATCH
│
└── categories/
    └── route.ts                 # GET
```

## Security Layers

```
┌─────────────────────────────────────────────────────────┐
│                    REQUEST                              │
└────────────────────┬────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────┐
│              HTTPS/TLS Encryption                       │
└────────────────────┬────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────┐
│          NextAuth Session Validation                    │
│          • JWT verification                             │
│          • Session expiry check                         │
└────────────────────┬────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────┐
│         Role-Based Access Control (RBAC)                │
│         • User role check                               │
│         • Admin verification                            │
└────────────────────┬────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────┐
│            Input Validation (Zod)                       │
│            • Schema validation                          │
│            • Type checking                              │
└────────────────────┬────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────┐
│        SQL Injection Protection (Prisma)                │
│        • Parameterized queries                          │
│        • Type-safe operations                           │
└────────────────────┬────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────┐
│                  DATABASE                               │
└─────────────────────────────────────────────────────────┘
```

## File System Structure

```
/
├── app/                         # Next.js App Directory
│   ├── api/                    # Backend API routes
│   ├── auth/                   # Authentication pages
│   ├── tools/                  # Tool catalog pages
│   ├── workspace/              # User workspace
│   ├── admin/                  # Admin dashboard
│   ├── submit-tool/            # Tool submission
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Homepage
│   ├── providers.tsx           # Context providers
│   └── globals.css             # Global styles
│
├── components/                  # React components
│   ├── ui/                     # Reusable UI components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   └── ...
│   └── workspace/              # Workspace components
│       ├── workspace-grid.tsx
│       └── tool-picker.tsx
│
├── lib/                        # Utility libraries
│   ├── prisma.ts              # Prisma client
│   ├── auth.ts                # Auth configuration
│   └── utils.ts               # Helper functions
│
├── prisma/                     # Database
│   ├── schema.prisma          # Schema definition
│   ├── seed.ts                # Seed script
│   └── dev.db                 # SQLite database
│
├── types/                      # TypeScript types
│   └── next-auth.d.ts         # NextAuth types
│
├── public/                     # Static assets
│
└── [config files]             # Configuration
    ├── package.json
    ├── tsconfig.json
    ├── tailwind.config.ts
    ├── next.config.mjs
    ├── .env
    └── ...
```

## Technology Stack Details

### Frontend Stack
```
React 18.3.1
  ↓
Next.js 14.2.18 (App Router)
  ↓
TypeScript 5.6.3
  ↓
Tailwind CSS 3.4.15
  ↓
Radix UI Components
  ↓
Lucide Icons
```

### Backend Stack
```
Next.js API Routes
  ↓
Prisma ORM 5.22.0
  ↓
SQLite (dev) / PostgreSQL (prod)
  ↓
NextAuth.js 4.24.10
  ↓
Bcrypt.js 2.4.3
  ↓
Zod 3.23.8
```

## Deployment Architecture

### Development
```
Local Machine
  ├── npm run dev (port 3000)
  ├── SQLite database
  └── Hot module reload
```

### Production (Recommended: Vercel)
```
Vercel Edge Network
  ├── CDN (Static assets)
  ├── Edge Functions (API routes)
  ├── Server Components (SSR)
  └── PostgreSQL Database (Vercel Postgres)
```

### Production (Alternative: VPS)
```
VPS (DigitalOcean, AWS, etc.)
  ├── Nginx (Reverse proxy)
  ├── PM2 (Process manager)
  ├── Node.js Server
  ├── PostgreSQL Database
  └── SSL/TLS (Let's Encrypt)
```

## Performance Optimizations

### Implemented
- Server-side rendering for initial load
- Automatic code splitting
- Static asset optimization
- Efficient database queries
- Connection pooling ready
- Image optimization ready

### Available Optimizations
- Redis caching layer
- CDN for static assets
- Database read replicas
- Edge functions
- Incremental static regeneration
- Lazy loading components

## Scalability Considerations

### Horizontal Scaling
```
Load Balancer
  ├── App Instance 1
  ├── App Instance 2
  ├── App Instance 3
  └── ...
       ↓
  Shared Database
  Shared Session Store (Redis)
```

### Vertical Scaling
```
More powerful server
  ├── Increased CPU
  ├── More RAM
  ├── Faster storage
  └── Better database performance
```

---

This architecture provides:
✅ Separation of concerns
✅ Scalability
✅ Security
✅ Maintainability
✅ Performance
✅ Developer experience
