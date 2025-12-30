import googleNewsLogo from "@/assets/google-news-logo.png";
import twitterLogo from "@/assets/twitter-logo.png";
import facebookLogo from "@/assets/facebook-logo.png";
import wikipediaLogo from "@/assets/wikipedia-logo.png";
import theHinduLogo from "@/assets/the-hindu-logo.png";
import deccanChronicleLogo from "@/assets/deccan-chronicle-logo.png";
import way2newsLogo from "@/assets/way2news-logo.png";
import inshortsLogo from "@/assets/inshorts-logo.png";

export interface NewsSource {
  id: string;
  name: string;
  logo: string;
  searchQuery: string;
}

const NEWS_SOURCES: NewsSource[] = [
  {
    id: "google-news",
    name: "Google News",
    logo: googleNewsLogo,
    searchQuery: "trending news today headlines",
  },
  {
    id: "twitter",
    name: "X (Twitter)",
    logo: twitterLogo,
    searchQuery: "trending topics twitter today viral",
  },
  {
    id: "facebook",
    name: "Facebook",
    logo: facebookLogo,
    searchQuery: "facebook trending news viral posts",
  },
  {
    id: "wikipedia",
    name: "Wikipedia",
    logo: wikipediaLogo,
    searchQuery: "wikipedia current events news today",
  },
  {
    id: "the-hindu",
    name: "The Hindu",
    logo: theHinduLogo,
    searchQuery: "site:thehindu.com breaking news today",
  },
  {
    id: "deccan-chronicle",
    name: "Deccan Chronicle",
    logo: deccanChronicleLogo,
    searchQuery: "site:deccanchronicle.com latest news",
  },
  {
    id: "way2news",
    name: "Way2News",
    logo: way2newsLogo,
    searchQuery: "way2news trending india news short",
  },
  {
    id: "inshorts",
    name: "Inshorts",
    logo: inshortsLogo,
    searchQuery: "inshorts 60 words news today trending",
  },
];

interface SourceSelectorProps {
  selectedSource: string | null;
  onSelectSource: (source: NewsSource) => void;
  isLoading: boolean;
}

export function SourceSelector({ selectedSource, onSelectSource, isLoading }: SourceSelectorProps) {
  return (
    <div className="w-full">
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4 text-center">
        Select a News Source
      </h3>
      <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
        {NEWS_SOURCES.map((source) => {
          const isSelected = selectedSource === source.id;
          return (
            <button
              key={source.id}
              onClick={() => onSelectSource(source)}
              disabled={isLoading}
              className={`
                group flex flex-col items-center gap-2 p-3 rounded-xl 
                transition-all duration-300 ease-out
                ${isSelected 
                  ? 'glass-card ring-2 ring-primary/50 scale-105' 
                  : 'bg-muted/30 hover:bg-muted/50 hover:scale-105'}
                ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
              title={source.name}
            >
              <div className={`
                w-10 h-10 rounded-lg flex items-center justify-center
                bg-white/90 p-1.5
                ${isSelected ? 'ring-2 ring-primary shadow-lg' : 'group-hover:shadow-xl'}
                transition-all duration-300
              `}>
                <img 
                  src={source.logo} 
                  alt={`${source.name} logo`}
                  className="w-full h-full object-contain"
                />
              </div>
              <span className={`
                text-xs font-medium text-center leading-tight
                ${isSelected ? 'text-foreground' : 'text-muted-foreground'}
                group-hover:text-foreground transition-colors
              `}>
                {source.name.split(' ').slice(0, 2).join(' ')}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export { NEWS_SOURCES };
