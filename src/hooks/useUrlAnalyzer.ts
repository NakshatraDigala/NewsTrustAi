import { useState, useCallback } from "react";
import { NewsArticle, ScrapeResponse, AnalysisResponse } from "@/types/news";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useUrlAnalyzer() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentUrl, setCurrentUrl] = useState<string | null>(null);

  const analyzeUrl = useCallback(async (url: string) => {
    setIsLoading(true);
    setCurrentUrl(url);

    try {
      // Step 1: Scrape the URL
      toast.info("Fetching content from URL...");
      
      const { data: scrapeData, error: scrapeError } = await supabase.functions.invoke<ScrapeResponse>('scrape-url', {
        body: { url },
      });

      if (scrapeError) {
        console.error('Scrape error:', scrapeError);
        toast.error('Failed to fetch the URL. Please check if the URL is valid and accessible.');
        setIsLoading(false);
        return;
      }

      if (!scrapeData?.success || !scrapeData.article) {
        toast.error(scrapeData?.error || 'Could not extract content from this URL');
        setIsLoading(false);
        return;
      }

      // Add article with analyzing status
      const article: NewsArticle = {
        ...scrapeData.article,
        status: 'analyzing',
      };

      setArticles(prev => [article, ...prev]);
      toast.info("Analyzing content for credibility...");

      // Step 2: Analyze the content
      const { data: analysisData, error: analysisError } = await supabase.functions.invoke<AnalysisResponse>('analyze-credibility', {
        body: {
          headline: article.headline,
          excerpt: article.excerpt,
          fullContent: article.fullContent,
          source: article.source,
        },
      });

      if (analysisError) {
        console.error('Analysis error:', analysisError);
        // Update article with error state
        setArticles(prev => 
          prev.map(a => 
            a.id === article.id 
              ? { ...a, status: 'complete' as const, trustLevel: 'suspicious' as const, reasoning: 'Analysis could not be completed.' }
              : a
          )
        );
        toast.error('Analysis encountered an issue');
        setIsLoading(false);
        return;
      }

      // Update article with analysis results
      setArticles(prev => 
        prev.map(a => 
          a.id === article.id 
            ? { 
                ...a, 
                status: 'complete' as const,
                trustLevel: analysisData?.trustLevel || 'suspicious',
                confidence: analysisData?.confidence,
                reasoning: analysisData?.reasoning,
                details: analysisData?.details,
              }
            : a
        )
      );

      const trustMessage = analysisData?.trustLevel === 'true' 
        ? 'Content appears credible' 
        : analysisData?.trustLevel === 'false'
          ? 'Content shows signs of misinformation'
          : 'Content requires verification';
      
      toast.success(trustMessage);

    } catch (err) {
      console.error('Error analyzing URL:', err);
      toast.error('An error occurred while analyzing the URL');
    } finally {
      setIsLoading(false);
      setCurrentUrl(null);
    }
  }, []);

  const clearHistory = useCallback(() => {
    setArticles([]);
  }, []);

  return {
    articles,
    isLoading,
    currentUrl,
    analyzeUrl,
    clearHistory,
  };
}
