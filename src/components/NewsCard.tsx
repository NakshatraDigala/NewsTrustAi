import { NewsArticle } from "@/types/news";
import { TrustIndicator } from "./TrustIndicator";
import { cn } from "@/lib/utils";
import { ExternalLink, AlertTriangle, CheckCircle, XCircle } from "lucide-react";

interface NewsCardProps {
  article: NewsArticle;
  index: number;
}

export function NewsCard({ article, index }: NewsCardProps) {
  const isAnalyzing = article.status === 'pending' || article.status === 'analyzing';
  const trustLevel = isAnalyzing ? 'pending' : (article.trustLevel || 'suspicious');

  const TrustIcon = trustLevel === 'true' 
    ? CheckCircle 
    : trustLevel === 'false' 
      ? XCircle 
      : AlertTriangle;

  return (
    <article
      className={cn(
        "glass-card rounded-xl p-6 transition-all duration-300",
        "hover:border-border/80 hover:bg-surface-elevated/50",
        "opacity-0 animate-fade-in-up"
      )}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="flex items-start gap-4">
        {/* Trust indicator */}
        <div className="flex-shrink-0 pt-1">
          <div className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center",
            trustLevel === 'true' && "bg-trust-true/20",
            trustLevel === 'suspicious' && "bg-trust-suspicious/20",
            trustLevel === 'false' && "bg-trust-false/20",
            trustLevel === 'pending' && "bg-muted"
          )}>
            {isAnalyzing ? (
              <div className="w-5 h-5 rounded-full border-2 border-muted-foreground border-t-transparent animate-spin" />
            ) : (
              <TrustIcon className={cn(
                "w-6 h-6",
                trustLevel === 'true' && "text-trust-true",
                trustLevel === 'suspicious' && "text-trust-suspicious",
                trustLevel === 'false' && "text-trust-false"
              )} />
            )}
          </div>
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
            <p className="mt-2 text-sm text-text-secondary line-clamp-3 leading-relaxed">
              {article.excerpt}
            </p>
          )}

          <div className="mt-3 flex items-center gap-3 text-xs">
            <span className="text-text-tertiary font-medium uppercase tracking-wide">
              {article.source}
            </span>
            <span className="text-border">•</span>
            <TrustIndicator level={trustLevel} size="sm" showLabel />
            {article.confidence !== undefined && article.status === 'complete' && (
              <>
                <span className="text-border">•</span>
                <span className="text-text-tertiary">
                  {Math.round(article.confidence * 100)}% confidence
                </span>
              </>
            )}
          </div>

          {/* Reasoning */}
          {article.reasoning && article.status === 'complete' && (
            <div className="mt-4 p-3 rounded-lg bg-muted/50 border border-border/50">
              <p className="text-sm text-foreground leading-relaxed">
                {article.reasoning}
              </p>
            </div>
          )}

          {/* Detailed analysis */}
          {article.details && article.status === 'complete' && (
            <div className="mt-4 grid grid-cols-2 gap-3">
              <DetailItem label="Language Tone" value={article.details.languageTone} />
              <DetailItem label="Source Credibility" value={article.details.sourceCredibility} />
              <DetailItem label="Factual Indicators" value={article.details.factualIndicators} />
              {article.details.redFlags.length > 0 && (
                <div className="col-span-2">
                  <span className="text-xs text-text-tertiary uppercase tracking-wide">Red Flags</span>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {article.details.redFlags.map((flag, i) => (
                      <span 
                        key={i} 
                        className="px-2 py-0.5 text-xs rounded-md bg-trust-false/20 text-trust-false"
                      >
                        {flag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Loading shimmer effect */}
      {isAnalyzing && (
        <div className="mt-4 h-1.5 rounded-full overflow-hidden bg-muted">
          <div 
            className="h-full w-1/3 rounded-full bg-gradient-to-r from-transparent via-muted-foreground/30 to-transparent animate-shimmer"
            style={{ backgroundSize: '200% 100%' }}
          />
        </div>
      )}
    </article>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-xs text-text-tertiary uppercase tracking-wide">{label}</span>
      <p className="text-sm text-foreground">{value}</p>
    </div>
  );
}
