import promosyonPage from "../assets/catalogs/promosyon-page.webp";
import plaketPage from "../assets/catalogs/plaket-page.webp";

// Katalogların tek kaynağı: hem ana sayfadaki kartlar hem de her kataloğun
// kendi sayfası (#/katalog/<slug>) buradan besleniyor.
//
// `cover` (isteğe bağlı): kataloğun gerçek kapağı; verilmezse kartta marka
// kapağı çiziliyor.
// `preview`: kapak açılınca altında görünen ilk iç sayfa.
// İkisi de PDF'in ilgili sayfasından üretilmiş küçük görseller — kartta
// PDF'in kendisini yüklemek ziyaretçiye yüzlerce MB indirtirdi.
export const catalogs = [
  {
    slug: "promosyon",
    title: "Promosyon Kataloğu",
    file: "/katalog/2027_katalog.pdf",
    downloadName: "Promosyon-Katalogu-2027.pdf",
    sizeLabel: "192 MB",
    pages: 264,
    preview: promosyonPage,
  },
  {
    slug: "plaket",
    title: "Plaket Kataloğu",
    file: "/katalog/kristal_katalog.pdf",
    downloadName: "Plaket-Katalogu.pdf",
    sizeLabel: "99 MB",
    pages: 129,
    preview: plaketPage,
  },
];

export function findCatalog(slug) {
  return catalogs.find((catalog) => catalog.slug === slug) ?? null;
}
