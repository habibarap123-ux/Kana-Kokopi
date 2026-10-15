// Service worker gabungan Kana & Kokopi (satu file untuk semua halaman).
// Naikkan angka versi bila ada perubahan besar supaya simpanan lama dibuang.
const CACHE = "kanakokopi-v2";
const INTI = [
  "./", "index.html", "kokopi.html", "owner.html",
  "manifest.json", "kokopi.webmanifest", "owner.json",
  "kokopi-icon-192.png", "kokopi-icon-512.png", "kokopi-apple-touch-icon.png"
];

// File yang belum ada di repositori dilewati, tidak membuat pemasangan gagal.
self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => Promise.all(INTI.map(u => c.add(u).catch(() => {}))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Kalau offline dan halaman belum tersimpan, tampilkan halaman brand yang benar.
function halamanCadangan(url){
  const p = url.pathname;
  if(p.endsWith("/kokopi.html") || p.endsWith("/kokopi")) return "kokopi.html";
  if(p.endsWith("/owner.html") || p.endsWith("/owner")) return "owner.html";
  return "index.html";
}

self.addEventListener("fetch", e => {
  const req = e.request, url = new URL(req.url);
  if(req.method !== "GET" || url.origin !== location.origin) return;
  e.respondWith(
    fetch(req)
      .then(res => {
        if(res && res.ok){ const cp = res.clone(); caches.open(CACHE).then(c => c.put(req, cp)); }
        return res;
      })
      .catch(() => caches.match(req).then(r => r || (req.mode === "navigate" ? caches.match(halamanCadangan(url)) : null)).then(r => r || Response.error()))
  );
});
