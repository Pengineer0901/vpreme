import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface HelpPageProps {
  onNavigate?: (page: string) => void;
}

export default function HelpPage({ onNavigate }: HelpPageProps = {}) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: 'How does product tracking work?',
      answer: 'Simply paste an Amazon product link or search for a product. VPREME will automatically track the price and notify you of any significant changes. We update prices every 10 minutes using Amazon\'s official data.',
    },
    {
      question: 'How often are prices updated?',
      answer: 'Prices are updated every 10 minutes to ensure you have the most current information. We pull data directly from Amazon to provide accurate, real-time pricing.',
    },
    {
      question: 'Is VPREME free?',
      answer: 'Yes! VPREME offers a free tier that allows you to track products and receive alerts for significant price drops (5% or more, or $10+). Premium features include more frequent alerts, AI-powered predictions, and unlimited tracking.',
    },
    {
      question: 'What is Premium?',
      answer: 'Premium unlocks advanced features including price-drop predictions, instant alerts for any price change over $1, unlimited product tracking, and priority customer support. It\'s perfect for serious deal hunters.',
    },
    {
      question: 'How do I cancel tracking?',
      answer: 'Go to your Dashboard, find the product you want to stop tracking, and click the "Untrack" button. The product will be immediately removed from your tracked list.',
    },
    {
      question: 'Are the prices accurate?',
      answer: 'Yes! All price data comes directly from Amazon\'s official API. We display current prices, historical data, and any active discounts as reported by Amazon.',
    },
    {
      question: 'How do alerts work?',
      answer: 'For free users, we send alerts when a product drops 5% or more, or by $10 or more. Premium users get alerts for any price drop over $1. You\'ll see alerts in your Alerts page and can optionally receive email notifications.',
    },
  ];

  function toggleFAQ(index: number) {
    setOpenIndex(openIndex === index ? null : index);
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">Help & FAQ</h1>
          <p className="text-xl text-gray-300">
            Find answers to common questions
          </p>
        </div>

        <div className="space-y-4 mb-8">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-gray-900 rounded-2xl shadow-sm overflow-hidden transition-all duration-300 border border-gray-800"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-gray-800 transition-colors"
              >
                <span className="text-lg font-semibold text-white pr-4">
                  {faq.question}
                </span>
                {openIndex === index ? (
                  <ChevronUp size={24} className="flex-shrink-0 text-white" />
                ) : (
                  <ChevronDown size={24} className="flex-shrink-0 text-white" />
                )}
              </button>
              {openIndex === index && (
                <div className="px-6 pb-5 text-gray-300 animate-fadeIn">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="bg-gray-900 rounded-2xl shadow-sm p-8 text-center mb-8 border border-gray-800">
          <h2 className="text-2xl font-bold text-white mb-4">Need more help?</h2>
          <p className="text-gray-300 mb-6">
            Can't find what you're looking for? Our support team is here to help.
          </p>
          <button
            onClick={() => onNavigate?.('contact')}
            className="bg-white text-black px-8 py-3 rounded-xl font-bold hover:bg-gray-100 transition-colors"
          >
            Contact Us
          </button>
        </div>

        <button
          onClick={() => onNavigate?.('premium')}
          className="w-full bg-gradient-to-r from-white to-gray-300 rounded-2xl p-8 text-black text-center mb-8 hover:from-gray-100 hover:to-gray-400 transition-all duration-300 cursor-pointer"
        >
          <h3 className="text-2xl font-bold mb-4">Want AI-guided tips for all products?</h3>
          <p className="text-lg mb-4">
            Premium users get advanced insights, predictions, and personalized recommendations.
          </p>
          <div className="bg-black text-white px-8 py-3 rounded-xl font-bold inline-block">
            Try Premium
          </div>
        </button>

        <div className="bg-gray-900 rounded-2xl shadow-sm p-6 text-center border border-gray-800">
          <p className="text-sm text-gray-400">
            As an affiliate, we may earn a small commission from qualifying purchases at no extra cost to you.
          </p>
        </div>
      </div>
    </div>
  );
}
