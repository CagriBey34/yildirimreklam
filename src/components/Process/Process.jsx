import { useEffect, useRef } from "react";
import { mountProcessScene } from "./processScene";
import "./process.css";

const steps = [
  { num: "01", title: "İhtiyaç Analizi", text: "İşletmenizin ihtiyaçlarını yerinde analiz ediyoruz." },
  { num: "02", title: "Tasarım", text: "Profesyonel ekibimiz özel tasarımınızı hazırlıyor." },
  { num: "03", title: "Üretim", text: "Kaliteli malzeme ve ekipmanlarla üretim yapıyoruz." },
  { num: "04", title: "Montaj & Teslimat", text: "Yerinde montaj ve sorunsuz teslimat sağlıyoruz." },
];

// "Çalışma süreci": a scroll-driven street scene (processScene.js) that
// follows one sign job from measuring to the evening install.
export default function Process() {
  const rootRef = useRef(null);

  useEffect(() => mountProcessScene(rootRef.current), []);

  return (
    <section ref={rootRef} className="yr-steps" aria-label="Çalışma sürecimiz">
      <div className="yrs-stage">
        <canvas className="yrs-canvas" aria-hidden="true" />
        <div className="yrs-scrim" aria-hidden="true" />

        <p className="yrs-eyebrow yrs-pad">Yıldırım Reklam · Çalışma sürecimiz</p>

        {steps.map((s) => (
          <article key={s.num} className="yrs-cap yrs-pad">
            <p className="yrs-num">{s.num}</p>
            <h3 className="yrs-h">{s.title}</h3>
            <p className="yrs-txt">{s.text}</p>
          </article>
        ))}

        <nav className="yrs-progress yrs-pad" aria-label="Adımlar">
          {steps.map((s, i) => (
            <button key={s.num} type="button" data-yrs-go={i}>
              <span>
                <b>{s.num}</b> {s.title}
              </span>
              <i>
                <b className="yrs-fill" />
              </i>
            </button>
          ))}
        </nav>
      </div>
    </section>
  );
}
