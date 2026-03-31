# 🚀 Deployment Guide - The Greggory Foundation Website

## Quick Deploy Options

### ✅ **Option 1: Deploy to Netlify (Recommended - FREE)**

#### Method A: Netlify CLI (Command Line)

1. **Install Netlify CLI** (run in PowerShell):
```powershell
npm install -g netlify-cli
```

2. **Build your website**:
```powershell
npm run build
```

3. **Deploy to Netlify**:
```powershell
netlify deploy --prod
```

Follow the prompts:
- Login to Netlify (browser will open)
- Create a new site or select existing
- Set publish directory: `dist`

Your site will be live at: `https://your-site-name.netlify.app`

---

#### Method B: Netlify Drag & Drop (Easiest!)

1. **Build your website**:
```powershell
npm run build
```

2. Go to: **https://app.netlify.com/drop**

3. **Drag and drop** the `dist` folder onto the page

4. Your site is LIVE instantly! 🎉

You'll get a URL like: `https://random-name-123.netlify.app`

5. **Custom Domain** (Optional):
   - In Netlify dashboard → Domain Settings
   - Add your custom domain: `greggoryfoundation.com`

---

### ✅ **Option 2: Deploy to Vercel (Also FREE)**

1. **Install Vercel CLI**:
```powershell
npm install -g vercel
```

2. **Deploy**:
```powershell
vercel
```

3. Follow prompts and your site will be live at: `https://your-project.vercel.app`

---

### ✅ **Option 3: Deploy to GitHub Pages (FREE)**

1. **Create GitHub repository**:
   - Go to github.com
   - Create new repository: `greggory-foundation-website`

2. **Install gh-pages**:
```powershell
npm install --save-dev gh-pages
```

3. **Add to package.json** (add this line in "scripts"):
```json
"deploy": "npm run build && gh-pages -d dist"
```

4. **Deploy**:
```powershell
npm run deploy
```

Your site will be at: `https://your-username.github.io/greggory-foundation-website`

---

## 📋 Pre-Deployment Checklist

✅ **Already Done:**
- [x] All pages created (Home, About, Services, Case Studies, Blog, Contact)
- [x] Authentication system (Login, Signup, Password Reset)
- [x] Responsive design (mobile, tablet, desktop)
- [x] Professional branding (logo, colors, fonts)
- [x] Terms of Use and Privacy Policy pages
- [x] Contact form
- [x] SEO meta tags
- [x] Favicon configured
- [x] Build configuration (netlify.toml)

✅ **Before Going Live:**
- [ ] Test all pages work correctly
- [ ] Update contact email in Contact page
- [ ] Update phone numbers (if using real ones)
- [ ] Test forms
- [ ] Check mobile responsiveness
- [ ] Add Google Analytics (optional)

---

## 🌐 Custom Domain Setup

### After Deploying to Netlify/Vercel:

1. **Buy a domain** (if you don't have one):
   - Namecheap.com
   - GoDaddy.com
   - Google Domains

2. **Connect domain**:
   - In Netlify/Vercel dashboard
   - Go to Domain Settings
   - Add custom domain
   - Update DNS records (instructions provided)

Example domain ideas:
- `greggoryfoundation.com`
- `greggoryfoundationltd.com`
- `thegreggoryfoundation.com`

---

## 🔧 Build Commands

```powershell
# Development (local testing)
npm run dev

# Production build
npm run build

# Preview production build locally
npm run preview
```

---

## 📊 What Gets Deployed

When you build, these files are created in the `dist` folder:
- Optimized HTML, CSS, JavaScript
- Compressed images and assets
- All 11 pages of your website
- Authentication system
- Contact forms

**Total size**: ~500KB (very fast loading!)

---

## 🚨 Troubleshooting

### "npm: command not found"
- Close and reopen PowerShell
- Run: `node --version` to verify Node.js is installed

### Build fails
- Delete `node_modules` folder
- Run: `npm install`
- Try build again: `npm run build`

### Site loads but shows blank page
- Check browser console for errors (F12)
- Verify `dist` folder has files
- Ensure correct publish directory: `dist`

---

## 🎯 Recommended: Use Netlify Drag & Drop

**Fastest way to get your site live:**

1. Build: `npm run build`
2. Go to: https://app.netlify.com/drop
3. Drag the `dist` folder
4. Done! Your site is live in 30 seconds!

---

## 📞 Need Help?

- Netlify Support: https://www.netlify.com/support/
- Vercel Support: https://vercel.com/support

---

**Your website is ready to deploy! Choose any method above and your professional site will be live on the internet in minutes!** 🚀
