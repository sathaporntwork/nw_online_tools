/*
 * NetOps Toolkit — Service Worker (sw.js)
 * Offline-first: แคช app shell ทั้งหมดตั้งแต่ install
 * ไม่แคช cross-origin — ลิงก์เครื่องมือภายนอกเดินผ่าน network ตามปกติ
 */
'use strict';

var CACHE = 'netops-v1.0.12';
var SHELL = [
  './',
  './index.html',
  './css/style.css?v=1.0.12',
  './js/data.js?v=1.0.12',
  './js/app.js?v=1.0.12',
  './js/pwa.js?v=1.0.12',
  './manifest.webmanifest',
  './icons/icon.svg'
];

/* Install — แคช app shell ครบก่อน แล้ว activate ทันที (ไม่รอเก่า) */
self.addEventListener('install', function (ev) {
  ev.waitUntil(
    caches.open(CACHE).then(function (c) { return c.addAll(SHELL); }).then(function () {
      return self.skipWaiting();
    })
  );
});

/* Activate — ลบแคชเวอร์ชันเก่าทิ้ง */
self.addEventListener('activate', function (ev) {
  ev.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (k) {
        return k === CACHE ? null : caches.delete(k);
      }));
    }).then(function () {
      return self.clients.claim();
    })
  );
});

/* Fetch — cache-first สำหรับ same-origin GET, ไม่แตะ cross-origin */
self.addEventListener('fetch', function (ev) {
  var req = ev.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  ev.respondWith(
    caches.match(req, { ignoreSearch: false }).then(function (hit) {
      if (hit) {
        /* อัปเดตแคชเบื้องหลัง (stale-while-revalidate) */
        fetch(req).then(function (res) {
          if (res && res.ok) caches.open(CACHE).then(function (c) { c.put(req, res); });
        }).catch(function () { /* offline — ใช้แคชเดิมต่อ */ });
        return hit;
      }
      /* ยังไม่เคยแคช — ไป network แล้วเก็บสำรองไว้ */
      return fetch(req).then(function (res) {
        if (res && res.ok) {
          var copy = res.clone();
          caches.open(CACHE).then(function (c) { c.put(req, copy); });
        }
        return res;
      }).catch(function () {
        /* navigation ล้มเหลวแบบออฟไลน์ — โยนกลับไปที่ index.html */
        if (req.mode === 'navigate') return caches.match('./index.html');
        return Response.error();
      });
    })
  );
});
