import { useState, useEffect } from 'react';
import { Search, ShoppingCart, Star, AlertCircle, ExternalLink } from 'lucide-react';

interface Product {
  id: string;
  asin: string;
  title: string;
  price: number;
  originalPrice?: number;
  currency: string;
  rating: number;
  reviewCount: number;
  image: string;
  category: string;
  inStock: boolean;
  prime: boolean;
  description: string;
  features: string[];
  simulated: boolean;
}

export default function AmazonChatbotPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [simulationMode, setSimulationMode] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const [statusRes, categoriesRes, productsRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/amazon/status`),
        fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/amazon/categories`),
        fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/amazon/search`)
      ]);

      const statusData = await statusRes.json();
      const categoriesData = await categoriesRes.json();
      const productsData = await productsRes.json();

      if (statusData.success) {
        setSimulationMode(statusData.data.simulationMode);
      }

      if (categoriesData.success) {
        setCategories(categoriesData.data.categories);
      }

      if (productsData.success) {
        setProducts(productsData.data.products);
      }
    } catch (error) {
      console.error('Load initial data error:', error);
    }
  };

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);

    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('query', searchQuery);
      if (selectedCategory) params.append('category', selectedCategory);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/amazon/search?${params}`
      );
      const data = await response.json();

      if (data.success) {
        setProducts(data.data.products);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <ShoppingCart size={36} />
            Amazon Product Search
          </h1>
          <p className="text-gray-400">Search and browse Amazon products</p>
        </div>

        {simulationMode && (
          <div className="bg-blue-900/20 border border-blue-800 rounded-2xl p-4 mb-6 flex items-start gap-3">
            <AlertCircle size={24} className="text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-blue-400 font-bold mb-1">Simulation Mode Active</h3>
              <p className="text-blue-300 text-sm">
                Currently displaying simulated Amazon product data. To use live Amazon data, add your
                Amazon API credentials to the environment configuration.
              </p>
            </div>
          </div>
        )}

        <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800 mb-6">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex gap-3">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for products..."
                className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-700 bg-gray-800 text-white placeholder-gray-500 focus:border-white focus:outline-none transition-colors"
              />
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-white text-black rounded-xl font-bold hover:bg-gray-100 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Search size={20} />
                Search
              </button>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2">
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('');
                  handleSearch();
                }}
                className={`px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === ''
                    ? 'bg-white text-black'
                    : 'bg-gray-800 text-white hover:bg-gray-700 border border-gray-700'
                }`}
              >
                All Categories
              </button>
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => {
                    setSelectedCategory(category);
                    handleSearch();
                  }}
                  className={`px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-colors ${
                    selectedCategory === category
                      ? 'bg-white text-black'
                      : 'bg-gray-800 text-white hover:bg-gray-700 border border-gray-700'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </form>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
            <p className="text-white mt-4">Searching products...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12 bg-gray-900 rounded-2xl border border-gray-800">
            <Search size={48} className="mx-auto text-gray-600 mb-3" />
            <p className="text-gray-400">No products found. Try a different search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-gray-900 rounded-2xl overflow-hidden border border-gray-800 hover:border-gray-700 transition-all group"
              >
                <div className="relative aspect-square overflow-hidden bg-gray-800">
                  <img
                    src={product.image}
                    alt={product.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {product.prime && (
                    <div className="absolute top-3 right-3 bg-blue-600 text-white px-2 py-1 rounded text-xs font-bold">
                      Prime
                    </div>
                  )}
                  {product.originalPrice && (
                    <div className="absolute top-3 left-3 bg-red-600 text-white px-2 py-1 rounded text-xs font-bold">
                      {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <h3 className="text-white font-bold mb-2 line-clamp-2 h-12">{product.title}</h3>

                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex items-center gap-1">
                      <Star size={16} className="text-yellow-400 fill-yellow-400" />
                      <span className="text-white font-bold">{product.rating}</span>
                    </div>
                    <span className="text-gray-400 text-sm">({product.reviewCount.toLocaleString()})</span>
                  </div>

                  <div className="mb-3">
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-white">
                        ${product.price.toFixed(2)}
                      </span>
                      {product.originalPrice && (
                        <span className="text-gray-500 line-through text-sm">
                          ${product.originalPrice.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-gray-400">{product.category}</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      product.inStock
                        ? 'bg-green-900/30 text-green-400'
                        : 'bg-red-900/30 text-red-400'
                    }`}>
                      {product.inStock ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </div>

                  <button
                    className="w-full px-4 py-3 bg-white text-black rounded-xl font-bold hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
                  >
                    <ExternalLink size={18} />
                    View Product
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
