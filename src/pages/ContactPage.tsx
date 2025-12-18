import { useState } from 'react';
import { Send, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSubmitted(false);

    try {
      const apiUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/contact`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          subject: formData.subject,
          message: formData.message,
          userId: user?.id || 'Guest',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send message');
      }

      setSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '' });

      setTimeout(() => {
        setSubmitted(false);
      }, 5000);
    } catch (err: any) {
      console.error('Error submitting form:', err);
      setError(err.message || 'Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">Contact Us</h1>
          <p className="text-xl text-gray-300">
            Have a question? We'd love to hear from you.
          </p>
          <p className="text-sm text-gray-400 mt-2">
            Send us an email at <a href="mailto:helper@vpreme.com" className="text-white font-semibold hover:underline">helper@vpreme.com</a>
          </p>
        </div>

        <div className="bg-gray-900 rounded-2xl shadow-md p-8 mb-8 border border-gray-800">
          {submitted ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-900/30 text-green-400 rounded-full mb-4">
                <CheckCircle size={32} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Message Sent!</h3>
              <p className="text-gray-300 mb-4">
                Thank you for contacting us. We'll get back to you at <span className="font-semibold">{formData.email || 'your email'}</span> as soon as possible.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="text-white hover:underline"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-900/30 border border-red-700 text-red-200 px-4 py-3 rounded-xl flex items-start gap-2">
                  <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
                  <span className="text-sm">{error}</span>
                </div>
              )}

              <div>
                <label htmlFor="name" className="block text-sm font-medium text-white mb-2">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-700 bg-gray-800 text-white placeholder-gray-500 focus:border-white focus:outline-none transition-colors disabled:bg-gray-700 disabled:cursor-not-allowed"
                  placeholder="Your name"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-700 bg-gray-800 text-white placeholder-gray-500 focus:border-white focus:outline-none transition-colors disabled:bg-gray-700 disabled:cursor-not-allowed"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-white mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-700 bg-gray-800 text-white placeholder-gray-500 focus:border-white focus:outline-none transition-colors disabled:bg-gray-700 disabled:cursor-not-allowed"
                  placeholder="How can we help?"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-white mb-2">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  rows={6}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-700 bg-gray-800 text-white placeholder-gray-500 focus:border-white focus:outline-none transition-colors resize-none disabled:bg-gray-700 disabled:cursor-not-allowed"
                  placeholder="Tell us more about your question or feedback..."
                />
              </div>

              <p className="text-xs text-gray-400 text-center">
                By submitting, you agree to our Privacy Policy and consent to contact for support.
              </p>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-white text-black px-6 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all duration-300 hover:shadow-xl flex items-center justify-center gap-2 disabled:bg-gray-600 disabled:cursor-not-allowed"
              >
                {loading ? (
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

        <div className="bg-gradient-to-r from-white to-gray-300 rounded-2xl p-6 text-black text-center mb-8">
          <p className="text-lg">Premium users get priority support</p>
        </div>

        <div className="bg-gray-900 rounded-2xl shadow-sm p-6 text-center border border-gray-800">
          <p className="text-sm text-gray-400">
            As an affiliate, we may earn a small commission from qualifying purchases at no extra cost to you.
          </p>
        </div>
      </div>
    </div>
  );
}
