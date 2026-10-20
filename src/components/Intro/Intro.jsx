import { useEffect, useRef } from "react";
import { mountIntroScene } from "./introScene";
import { navigateTo } from "../../lib/navigate";
import "./intro.css";

const stations = [
  {
    num: "01 / 04 · Sahada montaj",
    title: "Tabela",
    text: "Kutu harften ışıklı tabelaya, ölçüden montaja kadar. Harfler tek tek yerine oturur, cephe akşam olunca yanar.",
    chips: ["Kutu harf", "Işıklı tabela", "Totem", "Montaj"],
  },
  {
    num: "02 / 04 · Geniş format",
    title: "Dijital Baskı",
    text: "Branda, vinil ve afiş, geniş format makinede CMYK olarak basılır. Kafa her geçişte bir şerit daha işler.",
    chips: ["Branda", "Vinil", "Folyo", "Afiş"],
  },
  {
    num: "03 / 04 · Baskılı ürün",
    title: "Promosyon",
    text: "Kupa, tişört, şapka ve kalem. Logonuz transfer presinde ürüne geçer, paketlenip yola çıkar.",
    chips: ["Kupa", "Tişört", "Şapka", "Kalem"],
  },
  {
    num: "04 / 04 · Ofset baskı",
    title: "Matbaa",
    text: "Kartvizit, broşür ve katalog. Kâğıt dört renk ünitesinden geçer, renk ayarı lupla kontrol edilir.",
    chips: ["Kartvizit", "Broşür", "Katalog", "Antetli kâğıt"],
  },
];

const skip = () => navigateTo("hakkimizda");

// The site's opening section: a scroll-driven workshop tour (canvas scene in
// introScene.js) that ends on the agency's tagline.
export default function Intro() {
  const rootRef = useRef(null);

  useEffect(() => mountIntroScene(rootRef.current), []);

  return (
    <section id="anasayfa" ref={rootRef} className="yr-intro" aria-label="Yıldırım Reklam tanıtım animasyonu">
      <div className="yr-stage">
        <canvas className="yr-canvas" aria-hidden="true" />
        <div className="yr-scrim" aria-hidden="true" />

        <div className="yr-hero yr-pad">
          <p className="yr-eyebrow">Yıldırım Reklam Ajansı</p>
          <h1 className="yr-title">
            Markanız
            <br />
            <span>sokakta</span> görünsün.
          </h1>
          <p className="yr-lede">Tabela · Dijital Baskı · Promosyon · Matbaa</p>
          <p className="yr-hint">
            <span className="yr-arrow" aria-hidden="true">↓</span> Kaydırın, atölyeyi baştan sona gezin
          </p>
        </div>

        {stations.map((s, i) => (
          <article key={s.title} className="yr-cap yr-pad" data-i={i}>
            <p className="yr-num">{s.num}</p>
            <h2 className="yr-h">{s.title}</h2>
            <p className="yr-txt">{s.text}</p>
            <ul className="yr-chips">
              {s.chips.map((chip) => (
                <li key={chip}>{chip}</li>
              ))}
            </ul>
          </article>
        ))}

        <div className="yr-final yr-pad">
          <p className="yr-eyebrow">Yıldırım Reklam Ajansı</p>
          <h2 className="yr-title yr-title--end">
            Fikrinizi tasarlıyor,
            <br />
            <span>markanızı</span> görünür kılıyoruz.
          </h2>
          <button type="button" className="yr-btn" onClick={skip}>
            Siteye devam et <span aria-hidden="true">→</span>
          </button>
        </div>

        <button type="button" className="yr-skip" onClick={skip}>
          Girişi geç
        </button>

        <nav className="yr-progress yr-pad" aria-label="Bölümler">
          {stations.map((s, i) => (
            <button key={s.title} type="button" data-yr-go={i}>
              <span>{s.title}</span>
              <i>
                <b className="yr-fill" />
              </i>
            </button>
          ))}
        </nav>
      </div>
    </section>
  );
}
