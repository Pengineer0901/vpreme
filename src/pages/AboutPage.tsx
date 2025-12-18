import { Search, Bell, DollarSign } from 'lucide-react';

interface AboutPageProps {
  onNavigate?: (page: string) => void;
}

export default function AboutPage({ onNavigate }: AboutPageProps = {}) {
  const steps = [
    {
      icon: <Search size={48} />,
      title: 'Track',
      description: 'Add any Amazon product to start tracking its price history',
    },
    {
      icon: <Bell size={48} />,
      title: 'Insights',
      description: 'Get real-time insights and alerts when prices drop',
    },
    {
      icon: <DollarSign size={48} />,
      title: 'Save Money',
      description: 'Never overpay again with smart price tracking',
    },
  ];

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-white mb-4">About VPREME</h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Smarter Amazon shopping — track, get insights, never overpay.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {steps.map((step, index) => (
            <div
              key={index}
              className="bg-gray-900 rounded-2xl shadow-md p-8 text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-gray-800"
            >
              <div className="inline-flex items-center justify-center w-20 h-20 bg-white text-black rounded-2xl mb-6">
                {step.icon}
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">{step.title}</h3>
              <p className="text-gray-300">{step.description}</p>
            </div>
          ))}
        </div>

        <div className="bg-gray-900 rounded-2xl shadow-md p-8 mb-8 border border-gray-800">
          <h2 className="text-2xl font-bold text-white mb-4 text-center">How It Works</h2>
          <div className="space-y-4 max-w-2xl mx-auto">
            <p className="text-gray-300">
              VPREME monitors Amazon prices continuously, providing you with actionable insights based on real-time data.
              Our platform helps you make informed purchasing decisions by tracking price history and alerting you to significant drops.
            </p>
            <p className="text-gray-300">
              Simply add products you're interested in, and we'll do the rest. You'll receive notifications when prices drop
              significantly, ensuring you never miss a great deal.
            </p>
            <p className="text-sm text-gray-400 mt-4 pt-4 border-t border-gray-700">
              We use Amazon's publicly available data and official APIs where possible to ensure accurate pricing.
              All product data comes from Amazon via our affiliate partnership. We display current prices, images, and product details as provided through Amazon Associates.
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigate?.('premium')}
          className="w-full bg-gradient-to-r from-white to-gray-300 rounded-2xl p-8 text-black text-center mb-8 hover:from-gray-100 hover:to-gray-400 transition-all duration-300 cursor-pointer"
        >
          <h3 className="text-2xl font-bold mb-4">See what Premium users get →</h3>
          <ul className="space-y-2 max-w-xl mx-auto text-left">
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-black rounded-full"></span>
              Instant Alerts: Get notified immediately whenever prices change by $1 or more
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-black rounded-full"></span>
              Price-Drop Predictions: Know the best time to buy with AI-powered forecasts
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-black rounded-full"></span>
              Priority Support: Skip the line with faster customer service
            </li>
          </ul>
        </button>

        <div className="bg-gray-900 rounded-2xl p-6 text-center border border-gray-800">
          <p className="text-sm text-gray-400">
            As an affiliate, we may earn a small commission from qualifying purchases at no extra cost to you.
          </p>
        </div>
      </div>
    </div>
  );
}
