import { Header } from "@/components/Header";
import { UrlInput } from "@/components/UrlInput";
import { NewsFeed } from "@/components/NewsFeed";
import { TrustLegend } from "@/components/TrustLegend";
import { SourceSelector, NEWS_SOURCES, NewsSource } from "@/components/SourceSelector";
import { useTrendingNews } from "@/hooks/useTrendingNews";
import { useUrlAnalyzer } from "@/hooks/useUrlAnalyzer";
import { Trash2, Clock, RefreshCw, TrendingUp } from "lucide-react";
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";

type TabMode = "trending" | "analyze";

const Index = () => {
  const [activeTab, setActiveTab] = useState<TabMode>("trending");
  
  const { 
    articles: trendingArticles, 
    isLoading: trendingLoading, 
    isRefreshing,
    lastUpdated,
    nextRefresh,
    selectedSource,
    selectSource,
    manualRefresh,
  } = useTrendingNews();
  
  const { 
    articles: analyzedArticles, 
    isLoading: analyzeLoading, 
    analyzeUrl, 
    clearHistory 
  } = useUrlAnalyzer();

  const currentArticles = activeTab === "trending" ? trendingArticles : analyzedArticles;
  const isLoading = activeTab === "trending" ? trendingLoading : analyzeLoading;
  const completedArticles = currentArticles.filter(a => a.status === 'complete');

  return (
    <div className="min-h-screen">
      <Header isRefreshing={isRefreshing || isLoading} lastUpdated={lastUpdated} />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Tab Switcher */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex bg-muted/50 rounded-xl p-1">
              <button
                onClick={() => setActiveTab("trending")}
                className={`px-6 py-2.5 rounded-lg font-medium transition-all ${
                  activeTab === "trending"
                    ? "bg-primary text-primary-foreground shadow-lg"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <TrendingUp className="w-4 h-4 inline-block mr-2" />
                Trending News
              </button>
              <button
                onClick={() => setActiveTab("analyze")}
                className={`px-6 py-2.5 rounded-lg font-medium transition-all ${
                  activeTab === "analyze"
                    ? "bg-primary text-primary-foreground shadow-lg"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                🔍 Analyze URL
              </button>
            </div>
          </div>

          {activeTab === "trending" ? (
            <>
              {/* Source Selector */}
              <div className="mb-8">
                <SourceSelector 
                  selectedSource={selectedSource?.id || null}
                  onSelectSource={selectSource}
                  isLoading={isLoading}
                />
              </div>

              {/* Refresh Info */}
              {selectedSource && lastUpdated && (
                <div className="flex items-center justify-center gap-4 mb-6 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    Updated {formatDistanceToNow(lastUpdated, { addSuffix: true })}
                  </span>
                  <span className="text-border">•</span>
                  <span>Auto-refreshes every 15 min</span>
                  <button
                    onClick={manualRefresh}
                    disabled={isRefreshing}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                    Refresh Now
                  </button>
                </div>
              )}
            </>
          ) : (
            /* URL Input for Analyze mode */
            <div className="text-center mb-8">
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-3">
                Verify Any News Source
              </h2>
              <p className="text-text-secondary max-w-xl mx-auto mb-8">
                Paste a URL and our AI will analyze the content for credibility signals,
                misinformation patterns, and trustworthiness in real-time.
              </p>
              <div className="max-w-2xl mx-auto">
                <UrlInput onSubmit={analyzeUrl} isLoading={analyzeLoading} />
              </div>
            </div>
          )}

          <div className="grid lg:grid-cols-4 gap-6 mt-6">
            {/* Main feed */}
            <div className="lg:col-span-3">
              {activeTab === "trending" && !selectedSource ? (
                <SourcePrompt />
              ) : currentArticles.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-display font-semibold text-lg text-foreground">
                      {activeTab === "trending" 
                        ? `${selectedSource?.name} - Trending News` 
                        : "Analysis Results"}
                    </h3>
                    {activeTab === "analyze" && analyzedArticles.length > 0 && (
                      <button
                        onClick={clearHistory}
                        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        Clear History
                      </button>
                    )}
                  </div>
                  <NewsFeed articles={currentArticles} isLoading={false} />
                </div>
              ) : activeTab === "analyze" ? (
                <EmptyState />
              ) : isLoading ? (
                <LoadingState sourceName={selectedSource?.name || ""} />
              ) : null}
            </div>

            {/* Sidebar */}
            <aside className="lg:col-span-1">
              <div className="sticky top-24 space-y-4">
                <TrustLegend />
                
                {/* Stats card */}
                <div className="glass-card rounded-xl p-4">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    {activeTab === "trending" ? "Feed Stats" : "Session Stats"}
                  </h3>
                  <div className="space-y-3">
                    <StatItem 
                      label="Articles" 
                      value={completedArticles.length} 
                    />
                    <StatItem 
                      label="Likely True" 
                      value={completedArticles.filter(a => a.trustLevel === 'true').length}
                      color="text-trust-true"
                    />
                    <StatItem 
                      label="Suspicious" 
                      value={completedArticles.filter(a => a.trustLevel === 'suspicious').length}
                      color="text-trust-suspicious"
                    />
                    <StatItem 
                      label="Likely False" 
                      value={completedArticles.filter(a => a.trustLevel === 'false').length}
                      color="text-trust-false"
                    />
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 mt-12">
        <div className="container mx-auto px-4 py-6">
          <p className="text-center text-xs text-text-tertiary">
            NewsTrust AI is a decision-support tool. Always verify important news through multiple sources.
          </p>
        </div>
      </footer>
    </div>
  );
};

function SourcePrompt() {
  return (
    <div className="glass-card rounded-xl p-12 text-center">
      <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
        <TrendingUp className="w-10 h-10 text-primary" />
      </div>
      <h3 className="font-display font-semibold text-xl text-foreground mb-2">
        Select a News Source
      </h3>
      <p className="text-text-secondary max-w-sm mx-auto">
        Click on any news source above to fetch real-time trending articles and analyze their credibility.
      </p>
    </div>
  );
}

function LoadingState({ sourceName }: { sourceName: string }) {
  return (
    <div className="glass-card rounded-xl p-12 text-center">
      <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center animate-pulse">
        <RefreshCw className="w-10 h-10 text-primary animate-spin" />
      </div>
      <h3 className="font-display font-semibold text-xl text-foreground mb-2">
        Fetching from {sourceName}...
      </h3>
      <p className="text-text-secondary max-w-sm mx-auto">
        Scraping trending articles and preparing AI analysis.
      </p>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="glass-card rounded-xl p-12 text-center">
      <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-trust-true/20 via-trust-suspicious/20 to-trust-false/20 flex items-center justify-center">
        <span className="text-4xl">🔍</span>
      </div>
      <h3 className="font-display font-semibold text-xl text-foreground mb-2">
        Ready to Analyze
      </h3>
      <p className="text-text-secondary max-w-sm mx-auto">
        Paste any news article, blog post, or website URL above to check its credibility in real-time.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-2 text-xs text-text-tertiary">
        <span className="px-3 py-1 rounded-full bg-muted">News Articles</span>
        <span className="px-3 py-1 rounded-full bg-muted">Blog Posts</span>
        <span className="px-3 py-1 rounded-full bg-muted">Social Media</span>
        <span className="px-3 py-1 rounded-full bg-muted">Press Releases</span>
      </div>
    </div>
  );
}

function StatItem({ 
  label, 
  value, 
  color = "text-foreground" 
}: { 
  label: string; 
  value: number; 
  color?: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-text-secondary">{label}</span>
      <span className={`font-display font-semibold ${color}`}>{value}</span>
    </div>
  );
}

export default Index;