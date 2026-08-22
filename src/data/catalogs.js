// Katalogların tek kaynağı: hem ana sayfadaki kartlar hem de her kataloğun
// kendi sayfası (#/katalog/<slug>) buradan besleniyor.
export const catalogs = [
  {
    slug: "promosyon",
    title: "Promosyon Kataloğu",
    file: "/katalog/Promosyon-Katalogu-1.pdf",
    downloadName: "Promosyon-Katalogu.pdf",
    sizeLabel: "126 MB",
  },
  {
    slug: "plaket",
    title: "Plaket Kataloğu",
    file: "/katalog/kristal_katalog.pdf",
    downloadName: "Kristal-Katalogu.pdf",
    sizeLabel: "99 MB",
  },
];

export function findCatalog(slug) {
  return catalogs.find((catalog) => catalog.slug === slug) ?? null;
}
