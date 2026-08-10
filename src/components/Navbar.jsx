import { useState, useEffect, useLayoutEffect, useRef } from "react";
import logoSrc from "../assets/logokeee.png";

const navLinks = [
  { label: "Giriş", href: "#anasayfa" },
  { label: "Hakkımızda", href: "#hakkimizda" },
  { label: "Hizmetlerimiz", href: "#hizmetlerimiz" },
  { label: "Kataloglarımız", href: "#kataloglarimiz" },
  { label: "Referanslarımız", href: "#referanslarimiz" },
  { label: "İletişim", href: "#iletisim" },
];

function PhoneIcon({ className }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z" />
    </svg>
  );
}

// Desktop-only navigation: a vertical drum of page names flush to the right
// edge of the screen. Each label sits on the inside of a 3D cylinder via
// `rotateX` + `translateZ` — moving away from the active page rotates and
// recedes it, exactly like a real wheel/picker rather than just a plain
// slide. Switching the active section (scroll-driven, from Navbar's own
// scroll listener) re-targets every label's angle at once, so the whole
// drum visibly spins to bring the new page's name to the front.
const WHEEL_ANGLE_STEP = 24;
const WHEEL_RADIUS = 92;

function WheelNav({ activeSection, onNavClick }) {
  const activeIndex = navLinks.findIndex((link) => link.href.replace("#", "") === activeSection);

  return (
    <nav
      className="hidden md:flex fixed top-0 right-0 h-screen w-72 lg:w-80 justify-end z-50 pointer-events-none"
      style={{ perspective: "900px" }}
      aria-label="Sayfa navigasyonu"
    >
      {navLinks.map((link, i) => {
        const d = i - activeIndex;
        const dist = Math.abs(d);
        const isActive = dist === 0;
        const visible = dist <= 2;
        const opacity = visible ? 1 - dist * 0.4 : 0;
        const scale = 1.15 - dist * 0.22;

        return (
          <a
            key={link.href}
            href={link.href}
            onClick={(e) => onNavClick(e, link.href)}
            aria-current={isActive ? "true" : undefined}
            className={`absolute top-28 lg:top-32 right-6 lg:right-10 whitespace-nowrap font-display text-2xl lg:text-3xl transition-all duration-[650ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
              isActive ? "font-black text-[#F5A623]" : "font-bold text-white"
            }`}
            style={{
              opacity,
              pointerEvents: visible ? "auto" : "none",
              transformOrigin: "right center",
              transform: `translateY(-50%) rotateX(${-d * WHEEL_ANGLE_STEP}deg) translateZ(${WHEEL_RADIUS}px) scale(${scale})`,
              filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.55))",
            }}
          >
            {link.label}
          </a>
        );
      })}
    </nav>
  );
}

export default function Navbar() {
  const [activeSection, setActiveSection] = useState("anasayfa");
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const sectionOffsetsRef = useRef({});

  // Cache each section's true document offset once, up front, instead of
  // reading it live at click time. Catalogs/References sit inside
  // `position: sticky` wrappers roughly one viewport tall — once the page
  // has been scrolled past one of those, Chromium can keep reporting its
  // offsetTop/getBoundingClientRect as if it were still stuck at the top,
  // even though it's actually far above. Measuring "up front" isn't enough
  // on its own, though: browsers restore the previous scroll position on
  // reload, so if the page reloads while already scrolled past these
  // sections, this very effect would run with the corruption already in
  // effect and cache the wrong numbers. Forcing scrollY to 0 immediately
  // before measuring (and restoring it right after, all inside a layout
  // effect so it never paints) guarantees a clean read no matter where the
  // page happened to start.
  useLayoutEffect(() => {
    const measure = () => {
      const restoreY = window.scrollY;
      if (restoreY !== 0) window.scrollTo(0, 0);

      const offsets = {};
      for (const link of navLinks) {
        const id = link.href.replace("#", "");
        const el = document.getElementById(id);
        if (!el) continue;
        let top = 0;
        for (let node = el; node; node = node.offsetParent) {
          top += node.offsetTop;
        }
        offsets[id] = top;
      }
      sectionOffsetsRef.current = offsets;

      if (restoreY !== 0) window.scrollTo(0, restoreY);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);

      // "Active" = whichever section is most visibly dominant right now,
      // not just whichever one's top edge crosses a fixed line. A plain
      // rect.top threshold broke once sections started shrinking+fading out
      // via usePinnedPanel's scale transform: scaling down from its own
      // center pushes an outgoing panel's top edge *down* as it shrinks
      // (toward, or even past, that threshold) while it's simultaneously
      // going transparent — so a half-size, half-faded outgoing section
      // could still "win" over the next section already filling the
      // screen underneath it. Weighting each section's viewport overlap by
      // its current opacity picks the one actually dominating the view.
      const vh = window.innerHeight;
      let bestId = null;
      let bestScore = 0;
      for (const link of navLinks) {
        const id = link.href.replace("#", "");
        const el = document.getElementById(id);
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        const overlap = Math.min(rect.bottom, vh) - Math.max(rect.top, 0);
        if (overlap <= 0) continue;
        const opacity = parseFloat(getComputedStyle(el).opacity || "1");
        const score = overlap * opacity;
        if (score > bestScore) {
          bestScore = score;
          bestId = id;
        }
      }
      if (bestId) setActiveSection(bestId);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Lock the page behind the full-screen mobile menu, and let Escape close
  // it like any other modal overlay.
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    if (!menuOpen) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  const handleNavClick = (e, href) => {
    e.preventDefault();
    const id = href.replace("#", "");
    // "Giriş" always means the very top of the page. Scrolling straight to
    // it (rather than scrollIntoView-ing the Hero section) sidesteps About
    // and Services' scroll-jacked pin logic, which can otherwise leave a
    // fixed-position panel from a later section still covering Hero for a
    // moment while the smooth scroll settles.
    if (id === "anasayfa") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      const top = sectionOffsetsRef.current[id];
      if (top != null) {
        window.scrollTo({ top, behavior: "smooth" });
      }
    }
    setMenuOpen(false);
  };

  return (
    <>
      <WheelNav activeSection={activeSection} onNavClick={handleNavClick} />
      <header className="md:hidden fixed top-0 left-0 right-0 z-50 flex justify-center pt-4 px-4">
        {/* Full-screen mobile menu — mounted always so both the open and close
            transitions animate; only interactive/visible while menuOpen. */}
        <div
          className="md:hidden fixed inset-0 bg-[#F5A623]"
          style={{
            opacity: menuOpen ? 1 : 0,
            transform: menuOpen ? "scale(1)" : "scale(0.96)",
            pointerEvents: menuOpen ? "auto" : "none",
            transition: menuOpen
              ? "opacity 400ms cubic-bezier(0.16,1,0.3,1), transform 400ms cubic-bezier(0.16,1,0.3,1)"
              : "opacity 300ms ease-in, transform 300ms ease-in",
          }}
        >
          <div className="h-full flex flex-col justify-center px-8 sm:px-12">
            <nav className="flex flex-col">
              {navLinks.map((link, i) => {
                const isActive = activeSection === link.href.replace("#", "");
                return (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={(e) => handleNavClick(e, link.href)}
                    className="group flex items-baseline gap-3 sm:gap-4 py-2.5 sm:py-3"
                    style={{
                      transition: "transform 500ms cubic-bezier(0.16,1,0.3,1), opacity 500ms ease",
                      transitionDelay: menuOpen ? `${i * 60}ms` : "0ms",
                      transform: menuOpen ? "translateY(0)" : "translateY(20px)",
                      opacity: menuOpen ? 1 : 0,
                    }}
                  >
                    <span
                      className={`font-display text-sm sm:text-base font-bold tabular-nums text-[#1A1A1A] ${
                        isActive ? "opacity-00" : "opacity-40"
                      }`}
                    >
                      0{i + 1}
                    </span>
                    <span className="font-display text-4xl sm:text-5xl font-black tracking-tight text-[#1A1A1A] transition-transform duration-300 group-hover:translate-x-2">
                      {link.label}
                    </span>
                  </a>
                );
              })}
            </nav>

            {/* Wrapper owns the menu-open slide/fade (its own inline
                transform); btn-neu on the <a> owns its independent hover
                tilt — combining both on one element would mean the inline
                style silently wins and the tilt never applies. */}
            <div
              className="mt-10 sm:mt-12 self-start"
              style={{
                transition: "transform 500ms cubic-bezier(0.16,1,0.3,1), opacity 500ms ease",
                transitionDelay: menuOpen ? `${navLinks.length * 60}ms` : "0ms",
                transform: menuOpen ? "translateY(0)" : "translateY(20px)",
                opacity: menuOpen ? 1 : 0,
              }}
            >
              <a
                href="tel:05324457997"
                className="btn-neu inline-flex items-center gap-2 bg-[#F8F8F8] hover:bg-white text-[#1A1A1A] font-bold text-base px-6 py-3"
              >
                <PhoneIcon className="w-4 h-4" />
                0532 445 79 97
              </a>
            </div>
          </div>
        </div>

        {/* Mobile-only bar: logo + hamburger trigger for the full-screen menu
            above. Desktop navigation lives entirely in WheelNav now. */}
        <nav
          className={`relative z-10 w-full max-w-5xl transition-all duration-300 rounded-tl-[2.5rem] rounded-tr-lg rounded-br-[2.5rem] rounded-bl-lg px-5 sm:px-7 py-2 sm:py-2.5 flex items-center justify-between ring-1 border-b-2 border-[#F5A623]/70 ${
            scrolled
              ? "bg-[#1A1A1A]/95 backdrop-blur-md ring-white/10 shadow-xl shadow-black/30"
              : "bg-[#1A1A1A]/70 backdrop-blur-md ring-white/5"
          }`}
        >
          {/* Logo */}
          <a
            href="#anasayfa"
            onClick={(e) => handleNavClick(e, "#anasayfa")}
            className="flex items-center flex-shrink-0"
          >
            <img
              src={logoSrc}
              alt="Yıldırım Reklam Ajansı"
              className="h-20 sm:h-24 w-auto object-contain"
            />
          </a>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="relative z-10 flex flex-col justify-center items-center w-9 h-9 gap-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            aria-label={menuOpen ? "Menüyü kapat" : "Menüyü aç"}
            aria-expanded={menuOpen}
          >
            <span className={`block w-5 h-0.5 bg-white transition-all duration-300 ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
            <span className={`block w-5 h-0.5 bg-white transition-all duration-300 ${menuOpen ? "opacity-0" : ""}`} />
            <span className={`block w-5 h-0.5 bg-white transition-all duration-300 ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
          </button>
        </nav>
      </header>
    </>
  );
}
