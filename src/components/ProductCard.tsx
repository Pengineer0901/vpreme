import { TrendingDown, TrendingUp, Minus, Flame } from 'lucide-react';
import { TrackedProduct } from '../types/product';

interface ProductCardProps {
  product: TrackedProduct;
  onClick: () => void;
  compact?: boolean;
  showTrendingBadge?: boolean;
}

export default function ProductCard({ product, onClick, compact = false, showTrendingBadge = false }: ProductCardProps) {
  const getBadgeColor = () => {
    if (product.price_change_percent < 0) return 'text-gray-300 bg-gray-700 border border-gray-600';
    if (product.price_change_percent > 0) return 'text-gray-300 bg-gray-700 border border-gray-600';
    return 'text-gray-300 bg-gray-800 border border-gray-700';
  };

  const getBadgeIcon = () => {
    if (product.price_change_percent < 0) return <TrendingDown size={16} />;
    if (product.price_change_percent > 0) return <TrendingUp size={16} />;
    return <Minus size={16} />;
  };

  if (compact) {
    return (
      <div
        onClick={onClick}
        className="bg-gray-900 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 p-4 cursor-pointer hover:-translate-y-1 border border-gray-800"
      >
        <div className="flex gap-4">
          <img
            src={product.thumbnail_url}
            alt={product.title}
            className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-white line-clamp-2 mb-2">
              {product.title}
            </h3>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg font-bold text-white">
                ${product.current_price.toFixed(2)}
              </span>
              {product.price_change_percent !== 0 && (
                <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getBadgeColor()}`}>
                  {getBadgeIcon()}
                  {Math.abs(product.price_change_percent)}%
                </span>
              )}
            </div>
            {product.insight_text && (
              <p className="text-xs text-gray-300 line-clamp-1">{product.insight_text}</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className="bg-gray-900 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer hover:-translate-y-2 w-full max-w-sm mx-auto border border-gray-800"
    >
      <div className="relative">
        {showTrendingBadge && (
          <div className="absolute top-4 left-4 flex items-center gap-1 bg-gray-700 text-white px-3 py-2 rounded-full text-sm font-bold shadow-lg animate-pulse border border-gray-600 z-10">
            <Flame size={16} />
            Trending Deal
          </div>
        )}
        {product.price_change_percent !== 0 && (
          <div className={`absolute top-4 right-4 flex items-center gap-1 px-3 py-2 rounded-full text-sm font-medium shadow-lg z-10 ${getBadgeColor()}`}>
            {getBadgeIcon()}
            {Math.abs(product.price_change_percent)}%
          </div>
        )}

        {/* Price and Savings Banner at Top */}
        <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/90 to-transparent p-4 z-20">
          <div className="text-white">
            <div className="text-3xl font-bold mb-1">
              ${product.current_price.toFixed(2)}
            </div>
            {product.price_change_percent < 0 && (
              <div className="text-lg font-semibold">
                Save ${Math.abs((product.current_price * product.price_change_percent / 100) / (1 + product.price_change_percent / 100)).toFixed(2)}
              </div>
            )}
          </div>
        </div>

        <img
          src={product.thumbnail_url}
          alt={product.title}
          className="w-full h-64 object-cover"
        />
      </div>
      <div className="p-6">
        <h3 className="text-lg font-semibold text-white mb-3 line-clamp-2 min-h-[3.5rem]">
          {product.title}
        </h3>
        {product.insight_text && (
          <p className="text-sm text-gray-300 line-clamp-2">{product.insight_text}</p>
        )}
      </div>
    </div>
  );
}
