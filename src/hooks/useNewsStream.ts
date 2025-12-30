import { useState, useEffect, useCallback } from "react";
import { NewsArticle, ScrapeResponse, AnalysisResponse } from "@/types/news";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const REFRESH_INTERVAL = 60000; // Refresh every 60 seconds
const ANALYSIS_DELAY = 500; // Delay between analyzing articles

export function useNewsStream() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const analyzeArticle = useCallback(async (article: NewsArticle): Promise<NewsArticle> => {
    try {
      const { data, error } = await supabase.functions.invoke<AnalysisResponse>('analyze-credibility', {
        body: {
          headline: article.headline,
          excerpt: article.excerpt,
          source: article.source,
        },
      });

      if (error) {
        console.error('Analysis error:', error);
        return {
          ...article,
          status: 'complete',
          trustLevel: 'suspicious',
          confidence: 0.5,
          reasoning: 'Analysis temporarily unavailable.',
        };
      }

      return {
        ...article,
        status: 'complete',
        trustLevel: data?.trustLevel || 'suspicious',
        confidence: data?.confidence || 0.5,
        reasoning: data?.reasoning || 'Analysis complete.',
      };
    } catch (err) {
      console.error('Failed to analyze article:', err);
      return {
        ...article,
        status: 'complete',
        trustLevel: 'suspicious',
        confidence: 0.5,
        reasoning: 'Could not complete analysis.',
      };
    }
  }, []);

  const fetchAndAnalyzeNews = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      // Fetch news articles
      const { data, error } = await supabase.functions.invoke<ScrapeResponse>('scrape-news');

      if (error) {
        console.error('Scrape error:', error);
        toast.error('Failed to fetch news articles');
        return;
      }

      if (!data?.articles || data.articles.length === 0) {
        console.log('No articles returned');
        return;
      }

      // Add articles to state immediately with pending status
      const newArticles = data.articles.map(article => ({
        ...article,
        status: 'analyzing' as const,
      }));

      setArticles(newArticles);
      setLastUpdated(new Date());

      // Analyze each article sequentially with a small delay
      for (let i = 0; i < newArticles.length; i++) {
        const analyzedArticle = await analyzeArticle(newArticles[i]);
        
        setArticles(current => 
          current.map(a => 
            a.id === analyzedArticle.id ? analyzedArticle : a
          )
        );

        // Small delay between analyses to avoid rate limiting
        if (i < newArticles.length - 1) {
          await new Promise(resolve => setTimeout(resolve, ANALYSIS_DELAY));
        }
      }

    } catch (err) {
      console.error('Error in news stream:', err);
      toast.error('Error loading news feed');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [analyzeArticle]);

  // Initial fetch
  useEffect(() => {
    fetchAndAnalyzeNews();
  }, []);

  // Periodic refresh
  useEffect(() => {
    const interval = setInterval(() => {
      fetchAndAnalyzeNews(true);
    }, REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, [fetchAndAnalyzeNews]);

  return {
    articles,
    isLoading,
    isRefreshing,
    lastUpdated,
    refresh: () => fetchAndAnalyzeNews(true),
  };
}
