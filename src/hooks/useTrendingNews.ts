import { useState, useEffect, useCallback, useRef } from "react";
import { NewsArticle, ScrapeResponse, AnalysisResponse } from "@/types/news";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { NewsSource } from "@/components/SourceSelector";

const REFRESH_INTERVAL = 15 * 60 * 1000; // 15 minutes
const ANALYSIS_DELAY = 400; // Delay between analyzing articles

export function useTrendingNews() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [selectedSource, setSelectedSource] = useState<NewsSource | null>(null);
  const [nextRefresh, setNextRefresh] = useState<Date | null>(null);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

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

  const fetchTrendingNews = useCallback(async (source: NewsSource, isRefresh = false) => {
    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
      setArticles([]); // Clear previous articles when switching sources
    }

    try {
      console.log(`Fetching trending news for ${source.name}...`);
      
      const { data, error } = await supabase.functions.invoke<ScrapeResponse>('scrape-news', {
        body: {
          query: source.searchQuery,
          sourceId: source.id,
        },
      });

      if (error) {
        console.error('Scrape error:', error);
        toast.error(`Failed to fetch news from ${source.name}`);
        return;
      }

      if (!data?.articles || data.articles.length === 0) {
        console.log('No articles returned');
        toast.info(`No trending articles found for ${source.name}`);
        return;
      }

      // Add articles with analyzing status
      const newArticles = data.articles.map(article => ({
        ...article,
        status: 'analyzing' as const,
      }));

      setArticles(newArticles);
      setLastUpdated(new Date());
      setNextRefresh(new Date(Date.now() + REFRESH_INTERVAL));

      toast.success(`Found ${newArticles.length} trending articles from ${source.name}`);

      // Analyze each article sequentially
      for (let i = 0; i < newArticles.length; i++) {
        const analyzedArticle = await analyzeArticle(newArticles[i]);
        
        setArticles(current => 
          current.map(a => 
            a.id === analyzedArticle.id ? analyzedArticle : a
          )
        );

        if (i < newArticles.length - 1) {
          await new Promise(resolve => setTimeout(resolve, ANALYSIS_DELAY));
        }
      }

    } catch (err) {
      console.error('Error fetching trending news:', err);
      toast.error('Error loading trending news');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [analyzeArticle]);

  const selectSource = useCallback((source: NewsSource) => {
    setSelectedSource(source);
    
    // Clear existing interval
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
    }

    // Fetch immediately
    fetchTrendingNews(source);

    // Set up auto-refresh every 15 minutes
    refreshIntervalRef.current = setInterval(() => {
      fetchTrendingNews(source, true);
    }, REFRESH_INTERVAL);
  }, [fetchTrendingNews]);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, []);

  const manualRefresh = useCallback(() => {
    if (selectedSource) {
      fetchTrendingNews(selectedSource, true);
    }
  }, [selectedSource, fetchTrendingNews]);

  return {
    articles,
    isLoading,
    isRefreshing,
    lastUpdated,
    nextRefresh,
    selectedSource,
    selectSource,
    manualRefresh,
  };
}
