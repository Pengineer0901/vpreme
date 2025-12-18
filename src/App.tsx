import { useState, useEffect } from 'react';
import Navigation from './components/Navigation';
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import AlertsPage from './pages/AlertsPage';
import ReferralPage from './pages/ReferralPage';
import CheckoutPage from './pages/CheckoutPage';
import PromptEnginePage from './pages/PromptEnginePage';
import AdminConsolePage from './pages/AdminConsolePage';
import AmazonChatbotPage from './pages/AmazonChatbotPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import { authAPI, User } from './lib/auth';
import { Toaster } from 'react-hot-toast';
function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [checkoutPlan, setCheckoutPlan] = useState<'monthly' | 'annual'>('monthly');
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const path = window.location.pathname;
    if (path === '/') {
      setCurrentPage('home');
    } else {
      setCurrentPage(path.substring(1));
    }

    loadUser();
  }, []);

  async function loadUser() {
    try {
      const currentUser = await authAPI.getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error('Failed to load user:', error);
    } finally {
      setLoading(false);
    }
  }

  function handleNavigate(page: string, plan?: 'monthly' | 'annual') {
    if (plan) {
      setCheckoutPlan(plan);
    }

    window.history.pushState({}, '', `/${page === 'home' ? '' : page}`);
    setCurrentPage(page);
  }

  function handleLogout() {
    authAPI.logout();
    setUser(null);
    handleNavigate('home');
  }

  function renderPage() {
    switch (currentPage) {
      case 'home':
      case '':
        return <HomePage onNavigate={handleNavigate} />;

      case 'login':
        return <LoginPage />;

      case 'signup':
        return <SignupPage />;

      case 'dashboard':
        return <DashboardPage onNavigate={handleNavigate} />;

      case 'alerts':
        return <AlertsPage onNavigate={handleNavigate} />;

      case 'admin-console':
        if (!user?.isAdmin) {
          handleNavigate('dashboard');
          return null;
        }
        return <AdminConsolePage />;

      case 'prompt-engine':
        return <PromptEnginePage />;

      case 'amazon-chatbot':
        return <AmazonChatbotPage />;

      case 'referral':
        return <ReferralPage onNavigate={handleNavigate} />;

      case 'checkout':
        return <CheckoutPage onNavigate={handleNavigate} plan={checkoutPlan} />;

      default:
        return <HomePage onNavigate={handleNavigate} />;
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {currentPage !== 'checkout' && currentPage !== 'login' && currentPage !== 'signup' && (<>
        <Navigation
          currentPage={currentPage}
          onNavigate={handleNavigate}
          isAuthenticated={!!user}
          isAdmin={user?.isAdmin || false}
          onLogout={handleLogout}
        />
          <Toaster position="top-right" />      
      </>
      )}
      {renderPage()}
    </div>
  );
}

export default App;
