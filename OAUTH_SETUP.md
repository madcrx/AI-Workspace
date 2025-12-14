# OAuth Setup Guide - Google & Facebook Login

Complete guide to enable social login for your AI Workspace platform.

---

## 🔐 Google OAuth Setup

### Overview
Allow users to sign in with their Google account.

---

### Step 1: Create Google Cloud Project

1. **Navigate to Google Cloud Console**
   - URL: https://console.cloud.google.com/
   - Sign in with your Google account

2. **Create New Project**
   - Click dropdown next to "Google Cloud" logo → **"New Project"**
   - **Project Name:** `AI Workspace`
   - **Organization:** Leave default
   - Click **"Create"**
   - Wait 10-20 seconds for project creation

---

### Step 2: Configure OAuth Consent Screen

1. **Navigate to OAuth Consent**
   - Left sidebar → **"APIs & Services"** → **"OAuth consent screen"**

2. **Select User Type**
   - Choose **"External"** (allows any Google user)
   - Click **"Create"**

3. **App Information**
   ```
   App name: AI Workspace
   User support email: your-email@example.com
   App logo: (optional - upload 512x512 PNG)
   ```

4. **App Domain** (Optional but recommended)
   ```
   Application home page: https://www.aiworkspace.com
   Application privacy policy: https://www.aiworkspace.com/privacy
   Application terms of service: https://www.aiworkspace.com/terms
   ```

5. **Authorized Domains**
   ```
   aiworkspace.com
   ```

6. **Developer Contact Information**
   ```
   Email: your-email@example.com
   ```

7. Click **"Save and Continue"**

8. **Scopes Configuration**
   - Click **"Add or Remove Scopes"**
   - Check these scopes:
     - ✅ `.../auth/userinfo.email`
     - ✅ `.../auth/userinfo.profile`
   - Click **"Update"**
   - Click **"Save and Continue"**

9. **Test Users** (for development)
   - Click **"Add Users"**
   - Add emails: `your-email@example.com`
   - Click **"Add"**
   - Click **"Save and Continue"**

10. **Review Summary**
    - Review all information
    - Click **"Back to Dashboard"**

---

### Step 3: Create OAuth Client ID

1. **Navigate to Credentials**
   - Left sidebar → **"APIs & Services"** → **"Credentials"**

2. **Create Credentials**
   - Click **"+ Create Credentials"** → **"OAuth client ID"**

3. **Configure OAuth Client**
   ```
   Application type: Web application
   Name: AI Workspace Web App
   ```

4. **Authorized JavaScript Origins**
   ```
   https://www.aiworkspace.com
   http://localhost:3000  (for local testing)
   ```

5. **Authorized Redirect URIs**
   ```
   https://www.aiworkspace.com/api/auth/callback/google
   http://localhost:3000/api/auth/callback/google  (for local testing)
   ```

6. Click **"Create"**

7. **Save Credentials**
   - Modal appears with:
     - **Client ID:** `123456789-abc.apps.googleusercontent.com`
     - **Client Secret:** `GOCSPX-abc123xyz`
   - **Download JSON** (optional backup)
   - Click **"OK"**

---

### Step 4: Add to Vercel Environment Variables

1. **Go to Vercel Dashboard**
   - Your project → **Settings** → **Environment Variables**

2. **Add Variables**

   **Variable 1:**
   ```
   Name: GOOGLE_CLIENT_ID
   Value: [paste your Client ID]
   Environment: Production, Preview, Development
   ```

   **Variable 2:**
   ```
   Name: GOOGLE_CLIENT_SECRET
   Value: [paste your Client Secret]
   Environment: Production, Preview, Development
   ```

3. Click **"Save"**

---

### Step 5: Deploy & Test

1. **Trigger Deployment**
   - Vercel → **Deployments** → **"Redeploy"**
   - Or push to GitHub (auto-deploys)

2. **Test Login**
   - Visit: `https://www.aiworkspace.com/auth/signin`
   - Click **"Continue with Google"**
   - Should redirect to Google login
   - After login, redirects back to your workspace

---

### Step 6: Publish OAuth App (Production)

For production use:

1. **Return to OAuth Consent Screen**
   - Google Cloud Console → **"OAuth consent screen"**

2. **Publishing Status**
   - Current status: **"Testing"** (max 100 users)
   - Click **"Publish App"**
   - Review warnings
   - Click **"Confirm"**

3. **Verification** (if required)
   - Google may require verification for certain scopes
   - Follow instructions if prompted
   - Usually not needed for basic profile/email scopes

---

## 📘 Facebook OAuth Setup

### Overview
Allow users to sign in with their Facebook account.

---

### Step 1: Create Facebook App

1. **Navigate to Facebook Developers**
   - URL: https://developers.facebook.com/
   - Log in with your Facebook account

2. **Create App**
   - Click **"My Apps"** (top right)
   - Click **"Create App"**

3. **Select Use Case**
   - Choose: **"Authenticate and request data from users"**
   - Click **"Next"**

4. **Select App Type**
   - Choose: **"Consumer"**
   - Click **"Next"**

5. **Add App Details**
   ```
   App name: AI Workspace
   App contact email: your-email@example.com
   ```

6. Click **"Create App"**

7. **Verify Identity**
   - Enter your Facebook password
   - Complete security check if prompted

---

### Step 2: Set Up Facebook Login

1. **Find Facebook Login Product**
   - In app dashboard, scroll to **"Add products to your app"**
   - Find **"Facebook Login"**
   - Click **"Set up"**

2. **Select Platform**
   - Choose **"Web"**

3. **Configure Settings**
   ```
   Site URL: https://www.aiworkspace.com
   ```
   - Click **"Save"**
   - Click **"Continue"**
   - Skip through quickstart (click **"Next"** on each screen)

---

### Step 3: Configure OAuth Settings

1. **Navigate to Facebook Login Settings**
   - Left sidebar → **"Facebook Login"** → **"Settings"**

2. **Client OAuth Settings**
   ```
   Client OAuth Login: Yes (toggle ON)
   Web OAuth Login: Yes (toggle ON)
   ```

3. **Valid OAuth Redirect URIs**
   ```
   https://www.aiworkspace.com/api/auth/callback/facebook
   http://localhost:3000/api/auth/callback/facebook
   ```

4. **Login from Devices**
   - Toggle ON if you want mobile support

5. Click **"Save Changes"**

---

### Step 4: Configure App Settings

1. **Navigate to Basic Settings**
   - Left sidebar → **"Settings"** → **"Basic"**

2. **Fill Required Information**
   ```
   Display Name: AI Workspace
   App Domains: aiworkspace.com
   Privacy Policy URL: https://www.aiworkspace.com/privacy
   Terms of Service URL: https://www.aiworkspace.com/terms
   ```

3. **App Icon** (required for public apps)
   - Upload 1024x1024 PNG
   - Must be your logo/brand

4. **Category**
   - Choose: **"Business and Pages"** or **"Productivity"**

5. Click **"Save Changes"**

---

### Step 5: Get App Credentials

1. **Still in Settings → Basic**

2. **Copy Credentials**
   - **App ID:** `123456789012345`
   - **App Secret:** Click **"Show"** → Copy the secret
   - ⚠️ **Keep App Secret confidential!**

---

### Step 6: Add to Vercel Environment Variables

1. **Go to Vercel Dashboard**
   - Your project → **Settings** → **Environment Variables**

2. **Add Variables**

   **Variable 1:**
   ```
   Name: FACEBOOK_CLIENT_ID
   Value: [paste your App ID]
   Environment: Production, Preview, Development
   ```

   **Variable 2:**
   ```
   Name: FACEBOOK_CLIENT_SECRET
   Value: [paste your App Secret]
   Environment: Production, Preview, Development
   ```

3. Click **"Save"**

---

### Step 7: Switch to Live Mode

**Important:** Your app starts in **Development Mode** (max 5 test users)

1. **Test First**
   - Test with development mode
   - Verify login works at your domain

2. **Add Test Users** (optional - for testing)
   - Left sidebar → **"Roles"** → **"Test Users"**
   - Click **"Add"** to create test Facebook accounts

3. **Switch to Live Mode**
   - Top of dashboard, find **App Mode toggle**
   - Currently shows: **"Development"**
   - Click toggle to switch to **"Live"**

4. **Confirm Switch**
   - Facebook shows checklist of requirements:
     - ✅ App icon added
     - ✅ Privacy Policy URL added
     - ✅ Terms of Service URL added
     - ✅ App Category selected
   - Review and confirm
   - Click **"Switch Mode"**

---

### Step 8: Deploy & Test

1. **Trigger Deployment**
   - Vercel → **Deployments** → **"Redeploy"**

2. **Test Login**
   - Visit: `https://www.aiworkspace.com/auth/signin`
   - Click **"Continue with Facebook"**
   - Should redirect to Facebook login
   - After login, redirects back to your workspace

---

## 🧪 Testing OAuth Locally

### Local Development Setup

1. **Create `.env.local` file** (never commit this!)

```env
# Copy from .env.example
DATABASE_URL="file:./prisma/dev.db"
NEXTAUTH_SECRET="local-dev-secret-min-32-chars-long"
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Facebook OAuth
FACEBOOK_CLIENT_ID="your-facebook-app-id"
FACEBOOK_CLIENT_SECRET="your-facebook-app-secret"
```

2. **Run Development Server**

```bash
npm run dev
```

3. **Test at** `http://localhost:3000/auth/signin`

---

## ❗ Common Issues & Solutions

### Google OAuth

**Issue:** "Error 400: redirect_uri_mismatch"
- ✅ Verify redirect URI exactly matches in Google Console
- ✅ Check for trailing slashes (should NOT have trailing slash)
- ✅ Verify protocol (http vs https)

**Issue:** "Access blocked: This app's request is invalid"
- ✅ Check OAuth consent screen is configured
- ✅ Verify scopes are added
- ✅ Add your email as test user

**Issue:** "This app isn't verified"
- Normal for development
- Users can click "Advanced" → "Go to AI Workspace (unsafe)"
- Publish app to remove warning

---

### Facebook OAuth

**Issue:** "URL Blocked: This redirect failed"
- ✅ Check redirect URI in Facebook Login Settings
- ✅ Verify app domain matches your domain
- ✅ Check App Mode (Development vs Live)

**Issue:** "App Not Set Up: This app is still in development"
- ✅ Switch app to Live mode
- ✅ Complete all required fields in Basic Settings
- ✅ Add privacy policy and terms of service

**Issue:** "Invalid OAuth access token"
- ✅ Verify `FACEBOOK_CLIENT_SECRET` is correct
- ✅ Check you're using App Secret, not Client Token
- ✅ Regenerate secret if needed

---

## 🔒 Security Best Practices

### 1. Keep Secrets Secret
- ❌ Never commit `.env` or `.env.local` to Git
- ✅ Use environment variables in production
- ✅ Rotate secrets periodically

### 2. Limit Scopes
- Only request `email` and `profile` scopes
- Don't request unnecessary permissions

### 3. Verify Callback URLs
- Only whitelist your actual domains
- Don't use wildcards in production

### 4. Monitor Usage
- Check OAuth analytics in Google/Facebook dashboards
- Monitor failed login attempts
- Set up alerts for unusual activity

---

## ✅ Verification Checklist

After setup, verify:

- ✅ Google login button appears on signin page
- ✅ Facebook login button appears on signin page
- ✅ Clicking Google redirects to Google login
- ✅ Clicking Facebook redirects to Facebook login
- ✅ After OAuth login, user is created in database
- ✅ User can access workspace
- ✅ User profile info (name, email, image) is populated
- ✅ Subsequent logins work without re-authorization

---

## 📚 Additional Resources

**Google OAuth:**
- Official Docs: https://developers.google.com/identity/protocols/oauth2
- Console: https://console.cloud.google.com/

**Facebook Login:**
- Official Docs: https://developers.facebook.com/docs/facebook-login
- App Dashboard: https://developers.facebook.com/apps/

**NextAuth.js:**
- Google Provider: https://next-auth.js.org/providers/google
- Facebook Provider: https://next-auth.js.org/providers/facebook

---

**🎉 OAuth Setup Complete!**

Users can now sign in with Google and Facebook!
