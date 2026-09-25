# 📋 PRD — NetOps Toolkit (Product Requirements Document)

> **Document Version**: 1.0.0  
> **Target Release**: NetOps Toolkit v1.0.12+  
> **Status**: Approved / Production  
> **Target Audience**: Network Engineers, NOC Operators, Core Routing Engineers, Systems Architects  

---

## 1. Executive Summary & Vision

**NetOps Toolkit** เป็นแพลตฟอร์มรวบรวมและจัดระเบียบเครื่องมือ **Network Diagnostics** ระดับมืออาชีพ สำหรับวิศวกรเครือข่าย (Network Engineer) สาย ISP, Core Network, Transit Provider, และเจ้าหน้าที่ศูนย์ปฏิบัติการเครือข่าย (NOC) ในประเทศไทย

### ปัญหาที่พบในงานประจำวัน (Problem Statement)
1. **Tool Sprawl & Fragmentation**: เครื่องมือตรวจสอบเครือข่ายกระจัดกระจาย (Globalping, RIPEstat, BGP.Tools, DNSViz, Looking Glasses ฯลฯ) วิศวกรต้องจำ URL และเปิดทีละแท็บ
2. **"เริ่มจากเครื่องมือ แทนที่จะเริ่มจากอาการ"**: เมื่อลูกค้าหรือระบบแจ้งปัญหา เช่น "เข้าเว็บไม่ได้บางโครงข่าย" หรือ "เกมกระตุกเฉพาะบางเวลา" วิศวกรระดับ L1/L2 มักไม่แน่ใจว่าต้องเริ่มไล่จากจุดใด ทำให้เสียเวลา (MTTR สูง)
3. **ขาดความสม่ำเสมอในการเก็บหลักฐาน (Evidence Gathering)**: การประสานงานระหว่าง ISP หรือส่ง Ticket ไปยัง Upstream / CDN / Content Provider ต้องใช้หลักฐานทั้ง Control Plane (BGP AS Path / RPKI) และ Data Plane (Traceroute / Loss ราย Hop) แต่ผู้ตรวจมักเก็บไม่ครบ
4. **ข้อจำกัดด้านสภาพแวดล้อมระบบ**: หลายครั้งวิศวกรต้องทำงานในไซต์งานออฟไลน์ หรือเปิดไฟล์จาก Flash Drive (`file://`) โดยไม่มี Web Server รองรับ

### วิสัยทัศน์ของผลิตภัณฑ์ (Product Vision)
> **"เริ่มจากอาการปัญหาที่พบ เดินตาม Playbook สู่หลักฐานที่ยื่น Provider ได้ทันที โดยไม่มี External Dependency หรือข้อจำกัดด้าน Infrastructure"**

---

## 2. กลุ่มผู้ใช้งานเป้าหมาย (Target Personas)

```
┌────────────────────────────────────────────────────────────────────────┐
│                        TARGET USER PERSONAS                            │
├────────────────────┬────────────────────┬──────────────────────────────┤
│ 1. L1/L2 NOC       │ 2. Core / BGP      │ 3. Peering / Interconnect    │
│    Operator        │    Network Eng     │    Coordinator               │
├────────────────────┼────────────────────┼──────────────────────────────┤
│ • รับแจ้งปัญหาหน้างาน  │ • วิเคราะห์ Route   │ • ดูแลแลกเปลี่ยน Traffic      │
│ • ต้องการ Triage ด่วน│   Leak / Hijack    │ • ตรวจสอบ IXP (BKNIX, TH-IX) │
│ • ต้องการ Playbook │ • ตรวจสอบ RPKI /   │ • เช็ค PeeringDB & Looking   │
│   นำทางแบบ Step-by-Step│ AS Path เปลี่ยนแปลง│   Glasses ระหว่างคู่ค้า         │
└────────────────────┴────────────────────┴──────────────────────────────┘
```

1. **L1/L2 NOC Engineer**: ต้องการวินิจฉัยปัญหาเบื้องต้นอย่างรวดเร็ว รู้ลำดับขั้นตอน (Step-by-step Triage) และคัดลอก Checklist ผลการตรวจไปบันทึกลง Incident Ticket ได้ทันที
2. **Core / BGP Network Engineer**: ต้องการเครื่องมือเชิงลึกในการตรวจสอบ Route Leak, Prefix Hijack, RPKI Validation, Looking Glasses หลากหลายค่าย และ MRT routing archive
3. **Peering & Transit Coordinator**: ต้องการตรวจสอบสถานะการเชื่อมต่อทั้ง Domestic (TH-IX, BKNIX) และ International Links (Submarine Cables, Transit Gateway) เมื่อเกิดปัญหา Latency พุ่งสูง

---

## 3. คุณค่าหลักของผลิตภัณฑ์ (Core Value Propositions)

| เสาหลัก | รายละเอียดการมอบคุณค่า |
|---|---|
| **Symptom-First Triage** | พลิกรูปแบบการทำงานจากเดิมที่ต้องนึกชื่อเครื่องมือ มาเป็นการเลือก "อาการปัญหา" แล้วระบบวาง Decision Tree + ลำดับเครื่องมือที่เหมาะสมให้ทันที |
| **Zero-Dependency Architecture** | รันด้วย Vanilla HTML5, CSS3, ES5/ES6 ล้วน 100% ไม่ต้องติดตั้ง `node_modules`, ไม่มี Build step, เปิดจาก `file://` ได้ทันทีโดยไม่เกิด Security Error |
| **Target Launcher Deep Linking** | กรอก Domain / IP / ASN เพียงครั้งเดียว ระบบกระจายค่าไปยังเครื่องมือภายนอกที่รองรับแบบ Deep-link ทันที ลดความผิดพลาดในการพิมพ์ซ้ำ |
| **Offline-First PWA** | รองรับ Service Worker Pre-cache App Shell ครบถ้วน ติดตั้งลง Desktop / Mobile ได้ และใช้งานฟังก์ชันค้นหา/Playbook ได้แม้ไม่มีสัญญาณอินเทอร์เน็ต |
| **Clean Incident Export** | ระบบปักหมุดเครื่องมือและส่งออก (Export) เป็น Markdown Tasklist พร้อมสำหรับนำไปแปะใน Jira, ServiceNow, หรือ Line/Slack Alert |

---

## 4. ข้อกำหนดเชิงฟังก์ชัน (Functional Requirements - FR)

### FR-1: Symptom-Based Triage & Interactive Playbooks
- **FR-1.1**: ต้องมี Playbook ครอบคลุมอาการปัญหาอย่างน้อย 11 อาการหลัก (เช่น Web เข้าไม่ได้บางที่, Latency สูง, Game lag, Route leak, DNS fail, Cross-ISP ไทย, International link ขัดข้อง, Outage วงกว้าง)
- **FR-1.2**: แต่ละ Playbook ต้องประกอบด้วย:
  - **Decision Flow**: แผนผังการแยกแยะปัญหาอย่างน้อย 3 ขั้น (ขั้นแรก, จุดแยกทาง, ขั้นยืนยัน)
  - **Action Steps**: ลำดับเครื่องมือ 4–5 ขั้น พร้อมคำอธิบาย Action ที่เจาะจง
  - **Engineering Note**: คำแนะนำ/ข้อควรระวังตาม Best Practice ทางวิศวกรรมเครือข่าย
- **FR-1.3**: มี Interactive Checkbox ในแต่ละ Step และคำนวณ Progress อัตโนมัติ แสดงผลผ่าน Circular SVG Progress Ring (C = 2πr)
- **FR-1.4**: มีปุ่ม "คัดลอก MD" สำหรับ Export เนื้อหา Playbook และสถานะการ Check ออกมาเป็น Markdown Checklist

### FR-2: Target Launcher (Deep Link Engine)
- **FR-2.1**: ช่องกรอก Target กลาง รองรับ 4 ชนิดข้อมูล: Domain, IPv4, IPv6, และ ASN
- **FR-2.2**: ทำการตรวจจับ Regex ของชนิดข้อมูลอัตโนมัติ (เช่น `^AS\d+`, IPv4 Regex, Domain Regex)
- **FR-2.3**: เมื่อกรอก Target การ์ดเครื่องมือที่รองรับ Template (`tpl`) และชนิดข้อมูลตรงกัน จะแสดงปุ่ม **"เปิดพร้อม target"** ที่นำทางไปยัง URL ที่แทนค่า `{t}` แล้วทันที
- **FR-2.4**: มีปุ่มล้างค่า (Clear button) และข้อความแนะนำสถานะการกรอก

### FR-3: Presets (ชุดตรวจด่วน)
- **FR-3.1**: จัดเตรียม Preset สำเร็จรูปอย่างน้อย 3 รูปแบบ:
  1. *Quick Investigation* (8 เครื่องมือหลักสำหรับงานด่วน)
  2. *Thai Peering & Intl Link* (8 เครื่องมือเฉพาะสายเครือข่ายไทยและลิงก์ต่างประเทศ)
  3. *Deep Investigation* (9 เครื่องมือวิเคราะห์เชิงลึกระดับ Packet / MRT)
- **FR-3.2**: เมื่อคลิก Preset ระบบต้องฟิลเตอร์ Tool Catalog ทันที พร้อมแสดง Active Filter Tag ที่สามารถกดล้างออกได้

### FR-4: Multi-Facet Catalog & Instant Search
- **FR-4.1**: จัดหมวดหมู่เครื่องมือ 7 หมวดหลัก (Multi-location, BGP, Outage, DNS, HTTP/TLS, Local CLI, IX/Peering)
- **FR-4.2**: Full-text Search ค้นหาได้ทั้งจากชื่อเครื่องมือ (Name), คำอธิบาย (Desc), คีย์เวิร์ดเสริม (Keys), และหมวดหมู่ รองรับทั้งภาษาไทยและอังกฤษ
- **FR-4.3**: ตัวกรองคุณสมบัติเพิ่มเติม (Facet Filters):
  - รองรับ IPv6 (`ip: 'dual'`)
  - ใช้งานฟรี 100% (`price: 'free'`)
  - มี Deep Link (`tpl`)
  - มี API / CLI (`access: 'web+api'` หรือ `'cli'`)
- **FR-4.4**: แสดงผลจำนวนเครื่องมือที่ตรงตามเงื่อนไข (Result Count) แบบ Real-time พร้อม Empty State ในกรณีที่ไม่พบผลลัพธ์

### FR-5: Custom Modal & Comprehensive Tool Detail
- **FR-5.1**: ห้ามใช้ Native Dialog (`alert`, `confirm`, `prompt`) ในระบบเด็ดขาด
- **FR-5.2**: รายละเอียดใน Modal ต้องแสดงครบถ้วน:
  - ใช้เมื่อไหร่ (When to use)
  - วิธีใช้เบื้องต้น (How to use + Command snippet)
  - จุดแข็ง (Strengths / Advantages)
  - ข้อจำกัด (Limitations)
  - เครื่องมือที่เกี่ยวข้อง (Related Tools) พร้อมปุ่มเปิดดูต่อได้ทันที
- **FR-5.3**: Accessibility Compliance: มี Focus Trap กัก Focus ภายใน Modal, กด `Esc` ปิดได้, ปิดเมื่อคลิก Backdrop

### FR-6: Pinning & Ticket Export System
- **FR-6.1**: ผู้ใช้สามารถกด Pin/Unpin เครื่องมือใด ๆ ได้ เพื่อสร้างชุดเครื่องมือเฉพาะกิจสำหรับแต่ละ Incident
- **FR-6.2**: จัดเก็บสถานะ Pinned ไว้ใน `localStorage` ภายใต้ Safe Wrapper (ไม่ให้พังเมื่อเปิดบน `file://` หรือ Private Mode)
- **FR-6.3**: มีเมนู Pinned ใน Navigation Bar แสดงตัวเลขนับ และมีปุ่มคัดลอกรายชื่อเครื่องมือที่ปักหมุดในรูปแบบ Markdown Checklist

### FR-7: Share-View URL State Serialization
- **FR-7.1**: มีปุ่ม "แชร์มุมมองนี้" เข้ารหัส State ปัจจุบัน (Search Query, Category, Flags, Preset, Target) ลงใน URL Hash: `#/view?q=...&cat=...&f=...&preset=...&t=...`
- **FR-7.2**: เมื่อเปิด URL ที่มี Hash ดังกล่าว ระบบต้อง Restore หน้าจอ ฟิลเตอร์ และช่องค้นหากลับมาตรงกัน 100%
- **FR-7.3**: ต้องทำงานผ่าน `location.hash` เท่านั้น ห้ามใช้ `history.pushState` เพื่อป้องกันข้อผิดพลาด SecurityError บน `file://`

### FR-8: Progressive Web App (PWA) & Offline Capabilities
- **FR-8.1**: มี Web App Manifest (`manifest.webmanifest`) พร้อม Metadata ครบถ้วน (Theme Color, Standalone Display, High-res Icons)
- **FR-8.2**: มี Service Worker (`sw.js`) ทำ Pre-caching App Shell ทั้งหมด (HTML, CSS, JS, SVG)
- **FR-8.3**: รองรับการติดตั้งแบบ Standalone App (ปุ่ม "ติดตั้งแอป" ผ่านอีเวนต์ `beforeinstallprompt`)
- **FR-8.4**: มี Offline State Indicator ที่หัวเว็บตรวจจับการเชื่อมต่อแบบเรียลไทม์

### FR-9: Power-User Keyboard Navigation
- **FR-9.1**: คีย์ลัดสำหรับการทำงานรวดเร็ว:
  - `/` : โฟกัสช่องค้นหา Catalog
  - `t` : โฟกัสช่อง Target Launcher
  - `c` : เลื่อนหน้าจอไปยัง Catalog
  - `s` : เลื่อนหน้าจอไปยัง Presets
  - `p` : เลื่อนหน้าจอไปยัง Triage Playbooks
  - `?` : เปิด Modal แสดงรายการคีย์ลัดทั้งหมด
- **FR-9.2**: คีย์ลัดต้องไม่ทำงานขณะที่ Focus อยู่ใน Form Input / Textarea

---

## 5. ข้อกำหนดที่ไม่ใช่เชิงฟังก์ชัน (Non-Functional Requirements - NFR)

| หมวดหมู่ | ข้อกำหนดทางเทคนิค |
|---|---|
| **NFR-1: Zero-Dependency** | ห้ามใช้ Framework หรือ Library ภายนอก (No React, No Vue, No Tailwind, No Bootstrap, No jQuery) โค้ดทั้งหมดต้องเป็น Vanilla HTML/CSS/JS |
| **NFR-2: file:// Compatibility** | ต้องเปิดไฟล์ `index.html` ตรง ๆ จาก File Explorer ได้ทันที โดยไม่มี CORS Error, Origin Error, หรือ Syntax Failure |
| **NFR-3: Zero Console Output** | ห้ามมีข้อความ `console.log`, `console.warn`, `console.error` ในระหว่างการใช้งานปกติ เพื่อคงความสะอาดของ Console 100% |
| **NFR-4: Performance Budget** | First Contentful Paint (FCP) < 300ms เมื่อรันบนเครื่องทั่วไป ขนาดไฟล์รวมทั้งหมด (Uncompressed) < 200 KB |
| **NFR-5: Accessibility (a11y)** | รองรับ WCAG 2.1 Level AA, มี `:focus-visible` ทุกจุด, Color Contrast ขั้นต่ำ 4.5:1 สำหรับข้อความทั่วไป และ 3:1 สำหรับข้อความขนาดใหญ่ |
| **NFR-6: Motion Safety** | เคารพการตั้งค่า `prefers-reduced-motion: reduce` ของระบบปฏิบัติการ โดยปิด Transition และ Background Animation อัตโนมัติ |

---

## 6. ตัวชี้วัดความสำเร็จ (Success Metrics & KPIs)

1. **Mean Time to Triage (MTTT)**: ลดเวลาในการค้นหาและเลือกลำดับเครื่องมือตรวจสอบจากเฉลี่ย 5–10 นาที เหลือต่ำกว่า 30 วินาที
2. **Platform Reliability**: ผ่าน Automated Smoke Test (`tests/data.test.js`) 100% ครบทุก Rule (ความสมบูรณ์ของ Data, Version ตรงกัน 3 จุด, ไฟล์ใน App Shell มีอยู่จริง)
3. **Evidence Completeness**: เจ้าหน้าที่ NOC ส่งมอบ Evidence ครบทั้ง Control Plane และ Data Plane ใน Incident Ticket ไม่น้อยกว่า 95% ของเคส
