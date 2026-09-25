# 🤝 HANDOFF — NetOps Toolkit

> **Document Version**: 1.0.0  
> **Current Software Version**: v1.0.14  
> **Repository Type**: Production Static Web Application / PWA  
> **Target Audience**: Developers, Maintainers, DevOps, Network Leads  

---

## 1. Project Context & Repository Layout

NetOps Toolkit เป็นโปรเจกต์แบบ Static Single-Page Application (SPA) พร้อมความสามารถ PWA (Progressive Web App) สำหรับบุคลากรสาย ISP/NOC โค้ดทั้งหมดเขียนด้วย Vanilla HTML, CSS และ JavaScript โดยไม่มี Build Tool หรือ Bundler ใด ๆ

### โครงสร้างไฟล์ทั้งหมดในโปรเจกต์
```
nw_online_tools/
├── index.html            # Main App Shell (HTML5 Semantic Markup + SVG Assets)
├── manifest.webmanifest  # PWA Manifest (App name, Icons, Theme colors, Display mode)
├── sw.js                 # Service Worker (Offline Cache-First & Stale-While-Revalidate)
├── icons/
│   └── icon.svg          # Official Vector App Icon (Brand Mark)
├── css/
│   └── style.css         # Complete Stylesheet (Design Tokens, Components, Glass Layout)
├── js/
│   ├── data.js           # Embedded Database (Tools, Categories, Symptoms, Presets)
│   ├── app.js            # Core Application Logic (Router, Filter, Launcher, Modal, Export)
│   └── pwa.js            # PWA Bootstrap & Install Prompt Handler
├── tests/
│   └── data.test.js      # Zero-dependency Automated Smoke Test Suite
├── PRD.md                # Product Requirements Document
├── ARCHITECTURE.md       # Technical Architecture & System Design
├── DESIGN-SYSTEM.md      # Dark Glassmorphism Universal Specification
├── DEPLOY.md             # Production Deployment Guide (GitHub Pages + Cloudflare)
├── HANDOFF.md            # Developer & Operational Handoff Guide (This file)
└── README.md             # Project Overview & User Guide
```

---

## 2. Version Synchronization Contract (กฎเหล็กเวอร์ชัน 3 จุด)

เมื่อมีการแก้ไขไฟล์ CSS, JS หรือข้อมูลใน Data Store **จะต้องปรับเปลี่ยนหมายเลขเวอร์ชันให้ตรงกัน 3 จุดเสมอ** เพื่อป้องกันปัญหา Browser Cache ค้าง:

```
┌────────────────────────────────────────────────────────────────────────┐
│                   VERSION SYNCHRONIZATION TRIAD                        │
├─────────────────────┬──────────────────────────────────────────────────┤
│ 1. index.html       │ Query string ท้ายไฟล์:                             │
│                     │ <link href="css/style.css?v=1.0.14">             │
│                     │ <script src="js/data.js?v=1.0.14"></script>      │
│                     │ <script src="js/app.js?v=1.0.14"></script>       │
│                     │ <script src="js/pwa.js?v=1.0.14"></script>       │
├─────────────────────┼──────────────────────────────────────────────────┤
│ 2. sw.js            │ ตัวแปรแคชและรายการไฟล์ใน SHELL:                  │
│                     │ var CACHE = 'netops-v1.0.14';                    │
│                     │ './css/style.css?v=1.0.14',                      │
│                     │ './js/data.js?v=1.0.14',                         │
│                     │ './js/app.js?v=1.0.14',                          │
│                     │ './js/pwa.js?v=1.0.14',                          │
├─────────────────────┼──────────────────────────────────────────────────┤
│ 3. js/data.js       │ Metadata version:                                │
│                     │ meta: { version: '1.0.14', ... }                 │
└─────────────────────┴──────────────────────────────────────────────────┘
```

> 💡 **การตรวจสอบอัตโนมัติ**: รัน `node tests/data.test.js` เพื่อตรวจสอบว่าเวอร์ชันทั้ง 3 จุดตรงกัน 100% หรือไม่ หากไม่ตรง สคริปต์จะแจ้ง Error ทันที

---

## 3. How-To Guides (คู่มือการพัฒนาและเพิ่มฟีเจอร์)

### 3.1 วิธีเพิ่มเครื่องมือใหม่ (Adding a New Tool)
เปิดไฟล์ `js/data.js` และเพิ่ม Object ใน Array `tools`:

```javascript
{
  id: 'my-tool',                      // [จำเป็น] ID อักษรตัวพิมพ์เล็กและขีดกลาง ห้ามซ้ำ
  name: 'My Tool Name',               // [จำเป็น] ชื่อทางการของเครื่องมือ
  url: 'https://mytool.example.com',  // [จำเป็น] URL หลัก (ต้องขึ้นต้นด้วย https://)
  tpl: 'https://mytool.example.com/?target={t}', // [ถ้ามี] Template สำหรับ Deep Link
  tplTypes: ['domain', 'ipv4'],       // [ถ้ามี tpl] ชนิด target ที่รองรับ: domain | ipv4 | ipv6 | asn
  cat: ['multi', 'dns'],              // [จำเป็น] Array หมวดหมู่ (cat[0] คือหมวดหมู่หลัก)
  sym: ['web-block', 'dns-issues'],   // [จำเป็น] Array อาการปัญหาที่เครื่องมือนี้ช่วยตรวจ
  ip: 'dual',                         // [จำเป็น] 'dual' (รองรับ IPv6) หรือ 'v4' (IPv4 เป็นหลัก)
  access: 'web+api',                  // [จำเป็น] 'web' | 'web+api' | 'cli'
  price: 'free',                      // [จำเป็น] 'free' | 'freemium'
  keys: 'ping latency dns lookup',    // [จำเป็น] คีย์เวิร์ดเสริมสำหรับการค้นหา (คั่นด้วยวรรค)
  desc: 'คำอธิบายสั้น ๆ ภาษาไทย',     // [จำเป็น] สรุปหน้าที่ใน 1 บรรทัด
  when: 'สถานการณ์ที่ควรหยิบเครื่องมือนี้มาใช้',
  how: 'วิธีใช้งานเบื้องต้น หรือคำสั่งตัวอย่าง',
  good: [                             // [จำเป็น] จุดแข็งอย่างน้อย 1 ข้อ
    'ตรวจสอบได้รวดเร็ว',
    'มีจุดตรวจในภูมิภาคเอเชียตะวันออกเฉียงใต้'
  ],
  bad: [                              // [จำเป็น] ข้อจำกัดอย่างน้อย 1 ข้อ
    'จำกัดโควตาการทดสอบฟรีต่อชั่วโมง'
  ],
  related: ['globalping', 'ping-pe']  // [จำเป็น] ID เครื่องมือที่เกี่ยวข้องกัน (ต้องมีอยู่จริงใน tools)
}
```

### 3.2 วิธีเพิ่ม Playbook อาการใหม่ (Adding a New Symptom Playbook)
เปิดไฟล์ `js/data.js` และเพิ่ม Object ใน Array `symptoms`:

```javascript
{
  id: 'vpn-drops',
  name: 'IPsec / WireGuard VPN ขาดหายเป็นระยะ',
  short: 'VPN หลุดบ่อย / MTU issue',
  icon: 'lock',                       // ชื่อ icon key: globe, route, radar, dns, lock, term, pulse, bolt, gauge
  flow: [
    { tag: 'ขั้นที่ 1',    text: 'ทดสอบ Reachability ของ Gateway ปลายทางและตรวจจับ Packet Loss' },
    { tag: 'แยกทาง',      text: 'Ping Loss สูง → ปัญหา Physical/Transit · Ping นิ่งแต่ Handshake ไม่ผ่าน → MTU/MSS หรือ Firewall' },
    { tag: 'ขั้นสุดท้าย', text: 'ตรวจขนาด MTU Path และจับ Packet เพื่อดู Fragmentation' }
  ],
  steps: [
    { tool: 'tcping',    action: 'ทดสอบ Port 500/4500 (IPsec) หรือ 51820 (WireGuard) ว่าเปิดอยู่หรือไม่' },
    { tool: 'mtr',       action: 'รัน `mtr -u -P <port>` เพื่อตรวจหาจุดที่เกิด UDP Drop ราย Hop' },
    { tool: 'wireshark', action: 'วิเคราะห์ Packet dump หา ICMP Fragmentation Needed หรือ Retransmission' },
    { tool: 'globalping', action: 'รัน MTR จากโหนดภายนอกเข้ามายัง Public IP ของ VPN Gateway' }
  ],
  note: 'ปัญหา VPN ขาดหายบ่อยครั้งเกิดจาก MTU Blackhole — ควรทดสอบลดขนาด MSS Clamping เป็น 1360 ก่อนสรุปว่าเป็นปัญหาที่ลิงก์'
}
```

### 3.3 วิธีเพิ่มชุดตรวจด่วน (Adding a New Preset)
เปิดไฟล์ `js/data.js` และเพิ่ม Object ใน Array `presets`:

```javascript
{
  id: 'preset-vpn',
  name: 'VPN & Tunnel Triage',
  eyebrow: 'VPN SPECIFIC',
  desc: 'ชุดเครื่องมือสำหรับตรวจปัญหาอุโมงค์เชื่อมต่อและ MTU ขัดข้อง',
  tools: ['tcping', 'mtr', 'wireshark', 'globalping'] // Tool IDs ต้องมีอยู่จริง
}
```

---

## 4. Engineering Conventions & Code Rules

1. **Pure Vanilla Standard**:
   - ห้าม `import` หรือ `require` Library ภายนอกในฝั่ง Client
   - โค้ดใน `js/` ต้องรันได้บนเบราว์เซอร์สมัยใหม่โดยตรง ไม่ต้องผ่าน Babel หรือ Webpack
2. **Safe Storage & Safe Clipboard**:
   - ห้ามเรียก `localStorage.getItem` หรือ `setItem` ตรง ๆ โดยไม่มี `try/catch`
   - การคัดลอกข้อความต้องมี Fallback ไปยัง `document.execCommand('copy')` เสมอ
3. **No Native Dialogs**:
   - ห้ามใช้ `alert()`, `confirm()`, `prompt()` ในโค้ดเด็ดขาด
   - การแสดงรายละเอียดต้องใช้ Custom Modal (`#modalRoot`) และการแจ้งเตือนสั้น ๆ ให้ใช้ Toast (`#toasts`)
4. **Zero Console Policy**:
   - ห้ามทิ้ง `console.log` หรือคำสั่ง Debug ในโค้ด Production
   - ทุก Exception ที่คาดการณ์ได้ต้องถูก Handle อย่างเงียบ ๆ (Silent Graceful Fallback)

---

## 5. Local Development & QA Testing Workflow

### การรัน Local Web Server
```bash
# วิธีที่ 1: Python 3 (แนะนำ)
python -m http.server 8080

# วิธีที่ 2: Node.js npx serve
npx serve .
```
จากนั้นเปิดเบราว์เซอร์ไปที่ `http://localhost:8080`

### การรันชุดทดสอบคุณภาพ (Pre-Push Smoke Test)
ก่อนทำการ Commit หรือ Deploy ให้รันสคริปต์ตรวจสอบเสมอ:

```bash
node tests/data.test.js
```

**ผลลัพธ์ที่ถูกต้อง**:
```
✓ PASS — 1279 การตรวจครบ
  tools: 44 · categories: 9 · symptoms: 11 · presets: 3 · version: 1.0.14
```

### การตรวจสอบ Ban List ผ่าน Command-line
```bash
# ตรวจหา Native Dialogs (ต้องได้ 0 ผลลัพธ์ ยกเว้น deferredPrompt ใน pwa.js)
grep -rnE "(^|[^.\w])(alert|confirm|prompt)\(" index.html js/ css/ | grep -v deferredPrompt

# ตรวจหา Console Calls และ History API ใน client scripts (ต้องได้ 0 ผลลัพธ์)
grep -rnE "fetch\(|XMLHttpRequest|pushState|replaceState|console\." index.html js/app.js js/pwa.js
```

---

## 6. Browser Quirks & Production Considerations

1. **`file://` Limitations**:
   - เมื่อเปิดผ่านโปรโตคอล `file:///` เบราว์เซอร์จะไม่ลงทะเบียน Service Worker และจะไม่มีปุ่ม "ติดตั้งแอป" ปรากฏ (นี่คือข้อกำหนดความปลอดภัยของเบราว์เซอร์ ไม่ใช่ข้อผิดพลาด)
   - ฟีเจอร์การค้นหา, การกรอง, Playbook และ Target Launcher ยังคงทำงานได้ครบ 100%
2. **iOS Safari PWA Limitations**:
   - Apple iOS Safari ไม่รองรับ Event `beforeinstallprompt` ผู้ใช้ iPhone/iPad ต้องติดตั้งผ่านปุ่ม Share → "Add to Home Screen" บนแถบเครื่องมือของ Safari เอง
3. **Service Worker Update Behavior**:
   - Service Worker ใช้กลไก Stale-While-Revalidate เมื่อมีการอัปเดตเวอร์ชันใหม่ ผู้ใช้จะได้รับไฟล์ใหม่โดยสมบูรณ์เมื่อทำการ Refresh ซ้ำเป็นครั้งที่ 2
