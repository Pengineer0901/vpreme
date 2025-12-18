export interface TrackedProduct {
  id: string;
  title: string;
  thumbnail_url: string;
  current_price: number;
  price_change_percent: number;
  insight_text: string | null;
  affiliate_url: string;
  last_updated: string;
  external_prompt_source: string | null;
  user_id: string;
  created_at: string;
}

export interface Alert {
  id: string;
  product_id: string;
  user_id: string;
  alert_type: string;
  previous_price: number;
  new_price: number;
  is_viewed: boolean;
  created_at: string;
  product?: TrackedProduct;
}
