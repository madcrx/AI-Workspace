# Production Database Setup Guide

Complete guide for setting up PostgreSQL database for your AI Workspace platform.

---

## 🎯 Why PostgreSQL?

**SQLite (Current)** is great for development but has limitations:
- ❌ Not suitable for production/multiple users
- ❌ File-based (can't scale)
- ❌ Limited concurrent connections
- ❌ No replication/backup

**PostgreSQL (Recommended)** for production:
- ✅ Handles thousands of concurrent users
- ✅ Automatic backups
- ✅ Scales easily
- ✅ Industry standard
- ✅ Free tier available

---

## 📋 Database Options Comparison

| Provider | Free Tier | Max DB Size | Auto Backups | Best For |
|----------|-----------|-------------|--------------|----------|
| **Vercel Postgres** | ✅ Yes | 256 MB | ✅ Yes | Vercel deployments |
| **Neon** | ✅ Yes | 10 GB | ✅ Yes | All platforms |
| **Supabase** | ✅ Yes | 500 MB | ✅ Yes | Full-stack apps |
| **Railway** | ✅ Yes | 1 GB | ✅ Yes | Simple setup |
| **PlanetScale** | ✅ Yes | 5 GB | ✅ Yes | MySQL alternative |

**Recommendation:** Vercel Postgres (if using Vercel) or Neon (most generous free tier)

---

## 🚀 Option 1: Vercel Postgres (Recommended)

### Overview
- **Best if**: You're deploying to Vercel
- **Free tier**: 256 MB storage, 60 hours compute/month
- **Setup time**: 2 minutes
- **Difficulty**: ⭐ Easiest

### Step 1: Create Database

1. **Go to Vercel Dashboard**
   - Open your `AI-Workspace` project
   - Click **"Storage"** tab

2. **Create Postgres Database**
   - Click **"Create Database"**
   - Select **"Postgres"**
   - Database name: `ai-workspace-db` (auto-generated)
   - Region: Select closest to your users
     - `us-east-1` - US East
     - `eu-west-1` - Europe
     - `ap-southeast-1` - Asia
   - Click **"Create"**

3. **Wait for Provisioning**
   - Takes 30-60 seconds
   - Database status: **"Ready"**

### Step 2: Automatic Configuration

Vercel automatically:
- ✅ Adds `DATABASE_URL` to environment variables
- ✅ Adds `POSTGRES_URL`, `POSTGRES_PRISMA_URL`, etc.
- ✅ Secures connection with SSL

**No manual configuration needed!**

### Step 3: Update Prisma Schema

1. **Edit `prisma/schema.prisma`:**

```prisma
datasource db {
  provider = "postgresql"  // Changed from sqlite
  url      = env("DATABASE_URL")
}
```

2. **Important:** Remove SQLite-specific features if any

### Step 4: Deploy

```bash
git add prisma/schema.prisma
git commit -m "feat: Switch to PostgreSQL"
git push
```

Vercel auto-deploys and:
- Runs `prisma generate`
- Applies migrations
- Database ready!

### Step 5: Seed Database

**Option A: Using Vercel CLI**

```bash
# Install Vercel CLI
npm i -g vercel

# Link project
vercel link

# Pull environment variables
vercel env pull

# Run migrations and seed
npx prisma db push
npm run db:seed
```

**Option B: Via Vercel Dashboard**

1. Go to your deployed site
2. Use admin tools to add data manually
3. Or create initial data through the UI

### Monitoring

- **View Database**: Vercel Dashboard → Storage → Your Database
- **Query Editor**: Execute SQL directly
- **Metrics**: See storage usage, connection count
- **Logs**: View query performance

---

## 🌟 Option 2: Neon (Most Generous Free Tier)

### Overview
- **Best if**: Maximum free storage needed
- **Free tier**: 10 GB storage, 100 hours compute/month
- **Setup time**: 5 minutes
- **Difficulty**: ⭐⭐ Easy

### Step 1: Create Neon Account

1. **Go to Neon**
   - URL: https://neon.tech
   - Click **"Sign Up"**
   - Choose **"Continue with GitHub"**
   - Authorize Neon

2. **Create Project**
   - Project name: `ai-workspace`
   - Postgres version: `15` (recommended)
   - Region: Select closest to your users
   - Click **"Create Project"**

### Step 2: Get Connection String

1. **Dashboard shows connection details**

2. **Copy connection string**
   ```
   postgresql://username:password@ep-cool-name-123456.region.aws.neon.tech/dbname?sslmode=require
   ```

3. **Important parts:**
   - Replace `username`, `password`, `host`, `dbname` with your values
   - Keep `?sslmode=require` at the end

### Step 3: Add to Vercel

1. **Go to Vercel**
   - Your project → Settings → Environment Variables

2. **Update DATABASE_URL**
   ```
   Name: DATABASE_URL
   Value: postgresql://[your-neon-connection-string]
   Environment: Production, Preview, Development
   ```

3. **Add additional variables** (Neon provides these)
   ```
   POSTGRES_URL=postgresql://...
   POSTGRES_PRISMA_URL=postgresql://...?pgbouncer=true
   POSTGRES_URL_NON_POOLING=postgresql://...
   ```

4. Click **"Save"**

### Step 4: Update Prisma Schema

Same as Vercel Postgres - change to `postgresql` provider.

### Step 5: Deploy

```bash
git add prisma/schema.prisma
git commit -m "feat: Switch to PostgreSQL with Neon"
git push
```

### Step 6: Initialize Database

```bash
# Using Vercel CLI
vercel env pull
npx prisma db push
npm run db:seed
```

### Neon Features

- **Branching**: Create database branches for testing
- **Auto-scaling**: Scales to zero when not in use
- **Point-in-time Recovery**: Restore to any point
- **Monitoring**: Built-in query performance insights

---

## 🔷 Option 3: Supabase

### Overview
- **Best if**: Want additional features (Auth, Storage, Realtime)
- **Free tier**: 500 MB storage, unlimited API requests
- **Setup time**: 7 minutes
- **Difficulty**: ⭐⭐⭐ Moderate

### Setup Steps

1. **Create Supabase Account**
   - URL: https://supabase.com
   - Sign up with GitHub

2. **Create Project**
   - New Project → Name: `ai-workspace`
   - Database Password: (generate strong password)
   - Region: Choose closest
   - Click **"Create new project"**

3. **Get Connection String**
   - Project Settings → Database
   - Connection string → Copy **"URI"**
   - Format: `postgresql://postgres:[password]@db.xxx.supabase.co:5432/postgres`

4. **Add to Vercel**
   - Same process as Neon above

5. **Deploy & Initialize**
   - Same process as above

---

## 🔄 Migration from SQLite to PostgreSQL

### Automatic Migration (Recommended)

Prisma handles this automatically when you change provider:

1. **Update schema** to `postgresql`
2. **Run migrations**: `npx prisma db push`
3. **Seed data**: `npm run db:seed`

### Manual Data Migration (If You Have Existing Data)

**Step 1: Export SQLite Data**

```bash
# Export to SQL
sqlite3 prisma/dev.db .dump > backup.sql
```

**Step 2: Clean Up SQL File**

Remove SQLite-specific syntax:
```bash
# Remove these lines
BEGIN TRANSACTION;
COMMIT;
```

**Step 3: Import to PostgreSQL**

```bash
# Using psql
psql $DATABASE_URL < backup.sql
```

**Or use Prisma Studio:**
1. Connect to SQLite database
2. Export data as JSON
3. Connect to PostgreSQL
4. Import JSON data

---

## 🔧 Troubleshooting

### Error: "Can't reach database server"

**Causes:**
- ❌ Wrong connection string
- ❌ Database not running
- ❌ Firewall blocking connection
- ❌ SSL mode incorrect

**Solutions:**
```bash
# Test connection
psql $DATABASE_URL

# Check SSL requirement
# Neon/Supabase require: ?sslmode=require
# Add to end of connection string

# Verify environment variable
vercel env pull
cat .env
```

### Error: "SSL connection required"

**Fix:** Add to connection string:
```
?sslmode=require
```

### Error: "Too many connections"

**Causes:**
- Database has connection limit
- Connection pooling not configured

**Solution for Neon:**
```env
# Use connection pooling URL
DATABASE_URL="postgresql://...?pgbouncer=true&connect_timeout=15"
```

**Solution for Vercel:**
```prisma
datasource db {
  provider = "postgresql"
  url      = env("POSTGRES_PRISMA_URL") // Use pooled URL
}
```

### Error: "Migration failed"

**Solution:**
```bash
# Reset database (WARNING: Deletes all data)
npx prisma migrate reset

# Or push schema directly
npx prisma db push --force-reset
```

---

## 📊 Database Monitoring

### Vercel Postgres

```bash
# View metrics
vercel env ls
vercel logs --follow

# Query database
# Use Vercel dashboard → Storage → Query Editor
```

### Neon

```bash
# Neon CLI
npm install -g neonctl
neonctl projects list
neonctl branches list

# View metrics in dashboard
# https://console.neon.tech
```

### Prisma Studio

```bash
# Visual database editor
npx prisma studio
# Opens at http://localhost:5555
```

---

## 🔒 Security Best Practices

### 1. Secure Connection Strings

```env
# ✅ GOOD - Use environment variables
DATABASE_URL="postgresql://..."

# ❌ BAD - Don't hardcode in code
const db = "postgresql://user:pass@host/db"
```

### 2. Use Connection Pooling

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")

  // Add for high-traffic apps
  relationMode = "prisma"
}
```

### 3. Rotate Credentials

- Change database password every 90 days
- Rotate after team member leaves
- Use strong passwords (20+ characters)

### 4. Limit Access

- Don't expose database publicly
- Use VPC/private networking
- Enable IP whitelisting if available

---

## 💾 Backup Strategy

### Automated Backups

**Vercel Postgres:**
- Automatic daily backups (retained 7 days)
- Point-in-time recovery available

**Neon:**
- Continuous backups
- Restore to any point in time
- Automatic backup retention

**Manual Backup:**
```bash
# Export database
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql

# Restore database
psql $DATABASE_URL < backup-20231201.sql
```

### Backup Schedule

- **Daily**: Automatic (provider handles)
- **Weekly**: Manual export (store in S3/cloud)
- **Before major changes**: Manual snapshot

---

## 📈 Performance Optimization

### 1. Indexes

```prisma
model Tool {
  id   String @id
  slug String @unique
  name String

  @@index([category])  // Add for frequently queried fields
  @@index([isActive, isFeatured])
}
```

### 2. Connection Pooling

```env
# Recommended for production
DATABASE_URL="postgresql://...?pgbouncer=true&connection_limit=10"
```

### 3. Query Optimization

```typescript
// ✅ GOOD - Select only needed fields
const tools = await prisma.tool.findMany({
  select: { id: true, name: true, slug: true }
})

// ❌ BAD - Fetches everything
const tools = await prisma.tool.findMany()
```

---

## ✅ Setup Verification Checklist

After setup, verify:

- ✅ `DATABASE_URL` environment variable is set
- ✅ Connection string includes `?sslmode=require`
- ✅ Prisma schema uses `provider = "postgresql"`
- ✅ Database is accessible from Vercel
- ✅ Migrations run successfully
- ✅ Seed data loaded correctly
- ✅ App can read/write to database
- ✅ Backups are configured

---

## 🆘 Getting Help

- **Vercel Postgres**: https://vercel.com/docs/storage/vercel-postgres
- **Neon**: https://neon.tech/docs
- **Supabase**: https://supabase.com/docs
- **Prisma**: https://www.prisma.io/docs

---

**🎉 Database Setup Complete!**

Your production database is ready to scale with your users!
