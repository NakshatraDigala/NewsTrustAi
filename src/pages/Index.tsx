import { Header } from "@/components/Header";
import { NewsFeed } from "@/components/NewsFeed";
import { TrustLegend } from "@/components/TrustLegend";
import { useNewsStream } from "@/hooks/useNewsStream";

const Index = () => {
  const { articles, isLoading, isRefreshing, lastUpdated } = useNewsStream();

  return (
    <div className="min-h-screen">
      <Header isRefreshing={isRefreshing || isLoading} lastUpdated={lastUpdated} />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Hero section */}
          <div className="text-center mb-10">
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-3">
              Real-time News Analysis
            </h2>
            <p className="text-text-secondary max-w-xl mx-auto">
              AI agents continuously scan news sources and analyze credibility signals.
              No action required—just observe.
            </p>
          </div>

          <div className="grid lg:grid-cols-4 gap-6">
            {/* Main feed */}
            <div className="lg:col-span-3">
              <NewsFeed articles={articles} isLoading={isLoading} />
            </div>

            {/* Sidebar */}
            <aside className="lg:col-span-1">
              <div className="sticky top-24 space-y-4">
                <TrustLegend />
                
                {/* Stats card */}
                <div className="glass-card rounded-xl p-4">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    Live Stats
                  </h3>
                  <div className="space-y-3">
                    <StatItem 
                      label="Articles Analyzed" 
                      value={articles.filter(a => a.status === 'complete').length} 
                    />
                    <StatItem 
                      label="Likely True" 
                      value={articles.filter(a => a.trustLevel === 'true').length}
                      color="text-trust-true"
                    />
                    <StatItem 
                      label="Suspicious" 
                      value={articles.filter(a => a.trustLevel === 'suspicious').length}
                      color="text-trust-suspicious"
                    />
                    <StatItem 
                      label="Likely False" 
                      value={articles.filter(a => a.trustLevel === 'false').length}
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
