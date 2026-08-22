// Sayfa çevirme sesi: öncelik gerçek kayıtta (src/assets/sayfa-cevirme.mp3),
// o hazır olana kadar (ve yüklenemezse) Web Audio ile sentezlenen yedek ses
// devreye giriyor. Böylece dosya bir sebeple gelmezse çevirme sessiz kalmıyor.
//
// Kayıt `new Audio()` ile değil, bir kez decode edilip AudioBuffer olarak
// çalınıyor: gecikme sıfıra yakın oluyor ve hızlı çevirmelerde sesler
// birbirini kesmek yerine doğal şekilde üst üste binebiliyor.
import flipSampleUrl from "../assets/sayfa-cevirme2.mp3";

// Kaydın sessiz kısmı kırpıldıktan sonra en fazla bu kadarı çalınıyor.
// Çevirme animasyonu 700 ms; kağıdın biraz daha hışırdaması doğal, ama
// kaydın tamamı (1,7 sn) bir sonraki çevirmeye taşacak kadar uzun.
const MAX_SAMPLE_DURATION = 1.1;

// Kayıt normalize ediliyor: dosyanın kendi tepe genliği ne olursa olsun
// `volume` aynı yükseklik hissini versin. 0.5 hedefiyle, varsayılan
// volume=0.38'de çıkış tepe genliği ~0.19 oluyor (yedek sesle aynı seviye).
const TARGET_PEAK = 0.5;

let audioContext = null;
let noiseBuffer = null;
let samplePromise = null;
let sample = null;

function getAudioContext() {
  if (audioContext) return audioContext;

  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return null;

  try {
    audioContext = new AudioContextClass();
  } catch {
    return null;
  }

  return audioContext;
}

function getNoiseBuffer(context) {
  if (noiseBuffer && noiseBuffer.sampleRate === context.sampleRate) {
    return noiseBuffer;
  }

  const length = Math.floor(context.sampleRate * 0.4);
  const buffer = context.createBuffer(1, length, context.sampleRate);
  const channel = buffer.getChannelData(0);

  for (let i = 0; i < length; i += 1) {
    channel[i] = Math.random() * 2 - 1;
  }

  noiseBuffer = buffer;
  return buffer;
}

// Tek bir gürültü katmanı kuruyor: kaynak → bandpass (süpürmeli) → highpass →
// gain (zarf) → çıkış. Hem ana hışırtı hem de kapanış transient'i bunu
// kullanıyor, sadece parametreleri farklı.
function scheduleNoiseLayer(context, options) {
  const {
    startAt,
    duration,
    volume,
    freqFrom,
    freqTo,
    q,
    highpassFrequency,
    playbackRate,
    attack,
  } = options;

  const source = context.createBufferSource();
  source.buffer = getNoiseBuffer(context);
  source.playbackRate.value = playbackRate;

  // Buffer'ın her seferinde aynı yerinden başlamak aynı gürültü desenini
  // tekrarlardı; rastgele bir noktadan okuyunca her çevirme farklı duyuluyor.
  const maxOffset = Math.max(source.buffer.duration - duration - 0.02, 0);
  const offset = Math.random() * maxOffset;

  const bandpass = context.createBiquadFilter();
  bandpass.type = "bandpass";
  bandpass.Q.value = q;
  bandpass.frequency.setValueAtTime(freqFrom, startAt);
  bandpass.frequency.exponentialRampToValueAtTime(freqTo, startAt + duration);

  // Kağıt sesinde olmayan düşük gövdeyi kesiyor.
  const highpass = context.createBiquadFilter();
  highpass.type = "highpass";
  highpass.frequency.value = highpassFrequency;

  const gain = context.createGain();
  gain.gain.setValueAtTime(0.0001, startAt);
  gain.gain.exponentialRampToValueAtTime(volume, startAt + attack);
  gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);

  source.connect(bandpass);
  bandpass.connect(highpass);
  highpass.connect(gain);
  gain.connect(context.destination);

  source.start(startAt, offset);
  source.stop(startAt + duration + 0.02);

  source.onended = () => {
    source.disconnect();
    bandpass.disconnect();
    highpass.disconnect();
    gain.disconnect();
  };
}

// Kaydı indirip decode ediyor ve baştaki/sondaki sessizliği ölçüyor.
// Kırpma sabit bir değere gömülmedi: eşik kaydın kendi tepe genliğine göre
// hesaplanıyor, böylece dosya sonradan değiştirilse de doğru yerden başlıyor.
function loadSample(context) {
  if (samplePromise) return samplePromise;

  samplePromise = fetch(flipSampleUrl)
    .then((response) => response.arrayBuffer())
    .then((data) => context.decodeAudioData(data))
    .then((buffer) => {
      const channel = buffer.getChannelData(0);

      let peak = 0;
      for (let i = 0; i < channel.length; i += 1) {
        const value = Math.abs(channel[i]);
        if (value > peak) peak = value;
      }

      const threshold = peak * 0.02;
      let start = 0;
      while (start < channel.length && Math.abs(channel[start]) < threshold) start += 1;

      let end = channel.length - 1;
      while (end > start && Math.abs(channel[end]) < threshold) end -= 1;

      sample = {
        buffer,
        peak: peak || 1,
        offset: start / buffer.sampleRate,
        duration: Math.min(
          Math.max((end - start) / buffer.sampleRate, 0.05),
          MAX_SAMPLE_DURATION
        ),
      };

      return sample;
    })
    .catch(() => {
      // Dosya gelmezse sentezlenen yedek ses kullanılmaya devam eder.
      sample = null;
      return null;
    });

  return samplePromise;
}

function playSample(context, volume) {
  if (!sample) return false;

  const now = context.currentTime;
  // Aynı kayıt arka arkaya birebir aynı çalarsa kulak bunu hemen yapay
  // algılıyor; hafif hız oynaması tekdüzeliği kırıyor.
  const rate = 0.97 + Math.random() * 0.1;
  const playDuration = sample.duration / rate;

  const source = context.createBufferSource();
  source.buffer = sample.buffer;
  source.playbackRate.value = rate;

  const gain = context.createGain();
  const level = volume * (TARGET_PEAK / sample.peak);
  gain.gain.setValueAtTime(level, now);
  // Kayıt tam bitmeden kesildiğinde "tık" sesi oluşmasın diye kısa sönüm.
  gain.gain.setValueAtTime(level, now + Math.max(playDuration - 0.09, 0.01));
  gain.gain.linearRampToValueAtTime(0.0001, now + playDuration);

  source.connect(gain);
  gain.connect(context.destination);

  source.start(now, sample.offset, sample.duration);

  source.onended = () => {
    source.disconnect();
    gain.disconnect();
  };

  return true;
}

// Kaydı önceden indirip decode eder. PdfFlipBook, PDF yüklenir yüklenmez
// çağırıyor; böylece ilk çevirmede bile gerçek kayıt hazır oluyor, yedek
// sentez sese düşülmüyor.
export function preloadPageFlipSound() {
  const context = getAudioContext();
  if (context) loadSample(context);
}

// `volume` her iki yolda da aynı yükseklik hissini veriyor: kayıt için
// normalize ediliyor, sentez için bandpass kaybını telafi edecek şekilde
// seçildi. Varsayılan 0.38 → her ikisinde de ~0.19 tepe genlik.
//
// `settleDelay` yalnızca yedek sentez sesi için geçerli: kağıdın "diğer
// tarafa oturma" sesinin ne kadar sonra geleceğini söylüyor. Çevirme
// animasyonu 700 ms; bu transient onun %75'ine denk geliyor. Ana hışırtıyla
// birlikte çalsaydı üst üste binip tek bir "şşş"e dönüşürdü.
export function playPageFlipSound(volume = 0.38, { settleDelay = 0.52 } = {}) {
  const context = getAudioContext();
  if (!context) return;

  // Tarayıcılar kullanıcı etkileşimi olmadan sesi askıya alıyor. Buraya
  // yalnızca kullanıcının başlattığı bir çevirmeden geliniyor, dolayısıyla
  // resume() burada meşru.
  if (context.state === "suspended") {
    context.resume().catch(() => {});
  }

  loadSample(context);

  // Kayıt hazırsa onu çal; değilse (ilk çevirme çok erkense ya da dosya
  // yüklenemediyse) sentezlenen sese düş.
  if (playSample(context, volume)) return;

  const now = context.currentTime;

  // 1) Ana hışırtı: sayfa havada dönerken. Tiz başlayıp aşağı süpürülüyor.
  const sweepDuration = 0.18 + Math.random() * 0.08;
  scheduleNoiseLayer(context, {
    startAt: now,
    duration: sweepDuration,
    volume,
    freqFrom: 1600 + Math.random() * 900,
    freqTo: 420,
    q: 0.7,
    highpassFrequency: 300,
    playbackRate: 0.9 + Math.random() * 0.25,
    attack: 0.02,
  });

  // 2) Oturma transient'i: sayfanın karşı tarafa değdiği an. Çok kısa, daha
  // pes ve daha sessiz — hışırtının devamı değil, ayrı bir "tak" hissi.
  scheduleNoiseLayer(context, {
    startAt: now + settleDelay + Math.random() * 0.03,
    duration: 0.05 + Math.random() * 0.03,
    volume: volume * 0.55,
    freqFrom: 700 + Math.random() * 250,
    freqTo: 200,
    q: 1.1,
    highpassFrequency: 140,
    playbackRate: 0.7 + Math.random() * 0.2,
    attack: 0.006,
  });
}
