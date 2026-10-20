import { useLayoutEffect, useRef } from "react";
import { gsap, MOTION_OK, EASE_OUT, ScrollTrigger } from "../../lib/motion";

// Normalises `parts` to [{ text, className }]. "\n" inside text forces a
// line break.
function toSegments(parts) {
  return typeof parts === "string" ? [{ text: parts }] : parts;
}

function plainText(parts) {
  return toSegments(parts)
    .map((s) => s.text)
    .join("")
    .replace(/\n/g, " ");
}

// Renders each word inside its own clipping mask, so words can rise into
// view from below the baseline. Screen readers get the plain sentence via
// aria-label; the split words are aria-hidden.
function Words({ parts }) {
  const out = [];
  toSegments(parts).forEach((seg, si) => {
    seg.text.split(/(\s+)/).forEach((chunk, ci) => {
      if (!chunk) return;
      if (/\s/.test(chunk)) {
        if (chunk.includes("\n")) out.push(<br key={`b${si}-${ci}`} />);
        else out.push(" ");
        return;
      }
      out.push(
        <span key={`w${si}-${ci}`} className="split-word" aria-hidden="true">
          <span className={`split-word__inner ${seg.className ?? ""}`}>{chunk}</span>
        </span>
      );
    });
  });
  return out;
}

// Heading whose words rise out of masks one after another as it scrolls
// into view. `when` (a promise) delays the reveal — used by the intro
// headline to wait for the preloader. Without motion, renders static.
export function SplitText({ as: Tag = "h2", parts, className = "", delay = 0, when, start = "top 88%" }) {
  const ref = useRef(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const mm = gsap.matchMedia();
    mm.add(MOTION_OK, () => {
      const words = el.querySelectorAll(".split-word__inner");
      gsap.set(words, { yPercent: 120, rotate: 6 });
      const play = () =>
        gsap.to(words, { yPercent: 0, rotate: 0, duration: 1.2, ease: EASE_OUT, stagger: 0.05, delay });
      if (when) {
        let cancelled = false;
        when.then(() => !cancelled && play());
        return () => (cancelled = true);
      }
      ScrollTrigger.create({ trigger: el, start, once: true, onEnter: play });
    });
    return () => mm.revert();
  }, [delay, when, start]);

  return (
    <Tag ref={ref} className={className} aria-label={plainText(parts)}>
      <Words parts={parts} />
    </Tag>
  );
}

// Paragraph whose words light up one by one as it's scrolled through
// (scrubbed, desktop only — no pin, the text just scrolls by normally).
export function ScrubText({ as: Tag = "p", parts, className = "" }) {
  const ref = useRef(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const mm = gsap.matchMedia();
    mm.add("(min-width: 769px) and (prefers-reduced-motion: no-preference)", () => {
      gsap.fromTo(
        el.querySelectorAll(".split-word__inner"),
        { opacity: 0.14 },
        {
          opacity: 1,
          ease: "none",
          stagger: 0.1,
          scrollTrigger: { trigger: el, start: "top 80%", end: "bottom 50%", scrub: 0.6 },
        }
      );
    });
    return () => mm.revert();
  }, []);

  return (
    <Tag ref={ref} className={className} aria-label={plainText(parts)}>
      <Words parts={parts} />
    </Tag>
  );
}
