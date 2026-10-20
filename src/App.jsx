import { useEffect } from "react";

import Navbar from "./components/Navbar";
import Intro from "./components/Intro/Intro";
import About from "./components/About";
import Services from "./components/Services";
import Catalogs from "./components/Catalogs";
import References from "./components/References";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import WhatsAppButton from "./components/WhatsAppButton";
import { PageCurtain, Preloader, ScrollProgress } from "./components/ui/Chrome";
import { Ticker } from "./components/ui/Print";
import { scrollToSection } from "./utils/scrollToSection";

export default function App() {
  // `#kataloglarimiz` gibi bir bölüm bağlantısıyla açıldığında tarayıcının
  // kendi anchor atlaması fontlar/görseller yerleşmeden gerçekleşiyor.
  // Bölümün gerçek konumunu bir tık sonra okuyup oraya gidiyoruz.
  // `#/katalog/...` bir rota, bölüm değil — ona karışmıyoruz.
  useEffect(() => {
    const hash = window.location.hash;
    if (!hash || hash.startsWith("#/")) return;

    const timer = setTimeout(() => scrollToSection(hash.slice(1), { smooth: false }), 80);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="font-sans relative">
      <Intro />
      <Ticker />

      <main className="relative">
        <About />
        <Services />
        <Catalogs />
        <References />
        <Contact />
      </main>
      <Footer />

      <Navbar />
      <WhatsAppButton />
      <ScrollProgress />
      <PageCurtain />
      <Preloader />
    </div>
  );
}
