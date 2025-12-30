import { NewsArticle } from "@/types/news";
import { TrustIndicator } from "./TrustIndicator";
import { cn } from "@/lib/utils";
import { ExternalLink } from "lucide-react";

interface NewsCardProps {
  article: NewsArticle;
  index: number;
}

export function NewsCard({ article, index }: NewsCardProps) {
  const isAnalyzing = article.status === 'pending' || article.status === 'analyzing';
  const trustLevel = isAnalyzing ? 'pending' : (article.trustLevel || 'suspicious');

  return (
    <article
      className={cn(
        "glass-card rounded-xl p-5 transition-all duration-300",
        "hover:border-border/80 hover:bg-surface-elevated/50",
        "opacity-0 animate-fade-in-up"
      )}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="flex items-start gap-4">
        {/* Trust indicator */}
        <div className="flex-shrink-0 pt-1">
          <TrustIndicator level={trustLevel} size="lg" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-display font-semibold text-lg leading-tight text-foreground line-clamp-2">
              {article.headline}
            </h3>
            {article.url && (
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-shrink-0 p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                aria-label="Open article"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>

          {article.excerpt && (
            <p className="mt-2 text-sm text-text-secondary line-clamp-2 leading-relaxed">
              {article.excerpt}
            </p>
          )}

          <div className="mt-3 flex items-center gap-3 text-xs">
            <span className="text-text-tertiary font-medium uppercase tracking-wide">
              {article.source}
            </span>
            <span className="text-border">•</span>
            <TrustIndicator level={trustLevel} size="sm" showLabel />
          </div>

          {article.reasoning && article.status === 'complete' && (
            <p className="mt-2 text-xs text-muted-foreground italic">
              {article.reasoning}
            </p>
          )}
        </div>
      </div>

      {/* Loading shimmer effect */}
      {isAnalyzing && (
        <div className="mt-4 h-1 rounded-full overflow-hidden bg-muted">
          <div 
            className="h-full w-1/3 rounded-full bg-gradient-to-r from-transparent via-muted-foreground/30 to-transparent animate-shimmer"
            style={{ backgroundSize: '200% 100%' }}
          />
        </div>
      )}
    </article>
  );
}
