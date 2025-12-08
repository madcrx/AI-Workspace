# Quick Start Guide

Get your AI Workspace Platform up and running in 5 minutes!

## Installation Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Initialize Database
```bash
npm run db:generate
npm run db:push
npm run db:seed
```

### 3. Start Development Server
```bash
npm run dev
```

### 4. Open in Browser
Navigate to: [http://localhost:3000](http://localhost:3000)

## First Login

Use the default admin account:
- **Email**: admin@aiworkspace.com
- **Password**: admin123

## What You Can Do

### As a User:
1. **Sign Up**: Create your account at `/auth/signup`
2. **Browse Tools**: Explore AI tools at `/tools`
3. **Create Workspace**: Add tools to your personalized workspace
4. **Customize**: Change themes and arrange your workspace
5. **Submit Tools**: Share AI tools you've discovered

### As an Admin:
1. **Dashboard**: Access admin panel at `/admin`
2. **Review Submissions**: Approve or reject tool submissions
3. **View Statistics**: Monitor platform usage
4. **Manage Tools**: Edit or remove tools

## Key Pages

- `/` - Homepage
- `/auth/signin` - Sign in
- `/auth/signup` - Create account
- `/tools` - Browse AI tools catalog
- `/workspace` - Your personalized workspace
- `/submit-tool` - Submit a new tool
- `/admin` - Admin dashboard (admin only)

## Sample Tools Included

The seed script creates 10 sample AI tools across categories:
- Content Generation
- Image Generation
- Code Assistant
- Productivity
- Data Analysis
- Voice & Audio
- Video Creation
- Research

## Next Steps

1. **Explore the Workspace**: Add tools and customize layout
2. **Submit a Tool**: Try the submission workflow
3. **Test Admin Features**: Review submissions as admin
4. **Customize Theme**: Switch between light/dark modes
5. **Review Code**: Understand the architecture

## Troubleshooting

### Database Issues
```bash
# Reset database
rm -f prisma/dev.db
npm run db:push
npm run db:seed
```

### Port Already in Use
```bash
# Change port in package.json or run on different port
PORT=3001 npm run dev
```

### Authentication Issues
- Clear browser cookies
- Check .env file exists
- Verify NEXTAUTH_SECRET is set

## Development Tips

- Hot reload is enabled - changes appear instantly
- Check console for errors
- Use Prisma Studio to view database: `npm run db:studio`
- All API routes are in `/app/api`
- Components are in `/components`

---

**You're all set!** Start building your AI tools workspace. 🚀
