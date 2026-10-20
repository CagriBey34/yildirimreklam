// Small print-shop motifs shared across sections: registration mark, CMYK
// colour bar, the ruled section header and the scrolling service ticker.

export function RegMark({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden="true">
      <circle cx="12" cy="12" r="6.5" />
      <circle cx="12" cy="12" r="2.6" />
      <path d="M12 0v24M0 12h24" />
    </svg>
  );
}

// The C-M-Y-K swatch strip printers put on the sheet margin.
export function ColorBar({ className = "" }) {
  return (
    <span className={`inline-flex ${className}`} aria-hidden="true">
      {["bg-cyan", "bg-magenta", "bg-brand", "bg-ink"].map((c) => (
        <span key={c} className={`h-3 w-3 ${c}`} />
      ))}
    </span>
  );
}

// Ruled header row that opens every section: label …… aside.
export function SectionHead({ label, aside, dark = false }) {
  return (
    <div className={`label flex items-center justify-between gap-6 border-t pt-4 ${dark ? "border-paper/30" : "border-ink"}`}>
      <span>{label}</span>
      {aside && <span className={`hidden sm:flex items-center gap-3 ${dark ? "text-paper/45" : "text-ink/45"}`}>{aside}</span>}
    </div>
  );
}

const TICKER = ["Tabela", "Dijital Baskı", "Promosyon", "Matbaa", "Display", "Bayrak", "Araç Giydirme", "Montaj"];

// Yellow band between the dark intro and the paper-coloured site.
export function Ticker() {
  return (
    <div className="relative z-10 overflow-hidden border-y border-ink bg-brand text-ink select-none" aria-hidden="true">
      <div className="marquee py-3 sm:py-4" style={{ "--marquee-duration": "38s" }}>
        {[0, 1].map((k) => (
          <div key={k} className="flex shrink-0 items-center">
            {TICKER.map((t) => (
              <span key={t} className="flex items-center display text-2xl sm:text-4xl whitespace-nowrap">
                {t}
                <RegMark className="mx-6 sm:mx-10 h-6 w-6 sm:h-8 sm:w-8" />
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
