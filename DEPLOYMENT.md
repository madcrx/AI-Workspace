# Deployment Guide

This guide covers deploying your AI Workspace Platform to production.

## Pre-Deployment Checklist

### 1. Security
- [ ] Change `NEXTAUTH_SECRET` to a secure random string
- [ ] Update admin password from default `admin123`
- [ ] Review and update CORS settings if needed
- [ ] Enable HTTPS in production
- [ ] Set up proper backup strategy

### 2. Database
- [ ] Migrate from SQLite to PostgreSQL for production
- [ ] Set up automated backups
- [ ] Configure connection pooling
- [ ] Test migrations

### 3. Environment Variables
- [ ] Update `NEXTAUTH_URL` to production domain
- [ ] Set production `DATABASE_URL`
- [ ] Configure any third-party API keys
- [ ] Set `NODE_ENV=production`

## Deployment Options

### Option 1: Vercel (Recommended)

Vercel is the easiest way to deploy Next.js applications.

1. **Install Vercel CLI**
```bash
npm i -g vercel
```

2. **Deploy**
```bash
vercel
```

3. **Environment Variables**
Set these in Vercel dashboard:
- `DATABASE_URL` - Your PostgreSQL connection string
- `NEXTAUTH_SECRET` - Secure random string
- `NEXTAUTH_URL` - Your production domain

4. **Database Setup**
Use Vercel Postgres or any PostgreSQL provider:
```bash
# Update prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

# Run migrations
npx prisma db push
npx prisma db seed
```

### Option 2: Docker

1. **Create Dockerfile**
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npx prisma generate
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

2. **Create docker-compose.yml**
```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://user:password@db:5432/aiworkspace
      - NEXTAUTH_SECRET=your-secret
      - NEXTAUTH_URL=http://localhost:3000
    depends_on:
      - db

  db:
    image: postgres:15
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=aiworkspace
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

3. **Deploy**
```bash
docker-compose up -d
```

### Option 3: Traditional VPS (DigitalOcean, AWS, etc.)

1. **Server Setup**
```bash
# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL
sudo apt-get install postgresql postgresql-contrib

# Clone repository
git clone your-repo.git
cd your-repo

# Install dependencies
npm install

# Set up environment
cp .env.example .env
nano .env  # Edit with production values
```

2. **Database Setup**
```bash
# Create database
sudo -u postgres createdb aiworkspace
sudo -u postgres psql -c "CREATE USER aiuser WITH PASSWORD 'password';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE aiworkspace TO aiuser;"

# Run migrations
npx prisma db push
npm run db:seed
```

3. **Build and Start**
```bash
npm run build
npm start
```

4. **Process Manager (PM2)**
```bash
npm install -g pm2
pm2 start npm --name "ai-workspace" -- start
pm2 save
pm2 startup
```

5. **Nginx Reverse Proxy**
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Database Migration (SQLite to PostgreSQL)

1. **Update Schema**
```prisma
// prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

2. **Export Data (optional)**
```bash
# If you want to keep existing data
sqlite3 prisma/dev.db .dump > backup.sql
```

3. **Push New Schema**
```bash
# Set DATABASE_URL to PostgreSQL
export DATABASE_URL="postgresql://user:pass@host:5432/dbname"

# Generate and push
npx prisma generate
npx prisma db push
npm run db:seed
```

## Post-Deployment

### 1. Verify Deployment
- [ ] Homepage loads correctly
- [ ] Sign up/Sign in works
- [ ] Tools catalog displays
- [ ] Workspace functionality works
- [ ] Admin dashboard accessible
- [ ] Tool submission works

### 2. Monitor
Set up monitoring for:
- Server uptime
- Database connections
- Error logs
- Performance metrics

### 3. Backup Strategy
- Daily database backups
- User data exports
- Configuration backups

### 4. Performance Optimization
- Enable Next.js caching
- Set up CDN for static assets
- Configure database indexes
- Enable compression

## Environment Variables Reference

### Required
```env
DATABASE_URL="postgresql://user:pass@host:5432/dbname"
NEXTAUTH_SECRET="your-very-secure-random-string"
NEXTAUTH_URL="https://yourdomain.com"
```

### Optional
```env
NODE_ENV="production"
NEXT_PUBLIC_APP_URL="https://yourdomain.com"
```

## Troubleshooting

### Database Connection Issues
```bash
# Test connection
npx prisma db pull

# Check logs
pm2 logs ai-workspace
```

### Build Failures
```bash
# Clear cache
rm -rf .next
npm run build
```

### Authentication Issues
- Verify NEXTAUTH_URL matches your domain
- Check NEXTAUTH_SECRET is set
- Ensure cookies are enabled

## Scaling Considerations

### Horizontal Scaling
- Use load balancer (Nginx, HAProxy)
- Session storage in Redis
- Database read replicas

### Vertical Scaling
- Increase server resources
- Optimize database queries
- Enable caching layers

### CDN Integration
- Serve static assets via CDN
- Enable edge caching
- Use image optimization service

## Security Hardening

1. **Rate Limiting**
```bash
npm install express-rate-limit
```

2. **Security Headers**
```javascript
// next.config.mjs
headers: async () => [
  {
    source: '/:path*',
    headers: [
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'X-Content-Type-Options', value: 'nosniff' },
    ],
  },
]
```

3. **SSL/TLS**
- Use Let's Encrypt for free SSL
- Configure automatic renewal
- Redirect HTTP to HTTPS

## Maintenance

### Regular Tasks
- Update dependencies monthly
- Review security advisories
- Monitor error logs
- Optimize database
- Review user feedback

### Updates
```bash
# Update dependencies
npm update

# Check for security issues
npm audit

# Fix vulnerabilities
npm audit fix
```

---

## Support

For deployment assistance:
- Check Next.js deployment docs: https://nextjs.org/docs/deployment
- Prisma deployment guide: https://www.prisma.io/docs/guides/deployment
- Contact your hosting provider support

**Remember**: Always test in staging before deploying to production!
