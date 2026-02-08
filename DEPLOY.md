# Vercel Deployment Guide

## Option 1: GitHub Integration (Recommended)

1. **Push to GitHub**
   ```bash
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to https://vercel.com
   - Click "Add New..." → "Project"
   - Import your GitHub repository: Timcai06/Earnlytics
   - Vercel will auto-detect Next.js settings
   - Click "Deploy"

## Option 2: Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   cd earnlytics-web
   vercel --prod
   ```

## Environment Variables

Copy `.env.example` to `.env.local` and fill in values:
```bash
cp earnlytics-web/.env.example earnlytics-web/.env.local
```

## Project Settings (Auto-detected)

- Framework: Next.js
- Build Command: `npm run build`
- Output Directory: `.next`
- Install Command: `npm install`

## URLs

After deployment:
- Production: https://earnlytics.vercel.app (or custom domain)
- Dashboard: https://vercel.com/dashboard

## Troubleshooting

### Build Fails
- Run `cd earnlytics-web && npm run build` locally first
- Check all dependencies are in package.json

### Environment Variables Missing
- Add them in Vercel Dashboard → Project → Settings → Environment Variables

### Custom Domain
- Go to Project → Settings → Domains
- Add your custom domain
