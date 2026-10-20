import { useRef } from "react";
import { useReveal } from "../lib/motion";
import { navigateTo } from "../lib/navigate";
import { SplitText } from "./ui/SplitText";
import { SectionHead } from "./ui/Print";

const brands = [
  { name: "AGD", file: "agd.png" },
  { name: "Akyapı", file: "akyapi.png" },
  { name: "Birikim Okulları", file: "birikimokulları.png" },
  { name: "Boss", file: "boss.png" },
  { name: "Esenler Belediyesi", file: "esenlerbelediyesi.png" },
  { name: "Fuzulev", file: "fuzulev.png" },
  { name: "Hayrat Vakfı", file: "hayratvakfi.png" },
  { name: "HD Hyundai", file: "hdhyundai.png" },
  { name: "Helal Dünya", file: "helaldunya.png" },
  { name: "Helvacı Ali", file: "helvaciali.png" },
  { name: "IDL Yapı", file: "idlyapi.png" },
  { name: "İstanbul Üniversitesi", file: "istanbuluni2.jpg" },
  { name: "MÜSİAD", file: "müsiad.png" },
  { name: "New Holland", file: "newholland.png" },
  { name: "Renault", file: "renault.png" },
  { name: "Siyer Yayınları", file: "siyeryayinlari.png" },
  { name: "Uygun AVM", file: "uygunavm.png" },
  { name: "Yummy Cup", file: "yummycups.png" },
  { name: "Zinde Okulları", file: "zindeokulları.png" },
  { name: "Sütlüce Kadayıf", file: "sutluce.png" },
  { name: "Güneli Fırın", file: "guneli.png" },
  { name: "Chint Group", file: "chint.png" },
  { name: "Sarıyer Börek", file: "sarıyerborek.png" },
];

const sectors = [
  "Restoranlar",
  "Kafeler",
  "Fabrikalar",
  "Hastaneler",
  "Okullar",
  "Marketler",
  "Mağazalar",
  "İnşaat firmaları",
  "Belediyeler",
  "Kurumsal şirketler",
];

const cell = "-mt-px -ml-px border border-ink/15";

const half = Math.ceil(brands.length / 2);

// Mobile only: a compact strip of logos that drifts sideways. The list is
// rendered twice so the -50% marquee loop is seamless.
function LogoStrip({ items, reverse = false }) {
  return (
    <div className="relative overflow-hidden border-y border-ink/15 motion-reduce:overflow-x-auto">
      <ul
        className={`marquee ${reverse ? "[animation-direction:reverse]" : ""}`}
        style={{ "--marquee-duration": "32s" }}
      >
        {[...items, ...items].map((b, i) => (
          <li
            key={`${b.file}-${i}`}
            aria-hidden={i >= items.length ? "true" : undefined}
            className="flex h-16 w-28 shrink-0 items-center justify-center border-r border-ink/15 px-4"
          >
            <img
              src={`/markalar/${b.file}`}
              alt={i >= items.length ? "" : b.name}
              loading="lazy"
              className="max-h-9 max-w-full object-contain grayscale opacity-70 mix-blend-multiply"
            />
          </li>
        ))}
      </ul>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-sheet to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-sheet to-transparent" />
    </div>
  );
}

const toContact = (e) => {
  e.preventDefault();
  navigateTo("iletisim");
};

export default function References() {
  const gridRef = useRef(null);
  useReveal(gridRef, { y: 40 });

  return (
    <section id="referanslarimiz" className="relative border-t border-ink/10 bg-sheet py-16 sm:py-36">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHead index="04" label="Referanslarımız" aside={`${brands.length} marka · Türkiye geneli`} />

        <div className="mt-8 sm:mt-16 grid gap-4 sm:gap-8 lg:grid-cols-12 lg:items-end">
          <SplitText
            className="lg:col-span-8 display text-[2.3rem] sm:text-[4.2rem] lg:text-[5.4rem]"
            parts={[{ text: "Birlikte çalıştığımız " }, { text: "markalar.", className: "mark" }]}
          />
          <p className="text-ink/65 sm:hidden">Restoranlardan belediyelere, {sectors.length} farklı sektöre hizmet veriyoruz.</p>
          <div className="hidden sm:block lg:col-span-4 lg:pb-3">
            <p className="label text-ink/45">Hizmet verdiğimiz sektörler</p>
            <ul className="mt-3 flex flex-wrap gap-x-2 gap-y-1 text-ink/75">
              {sectors.map((s, i) => (
                <li key={s}>
                  {s}
                  {i < sectors.length - 1 && <span className="ml-2 text-ink/25">/</span>}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Mobile: two drifting logo strips + a one-line call to action. */}
        <div className="mt-10 -mx-5 space-y-[-1px] sm:hidden">
          <LogoStrip items={brands.slice(0, half)} />
          <LogoStrip items={brands.slice(half)} reverse />
        </div>
        <a
          href="#iletisim"
          onClick={toContact}
          className="mt-6 flex items-center justify-between border-b border-ink pb-3 font-semibold sm:hidden"
        >
          Sıradaki referansımız siz olun
          <span aria-hidden="true">→</span>
        </a>

        {/* Tablet & desktop: the full ruled logo wall. */}
        <ul ref={gridRef} className="mt-14 sm:mt-20 hidden pl-px pt-px sm:grid sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {brands.map((b) => (
            <li key={b.file} className={`${cell} group relative flex aspect-[3/2] items-center justify-center bg-sheet p-6 sm:p-8`}>
              <img
                src={`/markalar/${b.file}`}
                alt={b.name}
                loading="lazy"
                className="max-h-full max-w-full object-contain grayscale opacity-70 mix-blend-multiply transition-all duration-500 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-105"
              />
              <span className="label pointer-events-none absolute bottom-2 left-3 right-3 truncate text-[0.62rem] text-ink/0 transition-colors duration-300 group-hover:text-ink/50">
                {b.name}
              </span>
            </li>
          ))}
          <li className={`${cell} aspect-[3/2]`}>
            <a
              href="#iletisim"
              onClick={toContact}
              className="group flex h-full w-full flex-col justify-between bg-brand p-4 sm:p-5 transition-colors duration-500 hover:bg-ink hover:text-paper"
            >
              <span className="label">Sıradaki</span>
              <span className="flex items-end justify-between gap-2">
                <span className="display text-xl sm:text-2xl leading-[1]">Siz olun</span>
                <span aria-hidden="true" className="text-xl transition-transform duration-500 group-hover:translate-x-1">→</span>
              </span>
            </a>
          </li>
        </ul>
      </div>
    </section>
  );
}
