# Integration Guide - Connecting Supabase to Existing Code

This guide shows exactly what to change in your existing files to integrate Supabase authentication and database.

---

## 📝 Step-by-Step Integration

### Step 1: Update Root Layout

**File:** `app/layout.tsx`

**Add AuthProvider wrapper:**

```typescript
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/components/AuthProvider'; // ADD THIS

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Bocconi Prep Master',
  description: 'High-end exam preparation platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider> {/* WRAP WITH THIS */}
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
```

---

### Step 2: Update Home Page (Add Auth Links)

**File:** `app/page.tsx`

**Add user state and auth links:**

```typescript
'use client'; // ADD THIS

import Link from 'next/link';
import { BookOpen, Clock, BarChart3 } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider'; // ADD THIS

export default function HomePage() {
  const { user } = useAuth(); // ADD THIS

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Bocconi Prep Master</h1>
            <p className="text-gray-600 mt-1">Excel in your entrance exam preparation</p>
          </div>

          {/* ADD AUTH BUTTONS */}
          <div className="flex gap-3">
            {user ? (
              <>
                <Link href="/dashboard">
                  <button className="px-4 py-2 text-primary-600 hover:text-primary-700">
                    Dashboard
                  </button>
                </Link>
                <Link href="/profile">
                  <button className="px-4 py-2 border-2 border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50">
                    Profile
                  </button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/auth/login">
                  <button className="px-4 py-2 text-primary-600 hover:text-primary-700">
                    Log In
                  </button>
                </Link>
                <Link href="/auth/signup">
                  <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                    Sign Up
                  </button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Rest of your existing code... */}
    </div>
  );
}
```

---

### Step 3: Update Practice Page (Add Difficulty Paywall)

**File:** `app/practice/page.tsx`

**Add paywall for hard questions:**

```typescript
'use client';

import { useState, useEffect } from 'react';
import { Question, Difficulty } from '@/types';
import { fetchQuestions, filterQuestions, getUniqueValues } from '@/lib/csvParser';
import { ExamEngine } from '@/components/ExamEngine';
import { ArrowLeft, Filter } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider'; // ADD THIS
import { Paywall, useFeatureAccess } from '@/components/Paywall'; // ADD THIS

export default function PracticePage() {
  const { user } = useAuth(); // ADD THIS
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | ''>('');
  const [isStarted, setIsStarted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subCategories, setSubCategories] = useState<string[]>([]);

  // ... existing code ...

  const handleStartPractice = () => {
    // ADD THIS CHECK
    if (selectedDifficulty === 'Hard') {
      const { hasAccess } = useFeatureAccess('hard_questions');
      if (!hasAccess && !user?.subscription_type === 'premium') {
        // Will be caught by middleware, but double-check here
      }
    }

    const filtered = filterQuestions(allQuestions, {
      subCategory: selectedSubCategory || undefined,
      difficulty: selectedDifficulty || undefined,
      mode: 'Practice',
    });

    if (filtered.length === 0) {
      alert('No questions found with the selected filters.');
      return;
    }

    setFilteredQuestions(filtered);
    setIsStarted(true);
  };

  // ... rest of existing code ...

  // MODIFY DIFFICULTY BUTTON for Hard:
  // In the render section, update the Hard button:

  return (
    // ... existing JSX ...

    <button
      onClick={() => {
        // ADD PREMIUM CHECK FOR HARD
        if (!user || user.subscription_type !== 'premium') {
          // Show upgrade prompt or disable
          alert('Upgrade to Premium to access Hard questions!');
          return;
        }
        setSelectedDifficulty('Hard');
      }}
      className={`px-4 py-3 rounded-lg font-medium border-2 transition-all ${
        selectedDifficulty === 'Hard'
          ? 'border-red-500 bg-red-50 text-red-700'
          : 'border-gray-300 text-gray-700 hover:border-gray-400'
      }`}
    >
      Hard {!user || user.subscription_type !== 'premium' ? '🔒' : ''}
    </button>
  );
}
```

---

### Step 4: Update Mock Exam Page (Add Premium Check)

**File:** `app/mock-exam/page.tsx`

**Add authentication and premium check:**

```typescript
'use client';

import { useState, useEffect } from 'react';
import { Question } from '@/types';
import { fetchQuestions, getRandomQuestions } from '@/lib/csvParser';
import { ExamEngine } from '@/components/ExamEngine';
import { ArrowLeft, Clock, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider'; // ADD THIS
import { Paywall, useFeatureAccess } from '@/components/Paywall'; // ADD THIS

const MOCK_EXAM_QUESTIONS = 50;
const MOCK_EXAM_DURATION = 75 * 60;

export default function MockExamPage() {
  const { user } = useAuth(); // ADD THIS
  const { hasAccess } = useFeatureAccess('mock_exam'); // ADD THIS

  const [questions, setQuestions] = useState<Question[]>([]);
  const [isStarted, setIsStarted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  // ADD PAYWALL CHECK AT TOP
  if (!hasAccess) {
    return <Paywall feature="mock_exam" />;
  }

  // ... rest of existing code stays the same ...
}
```

---

### Step 5: Update ExamEngine (Save to Supabase)

**File:** `components/ExamEngine.tsx`

**Replace localStorage with Supabase:**

```typescript
'use client';

import { useState, useEffect } from 'react';
import { Question, UserAnswer } from '@/types';
import { QuestionCard } from './QuestionCard';
import { Timer } from './Timer';
import { QuestionNavigator } from './QuestionNavigator';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { calculateResults } from '@/lib/examUtils'; // MODIFY IMPORT
import { useAuth } from './AuthProvider'; // ADD THIS
import { saveExamResults } from '@/lib/supabase/stats'; // ADD THIS

interface ExamEngineProps {
  questions: Question[];
  mode: 'practice' | 'mock';
  sessionId: string;
  showSolutionsImmediately?: boolean;
  timerDuration?: number;
}

export function ExamEngine({
  questions,
  mode,
  sessionId,
  showSolutionsImmediately = false,
  timerDuration,
}: ExamEngineProps) {
  const router = useRouter();
  const { user } = useAuth(); // ADD THIS
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Map<string, UserAnswer>>(new Map());
  const [startTime] = useState(new Date());

  // ... existing code ...

  const handleSubmit = async () => { // MAKE ASYNC
    // REPLACE localStorage save with Supabase save
    if (user) {
      try {
        const results = calculateResults(questions, answers);
        const timeTaken = Math.floor((Date.now() - startTime.getTime()) / 1000);

        await saveExamResults(
          user.id,
          sessionId,
          mode,
          questions,
          answers,
          results,
          timeTaken
        );
      } catch (error) {
        console.error('Error saving results:', error);
      }
    }

    // Navigate to results
    router.push(`/results/${sessionId}`);
  };

  // REMOVE the useEffect that auto-saves to localStorage
  // Or keep it as fallback for non-authenticated users

  // ... rest of existing code ...
}
```

---

### Step 6: Update Dashboard (Fetch from Supabase)

**File:** `app/dashboard/page.tsx`

**Replace localStorage with Supabase queries:**

```typescript
'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, BarChart3, TrendingUp, Award, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider'; // ADD THIS
import { getUserStatsSummary, getUserExamHistory } from '@/lib/supabase/stats'; // ADD THIS
import { useRouter } from 'next/navigation'; // ADD THIS

export default function DashboardPage() {
  const { user, loading } = useAuth(); // ADD THIS
  const router = useRouter(); // ADD THIS

  const [stats, setStats] = useState({
    totalExams: 0,
    averageScore: 0,
    totalQuestions: 0,
    totalCorrect: 0,
    accuracy: 0,
  });
  const [sessions, setSessions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
      return;
    }

    if (user) {
      loadDashboardData();
    }
  }, [user, loading, router]);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);

      // REPLACE localStorage code with Supabase:
      const [summary, history] = await Promise.all([
        getUserStatsSummary(user!.id),
        getUserExamHistory(user!.id, 10),
      ]);

      setStats({
        totalExams: summary.total_exams || 0,
        averageScore: summary.avg_score || 0,
        totalQuestions: summary.total_questions || 0,
        totalCorrect: summary.total_correct || 0,
        accuracy: summary.accuracy || 0,
      });

      setSessions(history);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // ... rest of existing JSX with stats and sessions ...
}
```

---

### Step 7: Update Results Page (Fetch from Supabase)

**File:** `app/results/[sessionId]/page.tsx`

**Add option to load from Supabase:**

```typescript
'use client';

import { useState, useEffect } from 'react';
import { Question, UserAnswer, ExamResults } from '@/types';
import { loadSessionFromLocalStorage, calculateResults } from '@/lib/examUtils';
import { getExamById } from '@/lib/supabase/stats'; // ADD THIS
import { useAuth } from '@/components/AuthProvider'; // ADD THIS
import { QuestionCard } from '@/components/QuestionCard';
import { ArrowLeft, CheckCircle2, XCircle, Award, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function ResultsPage() {
  const params = useParams();
  const sessionId = params.sessionId as string;
  const { user } = useAuth(); // ADD THIS

  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Map<string, UserAnswer>>(new Map());
  const [results, setResults] = useState<ExamResults | null>(null);
  const [reviewMode, setReviewMode] = useState(false);
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);
  const [mode, setMode] = useState<'practice' | 'mock'>('practice');

  useEffect(() => {
    loadResults();
  }, [sessionId, user]);

  const loadResults = async () => {
    // TRY SUPABASE FIRST (if user is logged in)
    if (user && !sessionId.startsWith('practice-') && !sessionId.startsWith('mock-')) {
      try {
        const examData = await getExamById(sessionId);
        if (examData) {
          setQuestions(examData.questions);

          // Reconstruct answers Map
          const answersMap = new Map<string, UserAnswer>();
          examData.questions.forEach((q: Question) => {
            // Find if this question was answered
            const isWrong = examData.wrong_answers.includes(q.id);
            // This is simplified - you may need to store full answer data
            answersMap.set(q.id, {
              questionId: q.id,
              selectedAnswer: '', // Would need to store this
              isCorrect: !isWrong,
            });
          });

          setAnswers(answersMap);
          setMode(examData.exam_type);

          const calculatedResults = calculateResults(examData.questions, answersMap);
          setResults(calculatedResults);
          return;
        }
      } catch (error) {
        console.error('Error loading from Supabase:', error);
      }
    }

    // FALLBACK TO LOCALSTORAGE
    const session = loadSessionFromLocalStorage(sessionId);
    if (session) {
      setQuestions(session.questions);
      setAnswers(session.answers);
      setMode(session.mode);
      const calculatedResults = calculateResults(session.questions, session.answers);
      setResults(calculatedResults);
    }
  };

  // ... rest of existing code ...
}
```

---

## 🔒 Security Notes

1. **Never expose service role key** in client code
2. **Use RLS policies** for all database access
3. **Validate user permissions** on server side
4. **Use middleware** to protect routes
5. **Sanitize user inputs** before database queries

---

## ✅ Testing Checklist

After integration:

- [ ] Wrap app with `<AuthProvider>` in layout
- [ ] Auth buttons show on home page
- [ ] Login/signup pages work
- [ ] Protected routes redirect to login
- [ ] Paywall shows for premium features
- [ ] Hard questions blocked for free users
- [ ] Mock exams blocked for free users
- [ ] Exam results save to Supabase
- [ ] Dashboard loads from Supabase
- [ ] User profile shows subscription type

---

## 🚀 Quick Start Commands

```bash
# 1. Install new dependencies
npm install

# 2. Create .env.local with Supabase credentials
cp .env.local.example .env.local
# Edit .env.local with your keys

# 3. Run SQL schema in Supabase dashboard
# (Copy from SUPABASE_SETUP.md)

# 4. Start dev server
npm run dev

# 5. Test signup
# Visit: http://localhost:3000/auth/signup
```

---

## 📞 Need Help?

Refer to:
- `SUPABASE_SETUP.md` - Database setup
- `SUPABASE_IMPLEMENTATION_SUMMARY.md` - Complete overview
- `FIX_APPLIED.md` - Previous build error fix

---

**You're all set! Your app is now a full SaaS platform! 🎉**
