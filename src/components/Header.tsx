import { Shield } from "lucide-react";

interface HeaderProps {
  isRefreshing: boolean;
  lastUpdated: Date | null;
}

export function Header({ isRefreshing }: HeaderProps) {
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
              {isRefreshing && (
                <div className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-trust-suspicious animate-pulse" />
              )}
            </div>
            <div>
              <h1 className="font-display font-bold text-xl tracking-tight text-foreground">
                NewsTrust AI
              </h1>
              <p className="text-xs text-muted-foreground">
                Real-time credibility analysis
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <a 
              href="https://docs.lovable.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              How it works
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
