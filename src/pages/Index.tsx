import { Header } from "@/components/Header";
import { UrlInput } from "@/components/UrlInput";
import { NewsFeed } from "@/components/NewsFeed";
import { TrustLegend } from "@/components/TrustLegend";
import { useUrlAnalyzer } from "@/hooks/useUrlAnalyzer";
import { Trash2 } from "lucide-react";

const Index = () => {
  const { articles, isLoading, analyzeUrl, clearHistory } = useUrlAnalyzer();

  const completedArticles = articles.filter(a => a.status === 'complete');

  return (
    <div className="min-h-screen">
      <Header isRefreshing={isLoading} lastUpdated={null} />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Hero section */}
          <div className="text-center mb-8">
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-3">
              Verify Any News Source
            </h2>
            <p className="text-text-secondary max-w-xl mx-auto mb-8">
              Paste a URL and our AI will analyze the content for credibility signals,
              misinformation patterns, and trustworthiness in real-time.
            </p>
            
            {/* URL Input */}
            <div className="max-w-2xl mx-auto">
              <UrlInput onSubmit={analyzeUrl} isLoading={isLoading} />
            </div>
          </div>

          <div className="grid lg:grid-cols-4 gap-6 mt-10">
            {/* Main feed */}
            <div className="lg:col-span-3">
              {articles.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-display font-semibold text-lg text-foreground">
                      Analysis Results
                    </h3>
                    {articles.length > 0 && (
                      <button
                        onClick={clearHistory}
                        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        Clear History
                      </button>
                    )}
                  </div>
                  <NewsFeed articles={articles} isLoading={false} />
                </div>
              ) : (
                <EmptyState />
              )}
            </div>

            {/* Sidebar */}
            <aside className="lg:col-span-1">
              <div className="sticky top-24 space-y-4">
                <TrustLegend />
                
                {/* Stats card */}
                <div className="glass-card rounded-xl p-4">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    Session Stats
                  </h3>
                  <div className="space-y-3">
                    <StatItem 
                      label="URLs Analyzed" 
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
