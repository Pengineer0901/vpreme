import { useEffect, useState, useRef, useCallback } from 'react';
import { Bell, TrendingDown, TrendingUp, Minus, RefreshCw } from 'lucide-react';
import { productsAPI } from '../lib/api';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import toast from 'react-hot-toast';

interface AlertProduct {
  id: string;
  asin: string;
  title: string;
  current_price: number;
  price_change_percent: number;
  insight_text?: string;
  affiliate_url: string;
  thumbnail_url?: string;
  price_history: { price: number; timestamp: string | Date }[];
  last_updated?: string;
}

interface AlertsPageProps {
  onNavigate?: (page: string) => void;
}

function getPriceIcon(changePercent: number) {
  if (changePercent < -5) return <TrendingDown className="text-green-400" />;
  if (changePercent > 5) return <TrendingUp className="text-red-400" />;
  return <Minus className="text-gray-400" />;
}

export default function AlertsPage({ onNavigate }: AlertsPageProps = {}) {
  const [products, setProducts] = useState<AlertProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Track price changes for visual alerts
  const prevPricesRef = useRef<Map<string, number>>(new Map());
  const changedProductsRef = useRef<Set<string>>(new Set());

  const loadAlerts = useCallback(async () => {
    try {
      setRefreshing(true);
      const res = await productsAPI.getAlerts();

      if (res.success && res.data.products) {
        const nextProducts: AlertProduct[] = res.data.products.map((p: any) => ({
          id: p.id || p._id,
          asin: p.asin,
          title: p.title,
          current_price: p.current_price,
          price_change_percent: p.price_change_percent,
          insight_text: p.insight_text,
          affiliate_url: p.affiliate_url,
          thumbnail_url: p.thumbnail_url,
          price_history: p.price_history || [],
          last_updated: p.last_updated,
        }
      ));

        // Detect price changes
        const prevPrices = prevPricesRef.current;
        
        const changedProducts = new Set<string>();
        let newAlertsCount = 0;

        nextProducts.forEach(product => {
          const prevPrice = prevPrices.get(product.id);       

          toast.success(
            `${product.title.slice(0, 30)}... ${getPriceIcon(product.price_change_percent)}${product.price_change_percent.toFixed(1)}%`,
            { duration: 4000 }
          );
          if (prevPrice && Math.abs(prevPrice - product.current_price) > 0.01) {
            changedProducts.add(product.id);
            newAlertsCount++;

            // Show toast notification
            toast.success(
              `${product.title.slice(0, 30)}... ${getPriceIcon(product.price_change_percent)}${product.price_change_percent.toFixed(1)}%`,
              { duration: 4000 }
            );
          }
        });

        // Update refs
        const newPricesMap = new Map();
        nextProducts.forEach(p => newPricesMap.set(p.id, p.current_price));
        prevPricesRef.current = newPricesMap;
        changedProductsRef.current = changedProducts;

        setProducts(nextProducts);

        if (newAlertsCount > 0) {
          toast.error(`${newAlertsCount} price update${newAlertsCount > 1 ? 's' : ''}!`, {
            duration: 3000
          });
        }
      } else {
        setProducts([]);
        prevPricesRef.current.clear();
        changedProductsRef.current.clear();
      }
    } catch (err) {
      console.error('Failed to load alerts', err);
      toast.error('Failed to load price alerts');
      setProducts([]);
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  }, []);

  // Initial load + polling every 30 seconds
  useEffect(() => {
    loadAlerts();
    const interval = setInterval(loadAlerts, 30000); // 30 seconds
    return () => clearInterval(interval);
  }, [loadAlerts]);

  // Manual refresh handler
  const handleRefresh = () => {
    loadAlerts();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white py-12 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="text-4xl mb-4 animate-spin">⏳</div>
          <p className="text-gray-400">Loading your price alerts...</p>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="min-h-screen bg-black text-white py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 flex items-center gap-2">
            <Bell size={32} /> Price Alerts
          </h1>
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔔</div>
            <h2 className="text-2xl font-bold mb-4">No Alerts Yet</h2>
            <p className="text-gray-400 mb-8">
              Track some products and you'll see price alerts and graphs here.
            </p>
            {onNavigate && (
              <button
                onClick={() => onNavigate('home')}
                className="px-6 py-3 bg-white text-black rounded-xl font-bold hover:bg-gray-100 transition-all"
              >
                Start Tracking
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold flex items-center gap-2">
            <Bell size={32} /> Price Alerts
          </h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 text-sm text-gray-400">
              {products.length} {products.length === 1 ? 'product' : 'products'}
              <RefreshCw
                size={16}
                className={`ml-1 ${refreshing ? 'animate-spin' : 'cursor-pointer hover:text-white'}`}
                onClick={handleRefresh}
              />
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => {
            const isChanged = changedProductsRef.current.has(product.id);

            return (
              <div
                key={product.id}
                className={`group bg-gray-900 rounded-xl border p-6 flex flex-col gap-4 transition-all duration-300 hover:shadow-2xl hover:border-gray-600 ${isChanged
                  ? 'border-green-400 shadow-[0_0_20px_rgba(74,222,128,0.3)] animate-pulse-once'
                  : 'border-gray-800'
                  }`}
              >
                {/* Product header */}
                <div className="flex gap-4">
                  <div className="w-20 h-20 bg-gray-800 rounded-lg overflow-hidden flex-shrink-0">
                    {product.thumbnail_url ? (
                      <img
                        src={product.thumbnail_url}
                        alt={product.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = 'https://placehold.co/80x80/1a1a1a/white?text=?';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                        <span className="text-xs text-gray-500">No img</span>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-lg line-clamp-2 mb-2 group-hover:text-white/90">
                      {product.title}
                    </h3>

                    {isChanged && (
                      <div className="flex items-center gap-1 mb-2">
                        <div className="px-2 py-1 bg-green-500/20 text-green-400 text-xs font-bold rounded-full border border-green-500/40">
                          NEW PRICE!
                        </div>
                      </div>
                    )}

                    <div className="flex items-baseline gap-2 mb-2">
                      <span className="text-2xl font-black text-white">
                        ${product.current_price.toFixed(2)}
                      </span>
                      <div className="flex items-center gap-1 text-sm">
                        {getPriceIcon(product.price_change_percent)}
                        <span
                          className={`font-medium ${product.price_change_percent < 0
                            ? 'text-green-400'
                            : product.price_change_percent > 0
                              ? 'text-red-400'
                              : 'text-gray-400'
                            }`}
                        >
                          {product.price_change_percent > 0 && '+'}
                          {product.price_change_percent.toFixed(1)}%
                        </span>
                      </div>
                    </div>

                    {product.insight_text && (
                      <p className="text-xs text-gray-400 line-clamp-2">
                        {product.insight_text}
                      </p>
                    )}
                  </div>
                </div>

                {/* Price Chart */}
                <div className="flex-1 min-h-[120px]">
                  {product.price_history && product.price_history.length > 1 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={product.price_history.slice(-10)}>
                        <defs>
                          <linearGradient id={`gradient-${product.id}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={isChanged ? "#22c55e" : "#4ade80"} stopOpacity={0.8} />
                            <stop offset="100%" stopColor={isChanged ? "#22c55e" : "#4ade80"} stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <XAxis
                          dataKey="timestamp"
                          hide
                          tickFormatter={(value) => new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        />
                        <YAxis
                          domain={['dataMin', 'dataMax']}
                          tick={{ fill: '#9ca3af', fontSize: 10 }}
                          width={30}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#111827',
                            border: '1px solid #374151',
                            borderRadius: '8px',
                          }}
                          labelStyle={{ color: '#9ca3af' }}
                        />
                        <Line
                          type="monotone"
                          dataKey="price"
                          stroke={isChanged ? "#22c55e" : "#4ade80"}
                          strokeWidth={3}
                          dot={false}
                          strokeLinecap="round"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center bg-gray-800 rounded-lg text-gray-500 text-xs">
                      Gathering price history...
                    </div>
                  )}
                </div>

                {/* Action button */}
                <div className="pt-2">
                  <a
                    href={product.affiliate_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full bg-white text-black px-4 py-3 rounded-xl font-bold text-center hover:bg-gray-100 transition-all text-sm shadow-lg hover:shadow-xl"
                  >
                    View on Amazon →
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
