#!/usr/bin/env bash
# Sunucuda siteyi günceller: GitHub'daki son sürümü çeker, build alır,
# yayındaki klasörü yedekleyip yeni build'i yerine koyar.
#
# Kullanım (sunucuda):  bash /root/yildirimreklam/deploy/deploy.sh
#
# Katalog PDF'leri git'te değil (.gitignore). Sunucudaki
# /root/yildirimreklam/public/katalog/ klasörüne bir kez scp ile konur; bu
# script onları bulamazsa yayına hiç dokunmadan durur.
set -euo pipefail

REPO_DIR="${REPO_DIR:-/root/yildirimreklam}"
WEB_ROOT="${WEB_ROOT:-/var/www/yildirimreklam.tr}"
KEEP_BACKUPS=2

cd "$REPO_DIR"

echo "==> GitHub'dan son sürüm çekiliyor"
git pull --ff-only

echo "==> Katalog PDF'leri kontrol ediliyor"
missing=0
for f in $(grep -o '/katalog/[^"]*\.pdf' src/data/catalogs.js | sort -u); do
  if [ -f "public$f" ]; then
    echo "    tamam: public$f"
  else
    echo "    EKSİK: public$f"
    missing=1
  fi
done
if [ "$missing" = 1 ]; then
  echo "!! Eksik PDF var. Mac'ten scp ile public/katalog/ içine yükleyin."
  echo "!! Yayındaki siteye dokunulmadı."
  exit 1
fi

echo "==> Bağımlılıklar kuruluyor"
npm ci --no-audit --no-fund

echo "==> Build alınıyor"
npm run build

backup="${WEB_ROOT}.yedek-$(date +%Y%m%d-%H%M%S)"
echo "==> Yayındaki site yedekleniyor: $backup"
cp -a "$WEB_ROOT" "$backup"

echo "==> Yeni build yayına alınıyor"
# .well-known: Certbot'un SSL yenileme klasörü, build'de olmadığı için korunuyor.
rsync -a --delete --exclude '.well-known' dist/ "$WEB_ROOT/"

# En yeni $KEEP_BACKUPS yedek kalsın (her yedek PDF'lerle birlikte ~300 MB).
ls -dt "${WEB_ROOT}".yedek-* 2>/dev/null | tail -n +$((KEEP_BACKUPS + 1)) | xargs -r rm -rf

echo "==> Kontrol"
for path in /katalog/2027_katalog.pdf /pdfjs/wasm/openjpeg.wasm; do
  printf '    %s -> ' "$path"
  curl -sI "https://yildirimreklam.tr$path" | grep -iE '^(HTTP|content-type)' | tr -d '\r' | tr '\n' ' '
  echo
done

echo "==> Bitti. Geri almak için:"
echo "    rsync -a --delete $backup/ $WEB_ROOT/"
