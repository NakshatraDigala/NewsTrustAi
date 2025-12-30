interface TrustLegendProps {
  className?: string;
}

export function TrustLegend({ className }: TrustLegendProps) {
  const items = [
    { color: 'bg-trust-true', glow: 'trust-glow-true', label: 'Likely True' },
    { color: 'bg-trust-suspicious', glow: 'trust-glow-suspicious', label: 'Suspicious' },
    { color: 'bg-trust-false', glow: 'trust-glow-false', label: 'Likely False' },
  ];

  return (
    <div className={className}>
      <div className="glass-card rounded-xl p-4">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Trust Indicators
        </h3>
        <div className="space-y-2.5">
          {items.map((item) => (
            <div key={item.label} className="flex items-center gap-2.5">
              <div className="relative">
                <div className={`absolute inset-0 rounded-full blur-sm opacity-50 ${item.color}`} />
                <div className={`relative w-2.5 h-2.5 rounded-full ${item.color} ${item.glow}`} />
              </div>
              <span className="text-sm text-text-secondary">{item.label}</span>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-text-tertiary leading-relaxed">
          AI-powered analysis based on language patterns, source credibility, and content signals.
        </p>
      </div>
    </div>
  );
}
