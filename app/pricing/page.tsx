'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Check, Crown, Router } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';
export default function PricingPage() {
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const router = useRouter();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const feature = searchParams?.get('feature');

  const plans = {
    free: {
      name: 'Free',
      price: { monthly: 0, yearly: 0 },
      description: 'Perfect for getting started',
      features: [
        'Access to Easy & Medium questions',
        'Basic practice mode',
        'Limited to 10 questions per day',
        'Basic performance tracking',
        'Community support',
      ],
      limitations: [
        'No Hard questions',
        'No Mock exams',
        'No AI analytics',
      ],
    },
    premium: {
      name: 'Premium',
      price: { monthly: 29, yearly: 290 },
      description: 'Everything you need to succeed',
      features: [
        'Unlimited access to ALL questions',
        'All difficulty levels (Easy, Medium, Hard)',
        'Unlimited Mock exams with timer',
        'AI-powered performance analytics',
        'Detailed progress tracking',
        'Category-wise breakdown',
        'Weak area identification',
        'Priority email support',
        'Early access to new features',
        'Study streak rewards',
      ],
      popular: true,
    },
  };

  const savings = Math.round((plans.premium.price.monthly * 12 - plans.premium.price.yearly) / plans.premium.price.monthly * 12 * 100);

  const handleUpgrade = async (planType: 'free' | 'premium') => {
    if (planType === 'free') {
      router.push('/mock-exam');
      return;
    }

    // TODO: Integrate with Stripe or payment provider
    alert('Payment integration coming soon! This will redirect to secure checkout.');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-purple-50 to-white">
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
          <h1 className="text-3xl font-bold text-gray-900">Choose Your Plan</h1>
          <p className="text-gray-600 mt-1">Unlock your full potential with Premium</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Feature highlight if from paywall */}
        {feature && (
          <div className="mb-12 bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-yellow-500 p-6 rounded-r-lg">
            <p className="text-lg text-gray-800">
              <Crown className="inline w-5 h-5 text-yellow-600 mr-2" />
              Upgrade to <span className="font-bold">Premium</span> to unlock this feature!
            </p>
          </div>
        )}

        {/* Billing toggle */}
        <div className="flex justify-center mb-12">
          <div className="bg-white rounded-full p-1 shadow-md inline-flex">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-8 py-3 rounded-full font-semibold transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-8 py-3 rounded-full font-semibold transition-all relative ${
                billingCycle === 'yearly'
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Yearly
              <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                Save {savings}%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Free Plan */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-gray-200">
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{plans.free.name}</h3>
              <p className="text-gray-600">{plans.free.description}</p>
            </div>

            <div className="mb-8">
              <span className="text-5xl font-bold text-gray-900">$0</span>
              <span className="text-gray-600">/forever</span>
            </div>

            <button
              onClick={() => handleUpgrade('free')}
              className="w-full py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors mb-8"
            >
              {user ? 'Current Plan' : 'Get Started'}
            </button>

            <div className="space-y-4">
              <div>
                <p className="font-semibold text-gray-900 mb-3">Includes:</p>
                {plans.free.features.map((feature, i) => (
                  <div key={i} className="flex items-start gap-3 mb-2">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>

              <div>
                <p className="font-semibold text-gray-900 mb-3 mt-6">Limitations:</p>
                {plans.free.limitations.map((limit, i) => (
                  <div key={i} className="flex items-start gap-3 mb-2">
                    <span className="text-red-500">×</span>
                    <span className="text-gray-600">{limit}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Premium Plan */}
          <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl shadow-2xl p-8 relative transform scale-105">
            <div className="absolute top-0 right-8 transform -translate-y-1/2">
              <span className="bg-white text-orange-600 px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                MOST POPULAR
              </span>
            </div>

            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <Crown className="w-7 h-7 text-white" />
                <h3 className="text-2xl font-bold text-white">{plans.premium.name}</h3>
              </div>
              <p className="text-white opacity-90">{plans.premium.description}</p>
            </div>

            <div className="mb-8">
              <span className="text-5xl font-bold text-white">
                ${plans.premium.price[billingCycle]}
              </span>
              <span className="text-white opacity-90">
                /{billingCycle === 'monthly' ? 'month' : 'year'}
              </span>
              {billingCycle === 'yearly' && (
                <p className="text-sm text-white opacity-90 mt-2">
                  That's just ${Math.round(plans.premium.price.yearly / 12)}/month
                </p>
              )}
            </div>

            <button
              onClick={() => handleUpgrade('premium')}
              className="w-full py-3 bg-white text-orange-600 font-bold rounded-lg hover:bg-gray-50 transition-colors mb-8 shadow-lg"
            >
              {user?.subscription_type === 'premium' ? 'Current Plan' : 'Upgrade to Premium'}
            </button>

            <div className="space-y-3">
              {plans.premium.features.map((feature, i) => (
                <div key={i} className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-white flex-shrink-0 mt-0.5" />
                  <span className="text-white">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-20 max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            <div className="bg-white rounded-lg p-6 shadow-md">
              <h3 className="font-semibold text-gray-900 mb-2">Can I cancel anytime?</h3>
              <p className="text-gray-600">
                Yes, you can cancel your subscription at any time. You'll continue to have access until the end of your billing period.
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-md">
              <h3 className="font-semibold text-gray-900 mb-2">Do you offer refunds?</h3>
              <p className="text-gray-600">
                We offer a 7-day money-back guarantee. If you're not satisfied, contact us within 7 days for a full refund.
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-md">
              <h3 className="font-semibold text-gray-900 mb-2">What payment methods do you accept?</h3>
              <p className="text-gray-600">
                We accept all major credit cards, debit cards, and digital payment methods through our secure payment processor.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
