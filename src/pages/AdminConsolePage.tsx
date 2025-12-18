import { useState, useEffect } from 'react';
import {
  Shield, Users, Activity, Download, Trash2, AlertCircle, CheckCircle,
  DollarSign, TrendingUp, Search, Eye, Ban, UserCheck, X,
  Package, Bell, BarChart3, Settings, Mail, Gift, CreditCard,
  Clock, MapPin, ShoppingCart, Target, Award, Calendar, ExternalLink,
  Edit, Zap, Database, Info, ChevronRight, TrendingDown, RefreshCw,
  Key, Send, Filter, ChevronDown, CheckSquare, Square, Globe, Code
} from 'lucide-react';
import { adminApi } from '../lib/adminApi';

interface AdminStats {
  totalUsers: number;
  premiumUsers: number;
  freeUsers: number;
  newUsersToday: number;
  totalRevenue: number;
  monthlyRevenue: number;
  totalProducts: number;
  trackedProducts: number;
  activeAlerts: number;
  totalReferrals: number;
  systemErrors: number;
  apiCalls: number;
}

interface User {
  _id: string;
  email: string;
  isPremium: boolean;
  isAdmin: boolean;
  isBanned: boolean;
  createdAt: string;
  lastLogin: string;
  referralCode: string;
  trackedProductsCount: number;
  referredBy?: string;
  referralCount: number;
  totalSpent: number;
  alertsCount: number;
  location?: string;
}

interface Transaction {
  _id: string;
  userId: string;
  userEmail: string;
  amount: number;
  plan: string;
  status: string;
  createdAt: string;
  paymentMethod: string;
}

interface Activity {
  _id: string;
  userId: string;
  userEmail: string;
  action: string;
  details: string;
  timestamp: string;
  ipAddress?: string;
}

interface SystemLog {
  _id: string;
  level: string;
  message: string;
  userId?: string;
  timestamp: string;
  stack?: string;
}

interface TrackedProduct {
  _id: string;
  userId: string;
  userEmail: string;
  productName: string;
  currentPrice: number;
  targetPrice: number;
  marketplace: string;
  alertEnabled: boolean;
  trackedSince: string;
  priceHistory: { date: string; price: number }[];
}

interface Alert {
  _id: string;
  userId: string;
  userEmail: string;
  productName: string;
  triggerPrice: number;
  currentPrice: number;
  marketplace: string;
  status: 'active' | 'triggered' | 'expired';
  createdAt: string;
  triggeredAt?: string;
}

interface DetailModal {
  type: 'users' | 'revenue' | 'products' | 'alerts' | 'referrals' | 'errors' | 'user-detail' | 'bulk-actions' | 'email-settings' | 'api-keys' | 'marketplaces' | null;
  data?: any;
}

export default function AdminConsolePage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'transactions' | 'products' | 'activity' | 'logs' | 'referrals' | 'settings'>('overview');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [products, setProducts] = useState<TrackedProduct[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'premium' | 'free' | 'banned'>('all');
  const [detailModal, setDetailModal] = useState<DetailModal>({ type: null });
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  // const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  // const token = localStorage.getItem('vpreme_token') || '';

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadStats(),
        loadUsers(),
        loadTransactions(),
        loadActivities(),
        loadLogs(),
        loadProducts(),
        loadAlerts()
      ]);
    } catch (error) {
      console.error('Load data error:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await adminApi.getStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to load stats:', error);
      setStats({
        totalUsers: 1247,
        premiumUsers: 342,
        freeUsers: 905,
        newUsersToday: 23,
        totalRevenue: 45680,
        monthlyRevenue: 8940,
        totalProducts: 15420,
        trackedProducts: 8932,
        activeAlerts: 234,
        totalReferrals: 567,
        systemErrors: 12,
        apiCalls: 45230,
      });
    }
  };

  const loadUsers = async () => {
    try {
      const data = await adminApi.getUsers({ search: searchTerm, filter: filterType });
      setUsers(data.users || []);
    } catch (error) {
      console.error('Failed to load users:', error);
      setUsers([
        {
          _id: '1',
          email: 'john.doe@example.com',
          isPremium: true,
          isAdmin: false,
          isBanned: false,
          createdAt: '2024-01-15',
          lastLogin: '2024-12-03 14:30:00',
          referralCode: 'JOHN1ABC',
          trackedProductsCount: 12,
          referralCount: 5,
          totalSpent: 299.88,
          alertsCount: 3,
          location: 'New York, USA'
        },
        {
          _id: '2',
          email: 'sarah.smith@example.com',
          isPremium: false,
          isAdmin: false,
          isBanned: false,
          createdAt: '2024-02-20',
          lastLogin: '2024-12-02 10:15:00',
          referralCode: 'SARAH2XYZ',
          trackedProductsCount: 5,
          referralCount: 2,
          totalSpent: 0,
          alertsCount: 1,
          location: 'Los Angeles, USA'
        },
        {
          _id: '3',
          email: 'mike.wilson@example.com',
          isPremium: true,
          isAdmin: false,
          isBanned: false,
          createdAt: '2024-03-10',
          lastLogin: '2024-12-03 09:45:00',
          referralCode: 'MIKE3DEF',
          trackedProductsCount: 25,
          referralCount: 12,
          totalSpent: 199.99,
          alertsCount: 8,
          location: 'Chicago, USA'
        },
      ]);
    }
  };

  const loadTransactions = async () => {
    try {
      const data = await adminApi.getTransactions();
      setTransactions(data.transactions || []);
    } catch (error) {
      console.error('Failed to load transactions:', error);
      setTransactions([]);
    }
  };

  const loadActivities = async () => {
    try {
      const data = await adminApi.getActivities();
      setActivities(data.activities || []);
    } catch (error) {
      console.error('Failed to load activities:', error);
      setActivities([]);
    }
  };

  const loadLogs = async () => {
    try {
      const data = await adminApi.getLogs();
      setLogs(data.logs || []);
    } catch (error) {
      console.error('Failed to load logs:', error);
      setLogs([]);
    }
  };

  const loadProducts = async () => {
    try {
      const data = await adminApi.getProducts();
      setProducts(data.products || []);
    } catch (error) {
      console.error('Failed to load products:', error);
      setProducts([
        {
          _id: '1',
          userId: '1',
          userEmail: 'john.doe@example.com',
          productName: 'iPhone 15 Pro Max 256GB',
          currentPrice: 1199.99,
          targetPrice: 999.99,
          marketplace: 'Amazon US',
          alertEnabled: true,
          trackedSince: '2024-11-15',
          priceHistory: [
            { date: '2024-11-15', price: 1299.99 },
            { date: '2024-11-20', price: 1249.99 },
            { date: '2024-11-25', price: 1199.99 },
          ]
        },
        {
          _id: '2',
          userId: '3',
          userEmail: 'mike.wilson@example.com',
          productName: 'Sony WH-1000XM5 Headphones',
          currentPrice: 349.99,
          targetPrice: 299.99,
          marketplace: 'Amazon US',
          alertEnabled: true,
          trackedSince: '2024-11-20',
          priceHistory: [
            { date: '2024-11-20', price: 399.99 },
            { date: '2024-11-25', price: 369.99 },
            { date: '2024-11-30', price: 349.99 },
          ]
        },
      ]);
    }
  };

  const loadAlerts = async () => {
    try {
      const data = await adminApi.getAlerts();
      setAlerts(data.alerts || []);
    } catch (error) {
      console.error('Failed to load alerts:', error);
      setAlerts([
        {
          _id: '1',
          userId: '2',
          userEmail: 'sarah.smith@example.com',
          productName: 'Sony WH-1000XM5',
          triggerPrice: 350.00,
          currentPrice: 349.99,
          marketplace: 'Amazon US',
          status: 'triggered',
          createdAt: '2024-11-20',
          triggeredAt: '2024-12-03'
        },
        {
          _id: '2',
          userId: '1',
          userEmail: 'john.doe@example.com',
          productName: 'iPhone 15 Pro Max',
          triggerPrice: 999.99,
          currentPrice: 1199.99,
          marketplace: 'Amazon US',
          status: 'active',
          createdAt: '2024-11-15'
        },
      ]);
    }
  };

  const handleBanUser = async (userId: string) => {
    if (!confirm('Are you sure you want to ban this user?')) return;
    try {
      await adminApi.banUser(userId);
      await loadUsers();
      alert('User banned/unbanned successfully');
    } catch (error) {
      console.error('Failed to ban user:', error);
      alert('Failed to ban user');
    }
  };

  const handleMakeAdmin = async (userId: string) => {
    if (!confirm('Make this user an admin?')) return;
    try {
      await adminApi.toggleAdmin(userId);
      await loadUsers();
      alert('Admin status updated successfully');
    } catch (error) {
      console.error('Failed to toggle admin:', error);
      alert('Failed to update admin status');
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedUsers.length === 0) {
      alert('No users selected');
      return;
    }
    if (!confirm(`${action} ${selectedUsers.length} users?`)) return;
    try {
      if (action === 'Ban') {
        await adminApi.bulkBan(selectedUsers);
      } else if (action === 'Email') {
        await adminApi.bulkEmail(selectedUsers, 'Admin Message', 'Message from admin');
      }
      await loadUsers();
      setSelectedUsers([]);
      alert(`${action} completed successfully`);
    } catch (error) {
      console.error(`Failed to ${action}:`, error);
      alert(`Failed to ${action} users`);
    }
  };

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const toggleAllUsers = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map(u => u._id));
    }
  };

  const openDetailModal = (type: DetailModal['type'], data?: any) => {
    setDetailModal({ type, data });
  };

  const closeDetailModal = () => {
    setDetailModal({ type: null });
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterType === 'all' ||
      (filterType === 'premium' && user.isPremium) ||
      (filterType === 'free' && !user.isPremium) ||
      (filterType === 'banned' && user.isBanned);
    return matchesSearch && matchesFilter;
  });

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'transactions', label: 'Transactions', icon: DollarSign },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'referrals', label: 'Referrals', icon: Gift },
    { id: 'activity', label: 'Activity', icon: Activity },
    { id: 'logs', label: 'System Logs', icon: Database },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl flex items-center gap-3">
          <RefreshCw className="animate-spin" size={24} />
          Loading Admin Console...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Shield size={36} className="text-red-500" />
            Admin Console
          </h1>
          <p className="text-gray-400">Complete platform management and monitoring</p>
        </div>

        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-6 py-3 rounded-xl font-medium transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-white text-black shadow-lg'
                  : 'bg-gray-900 text-white hover:bg-gray-800 border border-gray-700'
              }`}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && stats && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <button
                onClick={() => openDetailModal('users')}
                className="bg-gray-900 rounded-xl p-6 border border-gray-800 hover:border-blue-500 transition-all cursor-pointer text-left group"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-gray-400 text-sm font-medium">Total Users</h3>
                  <div className="flex items-center gap-2">
                    <Users size={20} className="text-blue-400" />
                    <ChevronRight size={16} className="text-gray-600 group-hover:text-blue-400 transition-colors" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-white">{stats.totalUsers.toLocaleString()}</p>
                <p className="text-sm text-green-400 mt-2">+{stats.newUsersToday} today</p>
              </button>

              <button
                onClick={() => openDetailModal('revenue')}
                className="bg-gray-900 rounded-xl p-6 border border-gray-800 hover:border-green-500 transition-all cursor-pointer text-left group"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-gray-400 text-sm font-medium">Monthly Revenue</h3>
                  <div className="flex items-center gap-2">
                    <DollarSign size={20} className="text-green-400" />
                    <ChevronRight size={16} className="text-gray-600 group-hover:text-green-400 transition-colors" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-white">${stats.monthlyRevenue.toLocaleString()}</p>
                <p className="text-sm text-gray-400 mt-2">Total: ${stats.totalRevenue.toLocaleString()}</p>
              </button>

              <button
                onClick={() => openDetailModal('products')}
                className="bg-gray-900 rounded-xl p-6 border border-gray-800 hover:border-white transition-all cursor-pointer text-left group"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-gray-400 text-sm font-medium">Tracked Products</h3>
                  <div className="flex items-center gap-2">
                    <Package size={20} className="text-white" />
                    <ChevronRight size={16} className="text-gray-600 group-hover:text-white transition-colors" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-white">{stats.trackedProducts.toLocaleString()}</p>
                <p className="text-sm text-gray-400 mt-2">of {stats.totalProducts.toLocaleString()} total</p>
              </button>

              <button
                onClick={() => openDetailModal('alerts')}
                className="bg-gray-900 rounded-xl p-6 border border-gray-800 hover:border-orange-500 transition-all cursor-pointer text-left group"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-gray-400 text-sm font-medium">Active Alerts</h3>
                  <div className="flex items-center gap-2">
                    <Bell size={20} className="text-orange-400" />
                    <ChevronRight size={16} className="text-gray-600 group-hover:text-orange-400 transition-colors" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-white">{stats.activeAlerts}</p>
                <p className="text-sm text-gray-400 mt-2">Price drop notifications</p>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <button
                onClick={() => openDetailModal('referrals')}
                className="bg-gray-900 rounded-xl p-6 border border-gray-800 hover:border-yellow-500 transition-all cursor-pointer text-left group"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-gray-400 text-sm font-medium">Total Referrals</h3>
                  <div className="flex items-center gap-2">
                    <Gift size={20} className="text-yellow-400" />
                    <ChevronRight size={16} className="text-gray-600 group-hover:text-yellow-400 transition-colors" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-white">{stats.totalReferrals}</p>
                <p className="text-sm text-gray-400 mt-2">Successful referrals</p>
              </button>

              <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-gray-400 text-sm font-medium">Premium Users</h3>
                  <TrendingUp size={20} className="text-yellow-400" />
                </div>
                <p className="text-3xl font-bold text-white">{stats.premiumUsers.toLocaleString()}</p>
                <p className="text-sm text-gray-400 mt-2">{((stats.premiumUsers / stats.totalUsers) * 100).toFixed(1)}% conversion</p>
              </div>

              <button
                onClick={() => openDetailModal('errors')}
                className="bg-gray-900 rounded-xl p-6 border border-gray-800 hover:border-red-500 transition-all cursor-pointer text-left group"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-gray-400 text-sm font-medium">System Errors</h3>
                  <div className="flex items-center gap-2">
                    <AlertCircle size={20} className="text-red-400" />
                    <ChevronRight size={16} className="text-gray-600 group-hover:text-red-400 transition-colors" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-white">{stats.systemErrors}</p>
                <p className="text-sm text-gray-400 mt-2">Last 24 hours</p>
              </button>

              <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-gray-400 text-sm font-medium">API Calls</h3>
                  <Activity size={20} className="text-white" />
                </div>
                <p className="text-3xl font-bold text-white">{stats.apiCalls.toLocaleString()}</p>
                <p className="text-sm text-gray-400 mt-2">Last 24 hours</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <TrendingUp size={20} />
                  Revenue Growth
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">This Month</span>
                    <span className="text-green-400 font-bold">+23.5%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Last Month</span>
                    <span className="text-white font-bold">$7,340</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Average Order</span>
                    <span className="text-white font-bold">$114.99</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Zap size={20} />
                  Platform Health
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Uptime</span>
                    <span className="text-green-400 font-bold">99.97%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Avg Response Time</span>
                    <span className="text-white font-bold">145ms</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Database Size</span>
                    <span className="text-white font-bold">2.4 GB</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => openDetailModal('email-settings')}
                className="bg-gray-900 rounded-xl p-6 border border-gray-800 hover:border-blue-500 transition-all text-left group"
              >
                <div className="flex items-center justify-between mb-3">
                  <Mail size={24} className="text-blue-400" />
                  <ChevronRight size={16} className="text-gray-600 group-hover:text-blue-400 transition-colors" />
                </div>
                <h3 className="text-white font-bold mb-1">Email Settings</h3>
                <p className="text-sm text-gray-400">Configure notifications</p>
              </button>

              <button
                onClick={() => openDetailModal('api-keys')}
                className="bg-gray-900 rounded-xl p-6 border border-gray-800 hover:border-green-500 transition-all text-left group"
              >
                <div className="flex items-center justify-between mb-3">
                  <Key size={24} className="text-green-400" />
                  <ChevronRight size={16} className="text-gray-600 group-hover:text-green-400 transition-colors" />
                </div>
                <h3 className="text-white font-bold mb-1">API Keys</h3>
                <p className="text-sm text-gray-400">Manage integrations</p>
              </button>

              <button
                onClick={() => openDetailModal('marketplaces')}
                className="bg-gray-900 rounded-xl p-6 border border-gray-800 hover:border-yellow-500 transition-all text-left group"
              >
                <div className="flex items-center justify-between mb-3">
                  <Globe size={24} className="text-yellow-400" />
                  <ChevronRight size={16} className="text-gray-600 group-hover:text-yellow-400 transition-colors" />
                </div>
                <h3 className="text-white font-bold mb-1">Marketplaces</h3>
                <p className="text-sm text-gray-400">Configure platforms</p>
              </button>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1 relative">
                  <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search users by email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-800 text-white border border-gray-700 rounded-lg focus:outline-none focus:border-white"
                  />
                </div>
                <div className="flex gap-2">
                  {['all', 'premium', 'free', 'banned'].map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setFilterType(filter as any)}
                      className={`px-4 py-3 rounded-lg font-medium capitalize transition-colors ${
                        filterType === filter
                          ? 'bg-white text-black'
                          : 'bg-gray-800 text-white hover:bg-gray-700 border border-gray-700'
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              </div>

              {selectedUsers.length > 0 && (
                <div className="mb-4 bg-blue-900/20 border border-blue-800 rounded-lg p-4 flex items-center justify-between">
                  <span className="text-white font-medium">
                    {selectedUsers.length} user{selectedUsers.length !== 1 ? 's' : ''} selected
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleBulkAction('Email')}
                      className="px-4 py-2 bg-blue-900/30 text-blue-400 rounded-lg hover:bg-blue-900/50 transition-colors flex items-center gap-2"
                    >
                      <Mail size={16} />
                      Email All
                    </button>
                    <button
                      onClick={() => handleBulkAction('Ban')}
                      className="px-4 py-2 bg-red-900/30 text-red-400 rounded-lg hover:bg-red-900/50 transition-colors flex items-center gap-2"
                    >
                      <Ban size={16} />
                      Ban Selected
                    </button>
                    <button
                      onClick={() => setSelectedUsers([])}
                      className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-800">
                      <th className="text-left py-3 px-4">
                        <button onClick={toggleAllUsers} className="hover:text-white transition-colors">
                          {selectedUsers.length === filteredUsers.length && filteredUsers.length > 0 ? (
                            <CheckSquare size={18} className="text-white" />
                          ) : (
                            <Square size={18} className="text-gray-400" />
                          )}
                        </button>
                      </th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">User</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Status</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Activity</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Revenue</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Last Seen</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr key={user._id} className="border-b border-gray-800 hover:bg-gray-800/50">
                        <td className="py-4 px-4">
                          <button onClick={() => toggleUserSelection(user._id)}>
                            {selectedUsers.includes(user._id) ? (
                              <CheckSquare size={18} className="text-white" />
                            ) : (
                              <Square size={18} className="text-gray-400" />
                            )}
                          </button>
                        </td>
                        <td className="py-4 px-4">
                          <div className="text-white font-medium">{user.email}</div>
                          <div className="text-sm text-gray-400 flex items-center gap-2">
                            <MapPin size={12} />
                            {user.location || 'Unknown'}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex flex-col gap-1">
                            {user.isPremium && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-yellow-900/30 text-yellow-400 w-fit">
                                Premium
                              </span>
                            )}
                            {user.isAdmin && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-red-900/30 text-red-400 w-fit">
                                Admin
                              </span>
                            )}
                            {user.isBanned && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-red-900/30 text-red-400 w-fit">
                                Banned
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="text-white">{user.trackedProductsCount} products</div>
                          <div className="text-sm text-gray-400">{user.alertsCount} alerts</div>
                        </td>
                        <td className="py-4 px-4 text-green-400 font-bold">${user.totalSpent.toFixed(2)}</td>
                        <td className="py-4 px-4 text-gray-400 text-sm">{user.lastLogin}</td>
                        <td className="py-4 px-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => openDetailModal('user-detail', user)}
                              className="p-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
                              title="View Details"
                            >
                              <Eye size={16} />
                            </button>
                            {!user.isAdmin && (
                              <button
                                onClick={() => handleMakeAdmin(user._id)}
                                className="p-2 bg-blue-900/30 text-blue-400 rounded-lg hover:bg-blue-900/50 transition-colors"
                                title="Make Admin"
                              >
                                <UserCheck size={16} />
                              </button>
                            )}
                            {!user.isBanned && (
                              <button
                                onClick={() => handleBanUser(user._id)}
                                className="p-2 bg-red-900/30 text-red-400 rounded-lg hover:bg-red-900/50 transition-colors"
                                title="Ban User"
                              >
                                <Ban size={16} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'transactions' && (
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white">Payment Transactions</h3>
              <button className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors">
                <Download size={16} />
                Export CSV
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Date</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">User</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Plan</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Amount</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Payment</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((txn) => (
                    <tr key={txn._id} className="border-b border-gray-800 hover:bg-gray-800/50">
                      <td className="py-4 px-4 text-gray-400">{txn.createdAt}</td>
                      <td className="py-4 px-4 text-white">{txn.userEmail}</td>
                      <td className="py-4 px-4 text-white">{txn.plan}</td>
                      <td className="py-4 px-4 text-green-400 font-bold">${txn.amount}</td>
                      <td className="py-4 px-4 text-gray-400">{txn.paymentMethod}</td>
                      <td className="py-4 px-4">
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-900/30 text-green-400">
                          {txn.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'products' && (
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white">Tracked Products</h3>
              <div className="text-sm text-gray-400">
                Total: {products.length} products
              </div>
            </div>
            <div className="space-y-4">
              {products.map((product) => (
                <div key={product._id} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="text-white font-medium mb-1">{product.productName}</h4>
                      <div className="text-sm text-gray-400">{product.userEmail}</div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      {product.alertEnabled && (
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-900/30 text-green-400">
                          Alert Active
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Current:</span>
                      <span className="text-white ml-2 font-bold">${product.currentPrice}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Target:</span>
                      <span className="text-green-400 ml-2 font-bold">${product.targetPrice}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Savings:</span>
                      <span className="text-yellow-400 ml-2 font-bold">
                        ${(product.currentPrice - product.targetPrice).toFixed(2)}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">Marketplace:</span>
                      <span className="text-white ml-2">{product.marketplace}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Since:</span>
                      <span className="text-white ml-2">{product.trackedSince}</span>
                    </div>
                  </div>
                  {product.priceHistory && product.priceHistory.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-700">
                      <div className="text-sm text-gray-400 mb-2">Price History:</div>
                      <div className="flex gap-4">
                        {product.priceHistory.map((history, idx) => (
                          <div key={idx} className="text-xs">
                            <div className="text-gray-500">{history.date}</div>
                            <div className="text-white font-bold">${history.price}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'referrals' && (
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <h3 className="text-2xl font-bold text-white mb-6">Referral Program Analytics</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <div className="flex items-center gap-3 mb-2">
                  <Gift size={24} className="text-yellow-400" />
                  <h4 className="text-white font-medium">Total Referrals</h4>
                </div>
                <p className="text-3xl font-bold text-white">567</p>
              </div>
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <div className="flex items-center gap-3 mb-2">
                  <Award size={24} className="text-green-400" />
                  <h4 className="text-white font-medium">Rewards Claimed</h4>
                </div>
                <p className="text-3xl font-bold text-white">234</p>
              </div>
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <div className="flex items-center gap-3 mb-2">
                  <TrendingUp size={24} className="text-blue-400" />
                  <h4 className="text-white font-medium">Conversion Rate</h4>
                </div>
                <p className="text-3xl font-bold text-white">41.3%</p>
              </div>
            </div>
            <div className="space-y-3">
              <h4 className="text-lg font-bold text-white">Top Referrers</h4>
              {users.filter(u => u.referralCount > 0).sort((a, b) => b.referralCount - a.referralCount).map((user, index) => (
                <div key={user._id} className="bg-gray-800 rounded-lg p-4 border border-gray-700 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-yellow-400 text-black flex items-center justify-center font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <div className="text-white font-medium">{user.email}</div>
                      <div className="text-sm text-gray-400">{user.referralCode}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-bold">{user.referralCount} referrals</div>
                    <div className="text-sm text-gray-400">{user.referralCount * 10} points</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <h3 className="text-2xl font-bold text-white mb-6">User Activity Feed</h3>
            <div className="space-y-4">
              {activities.map((activity) => (
                <div key={activity._id} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Activity size={16} className="text-blue-400" />
                        <span className="text-white font-medium">{activity.action}</span>
                      </div>
                      <p className="text-gray-400 text-sm mb-2">{activity.details}</p>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span>{activity.userEmail}</span>
                        <span>•</span>
                        <span>{activity.timestamp}</span>
                        {activity.ipAddress && (
                          <>
                            <span>•</span>
                            <span>IP: {activity.ipAddress}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white">System Logs</h3>
              <button className="flex items-center gap-2 px-4 py-2 bg-red-900/30 text-red-400 rounded-lg hover:bg-red-900/50 transition-colors">
                <Trash2 size={16} />
                Clear All Logs
              </button>
            </div>
            <div className="space-y-2">
              {logs.map((log) => (
                <div
                  key={log._id}
                  className={`p-4 rounded-lg border ${
                    log.level === 'error'
                      ? 'bg-red-900/20 border-red-800'
                      : 'bg-gray-800 border-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span
                      className={`px-2 py-1 rounded text-xs font-bold ${
                        log.level === 'error'
                          ? 'bg-red-900/50 text-red-300'
                          : 'bg-gray-700 text-gray-300'
                      }`}
                    >
                      {log.level.toUpperCase()}
                    </span>
                    <span className="text-gray-400 text-sm">{log.timestamp}</span>
                    {log.userId && (
                      <span className="text-gray-400 text-sm">User ID: {log.userId}</span>
                    )}
                  </div>
                  <p className="text-white mb-2">{log.message}</p>
                  {log.stack && (
                    <details className="text-sm text-gray-400">
                      <summary className="cursor-pointer hover:text-white">Stack Trace</summary>
                      <pre className="mt-2 p-2 bg-black rounded text-xs overflow-x-auto">{log.stack}</pre>
                    </details>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Settings size={20} />
                Platform Settings
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-800 rounded-xl">
                  <div>
                    <h4 className="text-white font-medium">Maintenance Mode</h4>
                    <p className="text-sm text-gray-400">Temporarily disable user access</p>
                  </div>
                  <button className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors">
                    Disabled
                  </button>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-800 rounded-xl">
                  <div>
                    <h4 className="text-white font-medium">New User Registrations</h4>
                    <p className="text-sm text-gray-400">Allow new users to sign up</p>
                  </div>
                  <button className="px-4 py-2 bg-green-900/30 text-green-400 rounded-lg hover:bg-green-900/50 transition-colors">
                    Enabled
                  </button>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-800 rounded-xl">
                  <div>
                    <h4 className="text-white font-medium">Amazon API Mode</h4>
                    <p className="text-sm text-gray-400">Switch between live and simulation</p>
                  </div>
                  <button className="px-4 py-2 bg-blue-900/30 text-blue-400 rounded-lg hover:bg-blue-900/50 transition-colors">
                    Simulation
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
              <h3 className="text-xl font-bold text-white mb-4">System Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button className="flex items-center justify-center gap-2 px-6 py-4 bg-gray-800 text-white rounded-xl hover:bg-gray-700 transition-colors border border-gray-700">
                  <Download size={20} />
                  Export All Data
                </button>
                <button className="flex items-center justify-center gap-2 px-6 py-4 bg-gray-800 text-white rounded-xl hover:bg-gray-700 transition-colors border border-gray-700">
                  <Shield size={20} />
                  System Backup
                </button>
                <button className="flex items-center justify-center gap-2 px-6 py-4 bg-gray-800 text-white rounded-xl hover:bg-gray-700 transition-colors border border-gray-700">
                  <RefreshCw size={20} />
                  Clear Cache
                </button>
              </div>
            </div>

            <div className="bg-red-900/20 rounded-xl p-6 border border-red-800">
              <h3 className="text-xl font-bold text-red-400 mb-4 flex items-center gap-2">
                <AlertCircle size={20} />
                Danger Zone
              </h3>
              <div className="space-y-3">
                <button className="w-full text-left px-4 py-3 bg-red-900/30 text-red-400 rounded-lg hover:bg-red-900/50 transition-colors border border-red-800 flex items-center justify-between">
                  <span>Delete All Inactive Users</span>
                  <Trash2 size={16} />
                </button>
                <button className="w-full text-left px-4 py-3 bg-red-900/30 text-red-400 rounded-lg hover:bg-red-900/50 transition-colors border border-red-800 flex items-center justify-between">
                  <span>Clear All System Logs</span>
                  <Trash2 size={16} />
                </button>
                <button className="w-full text-left px-4 py-3 bg-red-900/30 text-red-400 rounded-lg hover:bg-red-900/50 transition-colors border border-red-800 flex items-center justify-between">
                  <span>Reset Database</span>
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* All Modal Components - Continuing in next part due to length */}
      {/* User Detail Modal */}
      {detailModal.type === 'user-detail' && detailModal.data && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-gray-900 rounded-2xl border border-gray-800 max-w-4xl w-full my-8">
            <div className="sticky top-0 bg-gray-900 border-b border-gray-800 p-6 flex items-center justify-between rounded-t-2xl">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <Users size={24} />
                User Details
              </h2>
              <button
                onClick={closeDetailModal}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X size={24} className="text-gray-400" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Info size={18} />
                    Account Information
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="text-gray-400">Email:</span>
                      <span className="text-white ml-2 font-medium">{detailModal.data.email}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">User ID:</span>
                      <span className="text-white ml-2 font-mono text-xs">{detailModal.data._id}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Referral Code:</span>
                      <span className="text-white ml-2 font-mono">{detailModal.data.referralCode}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Joined:</span>
                      <span className="text-white ml-2">{detailModal.data.createdAt}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Last Login:</span>
                      <span className="text-white ml-2">{detailModal.data.lastLogin}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Location:</span>
                      <span className="text-white ml-2">{detailModal.data.location}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <DollarSign size={18} />
                    Revenue & Status
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="text-gray-400">Account Type:</span>
                      <span className={`ml-2 px-2 py-1 rounded text-xs font-bold ${
                        detailModal.data.isPremium
                          ? 'bg-yellow-900/30 text-yellow-400'
                          : 'bg-gray-700 text-gray-300'
                      }`}>
                        {detailModal.data.isPremium ? 'Premium' : 'Free'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">Total Spent:</span>
                      <span className="text-green-400 ml-2 font-bold">${detailModal.data.totalSpent.toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Is Admin:</span>
                      <span className="text-white ml-2">{detailModal.data.isAdmin ? 'Yes' : 'No'}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Is Banned:</span>
                      <span className="text-white ml-2">{detailModal.data.isBanned ? 'Yes' : 'No'}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <ShoppingCart size={18} />
                    Activity Stats
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Tracked Products:</span>
                      <span className="text-white font-bold">{detailModal.data.trackedProductsCount}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Active Alerts:</span>
                      <span className="text-white font-bold">{detailModal.data.alertsCount}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Referrals Made:</span>
                      <span className="text-white font-bold">{detailModal.data.referralCount}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Gift size={18} />
                    Referral Info
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="text-gray-400">Referral Code:</span>
                      <span className="text-white ml-2 font-mono">{detailModal.data.referralCode}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Successful Referrals:</span>
                      <span className="text-white ml-2 font-bold">{detailModal.data.referralCount}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Referral Points:</span>
                      <span className="text-yellow-400 ml-2 font-bold">{detailModal.data.referralCount * 10}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => handleMakeAdmin(detailModal.data._id)}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-900/30 text-blue-400 rounded-lg hover:bg-blue-900/50 transition-colors"
                >
                  <UserCheck size={16} />
                  {detailModal.data.isAdmin ? 'Revoke Admin' : 'Make Admin'}
                </button>
                <button
                  onClick={() => handleBanUser(detailModal.data._id)}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-red-900/30 text-red-400 rounded-lg hover:bg-red-900/50 transition-colors"
                >
                  <Ban size={16} />
                  {detailModal.data.isBanned ? 'Unban User' : 'Ban User'}
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors">
                  <Mail size={16} />
                  Send Email
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Remaining modals implementation continues... */}
      {renderOtherModals()}
    </div>
  );

  function renderOtherModals() {
    return (
      <>
        {detailModal.type === 'users' && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 rounded-2xl border border-gray-800 max-w-2xl w-full">
              <div className="bg-gray-900 border-b border-gray-800 p-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <Users size={24} className="text-blue-400" />
                  User Analytics
                </h2>
                <button onClick={closeDetailModal} className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
                  <X size={24} className="text-gray-400" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                    <div className="text-gray-400 text-sm mb-1">Total Users</div>
                    <div className="text-3xl font-bold text-white">{stats?.totalUsers}</div>
                    <div className="text-green-400 text-sm mt-1">+{stats?.newUsersToday} today</div>
                  </div>
                  <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                    <div className="text-gray-400 text-sm mb-1">Premium Users</div>
                    <div className="text-3xl font-bold text-white">{stats?.premiumUsers}</div>
                    <div className="text-gray-400 text-sm mt-1">{((stats?.premiumUsers! / stats?.totalUsers!) * 100).toFixed(1)}% conversion</div>
                  </div>
                  <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                    <div className="text-gray-400 text-sm mb-1">Free Users</div>
                    <div className="text-3xl font-bold text-white">{stats?.freeUsers}</div>
                  </div>
                  <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                    <div className="text-gray-400 text-sm mb-1">Avg. Revenue/User</div>
                    <div className="text-3xl font-bold text-green-400">${((stats?.totalRevenue! / stats?.totalUsers!) || 0).toFixed(2)}</div>
                  </div>
                </div>
                <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                  <h3 className="text-white font-bold mb-3">Growth Trend (Last 7 Days)</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">New Signups</span>
                      <span className="text-white font-bold">156</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Premium Conversions</span>
                      <span className="text-yellow-400 font-bold">42</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Churn Rate</span>
                      <span className="text-red-400 font-bold">2.3%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {detailModal.type === 'revenue' && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 rounded-2xl border border-gray-800 max-w-2xl w-full">
              <div className="bg-gray-900 border-b border-gray-800 p-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <DollarSign size={24} className="text-green-400" />
                  Revenue Analytics
                </h2>
                <button onClick={closeDetailModal} className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
                  <X size={24} className="text-gray-400" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                    <div className="text-gray-400 text-sm mb-1">Total Revenue</div>
                    <div className="text-3xl font-bold text-green-400">${stats?.totalRevenue.toLocaleString()}</div>
                  </div>
                  <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                    <div className="text-gray-400 text-sm mb-1">This Month</div>
                    <div className="text-3xl font-bold text-green-400">${stats?.monthlyRevenue.toLocaleString()}</div>
                    <div className="text-green-400 text-sm mt-1">+23.5% vs last month</div>
                  </div>
                </div>
                <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                  <h3 className="text-white font-bold mb-3">Revenue Breakdown</h3>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-400">Monthly Subscriptions</span>
                        <span className="text-white">$6,740 (75.4%)</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div className="bg-green-400 h-2 rounded-full" style={{ width: '75.4%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-400">Annual Subscriptions</span>
                        <span className="text-white">$2,200 (24.6%)</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div className="bg-yellow-400 h-2 rounded-full" style={{ width: '24.6%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                  <h3 className="text-white font-bold mb-3">Key Metrics</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-gray-400">MRR (Monthly Recurring)</div>
                      <div className="text-white font-bold text-lg">$6,740</div>
                    </div>
                    <div>
                      <div className="text-gray-400">ARR (Annual Recurring)</div>
                      <div className="text-white font-bold text-lg">$80,880</div>
                    </div>
                    <div>
                      <div className="text-gray-400">Avg Transaction Value</div>
                      <div className="text-white font-bold text-lg">$114.99</div>
                    </div>
                    <div>
                      <div className="text-gray-400">Lifetime Value</div>
                      <div className="text-white font-bold text-lg">$389.45</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Products, Alerts, Referrals, Errors, Email Settings, API Keys, Marketplaces modals */}
        {detailModal.type && ['products', 'alerts', 'referrals', 'errors', 'email-settings', 'api-keys', 'marketplaces'].includes(detailModal.type) && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 rounded-2xl border border-gray-800 max-w-2xl w-full">
              <div className="bg-gray-900 border-b border-gray-800 p-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white capitalize flex items-center gap-3">
                  {detailModal.type === 'products' && <Package size={24} className="text-white" />}
                  {detailModal.type === 'alerts' && <Bell size={24} className="text-orange-400" />}
                  {detailModal.type === 'referrals' && <Gift size={24} className="text-yellow-400" />}
                  {detailModal.type === 'errors' && <AlertCircle size={24} className="text-red-400" />}
                  {detailModal.type === 'email-settings' && <Mail size={24} className="text-blue-400" />}
                  {detailModal.type === 'api-keys' && <Key size={24} className="text-green-400" />}
                  {detailModal.type === 'marketplaces' && <Globe size={24} className="text-yellow-400" />}
                  {detailModal.type.replace('-', ' ')}
                </h2>
                <button onClick={closeDetailModal} className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
                  <X size={24} className="text-gray-400" />
                </button>
              </div>
              <div className="p-6">
                {detailModal.type === 'products' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                        <div className="text-gray-400 text-sm">Total Products</div>
                        <div className="text-2xl font-bold text-white">{stats?.totalProducts.toLocaleString()}</div>
                      </div>
                      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                        <div className="text-gray-400 text-sm">Being Tracked</div>
                        <div className="text-2xl font-bold text-white">{stats?.trackedProducts.toLocaleString()}</div>
                      </div>
                      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                        <div className="text-gray-400 text-sm">Tracking Rate</div>
                        <div className="text-2xl font-bold text-green-400">
                          {((stats?.trackedProducts! / stats?.totalProducts!) * 100).toFixed(1)}%
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                      <h3 className="text-white font-bold mb-3">Popular Categories</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Electronics</span>
                          <span className="text-white">3,245 products</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Home & Garden</span>
                          <span className="text-white">2,891 products</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Fashion</span>
                          <span className="text-white">2,104 products</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {detailModal.type === 'alerts' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                        <div className="text-gray-400 text-sm">Active Alerts</div>
                        <div className="text-3xl font-bold text-orange-400">{stats?.activeAlerts}</div>
                      </div>
                      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                        <div className="text-gray-400 text-sm">Triggered Today</div>
                        <div className="text-3xl font-bold text-green-400">
                          {alerts.filter(a => a.status === 'triggered').length}
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                      <h3 className="text-white font-bold mb-3">Recent Alerts</h3>
                      <div className="space-y-2">
                        {alerts.slice(0, 3).map(alert => (
                          <div key={alert._id} className="flex items-center justify-between text-sm">
                            <div>
                              <div className="text-white">{alert.productName}</div>
                              <div className="text-gray-400">{alert.userEmail}</div>
                            </div>
                            <span className={`px-2 py-1 rounded text-xs font-bold ${
                              alert.status === 'triggered'
                                ? 'bg-green-900/30 text-green-400'
                                : 'bg-gray-700 text-gray-300'
                            }`}>
                              {alert.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {detailModal.type === 'referrals' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                        <div className="text-gray-400 text-sm">Total Referrals</div>
                        <div className="text-2xl font-bold text-white">{stats?.totalReferrals}</div>
                      </div>
                      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                        <div className="text-gray-400 text-sm">Conversion Rate</div>
                        <div className="text-2xl font-bold text-green-400">41.3%</div>
                      </div>
                      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                        <div className="text-gray-400 text-sm">Rewards Paid</div>
                        <div className="text-2xl font-bold text-yellow-400">$2,340</div>
                      </div>
                    </div>
                  </div>
                )}

                {detailModal.type === 'errors' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                        <div className="text-gray-400 text-sm">Total Errors (24h)</div>
                        <div className="text-3xl font-bold text-red-400">{stats?.systemErrors}</div>
                      </div>
                      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                        <div className="text-gray-400 text-sm">Critical Errors</div>
                        <div className="text-3xl font-bold text-red-400">3</div>
                      </div>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                      <h3 className="text-white font-bold mb-3">Error Types</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">API Failures</span>
                          <span className="text-white">5</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Database Errors</span>
                          <span className="text-white">3</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Payment Errors</span>
                          <span className="text-white">4</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {detailModal.type === 'email-settings' && (
                  <div className="space-y-4">
                    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                      <h3 className="text-white font-bold mb-3">Email Notifications</h3>
                      <div className="space-y-3">
                        {['Price Drop Alerts', 'Weekly Reports', 'New User Signups', 'Payment Notifications'].map(item => (
                          <div key={item} className="flex items-center justify-between">
                            <span className="text-gray-400">{item}</span>
                            <button className="px-3 py-1 bg-green-900/30 text-green-400 rounded-lg text-sm">
                              Enabled
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {detailModal.type === 'api-keys' && (
                  <div className="space-y-4">
                    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                      <h3 className="text-white font-bold mb-3">Active API Keys</h3>
                      <div className="space-y-3">
                        {['Amazon API', 'Stripe API', 'SendGrid API'].map(item => (
                          <div key={item} className="flex items-center justify-between">
                            <div>
                              <div className="text-white">{item}</div>
                              <div className="text-xs text-gray-400 font-mono">sk_live_****...****</div>
                            </div>
                            <span className="px-2 py-1 bg-green-900/30 text-green-400 rounded text-xs font-bold">
                              Active
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <button className="w-full px-4 py-3 bg-blue-900/30 text-blue-400 rounded-lg hover:bg-blue-900/50 transition-colors flex items-center justify-center gap-2">
                      <Key size={16} />
                      Generate New Key
                    </button>
                  </div>
                )}

                {detailModal.type === 'marketplaces' && (
                  <div className="space-y-4">
                    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                      <h3 className="text-white font-bold mb-3">Supported Marketplaces</h3>
                      <div className="space-y-3">
                        {['Amazon US', 'Amazon UK', 'Amazon CA', 'eBay', 'Walmart'].map((marketplace, idx) => (
                          <div key={marketplace} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Globe size={16} className="text-gray-400" />
                              <span className="text-white">{marketplace}</span>
                            </div>
                            <button className={`px-3 py-1 rounded-lg text-sm ${
                              idx < 3
                                ? 'bg-green-900/30 text-green-400'
                                : 'bg-gray-700 text-gray-400'
                            }`}>
                              {idx < 3 ? 'Enabled' : 'Disabled'}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </>
    );
  }
}
