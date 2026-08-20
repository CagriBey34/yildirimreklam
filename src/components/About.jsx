import { useRef, useState } from "react";
import { reasonIcons } from "../assets/icons";
import { usePinnedPanel } from "../hooks/usePinnedPanel";

const reasons = [
  {
    title: "Profesyonel Tasarım Ekibi",
    desc: "Deneyimli tasarımcılarımız markanıza özgün ve etkili görsel kimlikler oluşturur.",
  },
  {
    title: "Kaliteli Malzeme & Üretim",
    desc: "Uzun ömürlü ve dayanıklı malzemelerle en yüksek üretim kalitesini sağlıyoruz.",
  },
  {
    title: "Hızlı Teslimat",
    desc: "Belirlenen süre ve takvime sadık kalarak projelerinizi zamanında teslim ediyoruz.",
  },
  {
    title: "Uygun Fiyat Politikası",
    desc: "Rekabetçi fiyatlarla bütçenize en uygun çözümleri sunuyoruz.",
  },
  {
    title: "Yerinde Keşif & Danışmanlık",
    desc: "Uzman ekibimiz yerinde gelip ihtiyaçlarınızı analiz eder ve en doğru çözümü sunar.",
  },
  {
    title: "Müşteri Memnuniyeti",
    desc: "Satış sonrası destek ve müşteri memnuniyeti odaklı hizmet anlayışımızla yanınızdayız.",
  },
];

function clamp(v, min, max) {
  return Math.min(max, Math.max(min, v));
}

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

// One "Neden Biz?" intro segment, then one segment per reason.
const SEGMENT_COUNT = reasons.length + 1;

// How much extra scroll distance (in viewport-heights, beyond the one
// viewport the panel itself already occupies) the internal reveal sequence
// needs — fed to usePinnedPanel as "virtual" content height, since there's
// no real overflowing DOM block here, just a progress value driving which
// reason is shown.
const VH_PER_SEGMENT = 90;
const VIRTUAL_EXTRA_VH = SEGMENT_COUNT * VH_PER_SEGMENT;

// Reason reveal: title, description and the watermark icon all arrive as
// one synchronized block — a single eased fade/rise/soft-focus rather than
// each piece running its own separate timeline (word-by-word title, then a
// delayed description, then an independently-timed icon), which read as
// fragmented instead of like one cohesive unit landing on screen. It fades
// back out symmetrically before the next reason takes over, instead of
// cutting instantly at the segment boundary, so the handoff between two
// reasons reads as one continuous crossfade.
const REVEAL_FRACTION = 0.3;
const FADE_OUT_START = 0.75;
function revealFor(segmentLocal) {
  if (segmentLocal < REVEAL_FRACTION) return easeOutCubic(segmentLocal / REVEAL_FRACTION);
  if (segmentLocal > FADE_OUT_START) {
    return easeOutCubic(1 - (segmentLocal - FADE_OUT_START) / (1 - FADE_OUT_START));
  }
  return 1;
}

export default function About() {
  const panelRef = useRef(null);
  const [progress, setProgress] = useState(0);

  usePinnedPanel(panelRef, { virtualExtraVh: VIRTUAL_EXTRA_VH, onProgress: setProgress });

  const segmentSize = 1 / SEGMENT_COUNT;
  const rawSegment = progress / segmentSize;
  const segmentIndex = clamp(Math.floor(rawSegment), 0, SEGMENT_COUNT - 1);
  const segmentLocal = clamp(rawSegment - segmentIndex, 0, 1);

  const isIntro = segmentIndex === 0;

  // Intro: blink for most of the segment, then fade out near the end.
  const introFadeStart = 0.7;
  const introOpacity = isIntro
    ? segmentLocal < introFadeStart
      ? 1
      : clamp(1 - (segmentLocal - introFadeStart) / (1 - introFadeStart), 0, 1)
    : 0;

  // Reason item: title, description and icon all read off this single
  // eased value instead of each running its own timeline.
  const reasonIndex = segmentIndex - 1;
  const reason = !isIntro ? reasons[reasonIndex] : null;

  const reveal = revealFor(segmentLocal);

  return (
    <section
      ref={panelRef}
      id="hakkimizda"
      className="relative h-dvh pt-20 sm:pt-24 overflow-hidden bg-[#F8F8F8] flex items-center"
    >
      {/* "Neden Biz?" full-screen blinking headline */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none px-4"
        style={{ opacity: introOpacity }}
      >
        <h2 className="font-display blink-text text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black text-[#1A1A1A] text-center tracking-tight">
          Neden <span className="text-[#F5A623]">Biz?</span>
        </h2>
      </div>

      {/* Scroll hint chevrons — pinned to the very bottom of the screen
          (not tied to the headline's own centering) so they read as a
          section-wide "keep scrolling" cue rather than part of the title. */}
      <div
        className="absolute inset-x-0 bottom-6 sm:bottom-8 flex flex-col items-center pointer-events-none"
        style={{ opacity: introOpacity }}
        aria-hidden="true"
      >
        {[0, 1, 2].map((i) => (
          <svg
            key={i}
            viewBox="0 0 24 12"
            className="w-6 sm:w-7 md:w-8 scroll-chevron"
            style={{ marginTop: i === 0 ? 0 : "-0.4em", animationDelay: `${i * 0.6}s` }}
          >
            <path
              d="M2 10L12 2L22 10"
              fill="none"
              stroke="#F5A623"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ))}
      </div>

      {/* Reasons: title + description on the left, a giant semi-transparent
          watermark icon filling the right side — title, description and
          icon all move as one rigid block, driven by the single `reveal`
          value above, instead of each animating on its own schedule. */}
      {reason && (
        <div
          className="absolute inset-0 flex items-center overflow-hidden"
          style={{
            opacity: reveal,
            transform: `translateX(${(1 - reveal) * -56}px)`,
            filter: `blur(${(1 - reveal) * 12}px)`,
          }}
        >
          <div
            className="hidden sm:flex absolute right-0 top-0 h-full w-[36%] items-center justify-center pointer-events-none"
          >
            <img
              key={reasonIndex}
              src={reasonIcons[reasonIndex]}
              alt=""
              className="w-[70%] h-[70%] object-contain"
            />
          </div>

          <div className="relative z-10 w-full sm:w-[62%] pl-6 pr-6 sm:pl-12 sm:pr-0 md:pl-20">
            <h2 className="font-display text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-[#1A1A1A] tracking-tight leading-[0.95] break-words">
              {reason.title}
            </h2>
            <p className="mt-5 sm:mt-7 max-w-2xl text-xl sm:text-2xl md:text-3xl text-[#1A1A1A]/60 leading-snug">
              {reason.desc}
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
