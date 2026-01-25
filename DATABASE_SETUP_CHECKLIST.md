# 🗄️ Database Setup - CRITICAL STEP

## ⚠️ BEFORE YOU START THE APP

You **MUST** run the SQL scripts in Supabase to create database tables!

---

## ✅ Quick Setup (5 minutes)

### Step 1: Open SQL Editor

Go to: https://supabase.com/dashboard/project/tsklolrjcgmlxfghzdfs/sql/new

### Step 2: Copy SQL Script

1. Open the file: `SUPABASE_SETUP.md`
2. Find "Step 1: Create profiles table"
3. Copy the ENTIRE SQL code (all sections)
4. Paste into Supabase SQL Editor

### Step 3: Run the Script

1. Click the green **"Run"** button
2. Wait for it to complete
3. You should see success messages

### Step 4: Verify Tables Created

Run this query to check:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('profiles', 'user_stats', 'subscriptions');
```

You should see 3 tables listed.

---

## 🚀 Then Start Your App

After running the SQL:

```bash
npm run dev
```

Visit: http://localhost:3000

---

## ⚡ What the SQL Creates

- ✅ **profiles** table - User accounts and subscription info
- ✅ **user_stats** table - Exam results and progress
- ✅ **subscriptions** table - Payment tracking
- ✅ **RLS policies** - Security rules
- ✅ **Triggers** - Auto-create profile on signup
- ✅ **Functions** - Helper functions

---

## 🐛 If You Skip This Step

You'll get these errors:
- ❌ "relation profiles does not exist"
- ❌ User signup will fail
- ❌ Can't save exam results
- ❌ Dashboard won't load

---

## 📝 Alternative: Run SQL Section by Section

If running all at once fails, run each section separately:

### Section 1: Profiles Table
```sql
-- Copy from "Step 1: Create profiles table" section
```

### Section 2: User Stats Table
```sql
-- Copy from "Step 2: Create user_stats table" section
```

### Section 3: Subscriptions Table
```sql
-- Copy from "Step 3: Create subscriptions table" section
```

### Section 4: Helper Functions
```sql
-- Copy from "Step 4: Create helper functions" section
```

---

## ✅ Ready to Test?

Once SQL is run:

1. Start the app: `npm run dev`
2. Visit: http://localhost:3000/auth/signup
3. Create a test account
4. Check your email for confirmation
5. Click the confirmation link
6. Log in and test!

---

**DO THIS NOW** before starting the server!
