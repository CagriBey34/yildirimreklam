import { useState } from "react";

function ArrowIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  );
}

function PhoneIcon({ className }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z" />
    </svg>
  );
}

function MailIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
}

function PersonIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14c-4.42 0-8 1.79-8 4v2h16v-2c0-2.21-3.58-4-8-4z" />
    </svg>
  );
}

function MessageIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h8M8 8h5m-9 9.5V6a2 2 0 012-2h12a2 2 0 012 2v9a2 2 0 01-2 2H9l-4 4v-3.5z" />
    </svg>
  );
}

function ClockIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function PinIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

const infoCards = [
  { label: "Telefon", value: "0532 445 79 97", href: "tel:05324457997", Icon: PhoneIcon },
  { label: "E-posta", value: "info@yildirimreklam.tr", href: "mailto:info@yildirimreklam.tr", Icon: MailIcon },
  { label: "Çalışma Saatleri", value: "Pzt–Cmt: 08:00 – 18:00", Icon: ClockIcon },
];

// Neubrutalist input card (see .contact-input* in index.css): thick black
// border, hard offset shadow, 3D tilt that pops forward on hover/focus. The
// label badge is a real element (not a ::before) so its text can vary per
// field safely.
function ContactField({ label, Icon, as = "input", className, ...props }) {
  const Field = as;
  return (
    <div className="contact-input">
      <span className="contact-input__label">{label}</span>
      <div className="contact-input__glow" />
      <span className="contact-input__icon">
        <Icon />
      </span>
      <Field className={`contact-input__field ${className ?? ""}`} {...props} />
    </div>
  );
}

export default function Contact() {
  const [form, setForm] = useState({ name: "", phone: "", email: "", message: "" });
  const [sent, setSent] = useState(false);

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
          ...form // name, phone, email ve message verilerini otomatik gönderir
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
    <section id="iletisim" className="relative py-24 sm:py-28 bg-[#0D0D0D] overflow-hidden">
      {/* Decorative dot grid — purely visual, never intercepts input */}
      <div
        className="absolute inset-0 opacity-[0.05] pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle, #F5A623 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block text-[#F5A623] text-xs font-bold tracking-[0.25em] uppercase mb-4">
            İletişim
          </span>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-black text-white mb-6">
            Hemen <span className="text-[#F5A623]">İletişime Geçin</span>
          </h2>
          <p className="text-lg text-white/60 max-w-xl mx-auto leading-relaxed">
            Projeniz için ücretsiz keşif ve fiyat teklifi almak üzere bizimle
            iletişime geçin.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Contact Info */}
         

          {/* Form */}
          <div className="lg:col-span-12">
            <div className="">
              <h3 className="font-display text-white font-black text-2xl mb-6">Teklif Formu</h3>

              {sent && (
                <div className="mb-6 p-4 bg-green-500/15 border border-green-500/30 text-green-400 font-semibold text-sm">
                  ✓ Mesajınız iletildi! En kısa sürede size dönüş yapacağız.
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-10 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-10">
                  <ContactField
                    label="Ad Soyad"
                    Icon={PersonIcon}
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    placeholder="Adınız Soyadınız"
                  />
                  <ContactField
                    label="Telefon"
                    Icon={PhoneIcon}
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="05__ ___ __ __"
                  />
                </div>
                <ContactField
                  label="E-posta"
                  Icon={MailIcon}
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  placeholder="ornek@sirket.com"
                />
                <ContactField
                  label="Mesajınız"
                  Icon={MessageIcon}
                  as="textarea"
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  required
                  rows={4}
                  placeholder="Projeniz hakkında bilgi verin..."
                />
                <button
                  type="submit"
                  className="group btn-neu w-full inline-flex items-center justify-center gap-2 bg-[#F5A623] hover:bg-white text-[#0D0D0D] font-black text-base py-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#171717]"
                >
                  Teklif İste
                  <ArrowIcon className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                </button>
              </form>
            </div>

            <div className="mt-14">
              <h3 className="font-display text-white font-black text-2xl mb-6">Konumumuz</h3>
              <div className="contact-map w-full aspect-[16/9] sm:aspect-[21/9]">
                <span className="contact-map__label"></span>
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d5181.022347497779!2d28.781089782509625!3d41.078224969460386!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14caa5000b744939%3A0x8f6542c0665b6321!2zWcSxbGTEsXLEsW0gUmVrbGFtIEFqYW5zxLE!5e1!3m2!1str!2str!4v1785746022014!5m2!1str!2str"
                  className="contact-map__frame"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="strict-origin-when-cross-origin"
                  title="Yıldırım Reklam Ajansı Konumu"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
