# ⚡ Quick Start Guide

## 5-Minute Setup

### 1️⃣ Install Dependencies
```bash
npm install
```

### 2️⃣ Create Supabase Account
👉 [supabase.com](https://supabase.com) → New Project

### 3️⃣ Get Your Keys
Dashboard → Settings → API → Copy:
- Project URL
- Anon Key

### 4️⃣ Create `.env.local`
```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 5️⃣ Run SQL
Dashboard → SQL Editor → Copy entire content from `SUPABASE_SETUP.md` → Run

### 6️⃣ Start App
```bash
npm run dev
```

Visit: http://localhost:3000

---

## ✅ Test Checklist

- [ ] Sign up at `/auth/signup`
- [ ] Check email for confirmation
- [ ] Click confirmation link
- [ ] Log in at `/auth/login`
- [ ] Try to access Hard questions (should paywall)
- [ ] Complete a practice session
- [ ] Check dashboard

---

## 🚨 Common Errors

**"Invalid API key"**
→ Check `.env.local` file, restart server

**"User not created"**
→ Re-run SQL scripts in Supabase

**"Module not found"**
→ Run `npm install` again

---

## 📚 Full Docs

- `SETUP_INSTRUCTIONS.md` - Detailed setup
- `SUPABASE_SETUP.md` - Database SQL scripts
- `INTEGRATION_GUIDE.md` - Code changes reference

---

**Need help?** Check `SETUP_INSTRUCTIONS.md` for troubleshooting!
