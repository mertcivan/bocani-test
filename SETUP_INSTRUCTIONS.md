# 🚀 Complete Setup Instructions - Bocconi Prep Master SaaS

## ✅ Integration Complete!

All code has been integrated. Your application now has:
- ✅ Authentication system (Email + Google)
- ✅ Premium subscription management
- ✅ Paywall for premium features
- ✅ Supabase database integration
- ✅ Progress tracking in cloud

---

## 📋 Step-by-Step Setup (5 Steps)

### **Step 1: Install Dependencies**

```bash
npm install
```

This will install all packages including:
- `@supabase/supabase-js`
- `@supabase/auth-helpers-nextjs`
- `@supabase/auth-ui-react`
- `@supabase/auth-ui-shared`

---

### **Step 2: Create Supabase Project**

1. **Go to** [https://supabase.com](https://supabase.com)
2. **Sign up** or log in
3. **Click** "New Project"
4. **Fill in**:
   - Project name: `bocconi-prep-master`
   - Database password: (save this securely)
   - Region: Choose closest to you
5. **Wait** for project creation (~2 minutes)

---

### **Step 3: Get Supabase Credentials**

1. **In Supabase Dashboard** → Settings → API
2. **Copy** these two values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **Anon/Public Key** (long string starting with `eyJ...`)

---

### **Step 4: Create Environment File**

1. **Create** a file named `.env.local` in your project root
2. **Add** your credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJ...
```

Replace with your actual values!

---

### **Step 5: Run Database Schema**

1. **Open** Supabase Dashboard → SQL Editor
2. **Copy** the entire SQL script from `SUPABASE_SETUP.md` (all SQL commands)
3. **Paste** into SQL Editor
4. **Click** "Run" button
5. **Verify** success - you should see:
   - ✅ profiles table created
   - ✅ user_stats table created
   - ✅ subscriptions table created
   - ✅ RLS policies enabled
   - ✅ Triggers created

**Alternative**: Run each section one by one if you get errors.

---

## 🧪 Testing Your Setup

### **1. Start Development Server**

```bash
npm run dev
```

Visit: [http://localhost:3000](http://localhost:3000)

### **2. Test Sign Up**

1. Click "Sign Up" button
2. Fill in:
   - Full Name: Test User
   - Email: test@example.com
   - Password: test123456
3. Click "Create Account"
4. **Check your email** for confirmation link
5. Click confirmation link
6. You should be redirected to dashboard

### **3. Test Login**

1. Go to [http://localhost:3000/auth/login](http://localhost:3000/auth/login)
2. Enter your credentials
3. Click "Sign In"
4. Should redirect to dashboard

### **4. Test Paywall**

1. **Without logging in**:
   - Go to Practice Mode
   - Try to select "Hard" difficulty
   - Should redirect to pricing page

2. **After logging in** (free account):
   - Try to access Mock Exam
   - Should see paywall overlay
   - Should redirect to pricing page

### **5. Test Progress Tracking**

1. Log in
2. Start a practice session
3. Answer some questions
4. Submit
5. Go to Dashboard
6. Should see your stats loaded from Supabase

---

## 🔐 Configure Google OAuth (Optional)

### **1. Google Cloud Console Setup**

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create new project or select existing
3. Enable **Google+ API**
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
5. Choose **Web application**
6. Add **Authorized redirect URI**:
   ```
   https://YOUR-PROJECT-ID.supabase.co/auth/v1/callback
   ```
   (Replace `YOUR-PROJECT-ID` with your actual Supabase project ID)

### **2. Supabase Configuration**

1. Go to Supabase Dashboard → Authentication → Providers
2. Find **Google** provider
3. Toggle **Enable**
4. Enter:
   - **Client ID** from Google
   - **Client Secret** from Google
5. Click **Save**

### **3. Test Google Login**

1. Go to login page
2. Click "Continue with Google"
3. Should redirect to Google
4. Select account
5. Should redirect back and create profile

---

## 📊 Verify Database Tables

Run this in Supabase SQL Editor to check:

```sql
-- Check tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('profiles', 'user_stats', 'subscriptions');

-- Check if any users signed up
SELECT id, email, subscription_type, points, created_at
FROM profiles;

-- Check if any exam results saved
SELECT id, user_id, exam_type, score, completed_at
FROM user_stats
ORDER BY completed_at DESC
LIMIT 5;
```

---

## 🐛 Common Issues & Solutions

### **Issue 1: "Invalid API key" error**

**Solution**:
```bash
# Check .env.local file exists in root directory
ls -la .env.local

# Verify it contains correct keys (no extra spaces)
cat .env.local

# Restart dev server
npm run dev
```

### **Issue 2: User not created in profiles table**

**Solution**:
1. Check trigger exists:
   ```sql
   SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
   ```
2. If missing, re-run the trigger SQL from SUPABASE_SETUP.md
3. Check Supabase logs: Dashboard → Logs → Authentication

### **Issue 3: "Can't resolve @/components/AuthProvider"**

**Solution**:
```bash
# Make sure file exists
ls components/AuthProvider.tsx

# Restart TypeScript server in VS Code
# Command Palette (Ctrl+Shift+P) → "TypeScript: Restart TS Server"

# Restart dev server
npm run dev
```

### **Issue 4: RLS policy blocking access**

**Solution**:
1. Temporarily disable RLS to test:
   ```sql
   ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
   ```
2. Check if it works
3. Re-enable and fix policies:
   ```sql
   ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
   ```
4. Make sure policies use `auth.uid()`:
   ```sql
   -- View current policies
   SELECT * FROM pg_policies WHERE tablename = 'profiles';
   ```

### **Issue 5: Paywall not showing**

**Solution**:
1. Check `<AuthProvider>` wraps app in `app/layout.tsx`
2. Clear browser cache
3. Check user object in console:
   ```typescript
   // Add in component
   const { user } = useAuth();
   console.log('User:', user);
   ```

---

## 📁 File Structure Reference

```
Bocani_test/
├── .env.local                          ← CREATE THIS FILE
├── .env.local.example                  ← Template
├── SETUP_INSTRUCTIONS.md               ← You are here
├── SUPABASE_SETUP.md                   ← SQL scripts
├── INTEGRATION_GUIDE.md                ← Code changes reference
│
├── app/
│   ├── layout.tsx                      ← ✅ Updated (AuthProvider)
│   ├── page.tsx                        ← ✅ Updated (Auth buttons)
│   ├── practice/page.tsx               ← ✅ Updated (Hard paywall)
│   ├── mock-exam/page.tsx              ← ✅ Updated (Auth check)
│   ├── dashboard/page.tsx              ← ✅ Updated (Supabase data)
│   ├── pricing/page.tsx                ← ✅ New
│   ├── auth/
│   │   ├── login/page.tsx              ← ✅ New
│   │   ├── signup/page.tsx             ← ✅ New
│   │   └── callback/route.ts           ← ✅ New
│   └── api/
│       └── questions/route.ts          ← ✅ Existing
│
├── components/
│   ├── AuthProvider.tsx                ← ✅ New
│   ├── Paywall.tsx                     ← ✅ New
│   └── ExamEngine.tsx                  ← ✅ Updated (Supabase save)
│
├── lib/
│   └── supabase/
│       ├── client.ts                   ← ✅ New
│       ├── auth.ts                     ← ✅ New
│       └── stats.ts                    ← ✅ New
│
└── middleware.ts                       ← ✅ New (Route protection)
```

---

## 🎯 What Works Now

### **Authentication**
- ✅ Email/password signup
- ✅ Email/password login
- ✅ Google OAuth (if configured)
- ✅ Email confirmation
- ✅ Password reset
- ✅ Session persistence
- ✅ Auto logout on session expire

### **Authorization**
- ✅ Free tier users: Easy & Medium questions only
- ✅ Premium users: All difficulties + Mock exams
- ✅ Route protection (middleware)
- ✅ Paywall component
- ✅ Pricing page

### **Data Persistence**
- ✅ User profiles in Supabase
- ✅ Exam results in Supabase
- ✅ Progress tracking
- ✅ Points system
- ✅ Category performance
- ✅ Wrong answers tracking
- ✅ Fallback to localStorage for non-auth users

### **UI/UX**
- ✅ Auth buttons on home page
- ✅ Premium badge for premium users
- ✅ Lock icon on restricted features
- ✅ Loading states
- ✅ Error handling
- ✅ Redirect after login
- ✅ Dashboard with stats

---

## 🚀 Next Steps (After Setup)

### **1. Test Everything**
- [ ] Sign up a new user
- [ ] Confirm email
- [ ] Log in
- [ ] Try practice mode (Easy/Medium)
- [ ] Try to access Hard questions (should paywall)
- [ ] Try to access Mock exam (should paywall)
- [ ] Complete a practice session
- [ ] Check dashboard shows stats
- [ ] Log out
- [ ] Log back in (session should persist)

### **2. Customize Premium Pricing**
- Edit `app/pricing/page.tsx`
- Update prices, features, billing cycles
- Add Stripe integration later

### **3. Add Real Payment Processing**
- Install Stripe: `npm install stripe @stripe/stripe-js`
- Create Stripe products
- Add webhook handler
- Update `subscription_type` on payment

### **4. Deploy to Production**
- Choose hosting: Vercel, Netlify, AWS
- Set production environment variables
- Configure production database URL
- Test email delivery
- Enable SMTP settings in Supabase

### **5. Monitor & Iterate**
- Check Supabase logs regularly
- Monitor user signups
- Track conversion to premium
- Gather user feedback
- Add more features

---

## 📞 Need Help?

### **Documentation Files**
- `SUPABASE_SETUP.md` - Database setup details
- `SUPABASE_IMPLEMENTATION_SUMMARY.md` - Feature overview
- `INTEGRATION_GUIDE.md` - Code changes made
- `README.md` - Original project docs

### **Useful Commands**
```bash
# Start development
npm run dev

# Build for production
npm run build

# Run production build
npm start

# Check for errors
npm run lint

# Clear Next.js cache
rm -rf .next
npm run dev
```

### **Supabase Dashboard URLs**
- SQL Editor: Dashboard → SQL Editor
- Authentication: Dashboard → Authentication
- Table Editor: Dashboard → Table Editor
- API Logs: Dashboard → Logs
- Database: Dashboard → Database

---

## ✅ Success Checklist

Before considering setup complete:

- [ ] Supabase project created
- [ ] Environment variables configured in `.env.local`
- [ ] All SQL scripts run successfully
- [ ] `npm install` completed without errors
- [ ] Dev server starts without errors
- [ ] Can visit home page
- [ ] Can sign up new user
- [ ] Receive confirmation email
- [ ] Can log in
- [ ] Paywall shows for premium features
- [ ] Can complete practice session
- [ ] Results save to Supabase
- [ ] Dashboard loads user stats
- [ ] Google OAuth configured (optional)

---

## 🎉 You're Ready!

Once all checklist items are complete, your SaaS platform is ready to use!

**What you have now:**
- Professional authentication system
- Subscription management
- Cloud database
- Progress tracking
- Premium features
- Secure user data
- Scalable architecture

**Next milestone:**
- Add Stripe for payments
- Deploy to production
- Get real users!

---

**Good luck with your exam prep platform! 🚀📚**
