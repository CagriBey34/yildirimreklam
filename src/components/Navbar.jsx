import { useEffect, useLayoutEffect, useRef, useState } from "react";
import logoSrc from "../assets/logo-mark.webp";
import { navigateTo } from "../lib/navigate";
import { gsap, prefersReducedMotion } from "../lib/motion";
import { navLinks } from "../data/navLinks";
import { ColorBar, RegMark } from "./ui/Print";

// One-line summary under each menu entry, keyed by section id.
const blurbs = {
  anasayfa: "Atölye turu",
  hakkimizda: "Biz kimiz, neden biz",
  hizmetlerimiz: "Tabela · Baskı · Promosyon · Matbaa",
  kataloglarimiz: "Promosyon ve plaket katalogları",
  referanslarimiz: "Birlikte çalıştığımız markalar",
  iletisim: "Ücretsiz keşif ve teklif",
};

// Which section currently owns the upper-middle of the viewport.
function useActiveSection() {
  const [active, setActive] = useState("anasayfa");
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const mid = window.innerHeight * 0.45;
      for (const { id } of navLinks) {
        const r = document.getElementById(id)?.getBoundingClientRect();
        if (r && r.top <= mid && r.bottom > mid) {
          setActive(id);
          return;
        }
      }
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);
  return active;
}

function ArrowIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14m-6-6l6 6-6 6" />
    </svg>
  );
}

// Full-screen menu as a yellow print sheet: it drops down from the top edge,
// then each section slides in as a ruled row of an index table. Hovering a
// row floods it with ink.
function MenuSheet({ open, active, onNavigate }) {
  const ref = useRef(null);
  const mounted = useRef(false);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!mounted.current) {
      mounted.current = true;
      gsap.set(el, { clipPath: "inset(0% 0% 100% 0%)", visibility: "hidden" });
      return;
    }
    const k = prefersReducedMotion() ? 0 : 1;
    const rows = el.querySelectorAll(".menu-row");
    const extras = el.querySelectorAll(".menu-fade");
    const tl = gsap.timeline();
    if (open) {
      tl.set(el, { visibility: "visible" })
        .to(el, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.75 * k, ease: "expo.inOut" })
        .fromTo(
          rows,
          { xPercent: -6, autoAlpha: 0 },
          { xPercent: 0, autoAlpha: 1, duration: 0.8 * k, ease: "expo.out", stagger: 0.06 * k },
          0.35 * k
        )
        .fromTo(extras, { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.6 * k, ease: "power3.out" }, 0.6 * k);
    } else {
      tl.to(el, { clipPath: "inset(0% 0% 100% 0%)", duration: 0.6 * k, ease: "expo.inOut" }).set(el, { visibility: "hidden" });
    }
    return () => tl.kill();
  }, [open]);

  const tab = open ? 0 : -1;

  return (
    <div
      ref={ref}
      id="site-menu"
      role="dialog"
      aria-modal="true"
      aria-label="Site menüsü"
      aria-hidden={!open}
      className="fixed inset-0 z-[55] flex flex-col bg-brand text-ink"
    >
      {["top-4 left-4", "top-4 right-[5.5rem] sm:right-24", "bottom-4 left-4", "bottom-4 right-4"].map((pos) => (
        <RegMark key={pos} className={`menu-fade absolute ${pos} h-5 w-5 text-ink/50`} />
      ))}

      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-5 pt-24 pb-6 sm:px-8 sm:pt-28">
        <div className="menu-fade label flex items-center justify-between border-b border-ink pb-3">
          <span>Sayfa dizini</span>
          <ColorBar />
        </div>

        <nav aria-label="Menü" className="flex flex-1 flex-col justify-center py-4">
          <ol>
            {navLinks.map((link) => {
              const on = active === link.id;
              return (
                <li key={link.id} className="menu-row border-b border-ink/25">
                  <a
                    href={`#${link.id}`}
                    tabIndex={tab}
                    aria-current={on ? "true" : undefined}
                    onClick={(e) => onNavigate(e, link.id)}
                    className="group grid grid-cols-[1fr_auto] items-center gap-3 px-1 py-[clamp(0.45rem,1.6vh,1.1rem)] transition-colors duration-300 hover:bg-ink hover:text-brand focus-visible:bg-ink focus-visible:text-brand focus-visible:outline-none sm:gap-6 sm:px-3 lg:grid-cols-[1fr_auto_auto]"
                  >
                    <span className="display flex items-center gap-3 text-[clamp(1.1rem,min(5.4vh,5.8vw),3.6rem)] leading-[1.05] transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-2">
                      {link.label}
                      {on && (
                        <span className="label hidden rounded-[2px] bg-ink px-2 py-1 text-[0.7rem] normal-case text-brand sm:inline group-hover:bg-brand group-hover:text-ink">
                          Buradasınız
                        </span>
                      )}
                    </span>
                    <span className="label hidden text-ink/60 group-hover:text-brand/80 lg:block">{blurbs[link.id]}</span>
                    <ArrowIcon className="h-5 w-5 transition-transform duration-500 group-hover:-rotate-45 sm:h-6 sm:w-6" />
                  </a>
                </li>
              );
            })}
          </ol>
        </nav>

        <div className="menu-fade grid gap-4 border-t border-ink pt-4 sm:grid-cols-[1fr_1fr_1fr_auto] sm:items-end sm:gap-8">
          <a href="mailto:info@yildirimreklam.tr" tabIndex={tab} className="group">
            <span className="label block text-ink/55">E-posta</span>
            <span className="font-semibold group-hover:underline">info@yildirimreklam.tr</span>
          </a>
          <a
            href="https://wa.me/905550087921?text=Merhaba%2C%20bilgi%20almak%20istiyorum."
            target="_blank"
            rel="noopener noreferrer"
            tabIndex={tab}
            className="group"
          >
            <span className="label block text-ink/55">WhatsApp</span>
            <span className="font-semibold group-hover:underline">0555 008 79 21</span>
          </a>
          <div className="hidden sm:block">
            <span className="label block text-ink/55">Çalışma saatleri</span>
            <span className="font-semibold">Pzt – Cmt · 08:00 – 18:00</span>
          </div>
          <a href="#iletisim" tabIndex={tab} onClick={(e) => onNavigate(e, "iletisim")} className="btn btn-ink justify-between">
            Teklif Al <ArrowIcon className="btn-arrow h-4 w-4" />
          </a>
        </div>
      </div>
    </div>
  );
}

export default function Navbar() {
  const active = useActiveSection();
  const [menuOpen, setMenuOpen] = useState(false);
  const buttonRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return;
    const button = buttonRef.current;
    document.body.style.overflow = "hidden";
    const onKeyDown = (e) => e.key === "Escape" && setMenuOpen(false);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
      // Return focus to the menu button once the sheet closes.
      button?.focus({ preventScroll: true });
    };
  }, [menuOpen]);

  const handleNavigate = (e, id) => {
    e.preventDefault();
    if (menuOpen) {
      setMenuOpen(false);
      // Let the sheet start lifting before the page curtain takes over.
      setTimeout(() => navigateTo(id), 250);
    } else {
      navigateTo(id);
    }
  };

  return (
    <>
      <MenuSheet open={menuOpen} active={active} onNavigate={handleNavigate} />

      {/* Two floating pieces instead of a full bar: logo chip (left) and the
          always-visible menu button (right). */}
      <a
        href="#anasayfa"
        onClick={(e) => handleNavigate(e, "anasayfa")}
        aria-label="Yıldırım Reklam Ajansı — başa dön"
        className="fixed left-3 top-3 z-[60] flex h-14 items-center rounded-[3px] bg-ink/92 px-3.5 shadow-[0_18px_40px_-24px_rgba(0,0,0,0.6)] backdrop-blur-md sm:left-5 sm:top-5 sm:h-16 sm:px-4"
      >
        <img src={logoSrc} alt="" className="h-8 w-auto object-contain sm:h-9" />
      </a>

      <div className="fixed right-3 top-3 z-[60] flex items-center gap-2 sm:right-5 sm:top-5">
        <a
          href="#iletisim"
          onClick={(e) => handleNavigate(e, "iletisim")}
          className={`btn btn-brand hidden h-16 transition-opacity duration-300 sm:inline-flex ${
            menuOpen ? "pointer-events-none opacity-0" : "opacity-100"
          }`}
          tabIndex={menuOpen ? -1 : 0}
        >
          Teklif Al
        </a>
        <button
          ref={buttonRef}
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label={menuOpen ? "Menüyü kapat" : "Menüyü aç"}
          aria-expanded={menuOpen}
          aria-controls="site-menu"
          className="group relative flex h-14 w-14 items-center justify-center rounded-[3px] bg-ink text-brand shadow-[0_18px_40px_-24px_rgba(0,0,0,0.6)] ring-1 ring-paper/10 transition-transform duration-300 hover:scale-[1.04] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-ink sm:h-16 sm:w-16"
        >
          <span
            className={`absolute h-[2px] w-6 bg-current transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              menuOpen ? "rotate-45" : "-translate-y-[5px] group-hover:-translate-y-[6px]"
            }`}
          />
          <span
            className={`absolute h-[2px] bg-current transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              menuOpen ? "w-6 -rotate-45" : "w-6 translate-y-[5px] group-hover:translate-y-[6px] sm:w-4 sm:translate-x-1"
            }`}
          />
        </button>
      </div>
    </>
  );
}
