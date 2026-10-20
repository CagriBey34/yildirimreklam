import { useRef, useState } from "react";
import { useClipReveal, useReveal } from "../lib/motion";
import { SplitText } from "./ui/SplitText";
import { SectionHead } from "./ui/Print";

function ArrowIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14m-6-6l6 6-6 6" />
    </svg>
  );
}

// Underlined field with a small label above it (see .field__* in index.css).
function Field({ label, as = "input", ...props }) {
  const Tag = as;
  const id = `field-${props.name}`;
  return (
    <div>
      <label htmlFor={id} className="field__label label">
        {label}
      </label>
      <Tag id={id} className="field__input" {...props} />
    </div>
  );
}

const channels = [
  { k: "E-posta", v: "info@yildirimreklam.tr", href: "mailto:info@yildirimreklam.tr" },
  {
    k: "WhatsApp",
    v: "0555 008 79 21",
    href: "https://wa.me/905550087921?text=Merhaba%2C%20bilgi%20almak%20istiyorum.",
    external: true,
  },
];

export default function Contact() {
  const [form, setForm] = useState({ name: "", phone: "", email: "", message: "" });
  const [sent, setSent] = useState(false);
  const formRef = useRef(null);
  const mapRef = useRef(null);
  useReveal(formRef, { y: 60 });
  useClipReveal(mapRef);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Yükleniyor durumu ekleyebilirsin ama şimdilik doğrudan gönderiyoruz
    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          // BURAYA E-POSTANA GELEN ACCESS KEY'İ YAPIŞTIR:
          access_key: "c69b2405-1f5a-4972-8825-326410609546",
          subject: "Yıldırım Reklam - Web Sitesinden Yeni Mesaj",
          from_name: form.name,
          ...form, // name, phone, email ve message verilerini otomatik gönderir
        }),
      });

      const result = await response.json();

      if (result.success) {
        setSent(true);
        setTimeout(() => setSent(false), 4000);
        setForm({ name: "", phone: "", email: "", message: "" });
      } else {
        alert("Mesaj gönderilirken bir hata oluştu: " + result.message);
      }
    } catch (error) {
      console.error("Gönderim hatası:", error);
      alert("Bağlantı hatası, lütfen daha sonra tekrar deneyin.");
    }
  };

  return (
    <section id="iletisim" className="relative py-24 sm:py-36">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHead index="05" label="İletişim" aside="Ücretsiz keşif · Fiyat teklifi" />

        <div className="mt-12 sm:mt-16 grid gap-16 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-5">
            <SplitText
              className="display text-[2.3rem] sm:text-[4.2rem] lg:text-[4.4rem]"
              parts={[{ text: "Hemen " }, { text: "iletişime", className: "mark" }, { text: " geçin." }]}
            />
            <p className="mt-8 max-w-md text-ink/65 leading-relaxed">
              Projeniz için ücretsiz keşif ve fiyat teklifi almak üzere bizimle iletişime geçin.
            </p>

            <ul className="mt-12 border-t border-ink">
              {channels.map((c) => (
                <li key={c.k}>
                  <a
                    href={c.href}
                    {...(c.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    className="group flex items-center justify-between gap-4 border-b border-ink/15 py-5 transition-colors duration-300 hover:bg-brand sm:px-2 sm:-mx-2"
                  >
                    <span className="min-w-0">
                      <span className="label block text-ink/45">{c.k}</span>
                      <span className="mt-1 block truncate text-xl sm:text-2xl font-semibold tracking-tight">{c.v}</span>
                    </span>
                    <ArrowIcon className="w-5 h-5 flex-shrink-0 transition-transform duration-500 group-hover:-rotate-45" />
                  </a>
                </li>
              ))}
              <li className="flex items-center justify-between gap-4 border-b border-ink/15 py-5">
                <span>
                  <span className="label block text-ink/45">Çalışma saatleri</span>
                  <span className="mt-1 block text-xl sm:text-2xl font-semibold tracking-tight">Pzt – Cmt · 08:00 – 18:00</span>
                </span>
              </li>
            </ul>
          </div>

          <div ref={formRef} className="lg:col-span-7 crop border border-ink/15 bg-sheet p-6 sm:p-10 lg:p-12">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="display text-3xl sm:text-4xl">Teklif formu</h3>
                <p className="mt-2 text-sm text-ink/55">Formu doldurun, en kısa sürede size dönüş yapalım.</p>
              </div>
              <span className="label hidden sm:block text-ink/40 pt-2">F—01</span>
            </div>

            {sent && (
              <div role="status" className="mt-8 border border-ink bg-brand px-5 py-4 text-sm font-semibold">
                ✓ Mesajınız iletildi! En kısa sürede size dönüş yapacağız.
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-10 space-y-8">
              <div className="grid gap-8 sm:grid-cols-2">
                <Field label="Ad Soyad" type="text" name="name" value={form.name} onChange={handleChange} required autoComplete="name" />
                <Field label="Telefon" type="tel" name="phone" value={form.phone} onChange={handleChange} autoComplete="tel" />
              </div>
              <Field label="E-posta" type="email" name="email" value={form.email} onChange={handleChange} required autoComplete="email" />
              <Field
                label="Projeniz"
                as="textarea"
                name="message"
                value={form.message}
                onChange={handleChange}
                required
                rows={4}
                placeholder="Ne üretmemizi istersiniz? Ölçü, adet, konum…"
              />
              <button type="submit" className="btn btn-ink w-full justify-between !py-5">
                Teklif İste <ArrowIcon className="btn-arrow w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        <figure ref={mapRef} className="mt-20 sm:mt-28">
          <div className="group overflow-hidden border border-ink aspect-[4/3] sm:aspect-[21/9]">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d5181.022347497779!2d28.781089782509625!3d41.078224969460386!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14caa5000b744939%3A0x8f6542c0665b6321!2zWcSxbGTEsXLEsW0gUmVrbGFtIEFqYW5zxLE!5e1!3m2!1str!2str!4v1785746022014!5m2!1str!2str"
              className="block h-full w-full grayscale contrast-[1.05] transition-[filter] duration-700 group-hover:grayscale-0"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
              title="Yıldırım Reklam Ajansı Konumu"
            />
          </div>
          <figcaption className="label mt-3 flex justify-between text-ink/45">
            <span>Atölye konumu</span>
            <span>41.0782° N · 28.7811° E</span>
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
