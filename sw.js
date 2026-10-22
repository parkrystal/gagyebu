// 오프라인 실행용 서비스 워커. 앱을 수정해서 다시 올릴 때는 V의 숫자를 올려 주세요.
const V = 'gagyebu-v9';
const FILES = ['./', './index.html', './manifest.webmanifest', './icons/icon-180.png', './icons/icon-192.png', './icons/icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(V).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// 캐시에 있으면 바로 보여주고, 뒤에서 새 버전을 받아 둔다(다음 실행 때 반영).
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(hit => {
      const net = fetch(e.request).then(r => {
        if (r && r.ok && new URL(e.request.url).origin === location.origin) {
          const cp = r.clone();
          caches.open(V).then(c => c.put(e.request, cp));
        }
        return r;
      }).catch(() => hit);
      return hit || net;
    })
  );
});
