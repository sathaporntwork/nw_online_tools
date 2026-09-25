/*
 * NetOps Toolkit — PWA bootstrap (js/pwa.js)
 * ลงทะเบียน service worker + จัดการปุ่ม install (ก่อนติดตั้ง/ติดตั้งแล้ว)
 * โหลดหลัง app.js — ใช้ NT_DATA กับ toast ที่มีอยู่แล้ว ไม่มี console/fetch ใด ๆ
 */
(function () {
  'use strict';

  var V = (window.NT_DATA && NT_DATA.meta && NT_DATA.meta.version) || '1.0.0';

  /* ---------- Toast (inline เพื่อไม่ผูกกับ app.js ภายใน) ---------- */
  function pwaToast(msg, kind) {
    var box = document.getElementById('toasts');
    if (!box) return;
    var t = document.createElement('div');
    t.className = 'toast' + (kind ? ' ' + kind : '');
    t.textContent = msg;
    box.appendChild(t);
    setTimeout(function () { if (t.parentNode) t.parentNode.removeChild(t); }, 2800);
  }

  /* ---------- Service Worker registration (เฉพาะ http/https) ---------- */
  function registerSW() {
    if (!('serviceWorker' in navigator)) return;
    if (location.protocol !== 'http:' && location.protocol !== 'https:') return;
    navigator.serviceWorker.register('./sw.js').catch(function () {
      /* SW ล้มเหลว — แอปยังใช้ได้ปกติ ไม่ต้องแจ้งผู้ใช้ */
    });
  }

  /* ---------- ปุ่ม Install ---------- */
  var deferredPrompt = null;
  var btn = null;

  function injectBtn() {
    if (btn || !document.getElementById('mainNav')) return;
    btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'nav-link install-btn';
    btn.id = 'installBtn';
    btn.hidden = true;
    btn.innerHTML =
      '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" class="pin-ico">' +
      '<path d="M12 3v11M7 10l5 5 5-5"/><path d="M5 20h14"/></svg>';
    var span = document.createElement('span');
    span.textContent = 'ติดตั้งแอป';
    btn.appendChild(span);
    btn.addEventListener('click', onInstallClick);
    var nav = document.getElementById('mainNav');
    nav.appendChild(btn);
  }

  function showBtn() { if (btn) btn.hidden = false; }
  function hideBtn() { if (btn) btn.hidden = true; }

  function onInstallClick() {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then(function (choice) {
      if (choice && choice.outcome === 'accepted') {
        pwaToast('ติดตั้ง NetOps Toolkit เรียบร้อย', 'ok');
      }
      deferredPrompt = null;
      hideBtn();
    });
  }

  window.addEventListener('beforeinstallprompt', function (ev) {
    ev.preventDefault();
    deferredPrompt = ev;
    injectBtn();
    showBtn();
  });

  window.addEventListener('appinstalled', function () {
    pwaToast('แอปถูกติดตั้งแล้ว — เปิดจากหน้าจอหลักได้เลย', 'ok');
    deferredPrompt = null;
    hideBtn();
  });

  /* ---------- Offline indicator (จุดสถานะใน header) ---------- */
  var netPill = null;

  function injectNetPill() {
    var nav = document.getElementById('mainNav');
    if (!nav || netPill) return;
    netPill = document.createElement('div');
    netPill.className = 'net-pill' + (navigator.onLine ? '' : ' is-off');
    netPill.setAttribute('role', 'status');
    netPill.setAttribute('aria-live', 'polite');
    netPill.innerHTML = '<span class="net-dot" aria-hidden="true"></span><span class="net-txt">' +
      (navigator.onLine ? 'ออนไลน์' : 'ออฟไลน์') + '</span>';
    nav.insertBefore(netPill, nav.firstChild);
  }

  function setNetState(online) {
    if (!netPill) return;
    netPill.classList.toggle('is-off', !online);
    var txt = netPill.querySelector('.net-txt');
    if (txt) txt.textContent = online ? 'ออนไลน์' : 'ออฟไลน์';
  }

  window.addEventListener('offline', function () {
    setNetState(false);
    pwaToast('ออฟไลน์ — ใช้แอปจากแคชได้ แต่ลิงก์เครื่องมือภายนอกจะไม่เปิด', 'err');
  });
  window.addEventListener('online', function () {
    setNetState(true);
    pwaToast('กลับมาออนไลน์แล้ว', 'ok');
  });

  /* ---------- Start ---------- */
  function boot() {
    injectBtn();
    injectNetPill();
    registerSW();
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  /* เผื่อ app.js หรือไฟล์อื่นต้องการทราบเวอร์ชัน */
  window.NT_PWA_VERSION = V;
})();
