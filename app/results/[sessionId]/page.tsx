'use client';

import { useState, useEffect } from 'react';
import { Question, UserAnswer, ExamResults } from '@/types';
import { loadSessionFromLocalStorage, calculateResults, formatTime } from '@/lib/examUtils';
import { getExamById, UserStats } from '@/lib/supabase/stats';
import { QuestionCard } from '@/components/QuestionCard';
import { ArrowLeft, CheckCircle2, XCircle, Award, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function ResultsPage() {
  const params = useParams();
  const sessionId = params.sessionId as string;

  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Map<string, UserAnswer>>(new Map());
  const [results, setResults] = useState<ExamResults | null>(null);
  const [reviewMode, setReviewMode] = useState(false);
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);
  const [mode, setMode] = useState<'practice' | 'mock'>('practice');
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const loadResults = async () => {
      // First try localStorage
      const session = loadSessionFromLocalStorage(sessionId);
      if (session) {
        setQuestions(session.questions);
        setAnswers(session.answers);
        setMode(session.mode);
        const calculatedResults = calculateResults(session.questions, session.answers);
        setResults(calculatedResults);
        return;
      }

      // If not in localStorage, try Supabase
      try {
        const examData = await getExamById(sessionId);
        if (examData) {
          const examQuestions = examData.questions as Question[];
          setQuestions(examQuestions);
          setMode(examData.exam_type);

          // Reconstruct answers map from the stored data
          const answersMap = new Map<string, UserAnswer>();
          examQuestions.forEach((q) => {
            const isWrong = examData.wrong_answers?.includes(q.id);
            // We don't have the exact selected answer stored, but we can mark correctness
            answersMap.set(q.id, {
              questionId: q.id,
              selectedAnswer: isWrong ? -1 : q.correctAnswer, // If wrong, we don't know exactly what was selected
              isCorrect: !isWrong,
              isFlagged: false,
              timeSpent: 0,
            });
          });
          setAnswers(answersMap);

          // Use the stored results
          setResults({
            totalQuestions: examData.total_questions,
            correctAnswers: examData.correct_answers,
            incorrectAnswers: examData.total_questions - examData.correct_answers,
            unansweredQuestions: 0,
            score: examData.score,
            timeTaken: examData.time_taken || 0,
            breakdown: examData.category_scores as Record<string, { correct: number; total: number }>,
          });
          return;
        }
      } catch (error) {
        console.error('Error loading exam from Supabase:', error);
      }

      // If we get here, session wasn't found anywhere
      setNotFound(true);
    };

    loadResults();
  }, [sessionId]);

  if (notFound) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Session Not Found</h2>
          <p className="text-gray-600 mb-6">This exam session could not be found.</p>
          <Link href="/dashboard">
            <button className="btn-primary">Back to Dashboard</button>
          </Link>
        </div>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading results...</p>
        </div>
      </div>
    );
  }

  if (reviewMode && questions.length > 0) {
    const currentQuestion = questions[currentReviewIndex];
    const currentAnswer = answers.get(currentQuestion.id);

    return (
      <div className="min-h-screen bg-gray-50 py-6">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => setReviewMode(false)}
            className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Results
          </button>

          <QuestionCard
            question={currentQuestion}
            questionNumber={currentReviewIndex + 1}
            selectedAnswer={currentAnswer?.selectedAnswer}
            showSolution={true}
            onAnswerSelect={() => {}}
            disabled={true}
          />

          <div className="mt-6 flex justify-between items-center bg-white rounded-lg shadow-md p-4">
            <button
              onClick={() => setCurrentReviewIndex((prev) => prev - 1)}
              disabled={currentReviewIndex === 0}
              className="px-4 py-2 rounded-lg font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="text-sm text-gray-600">
              {currentReviewIndex + 1} of {questions.length}
            </span>
            <button
              onClick={() => setCurrentReviewIndex((prev) => prev + 1)}
              disabled={currentReviewIndex === questions.length - 1}
              className="px-4 py-2 rounded-lg font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    );
  }

  const scorePercentage = results.score;
  const getGrade = (score: number) => {
    if (score >= 90) return { grade: 'A+', color: 'text-green-600', bg: 'bg-green-100' };
    if (score >= 80) return { grade: 'A', color: 'text-green-600', bg: 'bg-green-100' };
    if (score >= 70) return { grade: 'B', color: 'text-blue-600', bg: 'bg-blue-100' };
    if (score >= 60) return { grade: 'C', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    return { grade: 'D', color: 'text-red-600', bg: 'bg-red-100' };
  };

  const gradeInfo = getGrade(scorePercentage);

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
          <h1 className="text-3xl font-bold text-gray-900">Exam Results</h1>
          <p className="text-gray-600 mt-1">
            {mode === 'mock' ? 'Mock Exam' : 'Practice Session'} Performance
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Score Card */}
        <div className="bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl shadow-xl p-8 text-white mb-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <div className="flex items-center gap-3 mb-2">
                <Award className="w-8 h-8" />
                <h2 className="text-2xl font-bold">Your Score</h2>
              </div>
              <div className="text-6xl font-bold mb-2">{scorePercentage}%</div>
              <div className={`inline-block px-4 py-2 rounded-lg ${gradeInfo.bg}`}>
                <span className={`text-2xl font-bold ${gradeInfo.color}`}>
                  Grade: {gradeInfo.grade}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-3xl font-bold">{results.correctAnswers}</div>
                <div className="text-sm opacity-90">Correct</div>
              </div>
              <div>
                <div className="text-3xl font-bold">{results.incorrectAnswers}</div>
                <div className="text-sm opacity-90">Incorrect</div>
              </div>
              <div>
                <div className="text-3xl font-bold">{results.unansweredQuestions}</div>
                <div className="text-sm opacity-90">Skipped</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Performance Breakdown */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-3 mb-6">
              <TrendingUp className="w-6 h-6 text-primary-600" />
              <h3 className="text-xl font-bold text-gray-900">
                Performance by SubCategory
              </h3>
            </div>
            <div className="space-y-4">
              {Object.entries(results.breakdown).map(([category, stats]) => {
                const percentage =
                  stats.total > 0 ? (stats.correct / stats.total) * 100 : 0;
                return (
                  <div key={category}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">
                        {category}
                      </span>
                      <span className="text-sm text-gray-600">
                        {stats.correct}/{stats.total} ({Math.round(percentage)}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary-600 h-2 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Summary Stats */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Summary</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                  <span className="font-medium text-gray-700">Correct Answers</span>
                </div>
                <span className="text-2xl font-bold text-green-600">
                  {results.correctAnswers}
                </span>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <XCircle className="w-6 h-6 text-red-600" />
                  <span className="font-medium text-gray-700">Incorrect Answers</span>
                </div>
                <span className="text-2xl font-bold text-red-600">
                  {results.incorrectAnswers}
                </span>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <span className="font-medium text-gray-700">Total Questions</span>
                <span className="text-2xl font-bold text-gray-900">
                  {results.totalQuestions}
                </span>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <span className="font-medium text-gray-700">Accuracy</span>
                <span className="text-2xl font-bold text-primary-600">
                  {scorePercentage}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => {
              setReviewMode(true);
              setCurrentReviewIndex(0);
            }}
            className="flex-1 btn-primary"
          >
            Review All Questions
          </button>
          <Link href={mode === 'mock' ? '/mock-exam' : '/practice'} className="flex-1">
            <button className="w-full btn-secondary">
              {mode === 'mock' ? 'Take Another Mock Exam' : 'Start New Practice'}
            </button>
          </Link>
          <Link href="/dashboard" className="flex-1">
            <button className="w-full btn-secondary">View Dashboard</button>
          </Link>
        </div>
      </main>
    </div>
  );
}
