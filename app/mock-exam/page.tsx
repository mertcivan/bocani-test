'use client';

import { useState, useEffect } from 'react';
import { Question } from '@/types';
import { fetchQuestions, getRandomQuestions } from '@/lib/csvParser';
import { ExamEngine } from '@/components/ExamEngine';
import { ArrowLeft, Clock, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import { Paywall, useFeatureAccess } from '@/components/Paywall';

const MOCK_EXAM_QUESTIONS = 10; // Reduced for testing - increase when more questions available
const MOCK_EXAM_DURATION = 15 * 60; // 15 minutes for testing

export default function MockExamPage() {
  const { user } = useAuth();
  const { hasAccess } = useFeatureAccess('mock_exam');

  const [questions, setQuestions] = useState<Question[]>([]);
  const [isStarted, setIsStarted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  
  useEffect(() => {
    if (hasAccess) {
      loadQuestions();
    }
  }, [hasAccess]);

  const loadQuestions = async () => {
    try {
      setIsLoading(true);
      const allQuestions = await fetchQuestions();

      // Use all questions for mock exam (for testing purposes)
      // In production, filter by: allQuestions.filter((q) => q.mode === 'Mock')
      const availableQuestions = allQuestions;

      if (availableQuestions.length < MOCK_EXAM_QUESTIONS) {
        setError(
          `Not enough questions available. Found ${availableQuestions.length}, need ${MOCK_EXAM_QUESTIONS}.`
        );
        setIsLoading(false);
        return;
      }

      const selectedQuestions = getRandomQuestions(availableQuestions, MOCK_EXAM_QUESTIONS);
      setQuestions(selectedQuestions);
      setIsLoading(false);
    } catch (err) {
      setError('Failed to load questions. Please check if questions.csv exists in the /data folder.');
      setIsLoading(false);
    }
  };

  const handleStartExam = () => {
    setShowConfirmation(false);
    setIsStarted(true);
  };

  // Show paywall if user doesn't have access
  if (!hasAccess) {
    return <Paywall feature="mock_exam" />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading mock exam...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md bg-white rounded-lg shadow-md p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">⚠️</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Error Loading Exam</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link href="/" className="btn-primary">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  if (isStarted && questions.length > 0) {
    return (
      <ExamEngine
        questions={questions}
        mode="mock"
        sessionId={`mock-${Date.now()}`}
        showSolutionsImmediately={false}
        timerDuration={MOCK_EXAM_DURATION}
      />
    );
  }

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
          <h1 className="text-3xl font-bold text-gray-900">Mock Exam</h1>
          <p className="text-gray-600 mt-1">
            Simulate real exam conditions with a timed test
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Ready to Take Your Mock Exam?
            </h2>
            <p className="text-gray-600">
              Test your knowledge under real exam conditions
            </p>
          </div>

          {/* Exam Details */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-3xl font-bold text-blue-600 mb-1">
                {MOCK_EXAM_QUESTIONS}
              </div>
              <div className="text-sm text-gray-600">Questions</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-3xl font-bold text-green-600 mb-1">{Math.floor(MOCK_EXAM_DURATION / 60)}</div>
              <div className="text-sm text-gray-600">Minutes</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-3xl font-bold text-purple-600 mb-1">Mixed</div>
              <div className="text-sm text-gray-600">Difficulty</div>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-r-lg mb-8">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-yellow-900 mb-2">
                  Important Instructions
                </h3>
                <ul className="space-y-1 text-sm text-yellow-800">
                  <li>• Once started, the timer cannot be paused</li>
                  <li>• You can navigate between questions freely</li>
                  <li>• Flag questions to review them later</li>
                  <li>• Solutions will be shown after submission</li>
                  <li>• The exam will auto-submit when time runs out</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="mb-8 space-y-3">
            <h3 className="font-semibold text-gray-900">What to Expect</h3>
            <div className="grid md:grid-cols-2 gap-3 text-sm text-gray-700">
              <div className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">✓</span>
                <span>Question navigator with status tracking</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">✓</span>
                <span>Flag difficult questions for review</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">✓</span>
                <span>Countdown timer with visual warnings</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">✓</span>
                <span>Detailed results and explanations</span>
              </div>
            </div>
          </div>

          {/* Start Button */}
          <button
            onClick={() => setShowConfirmation(true)}
            className="w-full btn-primary text-lg py-4"
          >
            Start Mock Exam
          </button>
        </div>
      </main>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Start Mock Exam?
            </h3>
            <p className="text-gray-600 mb-6">
              Once you start, the {Math.floor(MOCK_EXAM_DURATION / 60)}-minute timer will begin. Make sure you have a quiet
              environment and won't be interrupted.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmation(false)}
                className="flex-1 btn-secondary"
              >
                Cancel
              </button>
              <button onClick={handleStartExam} className="flex-1 btn-primary">
                Yes, Start Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
