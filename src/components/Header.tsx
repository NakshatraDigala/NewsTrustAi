import { Shield, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface HeaderProps {
  isRefreshing: boolean;
  lastUpdated: Date | null;
}

export function Header({ isRefreshing, lastUpdated }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 glass-card border-b border-border/50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-trust-true via-trust-suspicious to-trust-false p-0.5">
                <div className="w-full h-full rounded-[10px] bg-background flex items-center justify-center">
                  <Shield className="w-5 h-5 text-foreground" />
                </div>
              </div>
            </div>
            <div>
              <h1 className="font-display font-bold text-xl tracking-tight text-foreground">
                NewsTrust AI
              </h1>
              <p className="text-xs text-muted-foreground">
                Autonomous misinformation detection
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <RefreshCw 
              className={cn(
                "w-4 h-4 text-muted-foreground",
                isRefreshing && "animate-spin"
              )} 
            />
            {lastUpdated && (
              <span className="text-xs text-text-tertiary">
                Updated {formatTimeAgo(lastUpdated)}
              </span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  
  if (seconds < 60) return 'just now';
  if (seconds < 120) return '1 min ago';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} mins ago`;
  if (seconds < 7200) return '1 hour ago';
  return `${Math.floor(seconds / 3600)} hours ago`;
}
