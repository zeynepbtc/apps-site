var CACHE='matreflex-v27';
var CORE=['./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png','./icon-maskable-192.png','./icon-maskable-512.png','./apple-touch-icon.png','./favicon-32.png','./favicon-16.png','./fonts/inter-latin.woff2', './fonts/baloo2.woff2','./fonts/inter-latin-ext.woff2'];
self.addEventListener('install',function(e){
  e.waitUntil(caches.open(CACHE).then(function(c){return c.addAll(CORE);}).then(function(){return self.skipWaiting();}));
});
self.addEventListener('activate',function(e){
  e.waitUntil(caches.keys().then(function(keys){
    return Promise.all(keys.filter(function(k){return k!==CACHE;}).map(function(k){return caches.delete(k);}));
  }).then(function(){return self.clients.claim();}));
});
self.addEventListener('fetch',function(e){
  var req=e.request;
  if(req.method!=='GET') return;
  if(req.mode==='navigate'){
    e.respondWith(
      fetch(req).then(function(res){ var copy=res.clone(); caches.open(CACHE).then(function(c){c.put('./index.html',copy);}); return res; })
                .catch(function(){ return caches.match('./index.html'); })
    );
    return;
  }
  e.respondWith(caches.match(req).then(function(cached){
    return cached || fetch(req).then(function(res){
      var copy=res.clone(); caches.open(CACHE).then(function(c){ try{c.put(req,copy);}catch(err){} }); return res;
    }).catch(function(){ return cached; });
  }));
});