import { useCallback, useEffect, useRef } from "react";
import { createPortal } from "react-dom";

import { useReveal } from "../lib/motion";
import { useHashRoute } from "../hooks/useHashRoute";
import { catalogs, findCatalog } from "../data/catalogs";
import { SplitText } from "./ui/SplitText";
import { ColorBar, SectionHead } from "./ui/Print";
import PdfFlipBook from "./PdfFlipBook/PdfFlipBook";

function DownloadIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v12m0 0l-4.5-4.5M12 15l4.5-4.5" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 18v2a1 1 0 001 1h14a1 1 0 001-1v-2" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5">
      <path d="M6 6l12 12M18 6L6 18" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

// A catalog as a printed booklet: the cover (the catalog's real cover when
// there is one, otherwise a branded yellow/ink cover) sits on a real inner
// page taken from the PDF. On hover the cover swings open on its spine to
// reveal that page.
const OPEN = "group-hover:[transform:rotateY(-58deg)] group-focus-visible:[transform:rotateY(-58deg)]";

function BrandCover({ cat, dark }) {
  const word = cat.title.replace(/\s*Kataloğu$/, "");
  return (
    <div className={`@container absolute inset-0 flex flex-col justify-between p-[9%] ${dark ? "bg-ink text-paper" : "bg-brand text-ink"}`}>
      <div className="flex items-center justify-between">
        <span className="label opacity-70">Katalog{cat.edition ? ` · ${cat.edition}` : ""}</span>
        <ColorBar />
      </div>
      <div>
        {/* Sized in container units: scales with the cover itself, so the
            longest title ("Promosyon") always fits on one line. */}
        <p className="display text-[11cqw] leading-[0.95] whitespace-nowrap">{word}</p>
        <p className="mt-3 label opacity-70">Yıldırım Reklam Ajansı</p>
      </div>
    </div>
  );
}

function CatalogCard({ cat, index }) {
  const dark = index % 2 === 1;
  return (
    <a
      href={`#/katalog/${cat.slug}`}
      className="group block focus-visible:outline-2 focus-visible:outline-ink focus-visible:outline-offset-4"
    >
      <div className="crop relative flex items-center justify-center bg-paper-2 px-6 py-14 sm:py-20 [perspective:1600px]">
        <div className="relative aspect-[1/1.414] w-[58%] max-w-[300px]">
          {/* page edges behind */}
          {[3, 2].map((k) => (
            <span
              key={k}
              className="absolute inset-0 border border-ink/10 bg-sheet"
              style={{ transform: `translate(${k * 4}px, ${k * 3}px)` }}
              aria-hidden="true"
            />
          ))}
          {/* first inner page, revealed when the cover opens */}
          <img
            src={cat.preview}
            alt=""
            loading="lazy"
            className="absolute inset-0 h-full w-full border border-ink/10 bg-sheet object-cover"
            style={{ transform: "translate(4px, 3px)" }}
          />
          {/* cover */}
          <div
            className={`absolute inset-0 origin-left overflow-hidden shadow-[0_30px_50px_-30px_rgba(0,0,0,0.55)] transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${OPEN}`}
          >
            {cat.cover ? (
              <img src={cat.cover} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
            ) : (
              <BrandCover cat={cat} dark={dark} />
            )}
            <span className="absolute inset-y-0 left-0 w-[7%] bg-gradient-to-r from-black/30 to-transparent" aria-hidden="true" />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-6 border-b border-ink py-5">
        <div>
          <h3 className="display text-2xl sm:text-3xl">
            {cat.title}
            {cat.edition && <span className="ml-2 text-ink/40">{cat.edition}</span>}
          </h3>
          <p className="mt-1 label text-ink/50">
            PDF · {cat.pages} sayfa · {cat.sizeLabel} · Çevirerek inceleyin
          </p>
        </div>
        <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center border border-ink transition-colors duration-500 group-hover:bg-ink group-hover:text-paper">
          <svg className="w-5 h-5 transition-transform duration-500 group-hover:-rotate-45" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14m-6-6l6 6-6 6" />
          </svg>
        </span>
      </div>
      <span className="sr-only">{cat.title} — kataloğu incele</span>
    </a>
  );
}

export default function Catalogs() {
  const gridRef = useRef(null);
  useReveal(gridRef, { stagger: true, y: 60 });

  // Modal hangi kataloğun açık olduğunu URL'den okuyor. Böylece kartlar düz
  // <a> linki olarak kalıyor (yeni sekmede açma, kopyalama, paylaşma çalışır)
  // ve #/katalog/<slug> adresi doğrudan açıldığında modal açık geliyor.
  const { route, navigated } = useHashRoute();
  const catalogMatch = route.match(/^\/katalog\/([^/?]+)/);
  const openCatalog = catalogMatch ? findCatalog(decodeURIComponent(catalogMatch[1])) : null;

  const closeModal = useCallback(() => {
    // Siteden gelindiyse geri gitmek önceki scroll konumunu da geri getiriyor.
    // Link doğrudan açıldıysa geçmişte site içi adım yok; o durumda geri gitmek
    // kullanıcıyı siteden çıkarırdı, onun yerine kataloglar bölümüne düşüyoruz.
    if (navigated) {
      window.history.back();
    } else {
      window.location.hash = "#kataloglarimiz";
    }
  }, [navigated]);

  // ESC ile kapat + modal açıkken arka planın scroll etmesini engelle.
  useEffect(() => {
    if (!openCatalog) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event) => {
      if (event.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [openCatalog, closeModal]);

  return (
    <>
      <section id="kataloglarimiz" className="relative py-24 sm:py-36">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <SectionHead index="03" label="Kataloglarımız" aside={`${catalogs.length} katalog · PDF`} />
          <div className="mt-12 sm:mt-16 grid gap-8 lg:grid-cols-12 lg:items-end">
            <SplitText
              className="lg:col-span-8 display text-[2.3rem] sm:text-[4.2rem] lg:text-[5.4rem]"
              parts={[{ text: "Ürünlerimizi " }, { text: "sayfa sayfa", className: "mark" }, { text: " inceleyin." }]}
            />
            <p className="lg:col-span-4 text-ink/65 leading-relaxed lg:pb-3">
              Kataloglarımızı sitede çevirerek inceleyebilir ya da PDF olarak indirebilirsiniz.
            </p>
          </div>

          <div ref={gridRef} className="mt-14 sm:mt-20 grid gap-14 md:grid-cols-2 md:gap-10">
            {catalogs.map((cat, i) => (
              <CatalogCard key={cat.slug} cat={cat} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* Modal doğrudan body altına portallanıyor: reveal animasyonları
          bölümlere geçici transform veriyor ve transform'lu bir atanın
          içinde position:fixed viewport'a değil o ataya göre konumlanır. */}
      {openCatalog &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`${openCatalog.title} önizleme`}
            className="modal-in fixed inset-0 z-[9999] flex flex-col bg-ink/95 backdrop-blur-xl"
          >
            <header className="shrink-0 flex items-center justify-between gap-4 border-b border-white/[0.07] py-4 px-4 md:py-5 md:px-8">
              <div className="min-w-0">
                <p className="truncate font-display text-base font-extrabold text-paper md:text-lg">{openCatalog.title}</p>
                <p className="text-xs font-semibold text-paper/40">PDF · {openCatalog.sizeLabel}</p>
              </div>

              <div className="flex shrink-0 items-center gap-2 md:gap-3">
                <a href={openCatalog.file} download={openCatalog.downloadName} className="btn btn-primary btn-sm">
                  <DownloadIcon className="h-4 w-4" />
                  <span className="hidden sm:inline">PDF İndir</span>
                </a>

                <button
                  type="button"
                  onClick={closeModal}
                  aria-label="Kataloğu kapat"
                  className="btn-icon flex h-11 w-11 items-center justify-center bg-white/[0.08] hover:bg-white/[0.16] text-paper focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                >
                  <CloseIcon />
                </button>
              </div>
            </header>

            <div className="min-h-0 flex-1">
              <PdfFlipBook key={openCatalog.slug} pdfUrl={openCatalog.file} />
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
