import { Bell, TrendingUp, Shield, Crown } from 'lucide-react';

interface PremiumPageProps {
  onNavigate?: (page: string, plan?: 'monthly' | 'annual') => void;
}

export default function PremiumPage({ onNavigate }: PremiumPageProps = {}) {
  function handlePlanSelection(plan: 'monthly' | 'annual') {
    onNavigate?.('checkout', plan);
  }

  const features = [
    {
      icon: <Bell size={24} />,
      title: 'Instant Alerts',
      description: 'Get notified immediately whenever prices change by $1 or more',
    },
    {
      icon: <TrendingUp size={24} />,
      title: 'Price-Drop Predictions',
      description: 'Know the best time to buy with AI-powered forecasts',
    },
    {
      icon: <Shield size={24} />,
      title: 'Priority Support',
      description: 'Skip the line with faster customer service',
    },
  ];

  const comparisonFeatures = [
    { feature: 'Product Tracking', free: 'Unlimited', premium: 'Unlimited' },
    { feature: 'Price Alerts', free: '≥5% or ≥$10', premium: 'Any drop over $1' },
    { feature: 'AI Price Predictions', free: '✗', premium: '✓' },
    { feature: 'Daily Insights', free: 'Basic', premium: 'Advanced' },
    { feature: 'Price History', free: '30 days', premium: '1 year' },
    { feature: 'Support', free: 'Standard', premium: 'Priority' },
    { feature: 'Referral Rewards', free: '1x points', premium: '2x points' },
  ];

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-gray-700 text-white px-6 py-2 rounded-full font-bold text-sm mb-6 border border-gray-600">
            <Crown size={20} />
            PREMIUM
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
            Upgrade to Premium
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-8">
            Get unlimited tracking, instant alerts, and AI-powered insights
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <div className="text-center">
              <div className="text-5xl font-bold text-white mb-2">$9.99</div>
              <div className="text-gray-300">per month</div>
            </div>
            <div className="text-gray-400 text-2xl hidden sm:block">or</div>
            <div className="text-center">
              <div className="text-5xl font-bold text-white mb-2">$99.99</div>
              <div className="text-gray-300">per year <span className="text-gray-400 font-semibold">(Save 17%)</span></div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-gray-900 rounded-2xl shadow-md p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-gray-800"
            >
              <div className="inline-flex items-center justify-center w-12 h-12 bg-white text-black rounded-xl mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
              <p className="text-gray-300">{feature.description}</p>
            </div>
          ))}
        </div>

        <div className="bg-gray-900 rounded-2xl shadow-lg overflow-hidden mb-16 border border-gray-800">
          <div className="bg-gradient-to-r from-white to-gray-300 text-black p-6 text-center">
            <h2 className="text-3xl font-bold">Free vs Premium</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left p-4 font-semibold text-white">Feature</th>
                  <th className="text-center p-4 font-semibold text-gray-300">Free</th>
                  <th className="text-center p-4 font-semibold text-white">
                    Premium
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparisonFeatures.map((item, index) => (
                  <tr key={index} className="border-b border-gray-800 hover:bg-gray-800">
                    <td className="p-4 font-medium text-white">{item.feature}</td>
                    <td className="p-4 text-center text-gray-300">{item.free}</td>
                    <td className="p-4 text-center font-semibold text-white">{item.premium}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-gradient-to-r from-white to-gray-300 rounded-2xl p-8 md:p-12 text-center text-black mb-16 shadow-xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to upgrade?</h2>
          <p className="text-lg mb-8 opacity-90">
            Join thousands of savvy shoppers who never overpay
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => handlePlanSelection('monthly')}
              className="bg-black text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-800 transition-all duration-300 hover:shadow-xl"
            >
              Start Monthly Plan
            </button>
            <button
              onClick={() => handlePlanSelection('annual')}
              className="bg-black text-white border-2 border-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-900 transition-all duration-300 hover:shadow-xl"
            >
              Start Annual Plan
            </button>
          </div>
          <p className="text-sm mt-6 opacity-75">
            7-day money-back guarantee • Cancel anytime
          </p>
        </div>

        <div className="bg-gray-900 rounded-2xl shadow-md p-8 border border-gray-800">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Frequently Asked Questions</h2>
          <div className="space-y-4 max-w-3xl mx-auto">
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h3 className="text-lg font-bold text-white mb-2">What makes Premium worth it?</h3>
              <p className="text-gray-300">
                Premium gives you instant alerts for any price change over $1, AI-powered predictions to know the best time to buy, and priority customer support.
              </p>
            </div>
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h3 className="text-lg font-bold text-white mb-2">Is the free version really unlimited?</h3>
              <p className="text-gray-300">
                Yes! Track as many products as you want for free. Premium adds instant alerts (instead of daily summaries), AI predictions, and priority support.
              </p>
            </div>
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h3 className="text-lg font-bold text-white mb-2">Can I cancel anytime?</h3>
              <p className="text-gray-300">
                Absolutely. Cancel anytime with no questions asked. You'll keep access until the end of your billing period.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-gray-400">
            As an affiliate, we may earn a small commission from qualifying purchases at no extra cost to you.
          </p>
        </div>
      </div>
    </div>
  );
}
