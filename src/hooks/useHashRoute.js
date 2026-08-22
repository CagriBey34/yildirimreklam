import { useEffect, useState } from "react";

// Site tek bir HTML dosyasından servis ediliyor ve sunucuda hiçbir rewrite
// kuralı yok — bu yüzden yönlendirme hash üzerinden yapılıyor. Böylece
// `siteadi.com/#/katalog/promosyon` linki doğrudan açıldığında da,
// yenilendiğinde de sunucudan bir şey istenmiyor, 404 riski oluşmuyor.
//
// Sayfa içi bağlantılar (#iletisim, #kataloglarimiz ...) zaten hash
// kullandığı için ayrım şu: SADECE `#/` ile başlayan hash bir rota sayılıyor.
// Slash'sız her hash eskisi gibi ana sayfadaki bir bölüm demek.
function readRoute() {
  const hash = window.location.hash;
  return hash.startsWith("#/") ? hash.slice(1) : "/";
}

export function useHashRoute() {
  const [route, setRoute] = useState(readRoute);

  // Sayfa açıldıktan sonra site içinde en az bir geçiş yapıldı mı? Katalog
  // linki doğrudan paylaşılıp açıldığında geçmişte site içi bir adım yok —
  // orada history.back() kullanıcıyı siteden tamamen çıkarır.
  const [navigated, setNavigated] = useState(false);

  useEffect(() => {
    const handleHashChange = () => {
      setRoute(readRoute());
      setNavigated(true);
    };
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  return { route, navigated };
}
