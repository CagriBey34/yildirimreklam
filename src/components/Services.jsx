import { useEffect, useRef, useState } from "react";
import { usePinnedPanel } from "../hooks/usePinnedPanel";


import kartvizit from "../assets/services/kartvizit.png";
import bloknot  from "../assets/services/bloknot.png";
import broşür from "../assets/services/broşür.png";
import cepli from "../assets/services/cepli.png";
import katalog from "../assets/services/katalog.png";
import kalem from "../assets/services/kalem.png";
import ajanda from "../assets/services/ajanda.png";
import termos from "../assets/services/termos.png";
import plaket from "../assets/services/plaket.png";
import branda from "../assets/services/Branda.png";
import folyo from "../assets/services/folyo.png";
import onevision from "../assets/services/Onevision.png";
import kumlama from "../assets/services/Kumlama.png";
import mesh from "../assets/services/Mesh.png";
import ısıklı from "../assets/services/ışıklı.png";
import ısıksız from "../assets/services/ışıksız.png";
import vinil from "../assets/services/vinil.png";
import totem from "../assets/services/totem.png";
import catı from "../assets/services/çatı.png";
import folyocam from "../assets/services/folyocam.png";
import anahtarlik from "../assets/services/anahtarlik.png";
import duvarsaati from "../assets/services/duvarsaati.png";
import kupa from "../assets/services/kupa.png";
import tekstil from "../assets/services/tekstil.png";
import vip from "../assets/services/vip.png";
import yonlendirme from "../assets/services/yonlendirme.png";


// Four service groups, each its own full screen. Every item carries its own
// `image` — swap the import at the top and the value on any entry any time
// a more accurate photo exists for that specific item (only 4 real photos
// exist today, so they're cycled across each group's items for now).
const serviceGroups = [
  {
    id: "tabela",
    title: "Tabela",
    items: [
      { label: "Işıklı", image: ısıklı },
      { label: "Işıksız", image: ısıksız },
      { label: "Vinil Germe", image: vinil },
      { label: "Totem", image: totem },
      { label: "Çatı Tabelası", image: catı },
      { label: "Yönlendirme Tabelası", image: yonlendirme },
    ],
  },
  {
    id: "dijital-baski",
    title: "Dijital Baskı",
    items: [
      { label: "Branda", image: branda },
      { label: "Folyo", image: folyocam},
      { label: "Onevision", image: onevision },
      { label: "Kumlama", image: kumlama },
      { label: "Mesh", image: mesh },
      { label: "Araç Giydirme", image: folyo },
    ],
  },
  {
    id: "promosyon",
    title: "Promosyon",
    items: [
      { label: "Kalem", image: kalem },
      { label: "Ajanda", image: ajanda },
      { label: "Termos", image: termos },
      { label: "Plaket", image: plaket },
      { label: "Anahtarlık", image: anahtarlik },
      { label: "Duvar Saati", image: duvarsaati },
      { label: "Kupa ve Madalya", image: kupa  },
      { label: "Tekstil Ürünleri", image: tekstil },
      { label: "VIP Setler", image: vip },
    ],
  },
  {
    id: "matbaa",
    title: "Matbaa",
    items: [
      { label: "Kartvizit", image: kartvizit },
      { label: "Broşür", image: broşür },
      { label: "Katalog", image: katalog },
      { label: "Cepli Dosya", image: cepli },
      { label: "Bloknot", image: bloknot },
    ],
  },
];

const process = [
  { step: "01", title: "İhtiyaç Analizi", desc: "İşletmenizin ihtiyaçlarını yerinde analiz ediyoruz." },
  { step: "02", title: "Tasarım", desc: "Profesyonel ekibimiz özel tasarımınızı hazırlıyor." },
  { step: "03", title: "Üretim", desc: "Kaliteli malzeme ve ekipmanlarla üretim yapıyoruz." },
  { step: "04", title: "Montaj & Teslimat", desc: "Yerinde montaj ve sorunsuz teslimat sağlıyoruz." },
];

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function clamp(v, min, max) {
  return Math.min(max, Math.max(min, v));
}

// Splits a 0..1 progress value across a list of relative weights — used
// both for the section's four top-level stages and for the seven dwell/pan
// phases inside the service-groups stage.
function resolveWeightedSegment(progress, weights) {
  const cum = weights.reduce((acc, w) => [...acc, acc[acc.length - 1] + w], [0]);
  const total = cum[cum.length - 1];
  const pos = clamp(progress, 0, 1) * total;
  let index = cum.findIndex((_, i) => i < cum.length - 1 && pos < cum[i + 1]);
  if (index === -1) index = weights.length - 1;
  const local = clamp((pos - cum[index]) / weights[index], 0, 1);
  return { index, local };
}

// Fades a stage in/out over the edges of its own segmentLocal (0..1). Skip
// fadeIn for the very first stage (already visible at scroll position 0)
// and fadeOut for the very last (it just settles once scroll-jacking ends).
// fadeInEdge/fadeOutEdge let a stage fade in faster than it fades out (or
// vice versa) — both default to `edge` when not given separately.
function stageOpacity(local, { fadeIn = true, fadeOut = true, edge = 0.12, fadeInEdge, fadeOutEdge } = {}) {
  const inEdge = fadeInEdge ?? edge;
  const outEdge = fadeOutEdge ?? edge;
  let o = 1;
  if (fadeIn) o = Math.min(o, easeInOutCubic(clamp(local / inEdge, 0, 1)));
  if (fadeOut) o = Math.min(o, 1 - easeInOutCubic(clamp((local - (1 - outEdge)) / outEdge, 0, 1)));
  return o;
}

// Reveal thresholds (fraction of the rail's fill progress) at which each
// process step's card pops in — evenly spaced with a small lead-in so the
// card arrives just as the growing line reaches its marker.
const TIMELINE_THRESHOLDS = [0.08, 0.36, 0.64, 0.92];

function ArrowIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Stage 1: Hero intro
// ---------------------------------------------------------------------------
function HeroStage({ opacity }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center px-5 sm:px-8" style={{ opacity }}>
      <div className="max-w-3xl mx-auto text-center services-hero-reveal">
        <span className="inline-block text-[#F5A623] text-xs sm:text-sm font-bold tracking-[0.25em] uppercase mb-5">
          Hizmetlerimiz
        </span>
        <h2 className="font-display text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white leading-[1.15] mb-6">
          Markanızı <span className="text-[#F5A623]">görünür kılan</span> üretimler gerçekleştiriyoruz.
        </h2>
        <p className="text-white/60 text-base sm:text-lg leading-relaxed max-w-xl mx-auto">
          Fikirden üretime, uygulamadan montaja kadar markanızın fiziksel dünyadaki tüm
          görünürlük ihtiyaçlarını profesyonel çözümlerle hayata geçiriyoruz.
        </p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Stage 2: four full screens, one per service group, navigated by scrolling
// (pan right/down/left between them). Within a group, though, its items
// don't advance on scroll at all — the user taps/clicks one to see it,
// exactly like a small accordion — so scroll is reserved entirely for
// moving between the four tables.
// ---------------------------------------------------------------------------
function ServiceGroupRow({ number, title, isActive, interactive, onSelect, showTapHint }) {
  return (
    <button
      type="button"
      tabIndex={interactive ? 0 : -1}
      onClick={interactive ? onSelect : undefined}
      aria-current={isActive ? "true" : undefined}
      className={`group relative w-full text-left py-4 sm:py-5 border-b border-white/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F5A623] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0D0D0D] ${
        interactive ? "cursor-pointer" : "pointer-events-none"
      }`}
    >
      <span className="flex items-center gap-4 sm:gap-6">
        <span
          className={`font-display text-sm sm:text-base font-bold tabular-nums flex-shrink-0 transition-colors duration-300 ${
            isActive ? "text-[#F5A623]" : "text-white/35"
          }`}
        >
          {number}
        </span>
        <span
          className={`flex-1 font-display font-black leading-snug transition-all duration-300 text-lg sm:text-xl lg:text-2xl group-hover:translate-x-2 ${
            isActive ? "text-white translate-x-2" : "text-white/40"
          }`}
        >
          {title}
        </span>
        <span className="relative flex-shrink-0 w-5 h-5 flex items-center justify-center">
          <ArrowIcon
            className={`w-5 h-5 transition-all duration-300 group-hover:translate-x-1 ${
              isActive ? "text-[#F5A623] translate-x-1" : "text-white/25"
            }`}
          />
          {showTapHint && <TapHint className="absolute -top-1.5 -right-1.5 w-3 h-3" />}
        </span>
      </span>
      <span
        className="absolute left-0 bottom-0 h-px bg-[#F5A623] transition-[width] duration-500 ease-out"
        style={{ width: isActive ? "100%" : "0%" }}
      />
    </button>
  );
}

// A small pulsing "tap here" ripple — a solid dot with an expanding, fading
// ring looping via Tailwind's built-in ping animation — shown only on the
// very first item of the very first group, until the user taps anything.
// Onboarding hint, not app state: nothing about it is scroll- or click-timed
// beyond "has the user ever tapped an item yet."
function TapHint({ className = "" }) {
  return (
    <span className={`pointer-events-none inline-flex ${className}`} aria-hidden="true">
      <span className="absolute inset-0 bg-[#F5A623] opacity-75 animate-ping" />
      <span className="relative inline-flex w-full h-full bg-[#F5A623]" />
    </span>
  );
}

// A single item's photo, stacked with its siblings and crossfaded in/out —
// all of a group's item images are always mounted so switching the active
// one is a pure opacity/scale change, never a swap that could flash.
// `opacity` is continuous on mobile (the crossfade tracks the swipe/scroll
// position frame by frame — `instant` drops the CSS transition there so it
// never chases a target that's already moving) and binary on desktop (a
// discrete tap, so it keeps a short eased transition instead).
function ServiceItemVisual({ image, label, opacity, instant }) {
  return (
    <img
      src={image}
      alt={`${label} uygulama örneği`}
      aria-hidden={opacity > 0.5 ? undefined : true}
      className={`absolute inset-0 w-full h-full object-cover ${instant ? "" : "transition-all duration-500 ease-out"}`}
      style={{ opacity, transform: `scale(${1.06 - opacity * 0.06})` }}
    />
  );
}

// One group's own screen: its title, its items as a numbered/underlined
// list, and each item's own photo crossfading in as it becomes active.
// `isCurrentGroup` is true only while the pan is dwelling on this exact
// group — everywhere else its list is present (so the pan has something to
// slide) but inert (not focusable/hoverable/tappable) and frozen on the
// first item.
//
// Two interaction modes, chosen by `isMobile`:
// - Desktop: `activeItemIndex`/`onSelectItem` (owned by the parent stage)
//   drive everything — tapping a row is the only thing that changes which
//   item is shown, scroll only drives which *group* is on screen.
// - Mobile: items still cascade by scroll/swipe, exactly like the original
//   design — `dwellLocal` (this group's own scroll position within its
//   dwell phase) drives a continuous crossfade through the items, and the
//   dots below are a passive progress indicator, not a control.
const GROUP_REVEAL_FRACTION = 0.8;

function ServiceGroupPanel({ group, isCurrentGroup, dwellLocal, activeItemIndex, onSelectItem, showTapHint, isMobile }) {
  const items = group.items;

  const rawItemPos = Math.min(dwellLocal / GROUP_REVEAL_FRACTION, 1) * items.length;
  const scrollItemIndex = clamp(Math.floor(rawItemPos), 0, items.length - 1);
  const itemRowProgress = clamp(rawItemPos - scrollItemIndex, 0, 1);

  const effectiveIndex = isMobile ? scrollItemIndex : activeItemIndex;
  const activeItem = items[effectiveIndex];

  // Mobile crossfade: each image holds at full opacity for most of its own
  // slot, then crossfades into the next one only across the final stretch
  // (see the equivalent note this used to carry before items were tap-driven
  // on desktop) — still purely a function of scroll position, no timer.
  const CROSSFADE_START = 0.65;
  const crossfadeT = clamp((itemRowProgress - CROSSFADE_START) / (1 - CROSSFADE_START), 0, 1);
  const visualOpacity = (i) => {
    if (!isMobile) return i === effectiveIndex ? 1 : 0;
    if (i === scrollItemIndex) return 1 - crossfadeT;
    if (i === scrollItemIndex + 1) return crossfadeT;
    return 0;
  };

  return (
    <div className="w-full h-full flex items-center px-5 sm:px-8 md:px-10 lg:px-16">
      <div className="w-full max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-6 md:gap-14">
        <div className="w-full md:w-[46%]">
          <span className="inline-block text-[#F5A623] text-xs font-bold tracking-[0.2em] uppercase mb-3 md:mb-6">
            Hizmetlerimiz
          </span>
          <h3 className="font-display text-3xl sm:text-4xl md:text-5xl font-black text-white mb-4 md:mb-6 leading-tight">
            {group.title}
          </h3>

          {/* Desktop: numbered, tappable list of this group's items */}
          <div className="hidden md:block">
            {items.map((item, i) => (
              <ServiceGroupRow
                key={item.label}
                number={`0${i + 1}`}
                title={item.label}
                isActive={i === effectiveIndex}
                interactive={isCurrentGroup}
                onSelect={() => onSelectItem(i)}
                showTapHint={showTapHint && i === 0}
              />
            ))}
          </div>

          {/* Mobile: passive progress dots, driven by scroll like before */}
          <div className="flex md:hidden items-center gap-2 mt-2" aria-hidden="true">
            {items.map((item, i) => (
              <span
                key={item.label}
                className={`h-1.5 transition-all duration-300 ${
                  i === effectiveIndex ? "w-6 bg-[#F5A623]" : "w-1.5 bg-white/25"
                }`}
              />
            ))}
          </div>
        </div>

        <div className="w-full md:w-[54%] translate-x-2 sm:translate-x-3 md:translate-x-5">
          <div className="media-frame-neu w-full aspect-[16/9] md:aspect-[16/11] bg-[#171717]">
            {items.map((item, i) => (
              <ServiceItemVisual
                key={item.label}
                image={item.image}
                label={item.label}
                opacity={visualOpacity(i)}
                instant={isMobile}
              />
            ))}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/5 to-transparent pointer-events-none" />
            <div className="absolute bottom-0 left-0 p-6 sm:p-8">
              <div className="font-display font-black text-3xl sm:text-4xl text-[#F5A623] mb-1.5">
                0{effectiveIndex + 1}
              </div>
              <p className="text-white/85 text-sm sm:text-base">{activeItem.label}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Seven phases inside the groups stage: dwell on group 0, pan right, dwell
// on group 1, pan down, dwell on group 2, pan left, dwell on group 3. Each
// group's own dwell phase sits at phaseIndex `groupIndex * 2`.
//
// On desktop, items are tapped rather than scrolled to, so dwell only needs
// to be a deliberate-enough scroll distance that a stray wheel tick doesn't
// blow straight through a group unnoticed — equal weights keep that simple.
// On mobile, items still cascade by swipe like the original design, so each
// dwell needs real scroll room to move through every item — weighted much
// heavier than the pans between groups, same ratio as the original tuning.
const DESKTOP_GROUP_PHASE_WEIGHTS = [1, 1, 1, 1, 1, 1, 1];
const MOBILE_GROUP_PHASE_WEIGHTS = [1.3, 0.4, 1.3, 0.4, 1.3, 0.4, 1.3];

// A group's item-list progress: 0 before its dwell phase has started (still
// shows the first item), phaseLocal while it's the one being dwelled on,
// and 1 once scroll has moved past it — frozen on its *last* item rather
// than snapping back to the first, which is what caused items to visibly
// jump backwards for a frame while a group was sliding off-screen. Only
// meaningful on mobile (desktop items are tap-driven), but cheap enough to
// always compute.
function groupDwellLocal(groupIndex, phaseIndex, phaseLocal) {
  const ownPhase = groupIndex * 2;
  if (phaseIndex === ownPhase) return phaseLocal;
  return phaseIndex > ownPhase ? 1 : 0;
}

// Transit phases ease their own progress so the pan accelerates/decelerates
// smoothly instead of moving at a harsh, constant rate. The canvas transform
// below applies this offset with no CSS transition of its own — the value
// is already a continuous function of scroll (smoothed further upstream by
// the RAF lerp on the section's pin progress), so a second, clock-based
// transition here would just make the pan visibly chase a moving target
// instead of tracking the scroll gesture directly.
function groupCanvasOffset(phaseIndex, phaseLocal, width, height) {
  const eased = easeInOutCubic(phaseLocal);
  switch (phaseIndex) {
    case 0:
      return { x: 0, y: 0 };
    case 1:
      return { x: width * eased, y: 0 };
    case 2:
      return { x: width, y: 0 };
    case 3:
      return { x: width, y: height * eased };
    case 4:
      return { x: width, y: height };
    case 5:
      return { x: width * (1 - eased), y: height };
    default:
      return { x: 0, y: height };
  }
}

// Seeded from the current viewport instead of {0,0} so the pan canvas has a
// correct size on the very first render — starting at {0,0} meant every
// re-entry into this stage (it unmounts/remounts as scroll leaves and
// re-enters the segment) rendered nothing at all until the measurement
// effect caught up a frame later, showing a blank/frozen beat each time.
function initialViewportSize() {
  if (typeof window === "undefined") return { width: 0, height: 0 };
  return { width: window.innerWidth, height: window.innerHeight };
}

function ServiceGroupsStage({ segmentLocal, opacity, isMobile }) {
  const viewportRef = useRef(null);
  const [size, setSize] = useState(initialViewportSize);
  const [activeItemIndex, setActiveItemIndex] = useState(0);
  // Whether the user has ever tapped an item, anywhere — once true, the
  // first-group/first-item tap hint never needs to show again this visit.
  // Desktop-only concept: mobile items cascade by scroll, same as always.
  const [hasTapped, setHasTapped] = useState(false);

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const measure = () => {
      const rect = el.getBoundingClientRect();
      setSize({ width: rect.width, height: rect.height });
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const groupPhaseWeights = isMobile ? MOBILE_GROUP_PHASE_WEIGHTS : DESKTOP_GROUP_PHASE_WEIGHTS;
  const { index: phaseIndex, local: phaseLocal } = resolveWeightedSegment(segmentLocal, groupPhaseWeights);
  const dwellGroupIndex = phaseIndex % 2 === 0 ? phaseIndex / 2 : undefined;

  // Each newly-arrived group always starts fresh on its first item, rather
  // than remembering whatever was last tapped the previous time it was
  // visited — one less thing for the user to have to make sense of. Only
  // matters on desktop; mobile's scrollItemIndex already starts at 0
  // naturally whenever dwellLocal resets to 0 on arrival.
  useEffect(() => {
    setActiveItemIndex(0);
  }, [dwellGroupIndex]);

  const handleSelectItem = (i) => {
    setActiveItemIndex(i);
    setHasTapped(true);
  };

  const { width, height } = size;
  const offset = groupCanvasOffset(phaseIndex, phaseLocal, width, height);

  return (
    <div ref={viewportRef} className="absolute inset-0 overflow-hidden" style={{ opacity }}>
      {width > 0 && height > 0 && (
        <div
          className="absolute top-0 left-0"
          style={{
            width: width * 2,
            height: height * 2,
            transform: `translate(${-offset.x}px, ${-offset.y}px)`,
          }}
        >
          {serviceGroups.map((group, i) => {
            const isCurrentGroup = i === dwellGroupIndex;
            return (
              <div
                key={group.id}
                className="absolute"
                style={{
                  width,
                  height,
                  left: i === 1 || i === 2 ? width : 0,
                  top: i === 2 || i === 3 ? height : 0,
                }}
              >
                <ServiceGroupPanel
                  group={group}
                  isCurrentGroup={isCurrentGroup}
                  dwellLocal={groupDwellLocal(i, phaseIndex, phaseLocal)}
                  activeItemIndex={isCurrentGroup ? activeItemIndex : 0}
                  onSelectItem={handleSelectItem}
                  showTapHint={!isMobile && i === 0 && isCurrentGroup && !hasTapped}
                  isMobile={isMobile}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Stage 3: "Çalışma Sürecimiz" timeline — dark theme, minimal markers
// ---------------------------------------------------------------------------
function ProcessHint({ p, side, reveal }) {
  const rtl = side === "left";
  return (
    <div className={`flex items-center ${rtl ? "flex-row-reverse" : "flex-row"}`}>
      <div className="h-px bg-[#F5A623]/50 flex-shrink-0" style={{ width: `${reveal * 26}px` }} />
      <div className={`${rtl ? "text-right pr-3" : "text-left pl-3"} max-w-[200px] sm:max-w-[280px] md:max-w-[320px]`}>
        <h4 className="relative inline-block font-display text-white font-bold text-lg sm:text-2xl md:text-[1.75rem] pb-1.5">
          {p.title}
          <span
            className={`absolute bottom-0 h-px bg-[#F5A623] ${rtl ? "right-0" : "left-0"}`}
            style={{ width: `${reveal * 100}%` }}
          />
        </h4>
        <p className="text-white/65 text-sm sm:text-lg md:text-xl leading-snug mt-1">{p.desc}</p>
      </div>
    </div>
  );
}

function ProcessMarker({ step, reveal }) {
  return (
    <div
      className="relative z-10 flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 border-2 border-[#F5A623] bg-[#0D0D0D] text-white flex items-center justify-center font-display font-black text-lg sm:text-xl"
      style={{ transform: `scale(${0.6 + reveal * 0.4})` }}
    >
      {step}
    </div>
  );
}

function Timeline({ localProgress }) {
  const lineProgress = easeInOutCubic(clamp(localProgress / 0.85, 0, 1));
  const groupOpacity = clamp(localProgress / 0.08, 0, 1);

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center px-5 sm:px-6" style={{ opacity: groupOpacity }}>
      <div className="text-center mb-8 sm:mb-12">
        <span className="inline-block text-[#F5A623] text-xs font-bold tracking-widest uppercase mb-2">
          Hizmetlerimiz
        </span>
        <h3 className="font-display text-2xl sm:text-3xl font-black text-white">
          Çalışma <span className="text-[#F5A623]">Sürecimiz</span>
        </h3>
      </div>

      <div className="relative w-full max-w-[320px] sm:max-w-3xl">
        <div className="absolute left-[24px] sm:left-1/2 sm:-translate-x-1/2 top-1 bottom-1 w-0.5 bg-white/15" />
        <div
          className="absolute left-[24px] sm:left-1/2 sm:-translate-x-1/2 top-1 w-0.5 bg-[#F5A623]"
          style={{ height: `${lineProgress * 100}%` }}
        />

        <div className="flex flex-col gap-7 sm:gap-10">
          {process.map((p, i) => {
            const reveal = clamp((lineProgress - TIMELINE_THRESHOLDS[i] + 0.08) / 0.2, 0, 1);
            const onRight = i % 2 === 1;
            const fadeStyle = { opacity: reveal };

            return (
              <div key={i} className="relative flex items-center">
                {/* Mobile: marker + hint pointing right, single left-aligned rail */}
                <div className="sm:hidden flex items-center w-full">
                  <ProcessMarker step={p.step} reveal={reveal} />
                  <div style={fadeStyle}>
                    <ProcessHint p={p} side="right" reveal={reveal} />
                  </div>
                </div>

                {/* Desktop: zigzag hints either side of a centered rail */}
                <div className="hidden sm:flex items-center flex-1 justify-end">
                  {!onRight && (
                    <div style={fadeStyle}>
                      <ProcessHint p={p} side="left" reveal={reveal} />
                    </div>
                  )}
                </div>
                <div className="hidden sm:block">
                  <ProcessMarker step={p.step} reveal={reveal} />
                </div>
                <div className="hidden sm:flex items-center flex-1 justify-start">
                  {onRight && (
                    <div style={fadeStyle}>
                      <ProcessHint p={p} side="right" reveal={reveal} />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Stage 4: closing call-to-action
// ---------------------------------------------------------------------------
function CTAStage({ opacity }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center px-5 sm:px-8" style={{ opacity }}>
      <div className="max-w-2xl mx-auto text-center">
        <h3 className="font-display text-3xl sm:text-4xl md:text-5xl font-black text-white leading-tight mb-5">
          Markanızı daha <span className="text-[#F5A623]">görünür</span> hâle getirelim.
        </h3>
        <p className="text-white/60 text-base sm:text-lg leading-relaxed max-w-xl mx-auto mb-9">
          Projenizi anlatın, ihtiyacınıza özel tasarım ve üretim çözümünü birlikte oluşturalım.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="#iletisim"
            className="group btn-neu w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#F5A623] hover:bg-white text-[#0D0D0D] font-bold text-sm sm:text-base px-7 py-3.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0D0D0D]"
          >
            Teklif Al
            <ArrowIcon className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
          </a>
          <a
            href="#referanslarimiz"
            className="btn-neu w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#F8F8F8] hover:bg-white text-[#1A1A1A] font-bold text-sm sm:text-base px-7 py-3.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0D0D0D]"
          >
            Projelerimizi İncele
          </a>
        </div>
      </div>
    </div>
  );
}

// Quick-jump "Teklif Al" pill, pinned to the corner of the card itself
// (never the viewport) — only meaningful while browsing services or the
// process timeline, where there's no other call-to-action on screen yet.
// Positioned at the bottom-right corner; the site-wide WhatsAppButton is
// fixed at the bottom-left corner on every screen, so the two never overlap.
function FloatingOfferButton({ visible }) {
  return (
    // Wrapper owns the show/hide slide (a Tailwind translate-y utility —
    // still a class-based transform, so it would just as easily lose to
    // btn-neu's own transform on the same element); the inner <a> owns its
    // independent hover tilt via btn-neu.
    <div
      className={`absolute bottom-24 right-5 sm:bottom-28 sm:right-8 z-40 transition-all duration-300 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3 pointer-events-none"
      }`}
    >
      <a
        href="#iletisim"
        aria-hidden={!visible}
        tabIndex={visible ? 0 : -1}
        className="group btn-neu inline-flex items-center gap-2 bg-[#F5A623] hover:bg-white text-[#0D0D0D] font-bold text-sm px-5 py-3 sm:px-6 sm:py-3.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0D0D0D]"
      >
        Teklif Al
        <ArrowIcon className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
      </a>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Four scroll stages: hero intro -> service groups -> process timeline -> CTA.
// ---------------------------------------------------------------------------
// The groups stage's weight controls only its own share of scroll —
// intro/timeline/CTA keep their exact vh since each stage's absolute scroll
// distance is weight * VH_PER_WEIGHT regardless of what the other weights
// are. Desktop items are tapped, not scrolled to, so that budget only needs
// to cover panning between the four groups themselves (see
// GROUP_PHASE_WEIGHTS) — a small weight. Mobile items still cascade by
// swipe like the original design, so the budget needs to be large enough to
// give roughly a viewport-height of scroll per *item* again.
const DESKTOP_GROUPS_WEIGHT = 3;
const MOBILE_GROUPS_WEIGHT = 14;
const VH_PER_WEIGHT = 160;

function useIsMobile(breakpointPx = 768) {
  const [width, setWidth] = useState(() => (typeof window !== "undefined" ? window.innerWidth : breakpointPx));
  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return width < breakpointPx;
}

export default function Services() {
  const panelRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const isMobile = useIsMobile();

  const segmentWeights = [1, isMobile ? MOBILE_GROUPS_WEIGHT : DESKTOP_GROUPS_WEIGHT, 1.5, 1];
  const totalWeight = segmentWeights.reduce((a, b) => a + b, 0);
  // Extra scroll distance (beyond the one viewport the panel itself already
  // occupies) the whole intro -> groups -> timeline -> CTA sequence needs —
  // fed to usePinnedPanel as "virtual" content height (see About.jsx for the
  // same pattern): there's no real overflowing DOM block, just a progress
  // value driving which stage/item is shown.
  const virtualExtraVh = totalWeight * VH_PER_WEIGHT;

  usePinnedPanel(panelRef, { virtualExtraVh, onProgress: setProgress });

  const { index: segmentIndex, local: segmentLocal } = resolveWeightedSegment(progress, segmentWeights);

  const isIntro = segmentIndex === 0;
  const isServiceGroups = segmentIndex === 1;
  const isTimeline = segmentIndex === 2;
  const isCTA = segmentIndex === 3;

  const heroOpacity = stageOpacity(segmentLocal, { fadeIn: false, fadeOut: true });
  // Arriving at the first group (Tabela) should light up quickly instead of
  // sitting on a dark screen for a big chunk of scroll — a much shorter
  // fade-in than the fade-out on the way to the timeline. fadeOutEdge is
  // small on purpose: the last group (Matbaa) needs to stay fully visible
  // for as much of its own dwell as possible, since that's the user's whole
  // window to tap through its items before the pan away from it starts.
  const groupsOpacity = stageOpacity(segmentLocal, { fadeIn: true, fadeOut: true, fadeInEdge: 0.03, fadeOutEdge: 0.04 });
  const timelineOpacity = stageOpacity(segmentLocal, { fadeIn: false, fadeOut: true });
  const ctaOpacity = stageOpacity(segmentLocal, { fadeIn: true, fadeOut: false });

  const showFloatingCTA = isServiceGroups || isTimeline;

  return (
    <section
      ref={panelRef}
      id="hizmetlerimiz"
      className="relative h-dvh pt-20 sm:pt-24 overflow-hidden bg-[#0D0D0D] flex items-center justify-center"
    >
      {/* Conic-gradient backdrop — purely decorative, never intercepts input */}
      <div className="services-depth-bg pointer-events-none" />
      {/* Dark scrim so the white foreground text stays legible over the
          brighter, busier stripe pattern */}
      <div className="absolute inset-0 bg-[#0D0D0D]/45 pointer-events-none" />

      {isIntro && <HeroStage opacity={heroOpacity} />}

      {isServiceGroups && (
        <ServiceGroupsStage segmentLocal={segmentLocal} opacity={groupsOpacity} isMobile={isMobile} />
      )}

      {isTimeline && (
        <div className="absolute inset-0" style={{ opacity: timelineOpacity }}>
          <Timeline localProgress={segmentLocal} />
        </div>
      )}

      {isCTA && <CTAStage opacity={ctaOpacity} />}

      <FloatingOfferButton visible={showFloatingCTA} />
    </section>
  );
}
