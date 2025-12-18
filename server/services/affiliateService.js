import dotenv from 'dotenv';
import { getMarketplace, DEFAULT_MARKETPLACE } from '../config/marketplaces.js';

dotenv.config();

const AFFILIATE_API_KEY = process.env.AFFILIATE_API_KEY;
const AFFILIATE_API_URL = process.env.AFFILIATE_API_URL || 'https://api.affiliate.com/v1';

class AffiliateService {
  constructor() {
    this.apiKey = AFFILIATE_API_KEY;
    this.baseUrl = AFFILIATE_API_URL;
  }

  async makeRequest(endpoint, params = {}) {
    if (!this.apiKey) {
      throw new Error('Affiliate.com API key not configured');
    }

    const queryString = new URLSearchParams({
      ...params,
      api_key: this.apiKey,
    }).toString();

    const url = `${this.baseUrl}${endpoint}?${queryString}`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'VPREME/1.0',
        },
      });

      if (!response.ok) {
        throw new Error(`Affiliate.com API error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Affiliate.com API request failed:', error);
      throw error;
    }
  }

  async searchProducts(query, options = {}) {
    const {
      marketplace = DEFAULT_MARKETPLACE,
      category = null,
      minPrice = null,
      maxPrice = null,
      limit = 20,
      offset = 0,
      sortBy = 'relevance',
    } = options;

    const marketplaceConfig = getMarketplace(marketplace);

    const params = {
      q: query,
      marketplace: marketplaceConfig.code,
      currency: marketplaceConfig.currency,
      language: marketplaceConfig.language,
      limit,
      offset,
      sort: sortBy,
    };

    if (category) params.category = category;
    if (minPrice) params.min_price = minPrice;
    if (maxPrice) params.max_price = maxPrice;

    try {
      const data = await this.makeRequest('/products/search', params);
      return this.transformProducts(data, marketplaceConfig);
    } catch (error) {
      console.error('Product search failed:', error);
      return this.getFallbackProducts(marketplace);
    }
  }

  async getProductByASIN(asin, marketplace = DEFAULT_MARKETPLACE) {
    const marketplaceConfig = getMarketplace(marketplace);

    const params = {
      asin,
      marketplace: marketplaceConfig.code,
      currency: marketplaceConfig.currency,
      language: marketplaceConfig.language,
    };

    try {
      const data = await this.makeRequest('/products/details', params);
      return this.transformProduct(data.product, marketplaceConfig);
    } catch (error) {
      console.error('Product fetch failed:', error);
      return null;
    }
  }

  async getFeaturedProducts(marketplace = DEFAULT_MARKETPLACE, limit = 12) {
    const marketplaceConfig = getMarketplace(marketplace);

    const params = {
      marketplace: marketplaceConfig.code,
      currency: marketplaceConfig.currency,
      language: marketplaceConfig.language,
      limit,
      featured: true,
    };

    try {
      const data = await this.makeRequest('/products/featured', params);
      return this.transformProducts(data, marketplaceConfig);
    } catch (error) {
      console.error('Featured products fetch failed:', error);
      return this.getFallbackProducts(marketplace);
    }
  }

  async trackPriceChanges(asin, marketplace = DEFAULT_MARKETPLACE) {
    const marketplaceConfig = getMarketplace(marketplace);

    const params = {
      asin,
      marketplace: marketplaceConfig.code,
    };

    try {
      const data = await this.makeRequest('/products/price-history', params);
      return data.history || [];
    } catch (error) {
      console.error('Price history fetch failed:', error);
      return [];
    }
  }

  transformProduct(apiProduct, marketplaceConfig) {
    if (!apiProduct) return null;

    return {
      asin: apiProduct.asin || apiProduct.id,
      title: apiProduct.title || apiProduct.name,
      currentPrice: parseFloat(apiProduct.current_price || apiProduct.price || 0),
      originalPrice: parseFloat(apiProduct.original_price || apiProduct.list_price || 0),
      image: apiProduct.image_url || apiProduct.image || apiProduct.thumbnail,
      url: apiProduct.affiliate_url || apiProduct.url,
      category: apiProduct.category || 'General',
      rating: parseFloat(apiProduct.rating || 0),
      reviewCount: parseInt(apiProduct.review_count || apiProduct.reviews || 0),
      inStock: apiProduct.in_stock !== false && apiProduct.availability !== 'out_of_stock',
      marketplace: marketplaceConfig.code,
      currency: marketplaceConfig.currency,
      currencySymbol: marketplaceConfig.currencySymbol,
      description: apiProduct.description || '',
      brand: apiProduct.brand || '',
      features: apiProduct.features || [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  transformProducts(apiResponse, marketplaceConfig) {
    if (!apiResponse || !apiResponse.products) {
      return [];
    }

    return apiResponse.products
      .map(product => this.transformProduct(product, marketplaceConfig))
      .filter(product => product !== null);
  }

  getFallbackProducts(marketplace = DEFAULT_MARKETPLACE) {
    const marketplaceConfig = getMarketplace(marketplace);

    const fallbackProducts = [
      {
        asin: `${marketplace}-PROD-001`,
        title: 'Premium Wireless Headphones',
        currentPrice: 199.99,
        originalPrice: 249.99,
        image: 'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg',
        url: `https://${marketplaceConfig.amazonDomain}/dp/${marketplace}-PROD-001`,
        category: 'Electronics',
        rating: 4.7,
        reviewCount: 15230,
        inStock: true,
        marketplace: marketplaceConfig.code,
        currency: marketplaceConfig.currency,
        currencySymbol: marketplaceConfig.currencySymbol,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        asin: `${marketplace}-PROD-002`,
        title: 'Smart Watch Pro',
        currentPrice: 229.99,
        originalPrice: 279.99,
        image: 'https://images.pexels.com/photos/393047/pexels-photo-393047.jpeg',
        url: `https://${marketplaceConfig.amazonDomain}/dp/${marketplace}-PROD-002`,
        category: 'Electronics',
        rating: 4.6,
        reviewCount: 8920,
        inStock: true,
        marketplace: marketplaceConfig.code,
        currency: marketplaceConfig.currency,
        currencySymbol: marketplaceConfig.currencySymbol,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    return fallbackProducts;
  }

  generateAffiliateLink(asin, marketplace = DEFAULT_MARKETPLACE) {
    const marketplaceConfig = getMarketplace(marketplace);
    const affiliateTag = process.env[`AMAZON_AFFILIATE_TAG_${marketplace}`] || process.env.AMAZON_AFFILIATE_TAG;

    if (affiliateTag) {
      return `https://${marketplaceConfig.amazonDomain}/dp/${asin}?tag=${affiliateTag}`;
    }

    return `https://${marketplaceConfig.amazonDomain}/dp/${asin}`;
  }
}

export default new AffiliateService();
