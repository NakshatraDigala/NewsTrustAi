import { useState } from "react";
import { cn } from "@/lib/utils";
import { Search, Loader2 } from "lucide-react";

interface UrlInputProps {
  onSubmit: (url: string) => void;
  isLoading: boolean;
}

export function UrlInput({ onSubmit, isLoading }: UrlInputProps) {
  const [url, setUrl] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim() && !isLoading) {
      onSubmit(url.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="relative">
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-trust-true/20 via-trust-suspicious/20 to-trust-false/20 blur-xl opacity-50" />
        <div className="relative glass-card rounded-xl p-1.5">
          <div className="flex items-center gap-2">
            <div className="flex-1 relative">
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Paste a news article or blog URL to analyze..."
                className={cn(
                  "w-full bg-transparent border-0 outline-none",
                  "px-4 py-3 text-foreground placeholder:text-muted-foreground",
                  "font-medium text-base"
                )}
                disabled={isLoading}
              />
            </div>
            <button
              type="submit"
              disabled={!url.trim() || isLoading}
              className={cn(
                "flex items-center gap-2 px-6 py-3 rounded-lg",
                "bg-primary text-primary-foreground font-semibold",
                "transition-all duration-200",
                "hover:bg-primary/90 hover:scale-[1.02]",
                "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              )}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Analyzing</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>Analyze</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
      <p className="mt-3 text-center text-sm text-text-tertiary">
        Enter any news article, blog post, or website URL for real-time credibility analysis
      </p>
    </form>
  );
}
