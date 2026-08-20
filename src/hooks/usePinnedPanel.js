import { useLayoutEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// Mobile browsers show/hide their address bar while scrolling, which fires a
// `resize` event on every hide/show. ScrollTrigger's default reaction is to
// re-measure and refresh every pin's start/end mid-gesture — recalculating a
// pin while the user is actively scrolled into it is what produced the
// "sections suddenly jump/overlap" and "scroll feels too fast" reports on
// mobile: a panel's pin boundaries would shift under the user's thumb.
ScrollTrigger.config({ ignoreMobileResize: true });

// Panel heights (and therefore pin distances) are measured from the DOM the
// instant each panel mounts. The webfonts (Manrope/Dancing Script) load
// async and swap in after that first measurement, reflowing text height —
// on a panel with several lines of copy (Hero, About's reasons) that swap
// can leave the pin distance measured against the fallback font's shorter
// layout, so it ends a beat early and the next panel starts sliding in
// before this one has finished — one more source of the "overlap" reports.
// Re-measuring once fonts (and any late-loading images) have actually
// settled corrects it.
if (typeof window !== "undefined") {
  window.addEventListener("load", () => ScrollTrigger.refresh());
  document.fonts?.ready?.then(() => ScrollTrigger.refresh());
}

// Pins a section while the user scrolls through it, then shrinks + fades it
// out as the next section takes over — the same "stacked panels" pattern as
// the reference implementation (pin, optionally fake-scroll through content
// taller than the viewport, then scale to 0.7/fade to 0.5 over 90% of the
// remaining motion and fade the rest of the way out over the last 10%).
//
// Two modes, chosen by which options are passed:
//
// - Real content mode (default): pass `innerRef`, pointing at a child that
//   may be taller than the viewport (e.g. a long form + embedded map). Its
//   actual DOM height is measured and translated upward (yPercent) while
//   pinned, exactly like scrolling a normal page, before the shrink/fade.
//
// - Virtual content mode: pass `virtualExtraVh` (how many extra
//   viewport-heights of "content" this section represents) and `onProgress`.
//   Nothing is translated — instead `onProgress(0..1)` is called continuously
//   across the fake-scroll portion, for components (About/Services) whose
//   "content" is really a sequence of conditionally-rendered reveals driven
//   by a progress value, not an overflowing DOM block.
export function usePinnedPanel(panelRef, { innerRef, virtualExtraVh, onProgress, isLast = false } = {}) {
  useLayoutEffect(() => {
    const panel = panelRef.current;
    if (!panel || isLast) return;

    const ctx = gsap.context(() => {
      const windowHeight = window.innerHeight;
      const contentHeight =
        virtualExtraVh != null
          ? windowHeight * (1 + virtualExtraVh / 100)
          : innerRef?.current?.offsetHeight ?? windowHeight;

      const difference = contentHeight - windowHeight;
      const fakeScrollRatio = difference > 0 ? difference / (difference + windowHeight) : 0;

      if (fakeScrollRatio) {
        panel.style.marginBottom = `${contentHeight * fakeScrollRatio}px`;
      }

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: panel,
          start: "bottom bottom",
          end: () => (fakeScrollRatio ? `+=${contentHeight}` : "bottom top"),
          pin: true,
          pinSpacing: false,
          // A numeric scrub (seconds of smoothing) instead of `true` lets the
          // shrink/fade/translate tween ease toward the scroll position
          // rather than snapping to it every frame — on mobile, a single
          // touch fling can cover a huge scroll distance in one frame, so an
          // unsmoothed scrub made the whole sequence appear to blast past in
          // an instant.
          scrub: 0.4,
        },
      });

      if (fakeScrollRatio) {
        const fakeScrollDuration = 1 / (1 - fakeScrollRatio) - 1;
        if (innerRef?.current) {
          tl.to(innerRef.current, {
            yPercent: -100,
            y: windowHeight,
            duration: fakeScrollDuration,
            ease: "none",
          });
        } else if (onProgress) {
          const proxy = { p: 0 };
          tl.to(proxy, {
            p: 1,
            duration: fakeScrollDuration,
            ease: "none",
            onUpdate: () => onProgress(proxy.p),
          });
        }
      } else {
        onProgress?.(1);
      }

      tl.fromTo(panel, { scale: 1, opacity: 1 }, { scale: 0.7, opacity: 0.5, duration: 0.9 }).to(panel, {
        opacity: 0,
        duration: 0.1,
      });
    }, panelRef);

    return () => {
      ctx.revert();
      panel.style.marginBottom = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [panelRef, innerRef, virtualExtraVh, isLast]);
}
