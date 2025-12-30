import { NewsArticle } from "@/types/news";
import { NewsCard } from "./NewsCard";
import { Loader2 } from "lucide-react";

interface NewsFeedProps {
  articles: NewsArticle[];
  isLoading: boolean;
}

export function NewsFeed({ articles, isLoading }: NewsFeedProps) {
  if (isLoading && articles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="relative">
          <div className="w-12 h-12 rounded-full border-2 border-muted border-t-primary animate-spin" />
        </div>
        <p className="mt-4 text-muted-foreground font-medium">
          Scanning news sources...
        </p>
        <p className="mt-1 text-sm text-text-tertiary">
          AI agents are gathering the latest headlines
        </p>
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <span className="text-2xl">📰</span>
        </div>
        <p className="text-muted-foreground font-medium">
          No articles found
        </p>
        <p className="mt-1 text-sm text-text-tertiary">
          Check back soon for the latest news analysis
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {articles.map((article, index) => (
        <NewsCard key={article.id} article={article} index={index} />
      ))}

      {isLoading && (
        <div className="flex items-center justify-center py-6 gap-2 text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm">Fetching more articles...</span>
        </div>
      )}
    </div>
  );
}
