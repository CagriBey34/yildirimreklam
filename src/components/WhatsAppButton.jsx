function WhatsAppIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zm-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884zm8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.478-8.413z" />
    </svg>
  );
}

// Persistent WhatsApp shortcut — square neubrutalist badge (same .btn-neu
// shell as every other button on the site: thick black border, hard offset
// shadow, perspective pop on hover) rather than the usual circular WhatsApp
// bubble, so it reads as part of this site's own design language instead of
// a bolted-on third-party widget. `fixed` (not absolute, unlike the
// section-scoped FloatingOfferButton in Services) so it stays anchored to
// the viewport corner across every section, independent of the pinned-panel
// scroll choreography.
export default function WhatsAppButton() {
  return (
    // Positioning lives on this wrapper, not the <a> itself: .btn-neu's own
    // `position: relative` (needed for its 3D tilt) is equal-specificity
    // with and declared after Tailwind's `.fixed` utility, so it would win
    // the cascade and silently demote the button to an in-flow element
    // (which is why it only ever appeared down by the footer).
    <div className="fixed bottom-5 left-5 sm:bottom-8 sm:left-8 z-40">
      <a
        href="https://wa.me/905550087921?text=Merhaba%2C%20bilgi%20almak%20istiyorum."
        target="_blank"
        rel="noopener noreferrer"
        aria-label="WhatsApp'tan yazın"
        className="btn-neu group flex items-center bg-[#25D366] hover:bg-[#20bd5a] text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#1A1A1A]"
      >
        <span className="flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 flex-shrink-0">
          <WhatsAppIcon className="w-7 h-7 sm:w-8 sm:h-8" />
        </span>
        {/* Collapsed to 0 width at rest; expands rightward on hover/focus to
            reveal the label. Capped by max-width (not width) so it can
            transition smoothly while still sizing to the text's natural
            width once revealed, and it rides inside the same .btn-neu
            border/shadow shell as the icon rather than getting its own. */}
        <span className="max-w-0 group-hover:max-w-[230px] group-focus-visible:max-w-[230px] sm:group-hover:max-w-[260px] sm:group-focus-visible:max-w-[260px] overflow-hidden whitespace-nowrap transition-[max-width] duration-400 ease-[cubic-bezier(0.23,1,0.32,1)]">
          <span className="flex items-center h-14 sm:h-16 bg-[#F5A623] text-[#1A1A1A] font-display font-bold text-sm sm:text-base pl-4 pr-5">
            Bizimle İletişime Geçin
          </span>
        </span>
      </a>
    </div>
  );
}
