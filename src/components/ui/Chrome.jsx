import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { gsap, markLoaded, prefersReducedMotion } from "../../lib/motion";

export function Bolt({ className = "", ...props }) {
  return (
    <svg viewBox="0 0 100 180" className={className} aria-hidden="true" {...props}>
      <path d="M55 0 L10 100 L40 100 L25 180 L90 70 L58 70 Z" />
    </svg>
  );
}

// Opening sequence: the bolt draws itself while a counter runs to 100,
// then the whole screen lifts away like a curtain. ~1.6s, once per load.
export function Preloader() {
  const ref = useRef(null);
  const [done, setDone] = useState(() => prefersReducedMotion());

  useLayoutEffect(() => {
    if (done) {
      markLoaded();
      return;
    }
    const el = ref.current;
    const path = el.querySelector("path");
    const counter = el.querySelector(".preloader-count");
    const len = path.getTotalLength();
    const n = { v: 0 };

    const tl = gsap.timeline({
      onComplete: () => setDone(true),
    });
    tl.set(path, { strokeDasharray: len, strokeDashoffset: len, fillOpacity: 0 })
      .to(path, { strokeDashoffset: 0, duration: 1, ease: "power2.inOut" })
      .to(n, { v: 100, duration: 1.1, ease: "power2.inOut", onUpdate: () => (counter.textContent = String(Math.round(n.v)).padStart(3, "0")) }, 0)
      .to(path, { fillOpacity: 1, duration: 0.3, ease: "power1.out" }, 0.85)
      .to(el.querySelector(".preloader-inner"), { yPercent: -30, autoAlpha: 0, duration: 0.6, ease: "power3.in" }, 1.2)
      .add(markLoaded, 1.35)
      .to(el, { clipPath: "inset(0% 0% 100% 0%)", duration: 0.9, ease: "expo.inOut" }, 1.3);
    return () => tl.kill();
  }, [done]);

  if (done) return null;
  return (
    <div ref={ref} className="fixed inset-0 z-[200] bg-ink flex items-center justify-center" style={{ clipPath: "inset(0% 0% 0% 0%)" }}>
      <div className="preloader-inner flex flex-col items-center gap-6">
        <Bolt className="w-12 sm:w-14 h-auto fill-brand stroke-brand" style={{ strokeWidth: 2 }} />
        <span className="preloader-count font-display text-sm font-bold tracking-[0.3em] text-paper/60 tabular-nums">000</span>
      </div>
    </div>
  );
}

// The overlay navigateTo() animates (see lib/navigate.js).
export function PageCurtain() {
  return (
    <div id="page-curtain" className="fixed inset-0 z-[150] pointer-events-none" style={{ visibility: "hidden" }} aria-hidden="true">
      <div className="curtain-layer absolute inset-0 bg-brand" />
      <div className="curtain-layer absolute inset-0 bg-ink flex items-center justify-center">
        <div className="overflow-hidden flex items-center gap-4">
          <span className="curtain-label block font-display text-4xl sm:text-6xl font-extrabold tracking-tight text-paper" />
        </div>
      </div>
    </div>
  );
}

// Thin yellow scroll-progress line along the very top of the viewport.
export function ScrollProgress() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    let raf = 0;
    const update = () => {
      raf = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      el.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);
  return <div ref={ref} className="fixed top-0 left-0 right-0 h-[2px] z-[60] bg-brand origin-left" style={{ transform: "scaleX(0)" }} aria-hidden="true" />;
}
