import { useLayoutEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// Mobile address-bar show/hide fires resize events mid-scroll; ignoring
// them keeps trigger positions from shifting under the user's thumb.
ScrollTrigger.config({ ignoreMobileResize: true });

if (typeof window !== "undefined") {
  window.addEventListener("load", () => ScrollTrigger.refresh());
  document.fonts?.ready?.then(() => ScrollTrigger.refresh());
}

export { gsap, ScrollTrigger };

// Every animation is gated on one of these. Nothing pins or scroll-jacks:
// scroll is always native.
export const MOTION_OK = "(prefers-reduced-motion: no-preference)";
export const DESKTOP_MOTION = "(min-width: 769px) and (prefers-reduced-motion: no-preference)";
export const FINE_POINTER = "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)";

export const EASE_OUT = "expo.out";

export function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

// --- Preloader handshake ----------------------------------------------------
// The preloader resolves this once its curtain lifts so first-screen
// animations (the intro headline) start in sync with it instead of playing
// hidden underneath.
let resolveLoaded;
const loaded = new Promise((r) => (resolveLoaded = r));
export const whenLoaded = () => loaded;
export const markLoaded = () => resolveLoaded();

// --- Scroll reveal -----------------------------------------------------------
// One-shot fade/rise (with a little blur) as an element enters the viewport.
// `stagger: true` animates the element's direct children one after another.
export function useReveal(ref, { stagger = false, y = 40, delay = 0, start = "top 85%" } = {}) {
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const mm = gsap.matchMedia();
    mm.add(MOTION_OK, () => {
      const targets = stagger ? Array.from(el.children) : el;
      gsap.from(targets, {
        autoAlpha: 0,
        y,
        filter: "blur(8px)",
        duration: 1.1,
        delay,
        ease: EASE_OUT,
        stagger: stagger ? 0.09 : 0,
        // Leave no transform behind: a transformed ancestor would
        // re-anchor position:fixed descendants (e.g. modals) to itself.
        clearProps: "transform,filter,opacity,visibility",
        scrollTrigger: { trigger: el, start, once: true },
      });
    });
    return () => mm.revert();
  }, [ref, stagger, y, delay, start]);
}

// Media "unveil": a clip-path wipe from the bottom with a slow settle-in
// scale on the image inside.
export function useClipReveal(ref, { start = "top 85%" } = {}) {
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const mm = gsap.matchMedia();
    mm.add(MOTION_OK, () => {
      const tl = gsap.timeline({ scrollTrigger: { trigger: el, start, once: true } });
      tl.from(el, { clipPath: "inset(100% 0% 0% 0%)", duration: 1.3, ease: "expo.inOut", clearProps: "clipPath" });
      const img = el.querySelector("img");
      if (img) tl.from(img, { scale: 1.25, duration: 1.8, ease: EASE_OUT, clearProps: "transform" }, 0);
    });
    return () => mm.revert();
  }, [ref, start]);
}
