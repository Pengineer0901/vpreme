import { Menu, X, LogOut, LogIn, User, Settings, CreditCard, HelpCircle, ChevronDown } from 'lucide-react';
import { useState } from 'react';

interface NavigationProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  isAuthenticated?: boolean;
  isAdmin?: boolean;
  onLogout?: () => void;
}

export default function Navigation({
  currentPage,
  onNavigate,
  isAuthenticated = false,
  isAdmin = false,
  onLogout
}: NavigationProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const publicItems = isAuthenticated ? [] : [
    { id: 'home', label: 'Home', scrollTo: 'home' },
    { id: 'about', label: 'About', scrollTo: 'about' },
    { id: 'premium', label: 'Premium', scrollTo: 'premium', highlight: true },
    { id: 'help', label: 'Help', scrollTo: 'help' },
    { id: 'contact', label: 'Contact', scrollTo: 'contact' },
  ];

  const authenticatedItems = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'alerts', label: 'Alerts' },
    { id: 'amazon-chatbot', label: 'Amazon Search' },
    { id: 'prompt-engine', label: 'Prompt Engine' },
    { id: 'referral', label: 'Referral' },
  ];

  const adminItems = [
    { id: 'admin-console', label: 'Admin Console', admin: true },
  ];

  let navItems = publicItems;

  if (isAuthenticated) {
    if (isAdmin) {
      navItems = [...adminItems];
    } else {
      navItems = [...authenticatedItems, ...publicItems];
    }
  }

  function handleNavClick(item: any) {
    if (item.scrollTo && currentPage === 'home') {
      const element = document.getElementById(item.scrollTo);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } else if (item.scrollTo) {
      onNavigate('home');
      setTimeout(() => {
        const element = document.getElementById(item.scrollTo);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    } else {
      onNavigate(item.id);
    }
  }

  return (
    <nav className="bg-black shadow-lg sticky top-0 z-50 border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <button
              onClick={() => onNavigate('home')}
              className="text-2xl font-bold text-white hover:text-gray-200 transition-colors"
            >
              VPREME
            </button>
          </div>

          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                  currentPage === item.id && !item.scrollTo
                    ? 'bg-white text-black'
                    : item.highlight
                    ? 'text-white bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400'
                    : 'text-gray-300 hover:text-white hover:bg-gray-900'
                }`}
              >
                {item.label}
              </button>
            ))}

            {!isAuthenticated ? (
              <button
                onClick={() => onNavigate('login')}
                className="px-4 py-2 text-sm font-medium rounded-lg transition-all bg-white text-black hover:bg-gray-100 flex items-center gap-2"
              >
                <LogIn size={16} />
                Login
              </button>
            ) : isAdmin ? (
              <button
                onClick={onLogout}
                className="px-4 py-2 text-sm font-medium rounded-lg transition-all text-red-400 hover:text-red-300 hover:bg-red-900/30 flex items-center gap-2"
              >
                <LogOut size={16} />
                Logout
              </button>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  className="px-4 py-2 text-sm font-medium rounded-lg transition-all text-gray-300 hover:text-white hover:bg-gray-900 flex items-center gap-2"
                >
                  <User size={16} />
                  Account
                  <ChevronDown size={16} className={`transition-transform ${profileMenuOpen ? 'rotate-180' : ''}`} />
                </button>
                {profileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-gray-900 border border-gray-800 rounded-lg shadow-xl overflow-hidden">
                    <button
                      onClick={() => {
                        onNavigate('dashboard');
                        setProfileMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-white transition-all flex items-center gap-2"
                    >
                      <User size={16} />
                      Profile
                    </button>
                    <button
                      onClick={() => {
                        onNavigate('checkout');
                        setProfileMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-white transition-all flex items-center gap-2"
                    >
                      <CreditCard size={16} />
                      Upgrade to Premium
                    </button>
                    <button
                      onClick={() => {
                        onNavigate('help');
                        setProfileMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-white transition-all flex items-center gap-2"
                    >
                      <HelpCircle size={16} />
                      Help & Support
                    </button>
                    <div className="border-t border-gray-800"></div>
                    <button
                      onClick={() => {
                        onLogout?.();
                        setProfileMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-3 text-red-400 hover:bg-red-900/30 hover:text-red-300 transition-all flex items-center gap-2"
                    >
                      <LogOut size={16} />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-800 transition-colors text-white"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-800 bg-black">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  handleNavClick(item);
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                  currentPage === item.id && !item.scrollTo
                    ? 'bg-white text-black font-bold'
                    : item.highlight
                    ? 'text-white bg-gradient-to-r from-yellow-600 to-yellow-500'
                    : 'text-gray-300 hover:bg-gray-900 hover:text-white'
                }`}
              >
                {item.label}
              </button>
            ))}

            {!isAuthenticated ? (
              <button
                onClick={() => {
                  onNavigate('login');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-4 py-3 rounded-lg transition-all bg-white text-black font-bold flex items-center gap-2"
              >
                <LogIn size={16} />
                Login
              </button>
            ) : (
              <button
                onClick={() => {
                  onLogout?.();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-4 py-3 rounded-lg transition-all text-gray-300 hover:bg-red-900/30 hover:text-white flex items-center gap-2"
              >
                <LogOut size={16} />
                Logout
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
