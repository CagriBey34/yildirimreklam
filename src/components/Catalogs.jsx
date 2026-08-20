import { useRef } from "react";
import { usePinnedPanel } from "../hooks/usePinnedPanel";

const catalogs = [
  {
    title: "Promosyon Kataloğu",
    file: "/katalog/Promosyon-Katalogu-1.pdf",
    downloadName: "Promosyon-Katalogu.pdf",
    sizeLabel: "126 MB",
  },
  {
    title: "Kristal Kataloğu",
    file: "/katalog/kristal_katalog.pdf",
    downloadName: "Kristal-Katalogu.pdf",
    sizeLabel: "99 MB",
  },
];

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

export default function Catalogs() {
  const panelRef = useRef(null);
  const innerRef = useRef(null);
  usePinnedPanel(panelRef, { innerRef });

  return (
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
              key={cat.file}
              href={cat.file}
              download={cat.downloadName}
              className="catalog-card-neu w-full max-w-xs bg-[#F8F8F8] p-6 sm:p-7 flex flex-col items-start gap-4 focus:outline-none"
            >
              <span className="inline-flex items-center justify-center w-12 h-12 border-[3px] border-black bg-[#F5A623] flex-shrink-0">
                <DocumentIcon className="w-6 h-6 text-black" />
              </span>
              <div>
                <h3 className="font-display text-xl sm:text-2xl font-black text-[#1A1A1A] leading-snug">
                  {cat.title}
                </h3>
                <p className="text-[#1A1A1A]/50 text-sm font-semibold mt-1">PDF · {cat.sizeLabel}</p>
              </div>
              <span className="inline-flex items-center gap-2 font-bold text-sm text-[#1A1A1A]">
                <DownloadIcon className="w-4 h-4" />
                Kataloğu İndir
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
