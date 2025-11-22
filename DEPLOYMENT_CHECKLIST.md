# Deployment Checklist for Vercel

## ✅ Pre-Deployment Checks

### 1. Environment Variables
Make sure to set these in Vercel Dashboard → Settings → Environment Variables:

**Required:**
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (server-side only)
- `ADMIN_SECRET_KEY` - Secret key for admin authentication

**Optional:**
- `NEXT_PUBLIC_SITE_URL` - Your production site URL (e.g., `https://your-app.vercel.app`)

### 2. Git Repository
- ✅ All code is committed to Git
- ✅ `.gitignore` properly excludes sensitive files
- ✅ No hardcoded paths or local file system references
- ✅ Repository is connected to Vercel

### 3. Code Issues Fixed
- ✅ Removed hardcoded Windows path (`D:\3 Layered Resources\products`)
- ✅ All API routes use environment variables
- ✅ No local file system access in production routes
- ✅ All images use Supabase Storage URLs

### 4. Build Configuration
- ✅ `package.json` has correct build scripts
- ✅ `next.config.ts` is properly configured
- ✅ TypeScript configuration is correct
- ✅ No build errors

### 5. Security
- ✅ Environment variables are not committed
- ✅ Admin secret keys are secure
- ✅ API routes have proper authentication
- ✅ Security headers are configured

## 🚀 Vercel Deployment Steps

1. **Connect Repository**
   - Go to [Vercel Dashboard](https://vercel.com)
   - Click "New Project"
   - Import your Git repository

2. **Configure Project**
   - Framework Preset: Next.js (auto-detected)
   - Root Directory: `./` (default)
   - Build Command: `npm run build` (default)
   - Output Directory: `.next` (default)

3. **Add Environment Variables**
   - Go to Project Settings → Environment Variables
   - Add all required variables listed above
   - Set them for Production, Preview, and Development

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Check build logs for any errors

## 🔍 Post-Deployment Verification

1. **Check Build Logs**
   - Verify no errors during build
   - Check for missing environment variables

2. **Test Application**
   - Visit your deployed URL
   - Test authentication (login/signup)
   - Test product browsing
   - Test cart functionality
   - Test checkout process

3. **Check API Routes**
   - Verify all API endpoints work
   - Check category images load correctly
   - Verify Supabase connections

4. **Monitor Logs**
   - Check Vercel function logs
   - Monitor for any runtime errors
   - Check Supabase logs

## ⚠️ Common Issues & Solutions

### Issue: Build fails with "Missing environment variables"
**Solution:** Add all required environment variables in Vercel dashboard

### Issue: Images not loading
**Solution:** Verify Supabase Storage bucket is public and URLs are correct

### Issue: API routes return 500 errors
**Solution:** Check Vercel function logs and verify Supabase credentials

### Issue: Authentication not working
**Solution:** Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set correctly

## 📝 Notes

- The application uses Next.js 15 with React 19
- All images are served from Supabase Storage
- No local file system access is used in production
- All sensitive operations use environment variables
- The app is fully compatible with Vercel's serverless architecture

## 🔗 Useful Links

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Supabase Documentation](https://supabase.com/docs)

