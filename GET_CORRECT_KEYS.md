# ⚠️ Important: Get Your Correct Supabase Keys

## The key you provided might not be correct!

The key `sb_publishable_KyZGwHEpkoXVUSIDtGfsZQ_AHfx1fdE` looks like it might be the wrong type.

---

## ✅ How to Get the CORRECT Keys

### Step 1: Go to Supabase Dashboard

1. Visit: https://supabase.com/dashboard
2. Select your project: **tsklolrjcgmlxfghzdfs**

### Step 2: Navigate to API Settings

1. Click on **Settings** (gear icon) in the left sidebar
2. Click on **API** in the submenu

### Step 3: Copy the Correct Keys

You'll see a section called **Project API keys**. Copy these TWO keys:

#### **Project URL** ✅
```
https://tsklolrjcgmlxfghzdfs.supabase.co
```
✅ This one is CORRECT!

#### **anon / public key** ✅
Look for the key that:
- Starts with `eyJ...`
- Is very long (several hundred characters)
- Says "anon" or "public" next to it

It should look like:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRza2xvbHJqY2dtbHhmZ2h6ZGZzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDY4NjI0MzAsImV4cCI6MjAyMjQzODQzMH0...
```

### Step 4: Update .env.local

Once you have the correct `anon key`, replace it in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tsklolrjcgmlxfghzdfs.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...YOUR_LONG_KEY_HERE
```

---

## 🎯 Quick Test

After updating the key:

1. Run: `npm run dev`
2. Visit: http://localhost:3000
3. Try to sign up
4. If you get "Invalid API key" error, the key is still wrong

---

## 📸 Screenshot Guide

In Supabase Dashboard → Settings → API, you should see:

```
Project API keys
├── anon/public    eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... ← USE THIS
├── service_role   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... ← DON'T USE (secret)
```

**Copy the "anon/public" one!**

---

## ⚡ Once You Have It

1. Replace the key in `.env.local`
2. Save the file
3. Restart your dev server: `Ctrl+C` then `npm run dev`
4. Test signup at: http://localhost:3000/auth/signup

---

**Need help?** Make sure you're copying from Settings → API → "anon" key!
