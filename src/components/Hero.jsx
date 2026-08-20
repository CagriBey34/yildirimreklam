import { useEffect, useRef, useState } from "react";
import heroBg from "../assets/services/Mesh.png";
import { usePinnedPanel } from "../hooks/usePinnedPanel";

function clamp(v, min, max) {
  return Math.min(max, Math.max(min, v));
}

// Headline + paragraph typed out as one continuous typewriter sequence
// (the paragraph picks up where the headline's last character left off,
// rather than each block starting its own count from zero). Split into
// `parts` per line so each still gets its own color (the accent words)
// without breaking the shared character count.
const TYPEWRITER_LINES = [
  {
    parts: [
      { text: "Fikrinizi ", className: "text-white" },
      { text: "Tasarlıyor,", className: "text-[#F5A623]" },
    ],
  },
  {
    parts: [
      { text: "Markanızı ", className: "text-white" },
      { text: "Görünür ", className: "text-[#F5A623]" },
      { text: "Kılıyoruz.", className: "text-white" },
    ],
  },
  {
    parts: [
      {
        text: "Tabela, dijital baskı, promosyon ve matbaa alanlarında yılların verdiği tecrübeyle markanızı en iyi şekilde temsil ediyoruz.",
        className: "",
      },
    ],
  },
];

const TYPEWRITER_TOTAL_LENGTH = TYPEWRITER_LINES.reduce(
  (sum, line) => sum + line.parts.reduce((s, p) => s + p.text.length, 0),
  0
);

// Renders a line's parts with the full text always present (so the block
// wraps/sizes exactly like the finished copy from the very first paint —
// no layout jump as characters reveal) — only the not-yet-typed remainder
// is hidden via opacity, and the caret is spliced in at the exact
// character where typing currently sits within this line.
function renderLineParts(line, lineTyped, showCaret) {
  let pos = 0;
  return line.parts.map((part, i) => {
    const visible = clamp(lineTyped - pos, 0, part.text.length);
    const isBoundaryPart = showCaret && lineTyped >= pos && lineTyped < pos + part.text.length;
    pos += part.text.length;
    return (
      <span key={i} className={part.className}>
        {part.text.slice(0, visible)}
        {isBoundaryPart && (
          <span className="typewriter-caret" aria-hidden="true">
            ▍
          </span>
        )}
        <span style={{ opacity: 0 }}>{part.text.slice(visible)}</span>
      </span>
    );
  });
}

// Reveals the sequence one character at a time with a little random jitter
// per tick (a constant interval reads as too mechanical for body text) —
// starting after the lightning-strike intro has cleared. Respects
// prefers-reduced-motion by skipping straight to the fully-typed state.
function useTypewriter(totalLength, { charDelay = 26, startDelay = 1300 } = {}) {
  const [typed, setTyped] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setTyped(totalLength);
      setDone(true);
      return;
    }

    let cancelled = false;
    let tickTimeout;
    let count = 0;

    const tick = () => {
      if (cancelled) return;
      count += 1;
      setTyped(count);
      if (count >= totalLength) {
        setDone(true);
        return;
      }
      tickTimeout = setTimeout(tick, charDelay * (0.7 + Math.random() * 0.6));
    };

    const startTimeout = setTimeout(tick, startDelay);
    return () => {
      cancelled = true;
      clearTimeout(startTimeout);
      clearTimeout(tickTimeout);
    };
  }, [totalLength, charDelay, startDelay]);

  return { typed, done };
}

export default function Hero() {
  const heroRef = useRef(null);
  const contentRef = useRef(null);
  const { typed, done: typingDone } = useTypewriter(TYPEWRITER_TOTAL_LENGTH);

  usePinnedPanel(heroRef, { innerRef: contentRef });

  // Slice each line's parts down to how many of its characters are within
  // the globally-typed count, and track which line is currently receiving
  // characters so the blinking caret renders at the right spot.
  let consumedChars = 0;
  let activeLineIndex = -1;
  const typedLines = TYPEWRITER_LINES.map((line, i) => {
    const lineLength = line.parts.reduce((s, p) => s + p.text.length, 0);
    const lineStart = consumedChars;
    const lineTyped = clamp(typed - lineStart, 0, lineLength);
    consumedChars += lineLength;
    if (lineTyped > 0) activeLineIndex = i;
    return { lineTyped, lineLength };
  });

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;
    const handleMouseMove = (e) => {
      const rect = hero.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      hero.style.setProperty("--mouse-x", `${x}%`);
      hero.style.setProperty("--mouse-y", `${y}%`);
    };
    hero.addEventListener("mousemove", handleMouseMove);
    return () => hero.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <section
      id="anasayfa"
      ref={heroRef}
      className="relative min-h-dvh flex flex-col overflow-hidden bg-[#1A1A1A]"
    >
      {/* Background: an illuminated sign the agency itself produced (a nod
          to the craft, not a stock photo), graded to sit inside the site's
          own dark/amber palette instead of reading as a random photograph. */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroBg}
          alt=""
          aria-hidden="true"
          className="hero-image-kenburns w-full h-full object-cover"
          style={{ filter: "grayscale(10%) contrast(1.45) brightness(0.65) saturate(1.05)" }}
        />
        {/* Duotone wash: pulls the photo's highlights toward the brand amber */}
        <div className="absolute inset-0 bg-[#F5A623] mix-blend-overlay opacity-25" />
        {/* Mouse-tracked warm glow, carried over from the plain-background
            version of this hero — kept as a soft-light wash over the photo
            instead of a bare radial-gradient, so the interaction survives
            the move to a full-bleed image background. */}
        <div
          className="absolute inset-0 mix-blend-soft-light"
          style={{
            background:
              "radial-gradient(circle at var(--mouse-x, 70%) var(--mouse-y, 35%), rgba(245,166,35,0.9) 0%, transparent 55%)",
          }}
        />
        {/* Legibility gradient: darkens top (nav/caption) and bottom (the
            giant wordmark) while leaving a lighter window over the photo. */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, #1A1A1A 8%, rgba(26,26,26,0.65) 32%, rgba(26,26,26,0.38) 52%, rgba(26,26,26,0.65) 82%, #1A1A1A 100%)",
          }}
        />
        {/* Fine grain for a photographic, non-flat feel */}
        <div
          className="absolute inset-0 opacity-[0.05] mix-blend-overlay"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          }}
        />
      </div>

      {/* Welcome flash: one lightning strike on load — a nod to "Yıldırım"
          (Turkish for "lightning bolt"), the agency's own name — that
          illuminates the hero into view instead of a plain fade-in. */}
      <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#1A1A1A] hero-overlay-fade">
        <div className="hero-bolt-strike">
          <svg
            viewBox="0 0 100 180"
            className="w-14 sm:w-20 h-auto"
            style={{
              filter:
                "drop-shadow(0 0 24px rgba(245,166,35,0.85)) drop-shadow(0 0 70px rgba(245,166,35,0.55))",
            }}
          >
            <path d="M55 0 L10 100 L40 100 L25 180 L90 70 L58 70 Z" fill="#F5A623" />
          </svg>
        </div>
        <div
          className="absolute inset-0 hero-flash"
          style={{
            background:
              "radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(245,166,35,0.4) 45%, transparent 75%)",
          }}
        />
      </div>

      {/* Content: caption block anchored top-left and typed out like a
          typewriter — the headline runs straight into the paragraph as one
          continuous sequence rather than each block fading in separately —
          the giant wordmark anchored to (and bleeding past) the very
          bottom edge. */}
      <div ref={contentRef} className="relative z-10 flex flex-col min-h-dvh w-full">
        <div className="flex-1 flex flex-col items-start justify-start text-left px-4 sm:px-6 lg:px-12 pt-28 sm:pt-32 pb-4">
          <div className="max-w-xl">
            <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-black text-white leading-[1.15] mb-5">
              <span className="block">
                {renderLineParts(TYPEWRITER_LINES[0], typedLines[0].lineTyped, activeLineIndex === 0 && !typingDone)}
              </span>
              <span className="relative inline-block">
                {renderLineParts(TYPEWRITER_LINES[1], typedLines[1].lineTyped, activeLineIndex === 1 && !typingDone)}
                {typedLines[1].lineTyped === typedLines[1].lineLength && (
                  <svg
                    className="absolute -bottom-1 left-0 w-full"
                    viewBox="0 0 300 12"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M3 9C50 3 100 1 150 3C200 5 250 3 297 9"
                      stroke="#F5A623"
                      strokeWidth="3"
                      strokeLinecap="round"
                      opacity="0.6"
                    />
                  </svg>
                )}
              </span>
            </h1>

            <p className="text-base sm:text-lg text-white/70 mb-8 leading-relaxed">
              {renderLineParts(TYPEWRITER_LINES[2], typedLines[2].lineTyped, activeLineIndex === 2 && !typingDone)}
            </p>

            <div
              className="flex flex-col sm:flex-row gap-4 justify-start transition-all duration-700 ease-out"
              style={{
                opacity: typingDone ? 1 : 0,
                transform: typingDone ? "translateY(0)" : "translateY(16px)",
                pointerEvents: typingDone ? "auto" : "none",
              }}
            >
              <a
                href="#hizmetlerimiz"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById("hizmetlerimiz")?.scrollIntoView({ behavior: "smooth" });
                }}
                className="btn-neu inline-flex items-center justify-center gap-2 bg-[#F5A623] hover:bg-[#D4891A] text-[#1A1A1A] font-bold text-base px-8 py-4"
              >
                Hizmetlerimizi İncele
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
              <a
                href="#iletisim"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById("iletisim")?.scrollIntoView({ behavior: "smooth" });
                }}
                className="btn-neu inline-flex items-center justify-center gap-2 bg-[#F8F8F8] hover:bg-white text-[#1A1A1A] font-bold text-base px-8 py-4"
              >
                Teklif Al
              </a>
            </div>
          </div>
        </div>

        {/* Giant wordmark: sized to bleed edge-to-edge, then nudged down so
            the section's own overflow-hidden crops its bottom edge — the
            "auren"-reference effect of oversized type poking up from below
            the fold instead of sitting fully inside the frame. */}
        <div
          className="shrink-0 w-full select-none hero-wordmark-rise"
          style={{ animationDelay: "0.7s", transform: "translateY(-4%)" }}
        >
         
        </div>
      </div>
    </section>
  );
}
