import { useCallback, useEffect, useRef } from "react";
import { createPortal } from "react-dom";

import { usePinnedPanel } from "../hooks/usePinnedPanel";
import { useHashRoute } from "../hooks/useHashRoute";
import { catalogs, findCatalog } from "../data/catalogs";
import PdfFlipBook from "./PdfFlipBook/PdfFlipBook";

function DocumentIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 3h6l5 5v12a1 1 0 01-1 1H7a1 1 0 01-1-1V4a1 1 0 011-1z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 3v5h5" />
    </svg>
  );
}

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

export default function Catalogs() {
  const panelRef = useRef(null);
  const innerRef = useRef(null);

  usePinnedPanel(panelRef, { innerRef });

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
  // ScrollTrigger'a hiç dokunulmuyor: pin'lenmiş bölümler olduğu gibi kalıyor,
  // sadece body'nin overflow'u geçici olarak kilitleniyor.
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
      <section
        ref={panelRef}
        id="kataloglarimiz"
        className="min-h-dvh flex flex-col items-center justify-center px-5 sm:px-8 py-24 bg-[#0D0D0D]"
      >
        <div ref={innerRef} className="w-full flex flex-col items-center">
          <div className="max-w-2xl mx-auto text-center mb-14 sm:mb-20">
            <span className="inline-block text-[#F5A623] text-xs sm:text-sm font-bold tracking-[0.25em] uppercase mb-4">
              Kataloglarımız
            </span>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-black text-white leading-tight">
              Ürünlerimizi <span className="text-[#F5A623]">PDF olarak</span> inceleyin
            </h2>
          </div>

          <div className="w-full max-w-3xl grid sm:grid-cols-2 gap-x-10 gap-y-16 sm:gap-y-20 place-items-center">
            {catalogs.map((cat) => (
              <a
                key={cat.slug}
                href={`#/katalog/${cat.slug}`}
                className="catalog-card-neu w-full max-w-xs bg-[#F8F8F8] p-6 sm:p-7 flex flex-col items-start gap-4 text-left focus:outline-none cursor-pointer"
              >
                <span className="inline-flex items-center justify-center w-12 h-12 border-[3px] border-black bg-[#F5A623] flex-shrink-0">
                  <DocumentIcon className="w-6 h-6 text-black" />
                </span>

                <div>
                  <h3 className="font-display text-xl sm:text-2xl font-black text-[#1A1A1A] leading-snug">
                    {cat.title}
                  </h3>
                  <p className="text-[#1A1A1A]/50 text-sm font-semibold mt-1">
                    PDF · {cat.sizeLabel}
                  </p>
                </div>

                <span className="inline-flex items-center gap-2 font-bold text-sm text-[#1A1A1A]">
                  <DocumentIcon className="w-4 h-4" />
                  Kataloğu İncele
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Modal doğrudan body altına portallanıyor. Catalogs section'ı GSAP
          tarafından pin'lenip transform ediliyor; transform'lu bir atanın
          içinde position:fixed viewport'a değil o ataya göre konumlanır ve
          modal ekranı kaplayamazdı. Portal bu zincirin tamamen dışına çıkarıyor. */}
      {openCatalog &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`${openCatalog.title} önizleme`}
            className="fixed inset-0 z-[9999] flex flex-col bg-[#0D0D0D]/95 backdrop-blur-md"
          >
            {/* Başlık çubuğu: butonlar sitenin .btn-neu dilinde. Sağ tarafta
                pr fazlası bilinçli — .btn-neu'nun sert gölgesi hover'da 11px
                dışarı taşıyor, dar padding'de ekran kenarında kırpılıyordu. */}
            <header className="shrink-0 flex items-center justify-between gap-4 border-b border-white/10 bg-[#141414]/90 py-4 pl-4 pr-5 md:py-5 md:pl-8 md:pr-9">
              <div className="min-w-0">
                <p className="truncate font-display text-base font-black text-white md:text-lg">
                  {openCatalog.title}
                </p>
                <p className="text-xs font-semibold text-white/40">
                  PDF · {openCatalog.sizeLabel}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-3 md:gap-4">
                <a
                  href={openCatalog.file}
                  download={openCatalog.downloadName}
                  className="btn-neu inline-flex items-center gap-2 bg-[#F5A623] px-3 py-2.5 font-bold text-sm text-[#1A1A1A] hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white md:px-5 md:py-3"
                >
                  <DownloadIcon className="h-4 w-4" />
                  <span className="hidden sm:inline">PDF İndir</span>
                </a>

                <button
                  type="button"
                  onClick={closeModal}
                  aria-label="Kataloğu kapat"
                  className="btn-neu flex h-11 w-11 items-center justify-center bg-[#F8F8F8] text-[#1A1A1A] hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
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
