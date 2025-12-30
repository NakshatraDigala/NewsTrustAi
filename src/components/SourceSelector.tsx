import { useState } from "react";
import { Newspaper, Globe, Hash, BookOpen, Radio, Zap } from "lucide-react";

export interface NewsSource {
  id: string;
  name: string;
  icon: React.ReactNode;
  searchQuery: string;
  color: string;
}

const NEWS_SOURCES: NewsSource[] = [
  {
    id: "google-news",
    name: "Google News",
    icon: <Globe className="w-5 h-5" />,
    searchQuery: "trending news today headlines",
    color: "from-blue-500 to-green-500",
  },
  {
    id: "twitter",
    name: "X (Twitter)",
    icon: <Hash className="w-5 h-5" />,
    searchQuery: "trending topics twitter today viral",
    color: "from-slate-700 to-slate-500",
  },
  {
    id: "facebook",
    name: "Facebook",
    icon: <Radio className="w-5 h-5" />,
    searchQuery: "facebook trending news viral posts",
    color: "from-blue-600 to-blue-400",
  },
  {
    id: "wikipedia",
    name: "Wikipedia",
    icon: <BookOpen className="w-5 h-5" />,
    searchQuery: "wikipedia current events news today",
    color: "from-gray-600 to-gray-400",
  },
  {
    id: "the-hindu",
    name: "The Hindu",
    icon: <Newspaper className="w-5 h-5" />,
    searchQuery: "site:thehindu.com breaking news today",
    color: "from-blue-800 to-blue-600",
  },
  {
    id: "deccan-chronicle",
    name: "Deccan Chronicle",
    icon: <Newspaper className="w-5 h-5" />,
    searchQuery: "site:deccanchronicle.com latest news",
    color: "from-red-700 to-red-500",
  },
  {
    id: "way2news",
    name: "Way2News",
    icon: <Zap className="w-5 h-5" />,
    searchQuery: "way2news trending india news short",
    color: "from-orange-600 to-yellow-500",
  },
  {
    id: "inshorts",
    name: "Inshorts",
    icon: <Zap className="w-5 h-5" />,
    searchQuery: "inshorts 60 words news today trending",
    color: "from-purple-600 to-pink-500",
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
                bg-gradient-to-br ${source.color}
                text-white shadow-lg
                ${isSelected ? 'animate-pulse' : 'group-hover:shadow-xl'}
                transition-all duration-300
              `}>
                {source.icon}
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
