import { useLayoutEffect, useRef } from "react";
import logoSrc from "../assets/logo-mark.webp";
import { navLinks } from "../data/navLinks";
import { navigateTo } from "../lib/navigate";
import { gsap, MOTION_OK } from "../lib/motion";
import { ColorBar, RegMark } from "./ui/Print";

function ArrowUpIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19V5m-6 6l6-6 6 6" />
    </svg>
  );
}

// Full-screen closing sheet: as it scrolls in, the logo grows into the
// centre of the screen and the menu rises in beneath it.
export default function Footer() {
  const footerRef = useRef(null);
  const logoRef = useRef(null);
  const restRef = useRef(null);

  useLayoutEffect(() => {
    const mm = gsap.matchMedia();
    mm.add(MOTION_OK, () => {
      const tl = gsap.timeline({
        scrollTrigger: { trigger: footerRef.current, start: "top bottom", end: "bottom bottom", scrub: 0.6 },
      });
      tl.from(logoRef.current, { scale: 0.45, autoAlpha: 0, ease: "power2.out" }).from(
        restRef.current.children,
        { y: 40, autoAlpha: 0, stagger: 0.12, ease: "power2.out" },
        0.35
      );
    });
    return () => mm.revert();
  }, []);

  const go = (id) => (e) => {
    e?.preventDefault();
    navigateTo(id);
  };

  return (
    <footer ref={footerRef} className="relative flex min-h-svh flex-col overflow-hidden bg-ink text-paper">
      {["top-5 left-5", "top-5 right-5", "bottom-5 left-5 hidden sm:block", "bottom-5 right-5 hidden sm:block"].map((pos) => (
        <RegMark key={pos} className={`absolute ${pos} h-5 w-5 text-paper/25`} />
      ))}

      <div className="flex flex-1 flex-col items-center justify-center px-5 pt-24 pb-12 text-center">
        <img
          ref={logoRef}
          src={logoSrc}
          alt="Yıldırım Reklam Ajansı"
          className="w-[min(84vw,820px)] h-auto object-contain will-change-transform"
        />

        <div ref={restRef} className="mt-10 sm:mt-14 flex flex-col items-center">
          <p className="label text-paper/50">Fikrinizi tasarlıyor, markanızı görünür kılıyoruz</p>

          <nav aria-label="Alt menü" className="mt-10 sm:mt-12">
            <ul className="flex flex-wrap justify-center gap-x-6 gap-y-2 sm:gap-x-10">
              {navLinks.map((l) => (
                <li key={l.id}>
                  <a
                    href={`#${l.id}`}
                    onClick={go(l.id)}
                    className="display text-xl sm:text-[1.3rem] text-paper/85 transition-colors duration-300 hover:text-brand"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <ul className="label mt-10 flex flex-wrap justify-center gap-x-6 gap-y-2 text-paper/55">
            <li>
              <a href="tel:05324457997" className="transition-colors duration-300 hover:text-brand">
                0555 008 79 21
              </a>
            </li>
            <li>
              <a href="mailto:info@yildirimreklam.tr" className="normal-case tracking-normal transition-colors duration-300 hover:text-brand">
                info@yildirimreklam.tr
              </a>
            </li>
            <li>Pzt – Cmt · 08:00 – 18:00</li>
            <li>Türkiye geneli hizmet</li>
          </ul>

          <a href="#anasayfa" onClick={go("anasayfa")} className="btn btn-brand mt-12 group">
            <ArrowUpIcon className="h-4 w-4 transition-transform duration-500 group-hover:-translate-y-1" />
            Yukarı çık
          </a>
        </div>
      </div>

      <div className="border-t border-paper/15">
        <div className="label mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-5 py-5 pb-24 text-paper/40 sm:flex-row sm:px-8 sm:pb-5">
          <p>© {new Date().getFullYear()} Yıldırım Reklam Ajansı</p>
          <ColorBar />
        </div>
      </div>
    </footer>
  );
}
