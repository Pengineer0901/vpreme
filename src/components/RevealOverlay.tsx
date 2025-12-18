import { X, ExternalLink } from 'lucide-react';
import { TrackedProduct } from '../types/product';

interface RevealOverlayProps {
  product: TrackedProduct | null;
  onClose: () => void;
  onTrack: (product: TrackedProduct) => void;
  isTracked: boolean;
  onNavigate?: (page: string) => void;
}

export default function RevealOverlay({ product, onClose, onTrack, isTracked, onNavigate }: RevealOverlayProps) {
  if (!product) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-gray-900 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scaleIn border border-gray-800">
        <div className="sticky top-0 bg-gray-900 border-b border-gray-700 px-6 py-4 flex justify-between items-center rounded-t-3xl">
          <h2 className="text-xl font-bold text-white">Product Details</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-full transition-colors text-white"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex flex-col md:flex-row gap-6">
            <img
              src={product.thumbnail_url}
              alt={product.title}
              className="w-full md:w-64 h-64 object-cover rounded-2xl"
            />
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-white mb-4">{product.title}</h3>
              <div className="space-y-4">
                <div>
                  <span className="text-4xl font-bold text-white">
                    ${product.current_price.toFixed(2)}
                  </span>
                  {product.price_change_percent !== 0 && (
                    <span className="ml-3 text-lg font-medium text-gray-300">
                      {product.price_change_percent > 0 ? '+' : ''}
                      {product.price_change_percent}%
                    </span>
                  )}
                </div>

                {product.insight_text && (
                  <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                    <p className="text-sm font-medium text-white">{product.insight_text}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            {!isTracked && (
              <button
                onClick={() => {
                  onTrack(product);
                  onClose();
                }}
                className="flex-1 bg-white text-black px-6 py-3 rounded-xl font-bold hover:bg-gray-100 transition-all duration-300 hover:shadow-lg"
              >
                Track this product (Free)
              </button>
            )}
            {isTracked && (
              <div className="flex-1 bg-gray-700 text-white px-6 py-3 rounded-xl font-medium text-center border border-gray-600">
                Already Tracking
              </div>
            )}
            <a
              href={product.affiliate_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-white text-black px-6 py-3 rounded-xl font-bold hover:bg-gray-100 transition-all duration-300 flex items-center justify-center gap-2"
            >
              View on Amazon
              <ExternalLink size={18} />
            </a>
          </div>

          <button
            onClick={() => {
              onNavigate?.('premium');
              onClose();
            }}
            className="w-full bg-gray-800 hover:bg-gray-700 rounded-xl p-4 text-center transition-colors cursor-pointer border border-gray-700"
          >
            <p className="text-sm text-gray-300 font-medium">
              Unlock price-drop predictions & daily alerts → Try Premium
            </p>
          </button>
        </div>
      </div>
    </div>
  );
}
