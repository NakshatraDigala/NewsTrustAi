export type TrustLevel = 'true' | 'suspicious' | 'false' | 'pending';

export interface NewsArticle {
  id: string;
  headline: string;
  excerpt: string;
  fullContent?: string;
  source: string;
  url?: string;
  timestamp: string;
  status: 'pending' | 'analyzing' | 'complete';
  trustLevel?: TrustLevel;
  confidence?: number;
  reasoning?: string;
  details?: {
    languageTone: string;
    sourceCredibility: string;
    factualIndicators: string;
    redFlags: string[];
  };
}

export interface ScrapeResponse {
  success: boolean;
  article?: NewsArticle;
  articles?: NewsArticle[];
  error?: string;
}

export interface AnalysisResponse {
  success: boolean;
  trustLevel?: TrustLevel;
  confidence?: number;
  reasoning?: string;
  details?: {
    languageTone: string;
    sourceCredibility: string;
    factualIndicators: string;
    redFlags: string[];
  };
  error?: string;
}
