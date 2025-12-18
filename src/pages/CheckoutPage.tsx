import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Lock, Check, ArrowLeft, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder');

interface CheckoutPageProps {
  onNavigate: (page: string) => void;
  plan?: 'monthly' | 'annual';
}

function CheckoutForm({ onNavigate, plan }: CheckoutPageProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const prices = {
    monthly: 9.99,
    annual: 99.99,
  };

  const annualSavings = (prices.monthly * 12 - prices.annual).toFixed(2);
  const selectedPrice = prices[plan];

  useEffect(() => {
    const token = localStorage.getItem('vpreme_token');
    if (!token) {
      onNavigate('login');
    }
  }, [onNavigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const token = localStorage.getItem('vpreme_token');

      const response = await fetch(`${apiUrl}/payments/create-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          plan: plan,
          amount: selectedPrice,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Payment failed');
      }

      const cardElement = elements.getElement(CardElement);

      if (!cardElement) {
        throw new Error('Card element not found');
      }

      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
        data.clientSecret,
        {
          payment_method: {
            card: cardElement,
          },
        }
      );

      if (stripeError) {
        throw new Error(stripeError.message);
      }

      if (paymentIntent.status === 'succeeded') {
        setSuccess(true);

        setTimeout(() => {
          onNavigate('dashboard');
        }, 2000);
      }
    } catch (err: any) {
      setError(err.message || 'Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-gray-900 rounded-2xl p-8 border border-gray-800 text-center">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={32} className="text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Payment Successful!</h2>
          <p className="text-gray-400 mb-4">Welcome to VPREME Premium</p>
          <p className="text-gray-500 text-sm">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => onNavigate('premium')}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft size={20} />
          Back to Premium
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-6">Complete Your Purchase</h1>

            <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800 mb-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-white">
                    {plan === 'annual' ? 'Annual' : 'Monthly'} Plan
                  </h3>
                  <p className="text-gray-400 text-sm">VPREME Premium</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-white">${selectedPrice}</p>
                  <p className="text-gray-400 text-sm">
                    {plan === 'annual' ? 'per year' : 'per month'}
                  </p>
                </div>
              </div>

              {plan === 'annual' && (
                <div className="bg-green-900/20 border border-green-500/30 rounded-xl p-3">
                  <p className="text-green-400 text-sm font-medium">
                    Save ${annualSavings} with annual billing
                  </p>
                </div>
              )}

              <div className="mt-6 pt-6 border-t border-gray-800">
                <h4 className="text-white font-bold mb-3">Included Features:</h4>
                <ul className="space-y-2">
                  {[
                    'Unlimited product tracking',
                    'Advanced price alerts',
                    'Historical price data',
                    'Priority support',
                    'Export capabilities',
                    'API access',
                  ].map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-gray-300 text-sm">
                      <Check size={16} className="text-green-400" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div>
            <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
              <h3 className="text-xl font-bold text-white mb-6">Payment Details</h3>

              {error && (
                <div className="mb-6 p-4 bg-red-900/30 border border-red-500/50 rounded-xl flex items-center gap-3">
                  <AlertCircle size={20} className="text-red-400 flex-shrink-0" />
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Card Information
                  </label>
                  <div className="p-4 bg-gray-800 border border-gray-700 rounded-xl">
                    <CardElement
                      options={{
                        style: {
                          base: {
                            color: '#ffffff',
                            fontFamily: 'system-ui, -apple-system, sans-serif',
                            fontSize: '16px',
                            '::placeholder': {
                              color: '#9ca3af',
                            },
                          },
                          invalid: {
                            color: '#ef4444',
                          },
                        },
                      }}
                    />
                  </div>
                </div>

                <div className="bg-gray-800 rounded-xl p-4 mb-6">
                  <div className="flex items-center gap-2 text-gray-400 text-sm">
                    <Lock size={16} />
                    <span>Secure payment powered by Stripe</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!stripe || loading}
                  className="w-full py-4 bg-white text-black rounded-xl font-bold hover:bg-gray-100 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Lock size={20} />
                      Pay ${selectedPrice}
                    </>
                  )}
                </button>

                <p className="text-gray-500 text-xs text-center mt-4">
                  By completing this purchase, you agree to our Terms of Service and Privacy Policy.
                  {plan === 'monthly' && ' Your subscription will automatically renew monthly.'}
                  {plan === 'annual' && ' Your subscription will automatically renew annually.'}
                </p>
              </form>
            </div>

            <div className="mt-6 text-center">
              <p className="text-gray-500 text-sm">
                Need help?{' '}
                <button
                  onClick={() => onNavigate('contact')}
                  className="text-white hover:underline"
                >
                  Contact Support
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage(props: CheckoutPageProps) {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm {...props} />
    </Elements>
  );
}
