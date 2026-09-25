/*
 * NetOps Toolkit — js/app.js
 * ทำงานร่วมกับ js/data.js (window.NT_DATA)
 * ข้อบังคับ:
 *  - ไม่ใช้ dialog ของเบราว์เซอร์ใด ๆ — ใช้ modal + toast แทน (ปลอด alert / confirm / prompt)
 *  - ไม่มีเครือข่าย และไม่ใช้ history API (กัน SecurityError บน file://)
 *  - localStorage ถูกห่อ try/catch ทุกจุด (กัน error "file: URLs are treated as unique security origins")
 *  - ไม่มีการ log ใด ๆ — console ต้องสะอาด 100%
 */
(function () {
  'use strict';

  var D = window.NT_DATA;
  if (!D) return;

  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  function esc(s) {
    return String(s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }   /* Mini-markdown (§10.4): escape ก่อนเสมอ แล้วค่อยแยกวิเคราะห์ inline code + bold */
  function md(raw) {
    var s = esc(raw);
    var codes = [];
    s = s.replace(/`([^`]+)`/g, function (m, c) { codes.push('<code>' + c + '</code>'); return '\u0000' + (codes.length - 1) + '\u0000'; });
    s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    return s.replace(/\u0000(\d+)\u0000/g, function (m, i) { return codes[Number(i)] || m; });
  }

  function reduced() {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  /* ---------- SVG icons (ขนาด/ตำแหน่งถูกควบคุมด้วย CSS ทั้งหมด) ---------- */
  var ICONS = {
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.6 3.8 5.7 3.8 9S14.5 18.4 12 21c-2.5-2.6-3.8-5.7-3.8-9S9.5 5.6 12 3z"/>',
    route: '<circle cx="5" cy="18" r="2.4"/><circle cx="19" cy="18" r="2.4"/><circle cx="12" cy="5.5" r="2.4"/><path d="M6.8 16.4 10.6 7.6M13.4 7.3l4 7.4M7.4 18h9.2"/>',
    radar: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><path d="M12 12 17 7"/><path d="M12 3v2M21 12h-2"/>',
    dns: '<rect x="4" y="4" width="16" height="6.4" rx="2"/><rect x="4" y="13.6" width="16" height="6.4" rx="2"/><path d="M8 7.2h.01M8 16.8h.01"/>',
    lock: '<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/><path d="M12 14.5v2"/>',
    term: '<rect x="3" y="4" width="18" height="16" rx="3"/><path d="m7 9 3 3-3 3M13 15h4"/>',
    pulse: '<path d="M3 12h4l2.5-6 4 12 2.5-6h5"/>',
    bolt: '<path d="M13 2 5 14h6l-1 8 8-12h-6l1-8z"/>',
    gauge: '<path d="M4.5 17a9 9 0 1 1 15 0"/><path d="M12 14l4-4"/><circle cx="12" cy="14" r="1.4"/>',
    layers: '<path d="m12 3 9 5-9 5-9-5 9-5z"/><path d="m3 13.5 9 5 9-5"/>',
    arrow: '<path d="M12 4v14M6 13l6 6 6-6"/>',
    pin: '<path d="M6 3h12v18l-6-4.5L6 21z"/>',
    anchor: '<circle cx="12" cy="5" r="3"/><path d="M12 8v13M5 12H2a10 10 0 0 0 20 0h-3M9 12h6"/>',
    shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>'
  };

  function svgIcon(key) {
    return '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">' + (ICONS[key] || ICONS.globe) + '</svg>';
  }

  /* ---------- Indexes ---------- */
  var byId = {};
  D.tools.forEach(function (t) { byId[t.id] = t; });
  var catById = {};
  D.categories.forEach(function (c) { catById[c.id] = c; });
  var symById = {};
  D.symptoms.forEach(function (s) { symById[s.id] = s; });

  function catCount(id) {
    return D.tools.filter(function (t) { return t.cat.indexOf(id) > -1; }).length;
  }
  function toolCatName(t) { return catById[t.cat[0]] ? catById[t.cat[0]].name : t.cat[0]; }

  /* ---------- State ---------- */
  var PIN_KEY = 'netops:pinned:v1';
  var FLAG_LABELS = { ipv6: 'รองรับ IPv6', free: 'ใช้ฟรีเท่านั้น', tpl: 'มี Deep link', api: 'มี API / CLI' };

  var state = {
    q: '',
    cat: 'all',
    flags: { ipv6: false, free: false, tpl: false, api: false },
    preset: null,
    target: '',
    targetType: null,
    checks: {},
    currentTool: null
  };

  /* Guarded storage (§10.2) — ทุกจุดห่อ try/catch ห้าม console */
  function loadPinned() {
    try {
      var raw = localStorage.getItem(PIN_KEY);
      var arr = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(arr)) return [];
      return arr.filter(function (id) { return !!byId[id]; });
    } catch (e) { return []; }
  }
  function savePinned(arr) {
    try { localStorage.setItem(PIN_KEY, JSON.stringify(arr)); } catch (e) { /* file:// หรือ private mode */ }
  }
  var pinned = loadPinned();

  /* ---------- Elements ---------- */
  var els = {
    statRow: $('#statRow'),
    freeRing: $('#freeRing'),
    freeRingLabel: $('#freeRingLabel'),
    freeCount: $('#freeCount'),
    totalCount: $('#totalCount'),
    symGrid: $('#symGrid'),
    playbook: $('#playbook'),
    presetGrid: $('#presetGrid'),
    catChips: $('#catChips'),
    toolGrid: $('#toolGrid'),
    emptyState: $('#emptyState'),
    resultCount: $('#resultCount'),
    activePills: $('#activePills'),
    searchInput: $('#searchInput'),
    searchClear: $('#searchClear'),
    targetInput: $('#targetInput'),
    targetClear: $('#targetClear'),
    launcherHint: $('#launcherHint'),
    flagWrap: $('#flagWrap'),
    flagBtn: $('#flagBtn'),
    flagMenu: $('#flagMenu'),
    flagN: $('#flagN'),
    pinnedWrap: $('#pinnedWrap'),
    pinnedBtn: $('#pinnedBtn'),
    pinnedMenu: $('#pinnedMenu'),
    pinnedN: $('#pinnedN'),
    navToggle: $('#navToggle'),
    mainNav: $('#mainNav'),
    modalRoot: $('#modalRoot'),
    modalBox: $('#modalBox'),
    modalBody: $('#modalBody'),
    toasts: $('#toasts')
  };

  var RING_C = 103.67; /* 2 * pi * 16.5 */

  function setRing(wrap, pct) {
    if (!wrap) return;
    var fill = wrap.querySelector('.ring-fill');
    if (fill) fill.setAttribute('stroke-dashoffset', (RING_C * (1 - Math.max(0, Math.min(1, pct)))).toFixed(2));
  }

  /* ---------- Toast (แทน alert สำหรับ feedback สั้น ๆ) ---------- */
  function toast(msg, kind) {
    var t = document.createElement('div');
    t.className = 'toast' + (kind ? ' ' + kind : '');
    t.textContent = msg;
    els.toasts.appendChild(t);
    setTimeout(function () { if (t.parentNode) t.parentNode.removeChild(t); }, 2800);
  }

  /* ---------- Clipboard (§10.3) ---------- */
  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      try {
        navigator.clipboard.writeText(text).then(
          function () { toast('คัดลอกแล้ว', 'ok'); },
          function () { fallbackCopy(text); }
        );
        return;
      } catch (e) { /* ตกไป fallback */ }
    }
    fallbackCopy(text);
  }
  function fallbackCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    ta.style.left = '-999999px';
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    var ok = false;
    try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
    ta.remove();
    toast(ok ? 'คัดลอกแล้ว' : 'คัดลอกไม่สำเร็จ กรุณาคัดลอกเอง', ok ? 'ok' : 'err');
  }

  /* ---------- Reveal (§7 consent-gated) ---------- */
  var revealOK = 'IntersectionObserver' in window &&
    !(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  if (revealOK) document.documentElement.classList.add('reveal-ready');

  var io = null;
  if (revealOK) {
    io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var i = Number(el.getAttribute('data-reveal-i') || 0);
        el.style.setProperty('--reveal-delay', (Math.min(i, 7) * 0.05).toFixed(2) + 's');
        el.classList.add('revealed');
        io.unobserve(el);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
  }
  function initReveal(root) {
    if (!revealOK || !io) return;
    $$('.reveal', root).forEach(function (el) {
      if (!el.classList.contains('revealed')) io.observe(el);
    });
  }

  /* ---------- Target Launcher ---------- */
  function detectTargetType(v) {
    v = (v || '').trim();
    if (!v) return null;
    if (/^AS\d{1,12}$/i.test(v)) return 'asn';
    if (/^\d{1,3}(\.\d{1,3}){3}$/.test(v)) return 'ipv4';
    if (v.indexOf(':') > -1 && /^[0-9a-f:.]+$/i.test(v)) return 'ipv6';
    if (/^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/i.test(v)) return 'domain';
    return null;
  }

  function targetUrl(t) {
    if (!t.tpl || !state.target || !state.targetType) return null;
    if (t.tplTypes.indexOf(state.targetType) === -1) return null;
    return t.tpl.replace('{t}', encodeURIComponent(state.target.trim()));
  }

  function compatibleCount() {
    if (!state.targetType) return 0;
    return D.tools.filter(function (t) { return !!targetUrl(t); }).length;
  }

  function renderLauncher() {
    els.targetClear.hidden = !state.target;
    var hint = els.launcherHint;
    hint.classList.remove('ok', 'warn');
    if (!state.target) {
      hint.innerHTML = 'ยังไม่ได้กรอก target — เมื่อกรอกแล้วจะมีปุ่มเปิดเครื่องมือพร้อมค่าอัตโนมัติ';
      return;
    }
    if (!state.targetType) {
      hint.classList.add('warn');
      hint.innerHTML = 'รูปแบบ <b>' + esc(state.target) + '</b> ยังไม่ตรงกับ domain / IP / ASN — ปุ่ม deep-link ถูกซ่อนไว้';
      return;
    }
    var names = D.tools.filter(function (t) { return !!targetUrl(t); });
    var chips = names.map(function (t) {
      return '<button type="button" class="lh-tool" data-goto-tool="' + t.id + '" title="เลื่อนไปการ์ด ' + esc(t.name) + '">' + esc(t.name) + '</button>';
    }).join('');
    els.launcherTarget = state.target;
    hint.classList.add('ok');
    hint.innerHTML = names.length
      ? '<span class="lh-lead">Target: <b>' + esc(state.target) + '</b> (' + state.targetType + ') — deep-link ได้ ' + names.length + ' เครื่องมือ:</span><span class="lh-tools">' + chips + '</span>'
      : 'Target: <b>' + esc(state.target) + '</b> (' + state.targetType + ') — ยังไม่มีเครื่องมือที่รองรับ deep-link กับชนิดนี้';
  }

  function flashToolCard(id) {
    var card = document.querySelector('.tool-card[data-tool="' + id + '"]');
    if (!card) return;
    card.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'center' });
    card.classList.remove('flash');
    /* re-flow เพื่อให้ animation เล่นซ้ำได้ถ้ากดปุ่มเดิม */
    void card.offsetWidth;
    card.classList.add('flash');
    setTimeout(function () { card.classList.remove('flash'); }, 1800);
  }

  /* ---------- Hero stats + gauge ---------- */
  function renderStats() {
    var free = D.tools.filter(function (t) { return t.price === 'free'; }).length;
    var tplN = D.tools.filter(function (t) { return !!t.tpl; }).length;
    var items = [
      { n: D.tools.length, l: 'เครื่องมือ' },
      { n: D.categories.length, l: 'หมวดหมู่' },
      { n: D.symptoms.length, l: 'อาการ / Playbook' },
      { n: tplN, l: 'รองรับ Deep link' }
    ];
    els.statRow.innerHTML = items.map(function (it, i) {
      return '<div class="stat-card glass card reveal" data-reveal-i="' + i + '">' +
        '<span class="stat-num">' + it.n + '</span>' +
        '<span class="stat-lbl">' + it.l + '</span></div>';
    }).join('');

    var pct = Math.round((free / D.tools.length) * 100);
    els.freeCount.textContent = free;
    els.totalCount.textContent = D.tools.length;
    els.freeRingLabel.textContent = pct + '%';
    setRing(els.freeRing, pct / 100);
    initReveal(els.statRow);
  }

  /* ---------- Category chips ---------- */
  function renderChips() {
    var html = '<button type="button" class="chip' + (state.cat === 'all' ? ' active' : '') + '" data-cat="all" aria-pressed="' + (state.cat === 'all') + '">ทั้งหมด <span class="chip-n">' + D.tools.length + '</span></button>';
    html += D.categories.map(function (c) {
      var on = state.cat === c.id;
      return '<button type="button" class="chip' + (on ? ' active' : '') + '" data-cat="' + c.id + '" aria-pressed="' + on + '">' + esc(c.name) + ' <span class="chip-n">' + catCount(c.id) + '</span></button>';
    }).join('');
    els.catChips.innerHTML = html;
  }

  /* ---------- Symptom cards ---------- */
  function renderSymptoms() {
    els.symGrid.innerHTML = D.symptoms.map(function (s, i) {
      return '<button type="button" class="sym-card glass card reveal" data-sym="' + s.id + '" data-reveal-i="' + (i % 8) + '" aria-expanded="false">' +
        '<span class="icon-tile" aria-hidden="true">' + svgIcon(s.icon) + '</span>' +
        '<span class="sym-txt"><h3>' + esc(s.name) + '</h3><span class="meta">' + esc(s.short) + '</span></span>' +
        '</button>';
    }).join('');
    initReveal(els.symGrid);
  }

  /* ---------- Presets ---------- */
  function renderPresets() {
    els.presetGrid.innerHTML = D.presets.map(function (p, i) {
      var chips = p.tools.slice(0, 6).map(function (id) {
        return byId[id] ? '<span class="k-chip">' + esc(byId[id].name) + '</span>' : '';
      }).join('');
      var more = p.tools.length > 6 ? '<span class="k-chip info">+' + (p.tools.length - 6) + '</span>' : '';
      return '<div class="preset-card glass card reveal" data-reveal-i="' + i + '">' +
        '<span class="eyebrow">' + esc(p.eyebrow || (p.id === 'quick' ? 'เริ่มต้น' : 'เชิงลึก')) + '</span>' +
        '<h3>' + esc(p.name) + '</h3>' +
        '<p class="p-desc">' + esc(p.desc) + '</p>' +
        '<div class="p-tools">' + chips + more + '</div>' +
        '<div class="p-foot"><span class="meta">' + p.tools.length + ' เครื่องมือ</span>' +
        '<button type="button" class="btn btn-primary btn-sm" data-preset="' + p.id + '">ใช้ชุดตรวจนี้</button></div>' +
        '</div>';
    }).join('');
    initReveal(els.presetGrid);
  }

  /* ---------- Tool grid ---------- */
  function haystack(t) {
    if (!t._hay) {
      t._hay = [t.id, t.name, t.desc, t.when, t.how, t.keys, t.descTh,
        t.cat.map(function (c) { return catById[c] ? catById[c].name + ' ' + c : c; }).join(' '),
        t.sym.map(function (s) { return symById[s] ? symById[s].name + ' ' + symById[s].short : s; }).join(' ')
      ].join(' ').toLowerCase();
    }
    return t._hay;
  }

  function matches(t) {
    if (state.preset) {
      var p = D.presets.filter(function (x) { return x.id === state.preset; })[0];
      if (p && p.tools.indexOf(t.id) === -1) return false;
    } else if (state.cat !== 'all' && t.cat.indexOf(state.cat) === -1) {
      return false;
    }
    if (state.flags.ipv6 && t.ip !== 'dual') return false;
    if (state.flags.free && t.price !== 'free') return false;
    if (state.flags.tpl && !t.tpl) return false;
    if (state.flags.api && t.access === 'web') return false;
    if (state.q && haystack(t).indexOf(state.q) === -1) return false;
    return true;
  }

  function toolCard(t, i) {
    var accCls = 'acc-' + t.cat[0];
    var isPinned = pinned.indexOf(t.id) > -1;
    var tUrl = targetUrl(t);
    var chips = '';
    chips += t.ip === 'dual' ? '<span class="k-chip ok">IPv4 / IPv6</span>' : '<span class="k-chip">IPv4</span>';
    chips += t.access === 'web+api' ? '<span class="k-chip info">Web + API</span>' : (t.access === 'cli' ? '<span class="k-chip info">CLI</span>' : '');
    chips += t.price === 'free' ? '<span class="k-chip">ฟรี</span>' : '<span class="k-chip warn">Freemium</span>';
    if (t.tpl) chips += '<span class="k-chip acc">Deep link</span>';

    return '<article class="tool-card glass card reveal ' + accCls + '" data-reveal-i="' + (i % 8) + '" data-tool="' + t.id + '">' +
      '<div class="tool-top">' +
        '<span class="icon-tile" aria-hidden="true">' + svgIcon(catById[t.cat[0]].icon) + '</span>' +
        '<div class="tool-name"><h3>' + esc(t.name) + '</h3>' +
          '<span class="cat-tag">' + esc(toolCatName(t)) + '</span></div>' +
        '<button type="button" class="pin-card' + (isPinned ? ' on' : '') + '" data-act="pin" data-id="' + t.id + '" aria-pressed="' + isPinned + '" aria-label="' + (isPinned ? 'เลิกปักหมุด ' : 'ปักหมุด ') + esc(t.name) + '">' +
          svgIcon('pin') + '</button>' +
      '</div>' +
      '<p class="tool-desc">' + esc(t.desc) + '</p>' +
      '<div class="tool-chips">' + chips + '</div>' +
      '<div class="tool-actions">' +
        '<a class="btn btn-primary btn-sm" href="' + esc(t.url) + '" target="_blank" rel="noopener noreferrer">เปิดเครื่องมือ ↗</a>' +
        (tUrl ? '<a class="btn btn-ghost btn-sm" href="' + esc(tUrl) + '" target="_blank" rel="noopener noreferrer">เปิดพร้อม target ↗</a>' : '') +
        '<button type="button" class="btn btn-ghost btn-sm" data-act="detail" data-id="' + t.id + '">รายละเอียด</button>' +
      '</div>' +
    '</article>';
  }

  function renderPills() {
    var pills = [];
    if (state.q) pills.push({ k: 'query', label: 'ค้นหา: ' + state.q });
    if (state.preset) {
      var p = D.presets.filter(function (x) { return x.id === state.preset; })[0];
      if (p) pills.push({ k: 'preset', label: 'ชุด: ' + p.name });
    } else if (state.cat !== 'all') {
      pills.push({ k: 'cat', label: 'หมวด: ' + (catById[state.cat] ? catById[state.cat].name : state.cat) });
    }
    Object.keys(state.flags).forEach(function (f) {
      if (state.flags[f]) pills.push({ k: 'flag:' + f, label: FLAG_LABELS[f] });
    });
    els.activePills.innerHTML = pills.map(function (p) {
      return '<button type="button" class="pill-x" data-clear="' + p.k + '" aria-label="ลบตัวกรอง ' + esc(p.label) + '">' + esc(p.label) + ' <i>✕</i></button>';
    }).join('');
  }

  function renderTools() {
    var list = D.tools.filter(matches);
    els.toolGrid.innerHTML = list.map(toolCard).join('');
    els.emptyState.hidden = list.length > 0;
    els.resultCount.textContent = 'แสดง ' + list.length + ' จาก ' + D.tools.length + ' เครื่องมือ';
    renderPills();
    renderChips();
    initReveal(els.toolGrid);
  }

  /* ---------- Pinned menu ---------- */
  function renderPinned() {
    els.pinnedN.textContent = pinned.length;
    els.pinnedBtn.classList.toggle('has-pin', pinned.length > 0);
    if (!pinned.length) {
      els.pinnedMenu.innerHTML = '<p class="pin-empty">ยังไม่มีเครื่องมือที่ปักหมุด —<br>กดหมุดบนการ์ดเพื่อรวบรวมชุดตรวจ</p>';
      return;
    }
    var items = pinned.map(function (id) {
      var t = byId[id];
      if (!t) return '';
      return '<div class="pin-item"><button type="button" class="pi-name" data-act="detail" data-id="' + t.id + '" title="' + esc(t.name) + '">' + esc(t.name) + '</button>' +
        '<button type="button" class="pi-x" data-act="pin" data-id="' + t.id + '" aria-label="นำ ' + esc(t.name) + ' ออก">✕</button></div>';
    }).join('');
    els.pinnedMenu.innerHTML = items +
      '<div class="pin-foot">' +
        '<button type="button" class="btn btn-primary btn-sm" id="copyChecklist">คัดลอก checklist</button>' +
        '<button type="button" class="btn btn-ghost btn-sm" id="clearPinned">ล้างทั้งหมด</button>' +
      '</div>';
  }

  function togglePin(id) {
    var i = pinned.indexOf(id);
    if (i > -1) pinned.splice(i, 1); else pinned.push(id);
    savePinned(pinned);
    renderPinned();
    $$('.pin-card[data-id="' + id + '"]').forEach(function (b) {
      var on = pinned.indexOf(id) > -1;
      b.classList.toggle('on', on);
      b.setAttribute('aria-pressed', String(on));
    });
    var mb = $('#modalPin');
    if (mb && state.currentTool === id) {
      var on = pinned.indexOf(id) > -1;
      mb.textContent = on ? 'เลิกปักหมุด' : 'ปักหมุด';
    }
    toast(pinned.indexOf(id) > -1 ? 'ปักหมุด ' + (byId[id] ? byId[id].name : id) : 'นำออกจากหมุดแล้ว', 'ok');
  }

  function checklistMarkdown() {
    var lines = ['## NetOps Toolkit — ชุดตรวจ (' + new Date().toLocaleDateString('th-TH') + ')'];
    if (state.target) lines.push('Target: `' + state.target + '`');
    lines.push('');
    pinned.forEach(function (id) {
      var t = byId[id];
      if (!t) return;
      var u = targetUrl(t) || t.url;
      lines.push('- [ ] **' + t.name + '** — ' + toolCatName(t) + ' — ' + u);
    });
    return lines.join('\n');
  }

  /* Export playbook → Markdown checklist (แปะใน ticket ได้) */
  function playbookMarkdown(symId) {
    var s = symById[symId];
    if (!s) return '';
    var checks = state.checks[symId] || {};
    var lines = [];
    lines.push('## Playbook: ' + s.name);
    lines.push('');
    lines.push('> จาก NetOps Toolkit — อาการ: ' + s.name + ' (' + s.short + ') · ' + new Date().toLocaleDateString('th-TH'));
    lines.push('');
    lines.push('### Flow การแยกปัญหา');
    s.flow.forEach(function (n) { lines.push('- **' + n.tag + ':** ' + n.text); });
    lines.push('');
    lines.push('### ลำดับเครื่องมือ');
    var doneN = Object.keys(checks).filter(function (k) { return checks[k]; }).length;
    if (doneN) lines.push('> ทำแล้ว ' + doneN + '/' + s.steps.length + ' ขั้น');
    s.steps.forEach(function (st, i) {
      var t = byId[st.tool];
      var name = t ? t.name : st.tool;
      var url = t ? (targetUrl(t) || t.url) : '';
      lines.push('- [' + (checks[i] ? 'x' : ' ') + '] **' + (i + 1) + '. ' + name + '** — ' + st.action);
      if (url) lines.push('  ' + url);
    });
    lines.push('');
    lines.push('**เคล็ดลับ:** ' + s.note);
    return lines.join('\n');
  }

  /* ---------- Playbook (triage) ---------- */
  function openPlaybook(symId, updateHash) {
    var s = symById[symId];
    if (!s) return;
    var checks = state.checks[symId] || {};
    state.checks[symId] = checks;

    var flow = s.flow.map(function (n, i) {
      var cls = i === 0 ? 'fn-primary' : (i === s.flow.length - 1 ? 'fn-success' : 'fn-decision');
      var node = '<div class="fn ' + cls + '"><span class="fn-tag">' + esc(n.tag) + '</span><span>' + md(n.text) + '</span></div>';
      if (i < s.flow.length - 1) node += '<div class="f-arrow" aria-hidden="true"><svg viewBox="0 0 24 24" focusable="false">' + ICONS.arrow + '</svg></div>';
      return node;
    }).join('');

    var steps = s.steps.map(function (st, i) {
      var t = byId[st.tool];
      if (!t) return '';
      var done = !!checks[i];
      return '<div class="pb-step' + (done ? ' done' : '') + '" data-step-row="' + i + '">' +
        '<label class="pb-check"><input type="checkbox" data-step="' + i + '"' + (done ? ' checked' : '') + ' aria-label="ทำขั้นที่ ' + (i + 1) + ' แล้ว"></label>' +
        '<div class="pb-step-body">' +
          '<button type="button" class="pb-tool" data-act="detail" data-id="' + t.id + '">' + esc(t.name) + '</button>' +
          '<p>' + md(st.action) + '</p>' +
        '</div></div>';
    }).join('');

    var doneN = Object.keys(checks).filter(function (k) { return checks[k]; }).length;
    var total = s.steps.length;

    els.playbook.innerHTML =
      '<div class="pb-head">' +
        '<div><span class="eyebrow">PLAYBOOK</span><h3>' + esc(s.name) + '</h3></div>' +
        '<div class="pb-progress">' +
          '<div class="ring-wrap" id="pbRing"><svg viewBox="0 0 40 40" aria-hidden="true" focusable="false">' +
            '<circle class="ring-bg" cx="20" cy="20" r="16.5"/><circle class="ring-fill" cx="20" cy="20" r="16.5" stroke-dasharray="103.67" stroke-dashoffset="103.67"/>' +
          '</svg><span class="ring-label" id="pbPct">0%</span></div>' +
          '<span class="meta">ทำแล้ว <b id="pbDone">' + doneN + '/' + total + '</b> ขั้น</span>' +
          '<button type="button" class="pb-export" id="pbExport" aria-label="คัดลอก playbook เป็น Markdown checklist"><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><rect x="9" y="9" width="11" height="11" rx="2.5"/><path d="M5 15V6a2 2 0 0 1 2-2h8"/></svg><span>คัดลอก MD</span></button>' +
          '<button type="button" class="modal-x" id="pbClose" aria-label="ปิด playbook">×</button>' +
        '</div>' +
      '</div>' +
      '<div class="flow">' + flow + '</div>' +
      '<div class="pb-steps">' + steps + '</div>' +
      '<div class="callout tip"><div><b>เคล็ดลับ</b>' + md(s.note) + '</div></div>';

    els.playbook.hidden = false;
    setRing($('#pbRing'), total ? doneN / total : 0);
    $('#pbPct').textContent = Math.round((total ? doneN / total : 0) * 100) + '%';

    $$('.sym-card').forEach(function (c) {
      var on = c.getAttribute('data-sym') === symId;
      c.classList.toggle('active', on);
      c.setAttribute('aria-expanded', String(on));
    });

    if (updateHash !== false && location.hash !== '#/symptom/' + symId) {
      location.hash = '#/symptom/' + symId;
    }
    els.playbook.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'nearest' });
  }

  function closePlaybook() {
    els.playbook.hidden = true;
    els.playbook.innerHTML = '';
    $$('.sym-card').forEach(function (c) { c.classList.remove('active'); c.setAttribute('aria-expanded', 'false'); });
    if (/^#\/symptom\//.test(location.hash)) location.hash = '#/';
  }

  function updatePlaybookProgress() {
    var m = location.hash.match(/^#\/symptom\/([A-Za-z0-9_-]+)$/);
    var symId = m ? m[1] : null;
    if (!symId || !state.checks[symId]) return;
    var checks = state.checks[symId];
    var total = (symById[symId] || { steps: [] }).steps.length;
    var doneN = Object.keys(checks).filter(function (k) { return checks[k]; }).length;
    var pct = total ? doneN / total : 0;
    setRing($('#pbRing'), pct);
    $('#pbPct').textContent = Math.round(pct * 100) + '%';
    var d = $('#pbDone');
    if (d) d.textContent = doneN + '/' + total;
  }

  /* ---------- Modal ---------- */
  var lastFocus = null;

  function renderModal(id) {
    var t = byId[id];
    if (!t) return;
    if (!els.modalRoot.hidden && state.currentTool === id) return;
    state.currentTool = id;
    lastFocus = document.activeElement;

    var accCls = 'acc-' + t.cat[0];
    var isPinned = pinned.indexOf(t.id) > -1;
    var tUrl = targetUrl(t);

    var catChips = t.cat.map(function (c) {
      return '<button type="button" class="chip-btn" data-mact="filter" data-cat="' + c + '">' + esc(catById[c] ? catById[c].name : c) + '</button>';
    }).join('');
    var symChips = t.sym.map(function (s) {
      return '<button type="button" class="chip-btn" data-mact="sym" data-sym="' + s + '">' + esc(symById[s] ? symById[s].short : s) + '</button>';
    }).join('');
    var relChips = (t.related || []).filter(function (r) { return byId[r]; }).map(function (r) {
      return '<button type="button" class="chip-btn" data-mact="rel" data-id="' + r + '">' + esc(byId[r].name) + '</button>';
    }).join('');

    els.modalBody.innerHTML =
      '<div class="modal-head ' + accCls + '">' +
        '<span class="icon-tile" aria-hidden="true">' + svgIcon(catById[t.cat[0]].icon) + '</span>' +
        '<div class="modal-title-wrap">' +
          '<h3 id="modalTitle">' + esc(t.name) + '</h3>' +
          '<span class="modal-url">' + esc(t.url.replace(/^https?:\/\//, '')) + '</span>' +
        '</div>' +
        '<button type="button" class="modal-x" data-mact="close" aria-label="ปิด">×</button>' +
      '</div>' +
      '<p class="modal-desc">' + esc(t.desc) + '</p>' +
      '<div class="modal-sec"><h4>ใช้เมื่อไหร่</h4><p>' + md(t.when) + '</p></div>' +
      '<div class="modal-sec"><h4>วิธีใช้เบื้องต้น</h4><p>' + md(t.how) + '</p></div>' +
      '<div class="modal-sec"><h4>จุดแข็ง</h4><ul class="modal-list good">' +
        t.good.map(function (g) { return '<li>' + md(g) + '</li>'; }).join('') + '</ul></div>' +
      '<div class="modal-sec"><h4>ข้อจำกัด</h4><ul class="modal-list bad">' +
        t.bad.map(function (g) { return '<li>' + md(g) + '</li>'; }).join('') + '</ul></div>' +
      (symChips ? '<div class="modal-sec"><h4>อาการที่ใช้ตรวจ</h4><div class="modal-chips">' + symChips + '</div></div>' : '') +
      (relChips ? '<div class="modal-sec"><h4>เครื่องมือที่เกี่ยวข้อง</h4><div class="modal-chips">' + relChips + '</div></div>' : '') +
      '<div class="modal-sec"><h4>หมวดหมู่</h4><div class="modal-chips">' + catChips + '</div></div>' +
      '<div class="modal-actions">' +
        '<a class="btn btn-primary" href="' + esc(t.url) + '" target="_blank" rel="noopener noreferrer">เปิดเครื่องมือ ↗</a>' +
        (tUrl ? '<a class="btn btn-ghost" href="' + esc(tUrl) + '" target="_blank" rel="noopener noreferrer">เปิดพร้อม target ↗</a>' : '') +
        '<button type="button" class="btn btn-ghost" data-mact="copy">คัดลอกลิงก์</button>' +
        '<button type="button" class="btn btn-ghost" id="modalPin" data-mact="pin">' + (isPinned ? 'เลิกปักหมุด' : 'ปักหมุด') + '</button>' +
      '</div>';

    els.modalRoot.hidden = false;
    document.body.style.overflow = 'hidden';
    els.modalBox.scrollTop = 0;
    els.modalBox.focus();
  }

  function closeModal() {
    if (els.modalRoot.hidden) return;
    els.modalRoot.hidden = true;
    els.modalBody.innerHTML = '';
    document.body.style.overflow = '';
    state.currentTool = null;
    if (lastFocus && document.contains(lastFocus)) {
      try { lastFocus.focus(); } catch (e) { /* element อาจหายไป */ }
    }
  }

  function goTool(id) {
    var h = '#/tool/' + id;
    if (location.hash === h) renderModal(id);
    else location.hash = h;
  }

  /* ---------- Router (ไม่ใช้ history API — กัน SecurityError บน file://) ---------- */
  function handleRoute() {
    var h = location.hash || '';
    var mv = h.match(/^#\/view\?(.+)$/);
    if (mv) {
      applyViewParams(mv[1]);
      if (!els.playbook.hidden) closePlaybook();
      renderTools();
      renderLauncher();
    }
    var mt = h.match(/^#\/tool\/([A-Za-z0-9_-]+)$/);
    if (mt && byId[mt[1]]) { renderModal(mt[1]); return; }
    closeModal();
    var ms = h.match(/^#\/symptom\/([A-Za-z0-9_-]+)$/);
    if (ms && symById[ms[1]]) { openPlaybook(ms[1], false); return; }
    if (/^#\/symptom\//.test(h) && !els.playbook.hidden) closePlaybook();
  }

  /* ---------- Nav / scroll ---------- */
  function goto(id) {
    var el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'start' });
    closeDrawer();
  }
  function closeDrawer() {
    els.mainNav.classList.remove('open');
    els.navToggle.setAttribute('aria-expanded', 'false');
  }
  function closeDrops(except) {
    [els.flagWrap, els.pinnedWrap].forEach(function (w) {
      if (w && w !== except) {
        w.classList.remove('open');
        var b = w.querySelector('button[aria-expanded]');
        if (b) b.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ---------- Filter helpers ---------- */
  var searchTimer = null;
  function setFlag(f, on) {
    state.flags[f] = !!on;
    var n = Object.keys(state.flags).filter(function (k) { return state.flags[k]; }).length;
    els.flagN.hidden = n === 0;
    els.flagN.textContent = n;
    renderTools();
  }
  function resetFilters() {
    state.q = '';
    state.cat = 'all';
    state.preset = null;
    state.flags = { ipv6: false, free: false, tpl: false, api: false };
    els.searchInput.value = '';
    els.searchClear.hidden = true;
    els.flagN.hidden = true;
    $$('#flagMenu input[type="checkbox"]').forEach(function (c) { c.checked = false; });
    if (/^#\/view\?/.test(location.hash)) location.hash = '#/';
    renderTools();
  }

  /* ---------- Share-view (encode สถานะลง URL hash — ไม่ใช้ history API) ---------- */
  function viewStateFromState() {
    var v = {};
    if (state.q) v.q = state.q;
    if (state.cat && state.cat !== 'all') v.cat = state.cat;
    if (state.preset) v.preset = state.preset;
    var on = Object.keys(state.flags).filter(function (k) { return state.flags[k]; });
    if (on.length) v.f = on.join(',');
    if (state.target) v.t = state.target;
    return v;
  }
  function shareViewUrl() {
    var v = viewStateFromState();
    var base = location.href.split('#')[0];
    var keys = Object.keys(v);
    if (!keys.length) return base;
    return base + '#/view?' + keys.map(function (k) {
      return k + '=' + encodeURIComponent(v[k]);
    }).join('&');
  }
  function applyViewParams(query) {
    var params = {};
    query.split('&').forEach(function (pair) {
      var i = pair.indexOf('=');
      if (i < 1) return;
      params[pair.slice(0, i)] = decodeURIComponent(pair.slice(i + 1));
    });
    if (params.q) { state.q = params.q.toLowerCase(); els.searchInput.value = params.q; els.searchClear.hidden = false; }
    if (params.preset && D.presets.some(function (p) { return p.id === params.preset; })) state.preset = params.preset;
    else if (params.cat && (params.cat === 'all' || catById[params.cat])) { state.cat = params.cat; state.preset = null; }
    if (params.f) params.f.split(',').forEach(function (f) { if (f in state.flags) state.flags[f] = true; });
    if (params.t) {
      state.target = params.t;
      state.targetType = detectTargetType(params.t);
      els.targetInput.value = params.t;
      els.targetClear.hidden = false;
    }
    var n = Object.keys(state.flags).filter(function (k) { return state.flags[k]; }).length;
    els.flagN.hidden = n === 0;
    els.flagN.textContent = n;
  }

  /* ---------- Global events ---------- */
  document.addEventListener('click', function (ev) {
    var el;

    /* data-goto scroll buttons */
    el = ev.target.closest('[data-goto]');
    if (el) { goto(el.getAttribute('data-goto')); return; }

    /* nav toggle */
    if (ev.target.closest('#navToggle')) {
      var open = !els.mainNav.classList.contains('open');
      els.mainNav.classList.toggle('open', open);
      els.navToggle.setAttribute('aria-expanded', String(open));
      return;
    }

    /* flag dropdown */
    if (ev.target.closest('#flagBtn')) {
      var fOpen = !els.flagWrap.classList.contains('open');
      closeDrops(els.flagWrap);
      els.flagWrap.classList.toggle('open', fOpen);
      els.flagBtn.setAttribute('aria-expanded', String(fOpen));
      return;
    }

    /* pinned dropdown */
    if (ev.target.closest('#pinnedBtn')) {
      var pOpen = !els.pinnedWrap.classList.contains('open');
      closeDrops(els.pinnedWrap);
      els.pinnedWrap.classList.toggle('open', pOpen);
      els.pinnedBtn.setAttribute('aria-expanded', String(pOpen));
      return;
    }
    if (!ev.target.closest('.dl-wrap')) closeDrops(null);

    /* brand home */
    if (ev.target.closest('#brandLink')) {
      if (location.hash) location.hash = '#/';
      goto('hero');
      return;
    }

    /* search / target clear */
    if (ev.target.closest('#searchClear')) {
      els.searchInput.value = '';
      state.q = '';
      els.searchClear.hidden = true;
      renderTools();
      els.searchInput.focus();
      return;
    }
    if (ev.target.closest('#targetClear')) {
      els.targetInput.value = '';
      state.target = '';
      state.targetType = null;
      renderLauncher();
      renderTools();
      els.targetInput.focus();
      return;
    }

    /* category chip */
    el = ev.target.closest('.chip[data-cat]');
    if (el && el.classList.contains('chip')) {
      state.cat = el.getAttribute('data-cat');
      state.preset = null;
      renderTools();
      return;
    }

    /* preset */
    el = ev.target.closest('[data-preset]');
    if (el) {
      state.preset = el.getAttribute('data-preset');
      var pToast = D.presets.filter(function (x) { return x.id === state.preset; })[0];
      state.cat = 'all';
      renderTools();
      goto('catalog');
      toast('ใช้ชุดตรวจ ' + (pToast ? pToast.name : state.preset) + ' แล้ว', 'ok');
      return;
    }

    /* clear pill */
    el = ev.target.closest('[data-clear]');
    if (el) {
      var k = el.getAttribute('data-clear');
      if (k === 'query') { state.q = ''; els.searchInput.value = ''; els.searchClear.hidden = true; }
      else if (k === 'cat') state.cat = 'all';
      else if (k === 'preset') state.preset = null;
      else if (k.indexOf('flag:') === 0) {
        var f = k.slice(5);
        state.flags[f] = false;
        var cb = $('#flagMenu input[data-flag="' + f + '"]');
        if (cb) cb.checked = false;
        var n = Object.keys(state.flags).filter(function (x) { return state.flags[x]; }).length;
        els.flagN.hidden = n === 0;
        els.flagN.textContent = n;
      }
      renderTools();
      return;
    }

    /* reset all */
    if (ev.target.closest('#resetFilters')) { resetFilters(); return; }

    /* symptom card */
    el = ev.target.closest('.sym-card');
    if (el) {
      var sid = el.getAttribute('data-sym');
      if (els.playbook.hidden === false && location.hash === '#/symptom/' + sid) closePlaybook();
      else openPlaybook(sid, true);
      return;
    }

    /* playbook close */
    if (ev.target.closest('#pbClose')) { closePlaybook(); return; }

    /* playbook export → Markdown checklist */
    if (ev.target.closest('#pbExport')) {
      var mExp = location.hash.match(/^#\/symptom\/([A-Za-z0-9_-]+)$/);
      var elExp = document.querySelector('.sym-card.active');
      var sidExp = (mExp && mExp[1]) || (elExp ? elExp.getAttribute('data-sym') : null);
      if (sidExp && symById[sidExp]) copyText(playbookMarkdown(sidExp));
      return;
    }

    /* share view */
    if (ev.target.closest('#shareViewBtn')) {
      copyText(shareViewUrl());
      return;
    }

    /* ปุ่มชื่อเครื่องมือใน launcher hint → เลื่อนไปการ์ด + ไฮไลต์ */
    el = ev.target.closest('[data-goto-tool]');
    if (el) { flashToolCard(el.getAttribute('data-goto-tool')); return; }

    /* pinned menu actions */
    if (ev.target.closest('#copyChecklist')) {
      if (!pinned.length) { toast('ยังไม่มีเครื่องมือที่ปักหมุด', 'err'); return; }
      copyText(checklistMarkdown());
      return;
    }
    if (ev.target.closest('#clearPinned')) {
      pinned = [];
      savePinned(pinned);
      renderPinned();
      renderTools();
      toast('ล้างรายการปักหมุดแล้ว', 'ok');
      return;
    }

    /* tool card / modal actions (event delegation จุดเดียว) */
    el = ev.target.closest('[data-act]');
    if (el) {
      var act = el.getAttribute('data-act');
      var id = el.getAttribute('data-id');
      if (act === 'pin') { togglePin(id); return; }
      if (act === 'detail') {
        closeDrops(null);
        goTool(id);
        return;
      }
    }

    /* modal actions */
    el = ev.target.closest('[data-mact]');
    if (el) {
      var mact = el.getAttribute('data-mact');
      var cur = byId[state.currentTool];
      if (mact === 'close') { closeModal(); return; }
      if (mact === 'pin' && cur) { togglePin(cur.id); return; }
      if (mact === 'copy' && cur) { copyText(cur.url); return; }
      if (mact === 'rel') { goTool(el.getAttribute('data-id')); return; }
      if (mact === 'filter') {
        state.cat = el.getAttribute('data-cat');
        state.preset = null;
        closeModal();
        if (/^#\/tool\//.test(location.hash)) location.hash = '#/';
        renderTools();
        goto('catalog');
        return;
      }
      if (mact === 'sym') {
        var sy = el.getAttribute('data-sym');
        closeModal();
        openPlaybook(sy, true);
        goto('triage');
        return;
      }
    }

    /* modal backdrop / close */
    if (ev.target.classList && ev.target.classList.contains('modal-backdrop')) { closeModal(); return; }
    if (ev.target.closest('.modal-x[data-mact="close"]')) { closeModal(); return; }
  });

  /* search */
  els.searchInput.addEventListener('input', function () {
    els.searchClear.hidden = !els.searchInput.value;
    clearTimeout(searchTimer);
    searchTimer = setTimeout(function () {
      state.q = els.searchInput.value.trim().toLowerCase();
      renderTools();
    }, 120);
  });

  /* target launcher */
  els.targetInput.addEventListener('input', function () {
    state.target = els.targetInput.value.trim();
    state.targetType = detectTargetType(state.target);
    renderLauncher();
    renderTools();
  });

  /* flag checkboxes */
  els.flagMenu.addEventListener('change', function (ev) {
    var cb = ev.target.closest('input[data-flag]');
    if (cb) setFlag(cb.getAttribute('data-flag'), cb.checked);
  });

  /* playbook step checks */
  els.playbook.addEventListener('change', function (ev) {
    var cb = ev.target.closest('input[data-step]');
    if (!cb) return;
    var m = location.hash.match(/^#\/symptom\/([A-Za-z0-9_-]+)$/);
    var symId = m ? m[1] : null;
    if (!symId) return;
    if (!state.checks[symId]) state.checks[symId] = {};
    state.checks[symId][cb.getAttribute('data-step')] = cb.checked;
    var row = cb.closest('.pb-step');
    if (row) row.classList.toggle('done', cb.checked);
    updatePlaybookProgress();
  });

  /* ---------- Keyboard shortcuts ---------- */
  function openHelp() {
    var rows = [
      ['/', 'โฟกัสช่องค้นหาเครื่องมือ'],
      ['t', 'โฟกัสช่อง Target Launcher'],
      ['c', 'ไปหมวดเครื่องมือทั้งหมด (Catalog)'],
      ['s', 'ไปชุดตรวจด่วน (Presets)'],
      ['p', 'ไปอาการ & Triage (Playbooks)'],
      ['?', 'เปิด/ปิดคู่มือคีย์ลัดนี้'],
      ['Esc', 'ปิด modal / playbook / เมนูที่เปิดอยู่']
    ];
    var html = '<h2 id="modalTitle">คีย์ลัด</h2><p class="meta">ทำงานเมื่อไม่ได้พิมพ์ในช่องกรอก — กด <kbd>?</kbd> เพื่อเปิด/ปิดหน้านี้</p><div class="help-list">' +
      rows.map(function (r) {
        return '<div class="help-row"><span class="help-keys"><kbd>' + r[0] + '</kbd></span><span>' + r[1] + '</span></div>';
      }).join('') + '</div>' +
      '<div class="modal-actions"><button type="button" class="btn btn-primary" data-mact="close">รับทราบ</button></div>';
    els.modalBody.innerHTML = html;
    els.modalRoot.hidden = false;
    document.body.style.overflow = 'hidden';
    state.currentTool = null;
    els.modalBox.scrollTop = 0;
    els.modalBox.focus();
  }

  /* keyboard */
  document.addEventListener('keydown', function (ev) {
    if (ev.key === 'Escape') {
      if (!els.modalRoot.hidden) { closeModal(); return; }
      closeDrops(null);
      closeDrawer();
      return;
    }
    /* shortcuts — ไม่ทำงานเมื่อกำลังพิมพ์ใน input/textarea หรือกดพร้อม modifier */
    var typing = /^(input|textarea|select)$/i.test((document.activeElement && document.activeElement.tagName) || '');
    if (typing || ev.ctrlKey || ev.metaKey || ev.altKey) return;
    if (ev.key === '/') {
      ev.preventDefault();
      els.searchInput.focus();
      els.searchInput.select();
      goto('catalog');
      return;
    }
    if (ev.key === 't' || ev.key === 'T') {
      ev.preventDefault();
      els.targetInput.focus();
      els.targetInput.select();
      goto('launcher');
      return;
    }
    if (ev.key === 'c' || ev.key === 'C') { goto('catalog'); return; }
    if (ev.key === 's' || ev.key === 'S') { goto('presets'); return; }
    if (ev.key === 'p' || ev.key === 'P') { goto('triage'); return; }
    if (ev.key === '?') {
      ev.preventDefault();
      if (els.modalRoot.hidden) openHelp(); else closeModal();
      return;
    }
    /* focus trap ใน modal */
    if (ev.key === 'Tab' && !els.modalRoot.hidden) {
      var f = $$('a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])', els.modalBox)
        .filter(function (n) { return n.offsetParent !== null; });
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (ev.shiftKey && (document.activeElement === first || document.activeElement === els.modalBox)) {
        ev.preventDefault(); last.focus();
      } else if (!ev.shiftKey && document.activeElement === last) {
        ev.preventDefault(); first.focus();
      }
    }
  });

  window.addEventListener('hashchange', handleRoute);

  /* help modal ต้องปิดได้ด้วยปุ่มใน modal (data-mact=close จัดการอยู่แล้วเพราะ state.currentTool = null) */

  /* ---------- Boot ---------- */
  renderStats();
  renderChips();
  renderSymptoms();
  renderPresets();
  renderTools();
  renderPinned();
  renderLauncher();
  handleRoute();
  initReveal(document);
})();
