import { useRef } from "react";
import { reasonIcons } from "../assets/icons";
import { useReveal } from "../lib/motion";
import { ScrubText, SplitText } from "./ui/SplitText";
import { ColorBar, SectionHead } from "./ui/Print";

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

const specs = [
  ["Uzmanlık", "Tabela · Dijital Baskı · Promosyon · Matbaa"],
  ["Hizmet alanı", "Türkiye geneli"],
  ["Çalışma saatleri", "Pzt – Cmt · 08:00 – 18:00"],
  ["Süreç", "Keşif → Tasarım → Üretim → Montaj"],
];

// One cell of the ruled "Neden biz?" table. Cells share hairlines like a
// spec sheet; hovering floods the cell yellow.
function ReasonCell({ reason, index }) {
  return (
    <article className="group relative -mt-px -ml-px border border-ink/15 bg-paper p-6 sm:p-8 transition-colors duration-500 hover:bg-brand hover:z-[1]">
      <div className="flex items-start justify-between gap-4">
        <span className="label text-ink/45 group-hover:text-ink">R—0{index + 1}</span>
        <img
          src={reasonIcons[index]}
          alt=""
          loading="lazy"
          className="h-20 w-20 sm:h-24 sm:w-24 object-contain mix-blend-multiply transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-rotate-3 group-hover:scale-105"
        />
      </div>
      <h3 className="mt-10 display text-2xl sm:text-[1.55rem] leading-[1.08]">{reason.title}</h3>
      <p className="mt-3 max-w-[34ch] text-[0.95rem] leading-relaxed text-ink/65 group-hover:text-ink/80">{reason.desc}</p>
    </article>
  );
}

export default function About() {
  const specRef = useRef(null);
  const gridRef = useRef(null);
  useReveal(specRef, { stagger: true, y: 24 });
  useReveal(gridRef, { stagger: true, y: 40 });

  return (
    <section id="hakkimizda" className="relative py-24 sm:py-36">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHead index="01" label="Hakkımızda" aside={<ColorBar />} />

        <div className="mt-12 sm:mt-16 grid gap-12 lg:grid-cols-12 lg:gap-10">
          <ScrubText
            className="lg:col-span-8 text-[1.75rem] sm:text-[2.6rem] lg:text-[3.2rem] font-semibold leading-[1.2] tracking-[-0.012em]"
            parts={[
              { text: "Tabela, dijital baskı, promosyon ve matbaa alanlarında " },
              { text: "yılların verdiği tecrübeyle", className: "mark" },
              { text: " markanızı en iyi şekilde temsil ediyoruz." },
            ]}
          />

          <dl ref={specRef} className="lg:col-span-4 lg:pt-3 border-t border-ink/15">
            {specs.map(([k, v]) => (
              <div key={k} className="grid grid-cols-[8.5rem_1fr] gap-4 border-b border-ink/15 py-4">
                <dt className="label text-ink/45 pt-0.5">{k}</dt>
                <dd className="font-medium">{v}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="mt-24 sm:mt-36 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
          <SplitText
            className="display text-[3.2rem] sm:text-[5.6rem] lg:text-[7rem]"
            parts={[{ text: "Neden " }, { text: "biz?", className: "mark" }]}
          />
          <p className="max-w-xs text-ink/60 leading-relaxed sm:pb-4">
            Fikirden montaja kadar her adımda yanınızdayız — bizi tercih etmeniz için altı sebep.
          </p>
        </div>

        <div ref={gridRef} className="mt-10 sm:mt-14 grid pl-px pt-px sm:grid-cols-2 lg:grid-cols-3">
          {reasons.map((r, i) => (
            <ReasonCell key={r.title} reason={r} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
