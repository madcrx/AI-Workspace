# Quick Start Guide - Deploy in 15 Minutes

Get your AI Workspace live at **www.aiworkspace.com** in 15 minutes or less!

---

## 🚀 Super Quick Deploy (5 Steps)

### Step 1: Deploy to Vercel (2 min)

1. Go to **https://vercel.com/new**
2. Import `madcrx/AI-Workspace` from GitHub
3. Add environment variables:
   ```env
   DATABASE_URL=file:./prisma/dev.db
   NEXTAUTH_SECRET=[generate with: openssl rand -base64 32]
   NEXTAUTH_URL=https://www.aiworkspace.com
   CRON_SECRET=[generate with: openssl rand -base64 32]
   ```
4. Click **"Deploy"**

**✅ Your app is live!** (at temporary URL)

---

### Step 2: Setup Database (3 min)

1. In Vercel → **Storage** → **"Create Database"** → **"Postgres"**
2. Auto-adds `DATABASE_URL` ✅
3. In your code, update `prisma/schema.prisma`:
   ```prisma
   provider = "postgresql"  // change from sqlite
   ```
4. Commit and push:
   ```bash
   git add .
   git commit -m "Switch to PostgreSQL"
   git push
   ```

**✅ Database ready!**

---

### Step 3: Add Custom Domain (5 min)

1. Vercel → **Settings** → **Domains**
2. Add: `www.aiworkspace.com`
3. Go to your domain registrar (GoDaddy, Namecheap, etc.)
4. Add DNS record:
   ```
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```
5. Wait 10-30 minutes for DNS

**✅ Custom domain configured!**

---

### Step 4: Seed Database (2 min)

```bash
# Install Vercel CLI
npm i -g vercel

# Connect
vercel link

# Pull environment
vercel env pull

# Initialize database
npx prisma db push
npm run db:seed
```

**✅ Sample data loaded!**

---

### Step 5: Login & Verify (3 min)

1. Visit **https://www.aiworkspace.com**
2. Login with admin account:
   - Email: `admin@aiworkspace.com`
   - Password: `admin123`
3. Change password immediately!
4. Test features:
   - ✅ Browse tools
   - ✅ View tutorials
   - ✅ Check admin dashboard
   - ✅ Verify auto-scraper tab

**✅ DONE! Your AI Workspace is LIVE! 🎉**

---

## 🔐 Optional: Add OAuth (10 min)

### Google Login

1. **Google Console**: https://console.cloud.google.com/
2. Create project → OAuth consent → Create credentials
3. Redirect URI: `https://www.aiworkspace.com/api/auth/callback/google`
4. Add to Vercel environment:
   ```
   GOOGLE_CLIENT_ID=your-id
   GOOGLE_CLIENT_SECRET=your-secret
   ```
5. Redeploy

**Full guide:** See `OAUTH_SETUP.md`

### Facebook Login

1. **Facebook Developers**: https://developers.facebook.com/
2. Create app → Add Facebook Login
3. Redirect URI: `https://www.aiworkspace.com/api/auth/callback/facebook`
4. Add to Vercel environment:
   ```
   FACEBOOK_CLIENT_ID=your-id
   FACEBOOK_CLIENT_SECRET=your-secret
   ```
5. Switch app to Live mode

**Full guide:** See `OAUTH_SETUP.md`

---

## ⚡ Quick Troubleshooting

### Site not loading?
- Check DNS with https://dnschecker.org
- Wait 24-48 hours for full propagation
- Verify Vercel deployment succeeded

### Database errors?
- Confirm `DATABASE_URL` is set
- Check `prisma/schema.prisma` has `provider = "postgresql"`
- Run `npx prisma generate`

### OAuth not working?
- Verify callback URLs match exactly
- Check environment variables are set
- Wait 5 minutes after changing OAuth settings

---

## 📚 Full Documentation

- **Complete Guide**: `DEPLOYMENT_GUIDE.md`
- **OAuth Setup**: `OAUTH_SETUP.md`
- **Database Setup**: `DATABASE_SETUP.md`
- **README**: `README.md`

---

## 🎯 Post-Launch Checklist

After your site is live:

- [ ] Change admin password
- [ ] Add your email as admin
- [ ] Create privacy policy page
- [ ] Create terms of service page
- [ ] Test all features
- [ ] Enable Vercel Analytics
- [ ] Set up custom email (optional)
- [ ] Add your branding/logo
- [ ] Create first tutorial
- [ ] Invite beta users
- [ ] Monitor auto-scraper logs

---

## 💡 Pro Tips

### Faster Deployment
```bash
# Use Vercel CLI for instant deploys
vercel
```

### Monitor Your App
- Vercel → Analytics (free)
- Set up error tracking
- Check cron job logs daily

### Scale Your Database
- Vercel Postgres: Upgrade for more storage
- Or switch to Neon for 10 GB free

### Content Strategy
1. Add 5-10 tutorials with affiliate links
2. Let auto-scraper run for a week
3. Review and feature best tools
4. Share on social media

---

## 🆘 Need Help?

1. Check the error logs in Vercel
2. Read full guides in docs/
3. Verify environment variables
4. Check database connection

---

**⚡ You're live in 15 minutes!**

Now start building your AI tools empire! 🚀
