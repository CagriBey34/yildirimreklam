import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import About from "./components/About";
import Services from "./components/Services";
import Catalogs from "./components/Catalogs";
import References from "./components/References";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import WhatsAppButton from "./components/WhatsAppButton";

export default function App() {
  return (
    <div className="font-sans antialiased relative">
      {/* Fixed decorative grid background, visible in the gaps between the stacked cards */}
      <div
        className="fixed inset-0 -z-10 bg-[#141414]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(245,166,35,0.25) 1px, transparent 1px), linear-gradient(90deg, rgba(245,166,35,0.25) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="pt-3">
        {/* Every section except the last pins itself (via usePinnedPanel,
            GSAP ScrollTrigger) then shrinks + fades out as the next one
            takes over — each manages this internally now instead of a
            shared sticky-card wrapper here, since About/Services also need
            to fake-scroll through their own choreographed content while
            pinned, not just sit still. */}
        <Hero />
        <About />
        <Services />
        <Catalogs />
        <References />

        {/* Being the last section, Contact (with Footer directly beneath it)
            isn't pinned at all: it just settles into place once References
            has faded away. */}
        <Contact />
        <Footer />
      </div>

      {/* Rendered after the sections (not before): Navbar's own layout
          effect caches every section's offsetTop up front, and React fires
          sibling layout effects in render order — if Navbar came first,
          that cache would be measured before each section's usePinnedPanel
          had inserted its own marginBottom spacer, baking in offsets that
          were too small for everything after Hero. Being `fixed`, its DOM
          position doesn't affect where it's painted. */}
      <Navbar />
      <WhatsAppButton />
    </div>
  );
}
