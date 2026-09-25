#!/usr/bin/env node
/*
 * NetOps Toolkit — Smoke test (tests/data.test.js)
 * รัน: node tests/data.test.js   — ไม่มี dependency ใด ๆ (node ล้วน)
 * ตรวจ: โครงสร้าง NT_DATA · การอ้างอิงทุกชนิด · เวอร์ชัน 3 จุดตรงกัน · ไฟล์ใน SW SHELL มีจริง
 * ออกแบบให้รันก่อน push/deploy ทุกครั้ง (exit 1 = fail)
 */
'use strict';

var fs = require('fs');
var path = require('path');

var ROOT = path.join(__dirname, '..');
var failures = [];
var checks = 0;

function ok(cond, msg) {
  checks++;
  if (!cond) failures.push(msg);
}

/* ---------- 1) โหลด NT_DATA ---------- */
global.window = {};
try {
  require(path.join(ROOT, 'js', 'data.js'));
} catch (e) {
  console.error('โหลด js/data.js ไม่ผ่าน — syntax พังหรือไฟล์หาย:', e.message);
  process.exit(1);
}
var D = global.window.NT_DATA;
ok(D && typeof D === 'object', 'NT_DATA ต้องถูก export ผ่าน window.NT_DATA');
if (!D) { report(); }

/* ---------- 2) โครงสร้างหลัก + uniqueness ---------- */
ok(Array.isArray(D.tools) && D.tools.length > 0, 'tools ต้องเป็น array ไม่ว่าง');
ok(Array.isArray(D.categories) && D.categories.length > 0, 'categories ต้องเป็น array ไม่ว่าง');
ok(Array.isArray(D.symptoms) && D.symptoms.length > 0, 'symptoms ต้องเป็น array ไม่ว่าง');
ok(Array.isArray(D.presets) && D.presets.length > 0, 'presets ต้องเป็น array ไม่ว่าง');
ok(D.meta && D.meta.version, 'meta.version ต้องมีค่า');

function uniqCheck(arr, label) {
  var seen = {};
  arr.forEach(function (x) {
    checks++;
    if (seen[x.id]) failures.push(label + ' id ซ้ำ: ' + x.id);
    seen[x.id] = true;
  });
}
uniqCheck(D.tools, 'tool');
uniqCheck(D.categories, 'category');
uniqCheck(D.symptoms, 'symptom');
uniqCheck(D.presets, 'preset');

/* ---------- 3) fields จำเป็นของทุก tool ---------- */
var REQ = ['id', 'name', 'url', 'cat', 'sym', 'ip', 'access', 'price', 'keys', 'desc', 'when', 'how', 'good', 'bad', 'related'];
var toolIds = {}, catIds = {}, symIds = {};
D.tools.forEach(function (t) { toolIds[t.id] = true; });
D.categories.forEach(function (c) { catIds[c.id] = true; });
D.symptoms.forEach(function (s) { symIds[s.id] = true; });

D.tools.forEach(function (t) {
  REQ.forEach(function (f) {
    checks++;
    if (t[f] === undefined || t[f] === null || t[f] === '') failures.push('tool "' + t.id + '": field หาย/ว่าง — ' + f);
  });
  checks++;
  if (!/^https:\/\/./.test(t.url || '')) failures.push('tool "' + t.id + '": url ต้องขึ้นต้น https://');
  (t.cat || []).forEach(function (c) {
    checks++;
    if (!catIds[c]) failures.push('tool "' + t.id + '": cat "' + c + '" ไม่มีจริง');
  });
  (t.sym || []).forEach(function (s) {
    checks++;
    if (!symIds[s]) failures.push('tool "' + t.id + '": sym "' + s + '" ไม่มีจริง');
  });
  (t.related || []).forEach(function (r) {
    checks++;
    if (!toolIds[r]) failures.push('tool "' + t.id + '": related "' + r + '" ไม่มีจริง');
  });
  if (t.tpl) {
    checks++;
    if (t.tpl.indexOf('{t}') === -1) failures.push('tool "' + t.id + '": tpl ต้องมี {t}');
    checks++;
    if (!t.tplTypes || !t.tplTypes.length) failures.push('tool "' + t.id + '": มี tpl แต่ไม่ระบุ tplTypes');
    (t.tplTypes || []).forEach(function (tt) {
      checks++;
      if (['domain', 'ipv4', 'ipv6', 'asn'].indexOf(tt) === -1) failures.push('tool "' + t.id + '": tplTypes ไม่รู้จักชนิด "' + tt + '"');
    });
  }
});

/* ---------- 4) symptoms: flow/steps และ tool refs ---------- */
D.symptoms.forEach(function (s) {
  checks++;
  if (!Array.isArray(s.flow) || s.flow.length < 2) failures.push('symptom "' + s.id + '": flow ต้องมีอย่างน้อย 2 ขั้น');
  checks++;
  if (!Array.isArray(s.steps) || s.steps.length < 4) failures.push('symptom "' + s.id + '": steps ต้องมีอย่างน้อย 4 ขั้น');
  checks++;
  if (!s.note) failures.push('symptom "' + s.id + '": ควรมี note เคล็ดลับ');
  (s.steps || []).forEach(function (st) {
    checks++;
    if (!toolIds[st.tool]) failures.push('symptom "' + s.id + '": step อ้าง tool "' + st.tool + '" ไม่มีจริง');
  });
  var covered = D.tools.some(function (t) { return (t.sym || []).indexOf(s.id) > -1; });
  checks++;
  if (!covered) failures.push('symptom "' + s.id + '": ไม่มี tool ใดรองรับอาการนี้เลย');
});

/* ---------- 5) presets: tool refs + eyebrow ---------- */
D.presets.forEach(function (p) {
  (p.tools || []).forEach(function (id) {
    checks++;
    if (!toolIds[id]) failures.push('preset "' + p.id + '": tool "' + id + '" ไม่มีจริง');
  });
  checks++;
  if (!p.eyebrow) failures.push('preset "' + p.id + '": ควรมี eyebrow (ป้ายบนการ์ด)');
});

/* ---------- 6) เวอร์ชัน 3 จุดต้องตรงกัน (index.html · sw.js · data.js) ---------- */
var idx = '', sw = '';
try { idx = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8'); } catch (e) { failures.push('อ่าน index.html ไม่ได้'); }
try { sw = fs.readFileSync(path.join(ROOT, 'sw.js'), 'utf8'); } catch (e) { failures.push('อ่าน sw.js ไม่ได้'); }
var metaV = D.meta && D.meta.version;

var idxVs = {};
(idx.match(/v=([0-9.]+)/g) || []).forEach(function (m) { idxVs[m] = true; });
var idxList = Object.keys(idxVs).map(function (m) { return m.slice(2); });
checks++;
if (idxList.length !== 1) failures.push('index.html: มี ?v= หลายเวอร์ชัน (' + idxList.join(', ') + ') — ต้องเป็นค่าเดียวกันทุก asset');
else ok(idxList[0] === metaV, 'index.html ?v=' + idxList[0] + ' ไม่ตรงกับ meta.version ' + metaV);

var swCache = (sw.match(/netops-v([0-9.]+)/) || [])[1];
ok(swCache === metaV, 'sw.js CACHE (netops-v' + swCache + ') ไม่ตรงกับ meta.version ' + metaV);

if (sw.indexOf('?v=' + metaV) === -1 && /\?v=/.test(sw)) {
  failures.push('sw.js SHELL: asset เวอร์ชันใน shell ไม่ตรงกับ ' + metaV);
}

/* ---------- 7) ไฟล์ใน SW SHELL ต้องมีจริงบนดิสก์ ---------- */
var shellBlock = (sw.match(/var SHELL = \[([\s\S]*?)\];/) || [])[1] || '';
(shellBlock.match(/['"]([^'"]+)['"]/g) || []).forEach(function (m) {
  var p = m.slice(1, -1);
  if (p === './') return;
  var diskPath = p.split('?')[0].replace(/^\.\//, '');
  checks++;
  if (!fs.existsSync(path.join(ROOT, diskPath))) failures.push('sw.js SHELL: ไฟล์ "' + diskPath + '" ไม่มีบนดิสก์ (deploy แล้วจะ 404 + install พัง)');
});

/* ---------- สรุป ---------- */
function report() {
  if (failures.length) {
    console.error('\n✗ FAIL — ' + failures.length + ' ปัญหา จาก ' + checks + ' การตรวจ:');
    failures.forEach(function (f) { console.error('  - ' + f); });
    process.exit(1);
  }
  console.log('✓ PASS — ' + checks + ' การตรวจครบ');
  console.log('  tools: ' + D.tools.length + ' · categories: ' + D.categories.length + ' · symptoms: ' + D.symptoms.length + ' · presets: ' + D.presets.length + ' · version: ' + metaV);
}
report();
