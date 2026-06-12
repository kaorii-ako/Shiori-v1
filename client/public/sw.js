// Bump the version to invalidate caches poisoned by the old cache-first worker.
const CACHE = 'shiori-static-v2'

self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  )
  self.clients.claim()
})

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return
  const url = new URL(e.request.url)
  if (url.origin !== self.location.origin) return
  if (url.pathname.startsWith('/api/')) return

  // Navigations: network-first so a new deploy's index.html (and its new
  // asset hashes) is picked up immediately. Cache only as offline fallback.
  if (e.request.mode === 'navigate' || url.pathname === '/index.html') {
    e.respondWith(
      fetch(e.request)
        .then((res) => {
          const clone = res.clone()
          caches.open(CACHE).then((c) => c.put('/', clone))
          return res
        })
        .catch(() => caches.match('/'))
    )
    return
  }

  // Hashed build assets are immutable: cache-first. Never cache an HTML
  // response for an asset URL — that's the SPA rewrite 404-ing, and caching
  // it would poison the cache until the user manually clears site data.
  if (url.pathname.startsWith('/assets/')) {
    e.respondWith(
      caches.match(e.request).then(
        (cached) =>
          cached ||
          fetch(e.request).then((res) => {
            const type = res.headers.get('content-type') || ''
            if (res.ok && !type.includes('text/html')) {
              const clone = res.clone()
              caches.open(CACHE).then((c) => c.put(e.request, clone))
            }
            return res
          })
      )
    )
    return
  }

  // Everything else (manifest, icons, fonts): network falling back to cache.
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        if (res.ok) {
          const clone = res.clone()
          caches.open(CACHE).then((c) => c.put(e.request, clone))
        }
        return res
      })
      .catch(() => caches.match(e.request))
  )
})
