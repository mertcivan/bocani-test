'use client';

import { useRouter } from 'next/navigation';
import { Lock, Crown, Zap } from 'lucide-react';
import { useAuth } from './AuthProvider';

interface PaywallProps {
  feature: 'hard_questions' | 'mock_exam' | 'ai_analytics' | 'unlimited_practice';
  children?: React.ReactNode;
}

const FEATURE_INFO = {
  hard_questions: {
    title: 'Hard Questions',
    description: 'Challenge yourself with advanced difficulty questions',
    icon: Zap,
  },
  mock_exam: {
    title: 'Mock Exams',
    description: 'Full-length timed practice exams with detailed analytics',
    icon: Lock,
  },
  ai_analytics: {
    title: 'AI Analytics',
    description: 'Get personalized insights and recommendations powered by AI',
    icon: Crown,
  },
  unlimited_practice: {
    title: 'Unlimited Practice',
    description: 'Practice as much as you want without any restrictions',
    icon: Zap,
  },
};

export function Paywall({ feature, children }: PaywallProps) {
  const { user } = useAuth();
  const router = useRouter();
  const info = FEATURE_INFO[feature];
  const Icon = info.icon;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
        {/* Icon */}
        <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <Icon className="w-10 h-10 text-white" />
        </div>

        {/* Title */}
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-2">
          Unlock {info.title}
        </h2>
        <p className="text-center text-gray-600 mb-6">{info.description}</p>

        {/* Benefits */}
        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg p-6 mb-6">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Crown className="w-5 h-5 text-yellow-600" />
            Premium Benefits
          </h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-yellow-600 rounded-full"></span>
              Access to all difficulty levels
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-yellow-600 rounded-full"></span>
              Unlimited mock exams
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-yellow-600 rounded-full"></span>
              AI-powered performance analytics
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-yellow-600 rounded-full"></span>
              Priority support
            </li>
          </ul>
        </div>

        {/* CTA Buttons */}
        <div className="space-y-3">
          {user ? (
            <>
              <button
                onClick={() => router.push('/pricing')}
                className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-semibold py-4 rounded-lg hover:from-yellow-500 hover:to-orange-600 transition-all shadow-lg"
              >
                Upgrade to Premium
              </button>
              <button
                onClick={() => router.back()}
                className="w-full border-2 border-gray-300 text-gray-700 font-semibold py-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Go Back
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => router.push('/auth/signup')}
                className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-semibold py-4 rounded-lg hover:from-yellow-500 hover:to-orange-600 transition-all shadow-lg"
              >
                Sign Up for Premium
              </button>
              <button
                onClick={() => router.push('/auth/login')}
                className="w-full border-2 border-gray-300 text-gray-700 font-semibold py-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Log In
              </button>
            </>
          )}
        </div>

        {/* Extra info */}
        <p className="text-center text-xs text-gray-500 mt-6">
          Join thousands of students succeeding with Premium
        </p>
      </div>
    </div>
  );
}

// Hook to check feature access
export function useFeatureAccess(feature: PaywallProps['feature']) {
  const { user } = useAuth();

  const hasAccess = () => {
    // Allow mock_exam access for development/testing
    if (feature === 'mock_exam') return true;

    if (!user) return false;
    if (user.subscription_type === 'premium') return true;

    // Free tier limitations
    if (feature === 'hard_questions' || feature === 'ai_analytics') {
      return false;
    }

    return true;
  };

  return {
    hasAccess: hasAccess(),
    isPremium: user?.subscription_type === 'premium',
    isAuthenticated: !!user,
  };
}
