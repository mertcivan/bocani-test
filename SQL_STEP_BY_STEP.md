# 🗄️ Run SQL Step-by-Step (Fix Errors)

## ⚠️ Run Each Step SEPARATELY

Don't paste everything at once! Run one section at a time.

---

## 📝 STEP 1: Create Profiles Table

Go to: https://supabase.com/dashboard/project/tsklolrjcgmlxfghzdfs/sql/new

**Copy and paste ONLY this code:**

```sql
-- Create profiles table
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  full_name TEXT,
  email TEXT UNIQUE,
  subscription_type TEXT DEFAULT 'free' CHECK (subscription_type IN ('free', 'premium')),
  points INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policy: Users can read their own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Create policy: Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Create policy: Users can insert their own profile
CREATE POLICY "Users can insert own profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Create function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

**Click "Run"** → Wait for success ✅

---

## 📝 STEP 2: Create User Stats Table

**Clear the SQL Editor, then paste ONLY this:**

```sql
-- Create user_stats table
CREATE TABLE public.user_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  exam_id TEXT NOT NULL,
  exam_type TEXT CHECK (exam_type IN ('practice', 'mock')),
  questions JSONB NOT NULL,
  wrong_answers TEXT[] DEFAULT '{}',
  category_scores JSONB DEFAULT '{}',
  total_questions INTEGER NOT NULL,
  correct_answers INTEGER NOT NULL,
  score NUMERIC(5,2) NOT NULL,
  time_taken INTEGER,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;

-- Create policy: Users can read their own stats
CREATE POLICY "Users can view own stats"
  ON public.user_stats
  FOR SELECT
  USING (auth.uid() = user_id);

-- Create policy: Users can insert their own stats
CREATE POLICY "Users can insert own stats"
  ON public.user_stats
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_user_stats_user_id ON public.user_stats(user_id);
CREATE INDEX idx_user_stats_completed_at ON public.user_stats(completed_at DESC);
```

**Click "Run"** → Wait for success ✅

---

## 📝 STEP 3: Create Subscriptions Table

**Clear the SQL Editor, then paste ONLY this:**

```sql
-- Create subscriptions table
CREATE TABLE public.subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  status TEXT CHECK (status IN ('active', 'canceled', 'past_due', 'trialing')),
  plan_type TEXT CHECK (plan_type IN ('monthly', 'yearly')),
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Create policy: Users can read their own subscription
CREATE POLICY "Users can view own subscription"
  ON public.subscriptions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Create index
CREATE INDEX idx_subscriptions_user_id ON public.subscriptions(user_id);
```

**Click "Run"** → Wait for success ✅

---

## 📝 STEP 4: Create Helper Functions

**Clear the SQL Editor, then paste ONLY this:**

```sql
-- Function to update user points
CREATE OR REPLACE FUNCTION public.update_user_points(
  p_user_id UUID,
  p_points_to_add INTEGER
)
RETURNS VOID AS $$
BEGIN
  UPDATE public.profiles
  SET points = points + p_points_to_add,
      updated_at = NOW()
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user stats summary
CREATE OR REPLACE FUNCTION public.get_user_stats_summary(p_user_id UUID)
RETURNS TABLE (
  total_exams BIGINT,
  avg_score NUMERIC,
  total_questions BIGINT,
  total_correct BIGINT,
  accuracy NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT as total_exams,
    ROUND(AVG(score), 2) as avg_score,
    SUM(total_questions)::BIGINT as total_questions,
    SUM(correct_answers)::BIGINT as total_correct,
    ROUND(
      CASE
        WHEN SUM(total_questions) > 0
        THEN (SUM(correct_answers)::NUMERIC / SUM(total_questions)::NUMERIC) * 100
        ELSE 0
      END,
      2
    ) as accuracy
  FROM public.user_stats
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**Click "Run"** → Wait for success ✅

---

## ✅ Verify Everything Worked

**Run this query to check:**

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('profiles', 'user_stats', 'subscriptions');
```

**You should see 3 tables listed:**
- profiles
- user_stats
- subscriptions

---

## 🐛 If You Still Get Errors

### Error: "relation already exists"
**Meaning**: You already ran this step before
**Solution**: Skip to next step, it's already done

### Error: "permission denied"
**Solution**: Make sure you're in YOUR project dashboard
Check URL: `tsklolrjcgmlxfghzdfs`

### Error: "syntax error"
**Solution**: Make sure you copied the ENTIRE code block
Don't miss the first or last line

---

## 🎯 After All 4 Steps Complete

Your database is ready! Now test your app:

1. **Visit**: http://localhost:3000/auth/signup
2. **Create account** with your email
3. **Check email** for confirmation
4. **Click link** to verify
5. **Login** and test!

---

## ⚡ Quick Checklist

- [ ] Step 1: Profiles table ✅
- [ ] Step 2: User stats table ✅
- [ ] Step 3: Subscriptions table ✅
- [ ] Step 4: Helper functions ✅
- [ ] Verify tables exist ✅
- [ ] Test signup ✅

---

**Go step-by-step and you'll have no errors!** 🚀
