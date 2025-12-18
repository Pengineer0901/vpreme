import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Bot, User, History, Trash2, Download, RefreshCw, Clock, MessageSquare, Code, CheckCircle, Package, DownloadCloud, Plus } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  plugin?: {
    id: string;
    name: string;
    description: string;
    type: string;
    status: string;
  };
  download?: {
    filename: string;
    base64: string;
    mimeType: string;
  };
}

interface PromptHistory {
  _id: string;
  sessionId: string;
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
    pluginId?: string;
  }>;
  createdAt: string;
  intent?: string;
}

interface Plugin {
  id: string;
  name: string;
  description: string;
  type: string;
  status: string;
  version: number;
}

export default function PromptEnginePage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Welcome to the VPREME Prompt Engine! Ask me anything or describe what you want to create. Your conversation history will be automatically saved.',
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [historyList, setHistoryList] = useState<PromptHistory[]>([]);
  const [plugins, setPlugins] = useState<Plugin[]>([]);
  const [showHistory, setShowHistory] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string>(localStorage.getItem('prompt_session_id') || `session_${Date.now()}`);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // ✅ NEW CHAT - Creates new session
  const handleNewChat = () => {
    if (confirm('Start a new chat? Current conversation will be saved to history.')) {
      const newSessionId = `session_${Date.now()}`;
      setCurrentSessionId(newSessionId);
      localStorage.setItem('prompt_session_id', newSessionId);
      setMessages([
        {
          id: '1',
          role: 'assistant',
          content: 'New chat started! What would you like to create?',
          timestamp: new Date(),
        }
      ]);
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    loadHistory();
    loadPlugins();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadHistory = async () => {
    setLoadingHistory(true);
    try {
      // ✅ FIXED: Remove sessionId filter to show ALL sessions
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/prompt-engine/history?limit=50`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('vpreme_token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data?.history) {
          setHistoryList(data.data.history); // ✅ Shows ALL sessions
        }
      }
    } catch (error) {
      console.error('Failed to load history:', error);
    } finally {
      setLoadingHistory(false);
    }
  };


  const loadPlugins = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/prompt-engine/plugins`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('vpreme_token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data?.plugins) {
          setPlugins(data.data.plugins.map((p: any) => ({
            id: p._id,
            name: p.name,
            description: p.description,
            type: p.type,
            status: p.status,
            version: p.version
          })));
        }
      }
    } catch (error) {
      console.error('Failed to load plugins:', error);
    }
  };

  const handleDownloadPlugin = (download: Message['download']) => {
    if (!download?.base64) return;

    const byteCharacters = atob(download.base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: download.mimeType });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = download.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    const promptText = input;
    setInput('');
    setLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/prompt-engine/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('vpreme_token')}`,
        },
        body: JSON.stringify({
          prompt: promptText,
          sessionId: currentSessionId // ✅ Send current session
        }),
      });

      const data = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.message || 'I understand your request. How else can I help you?',
        timestamp: new Date(),
        plugin: data.plugin ? {
          id: data.plugin.id,
          name: data.plugin.name,
          description: data.plugin.description,
          type: data.plugin.type,
          status: data.plugin.status,
        } : undefined,
        download: data.download ? {
          filename: data.download.filename,
          base64: data.download.base64,
          mimeType: data.download.mimeType,
        } : undefined
      };

      setMessages(prev => [...prev, assistantMessage]);
      await loadHistory();
      await loadPlugins();
    } catch (error) {
      console.error('Prompt execution error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error processing your request. Please try again.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    if (confirm('Clear current chat? (History preserved)')) {
      setMessages([
        {
          id: '1',
          role: 'assistant',
          content: 'Chat cleared. Continue this session or start new.',
          timestamp: new Date(),
        }
      ]);
    }
  };

  const handleDeleteHistory = async (historyId: string) => {
    if (!confirm('Delete this entire conversation from history?')) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/prompt-engine/history/${historyId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('vpreme_token')}`,
        },
      });

      if (response.ok) {
        setHistoryList(prev => prev.filter(h => h._id !== historyId));
      }
    } catch (error) {
      console.error('Failed to delete history:', error);
      alert('Failed to delete history item');
    }
  };

  const handleLoadFromHistory = (history: PromptHistory) => {
    const historyMessages: Message[] = [
      {
        id: '1',
        role: 'assistant',
        content: `Loaded conversation "${history._id.slice(-6)}" (${history.messages.length} messages)`,
        timestamp: new Date(),
      },
      ...history.messages.map((msg, index) => ({
        id: `${index}_${Date.now()}`,
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
        timestamp: new Date(msg.timestamp),
        plugin: msg.pluginId ? { id: '', name: 'Plugin', description: '', type: '', status: 'draft' } : undefined
      }))
    ];
    setMessages(historyMessages);
    scrollToBottom();
  };

  const handleExportChat = () => {
    const chatData = JSON.stringify(messages, null, 2);
    const blob = new Blob([chatData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vpreme-chat-${currentSessionId}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Prompt Engine</h1>
            <p className="text-gray-400">AI-powered assistant with session-based history</p>
            <p className="text-sm text-gray-500 mt-1">
              {plugins.length} plugins | Session: {currentSessionId.slice(-8)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleNewChat}
              className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors border border-green-500 flex items-center gap-2"
            >
              <Plus size={18} />
              New Chat
            </button>
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="px-4 py-2 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors border border-gray-700 flex items-center gap-2"
            >
              <History size={18} />
              History ({historyList.length})
            </button>
            <button
              onClick={loadHistory}
              disabled={loadingHistory}
              className="px-4 py-2 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors border border-gray-700 flex items-center gap-2 disabled:opacity-50"
            >
              <RefreshCw size={18} className={loadingHistory ? 'animate-spin' : ''} />
            </button>
            <button
              onClick={handleExportChat}
              className="px-4 py-2 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors border border-gray-700 flex items-center gap-2"
            >
              <Download size={18} />
            </button>
            <button
              onClick={handleClearChat}
              className="px-4 py-2 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors border border-gray-700 flex items-center gap-2"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>

        {/* Rest of JSX unchanged - messages, input, history panel */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className={`${showHistory ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
            <div className="bg-gray-900 rounded-2xl shadow-xl border border-gray-800 flex flex-col h-[calc(100vh-250px)]">
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {message.role === 'assistant' && (
                      <div className="flex-shrink-0 w-8 h-8 bg-white rounded-full flex items-center justify-center">
                        <Bot size={20} className="text-black" />
                      </div>
                    )}
                    <div className="max-w-[80%]">
                      <div
                        className={`rounded-2xl px-4 py-3 ${message.role === 'user'
                            ? 'bg-white text-black'
                            : 'bg-gray-800 text-white border border-gray-700'
                          }`}
                      >
                        <p className="whitespace-pre-wrap">{message.content}</p>
                        <p className="text-xs opacity-50 mt-2">
                          {formatDate(message.timestamp)}
                        </p>
                      </div>

                      {message.plugin && (
                        <div className="mt-2 p-4 bg-gradient-to-br from-green-900/30 to-blue-900/30 border border-green-500/30 rounded-xl">
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                              <CheckCircle size={24} className="text-green-400" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Package size={16} className="text-green-400" />
                                <h4 className="font-bold text-white">Plugin Generated</h4>
                              </div>
                              <p className="text-sm text-gray-300 mb-2">
                                <span className="font-semibold">{message.plugin.name}</span>
                              </p>
                              <p className="text-xs text-gray-400 mb-3">{message.plugin.description}</p>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="px-2 py-1 bg-gray-800 text-xs rounded-lg border border-gray-700 flex items-center gap-1">
                                  <Code size={12} />
                                  {message.plugin.type}
                                </span>
                                <span className={`px-2 py-1 text-xs rounded-lg ${message.plugin.status === 'active'
                                    ? 'bg-green-900/30 text-green-400 border border-green-500/30'
                                    : 'bg-yellow-900/30 text-yellow-400 border border-yellow-500/30'
                                  }`}>
                                  {message.plugin.status}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {message.download && (
                        <div className="mt-3">
                          <button
                            onClick={() => handleDownloadPlugin(message.download!)}
                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                          >
                            <DownloadCloud size={18} />
                            Download {message.download.filename}
                          </button>
                        </div>
                      )}
                    </div>
                    {message.role === 'user' && (
                      <div className="flex-shrink-0 w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center border border-gray-700">
                        <User size={20} className="text-white" />
                      </div>
                    )}
                  </div>
                ))}
                {loading && (
                  <div className="flex gap-3 justify-start">
                    <div className="flex-shrink-0 w-8 h-8 bg-white rounded-full flex items-center justify-center">
                      <Bot size={20} className="text-black" />
                    </div>
                    <div className="bg-gray-800 text-white rounded-2xl px-4 py-3 border border-gray-700">
                      <Loader2 size={20} className="animate-spin" />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="border-t border-gray-800 p-4">
                <form onSubmit={handleSubmit} className="flex gap-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask anything or describe what you want to create..."
                    disabled={loading}
                    className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-700 bg-gray-800 text-white placeholder-gray-500 focus:border-white focus:outline-none transition-colors disabled:bg-gray-700 disabled:cursor-not-allowed"
                  />
                  <button
                    type="submit"
                    disabled={loading || !input.trim()}
                    className="px-6 py-3 bg-white text-black rounded-xl font-bold hover:bg-gray-100 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {loading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                  </button>
                </form>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  All messages saved to Session: {currentSessionId.slice(-8)} | <button onClick={handleNewChat} className="text-blue-400 hover:text-blue-300 underline">New Chat</button>
                </p>
              </div>
            </div>
          </div>

          {showHistory && (
            <div className="lg:col-span-1">
              <div className="bg-gray-900 rounded-2xl shadow-xl border border-gray-800 p-6 h-[calc(100vh-250px)] overflow-y-auto">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <History size={20} />
                  Chat Sessions ({historyList.length})
                </h2>

                {loadingHistory ? (
                  <div className="text-center py-8">
                    <Loader2 size={32} className="mx-auto text-gray-600 mb-3 animate-spin" />
                    <p className="text-gray-400 text-sm">Loading sessions...</p>
                  </div>
                ) : historyList.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageSquare size={48} className="mx-auto text-gray-600 mb-3" />
                    <p className="text-gray-400 text-sm">No chat sessions yet</p>
                    <p className="text-gray-500 text-xs mt-1">Start chatting to create sessions</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {historyList.map((history) => (
                      <div
                        key={history._id}
                        className="p-4 rounded-xl border border-gray-700 bg-gray-800 hover:border-gray-600 transition-all cursor-pointer group"
                        onClick={() => handleLoadFromHistory(history)}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Clock size={12} />
                            <span>{formatDate(history.createdAt)}</span>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteHistory(history._id);
                            }}
                            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-900/30 rounded transition-all"
                          >
                            <Trash2 size={14} className="text-red-400" />
                          </button>
                        </div>

                        <div className="mb-2">
                          <p className="text-xs text-gray-500 mb-1">Session ID:</p>
                          <p className="text-sm text-white font-mono text-xs bg-gray-900 px-2 py-1 rounded">{history.sessionId.slice(-12)}</p>
                        </div>

                        <div className="mb-2">
                          <p className="text-xs text-gray-500 mb-1">Messages:</p>
                          <p className="text-sm text-white font-semibold">{history.messages.length}</p>
                        </div>

                        <div className="text-xs text-gray-400">
                          First: {history.messages[0]?.content.slice(0, 50)}...
                        </div>

                        <div className="mt-2 pt-2 border-t border-gray-700 text-xs text-gray-500 flex items-center gap-1">
                          <MessageSquare size={10} />
                          Click to load entire session
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
