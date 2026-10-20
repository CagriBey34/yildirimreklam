import { useRef, useState } from "react";
import { useReveal } from "../lib/motion";
import { navigateTo } from "../lib/navigate";
import { SplitText } from "./ui/SplitText";
import { RegMark, SectionHead } from "./ui/Print";
import Process from "./Process/Process";

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
import lightbox from "../assets/services/lightbox.png";
import kartoncanta from "../assets/services/kartoncanta.png";
import bayrak1 from "../assets/services/bayrak1.png";
import bayrak2 from "../assets/services/bayrak2.png";
import bayrak3 from "../assets/services/bayrak3.png";
import bayrak4 from "../assets/services/bayrak4.png";
import bayrak5 from "../assets/services/bayrak5.png";
import bayrak6 from "../assets/services/bayrak6.png";
import bayrak7 from "../assets/services/bayrak7.png";
import display1 from "../assets/services/display1.png";
import display2 from "../assets/services/display2.png";
import display3 from "../assets/services/display3.png";
import display4 from "../assets/services/display4.png";
import display5 from "../assets/services/display5.png";
import display6 from "../assets/services/display6.png";
import display7 from "../assets/services/display7.png";
import display8 from "../assets/services/display8.png";


// Service groups, browsed in the index on the left. Every item carries its own
// `image` — swap the import at the top and the value on any entry any time
// a more accurate photo exists for that specific item.
const serviceGroups = [
  {
    id: "tabela",
    title: "Tabela",
    items: [
      { label: "Işıklı", image: ısıklı },
      { label: "Işıksız", image: ısıksız },
      { label: "Lightbox", image: lightbox },
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
    id: "display-urunler",
    title: "Display Ürünler",
    items: [
      { label: "Roll-up Banner", image: display1 },
      { label: "X-Banner", image: display2 },
      { label: "Fasulye Stand", image: display3 },
      { label: "Örümcek Stand", image: display4 },
      { label: "Backdrop", image: display5 },
      { label: "Broşürlük Stand", image: display6 },
      { label: "Rondo Çerçeveler", image: display7 },
      { label: "Duba", image: display8 },
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
      { label: "Karton Çanta", image: kartoncanta },
    ],
  },
  {
    id: "bayrak",
    title: "Bayrak",
    items: [
      { label: "Yelken Bayrak", image: bayrak1 },
      { label: "Masa Bayrağı", image: bayrak2 },
      { label: "Kırlangıç Bayrak", image: bayrak3 },
      { label: "Makam Bayrağı", image: bayrak4 },
      { label: "Gönder Bayrağı", image: bayrak5 },
      { label: "Süsleme Bayrağı", image: bayrak6 },
      { label: "Sopalı Bayrak", image: bayrak7 },
    ],
  },
];

function ArrowIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14m-6-6l6 6-6 6" />
    </svg>
  );
}

const go = (id) => (e) => {
  e.preventDefault();
  navigateTo(id);
};

// Group index: a ruled vertical list on desktop (sticky beside the grid),
// a horizontal scroller of tabs on mobile.
function GroupIndex({ active, onSelect }) {
  return (
    <nav aria-label="Hizmet grupları" className="lg:sticky lg:top-28 -mx-5 px-5 sm:mx-0 sm:px-0 overflow-x-auto no-scrollbar">
      <ul className="flex gap-2 lg:flex-col lg:gap-0 lg:border-t lg:border-ink">
        {serviceGroups.map((g, i) => {
          const on = i === active;
          return (
            <li key={g.id} className="shrink-0">
              <button
                type="button"
                onClick={() => onSelect(i)}
                aria-pressed={on}
                className={`w-full flex items-center gap-4 text-left border px-4 py-3 lg:border-0 lg:border-b lg:px-3 lg:py-4 transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-ink focus-visible:-outline-offset-2 ${
                  on ? "bg-ink text-paper border-ink" : "border-ink/15 hover:bg-paper-2"
                }`}
              >
                <span className="display flex-1 whitespace-nowrap text-lg lg:text-[1.2rem]">{g.title}</span>
                <span className={`label hidden lg:inline ${on ? "text-paper/55" : "text-ink/40"}`}>{g.items.length}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

// One product photo with a caption; crop marks appear on hover.
function ItemTile({ item, index }) {
  return (
    <figure className="tile-in group crop crop-hover" style={{ animationDelay: `${index * 55}ms` }}>
      <div className="relative aspect-[4/3] overflow-hidden bg-paper-2">
        <img
          src={item.image}
          alt={`${item.label} uygulama örneği`}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.06]"
        />
      </div>
      <figcaption className="flex items-baseline justify-between gap-3 border-b border-ink/15 py-3">
        <span className="text-sm sm:text-base font-semibold leading-tight">{item.label}</span>
      </figcaption>
    </figure>
  );
}

export default function Services() {
  const [active, setActive] = useState(0);
  const group = serviceGroups[active];
  const total = serviceGroups.reduce((n, g) => n + g.items.length, 0);

  const ctaRef = useRef(null);
  useReveal(ctaRef, { y: 0 });

  return (
    <section id="hizmetlerimiz" className="relative border-t border-ink/10 bg-sheet pt-24 sm:pt-36">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHead label="Hizmetlerimiz" aside={`${serviceGroups.length} grup · ${total} ürün`} />

        <div className="mt-12 sm:mt-16 grid gap-8 lg:grid-cols-12 lg:items-end">
          <SplitText
            className="lg:col-span-8 display text-[2.3rem] sm:text-[4.2rem] lg:text-[5.4rem]"
            parts={[{ text: "Markanızı " }, { text: "görünür", className: "mark" }, { text: " kılan üretimler." }]}
          />
          <p className="lg:col-span-4 text-ink/65 leading-relaxed lg:pb-3">
            Fikirden üretime, uygulamadan montaja kadar markanızın fiziksel dünyadaki tüm görünürlük ihtiyaçlarını
            profesyonel çözümlerle hayata geçiriyoruz.
          </p>
        </div>

        <div className="mt-16 sm:mt-24 grid gap-8 lg:grid-cols-[300px_1fr] lg:gap-14">
          <div className="min-w-0">
            <GroupIndex active={active} onSelect={setActive} />
          </div>

          <div className="min-w-0">
            <div className="flex items-end justify-between gap-4 border-b border-ink pb-4">
              <h3 key={group.id} className="tile-in display text-3xl sm:text-5xl">
                {group.title}
              </h3>
              <span className="label text-ink/45 pb-2">{group.items.length} ürün</span>
            </div>
            <div key={group.id} className="mt-8 grid grid-cols-2 gap-x-3 gap-y-7 sm:gap-x-5 sm:gap-y-9 xl:grid-cols-3">
              {group.items.map((it, i) => (
                <ItemTile key={it.label} item={it} index={i} />
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Process: scroll-driven street scene, full bleed */}
      <div className="mx-auto max-w-7xl px-5 sm:px-8 mt-28 sm:mt-40">
        <SectionHead label="Çalışma süreci" aside="Kaydırın · Fikirden montaja, dört adımda" />
      </div>
      <div className="mt-10">
        <Process />
      </div>

      {/* CTA: full-bleed yellow sheet with registration marks in the corners */}
      <div ref={ctaRef} className="relative border-b border-ink bg-brand">
        {["top-4 left-4", "top-4 right-4", "bottom-4 left-4", "bottom-4 right-4"].map((pos) => (
          <RegMark key={pos} className={`absolute ${pos} h-5 w-5 sm:h-6 sm:w-6 text-ink/70`} />
        ))}
        <div className="mx-auto max-w-7xl px-5 sm:px-8 py-20 sm:py-28 grid gap-10 lg:grid-cols-12 lg:items-end">
          <h3 className="lg:col-span-8 display text-[2.2rem] sm:text-[3.8rem] lg:text-[4.9rem]">
            Markanızı daha görünür hâle getirelim.
          </h3>
          <div className="lg:col-span-4 flex flex-col gap-3">
            <p className="mb-3 text-ink/75 leading-relaxed">
              Projenizi anlatın, ihtiyacınıza özel tasarım ve üretim çözümünü birlikte oluşturalım.
            </p>
            <a href="#iletisim" onClick={go("iletisim")} className="btn btn-ink justify-between">
              Teklif Al <ArrowIcon className="btn-arrow w-4 h-4" />
            </a>
            <a href="#referanslarimiz" onClick={go("referanslarimiz")} className="btn btn-line justify-between">
              Referanslarımızı Görün <ArrowIcon className="btn-arrow w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
