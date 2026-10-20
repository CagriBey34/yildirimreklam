import { gsap, ScrollTrigger, prefersReducedMotion } from "./motion";
import { getSectionTop } from "../utils/scrollToSection";

const LABELS = {
  anasayfa: "Giriş",
  hakkimizda: "Hakkımızda",
  hizmetlerimiz: "Hizmetlerimiz",
  kataloglarimiz: "Kataloglarımız",
  referanslarimiz: "Referanslarımız",
  iletisim: "İletişim",
};

let busy = false;

// Section-to-section "page transition": two curtains (amber, then ink with
// the target section's name) wipe up over the screen, the page jumps
// instantly underneath, and the curtains wipe away upward. Short hops just
// smooth-scroll instead; reduced motion jumps instantly.
export function navigateTo(id) {
  const top = getSectionTop(id);
  if (top == null || busy) return;

  const distance = Math.abs(top - window.scrollY);
  const curtain = document.getElementById("page-curtain");

  if (prefersReducedMotion() || !curtain) {
    window.scrollTo({ top, behavior: "auto" });
    return;
  }
  if (distance < window.innerHeight * 1.2) {
    window.scrollTo({ top, behavior: "smooth" });
    return;
  }

  busy = true;
  const [amber, ink] = curtain.querySelectorAll(".curtain-layer");
  const label = curtain.querySelector(".curtain-label");
  label.textContent = LABELS[id] ?? "";

  const tl = gsap.timeline({
    onComplete: () => {
      gsap.set(curtain, { visibility: "hidden" });
      busy = false;
    },
  });
  tl.set(curtain, { visibility: "visible" })
    .fromTo(amber, { clipPath: "inset(100% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.55, ease: "power4.inOut" })
    .fromTo(ink, { clipPath: "inset(100% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.55, ease: "power4.inOut" }, 0.08)
    .fromTo(label, { yPercent: 110 }, { yPercent: 0, duration: 0.6, ease: "expo.out" }, 0.4)
    .add(() => {
      window.scrollTo({ top, behavior: "auto" });
      ScrollTrigger.update();
    }, 0.7)
    .to(label, { yPercent: -110, duration: 0.45, ease: "power3.in" }, 0.95)
    .to(ink, { clipPath: "inset(0% 0% 100% 0%)", duration: 0.7, ease: "power4.inOut" }, 1.15)
    .to(amber, { clipPath: "inset(0% 0% 100% 0%)", duration: 0.7, ease: "power4.inOut" }, 1.23);
}
