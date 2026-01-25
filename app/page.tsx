'use client';

import Link from 'next/link';
import { BookOpen, Clock, BarChart3, User } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Bocconi Prep Master</h1>
              <p className="text-gray-600 mt-1">Excel in your entrance exam preparation</p>
            </div>

            {/* Auth Buttons */}
            <div className="flex gap-3 items-center">
              {user ? (
                <>
                  {user.subscription_type === 'premium' && (
                    <span className="px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-sm font-semibold rounded-full">
                      Premium
                    </span>
                  )}
                  <Link href="/dashboard">
                    <button className="px-4 py-2 text-primary-600 hover:text-primary-700 font-medium">
                      Dashboard
                    </button>
                  </Link>
                  <Link href="/profile">
                    <button className="flex items-center gap-2 px-4 py-2 border-2 border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 font-medium">
                      <User className="w-4 h-4" />
                      Profile
                    </button>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/auth/login">
                    <button className="px-4 py-2 text-primary-600 hover:text-primary-700 font-medium">
                      Log In
                    </button>
                  </Link>
                  <Link href="/auth/signup">
                    <button className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium shadow-md">
                      Sign Up Free
                    </button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Master Your Exam Preparation
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            A comprehensive platform designed to help you succeed in the Bocconi entrance
            exam with practice questions and mock tests.
          </p>
        </div>

        {/* Mode Cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Practice Mode */}
          <Link
            href="/practice"
            className="group bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-all transform hover:-translate-y-1"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                <BookOpen className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Practice Mode</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Filter questions by category and difficulty. Get instant feedback with
              detailed solutions after each question.
            </p>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                Filter by subcategory and difficulty
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                Immediate solution explanations
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                Learn at your own pace
              </li>
            </ul>
            <div className="mt-6">
              <span className="inline-flex items-center text-blue-600 font-semibold group-hover:gap-2 transition-all">
                Start Practicing
                <span className="ml-2 group-hover:ml-0 transition-all">→</span>
              </span>
            </div>
          </Link>

          {/* Mock Exam Mode */}
          <Link
            href="/mock-exam"
            className="group bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-all transform hover:-translate-y-1"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                <Clock className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Mock Exam</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Take a full-length practice exam with 50 questions and a 75-minute timer to
              simulate real exam conditions.
            </p>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-green-600 rounded-full"></span>
                50 random questions
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-green-600 rounded-full"></span>
                75-minute countdown timer
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-green-600 rounded-full"></span>
                Detailed performance analysis
              </li>
            </ul>
            <div className="mt-6">
              <span className="inline-flex items-center text-green-600 font-semibold group-hover:gap-2 transition-all">
                Start Mock Exam
                <span className="ml-2 group-hover:ml-0 transition-all">→</span>
              </span>
            </div>
          </Link>
        </div>

        {/* Dashboard Link */}
        <div className="text-center">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-3 px-8 py-4 bg-white rounded-xl shadow-md hover:shadow-lg transition-all"
          >
            <BarChart3 className="w-6 h-6 text-purple-600" />
            <span className="font-semibold text-gray-900">View Your Dashboard</span>
          </Link>
        </div>

        {/* Features */}
        <div className="mt-16 grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-6 h-6 text-blue-600" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Comprehensive Questions</h4>
            <p className="text-sm text-gray-600">
              Extensive question bank covering all topics and difficulty levels
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-6 h-6 text-green-600" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Timed Practice</h4>
            <p className="text-sm text-gray-600">
              Simulate real exam conditions with our countdown timer
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="w-6 h-6 text-purple-600" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Performance Analytics</h4>
            <p className="text-sm text-gray-600">
              Track your progress with detailed statistics and insights
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
