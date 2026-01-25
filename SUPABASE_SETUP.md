# Supabase Setup Guide

## 1. Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in
3. Create a new project
4. Note down your:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **Anon/Public Key** (from Settings → API)

## 2. Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## 3. Database Schema

Run these SQL commands in the Supabase SQL Editor (Database → SQL Editor):

### Step 1: Create profiles table
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

### Step 2: Create user_stats table
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

### Step 3: Create subscriptions table (for future payments)
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

### Step 4: Create helper functions
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

## 4. Configure Google OAuth (Optional)

1. Go to Supabase Dashboard → Authentication → Providers
2. Enable Google provider
3. Get credentials from [Google Cloud Console](https://console.cloud.google.com):
   - Create OAuth 2.0 Client ID
   - Add authorized redirect URI: `https://your-project.supabase.co/auth/v1/callback`
4. Add Client ID and Client Secret to Supabase

## 5. Email Configuration

1. Go to Authentication → Email Templates
2. Customize email templates (optional)
3. Configure SMTP settings for production (Settings → Auth → SMTP)

## 6. Security Settings

1. Go to Authentication → Policies
2. Ensure all RLS policies are enabled
3. Set JWT expiry time (default is good)
4. Enable email confirmations for production

## 7. Test Database Connection

Run this query to verify everything is set up:

```sql
-- Check if tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('profiles', 'user_stats', 'subscriptions');

-- Check if policies are enabled
SELECT tablename, policyname
FROM pg_policies
WHERE schemaname = 'public';
```

## 8. Next Steps

After running all SQL commands:
1. Install npm packages: `npm install`
2. Start the dev server: `npm run dev`
3. Test signup at: `http://localhost:3000/auth/signup`

## Troubleshooting

### Issue: RLS blocking queries
- Solution: Verify policies are created correctly
- Test with Supabase dashboard table editor

### Issue: User profile not created
- Solution: Check trigger function `handle_new_user()`
- Verify it runs after user signup

### Issue: Can't read user data
- Solution: Check RLS policies allow SELECT for own data
- Verify `auth.uid()` matches user_id

---

**Important**: Never commit `.env.local` to version control!
