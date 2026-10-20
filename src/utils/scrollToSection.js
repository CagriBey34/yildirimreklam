// Document-space top of a section, read live at click time via the
// offsetParent chain (ignores the temporary transforms of reveal
// animations). "anasayfa" is the intro at the very top of the page.
export function getSectionTop(id) {
  const el = document.getElementById(id);
  if (!el) return null;
  let top = 0;
  for (let node = el; node; node = node.offsetParent) top += node.offsetTop;
  return top;
}

export function scrollToSection(id, { smooth = true } = {}) {
  const top = getSectionTop(id);
  if (top == null) return;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.scrollTo({ top, behavior: smooth && !reduceMotion ? "smooth" : "auto" });
}
