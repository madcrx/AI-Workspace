# Complete Deployment Guide for AI Workspace

This guide will walk you through deploying your AI Workspace platform to production at **www.aiworkspace.com**.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Vercel Deployment](#vercel-deployment)
3. [Database Setup](#database-setup)
4. [OAuth Configuration](#oauth-configuration)
5. [Custom Domain Setup](#custom-domain-setup)
6. [Post-Deployment](#post-deployment)
7. [Troubleshooting](#troubleshooting)

---

## 🎯 Prerequisites

Before starting, ensure you have:

- ✅ GitHub account with access to `madcrx/AI-Workspace`
- ✅ Domain name `www.aiworkspace.com` (with DNS access)
- ✅ Email account for admin access
- ✅ Credit card (for domain verification - Vercel is free)

---

## 🚀 Vercel Deployment

### Step 1: Create Vercel Account

1. Go to **https://vercel.com/signup**
2. Click **"Continue with GitHub"**
3. Authorize Vercel to access your GitHub account
4. Complete the signup process

### Step 2: Import Your Repository

1. Click **"Add New Project"** on Vercel dashboard
2. Find and select **`madcrx/AI-Workspace`** repository
3. Click **"Import"**

### Step 3: Configure Project Settings

**Framework Preset:** Next.js (auto-detected)
**Root Directory:** `./` (leave as default)
**Build Command:** `prisma generate && next build` (already configured in `vercel.json`)

### Step 4: Add Environment Variables

Click **"Environment Variables"** and add the following:

#### Required Variables

```env
# Database (temporary - we'll upgrade to PostgreSQL later)
DATABASE_URL=file:./prisma/dev.db

# NextAuth Configuration
NEXTAUTH_SECRET=
NEXTAUTH_URL=https://www.aiworkspace.com

# Cron Job Security
CRON_SECRET=
```

#### Generate Secrets

Open your terminal and run:

```bash
# For NEXTAUTH_SECRET
openssl rand -base64 32

# For CRON_SECRET
openssl rand -base64 32
```

Copy each output and paste into the corresponding environment variable.

#### OAuth Variables (Optional - Configure Later)

```env
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
FACEBOOK_CLIENT_ID=
FACEBOOK_CLIENT_SECRET=
```

*Leave these empty for now. We'll add them after setting up OAuth.*

### Step 5: Deploy

1. Click **"Deploy"**
2. Wait 2-3 minutes for the build to complete
3. You'll get a temporary URL: `https://your-project-name.vercel.app`

**🎉 Your app is now live!**

---

## 💾 Database Setup (PostgreSQL)

SQLite (current setup) works for testing but **NOT for production**. Let's upgrade to PostgreSQL.

### Option 1: Vercel Postgres (Recommended)

1. Go to your Vercel project dashboard
2. Click **"Storage"** tab
3. Click **"Create Database"**
4. Select **"Postgres"**
5. Choose region closest to your users (e.g., `us-east-1`)
6. Click **"Create"**

**Automatic Connection:**
- Vercel automatically adds `DATABASE_URL` to your environment variables
- No manual configuration needed!

### Option 2: Neon (Alternative - Free Tier)

1. Go to **https://neon.tech**
2. Sign up with GitHub
3. Create a new project: **"ai-workspace-db"**
4. Copy the connection string
5. In Vercel, update `DATABASE_URL`:
   ```
   postgresql://user:password@host.neon.tech/dbname?sslmode=require
   ```

### Update Prisma Schema

After setting up PostgreSQL, update your schema:

1. **Edit `prisma/schema.prisma`:**

```prisma
datasource db {
  provider = "postgresql"  // Changed from sqlite
  url      = env("DATABASE_URL")
}
```

2. **Commit and push:**

```bash
git add prisma/schema.prisma
git commit -m "feat: Switch to PostgreSQL for production"
git push origin claude/connect-ai-workspace-bxj4v
```

3. **Vercel auto-deploys** and runs migrations!

### Seed the Database

After first deployment with PostgreSQL:

1. Go to Vercel project → **Settings** → **Functions**
2. Or install Vercel CLI:

```bash
npm i -g vercel
vercel login
vercel link
vercel env pull
npm run db:push
npm run db:seed
```

**Default Admin Account:**
- Email: `admin@aiworkspace.com`
- Password: `admin123`

⚠️ **Change this password immediately after first login!**

---

## 🔐 OAuth Configuration

Enable Google and Facebook login for your users.

### Google OAuth Setup

#### 1. Create Google Cloud Project

1. Go to **https://console.cloud.google.com/**
2. Click **"Select a project"** → **"New Project"**
3. Project name: **"AI Workspace"**
4. Click **"Create"**

#### 2. Enable OAuth Consent Screen

1. Go to **"APIs & Services"** → **"OAuth consent screen"**
2. Select **"External"** → **"Create"**
3. Fill in:
   - **App name:** AI Workspace
   - **User support email:** your-email@example.com
   - **Developer contact:** your-email@example.com
4. Click **"Save and Continue"**
5. **Scopes:** Click **"Add or Remove Scopes"**
   - Select: `userinfo.email`, `userinfo.profile`
6. Click **"Save and Continue"**
7. **Test users:** Add your email (for testing)
8. Click **"Save and Continue"** → **"Back to Dashboard"**

#### 3. Create OAuth Credentials

1. Go to **"Credentials"** → **"Create Credentials"** → **"OAuth client ID"**
2. Application type: **"Web application"**
3. Name: **"AI Workspace Web App"**
4. **Authorized JavaScript origins:**
   ```
   https://www.aiworkspace.com
   ```
5. **Authorized redirect URIs:**
   ```
   https://www.aiworkspace.com/api/auth/callback/google
   ```
6. Click **"Create"**
7. **Copy** the Client ID and Client Secret

#### 4. Add to Vercel

1. Go to Vercel → **Settings** → **Environment Variables**
2. Add:
   ```
   GOOGLE_CLIENT_ID=your-client-id-here
   GOOGLE_CLIENT_SECRET=your-client-secret-here
   ```
3. Click **"Save"**
4. Redeploy: **Deployments** → **"Redeploy"**

---

### Facebook OAuth Setup

#### 1. Create Facebook App

1. Go to **https://developers.facebook.com/**
2. Click **"My Apps"** → **"Create App"**
3. Use case: **"Authenticate and request data from users"**
4. App type: **"Consumer"**
5. Click **"Next"**

#### 2. Configure App

1. **App name:** AI Workspace
2. **App contact email:** your-email@example.com
3. Click **"Create App"**

#### 3. Add Facebook Login

1. In dashboard, find **"Facebook Login"** → **"Set Up"**
2. Select **"Web"**
3. **Site URL:** `https://www.aiworkspace.com`
4. Click **"Save"** → **"Continue"**

#### 4. Configure OAuth Settings

1. Go to **"Facebook Login"** → **"Settings"**
2. **Valid OAuth Redirect URIs:**
   ```
   https://www.aiworkspace.com/api/auth/callback/facebook
   ```
3. Click **"Save Changes"**

#### 5. Get App Credentials

1. Go to **"Settings"** → **"Basic"**
2. Copy **"App ID"** and **"App Secret"**

#### 6. Add to Vercel

1. Go to Vercel → **Settings** → **Environment Variables**
2. Add:
   ```
   FACEBOOK_CLIENT_ID=your-app-id-here
   FACEBOOK_CLIENT_SECRET=your-app-secret-here
   ```
3. Click **"Save"**
4. Redeploy

#### 7. Make App Public (Important!)

1. In Facebook app dashboard, toggle **"App Mode"** from **"Development"** to **"Live"**
2. You may need to provide privacy policy URL: `https://www.aiworkspace.com/privacy`

---

## 🌐 Custom Domain Setup (www.aiworkspace.com)

### Step 1: Add Domain in Vercel

1. Go to Vercel project → **"Settings"** → **"Domains"**
2. Enter: `www.aiworkspace.com`
3. Click **"Add"**
4. Vercel will show DNS configuration instructions

### Step 2: Configure DNS

Vercel will provide DNS records. Go to your domain registrar (GoDaddy, Namecheap, etc.) and add:

#### For `www.aiworkspace.com` (CNAME)

```
Type:  CNAME
Name:  www
Value: cname.vercel-dns.com
TTL:   Auto or 3600
```

#### Optional: Redirect `aiworkspace.com` to `www.aiworkspace.com`

Add both domains in Vercel, then add:

```
Type:  A
Name:  @
Value: 76.76.21.21
TTL:   Auto or 3600
```

### Step 3: Wait for DNS Propagation

- DNS changes take **24-48 hours** to fully propagate
- Usually works within **10-30 minutes**
- Check status: https://dnschecker.org/

### Step 4: Enable HTTPS

1. Vercel automatically provisions SSL certificate
2. Usually takes 1-5 minutes after DNS is configured
3. Your site will be accessible via `https://www.aiworkspace.com`

### Step 5: Update Environment Variables

1. Go to Vercel → **Settings** → **Environment Variables**
2. Update `NEXTAUTH_URL`:
   ```
   NEXTAUTH_URL=https://www.aiworkspace.com
   ```
3. Update OAuth callbacks in Google/Facebook to use `www.aiworkspace.com`
4. Redeploy

---

## ✅ Post-Deployment

### 1. Test Your Site

Visit: **https://www.aiworkspace.com**

Test these features:
- ✅ Homepage loads
- ✅ Sign up with email
- ✅ Sign in with email
- ✅ Sign in with Google (if configured)
- ✅ Sign in with Facebook (if configured)
- ✅ Browse tools page
- ✅ Tutorials page
- ✅ Admin dashboard (login as admin)

### 2. Change Admin Password

1. Login as admin: `admin@aiworkspace.com` / `admin123`
2. Go to Admin Dashboard
3. Click **Users** tab
4. Reset your admin password

### 3. Verify Cron Job

The auto-scraper runs every night at 2 AM:

1. Check in Admin Dashboard → **Auto-Scraper** tab
2. Or manually trigger it to test
3. Verify in Vercel → **Settings** → **Cron Jobs**

### 4. Monitor Performance

- **Vercel Analytics**: Enable in project settings
- **Error Monitoring**: Check deployment logs
- **Database Queries**: Monitor in Vercel Postgres dashboard

### 5. Create Privacy Policy & Terms

Required for OAuth apps:

1. Create `/app/privacy/page.tsx`
2. Create `/app/terms/page.tsx`
3. Add links in footer
4. Update Facebook app settings with URLs

---

## 🐛 Troubleshooting

### Build Fails

**Error:** `Prisma client not generated`
```bash
# Solution: Already configured in vercel.json
# Check build logs for specific errors
```

### OAuth Not Working

**Error:** `Redirect URI mismatch`
- ✅ Verify callback URLs match exactly
- ✅ Check `NEXTAUTH_URL` environment variable
- ✅ Wait 5 minutes after changing OAuth settings

### Database Connection Fails

**Error:** `Can't reach database server`
- ✅ Check `DATABASE_URL` is correct
- ✅ Verify database is running (for Neon/external)
- ✅ Check connection string format

### Domain Not Working

**Error:** `Site can't be reached`
- ✅ Verify DNS records are correct
- ✅ Wait for DNS propagation (24-48 hours)
- ✅ Check with `dig www.aiworkspace.com`

### Cron Job Not Running

**Error:** Auto-scraper not executing
- ✅ Verify `CRON_SECRET` is set
- ✅ Check Vercel cron configuration
- ✅ Review function logs in Vercel

---

## 📞 Support

- **Vercel Docs:** https://vercel.com/docs
- **Next.js Docs:** https://nextjs.org/docs
- **Prisma Docs:** https://www.prisma.io/docs

---

## 🎉 Congratulations!

Your AI Workspace is now live at **https://www.aiworkspace.com**!

**Next Steps:**
- Add more tutorials
- Customize branding
- Enable analytics
- Set up monitoring
- Create content marketing plan

---

**Deployed with ❤️ on Vercel**
