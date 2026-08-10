import { useLayoutEffect, useRef } from "react";
import logoSrc from "../assets/logokeee.png";

const navLinks = [
  { label: "Giriş", href: "#anasayfa" },
  { label: "Hakkımızda", href: "#hakkimizda" },
  { label: "Hizmetlerimiz", href: "#hizmetlerimiz" },
  { label: "Kataloglarımız", href: "#kataloglarimiz" },
  { label: "Referanslarımız", href: "#referanslarimiz" },
  { label: "İletişim", href: "#iletisim" },
];

export default function Footer() {
  const sectionOffsetsRef = useRef({});

  // Cache each section's true document offset once, up front, instead of
  // reading it live at click time. Catalogs/References sit inside
  // `position: sticky` wrappers roughly one viewport tall — since the
  // footer sits below all of them, every click here happens after the page
  // has already scrolled past those sections, and Chromium can keep
  // reporting their offsetTop/getBoundingClientRect as if still stuck at
  // the top even though they're actually far above. Measuring "up front"
  // isn't enough on its own, though: browsers restore the previous scroll
  // position on reload, so if the page reloads while already scrolled past
  // these sections, this very effect would run with the corruption already
  // in effect and cache the wrong numbers. Forcing scrollY to 0 immediately
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

  const handleNavClick = (e, href) => {
    e.preventDefault();
    const id = href.replace("#", "");
    if (id === "anasayfa") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const top = sectionOffsetsRef.current[id];
    if (top != null) {
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  return (
    <footer className="bg-[#111111] border-t border-white/5 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
          {/* Brand */}
          <div>
            <img src={logoSrc} alt="Yıldırım Reklam Ajansı" className="h-16 sm:h-20 w-auto object-contain mb-5" />
            <p className="text-white/60 text-sm leading-relaxed max-w-xs">
              Tabela, dijital baskı, promosyon ve matbaa alanlarında profesyonel çözümler.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-display text-white font-bold text-sm uppercase tracking-wider mb-4">Sayfalar</h4>
            <ul className="space-y-2">
              {navLinks.map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    onClick={(e) => handleNavClick(e, l.href)}
                    className="text-white/60 hover:text-[#F5A623] text-sm transition-colors duration-200"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display text-white font-bold text-sm uppercase tracking-wider mb-4">İletişim</h4>
            <div className="space-y-3">
              <a href="tel:05324457997" className="flex items-center gap-2 text-white/60 hover:text-[#F5A623] text-sm transition-colors duration-200">
                <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z" />
                </svg>
                0532 445 79 97
              </a>
              <a href="mailto:info@yildirim-reklam.com" className="flex items-center gap-2 text-white/60 hover:text-[#F5A623] text-sm transition-colors duration-200">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                info@yildirimreklam.tr
              </a>
              <p className="flex items-center gap-2 text-white/60 text-sm">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
                Türkiye Geneli Hizmet
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/25 text-xs">
            © {new Date().getFullYear()} Yıldırım Reklam Ajansı. Tüm hakları saklıdır.
          </p>
          <p className="text-white/25 text-xs">
            Fikrinizi Tasarlıyor, Markanızı Görünür Kılıyoruz.
          </p>
        </div>
      </div>
    </footer>
  );
}
