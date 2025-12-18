import { useState, useEffect } from 'react';
import { Search, Power, PowerOff, History, FileText, DollarSign, Loader2 } from 'lucide-react';

interface User {
  _id: string;
  email: string;
  username: string;
  isAdmin: boolean;
  isPremium: boolean;
  is_active: boolean;
  referralCount: number;
  createdAt: string;
}

interface UserManagementProps {
  apiUrl: string;
  token: string;
}

export default function UserManagement({ apiUrl, token }: UserManagementProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'tracking' | 'prompts' | 'payments'>('list');
  const [userHistory, setUserHistory] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => {
    loadUsers();
  }, [search]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${apiUrl}/admin/users?search=${search}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setUsers(data.data.users);
      }
    } catch (error) {
      console.error('Load users error:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleUserAccess = async (userId: string) => {
    if (!confirm('Toggle user access?')) return;

    try {
      const response = await fetch(`${apiUrl}/admin/users/${userId}/toggle-access`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        loadUsers();
        alert(data.message);
      }
    } catch (error) {
      console.error('Toggle access error:', error);
      alert('Failed to toggle user access');
    }
  };

  const loadUserHistory = async (userId: string, type: 'tracking' | 'prompts' | 'payments') => {
    setHistoryLoading(true);
    try {
      const endpoint = type === 'tracking' ? 'tracking-history' :
                       type === 'prompts' ? 'prompt-history' : 'payment-history';

      const response = await fetch(`${apiUrl}/admin/users/${userId}/${endpoint}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        if (type === 'tracking') {
          setUserHistory(data.data.trackedProducts || []);
        } else if (type === 'prompts') {
          setUserHistory(data.data.promptHistory || []);
        } else {
          setUserHistory(data.data.payments || []);
        }
      }
    } catch (error) {
      console.error('Load history error:', error);
      setUserHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  const viewUserDetails = (user: User, mode: 'tracking' | 'prompts' | 'payments') => {
    setSelectedUser(user);
    setViewMode(mode);
    loadUserHistory(user._id, mode);
  };

  if (viewMode !== 'list' && selectedUser) {
    return (
      <div>
        <button
          onClick={() => {
            setViewMode('list');
            setSelectedUser(null);
            setUserHistory([]);
          }}
          className="mb-4 px-4 py-2 bg-gray-800 text-white rounded-xl hover:bg-gray-700 transition-colors"
        >
          ← Back to Users
        </button>

        <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800 mb-4">
          <h3 className="text-xl font-bold text-white mb-2">{selectedUser.username}</h3>
          <p className="text-gray-400">{selectedUser.email}</p>
          <div className="flex gap-2 mt-2">
            {selectedUser.isAdmin && (
              <span className="px-3 py-1 bg-red-900/30 text-red-400 rounded-full text-xs font-bold">ADMIN</span>
            )}
            {selectedUser.isPremium && (
              <span className="px-3 py-1 bg-yellow-900/30 text-yellow-400 rounded-full text-xs font-bold">PREMIUM</span>
            )}
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
              selectedUser.is_active
                ? 'bg-green-900/30 text-green-400'
                : 'bg-red-900/30 text-red-400'
            }`}>
              {selectedUser.is_active ? 'ACTIVE' : 'DISABLED'}
            </span>
          </div>
        </div>

        <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
          <h3 className="text-xl font-bold text-white mb-4">
            {viewMode === 'tracking' && 'Tracking History'}
            {viewMode === 'prompts' && 'Prompt Generation History'}
            {viewMode === 'payments' && 'Payment History'}
          </h3>

          {historyLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={32} className="animate-spin text-white" />
            </div>
          ) : userHistory.length === 0 ? (
            <p className="text-gray-400 text-center py-12">No history found</p>
          ) : (
            <div className="space-y-3">
              {userHistory.map((item: any, index: number) => (
                <div key={index} className="p-4 bg-gray-800 rounded-xl border border-gray-700">
                  {viewMode === 'tracking' && (
                    <>
                      <p className="text-white font-semibold">{item.productName || 'Tracked Product'}</p>
                      <p className="text-gray-400 text-sm">ASIN: {item.asin}</p>
                      <p className="text-gray-400 text-sm">Price: ${item.currentPrice}</p>
                      <p className="text-gray-400 text-xs mt-1">
                        Added: {new Date(item.createdAt).toLocaleDateString()}
                      </p>
                    </>
                  )}
                  {viewMode === 'prompts' && (
                    <>
                      <p className="text-white font-semibold">{item.promptType || 'Generated Prompt'}</p>
                      <p className="text-gray-400 text-sm line-clamp-2">{item.prompt}</p>
                      <p className="text-gray-400 text-xs mt-1">
                        Generated: {new Date(item.createdAt).toLocaleDateString()}
                      </p>
                    </>
                  )}
                  {viewMode === 'payments' && (
                    <>
                      <p className="text-white font-semibold">${item.amount} - {item.plan}</p>
                      <p className="text-gray-400 text-sm">Status: {item.status}</p>
                      <p className="text-gray-400 text-xs mt-1">
                        Date: {new Date(item.createdAt).toLocaleDateString()}
                      </p>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <div className="relative">
          <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users by email or username..."
            className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-white transition-colors"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={32} className="animate-spin text-white" />
        </div>
      ) : users.length === 0 ? (
        <p className="text-gray-400 text-center py-12">No users found</p>
      ) : (
        <div className="space-y-4">
          {users.map((user) => (
            <div key={user._id} className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="text-white font-bold text-lg">{user.username}</h4>
                    {user.isAdmin && (
                      <span className="px-2 py-1 bg-red-900/30 text-red-400 rounded-full text-xs font-bold">ADMIN</span>
                    )}
                    {user.isPremium && (
                      <span className="px-2 py-1 bg-yellow-900/30 text-yellow-400 rounded-full text-xs font-bold">PREMIUM</span>
                    )}
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                      user.is_active
                        ? 'bg-green-900/30 text-green-400'
                        : 'bg-red-900/30 text-red-400'
                    }`}>
                      {user.is_active ? 'ACTIVE' : 'DISABLED'}
                    </span>
                  </div>
                  <p className="text-gray-400">{user.email}</p>
                  <p className="text-gray-500 text-sm mt-1">
                    Referrals: {user.referralCount} | Joined: {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => viewUserDetails(user, 'tracking')}
                    className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2"
                    title="View Tracking History"
                  >
                    <History size={16} />
                    Tracking
                  </button>
                  <button
                    onClick={() => viewUserDetails(user, 'prompts')}
                    className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2"
                    title="View Prompt History"
                  >
                    <FileText size={16} />
                    Prompts
                  </button>
                  <button
                    onClick={() => viewUserDetails(user, 'payments')}
                    className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2"
                    title="View Payment History"
                  >
                    <DollarSign size={16} />
                    Payments
                  </button>
                  <button
                    onClick={() => toggleUserAccess(user._id)}
                    className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                      user.is_active
                        ? 'bg-red-900/30 text-red-400 hover:bg-red-900/50'
                        : 'bg-green-900/30 text-green-400 hover:bg-green-900/50'
                    }`}
                    title={user.is_active ? 'Disable User' : 'Enable User'}
                  >
                    {user.is_active ? <PowerOff size={16} /> : <Power size={16} />}
                    {user.is_active ? 'Disable' : 'Enable'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
