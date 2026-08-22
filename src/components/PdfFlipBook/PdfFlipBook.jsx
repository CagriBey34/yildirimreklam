import {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { Document, Page, pdfjs } from "react-pdf";
import HTMLFlipBook from "react-pageflip";

import { playPageFlipSound, preloadPageFlipSound } from "../../utils/pageFlipSound";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

// Çift sayfa (kitap gibi açık) görünüme ancak bu genişlikten sonra geçiliyor;
// altında tek sayfa gösteriliyor, yoksa telefonda iki sayfa da okunamayacak
// kadar küçülüyor.
const SPREAD_BREAKPOINT = 820;

// Katalog 260+ sayfa: hepsini aynı anda canvas'a çizmek mümkün değil. Sadece
// mevcut sayfanın çevresindeki bir pencere gerçekten render ediliyor, geri
// kalanı boş kağıt olarak duruyor. Pencere her çevirmede değil, her
// WINDOW_STEP sayfada bir kayıyor — böylece react-pageflip'in çocuk listesi
// sürekli yeniden kurulmuyor.
const WINDOW_STEP = 6;

const DEFAULT_PAGE_ASPECT = 1 / 1.414; // A4 dikey, ilk sayfa ölçülene kadar

const SOUND_STORAGE_KEY = "yr:katalog-ses";

function readSoundPreference() {
  try {
    return window.localStorage.getItem(SOUND_STORAGE_KEY) !== "kapali";
  } catch {
    // Gizli sekme / çerez engeli: ses açık varsayılıyor.
    return true;
  }
}

const BookPage = forwardRef(function BookPage({ pageNumber, pageWidth, shouldRender }, ref) {
  return (
    <div ref={ref} className="bg-white overflow-hidden">
      {shouldRender ? (
        <Page
          pageNumber={pageNumber}
          width={pageWidth}
          renderTextLayer={false}
          renderAnnotationLayer={false}
          loading=""
          error=""
          noData=""
        />
      ) : null}
    </div>
  );
});

function formatMb(bytes) {
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function PdfFlipBook({ pdfUrl }) {
  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageAspect, setPageAspect] = useState(DEFAULT_PAGE_ASPECT);
  const [progress, setProgress] = useState(null);
  const [stageSize, setStageSize] = useState({ width: 0, height: 0 });
  const [soundEnabled, setSoundEnabled] = useState(readSoundPreference);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const rootRef = useRef(null);
  const bookRef = useRef(null);
  const stageObserverRef = useRef(null);

  // Ekran ölçüsü değişince react-pageflip'i yeniden kurmak gerekiyor (boyutu
  // yalnızca ilk kurulumda okuyor). Yeniden kurulduğunda okunan sayfada
  // kalabilmek için son konum burada tutuluyor.
  const flipIndexRef = useRef(0);

  // react-pageflip olay dinleyicilerini yalnızca sayfa listesi değiştiğinde
  // yeniden bağlıyor; handler'ın kendisi güncellense bile eski kopya dinlemeye
  // devam ediyor. Bu yüzden ses tercihi ve son çevirme durumu state'ten değil
  // ref'ten okunuyor, aksi halde handler bayat bir değere takılı kalırdı.
  const soundEnabledRef = useRef(soundEnabled);
  const flipStateRef = useRef("read");

  useEffect(() => {
    soundEnabledRef.current = soundEnabled;
  }, [soundEnabled]);

  // Ölçüm bir effect'te değil callback ref'te kuruluyor: PDF inerken
  // <Document> children'ı yerine "yükleniyor" bloğunu basıyor, yani bu kutu
  // mount anında henüz DOM'da yok. Callback ref eleman gerçekten belirdiğinde
  // tetiklendiği için ölçüm kaçmıyor.
  const setStageRef = useCallback((node) => {
    stageObserverRef.current?.disconnect();
    stageObserverRef.current = null;

    if (!node) return;

    const measure = () => {
      const rect = node.getBoundingClientRect();
      setStageSize((previous) =>
        Math.abs(previous.width - rect.width) < 1 && Math.abs(previous.height - rect.height) < 1
          ? previous
          : { width: rect.width, height: rect.height }
      );
    };

    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(node);
    stageObserverRef.current = observer;
  }, []);

  useEffect(() => () => stageObserverRef.current?.disconnect(), []);

  const handleDocumentLoadSuccess = useCallback(async (pdf) => {
    setNumPages(pdf.numPages);
    setProgress(null);

    // Çevirme sesini şimdiden indirip decode et; ilk çevirmede hazır olsun.
    if (soundEnabledRef.current) preloadPageFlipSound();

    // Kitabın oranını kataloğun kendi sayfa oranından alıyoruz; sabit bir
    // orana zorlanınca sayfalar ya kırpılıyor ya da kenarlarda boşluk kalıyor.
    try {
      const firstPage = await pdf.getPage(1);
      const viewport = firstPage.getViewport({ scale: 1 });
      if (viewport.width > 0 && viewport.height > 0) {
        setPageAspect(viewport.width / viewport.height);
      }
    } catch {
      // Oran okunamazsa varsayılan A4 oranıyla devam.
    }
  }, []);

  const handleLoadProgress = useCallback(({ loaded, total }) => {
    setProgress({ loaded, total });
  }, []);

  const layout = useMemo(() => {
    const { width, height } = stageSize;
    if (width < 40 || height < 40) return null;

    const isSpread = width >= SPREAD_BREAKPOINT;
    const pagesAcross = isSpread ? 2 : 1;

    // Kenarlarda biraz nefes payı bırak, kalanına sığdır.
    const availableWidth = Math.max(width - 24, 120);
    const availableHeight = Math.max(height - 24, 160);

    const pageWidth = Math.max(
      Math.floor(Math.min(availableWidth / pagesAcross, availableHeight * pageAspect)),
      120
    );
    const pageHeight = Math.max(Math.round(pageWidth / pageAspect), 160);

    return { isSpread, pagesAcross, pageWidth, pageHeight };
  }, [stageSize, pageAspect]);

  // Render penceresi: her sayfada değil, WINDOW_STEP'lik bloklar halinde kayar.
  const renderRange = useMemo(() => {
    if (!numPages) return { start: 1, end: 0 };
    const block = Math.floor((currentPage - 1) / WINDOW_STEP);
    const start = Math.max(1, block * WINDOW_STEP - WINDOW_STEP);
    const end = Math.min(numPages, block * WINDOW_STEP + WINDOW_STEP * 2);
    return { start, end };
  }, [currentPage, numPages]);

  const pages = useMemo(() => {
    if (!numPages || !layout) return null;
    return Array.from({ length: numPages }, (_, index) => {
      const pageNumber = index + 1;
      return (
        <BookPage
          key={pageNumber}
          pageNumber={pageNumber}
          pageWidth={layout.pageWidth}
          shouldRender={pageNumber >= renderRange.start && pageNumber <= renderRange.end}
        />
      );
    });
  }, [numPages, layout, renderRange]);

  const handleFlip = useCallback((event) => {
    flipIndexRef.current = event.data;
    setCurrentPage(event.data + 1);
  }, []);

  // Ses, çevirmenin *bittiği* `flip` olayında değil, animasyonun başladığı
  // "flipping" durumunda çalıyor — sonda çalsaydı sayfa çoktan dönmüş olurdu.
  // Durum "flipping" içinde birden çok kez raporlanabildiği için yalnızca
  // bu duruma ilk girişte tetikliyoruz.
  const handleChangeState = useCallback((event) => {
    const nextState = event.data;
    const previousState = flipStateRef.current;
    flipStateRef.current = nextState;

    if (nextState === "flipping" && previousState !== "flipping" && soundEnabledRef.current) {
      playPageFlipSound();
    }
  }, []);

  const toggleSound = useCallback(() => {
    setSoundEnabled((previous) => {
      const next = !previous;
      try {
        window.localStorage.setItem(SOUND_STORAGE_KEY, next ? "acik" : "kapali");
      } catch {
        // Tercih saklanamadıysa oturum boyunca geçerli olsun, yeter.
      }
      return next;
    });
  }, []);

  const flipPrev = useCallback(() => {
    bookRef.current?.pageFlip()?.flipPrev();
  }, []);

  const flipNext = useCallback(() => {
    bookRef.current?.pageFlip()?.flipNext();
  }, []);

  // turnToPage animasyonsuz atlıyor: 264 sayfalık kitapta sona giderken
  // aradaki her sayfayı çevirmeye çalışmıyor.
  const goToFirstPage = useCallback(() => {
    bookRef.current?.pageFlip()?.turnToPage(0);
  }, []);

  const goToLastPage = useCallback(() => {
    const flip = bookRef.current?.pageFlip();
    if (!flip) return;
    flip.turnToPage(flip.getPageCount() - 1);
  }, []);

  const toggleFullscreen = useCallback(() => {
    const root = rootRef.current;
    if (!root) return;

    if (document.fullscreenElement) {
      document.exitFullscreen?.().catch(() => {});
    } else {
      // Safari hâlâ webkit önekini istiyor.
      const request = root.requestFullscreen || root.webkitRequestFullscreen;
      request?.call(root)?.catch?.(() => {});
    }
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "ArrowLeft") flipPrev();
      if (event.key === "ArrowRight") flipNext();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [flipPrev, flipNext]);

  const percent =
    progress && progress.total
      ? Math.min(100, Math.round((progress.loaded / progress.total) * 100))
      : null;

  return (
    <div ref={rootRef} className="w-full h-full flex flex-col bg-[#0D0D0D]">
      <Document
        // `relative`: react-pdf yükleme/hata içeriğini kendi .react-pdf__message
        // sarmalayıcısına koyuyor, o da normal akışta duran bir blok — bu yüzden
        // içine konan flex-1 esnemiyor. Bu iki durumu mutlak konumlandırıp
        // doğrudan bu kutuya ortalıyoruz.
        className="relative flex-1 min-h-0 flex flex-col"
        file={pdfUrl}
        onLoadSuccess={handleDocumentLoadSuccess}
        onLoadProgress={handleLoadProgress}
        loading={
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-6 text-center">
            <div className="w-full max-w-sm">
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-[#F5A623] transition-[width] duration-200"
                  style={{ width: `${percent ?? 8}%` }}
                />
              </div>
            </div>

            <div>
              <p className="font-display text-lg font-bold text-white">Katalog yükleniyor…</p>
              <p className="mt-1 text-sm text-white/50">
                {progress
                  ? progress.total
                    ? `${formatMb(progress.loaded)} / ${formatMb(progress.total)} (%${percent})`
                    : formatMb(progress.loaded)
                  : "Dosya büyük olduğu için ilk açılış biraz sürebilir."}
              </p>
            </div>
          </div>
        }
        error={
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-6 text-center">
            <p className="font-display text-lg font-bold text-red-400">Katalog yüklenemedi.</p>
            <p className="text-sm text-white/50">
              Bağlantınızı kontrol edip sayfayı yenileyebilir ya da PDF’i indirebilirsiniz.
            </p>
          </div>
        }
      >
        {/* Kitap alanı: ölçüm buradan yapılıyor. Kitabın kendisi mutlak
            konumlandığı için boyutu bu kutuyu geri besleyip ölçüm döngüsü
            oluşturamıyor. */}
        <div ref={setStageRef} className="relative flex-1 min-h-0 w-full">
          {pages && layout && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                style={{
                  width: layout.pageWidth * layout.pagesAcross,
                  height: layout.pageHeight,
                }}
              >
                <HTMLFlipBook
                  // Ölçü değişince bileşen baştan kurulmalı; react-pageflip
                  // width/height proplarını sonradan dinlemiyor.
                  key={`${layout.pageWidth}x${layout.pageHeight}x${layout.isSpread}`}
                  ref={bookRef}
                  width={layout.pageWidth}
                  height={layout.pageHeight}
                  size="fixed"
                  startPage={flipIndexRef.current}
                  usePortrait={!layout.isSpread}
                  showCover={true}
                  mobileScrollSupport={true}
                  useMouseEvents={true}
                  drawShadow={true}
                  maxShadowOpacity={0.5}
                  flippingTime={700}
                  onFlip={handleFlip}
                  onChangeState={handleChangeState}
                  className="shadow-2xl"
                >
                  {pages}
                </HTMLFlipBook>
              </div>
            </div>
          )}
        </div>
      </Document>

      {/* Kontroller sitenin geri kalanıyla aynı .btn-neu dilini kullanıyor:
          kalın siyah kenarlık, sert ofset gölge, hover'da öne çıkan 3D eğim.
          Gölgeler 6px (hover'da 11px) taştığı için aradaki boşluk buna göre. */}
      {numPages > 0 && (
        <div className="shrink-0 flex items-center justify-center gap-3 px-4 py-4 sm:gap-4 sm:py-5">
          {/* İlk sayfa — dar ekranda gizli, sıkışmasın diye */}
          <button
            type="button"
            onClick={goToFirstPage}
            aria-label="İlk sayfaya git"
            className="btn-neu hidden sm:flex w-11 h-11 items-center justify-center bg-[#F8F8F8] hover:bg-white text-[#1A1A1A] focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5">
              <path d="M17 5l-7 7 7 7M7 5v14" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          <button
            type="button"
            onClick={flipPrev}
            aria-label="Önceki sayfa"
            className="btn-neu flex w-11 h-11 items-center justify-center bg-[#F5A623] hover:bg-white text-[#1A1A1A] focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5">
              <path d="M15 5l-7 7 7 7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {/* Sayfa sayacı: tıklanabilir olmadığı için eğim/hover yok, ama
              .contact-input alanlarıyla aynı kenarlık + sert gölge dili. */}
          <span className="min-w-[96px] sm:min-w-[112px] border-[3px] border-black bg-[#F8F8F8] px-3 py-2 text-center font-display text-sm font-black text-[#1A1A1A] tabular-nums shadow-[4px_4px_0_#000]">
            {currentPage} / {numPages}
          </span>

          <button
            type="button"
            onClick={flipNext}
            aria-label="Sonraki sayfa"
            className="btn-neu flex w-11 h-11 items-center justify-center bg-[#F5A623] hover:bg-white text-[#1A1A1A] focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5">
              <path d="M9 5l7 7-7 7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {/* Son sayfa */}
          <button
            type="button"
            onClick={goToLastPage}
            aria-label="Son sayfaya git"
            className="btn-neu hidden sm:flex w-11 h-11 items-center justify-center bg-[#F8F8F8] hover:bg-white text-[#1A1A1A] focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5">
              <path d="M7 5l7 7-7 7M17 5v14" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          <button
            type="button"
            onClick={toggleSound}
            aria-pressed={soundEnabled}
            aria-label={soundEnabled ? "Sayfa sesini kapat" : "Sayfa sesini aç"}
            title={soundEnabled ? "Sayfa sesi açık" : "Sayfa sesi kapalı"}
            className={`btn-neu flex w-11 h-11 items-center justify-center hover:bg-white text-[#1A1A1A] focus:outline-none focus-visible:ring-2 focus-visible:ring-white ${
              soundEnabled ? "bg-[#F5A623]" : "bg-[#F8F8F8]"
            }`}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5">
              <path
                d="M4 9v6h3.5L12 19V5L7.5 9H4z"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {soundEnabled ? (
                <path d="M15.5 8.5a5 5 0 010 7M18 6a8.5 8.5 0 010 12" strokeWidth="2.5" strokeLinecap="round" />
              ) : (
                <path d="M16 9.5l4 5m0-5l-4 5" strokeWidth="2.5" strokeLinecap="round" />
              )}
            </svg>
          </button>

          <button
            type="button"
            onClick={toggleFullscreen}
            aria-pressed={isFullscreen}
            aria-label={isFullscreen ? "Tam ekrandan çık" : "Tam ekran"}
            title={isFullscreen ? "Tam ekrandan çık" : "Tam ekran"}
            className="btn-neu hidden sm:flex w-11 h-11 items-center justify-center bg-[#F8F8F8] hover:bg-white text-[#1A1A1A] focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5">
              {isFullscreen ? (
                <path
                  d="M9 4v5H4m11-5v5h5M9 20v-5H4m11 5v-5h5"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ) : (
                <path
                  d="M4 9V4h5M20 9V4h-5M4 15v5h5m11-5v5h-5"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
