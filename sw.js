// 서당 동행 샘플 서비스 워커: 화면 파일을 캐시해 오프라인에서도 열리게 한다.
// 결제(토스)와 다른 도메인 요청은 캐시하지 않고 항상 네트워크로 보낸다.
const CACHE = 'seodang-shell-v1';
const SHELL = ['./', './seodang_toss_v2.html', './index.html', './manifest.webmanifest', './icon.svg', './icon-192.png', './icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => Promise.allSettled(SHELL.map(u => c.add(u)))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;
  // 화면 파일: 네트워크 우선(새 버전 반영), 실패하면 캐시
  e.respondWith(fetch(e.request).then(r => {
    const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); return r;
  }).catch(() => caches.match(e.request, { ignoreSearch: true }).then(r => r || caches.match('./'))));
});
