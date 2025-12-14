# AI Workspace Platform

A comprehensive AI tools workspace platform built with Next.js, featuring a Zendesk-style customizable interface where users can discover, organize, and access AI tools in their personalized workspace.

> 🚀 **Looking to deploy?** This is a full-stack application that requires server-side functionality. See the [Production Deployment](#production-deployment) section for instructions on deploying to Vercel (free tier available). **GitHub Pages is not supported** as it only serves static files.

## Features

### Core Functionality
- **Customizable Workspaces**: Drag-and-drop interface to arrange AI tools
- **AI Tools Directory**: Curated catalog of AI tools across multiple categories
- **User Authentication**: Secure signup/signin with NextAuth.js
- **Tool Submission System**: Developers can submit tools for review
- **Admin Dashboard**: Complete management system for tools, users, and submissions
- **Theme Customization**: Light/dark mode support
- **Search & Filter**: Advanced filtering by category, pricing, and keywords

### User Features
- Create and manage multiple workspaces
- Add/remove tools from workspace
- Customize workspace layout and theme
- Browse and discover new AI tools
- Submit tools for community review
- Track tool views and engagement

### Admin Features
- Review and approve tool submissions
- Manage all tools in the platform
- View platform statistics
- User management
- Tool analytics (views, clicks)

## Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: SQLite with Prisma ORM
- **Authentication**: NextAuth.js
- **UI Components**: Radix UI
- **Icons**: Lucide React

## Getting Started

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Clone the repository or navigate to the project directory

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
The `.env` file has been created with default values. Update these for production:
```
DATABASE_URL="file:./prisma/dev.db"
NEXTAUTH_SECRET="your-secure-random-secret"
NEXTAUTH_URL="http://localhost:3000"
```

4. Initialize the database:
```bash
npm run db:generate
npm run db:push
npm run db:seed
```

5. Start the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

### Default Admin Account
After seeding the database, you can login with:
- Email: `admin@aiworkspace.com`
- Password: `admin123`

**Important**: Change this password in production!

## Project Structure

```
ai-workspace-platform/
├── app/                      # Next.js app directory
│   ├── api/                 # API routes
│   │   ├── auth/           # Authentication endpoints
│   │   ├── tools/          # Tools CRUD endpoints
│   │   ├── workspace/      # Workspace management
│   │   ├── submissions/    # Tool submissions
│   │   ├── admin/          # Admin endpoints
│   │   └── categories/     # Category management
│   ├── auth/               # Auth pages (signin/signup)
│   ├── tools/              # Tools catalog pages
│   ├── workspace/          # User workspace page
│   ├── admin/              # Admin dashboard
│   ├── submit-tool/        # Tool submission form
│   └── page.tsx            # Homepage
├── components/             # React components
│   ├── ui/                # Reusable UI components
│   └── workspace/         # Workspace-specific components
├── lib/                   # Utility libraries
│   ├── prisma.ts         # Prisma client
│   ├── auth.ts           # Auth configuration
│   └── utils.ts          # Helper functions
├── prisma/               # Database schema and migrations
│   ├── schema.prisma     # Database schema
│   └── seed.ts           # Database seeding
└── types/                # TypeScript type definitions
```

## Key Features Breakdown

### 1. Workspace Management
- Users can create multiple workspaces
- Drag-and-drop tools to rearrange
- Customize theme (light/dark)
- Quick access to all added tools

### 2. Tools Directory
- Browse curated AI tools
- Filter by category, pricing, and search
- View detailed tool information
- Track tool popularity (views/clicks)

### 3. Tool Submission
- Developers submit tools via form
- Admin review and approval workflow
- Automatic tool creation on approval
- Submission status tracking

### 4. Admin Dashboard
- Platform statistics overview
- Tool submission review queue
- Approve/reject submissions
- Tool and user management

## Database Schema

The platform uses the following main models:
- **User**: User accounts and authentication
- **Workspace**: User workspaces
- **WorkspaceTool**: Tools added to workspaces
- **Tool**: AI tool catalog
- **ToolSubmission**: Tool submissions for review
- **Category**: Tool categories
- **Advertisement**: Ad management (extensible)

## API Endpoints

### Public Routes
- `GET /api/tools` - List all tools
- `GET /api/tools/[id]` - Get tool details
- `GET /api/categories` - List categories
- `POST /api/auth/signup` - User registration

### Protected Routes (Authenticated Users)
- `GET /api/workspace` - Get user workspaces
- `POST /api/workspace` - Create workspace
- `PATCH /api/workspace/[id]` - Update workspace
- `POST /api/workspace/[id]/tools` - Add tool to workspace
- `DELETE /api/workspace/[id]/tools/[toolId]` - Remove tool
- `POST /api/submissions` - Submit tool
- `GET /api/submissions` - Get user submissions

### Admin Routes
- `GET /api/admin/stats` - Platform statistics
- `GET /api/admin/submissions` - All submissions
- `PATCH /api/admin/submissions/[id]` - Review submission
- `GET /api/admin/tools` - Manage tools
- `PATCH /api/admin/tools/[id]` - Update tool
- `DELETE /api/admin/tools/[id]` - Delete tool

## Customization

### Adding New Categories
Edit `prisma/seed.ts` to add new categories, then run:
```bash
npm run db:seed
```

### Theme Customization
Edit `app/globals.css` to modify the color scheme and design tokens.

### Adding Features
The platform is designed to be extensible. Key areas for enhancement:
- Advertisement system (schema ready, needs UI)
- Advanced analytics
- User profiles
- Tool ratings and reviews
- API integrations
- Payment processing for premium features

## Production Deployment

> ⚠️ **Important**: This is a full-stack Next.js application with authentication, API routes, and database. It **CANNOT** be deployed to GitHub Pages, which only serves static files.

### Recommended: Deploy to Vercel (Free Tier Available)

Vercel is the creator of Next.js and provides the best hosting experience with zero configuration.

#### Quick Deploy to Vercel

1. **Push your code to GitHub** (already done!)

2. **Sign up for Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Sign up with your GitHub account (free)

3. **Import your repository**
   - Click "Add New Project"
   - Select your `madcrx/AI-Workspace` repository
   - Click "Import"

4. **Configure Environment Variables**

   Add these in the Vercel dashboard during setup:

   ```
   DATABASE_URL=file:./prisma/dev.db
   NEXTAUTH_SECRET=your-secure-random-string-here
   NEXTAUTH_URL=https://your-project-name.vercel.app
   ```

   **Generate a secure NEXTAUTH_SECRET:**
   ```bash
   openssl rand -base64 32
   ```

5. **Deploy**
   - Click "Deploy"
   - Vercel will automatically build and deploy your app
   - Your app will be live at `https://your-project-name.vercel.app`

6. **Initialize Database**

   After first deployment, run the seed command:
   - Go to your Vercel project dashboard
   - Navigate to Settings > Functions
   - Or use Vercel CLI:
   ```bash
   npm i -g vercel
   vercel login
   vercel link
   vercel env pull
   npm run db:seed
   ```

#### For Production Database (Recommended)

For a production app, upgrade from SQLite to PostgreSQL:

1. **Get a PostgreSQL database** (Free options):
   - [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres) (Free tier)
   - [Neon](https://neon.tech) (Free tier)
   - [Supabase](https://supabase.com) (Free tier)

2. **Update your database configuration**:

   In `prisma/schema.prisma`, change:
   ```prisma
   datasource db {
     provider = "postgresql"  // Changed from sqlite
     url      = env("DATABASE_URL")
   }
   ```

3. **Update environment variable** in Vercel:
   ```
   DATABASE_URL=postgresql://user:password@host:5432/database
   ```

4. **Deploy and migrate**:
   ```bash
   git add .
   git commit -m "Switch to PostgreSQL"
   git push
   # Vercel will auto-deploy
   ```

### Alternative Deployment Options

#### Option 2: Netlify
1. Connect your GitHub repo to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `.next`
4. Add environment variables
5. Deploy

#### Option 3: Railway
1. Go to [railway.app](https://railway.app)
2. "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. Add environment variables
5. Railway auto-detects Next.js and deploys

#### Option 4: Self-Hosted VPS
If you have your own server:
```bash
npm run build
npm start
# Use PM2 or systemd to keep it running
```

### Environment Variables for Production

Required variables:
```env
DATABASE_URL="your-production-database-url"
NEXTAUTH_SECRET="secure-random-string"
NEXTAUTH_URL="https://yourdomain.com"
```

### Post-Deployment

1. **Change admin password** immediately after first login
2. **Set up custom domain** in Vercel/Netlify settings
3. **Enable HTTPS** (automatic on Vercel/Netlify)
4. **Monitor your app** using Vercel Analytics or similar

### Build
```bash
npm run build
npm start
```

## Development Commands

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:push` - Push schema to database
- `npm run db:generate` - Generate Prisma client
- `npm run db:studio` - Open Prisma Studio
- `npm run db:seed` - Seed database with sample data

## Security Considerations

- All API routes check authentication
- Admin routes verify admin role
- Passwords are hashed with bcrypt
- SQL injection protected by Prisma
- XSS protection via React
- CSRF tokens via NextAuth

## Contributing

This is a complete, production-ready platform. To extend:
1. Follow the existing code structure
2. Add tests for new features
3. Update documentation
4. Ensure type safety

## License

This project is built for educational and commercial use.

## Support

For issues and questions:
- Check the documentation
- Review the code comments
- Inspect the database schema
- Test with the provided seed data

---

Built with Next.js, TypeScript, and modern web technologies.
