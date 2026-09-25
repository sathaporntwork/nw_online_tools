# 🛠️ NetOps Toolkit

> **แพลตฟอร์มศูนย์รวมเครื่องมือ Network Diagnostics ระดับมืออาชีพ สำหรับ Network Engineer สาย ISP, Core Network, Data Center และศูนย์ปฏิบัติการเครือข่าย (NOC)**  
> จัดระเบียบการแก้ไขปัญหาตาม **อาการที่พบจริง (Symptom-First Triage)** พร้อม Decision Flow และ Step-by-Step Playbooks  
> **Static Web Application 100%** — ใช้งานแบบ Zero-Dependency, เปิดตรงผ่าน `file://` ได้ทันที, รองรับ PWA ใช้งานออฟไลน์ และรับประกัน Console สะอาด 0 Error  

[![Version](https://img.shields.io/badge/version-v1.0.12-2fe0bf.svg)](#)
[![Stack](https://img.shields.io/badge/tech-HTML5%20%7C%20CSS3%20%7C%20Vanilla%20JS-8b5cf6.svg)](#)
[![PWA](https://img.shields.io/badge/pwa-offline--first-ff6ac2.svg)](#)
[![Architecture](https://img.shields.io/badge/dependencies-0%20(zero)-brightgreen.svg)](#)
[![Tests](https://img.shields.io/badge/tests-992%20checks%20passing-success.svg)](#)

---

## 📋 สารบัญ

- [1. ภาพรวมโครงการ (Project Overview)](#1-ภาพรวมโครงการ-project-overview)
- [2. ฟีเจอร์เด่น (Key Features)](#2-ฟีเจอร์เด่น-key-features)
- [3. โครงสร้างไฟล์ในระบบ (Project Directory Structure)](#3-โครงสร้างไฟล์ในระบบ-project-directory-structure)
- [4. วิธีเริ่มต้นใช้งาน (Getting Started)](#4-วิธีเริ่มต้นใช้งาน-getting-started)
- [5. หมวดหมู่และเครื่องมือทั้งหมด (Tool Catalog)](#5-หมวดหมู่และเครื่องมือทั้งหมด-tool-catalog)
- [6. Symptom Playbooks (คู่มือแก้ไขตามอาการ)](#6-symptom-playbooks-คู่มือแก้ไขตามอาการ)
- [7. Target Launcher (Deep Link Engine)](#7-target-launcher-deep-link-engine)
- [8. ชุดตรวจด่วน (Quick Start Presets)](#8-ชุดตรวจด่วน-quick-start-presets)
- [9. การปักหมุดและการส่งออก Ticket (Pinning & Markdown Export)](#9-การปักหมุดและการส่งออก-ticket-pinning--markdown-export)
- [10. การขยายระบบและเพิ่มเครื่องมือใหม่ (Extensibility Guide)](#10-การขยายระบบและเพิ่มเครื่องมือใหม่-extensibility-guide)
- [11. การปฏิบัติตาม Design System (Dark Glassmorphism)](#11-การปฏิบัติตาม-design-system-dark-glassmorphism)
- [12. มาตรการรับประกัน `file://` และ Console สะอาด 100%](#12-มาตรการรับประกัน-file-และ-console-สะอาด-100)
- [13. กระบวนการตรวจสอบคุณภาพ (QA Pipeline & Smoke Tests)](#13-กระบวนการตรวจสอบคุณภาพ-qa-pipeline--smoke-tests)
- [14. คีย์ลัดสำหรับการทำงานรวดเร็ว (Keyboard Shortcuts)](#14-คีย์ลัดสำหรับการทำงานรวดเร็ว-keyboard-shortcuts)
- [15. เอกสารประกอบโครงการ (Project Documentation Suite)](#15-เอกสารประกอบโครงการ-project-documentation-suite)
- [16. Browser Support & เครดิต](#16-browser-support--เครดิต)

---

## 1. ภาพรวมโครงการ (Project Overview)

NetOps Toolkit พัฒนาขึ้นเพื่อแก้ปัญหาความกระจัดกระจายของเครื่องมือตรวจสอบระบบเครือข่าย โดยเปลี่ยนกระบวนการทำงานของวิศวกรและเจ้าหน้าที่ NOC จากเดิมที่ต้องจำชื่อเครื่องมือ มาสู่แนวคิด **"เริ่มจากอาการปัญหาที่พบ แล้วเดินตามขั้นตอนที่พิสูจน์แล้ว"**:

- **ISP & Core Network**: รับมือเคสลูกค้าร้องเรียน, Packet Loss, Latency แกว่ง, Jitter
- **BGP & Routing**: วิเคราะห์ Route Leak, AS Path ผิดปกติ, RPKI Invalid, BGP Flapping
- **Peering & Transit**: ตรวจสอบเส้นทาง Domestic (TH-IX, BKNIX) และ International Submarine Cables
- **DNS & Web Security**: ตรวจสอบ Delegation Chain, DNSSEC Inconsistency, SSL/TLS Handshake
- **Multi-vantage-point**: ตรวจสอบ Reachability จากโพรบหลายร้อยจุดทั่วโลกผ่าน Globalping และ RIPE Atlas

---

## 2. ฟีเจอร์เด่น (Key Features)

| ฟีเจอร์ | รายละเอียดเชิงเทคนิค |
|---|---|
| **Symptom-Based Triage** | 11 Playbooks ครอบคลุมอาการยอดฮิต (เช่น Cross-ISP ไทย, สายเคเบิลใต้น้ำขัดข้อง, Outage วงกว้าง) แสดง Flow แยกปัญหา 3 ขั้น + ลำดับเครื่องมือ 4–5 ขั้น |
| **Interactive Progress Ring** | ตัวชี้วัดความคืบหน้าแบบวงแหวน SVG สร้างด้วยสูตรเรขาคณิต $C = 2\pi r$ ควบคุมด้วย CSS Dashoffset โดยไม่มีขอบสี่เหลี่ยมบดบัง |
| **Target Launcher** | กรอก Domain / IP / ASN เพียงครั้งเดียว การ์ดเครื่องมือที่รองรับจะสร้างปุ่ม **"เปิดพร้อม target"** (Deep-link) ไปยังผลการตรวจทันที |
| **Full-text Search & Facets** | ค้นหาแบบ Real-time รองรับทั้งชื่อ, คำอธิบาย, คีย์เวิร์ดเสริม (ไทย/อังกฤษ) และตัวกรองย่อย: IPv6, Free 100%, Deep-link, API/CLI |
| **3 Curated Presets** | ปรับมุมมอง Catalog ทันทีด้วยคลิกเดียว: Quick Investigation (8 ตัว), Thai Peering & Intl (8 ตัว), Deep Investigation (9 ตัว) |
| **Custom Accessible Modal** | แสดงคู่มือการใช้งาน, จุดแข็ง, ข้อจำกัด และคำสั่งตัวอย่าง พร้อมระบบ Focus Trap และปุ่ม Esc ปิดตามมาตรฐาน WAI-ARIA (ปลอด Native Dialog) |
| **Ticket Checklist Export** | ปุ่ม "คัดลอก MD" ส่งออก Decision Flow, ลำดับการตรวจ, สถานะ Checkbox และ Note เคล็ดลับไปแปะลง Jira / ServiceNow ทันที |
| **Share-View Hash URL** | ปุ่ม "แชร์มุมมองนี้" เข้ารหัส State ลง URL Hash (`#/view?...`) ช่วยให้ส่งต่อหน้าจอการกรองให้เพื่อนร่วมงานได้โดยไม่ต้องพึ่งพา Server State |
| **PWA & Offline-First** | ติดตั้งแบบ Standalone App ได้ และมี Service Worker Pre-cache App Shell ครบ 8 ไฟล์ ทำให้เปิดดู Playbook ได้แม้โครงข่ายออฟไลน์ |
| **Power Keyboard Shortcuts** | ควบคุมทั้งหน้าจอด้วยคีย์บอร์ด: `/` ค้นหา, `t` ตั้ง target, `c` แคตตาล็อก, `s` ชุดตรวจ, `p` เพลย์บุ๊ก, `?` เปิดคู่มือคีย์ลัด |

---

## 3. โครงสร้างไฟล์ในระบบ (Project Directory Structure)

```
nw_online_tools/
├── index.html            # Main App Shell (HTML5 Semantics, SVG Icons & Modal Backdrop)
├── manifest.webmanifest  # Progressive Web App Manifest (Standalone & Metadata)
├── sw.js                 # Service Worker (Offline Cache-First & Stale-While-Revalidate)
├── icons/
│   └── icon.svg          # Official Vector App Icon (Brand Mark)
├── css/
│   └── style.css         # Design Tokens, Glassmorphism, Responsive Grid & Animations
├── js/
│   ├── data.js           # Embedded Database (33 Tools, 7 Categories, 11 Symptoms, 3 Presets)
│   ├── app.js            # Core App Logic (Hash Router, Filtering, Modal, Launcher, Export)
│   └── pwa.js            # PWA Bootstrap & beforeinstallprompt Handler
├── tests/
│   └── data.test.js      # Zero-dependency Automated Smoke Test (992 Assertions)
├── PRD.md                # Product Requirements Document
├── ARCHITECTURE.md       # Technical Architecture & System Specifications
├── DESIGN-SYSTEM.md      # Dark Glassmorphism Universal Design System Specification
├── DEPLOY.md             # Production Deployment Guide (GitHub Pages + Cloudflare)
├── HANDOFF.md            # Developer & Operational Handoff Guide
└── README.md             # Main Project Documentation (This File)
```

---

## 4. วิธีเริ่มต้นใช้งาน (Getting Started)

### วิธีที่ 1: เปิดใช้งานตรง ๆ จากเครื่อง (แนะนำ — ไม่ต้องมี Server)
ดับเบิลคลิกไฟล์ `index.html` หรือเปิดผ่านเบราว์เซอร์ด้วย Path `file:///...` ได้ทันที ระบบถูกออกแบบให้ทำงานได้สมบูรณ์โดยไม่มี Security Error หรือ CORS Issue

### วิธีที่ 2: รันผ่าน Local Static Web Server
เหมาะสำหรับทดสอบ Service Worker และฟีเจอร์ PWA:

```bash
# รันผ่าน Python 3
python -m http.server 8080

# หรือรันผ่าน Node.js
npx serve .
```
จากนั้นเปิดเบราว์เซอร์ไปที่ `http://localhost:8080`

### การติดตั้งเป็นแอป (PWA Installation)
เมื่อเข้าใช้งานผ่าน `http://localhost` หรือ `https://` บนเบราว์เซอร์ Chrome, Edge หรือเบราว์เซอร์บนสมาร์ตโฟน:
1. คลิกปุ่ม **"ติดตั้งแอป"** บนเมนูบาร์ของเว็บ หรือคลิกไอคอน Install บน Address Bar
2. ยืนยันการติดตั้ง แอปจะเปิดทำงานในหน้าต่าง Standalone โดยไม่มีกรอบเบราว์เซอร์
3. สามารถเรียกใช้งานได้แม้ไม่มีสัญญาณอินเทอร์เน็ต (Offline-first)

---

## 5. หมวดหมู่และเครื่องมือทั้งหมด (Tool Catalog)

ระบบรวบรวมเครื่องมือ Network Diagnostics รวม **33 เครื่องมือ** จัดแบ่งตาม 7 หมวดหมู่หลัก:

| # | หมวดหมู่ | คำอธิบายหมวด | เครื่องมือในหมวด |
|---|---|---|---|
| 1 | **Multi-location & Latency** | ตรวจวัด Ping, Traceroute, Latency จากหลายประเทศ/ASN พร้อมกัน | Globalping, RIPE Atlas, Ping.pe, Check-Host, Looking.house, bunny.net Tools, Netforge |
| 2 | **BGP / Routing / ASN** | ตรวจสอบ Control Plane, Origin, AS Path, Routing History, RPKI | BGP.Tools, RIPEstat, Hurricane Electric BGP Toolkit, RouteViews, BGP Glass, PeeringDB |
| 3 | **Outage & Internet Health** | ติดตามสถานการณ์ Traffic, Outage และความผิดปกติระดับโครงข่าย | Cloudflare Radar |
| 4 | **DNS & DNSSEC** | ตรวจสอบ Resolution, Delegation, Propagation และ DNSSEC Validation | DNSViz, DNSChecker, IntoDNS |
| 5 | **HTTP / TLS / Web Perf** | ตรวจสอบ Web Availability, TTFB, Cipher Suite และ Certificate Chain | SSL Labs, WebPageTest, GlobalPing.Net |
| 6 | **Local CLI & Packet Analysis** | คำสั่งระดับ Command-Line สำหรับรันบนเซิร์ฟเวอร์หรือเครื่องผู้ใช้ | mtr, dig, curl, openssl s_client, Wireshark/tshark, Zeek, Arkime, tcping, Test-NetConnection |
| 7 | **IX / Peering** | Looking Glass ประจำชุมสายแลกเปลี่ยนข้อมูล และดัชนีผู้เข้าร่วม | PCH Looking Glass, DE-CIX GlobePEER Looking Glass, Internet Society IXP Tracker, TH-IX PeeringDB |

---

## 6. Symptom Playbooks (คู่มือแก้ไขตามอาการ)

เมื่อเลือกการ์ดอาการในเซกชัน **Symptom-Based Triage** ระบบจะกาง Playbook ที่ประกอบด้วย แผนผัง Decision Flow 3 ขั้น, ขั้นตอนการปฏิบัติ 4–5 ขั้น และคำแนะนำทางวิศวกรรม:

| อาการปัญหา | วัตถุประสงค์หลักและลำดับเครื่องมือ |
|---|---|
| **เข้าเว็บ/ปลายทางไม่ได้ เฉพาะบางเครือข่าย** | ตรวจแยกแยะปัญหา User / Geo-block / Origin ด้วย Globalping → BGP.Tools → DNSChecker → SSL Labs |
| **Latency / Packet loss สูง** | วิเคราะห์ Hop ที่สูญเสียแพ็กเก็ตด้วย Globalping MTR → Local mtr → BGP.Tools path → RIPEstat BGPlay |
| **เกม / Realtime lag หรือ jitter** | ตรวจวัด RTT ไปยังพอร์ตจริงด้วย tcping → Globalping → Local mtr -u (UDP) → Wireshark packet capture |
| **สงสัย route leak / hijack / RPKI invalid** | ตรวจสอบ Control plane ด้วย BGP.Tools → RIPEstat BGPlay → Cloudflare Radar → Looking.house → RouteViews |
| **DNS ไม่ resolve / ค่าไม่ตรง** | ไล่ตรวจ Recursive Propagation และ Delegation Chain ด้วย DNSChecker → DNSViz → IntoDNS → dig +trace |
| **HTTPS error / certificate ไม่ trust** | ตรวจสอบ Certificate Chain, Cipher และ SNI ด้วย SSL Labs → openssl s_client → curl -v → Netforge |
| **เว็บโหลดช้า (TTFB/content)** | แยกปัญหาระหว่าง CDN Edge กับ Origin ด้วย WebPageTest → GlobalPing.Net → bunny.net Tools → mtr |
| **ปัญหาเฉพาะ IPv6** | ตรวจสอบ Dual-Stack Reachability และ v6 Path ด้วย Globalping -6 → DNSChecker AAAA → BGP.Tools v6 → mtr -6 |
| **Cross-ISP ไทย (AIS/3BB/True) ช้า/หลุด** | ตรวจการเชื่อมต่อภายในประเทศด้วย Globalping Thai ASNs → mtr --aslookup → Looking.house → PeeringDB → BGP.Tools |
| **ต่างประเทศช้า/หลุด (สงสัย Intl link)** | เทียบ Domestic vs International และเคเบิลใต้น้ำด้วย Globalping → Cloudflare Radar TH → Gateway LG → RIPEstat → tcping |
| **เน็ตดับเป็นวงกว้างทั้ง POP/ย่าน** | ตรวจสอบเหตุ Outage ระดับวงกว้างด้วย Cloudflare Radar Outages → RIPE Atlas → Globalping → Looking.house → BGP.Tools |

---

## 7. Target Launcher (Deep Link Engine)

ระบบวิเคราะห์ชนิดของข้อมูล (Domain, IPv4, IPv6, ASN) อัตโนมัติ และสร้าง Deep Link พร้อมส่งค่าไปยังเครื่องมือภายนอก:

| เครื่องมือ | ชนิด Target ที่รองรับ | รูปแบบ URL Template (`tpl`) |
|---|---|---|
| **Globalping** | domain, ipv4, ipv6 | `https://globalping.io?host={t}` |
| **Ping.pe** | domain, ipv4 | `https://ping.pe/{t}` |
| **Check-Host** | domain, ipv4 | `https://check-host.net/check-ping?host={t}` |
| **BGP.Tools** | domain, ipv4, ipv6, asn | `https://bgp.tools/?q={t}` |
| **RIPEstat** | domain, ipv4, ipv6, asn | `https://stat.ripe.net/{t}` |
| **DNSViz** | domain | `https://dnsviz.net/d/{t}/dnssec/` |
| **DNSChecker** | domain, ipv4 | `https://dnschecker.org/#A/{t}` |
| **IntoDNS** | domain | `https://intodns.com/{t}` |
| **SSL Labs** | domain | `https://www.ssllabs.com/ssltest/analyze.html?d={t}` |

---

## 8. ชุดตรวจด่วน (Quick Start Presets)

1. **Quick Investigation (8 เครื่องมือ)**: เหมาะสำหรับการรับมือเคสเบื้องต้น (Globalping, Ping.pe, BGP.Tools, RIPEstat, DNSChecker, SSL Labs, mtr, curl)
2. **Thai Peering & Intl Link (8 เครื่องมือ)**: ปรับแต่งมาสำหรับเคสสายตรงในไทย ลิงก์ข้าม ISP และเกตเวย์ต่างประเทศ (Globalping, BGP.Tools, Looking.house, PeeringDB, Cloudflare Radar, PCH Looking Glass, mtr, tcping)
3. **Deep Investigation (9 เครื่องมือ)**: สำหรับเคสลึกลับ ซับซ้อน หรือต้องเก็บหลักฐานส่ง Upstream (RIPE Atlas, RouteViews, BGP Glass, DNSViz, WebPageTest, Wireshark, Zeek, Arkime, openssl s_client)

---

## 9. การปักหมุดและการส่งออก Ticket (Pinning & Markdown Export)

- **Pinning Tool**: คลิกที่ไอคอนหมุดบนการ์ดเครื่องมือเพื่อเก็บไว้ในรายการพิเศษสำหรับ Incident นั้น ๆ
- **Pinned Counter & Menu**: ไอคอนหมุดบน Navigation Bar จะแสดงจำนวนเครื่องมือที่ปักหมุดไว้ สามารถคลิกเพื่อดูรายการและคัดลอก Markdown Checklist
- **Export Playbook**: ใน Playbook ของแต่ละอาการ จะมีปุ่ม **"คัดลอก MD"** ซึ่งจะสร้างเนื้อหา Markdown ครบทั้งชื่ออาการ, Decision Flow, ลำดับขั้นตอนพร้อมสถานะการ Check และข้อควรระวัง พร้อมแปะลงใน Incident Report ทันที

---

## 10. การขยายระบบและเพิ่มเครื่องมือใหม่ (Extensibility Guide)

ข้อมูลทั้งหมดถูกจัดเก็บไว้ใน `js/data.js` การเพิ่มเครื่องมือสามารถทำได้โดยการเพิ่ม Object ตาม Schema:

```javascript
{
  id: 'tool-slug',                    // ตัวพิมพ์เล็กและขีดกลาง ห้ามซ้ำ
  name: 'Display Name',               // ชื่อทางการ
  url: 'https://example.com',         // URL หลัก
  tpl: 'https://example.com/?q={t}',  // (ถ้ามี) Deep link template
  tplTypes: ['domain', 'ipv4'],       // ชนิดข้อมูลที่รองรับสำหรับ template
  cat: ['multi', 'dns'],              // หมวดหมู่ (cat[0] เป็นหมวดหลัก)
  sym: ['web-block', 'latency'],      // อาการที่เกี่ยวข้อง
  ip: 'dual',                         // 'dual' หรือ 'v4'
  access: 'web+api',                  // 'web' | 'web+api' | 'cli'
  price: 'free',                      // 'free' | 'freemium'
  keys: 'search keywords in english', // คีย์เวิร์ดสำหรับการค้นหา
  desc: 'คำอธิบายสั้น 1 บรรทัดภาษาไทย',
  when: 'สถานการณ์ที่ควรใช้',
  how: 'วิธีใช้เบื้องต้น',
  good: ['จุดเด่นข้อที่ 1', 'จุดเด่นข้อที่ 2'],
  bad: ['ข้อจำกัดที่ควรทราบ'],
  related: ['globalping', 'ripestat'] // ID ของเครื่องมือที่เกี่ยวข้องกัน
}
```

> ⚠️ **ข้อบังคับ**: ทุกครั้งที่มีการแก้ไข `js/data.js` ต้องปรับ Version Triad ให้ตรงกันเสมอ (ดู [HANDOFF.md](HANDOFF.md)) และรัน `node tests/data.test.js` ก่อน Deploy

---

## 11. การปฏิบัติตาม Design System (Dark Glassmorphism)

NetOps Toolkit พัฒนาตามข้อกำหนดใน [DESIGN-SYSTEM.md](DESIGN-SYSTEM.md) อย่างเคร่งครัด:

- **Token Palette**: โทนสีมืดลึก Canvas `#0e1117` ตัดกับคู่สีแบรนด์ Triad (`Teal #2fe0bf` → `Violet #8b5cf6` → `Pink #ff6ac2`)
- **3-Layer Depth System**: Canvas Base Gradient + Ambient Floating Orbs 3 ดวง (ระยะเวลาหมุนวน 26s/32s/38s) + Dot Grid Mask
- **3-Alpha Status Rule**: Chip และ Badge ทุกสีสร้างจาก Hue เดียว ด้วย Alpha `0.08–0.12` (พื้นหลัง), `0.40` (เส้นขอบ) และ `1.00` (ข้อความ)
- **Fluid Geometry**: ปุ่มและ Chip ทรง Pill `999px`, กรอบการ์ดใหญ่ `--r-lg` (22px), แผงควบคุมภายใน `--r-md` (16px)
- **Accessibility & Motion**: รองรับ Keyboard Focus Trap, ปิด Transition ทันทีเมื่อเปิด `prefers-reduced-motion`

---

## 12. มาตรการรับประกัน `file://` และ Console สะอาด 100%

ระบบบังคับใช้ **The 6 Zero-Error Directives**:

1. **ห้ามใช้ `fetch()` หรือ `XMLHttpRequest`**: โหลดข้อมูลแบบ Static Data Store ภายใน `js/data.js`
2. **ห้ามใช้ History API (`pushState` / `replaceState`)**: ป้องกัน `SecurityError: Origin null` โดยใช้ Hash Routing (`#/`) แทน
3. **Safe Storage Wrapper**: ห่อคำสั่งอ่านเขียน `localStorage` ด้วย `try/catch` ทุกจุด
4. **Safe Clipboard API**: เรียกใช้ `navigator.clipboard` ก่อน และมี Fallback เป็น `document.execCommand('copy')` ในตัว
5. **System Font Stacks**: ใช้ System-Native Fonts เท่านั้น ไม่มีการยิง Request ไปดึง Google Fonts
6. **Zero Console Directives**: ไม่มีคำสั่ง `console.*` ตกค้างใน Production Code ข้อผิดพลาดทั้งหมดจัดการผ่าน Silent Fallbacks

---

## 13. กระบวนการตรวจสอบคุณภาพ (QA Pipeline & Smoke Tests)

ทุกคำสั่งสามารถรันได้จาก Root Directory ก่อนการ Commit หรือ Deploy:

```bash
# ขั้นที่ 1: ตรวจสอบ Syntax ทุกไฟล์ JS
node --check js/data.js && node --check js/app.js && node --check js/pwa.js && node --check sw.js

# ขั้นที่ 2: รัน Smoke Test ครบวงจร (Data Consistency + Version Triad + Shell Cache)
node tests/data.test.js

# ขั้นที่ 3: ตรวจสอบ Ban List - Native Browser Dialogs (ต้องได้ 0 ผลลัพธ์)
grep -rnE "(^|[^.\w])(alert|confirm|prompt)\(" index.html js/ css/ | grep -v deferredPrompt

# ขั้นที่ 4: ตรวจสอบ Ban List - Fetch/XHR/History/Console ใน Client Code (ต้องได้ 0 ผลลัพธ์)
grep -rnE "fetch\(|XMLHttpRequest|pushState|replaceState|console\." index.html js/app.js js/pwa.js
```

**เกณฑ์การผ่าน**: `node tests/data.test.js` ต้องรายงาน `✓ PASS — 992 การตรวจครบ`

---

## 14. คีย์ลัดสำหรับการทำงานรวดเร็ว (Keyboard Shortcuts)

| คีย์ | คำสั่ง | คำอธิบาย |
|:---:|---|---|
| <kbd>/</kbd> | โฟกัสช่องค้นหา | กระโดดไปยังช่องค้นหาของ Tool Catalog ทันที |
| <kbd>t</kbd> | โฟกัส Target Launcher | กระโดดไปยังช่องกรอก Domain / IP / ASN |
| <kbd>c</kbd> | ไปที่ Catalog | เลื่อนหน้าจอไปยังส่วนแสดงผลเครื่องมือทั้งหมด |
| <kbd>s</kbd> | ไปที่ Presets | เลื่อนหน้าจอไปยังส่วนชุดตรวจด่วน |
| <kbd>p</kbd> | ไปที่ Playbooks | เลื่อนหน้าจอไปยังส่วนวิเคราะห์อาการ (Triage) |
| <kbd>?</kbd> | แสดงคีย์ลัด | เปิด Modal สรุปรายการคีย์ลัดทั้งหมดในระบบ |
| <kbd>Esc</kbd> | ปิดหน้าต่าง | ปิด Modal หรือปิด Dropdown Menu ที่เปิดค้างอยู่ |

*(หมายเหตุ: คีย์ลัดตัวอักษรจะไม่ทำงานขณะพิมพ์ข้อความอยู่ในช่อง Input)*

---

## 15. เอกสารประกอบโครงการ (Project Documentation Suite)

โปรเจกต์มีชุดเอกสารมาตรฐานครบถ้วนสำหรับการบำรุงรักษาและการพัฒนาต่อยอด:

- 📄 [README.md](README.md) — คู่มือการใช้งานและภาพรวมระบบ (เอกสารนี้)
- 📋 [PRD.md](PRD.md) — เอกสารข้อกำหนดผลิตภัณฑ์ (Product Requirements Document)
- 🏗️ [ARCHITECTURE.md](ARCHITECTURE.md) — สถาปัตยกรรมระบบ โครงสร้างข้อมูล และไดอะแกรม
- 🤝 [HANDOFF.md](HANDOFF.md) — คู่มือนักพัฒนา ข้อตกลง และการเพิ่มเครื่องมือ/Playbook
- 🚀 [DEPLOY.md](DEPLOY.md) — คู่มือการ Deploy บน GitHub Pages + Cloudflare แบบละเอียด
- 🎨 [DESIGN-SYSTEM.md](DESIGN-SYSTEM.md) — สเปกการออกแบบ Dark Glassmorphism Universal Standard

---

## 16. Browser Support & เครดิต

### การรองรับเบราว์เซอร์
- **Modern Browsers**: Google Chrome, Microsoft Edge, Mozilla Firefox, Apple Safari (เวอร์ชันย้อนหลัง 2 ปี)
- **CSS Capabilities**: ต้องการการรองรับ CSS Custom Properties, `backdrop-filter`, `IntersectionObserver`, และ `matchMedia`

### เครดิตและลิขสิทธิ์
- เครื่องมือการวินิจฉัยภายนอกทั้งหมดเป็นลิขสิทธิ์ของเจ้าของแต่ละราย ลิงก์ภายในระบบเป็นการส่งต่อไปยังบริการทางการโดยตรง
- [Globalping](https://globalping.io) พัฒนาโดย [jsDelivr](https://github.com/jsdelivr/globalping) (MIT License)
- [RIPEstat](https://stat.ripe.net) และ [RIPE Atlas](https://atlas.ripe.net) ดูแลโดย RIPE NCC
- ไอคอนและเครื่องหมายการค้าทั้งหมดเป็นของผู้ถือสิทธิ์แต่ละโครงการ

---

Made with 🌐 สำหรับทีม Network Engineer และศูนย์ NOC ที่ต้องเริ่มวินิจฉัยปัญหาจาก "อาการที่ลูกค้าแจ้ง" ทุกวัน
