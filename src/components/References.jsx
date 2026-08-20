import { useEffect, useRef } from "react";
import { usePinnedPanel } from "../hooks/usePinnedPanel";

const brands = [
  { name: "AGD", file: "agd.png" },
  { name: "Akyapı", file: "akyapi.png" },
  { name: "Birikim Okulları", file: "birikimokulları.png" },
  { name: "Boss", file: "boss.png" },
  { name: "Esenler Belediyesi", file: "esenlerbelediyesi.png" },
  { name: "Fuzulev", file: "fuzulev.png" },
  { name: "Hayrat Vakfı", file: "hayratvakfi.png" },
  { name: "HD Hyundai", file: "hdhyundai.png" },
  { name: "Helal Dünya", file: "helaldunya.png" },
  { name: "Helvacı Ali", file: "helvaciali.png" },
  { name: "IDL Yapı", file: "idlyapi.png" },
  { name: "İsabet Okulları", file: "isabetokulları.png" },
  { name: "İstanbul Üniversitesi", file: "istanbuluni2.jpg" },
  { name: "MÜSİAD", file: "müsiad.png" },
  { name: "New Holland", file: "newholland.png" },
  { name: "Renault", file: "renault.png" },
  { name: "Siyer Yayınları", file: "siyeryayinlari.png" },
  { name: "Uygun AVM", file: "uygunavm.png" },
  { name: "Yummy Cups", file: "yummycups.png" },
  { name: "Zinde Okulları", file: "zindeokulları.png" },
  { name: "Sütlüce Kadayıf", file: "sutluce.png" },
  { name: "Güneli Fırın", file: "guneli.png" },
];

// Auto-scrolling logo strip that's also fully drag/swipe-able by hand, on
// both desktop (mouse) and mobile (touch) — Pointer Events unify both. The
// track's transform is driven entirely in a rAF loop via refs (no React
// state per frame) so dragging feels 1:1 and never fights the auto-scroll:
// while idle it creeps left at a steady speed, while dragging it tracks the
// pointer exactly, and on release it coasts with a bit of momentum before
// easing back into the steady auto-scroll.
function BrandsMarquee({ brands }) {
  const trackRef = useRef(null);
  const posRef = useRef(0);
  const setWidthRef = useRef(0);
  const draggingRef = useRef(false);
  const dragStartXRef = useRef(0);
  const dragStartPosRef = useRef(0);
  const lastPointerXRef = useRef(0);
  const velocityRef = useRef(0);

  const AUTO_SPEED = 0.6;

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const measure = () => {
      setWidthRef.current = track.scrollWidth / 2;
    };
    measure();
    window.addEventListener("resize", measure);

    let rafId;
    const tick = () => {
      if (!draggingRef.current) {
        if (Math.abs(velocityRef.current) > 0.02) {
          posRef.current += velocityRef.current;
          velocityRef.current *= 0.95;
        } else {
          velocityRef.current = 0;
          posRef.current -= AUTO_SPEED;
        }
      }

      const w = setWidthRef.current;
      if (w > 0) {
        if (posRef.current <= -w) posRef.current += w;
        if (posRef.current > 0) posRef.current -= w;
      }

      track.style.transform = `translateX(${posRef.current}px)`;
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", measure);
    };
  }, []);

  const handlePointerDown = (e) => {
    draggingRef.current = true;
    velocityRef.current = 0;
    dragStartXRef.current = e.clientX;
    dragStartPosRef.current = posRef.current;
    lastPointerXRef.current = e.clientX;
    trackRef.current?.setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (e) => {
    if (!draggingRef.current) return;
    posRef.current = dragStartPosRef.current + (e.clientX - dragStartXRef.current);
    velocityRef.current = e.clientX - lastPointerXRef.current;
    lastPointerXRef.current = e.clientX;
  };

  const endDrag = (e) => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    try {
      trackRef.current?.releasePointerCapture?.(e.pointerId);
    } catch {
      // pointer capture may already be released by the browser
    }
  };

  return (
    // The cards tilt in 3D and carry a hard offset shadow, both of which
    // paint outside their own layout box (a CSS transform never expands
    // the box that overflow-hidden clips against) — without this padding
    // their tilted bottom edge and shadow were getting cut flush against
    // this wrapper's own bottom edge instead of sitting clear of it.
    <div className="relative -mx-4 sm:-mx-6 overflow-hidden pt-3 pb-10 sm:pb-12">
      <div
        ref={trackRef}
        className="flex w-max cursor-grab active:cursor-grabbing select-none touch-pan-y"
        style={{ willChange: "transform" }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endDrag}
        onPointerLeave={endDrag}
        onPointerCancel={endDrag}
        onDragStart={(e) => e.preventDefault()}
      >
        {[...brands, ...brands].map((b, i) => (
          <div
            key={i}
            className="media-frame-neu group mx-4 flex-shrink-0 w-64 h-40 bg-white flex items-center justify-center p-6"
          >
            <img
              src={`/markalar/${b.file}`}
              alt={b.name}
              draggable={false}
              className="max-w-full max-h-full object-contain grayscale opacity-60 transition-all duration-300 group-hover:grayscale-0 group-hover:opacity-100 pointer-events-none"
            />
          </div>
        ))}
      </div>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-16 sm:w-24 bg-gradient-to-r from-[#F8F8F8] to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-16 sm:w-24 bg-gradient-to-l from-[#F8F8F8] to-transparent" />
    </div>
  );
}

export default function References() {
  const panelRef = useRef(null);
  const innerRef = useRef(null);
  usePinnedPanel(panelRef, { innerRef });

  return (
    <section ref={panelRef} id="referanslarimiz" className="min-h-dvh flex flex-col items-center justify-center py-24 bg-[#F8F8F8]">
      <div ref={innerRef} className="max-w-6xl w-full mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block text-[#F5A623] text-xs font-bold tracking-widest uppercase mb-3">
            Referanslarımız
          </span>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-black text-[#1A1A1A] mb-6">
            Birlikte Çalıştığımız{" "}
            <span className="text-[#F5A623]">Markalar</span>
          </h2>
          <p className="text-lg text-[#1A1A1A]/60 max-w-2xl mx-auto leading-relaxed">
            Restoranlar, kafeler, fabrikalar, hastaneler, okullar, marketler, mağazalar, inşaat firmaları, belediyeler ve kurumsal şirketlere hizmet veriyoruz.
          </p>
        </div>

        {/* Brand logos marquee */}
        <BrandsMarquee brands={brands} />

        <p className="font-script text-3xl md:text-4xl text-[#F5A623] text-center -mt-2">
          Türkiye Geneli Hizmet Vermekteyiz
        </p>
      </div>
    </section>
  );
}
