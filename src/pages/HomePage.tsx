import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Search, Bell, DollarSign, Crown, TrendingUp, Shield, ChevronDown, ChevronUp, Send, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import RevealOverlay from '../components/RevealOverlay';
import { TrackedProduct } from '../types/product';
import { productsAPI } from '../lib/api';

interface HomePageProps {
  onNavigate: (page: string, plan?: 'monthly' | 'annual') => void;
}

export default function HomePage({ onNavigate }: HomePageProps) {
  const [featuredProducts, setFeaturedProducts] = useState<TrackedProduct[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<TrackedProduct | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [searchInput, setSearchInput] = useState('');
  const [trackedProductIds, setTrackedProductIds] = useState<Set<string>>(new Set());
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [contactForm, setContactForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [contactLoading, setContactLoading] = useState(false);
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [contactError, setContactError] = useState('');

  useEffect(() => {
    loadFeaturedProducts();
    loadTrackedProducts();
  }, []);

  function handleTouchStart(e: React.TouchEvent) {
    setTouchStart(e.targetTouches[0].clientX);
  }

  function handleTouchMove(e: React.TouchEvent) {
    setTouchEnd(e.targetTouches[0].clientX);
  }

  function handleTouchEnd() {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && currentSlide < featuredProducts.length - 1) {
      nextSlide();
    }
    if (isRightSwipe && currentSlide > 0) {
      prevSlide();
    }

    setTouchStart(0);
    setTouchEnd(0);
  }

  async function loadFeaturedProducts() {
    try {
      const response = await productsAPI.getFeatured();
      if (response.success && response.data.products) {
        setFeaturedProducts(response.data.products.map((p: any) => ({
          id: p._id,
          ...p
        })));
      }
    } catch (error) {
      console.error('Failed to load featured products:', error);
    }
  }

  async function loadTrackedProducts() {
    try {
      const response = await productsAPI.getTracked();
      if (response.success && response.data.products) {
        const ids = new Set(response.data.products.map((p: any) => p._id));
        setTrackedProductIds(ids);
      }
    } catch (error) {
      console.error('Failed to load tracked products:', error);
    }
  }

  function nextSlide() {
    setCurrentSlide((prev) => Math.min(prev + 1, featuredProducts.length - 1));
  }

  function prevSlide() {
    setCurrentSlide((prev) => Math.max(prev - 1, 0));
  }

  async function handleTrackFromUrl() {
    const token = localStorage.getItem('vpreme_token');

    if (!token) {
      onNavigate('login');
      return;
    }

    if (!searchInput.trim()) {
      setError('Please enter an Amazon product URL');
      return;
    }

    if (!searchInput.includes('amazon.com')) {
      setError('Please enter a valid Amazon.com URL');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await productsAPI.simulateTrackFromUrl(searchInput);

      if (!response.success) {
        const errorMsg = response.message || response.error || 'Failed to extract product information';
        const hint = response.hint ? ` ${response.hint}` : '';
        setError(errorMsg + hint);
        return;
      }

      setSearchInput('');
      onNavigate('dashboard');
    } catch (error: any) {
      setError(error.message || 'Failed to track product');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleContactSubmit(e: React.FormEvent) {
    e.preventDefault();
    setContactLoading(true);
    setContactError('');
    setContactSubmitted(false);

    try {
      const apiUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/contact`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...contactForm, userId: 'Guest' }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send message');
      }

      setContactSubmitted(true);
      setContactForm({ name: '', email: '', subject: '', message: '' });

      setTimeout(() => setContactSubmitted(false), 5000);
    } catch (err: any) {
      setContactError(err.message || 'Failed to send message. Please try again.');
    } finally {
      setContactLoading(false);
    }
  }

  const faqs = [
    { question: 'How does product tracking work?', answer: 'Simply paste an Amazon product link or search for a product. VPREME will automatically track the price and notify you of any significant changes. We update prices every 10 minutes using Amazon\'s official data.' },
    { question: 'How often are prices updated?', answer: 'Prices are updated every 10 minutes to ensure you have the most current information. We pull data directly from Amazon to provide accurate, real-time pricing.' },
    { question: 'Is VPREME free?', answer: 'Yes! VPREME offers a free tier that allows you to track products and receive alerts for significant price drops (5% or more, or $10+). Premium features include more frequent alerts, AI-powered predictions, and unlimited tracking.' },
    { question: 'What is Premium?', answer: 'Premium unlocks advanced features including price-drop predictions, instant alerts for any price change over $1, unlimited product tracking, and priority customer support. It\'s perfect for serious deal hunters.' },
    { question: 'How do I cancel tracking?', answer: 'Go to your Dashboard, find the product you want to stop tracking, and click the "Untrack" button. The product will be immediately removed from your tracked list.' },
    { question: 'Are the prices accurate?', answer: 'Yes! All price data comes directly from Amazon\'s official API. We display current prices, historical data, and any active discounts as reported by Amazon.' },
  ];

  const features = [
    { icon: <Search size={48} />, title: 'Track', description: 'Add any Amazon product to start tracking its price history' },
    { icon: <Bell size={48} />, title: 'Insights', description: 'Get real-time insights and alerts when prices drop' },
    { icon: <DollarSign size={48} />, title: 'Save Money', description: 'Never overpay again with smart price tracking' },
  ];

  const premiumFeatures = [
    { icon: <Bell size={24} />, title: 'Instant Alerts', description: 'Get notified immediately whenever prices change by $1 or more' },
    { icon: <TrendingUp size={24} />, title: 'Price-Drop Predictions', description: 'Know the best time to buy with AI-powered forecasts' },
    { icon: <Shield size={24} />, title: 'Priority Support', description: 'Skip the line with faster customer service' },
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      <section id="home" className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Track Amazon Prices Like a Pro
          </h1>
          <p className="text-xl text-gray-300 mb-12">
            Get instant alerts when prices drop. Never miss a deal again.
          </p>

          <div className="bg-gray-900 rounded-2xl p-8 shadow-2xl border border-gray-800">
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Paste Amazon product URL here..."
                className="flex-1 px-6 py-4 rounded-xl border-2 border-gray-700 bg-gray-800 text-white placeholder-gray-500 focus:border-white focus:outline-none transition-colors text-lg"
                disabled={isLoading}
              />
              <button
                onClick={handleTrackFromUrl}
                disabled={isLoading}
                className="px-8 py-4 bg-white text-black rounded-xl font-bold text-lg hover:bg-gray-100 transition-all duration-300 hover:shadow-xl disabled:bg-gray-600 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {isLoading ? 'Tracking...' : 'Track Price'}
              </button>
            </div>

            {error && (
              <div className="mt-4 p-4 bg-red-900/30 border border-red-700 text-red-200 rounded-xl text-left">
                {error}
              </div>
            )}

            <p className="text-sm text-gray-400 mt-4">
              Paste any Amazon product URL to start tracking its price
            </p>
          </div>
        </div>
      </section>

      {featuredProducts.length > 0 && (
        <section className="py-16 px-4 bg-gray-950">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-center">Featured Deals</h2>

            <div className="relative">
              <div
                className="overflow-hidden"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                <div
                  className="flex transition-transform duration-500 ease-out"
                  style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                >
                  {featuredProducts.map((product) => (
                    <div key={product.id} className="w-full flex-shrink-0 px-4">
                      <div className="max-w-2xl mx-auto">
                        <ProductCard
                          product={product}
                          onClick={() => setSelectedProduct(product)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {featuredProducts.length > 1 && (
                <>
                  <button
                    onClick={prevSlide}
                    disabled={currentSlide === 0}
                    className="absolute left-0 top-1/2 -translate-y-1/2 bg-white text-black p-3 rounded-full shadow-lg hover:bg-gray-100 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <button
                    onClick={nextSlide}
                    disabled={currentSlide === featuredProducts.length - 1}
                    className="absolute right-0 top-1/2 -translate-y-1/2 bg-white text-black p-3 rounded-full shadow-lg hover:bg-gray-100 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronRight size={24} />
                  </button>

                  <div className="flex justify-center gap-2 mt-6">
                    {featuredProducts.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentSlide(index)}
                        className={`w-2 h-2 rounded-full transition-all ${
                          currentSlide === index ? 'bg-white w-8' : 'bg-gray-600'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </section>
      )}

      <section id="about" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-4">About VPREME</h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Smarter Amazon shopping — track, get insights, never overpay.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-gray-900 rounded-2xl shadow-md p-8 text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-gray-800"
              >
                <div className="inline-flex items-center justify-center w-20 h-20 bg-white text-black rounded-2xl mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                <p className="text-gray-300">{feature.description}</p>
              </div>
            ))}
          </div>

          <div className="bg-gray-900 rounded-2xl shadow-md p-8 border border-gray-800">
            <h3 className="text-2xl font-bold mb-4 text-center">How It Works</h3>
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
                All product data comes from Amazon via our affiliate partnership.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="premium" className="py-20 px-4 bg-gray-950">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-gray-700 text-white px-6 py-2 rounded-full font-bold text-sm mb-6 border border-gray-600">
              <Crown size={20} />
              PREMIUM
            </div>
            <h2 className="text-5xl md:text-6xl font-bold mb-4">
              Upgrade to Premium
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-8">
              Get unlimited tracking, instant alerts, and AI-powered insights
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <div className="text-center">
                <div className="text-5xl font-bold mb-2">$9.99</div>
                <div className="text-gray-300">per month</div>
              </div>
              <div className="text-gray-400 text-2xl hidden sm:block">or</div>
              <div className="text-center">
                <div className="text-5xl font-bold mb-2">$99.99</div>
                <div className="text-gray-300">per year <span className="text-gray-400 font-semibold">(Save 17%)</span></div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {premiumFeatures.map((feature, index) => (
              <div
                key={index}
                className="bg-gray-900 rounded-2xl shadow-md p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-gray-800"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 bg-white text-black rounded-xl mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-gray-300">{feature.description}</p>
              </div>
            ))}
          </div>

          <div className="bg-gray-900 rounded-2xl shadow-lg overflow-hidden mb-12 border border-gray-800">
            <div className="bg-gradient-to-r from-white to-gray-300 text-black p-6 text-center">
              <h3 className="text-3xl font-bold">Free vs Premium</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-700">
                    <th className="text-left p-4 font-semibold text-white">Feature</th>
                    <th className="text-center p-4 font-semibold text-gray-300">Free</th>
                    <th className="text-center p-4 font-semibold text-white">Premium</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-800 hover:bg-gray-800">
                    <td className="p-4 font-medium text-white">Product Tracking</td>
                    <td className="p-4 text-center text-gray-300">Unlimited</td>
                    <td className="p-4 text-center text-white font-semibold">Unlimited</td>
                  </tr>
                  <tr className="border-b border-gray-800 hover:bg-gray-800">
                    <td className="p-4 font-medium text-white">Price Alerts</td>
                    <td className="p-4 text-center text-gray-300">≥5% or ≥$10</td>
                    <td className="p-4 text-center text-white font-semibold">Any drop over $1</td>
                  </tr>
                  <tr className="border-b border-gray-800 hover:bg-gray-800">
                    <td className="p-4 font-medium text-white">AI Price Predictions</td>
                    <td className="p-4 text-center text-gray-300">✗</td>
                    <td className="p-4 text-center text-white font-semibold">✓</td>
                  </tr>
                  <tr className="border-b border-gray-800 hover:bg-gray-800">
                    <td className="p-4 font-medium text-white">Daily Insights</td>
                    <td className="p-4 text-center text-gray-300">Basic</td>
                    <td className="p-4 text-center text-white font-semibold">Advanced</td>
                  </tr>
                  <tr className="border-b border-gray-800 hover:bg-gray-800">
                    <td className="p-4 font-medium text-white">Price History</td>
                    <td className="p-4 text-center text-gray-300">30 days</td>
                    <td className="p-4 text-center text-white font-semibold">1 year</td>
                  </tr>
                  <tr className="border-b border-gray-800 hover:bg-gray-800">
                    <td className="p-4 font-medium text-white">Support</td>
                    <td className="p-4 text-center text-gray-300">Standard</td>
                    <td className="p-4 text-center text-white font-semibold">Priority</td>
                  </tr>
                  <tr className="border-b border-gray-800 hover:bg-gray-800">
                    <td className="p-4 font-medium text-white">Referral Rewards</td>
                    <td className="p-4 text-center text-gray-300">1x points</td>
                    <td className="p-4 text-center text-white font-semibold">2x points</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => onNavigate('checkout', 'monthly')}
              className="px-8 py-4 bg-white text-black rounded-xl font-bold text-lg hover:bg-gray-100 transition-all duration-300 hover:shadow-xl"
            >
              Get Monthly Plan
            </button>
            <button
              onClick={() => onNavigate('checkout', 'annual')}
              className="px-8 py-4 bg-gradient-to-r from-yellow-600 to-yellow-500 text-white rounded-xl font-bold text-lg hover:from-yellow-500 hover:to-yellow-400 transition-all duration-300 hover:shadow-xl"
            >
              Get Annual Plan (Save 17%)
            </button>
          </div>
        </div>
      </section>

      <section id="help" className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-5xl font-bold mb-4">Help & FAQ</h2>
            <p className="text-xl text-gray-300">
              Find answers to common questions
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-gray-900 rounded-2xl shadow-sm overflow-hidden transition-all duration-300 border border-gray-800"
              >
                <button
                  onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-gray-800 transition-colors"
                >
                  <span className="text-lg font-semibold pr-4">
                    {faq.question}
                  </span>
                  {openFaqIndex === index ? (
                    <ChevronUp size={24} className="flex-shrink-0" />
                  ) : (
                    <ChevronDown size={24} className="flex-shrink-0" />
                  )}
                </button>
                {openFaqIndex === index && (
                  <div className="px-6 pb-5 text-gray-300">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="py-20 px-4 bg-gray-950">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-5xl font-bold mb-4">Contact Us</h2>
            <p className="text-xl text-gray-300">
              Have a question? We'd love to hear from you.
            </p>
            <p className="text-sm text-gray-400 mt-2">
              Send us an email at <a href="mailto:helper@vpreme.com" className="text-white font-semibold hover:underline">helper@vpreme.com</a>
            </p>
          </div>

          <div className="bg-gray-900 rounded-2xl shadow-md p-8 border border-gray-800">
            {contactSubmitted ? (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-900/30 text-green-400 rounded-full mb-4">
                  <CheckCircle size={32} />
                </div>
                <h3 className="text-2xl font-bold mb-2">Message Sent!</h3>
                <p className="text-gray-300 mb-4">
                  Thank you for contacting us. We'll get back to you as soon as possible.
                </p>
                <button
                  onClick={() => setContactSubmitted(false)}
                  className="text-white hover:underline"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-6">
                {contactError && (
                  <div className="bg-red-900/30 border border-red-700 text-red-200 px-4 py-3 rounded-xl flex items-start gap-2">
                    <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{contactError}</span>
                  </div>
                )}

                <div>
                  <label htmlFor="name" className="block text-sm font-medium mb-2">Name</label>
                  <input
                    type="text"
                    id="name"
                    value={contactForm.name}
                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                    required
                    disabled={contactLoading}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-700 bg-gray-800 text-white placeholder-gray-500 focus:border-white focus:outline-none transition-colors"
                    placeholder="Your name"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-2">Email</label>
                  <input
                    type="email"
                    id="email"
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    required
                    disabled={contactLoading}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-700 bg-gray-800 text-white placeholder-gray-500 focus:border-white focus:outline-none transition-colors"
                    placeholder="you@example.com"
                  />
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium mb-2">Subject</label>
                  <input
                    type="text"
                    id="subject"
                    value={contactForm.subject}
                    onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                    required
                    disabled={contactLoading}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-700 bg-gray-800 text-white placeholder-gray-500 focus:border-white focus:outline-none transition-colors"
                    placeholder="How can we help?"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium mb-2">Message</label>
                  <textarea
                    id="message"
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    required
                    disabled={contactLoading}
                    rows={6}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-700 bg-gray-800 text-white placeholder-gray-500 focus:border-white focus:outline-none transition-colors resize-none"
                    placeholder="Tell us more about your question or feedback..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={contactLoading}
                  className="w-full bg-white text-black px-6 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all duration-300 hover:shadow-xl flex items-center justify-center gap-2 disabled:bg-gray-600 disabled:cursor-not-allowed"
                >
                  {contactLoading ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send size={20} />
                      Send Message
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      <footer className="py-8 px-4 border-t border-gray-800">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-sm text-gray-400">
            As an affiliate, we may earn a small commission from qualifying purchases at no extra cost to you.
          </p>
        </div>
      </footer>

      {selectedProduct && (
        <RevealOverlay product={selectedProduct} onClose={() => setSelectedProduct(null)} />
      )}
    </div>
  );
}
