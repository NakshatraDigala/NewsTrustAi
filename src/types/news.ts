export type TrustLevel = 'true' | 'suspicious' | 'false' | 'pending';

export interface NewsArticle {
  id: string;
  headline: string;
  excerpt: string;
  source: string;
  url?: string;
  timestamp: string;
  status: 'pending' | 'analyzing' | 'complete';
  trustLevel?: TrustLevel;
  confidence?: number;
  reasoning?: string;
}

export interface ScrapeResponse {
  success: boolean;
  articles?: NewsArticle[];
  error?: string;
}

export interface AnalysisResponse {
  success: boolean;
  trustLevel?: TrustLevel;
  confidence?: number;
  reasoning?: string;
  error?: string;
}
