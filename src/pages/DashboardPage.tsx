import { useState, useEffect } from 'react';
import { ExternalLink, Trash2, TrendingDown, TrendingUp, Minus, Plus, Filter, Search, Loader2,Download } from 'lucide-react';
import { TrackedProduct } from '../types/product';
import { productsAPI } from '../lib/api';

interface DashboardPageProps {
  onNavigate?: (page: string) => void;
}

interface Plugin {
  id: string;
  name: string;
  description: string;
  type: string;
  status: string;
  version: number;
  createdAt: string;
}

export default function DashboardPage({ onNavigate }: DashboardPageProps = {}) {
  const [trackedProducts, setTrackedProducts] = useState<TrackedProduct[]>([]);
  const [plugins, setPlugins] = useState<Plugin[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<TrackedProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ search: '', dateRange: 'all' });

  useEffect(() => {
    // load both in parallel, then end loading when both finished
    Promise.all([loadTrackedProducts(), loadPlugins()]).finally(() => {
      setLoading(false);
    });
  }, []);

  async function loadTrackedProducts() {
    try {
      const response = await productsAPI.getTracked();
      if (response.success && response.data.products) {
        setTrackedProducts(
          response.data.products.map((p: any) => ({
            id: p._id,
            ...p,
          })),
        );
      }
    } catch (error) {
      console.error('Failed to load tracked products:', error);
    }
  }

  async function loadPlugins() {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/prompt-engine/plugins`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('vpreme_token')}`,
          },
        },
      );
      if (response.ok) {
        const data = await response.json();
        console.log(data);

        if (data.success && data.data?.plugins) {
          setPlugins(
            data.data.plugins.map((p: any) => ({
              id: p._id,
              name: p.name,
              description: p.description,
              type: p.type,
              status: p.status,
              version: p.version,
              createdAt: p.createdAt,
            })),
          );
        }
      }
    } catch (error) {
      console.error('Failed to load plugins:', error);
    }
  }

  async function handleUntrack(productId: string, e: React.MouseEvent) {
    e.stopPropagation();
    const confirmed = window.confirm('Are you sure you want to stop tracking this product?');
    if (!confirmed) return;

    try {
      await productsAPI.untrack(productId);
      setTrackedProducts((prev) => prev.filter((p) => p.id !== productId));
    } catch (error) {
      console.error('Failed to untrack product:', error);
      alert('Failed to untrack product. Please try again.');
    }
  }

  function getPriceIcon(changePercent: number) {
    if (changePercent < -5) return <TrendingDown className="text-green-400" />;
    if (changePercent > 5) return <TrendingUp className="text-red-400" />;
    return <Minus className="text-gray-400" />;
  }

  function filterItems(items: any[], type: 'products' | 'plugins'): any[] {
    return items.filter((item) => {
      const matchesSearch =
        item.title?.toLowerCase().includes(filter.search.toLowerCase()) ||
        item.name?.toLowerCase().includes(filter.search.toLowerCase());

      const itemDate = new Date(item.createdAt || item.updatedAt);
      const now = new Date();
      const daysDiff = (now.getTime() - itemDate.getTime()) / (1000 * 3600 * 24);

      let matchesDate = true;
      if (filter.dateRange === 'week') matchesDate = daysDiff <= 7;
      if (filter.dateRange === 'month') matchesDate = daysDiff <= 30;

      return matchesSearch && matchesDate;
    });
  }

  const filteredProducts = filterItems(trackedProducts, 'products');
  const filteredPlugins = filterItems(plugins, 'plugins');

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <Loader2 className="w-10 h-10 mx-auto mb-4 animate-spin" />
            <p className="text-gray-400">Loading your dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-5xl font-bold mb-2">Dashboard</h1>
            <p className="text-xl text-gray-400">Track products & manage plugins</p>
          </div>
          <div className="text-gray-400 text-lg">
            {trackedProducts.length} products | {plugins.length} plugins
          </div>
        </div>

        {/* Filters */}
        <div className="bg-gray-900 rounded-2xl p-6 mb-8 border border-gray-800">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name..."
                value={filter.search}
                onChange={(e) => setFilter({ ...filter, search: e.target.value })}
                className="w-full pl-12 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-white focus:outline-none"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={filter.dateRange}
                onChange={(e) => setFilter({ ...filter, dateRange: e.target.value })}
                className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:border-white focus:outline-none"
              >
                <option value="all">All time</option>
                <option value="week">Last 7 days</option>
                <option value="month">Last 30 days</option>
              </select>
              <button
                onClick={() => {
                  setFilter({ search: '', dateRange: 'all' });
                  // reload data but do not toggle loading spinner again
                  loadTrackedProducts();
                  loadPlugins();
                }}
                className="px-6 py-3 bg-gray-700 text-white rounded-xl hover:bg-gray-600 transition-all flex items-center gap-2"
              >
                <Filter size={18} />
                Clear
              </button>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Left: Tracked Products */}
          <div>
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold flex items-center gap-3">📦 Tracked Products</h2>
              {trackedProducts.length === 0 && onNavigate && (
                <button
                  onClick={() => onNavigate('home')}
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center gap-2"
                >
                  <Plus size={20} />
                  Track Products
                </button>
              )}
            </div>

            {filteredProducts.length === 0 ? (
              <div className="text-center py-20 bg-gray-900 rounded-2xl border-2 border-dashed border-gray-700">
                <div className="text-6xl mb-4">📭</div>
                <h3 className="text-2xl font-bold mb-2">No Products Tracked</h3>
                <p className="text-gray-400 mb-6">Start tracking to monitor price changes</p>
                {onNavigate && (
                  <button
                    onClick={() => onNavigate('home')}
                    className="px-8 py-3 bg-white text-black rounded-xl font-bold hover:bg-gray-100 transition-all"
                  >
                    Start Tracking
                  </button>
                )}
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="bg-gray-900 rounded-xl overflow-hidden hover:shadow-xl transition-all cursor-pointer border border-gray-800 group"
                    onClick={() => setSelectedProduct(product)}
                  >
                    <div className="aspect-square bg-gray-800 flex items-center justify-center overflow-hidden">
                      <img
                        src={product.thumbnail_url}
                        alt={product.title}
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                        onError={(e) => {
                          e.currentTarget.src =
                            'https://placehold.co/400x400/1a1a1a/white?text=No+Image';
                        }}
                      />
                    </div>

                    <div className="p-6">
                      <h3 className="font-semibold mb-3 line-clamp-2 text-lg">
                        {product.title}
                      </h3>

                      <div className="flex items-center gap-3 mb-4">
                        <span className="text-3xl font-bold">${product.current_price}</span>
                        {product.price_change_percent !== 0 && (
                          <div className="flex items-center gap-2 bg-gray-800 px-3 py-1 rounded-lg">
                            {getPriceIcon(product.price_change_percent)}
                            <span
                              className={`text-sm font-semibold ${product.price_change_percent < 0
                                  ? 'text-green-400'
                                  : 'text-red-400'
                                }`}
                            >
                              {product.price_change_percent > 0 && '+'}
                              {product.price_change_percent.toFixed(1)}%
                            </span>
                          </div>
                        )}
                      </div>

                      {product.insight_text && (
                        <p className="text-sm text-gray-400 mb-6 line-clamp-2">
                          {product.insight_text}
                        </p>
                      )}

                      <div className="flex gap-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(product.affiliate_url, '_blank');
                          }}
                          className="flex-1 px-4 py-3 bg-white text-black rounded-xl font-semibold hover:bg-gray-100 transition-all flex items-center justify-center gap-2"
                        >
                          <ExternalLink size={16} />
                          View Product
                        </button>
                        <button
                          onClick={(e) => handleUntrack(product.id!, e)}
                          className="p-3 bg-gray-700 text-white rounded-xl hover:bg-gray-600 transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right: Created Plugins */}
          <div>
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold flex items-center gap-3">⚙️ Your Plugins</h2>
              {plugins.length === 0 && onNavigate && (
                <button
                  onClick={() => onNavigate('prompt-engine')}
                  className="px-6 py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition-all flex items-center gap-2"
                >
                  <Plus size={20} />
                  Create Plugin
                </button>
              )}
            </div>

            {filteredPlugins.length === 0 ? (
              <div className="text-center py-20 bg-gray-900 rounded-2xl border-2 border-dashed border-gray-700">
                <div className="text-6xl mb-4">🔧</div>
                <h3 className="text-2xl font-bold mb-2">No Plugins Created</h3>
                <p className="text-gray-400 mb-6">
                  Use Prompt Engine to create your first plugin
                </p>
                {onNavigate && (
                  <button
                    onClick={() => onNavigate('prompt-engine')}
                    className="px-8 py-3 bg-white text-black rounded-xl font-bold hover:bg-gray-100 transition-all"
                  >
                    Create Plugin
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredPlugins.map((plugin) => (
                  <div
                    key={plugin.id}
                    className="bg-gray-900 rounded-xl p-6 border border-gray-800 hover:border-gray-600 transition-all group"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="font-bold text-xl line-clamp-1 flex-1 pr-4">
                        {plugin.name}
                      </h3>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${plugin.status === 'active'
                            ? 'bg-green-900/50 text-green-400 border border-green-500/30'
                            : 'bg-yellow-900/50 text-yellow-400 border border-yellow-500/30'
                          }`}
                      >
                        {plugin.status}
                      </span>
                    </div>

                    <p className="text-gray-400 mb-4 line-clamp-2">
                      {plugin.description}
                    </p>

                    <div className="flex items-center gap-4 mb-4 text-sm">
                      <span className="px-3 py-1 bg-gray-800 rounded-lg border border-gray-700">
                        {plugin.type}
                      </span>
                      <span className="text-gray-500">v{plugin.version}</span>
                      <span className="text-gray-500">
                        {new Date(plugin.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-gray-800">
                      <div className="flex gap-3 pt-4 border-t border-gray-800">
                        <button
                          className="flex-1 px-4 py-2 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-xl hover:from-green-700 hover:to-blue-700 transition-all font-medium flex items-center gap-2 justify-center"
                          onClick={async (e) => {
                            e.stopPropagation();
                            try {
                              const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/prompt-engine/plugins/${plugin.id}/download`, {
                                headers: {
                                  'Authorization': `Bearer ${localStorage.getItem('vpreme_token')}`,
                                },
                              });
                              if (response.ok) {
                                const blob = await response.blob();
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = `${plugin.name}.zip`;
                                document.body.appendChild(a);
                                a.click();
                                document.body.removeChild(a);
                                URL.revokeObjectURL(url);
                              }
                            } catch (error) {
                              console.error('Download failed:', error);
                              alert('Download failed. Please try again.');
                            }
                          }}
                        >
                          <Download size={18} />
                          Download
                        </button>
                      </div>

                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
