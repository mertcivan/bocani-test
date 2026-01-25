'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, BarChart3, TrendingUp, Award, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';
import { getUserStatsSummary, getUserExamHistory } from '@/lib/supabase/stats';

interface SessionData {
  sessionId: string;
  date: string;
  mode: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
}

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [stats, setStats] = useState({
    totalSessions: 0,
    averageScore: 0,
    totalQuestions: 0,
    totalCorrect: 0,
    accuracy: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login?redirect=/dashboard');
      return;
    }

    if (user) {
      loadDashboardData();
    }
  }, [user, loading, router]);

  const loadDashboardData = async () => {
    if (!user) return;

    try {
      setIsLoading(true);

      // Load from localStorage first for immediate display
      loadFromLocalStorage();
      setIsLoading(false);

      // Then try to load from Supabase with a timeout
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Supabase timeout')), 8000)
      );

      const supabasePromise = Promise.all([
        getUserStatsSummary(user.id),
        getUserExamHistory(user.id, 10),
      ]);

      const [summary, history] = await Promise.race([
        supabasePromise,
        timeoutPromise.then(() => { throw new Error('timeout'); }),
      ]) as [any, any];

      if (summary && history) {
        setStats({
          totalSessions: summary.total_exams || 0,
          averageScore: summary.avg_score || 0,
          totalQuestions: summary.total_questions || 0,
          totalCorrect: summary.total_correct || 0,
          accuracy: summary.accuracy || 0,
        });

        // Transform history to SessionData format
        const transformedSessions: SessionData[] = history.map((exam: any) => ({
          sessionId: exam.exam_id,
          date: new Date(exam.completed_at).toLocaleString(),
          mode: exam.exam_type,
          score: exam.score,
          totalQuestions: exam.total_questions,
          correctAnswers: exam.correct_answers,
        }));

        setSessions(transformedSessions);
      }
    } catch (error) {
      console.error('Error loading from Supabase, using localStorage:', error);
      // localStorage data is already loaded above
    } finally {
      setIsLoading(false);
    }
  };

  const loadFromLocalStorage = () => {
    const allSessions: SessionData[] = [];
    let totalScore = 0;
    let totalQuestions = 0;
    let totalCorrect = 0;

    // Load all sessions from localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('exam-session-')) {
        try {
          const data = JSON.parse(localStorage.getItem(key) || '');
          const answers = new Map(data.answers);
          const correctCount = Array.from(answers.values()).filter(
            (a: any) => a.isCorrect
          ).length;
          const score =
            data.questions.length > 0
              ? (correctCount / data.questions.length) * 100
              : 0;

          allSessions.push({
            sessionId: key.replace('exam-session-', ''),
            date: new Date(data.startTime).toLocaleString(),
            mode: data.mode,
            score: Math.round(score * 10) / 10,
            totalQuestions: data.questions.length,
            correctAnswers: correctCount,
          });

          totalScore += score;
          totalQuestions += data.questions.length;
          totalCorrect += correctCount;
        } catch (error) {
          console.error('Error parsing session:', error);
        }
      }
    }

    // Sort by most recent
    allSessions.sort((a, b) => b.sessionId.localeCompare(a.sessionId));

    setSessions(allSessions);
    setStats({
      totalSessions: allSessions.length,
      averageScore:
        allSessions.length > 0
          ? Math.round((totalScore / allSessions.length) * 10) / 10
          : 0,
      totalQuestions,
      totalCorrect,
      accuracy:
        totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100 * 10) / 10 : 0,
    });
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

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-50';
    if (score >= 60) return 'bg-blue-50';
    if (score >= 40) return 'bg-yellow-50';
    return 'bg-red-50';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Track your progress and performance</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {sessions.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="w-10 h-10 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              No Sessions Yet
            </h2>
            <p className="text-gray-600 mb-6">
              Start practicing or take a mock exam to see your statistics here
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/practice">
                <button className="btn-primary">Start Practice</button>
              </Link>
              <Link href="/mock-exam">
                <button className="btn-secondary">Take Mock Exam</button>
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <BookOpen className="w-5 h-5 text-blue-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-600">
                    Total Sessions
                  </span>
                </div>
                <div className="text-3xl font-bold text-gray-900">
                  {stats.totalSessions}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-600">
                    Average Score
                  </span>
                </div>
                <div className="text-3xl font-bold text-green-600">
                  {stats.averageScore}%
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <BarChart3 className="w-5 h-5 text-purple-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-600">
                    Questions Attempted
                  </span>
                </div>
                <div className="text-3xl font-bold text-gray-900">
                  {stats.totalQuestions}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Award className="w-5 h-5 text-yellow-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-600">
                    Correct Answers
                  </span>
                </div>
                <div className="text-3xl font-bold text-yellow-600">
                  {stats.totalCorrect}
                </div>
              </div>
            </div>

            {/* Performance Overview */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Overall Performance
              </h2>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      Success Rate
                    </span>
                    <span className="text-sm text-gray-600">
                      {stats.totalQuestions > 0
                        ? Math.round((stats.totalCorrect / stats.totalQuestions) * 100)
                        : 0}
                      %
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-green-600 h-3 rounded-full transition-all"
                      style={{
                        width: `${
                          stats.totalQuestions > 0
                            ? (stats.totalCorrect / stats.totalQuestions) * 100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Sessions */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Recent Sessions
              </h2>
              <div className="space-y-3">
                {sessions.slice(0, 10).map((session) => (
                  <div
                    key={session.sessionId}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="font-semibold text-gray-900">
                          {session.mode === 'mock' ? 'Mock Exam' : 'Practice Session'}
                        </span>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${getScoreBg(
                            session.score
                          )} ${getScoreColor(session.score)}`}
                        >
                          {session.score}%
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        {session.date} • {session.correctAnswers}/
                        {session.totalQuestions} correct
                      </div>
                    </div>
                    <Link href={`/results/${session.sessionId}`}>
                      <button className="px-4 py-2 text-sm font-medium text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                        View Details
                      </button>
                    </Link>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Link href="/practice" className="flex-1">
                <button className="w-full btn-primary">Continue Practice</button>
              </Link>
              <Link href="/mock-exam" className="flex-1">
                <button className="w-full btn-secondary">Take Mock Exam</button>
              </Link>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
