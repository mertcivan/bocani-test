'use client';

import { useState, useEffect } from 'react';
import { Question, Difficulty } from '@/types';
import { fetchQuestions, filterQuestions, getUniqueValues, getRandomQuestions, getQuestionsByIds } from '@/lib/csvParser';
import { getUserWrongAnswerIds } from '@/lib/supabase/stats';
import { ExamEngine } from '@/components/ExamEngine';
import { ArrowLeft, Filter, Lock, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';

export default function PracticePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | ''>('');
  const [isStarted, setIsStarted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [subCategories, setSubCategories] = useState<string[]>([]);
  const [wrongAnswerIds, setWrongAnswerIds] = useState<string[]>([]);

  useEffect(() => {
    loadQuestions();
  }, []);

  useEffect(() => {
    if (user) {
      loadWrongAnswers();
    }
  }, [user]);

  const loadWrongAnswers = async () => {
    if (!user) return;
    try {
      const ids = await getUserWrongAnswerIds(user.id);
      setWrongAnswerIds(ids);
    } catch (err) {
      console.error('Failed to load wrong answers:', err);
    }
  };

  const loadQuestions = async () => {
    try {
      setIsLoading(true);
      const questions = await fetchQuestions();
      const practiceQuestions = questions.filter((q) => q.mode === 'Practice');
      setAllQuestions(practiceQuestions);

      // Get unique subcategories
      const uniqueSubCategories = getUniqueValues<string>(
        practiceQuestions,
        'subCategory'
      );
      setSubCategories(uniqueSubCategories);

      setIsLoading(false);
    } catch (err) {
      setError('Failed to load questions. Please check if questions.csv exists in the /data folder.');
      setIsLoading(false);
    }
  };

  const handleStartPractice = () => {
    // Check if trying to access hard questions without premium
    if (selectedDifficulty === 'Hard' && (!user || user.subscription_type !== 'free')) {
      router.push('/pricing?feature=hard_questions');
      return;
    }

    const filtered = filterQuestions(allQuestions, {
      subCategory: selectedSubCategory || undefined,
      difficulty: selectedDifficulty || undefined,
      mode: 'Practice',
    });

    if (filtered.length === 0) {
      alert('No questions found with the selected filters. Please adjust your selection.');
      return;
    }

    setFilteredQuestions(filtered);
    setIsStarted(true);
  };

  const handleMixedTest = () => {
    let eligibleQuestions = allQuestions;

    if (!user || user.subscription_type !== 'premium') {
      eligibleQuestions = allQuestions.filter(
        (q) => q.difficulty === 'Easy' || q.difficulty === 'Medium'
      );
    }

    if (eligibleQuestions.length === 0) {
      alert('No questions available for mixed test.');
      return;
    }

    const mixedQuestions = getRandomQuestions(eligibleQuestions, 10);
    setFilteredQuestions(mixedQuestions);
    setIsStarted(true);
  };

  const getWeakSubCategories = (): string[] => {
    if (wrongAnswerIds.length === 0) return [];
    const wrongQuestions = getQuestionsByIds(allQuestions, wrongAnswerIds);
    const subCats = new Set(wrongQuestions.map((q) => q.subCategory));
    return Array.from(subCats);
  };

  const handleWrongAnswerReview = () => {
    if (wrongAnswerIds.length === 0) return;

    // Get subcategories from wrong answers
    const weakSubCats = getWeakSubCategories();

    if (weakSubCats.length === 0) {
      alert('No weak subcategories found.');
      return;
    }

    // Get questions from same subcategories but exclude the ones already answered wrong
    const wrongIdSet = new Set(wrongAnswerIds);
    const eligibleQuestions = allQuestions.filter(
      (q) => weakSubCats.includes(q.subCategory) && !wrongIdSet.has(q.id)
    );

    if (eligibleQuestions.length === 0) {
      // Fallback: if no new questions available, use the wrong ones
      const wrongQuestions = getQuestionsByIds(allQuestions, wrongAnswerIds);
      setFilteredQuestions(getRandomQuestions(wrongQuestions, 10));
      setIsStarted(true);
      return;
    }

    const reviewQuestions = getRandomQuestions(eligibleQuestions, 10);
    setFilteredQuestions(reviewQuestions);
    setIsStarted(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading questions...</p>
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
          <h2 className="text-xl font-bold text-gray-900 mb-2">Error Loading Questions</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link href="/" className="btn-primary">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  if (isStarted && filteredQuestions.length > 0) {
    return (
      <ExamEngine
        questions={filteredQuestions}
        mode="practice"
        sessionId={`practice-${Date.now()}`}
        showSolutionsImmediately={true}
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
          <h1 className="text-3xl font-bold text-gray-900">Practice Mode</h1>
          <p className="text-gray-600 mt-1">
            Filter questions and practice with immediate feedback
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Wrong Answer Review Banner */}
        {user && wrongAnswerIds.length > 0 && (
          <div className="mb-6 bg-amber-50 border border-amber-200 rounded-lg p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-amber-900">
                    You have {wrongAnswerIds.length} question{wrongAnswerIds.length !== 1 ? 's' : ''} you got wrong.
                  </p>
                  <p className="text-sm text-amber-700">
                    Review your mistakes to improve your score!
                  </p>
                </div>
              </div>
              <button
                onClick={handleWrongAnswerReview}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg transition-colors whitespace-nowrap ml-4"
              >
                Start Review Test
              </button>
            </div>

            {/* Weak SubCategories */}
            {getWeakSubCategories().length > 0 && (
              <div className="mt-4 pt-4 border-t border-amber-200">
                <p className="text-sm font-medium text-amber-800 mb-2">Your weak areas:</p>
                <div className="flex flex-wrap gap-2">
                  {getWeakSubCategories().map((cat) => (
                    <span
                      key={cat}
                      className="px-3 py-1 bg-amber-100 text-amber-800 text-sm rounded-full border border-amber-300"
                    >
                      {cat}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-amber-600 mt-2">
                  The review test will generate new questions from these subcategories.
                </p>
              </div>
            )}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex items-center gap-3 mb-6">
            <Filter className="w-6 h-6 text-primary-600" />
            <h2 className="text-2xl font-bold text-gray-900">Select Your Filters</h2>
          </div>

          <div className="space-y-6">
            {/* SubCategory Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                SubCategory
              </label>
              <select
                value={selectedSubCategory}
                onChange={(e) => setSelectedSubCategory(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none transition-colors"
              >
                <option value="">All SubCategories</option>
                {subCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Difficulty Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Difficulty Level
              </label>
              <div className="grid grid-cols-4 gap-3">
                <button
                  onClick={() => setSelectedDifficulty('')}
                  className={`px-4 py-3 rounded-lg font-medium border-2 transition-all ${
                    selectedDifficulty === ''
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-300 text-gray-700 hover:border-gray-400'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setSelectedDifficulty('Easy')}
                  className={`px-4 py-3 rounded-lg font-medium border-2 transition-all ${
                    selectedDifficulty === 'Easy'
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-300 text-gray-700 hover:border-gray-400'
                  }`}
                >
                  Easy
                </button>
                <button
                  onClick={() => setSelectedDifficulty('Medium')}
                  className={`px-4 py-3 rounded-lg font-medium border-2 transition-all ${
                    selectedDifficulty === 'Medium'
                      ? 'border-yellow-500 bg-yellow-50 text-yellow-700'
                      : 'border-gray-300 text-gray-700 hover:border-gray-400'
                  }`}
                >
                  Medium
                </button>
                <button
                  onClick={() => {
                    if (!user || user.subscription_type !== 'premium') {
                      router.push('/pricing?feature=hard_questions');
                    } else {
                      setSelectedDifficulty('Hard');
                    }
                  }}
                  className={`px-4 py-3 rounded-lg font-medium border-2 transition-all relative ${
                    selectedDifficulty === 'Hard'
                      ? 'border-red-500 bg-red-50 text-red-700'
                      : 'border-gray-300 text-gray-700 hover:border-gray-400'
                  }`}
                >
                  Hard
                  {(!user || user.subscription_type !== 'premium') && (
                    <Lock className="w-4 h-4 inline-block ml-1" />
                  )}
                </button>
              </div>
            </div>

            {/* Question Count Preview */}
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
              <p className="text-blue-800">
                <span className="font-semibold">
                  {
                    filterQuestions(allQuestions, {
                      subCategory: selectedSubCategory || undefined,
                      difficulty: selectedDifficulty || undefined,
                      mode: 'Practice',
                    }).length
                  }
                </span>{' '}
                questions available with current filters
              </p>
            </div>

            {/* Start Button */}
            <button onClick={handleStartPractice} className="w-full btn-primary">
              Start Practice Session
            </button>

            {/* Mixed Test Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">or try</span>
              </div>
            </div>

            {/* Mixed Test Button */}
            <button
              onClick={handleMixedTest}
              className="w-full px-6 py-3 rounded-lg font-medium text-white bg-purple-600 hover:bg-purple-700 transition-colors"
            >
              Mixed Test (10 Random Questions)
            </button>
            <p className="text-sm text-gray-500 text-center -mt-2">
              Random mix from all subcategories
              {(!user || user.subscription_type !== 'premium') && ' (Easy + Medium only)'}
            </p>
          </div>
        </div>

        {/* Info Card */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-200">
          <h3 className="font-semibold text-gray-900 mb-3">Practice Mode Features</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">✓</span>
              <span>Immediate feedback with detailed solutions after each answer</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">✓</span>
              <span>No time limit - learn at your own pace</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">✓</span>
              <span>Filter questions to focus on specific topics</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">✓</span>
              <span>Review your performance at the end</span>
            </li>
          </ul>
        </div>
      </main>
    </div>
  );
}
