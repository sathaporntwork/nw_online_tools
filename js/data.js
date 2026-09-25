/*
 * NetOps Toolkit — Data Layer (js/data.js)
 * เครื่องมือ Network Diagnostics ทั้งหมดฝังอยู่ในไฟล์นี้ — ไม่มี fetch/XHR/JSON ภายนอก
 * เพิ่มเครื่องมือใหม่ = เพิ่ม object ใน `tools` (สคีมาดู README.md)
 * fields:
 *   id, name, url, cat[] (หมวดหลัก cat[0] + หมวดรอง), sym[] (อาการที่ใช้ตรวจ)
 *   ip: "dual" | "v4", access: "web" | "web+api" | "cli", price: "free" | "freemium"
 *   keys: คำค้นเสริม (อังกฤษ), desc/when/how (ไทย), good[]/bad[], related[]
 *   tpl: deep-link template ({t} = target), tplTypes: ชนิดของ target ที่รองรับ
 *   sample: ตัวอย่างคำสั่ง (เครื่องมือ CLI)
 */
window.NT_DATA = (function () {
  'use strict';

  var categories = [
    { id: 'multi',  name: 'Multi-location & Latency',      desc: 'ตรวจวัดจากหลายประเทศ / ASN พร้อมกัน',                    icon: 'globe'  },
    { id: 'bgp',    name: 'BGP / Routing / ASN',           desc: 'Control plane — origin, RPKI, AS path, routing history',    icon: 'route'  },
    { id: 'outage', name: 'Outage & Internet Health',      desc: 'สถานการณ์ outage, traffic และ routing ระดับประเทศ',        icon: 'radar'  },
    { id: 'dns',    name: 'DNS & DNSSEC',                  desc: 'Resolution, propagation, delegation และ DNSSEC chain',      icon: 'dns'    },
    { id: 'http',   name: 'HTTP / TLS / Web Perf',         desc: 'เว็บเข้าได้ไหม ช้าตรงไหน TLS ถูกต้องไหม',                  icon: 'lock'    },
    { id: 'cli',    name: 'Local CLI & Packet Analysis',   desc: 'รันบน server/เครื่องเอง ได้หลักฐานระดับ packet/session',   icon: 'term'    },
    { id: 'ix',     name: 'IX / Peering',                   desc: 'Looking glass ระดับ IX, ข้อมูล peering และ IXP directory ภูมิภาค', icon: 'pin' }
  ];

  var symptoms = [
    {
      id: 'web-block',
      name: 'เข้าเว็บ/ปลายทางไม่ได้ เฉพาะบางเครือข่าย',
      short: 'HTTP fail เฉพาะบางที่',
      icon: 'globe',
      flow: [
        { tag: 'ขั้นที่ 1', text: 'รัน HTTP + MTR จากหลายประเทศ/ASN บน target เดียวกัน (Globalping)' },
        { tag: 'แยกทาง',   text: 'HTTP 200 ทุกที่ → ปัญหาอยู่ที่ผู้ใช้รายเดียว · ล้มเฉพาะบางประเทศ → geo-block/CDN rule · ล้มทุกที่ → origin/DNS/TLS' },
        { tag: 'ขั้นสุดท้าย', text: 'ยืนยันด้วย DNS + TLS check แล้วสรุปหลัก evidence เป็น URL/ผลลัพธ์ พร้อมส่ง Provider' }
      ],
      steps: [
        { tool: 'globalping',   action: 'รัน `http` จาก TH/SG/HK และ `mtr` ต่อ target เดียวกัน ดู status code กับ hop ที่ขาด' },
        { tool: 'bgp-tools',    action: 'เช็ค origin ASN และสถานะ RPKI ของ prefix ปลายทางว่าเปลี่ยนหรือ invalid' },
        { tool: 'dnschecker',   action: 'เทียบค่า A/AAAA จาก resolver หลายประเทศว่าชี้ไป IP เดียวกัน' },
        { tool: 'ssllabs',      action: 'ถ้าค้างที่ handshake ให้ตรวจ certificate chain/cipher ด้วย SSL Labs' }
      ],
      note: 'ถ้า HTTP ล้มเฉพาะบางภูมิภาค ให้สงสัย geo-blocking/CDN rule ก่อน อย่าเพิ่งสรุปว่า origin ล่ม'
    },
    {
      id: 'latency',
      name: 'Latency / Packet loss สูง',
      short: 'ดีเลย์หรือ loss สูงผิดปกติ',
      icon: 'pulse',
      flow: [
        { tag: 'ขั้นที่ 1',    text: 'MTR จากมุมผู้ใช้จริง + เทียบ probe ต่าง ASN/ประเทศ (Globalping)' },
        { tag: 'แยกทาง',      text: 'loss ที่ hop เดียวกันทุกจุด → transit/peer ปลายทาง · loss เฉพาะ ISP ใด ISP หนึ่ง → ปัญหาในเครือข่ายนั้น' },
        { tag: 'ขั้นสุดท้าย', text: 'เทียบ AS path ปัจจุบันกับอดีตว่ามี path change ช่วงเกิดเหตุหรือไม่ (BGP.Tools + BGPlay)' }
      ],
      steps: [
        { tool: 'globalping', action: 'รัน `mtr` จาก AIS, True, AWS และ SG/HK เพื่อดูว่า loss เกิดที่ hop ไหนของใคร' },
        { tool: 'mtr',        action: 'รัน `mtr -4 -zw <target>` จาก server ในระบบ เพื่อเก็บ baseline ของ path จริง' },
        { tool: 'bgp-tools',  action: 'ดู AS path ปัจจุบันและ origin ของ prefix ปลายทาง ว่ามีอะไรเปลี่ยนไหม' },
        { tool: 'ripestat',   action: 'เปิด BGPlay ย้อนหลังช่วงเกิดเหตุ ดูว่า route เคยเปลี่ยน/หายหรือไม่' }
      ],
      note: 'อย่าใช้ AS_PATH แทน traceroute — BGP path เป็นข้อมูลนโยบาย ไม่ใช่เส้นทาง packet จริง'
    },
    {
      id: 'game',
      name: 'เกม / Realtime lag หรือ jitter',
      short: 'เล่นเกมกระตุก / ping สูง',
      icon: 'bolt',
      flow: [
        { tag: 'ขั้นที่ 1',    text: 'TCP/UDP ping ไปยัง port จริงของ game server (tcping)' },
        { tag: 'แยกทาง',      text: 'RTT สูงทุกจุด → route ปลายทาง/interconnect · jitter/loss เป็นบางช่วง → congestion ตามช่วงเวลา' },
        { tag: 'ขั้นสุดท้าย', text: 'ถ้าสงสัย retrans/MTU ให้ capture packet จริงมาดู (Wireshark/tshark)' }
      ],
      steps: [
        { tool: 'tcping',     action: 'วัด latency ไป port จริงของเกมด้วย `tcping <game-host> <port>` (ไม่ใช่แค่ ping ไอซีเอ็มพี)' },
        { tool: 'globalping', action: 'รัน `mtr` จาก TH/SG/JP เทียบว่า path ต่างประเทศช่วงไหนหนักกว่า' },
        { tool: 'mtr',        action: 'รันจากเครื่องผู้เล่น/เซิร์ฟเวอร์ในประเทศ ดู loss ราย hop ด้วย `mtr -u` ถ้าเป็น UDP' },
        { tool: 'wireshark',  action: 'capture ช่วงที่ lag แล้วเช็ค retransmission, duplicate ACK และ MTU blackhole' }
      ],
      note: 'เกมส่วนใหญ่ใช้ UDP — ICMP อาจถูก rate-limit ระหว่างทาง จึงต้องยืนยันด้วย TCP/UDP path ประกอบ'
    },
    {
      id: 'bgp',
      name: 'สงสัย route leak / hijack / RPKI invalid',
      short: 'Route ผิดปกติ / origin เปลี่ยน',
      icon: 'route',
      flow: [
        { tag: 'ขั้นที่ 1',    text: 'เช็ค origin ASN + RPKI state ของ prefix (BGP.Tools)' },
        { tag: 'แยกทาง',      text: 'Origin ผิดปกติ → สงสัย hijack · path ผ่าน AS ที่ไม่ควรอยู่ → สงสัย route leak · RPKI invalid → ประกาศไม่ถูกต้อง' },
        { tag: 'ขั้นสุดท้าย', text: 'ดูประวัติ announcement/withdrawal ย้อนหลังเพื่อระบุช่วงเวลา (BGPlay / RouteViews)' }
      ],
      steps: [
        { tool: 'bgp-tools',        action: 'กรอก prefix/ASN ดู origin, AS path และสถานะ RPKI (valid/invalid/not-found)' },
        { tool: 'ripestat',         action: 'เปิด routing history/BGPlay ดูช่วงเวลาที่ origin หรือ path เปลี่ยน' },
        { tool: 'cloudflare-radar', action: 'ดู RPKI anomalies และ outage ระดับประเทศ/ASN ว่าเกิดเป็นวงกว้างหรือไม่' },
        { tool: 'looking-house',    action: 'สั่ง show route/ping/traceroute ผ่าน looking glass ของ ISP ตัวสงสัยว่าเห็น path ไหน' },
        { tool: 'routeviews',       action: 'Deep: ดาวน์โหลด RIB/Update MRT ช่วงเกิดเหตุมาวิเคราะห์ด้วย bgpdump/BGPStream' }
      ],
      note: 'รวบรวมหลักฐานทั้ง control-plane (BGP) และ data-plane (traceroute) ก่อนแจ้ง provider — อย่าฟันธงจาก AS_PATH อย่างเดียว'
    },
    {
      id: 'dns-issues',
      name: 'DNS ไม่ resolve / ค่าไม่ตรง / เพิ่งเปลี่ยน record',
      short: 'Resolution ผิดหรือ propagation ยังไม่ครบ',
      icon: 'dns',
      flow: [
        { tag: 'ขั้นที่ 1',    text: 'เช็ค propagation จาก resolver หลายประเทศ (DNSChecker)' },
        { tag: 'แยกทาง',      text: 'ค่าต่างกัน → กำลัง propagate/TTL ยังไม่หมด · ค่าเดียวกันแต่ผิด → config ผิด · บางเครือข่าย fail → delegation/DNSSEC' },
        { tag: 'ขั้นสุดท้าย', text: 'ตรวจ DNSSEC chain + authoritative health แล้ว dig ตรง authoritative เพื่อยืนยัน' }
      ],
      steps: [
        { tool: 'dnschecker', action: 'เช็ค A/AAAA/CNAME/NS จาก resolver หลายประเทศ ดูว่าค่าตรงกันไหมหลังแก้ record' },
        { tool: 'dnsviz',     action: 'ตรวจ DNSSEC chain, DS/DNSKEY และ delegation ว่า broken จุดไหน (ดูเป็นกราฟ)' },
        { tool: 'intodns',    action: 'รัน health check ของ authoritative DNS — delegation, glue, SOA, NS consistency, serial' },
        { tool: 'dig',        action: 'Query ตรง authoritative ด้วย `dig +norec example.com NS @ns1.example.com` เพื่อแยก propagation ออกจาก config' }
      ],
      note: 'ถ้า resolver บางตัว fail ให้ dig ตรง authoritative เพื่อแยกปัญหา propagation ออกจากปัญหา config'
    },
    {
      id: 'tls',
      name: 'HTTPS error / certificate ไม่ trust',
      short: 'TLS handshake ล้มเหลว',
      icon: 'lock',
      flow: [
        { tag: 'ขั้นที่ 1',    text: 'รัน SSL Server Test ดู grade, chain, protocol, cipher (SSL Labs)' },
        { tag: 'แยกทาง',      text: 'chain ไม่ครบ/หมดอายุ → ออก certificate ใหม่ · เฉพาะ client บางรุ่น → cipher/TLS version ไม่รองรับ' },
        { tag: 'ขั้นสุดท้าย', text: 'ยืนยัน handshake จริงด้วย openssl s_client และดู response จริงด้วย curl -v' }
      ],
      steps: [
        { tool: 'ssllabs',  action: 'รัน full test แล้วดู chain, protocol version, cipher และ configuration issue ที่แนะนำ' },
        { tool: 'openssl',  action: 'เช็ค certificate จริงกับ `openssl s_client -connect host:443 -servername host` ดู expiry กับ SAN' },
        { tool: 'curl',     action: 'ดู HTTP/TLS จริงด้วย `curl -sSvo /dev/null https://host/` เพื่อจับ redirect, error code และ hsts' },
        { tool: 'netforge', action: 'เช็ค SSL/TLS และ blacklist แบบด่วนจากหลาย probe ประกอบก่อนสรุป' }
      ],
      note: 'แยก server config ออกจาก client compatibility — ถ้าล้มเฉพาะอุปกรณ์บางรุ่น ให้ลอง cipher/protocol ด้วย openssl บน client นั้น'
    },
    {
      id: 'slow',
      name: 'เว็บโหลดช้า (TTFB / content)',
      short: 'Perception ช้า ไม่ใช่เข้าไม่ได้',
      icon: 'gauge',
      flow: [
        { tag: 'ขั้นที่ 1',    text: 'รัน waterfall เพื่อแยกเวลา DNS → TCP → TLS → TTFB → download (WebPageTest)' },
        { tag: 'แยกทาง',      text: 'TTFB สูงทุกจุด → origin · สูงเฉพาะบางภูมิภาค → routing/CDN edge · DNS ช้า → resolver/records' },
        { tag: 'ขั้นสุดท้าย', text: 'ยืนยันด้วย latency test หลาย location และ MTR เข้า origin' }
      ],
      steps: [
        { tool: 'webpagetest',    action: 'ดู waterfall ว่ากินเวลาไปที่ phase ไหน (DNS/TCP/TLS/TTFB/download) แยกจากกันชัดเจน' },
        { tool: 'globalping-net', action: 'เทียบ DNS/TCP/SSL/TTFB/download timing แบบ multi-node ว่าภูมิภาคไหนหนักกว่า' },
        { tool: 'bunny-tools',    action: 'รัน latency/HTTP test จากกว่า 120 locations ดูว่า edge ที่ไหนเข้า origin ไม่ได้' },
        { tool: 'mtr',            action: 'MTR จาก edge เข้า origin ถ้า TTFB สูง เพื่อดู hop ที่เพิ่ม latency ระหว่างทาง' }
      ],
      note: 'TTFB สูงเฉพาะบางภูมิภาค = ปัญหา routing/CDN — ถ้าสูงทุกจุดค่อยสงสัย origin'
    },
    {
      id: 'ipv6',
      name: 'ปัญหาเฉพาะ IPv6 (v4 ปกติ ใช้ v6 ไม่ได้)',
      short: 'Dual-stack พังฝั่ง v6',
      icon: 'layers',
      flow: [
        { tag: 'ขั้นที่ 1',    text: 'รัน ping/traceroute แยก -4 / -6 บน target เดียวกัน (Globalping)' },
        { tag: 'แยกทาง',      text: 'v6 resolve ไม่ได้ → DNS AAAA · resolve ได้แต่ fail → routing/next-hop · ใช้ได้บางที่ → partial transit' },
        { tag: 'ขั้นสุดท้าย', text: 'เช็ค prefix ประกาศใน IPv6 table + RPKI แล้วทดสอบ path จริงด้วย mtr -6' }
      ],
      steps: [
        { tool: 'globalping', action: 'รัน `ping`/`mtr` แยก probe ที่รองรับ -4 และ -6 เทียบผลคู่กัน' },
        { tool: 'dnschecker', action: 'เช็คค่า AAAA ว่ามีและชี้ถูกต้อง เทียบระหว่าง resolver หลายประเทศ' },
        { tool: 'bgp-tools',  action: 'ดูว่า IPv6 prefix ถูกประกาศใน routing table และสถานะ RPKI เป็นอย่างไร' },
        { tool: 'mtr',        action: 'รัน `mtr -6 <target>` เพื่อดู path จริงและเช็ค MTU/fragmentation ของ v6' }
      ],
      note: 'อย่าลืม Happy Eyeballs — บาง client เลือก v6 แล้ว fallback ช้า อาการจะออกมาเป็น “ช้า” ไม่ใช่ “เข้าไม่ได้”'
    },
    {
      id: 'th-routing',
      name: 'Cross-ISP ไทย (AIS/3BB/True) ช้าหรือหลุดเฉพาะบางเครือข่าย',
      short: 'ปัญหา peering ระหว่าง ISP ไทย',
      icon: 'route',
      flow: [
        { tag: 'ขั้นที่ 1',    text: 'MTR จาก probe ตาม ASN ของผู้ใช้จริง (Globalping: `TH, AIS`, `TH, True`) เทียบกับ probe ASN อื่นในประเทศ' },
        { tag: 'แยกทาง',      text: 'พังเฉพาะ ASN ใด ASN หนึ่ง → peering/transit คู่นั้น · พังจากทุก ASN ไทย → เครือข่ายเรา/IX · ที่ต่างชาติปกติหมด → ปัญหา domestic peering ชัดเจน' },
        { tag: 'ขั้นสุดท้าย', text: 'ดู AS path จากมุม ISP คู่เซียนด้วย looking glass + เช็ค PeeringDB ว่าสองฝั่งต่อ IX ร่วมกันที่ไหน (เช่น BBIX, AMS-IX Thailand, THIX)' }
      ],
      steps: [
        { tool: 'globalping',    action: 'รัน `mtr` จาก probe ราย ASN ผู้ให้บริการไทย (AIS/3BB/True/NT) เทียบกัน — ดูว่า loss/latency เกิดเฉพาะ ASN ไหนและขาดที่ hop ไหน' },
        { tool: 'mtr',           action: 'รันจาก VM จำลองผู้ใช้ในระบบ `mtr -4 -zw --aslookup <target>` เก็บ AS path จริงไว้เทียบกับผลจาก probe ภายนอก' },
        { tool: 'looking-house', action: 'ค้น looking glass ของผู้ให้บริการคู่เซียนจาก directory แล้วสั่ง show route + traceroute จากมุมของเขา — เห็น path ตรงกับ traceroute ของเราไหม' },
        { tool: 'peeringdb',     action: 'เช็ค peering policy และ IX ที่ทั้งสองฝั่งต่ออยู่ร่วมกัน ว่า traffic ควรวิ่งผ่าน IX ในประเทศหรือตกไป transit ต่างชาติ' },
        { tool: 'bgp-tools',     action: 'ดู AS path ปัจจุบัน + ประวัติ path change ช่วงเกิดเหตุ ว่าเพิ่งเปลี่ยน transit/prepend ผิดปกติหรือไม่' }
      ],
      note: 'เก็บหลักฐาน traceroute สองมุม (เรา→เขา และ เขา→เรา ผ่าน LG) ก่อนแจ้งทีม peering คู่เซียน — ASN ของผู้ให้บริการไทยเปลี่ยน/แยกบริษัทบ่อย ให้เช็ค ASN ล่าสุดที่ PeeringDB หรือ BGP.Tools ทุกครั้ง'
    },
    {
      id: 'intl-link',
      name: 'ต่างประเทศช้า/หลุด ในประเทศปกติ (สงสัย International Link)',
      short: 'International gateway / submarine cable',
      icon: 'globe',
      flow: [
        { tag: 'ขั้นที่ 1',    text: 'แยก domestic vs international — MTR จาก probe ไทยไป target ในประเทศ เทียบกับ target ต่างประเทศ (Globalping)' },
        { tag: 'แยกทาง',      text: 'ในประเทศดี ต่างชาติพังทุกทิศ → gateway/transit congestion · พังเฉพาะทิศ (เช่น EU/US ผ่าน SMW) → submarine cable หรือ route ทิศนั้น · ทุก ASN ไทยพังเหมือนกัน → cable cut วงกว้าง' },
        { tag: 'ขั้นสุดท้าย', text: 'ยืนยันจากมุม gateway ผ่าน looking glass + Cloudflare Radar ดู traffic ระดับประเทศ และดูประวัติ route failover ย้อนหลัง' }
      ],
      steps: [
        { tool: 'globalping',      action: 'รัน `mtr` จาก `TH` ไปยังปลายทางหลายทิศ (SG/JP/US/EU) และ target ในประเทศ — ดูว่า latency ดีดที่ hop ออกประเทศ (gateway) หรือกลางทะเล' },
        { tool: 'cloudflare-radar', action: 'ดู Internet Quality/Traffic ของ TH ช่วงเกิดเหตุ — ถ้าดิ่งทั้งประเทศ = ปัญหา cable/gateway วงกว้าง ไม่ใช่เครือข่ายเรารายเดียว' },
        { tool: 'looking-house',   action: 'ค้น looking glass ของ CAT Telecom (AS9930), National Telecom (NT) หรือ upstream ต่างชาติที่เกี่ยว แล้วสั่ง show route + traceroute จากมุม gateway' },
        { tool: 'ripestat',        action: 'เปิด BGPlay ดูว่า prefix ปลายทางมี path เปลี่ยน/failover ช่วงเกิดเหตุไหม — cable cut มัก trigger failover ให้เห็นชัด' },
        { tool: 'tcping',          action: 'วัด RTT ไป port จริงของบริการต่างประเทศซ้ำตามช่วงเวลา เก็บ baseline — อาการที่พุ่งเฉพาะ peak hours = congestion ไม่ใช่ cable cut' }
      ],
      note: 'แยก congestion ตามช่วงเวลาออกจาก cable cut ด้วยกราฟรายชั่วโมงเสมอ — เก็บกราฟช่วงเกิดเหตุไว้เป็นหลักฐานประกอบการแจ้ง provider หรือขอเพิ่ม international bandwidth'
    },
    {
      id: 'wide-outage',
      name: 'เน็ตดับเป็นวงกว้างทั้ง POP/ย่าน (Wide-area outage)',
      short: 'Outage วงกว้าง — ลูกค้าหายทั้งโซน',
      icon: 'radar',
      flow: [
        { tag: 'ขั้นที่ 1',    text: 'ยืนยันก่อนว่าเป็น outage วงกว้างจริง — Cloudflare Radar ดู traffic ระดับประเทศ/ASN + RIPE Atlas ยิง probe หลายจุดพร้อมกัน' },
        { tag: 'แยกทาง',      text: 'ดิ่งทั้งประเทศ/หลาย ASN → cable/gateway ใหญ่ · ดิ่งเฉพาะ ASN ตัวเองหรือ POP เดียว → ปัญหาในระบบ · ล้มเฉพาะบางย่าน/บาง ISP → peering/transit เฉพาะคู่' },
        { tag: 'ขั้นสุดท้าย', text: 'ลงลึกราย upstream/IX ด้วย looking glass + ประวัติ BGP แล้วสรุป scope (ASN/พื้นที่/ช่วงเวลา) เพื่อแจ้ง incident และ provider' }
      ],
      steps: [
        { tool: 'cloudflare-radar', action: 'เปิด Outage Center/กราฟ Traffic ของ TH — ดูว่า traffic ดิ่งระดับประเทศหรือ ASN ใด และช่วงเวลาเริ่มเหตุตรงกับรายงานลูกค้าไหม' },
        { tool: 'ripe-atlas',       action: 'ยิง ping/traceroute (หรือ DNS เป็น fallback) จาก probe ในประเทศหลายจุดและหลาย ASN เทียบกัน — ล้มทั้งพื้นที่หรือเฉพาะบางเครือข่าย' },
        { tool: 'globalping',       action: 'รัน `mtr`/`http` จาก TH และประเทศเพื่อนบ้าน แยกว่าเส้นทางในประเทศกับต่างประเทศเดินปกติที่ช่วงไหน' },
        { tool: 'looking-house',    action: 'ลงลึกรายตัว — สั่ง show route/traceroute จาก LG ของ upstream และ IX ที่เกี่ยว (CAT/NT/upstream ต่างชาติ/IX ในประเทศ) ดูมุมมองของแต่ละเจ้า' },
        { tool: 'bgp-tools',        action: 'เช็ค withdrawal/mass route change ของ ASN เราหรือ upstream ช่วงเกิดเหตุ พร้อมสถานะ RPKI — ใช้ยืนยันสาเหตุร่วมกับ data plane' }
      ],
      note: 'เก็บ timeline และ scope การดับ (ASN/พื้นที่/ช่วงเวลา) ตั้งแต่ต้นเหตุ — ใช้ทำ post-incident report และแนบแจ้ง provider · ถ้าสงสัยเฉพาะ POP เดียว ให้เทียบ monitoring ภายในก่อนสรุปว่าเป็น outage วงกว้าง'
    }
  ];

  var presets = [
    {
      id: 'quick',
      eyebrow: 'เริ่มต้น',
      name: 'Quick investigation',
      desc: 'เริ่มจาก complaint ทั่วไป — รันได้ในไม่กี่นาที ไม่ต้องติดตั้งอะไรเพิ่ม',
      tools: ['globalping', 'bgp-tools', 'ripestat', 'dnschecker', 'dnsviz', 'ssllabs', 'cloudflare-radar', 'bunny-tools']
    },
    {
      id: 'th',
      eyebrow: 'สายไทย',
      name: 'Thai peering & intl link',
      desc: 'เคสเฉพาะทางไทย — cross-ISP (AIS/3BB/True) และสงสัย international link — ครอบคลุม playbook ทั้งสองอาการ',
      tools: ['globalping', 'looking-house', 'pch-lg', 'peeringdb', 'thix-pdb', 'bgp-tools', 'cloudflare-radar', 'mtr']
    },
    {
      id: 'deep',
      eyebrow: 'เชิงลึก',
      name: 'Deep investigation',
      desc: 'เก็บหลักฐานเชิงลึก — historical BGP, controlled measurement, packet/session level',
      tools: ['ripe-atlas', 'routeviews', 'peeringdb', 'wireshark', 'zeek', 'arkime', 'mtr', 'dig', 'curl']
    }
  ];

  var tools = [
    {
      id: 'globalping',
      name: 'Globalping',
      url: 'https://globalping.io',
      tpl: 'https://globalping.io?host={t}',
      tplTypes: ['domain', 'ipv4', 'ipv6'],
      cat: ['multi'],
      sym: ['web-block', 'latency', 'game', 'dns-issues', 'ipv6', 'wide-outage'],
      ip: 'dual',
      access: 'web+api',
      price: 'free',
      keys: 'ping traceroute mtr dns http curl multi location probe asn cloud',
      desc: 'รัน Ping, Traceroute, MTR, DNS resolve และ HTTP จาก probe ทั่วโลก เลือกได้ตามประเทศ เมือง ASN หรือ cloud provider พร้อม API, CLI และ Slack integration',
      when: 'จุดเริ่มต้นของทุก investigation ที่สงสัยว่าปัญหาเกิดเฉพาะบางเครือข่าย เช่น ลูกค้า AIS/True เข้าไม่ได้แต่ที่อื่นปกติ',
      how: 'กรอก target แล้วเลือก location เช่น `TH, AIS`, `SG` หรือ `aws` ตามด้วยคำสั่ง Ping/MTR/HTTP แล้วรันพร้อมกันหลายจุด',
      good: ['เลือก probe ตามประเทศ/เมือง/ASN/cloud ได้ละเอียด', 'มี API, CLI และ Slack app ใช้ทำ automation', 'ใช้ฟรีไม่ต้องสมัครสมาชิก'],
      bad: ['มี rate limit ตามโควตา (ลงทะเบียนเพื่อเพิ่ม limit)', 'probe ไม่ใช่ผู้ใช้จริงทุกราย — ใช้ประกอบกับ mtr ในระบบ'],
      related: ['ripe-atlas', 'bunny-tools', 'check-host']
    },
    {
      id: 'ripe-atlas',
      name: 'RIPE Atlas',
      url: 'https://atlas.ripe.net',
      cat: ['multi'],
      sym: ['web-block', 'latency', 'bgp', 'wide-outage'],
      ip: 'dual',
      access: 'web+api',
      price: 'freemium',
      keys: 'ripe atlas probe anchor measurement credit api historical baseline',
      desc: 'เครือข่าย probe/anchor ทั่วโลกสำหรับ active measurement — ping, traceroute, DNS และ HTTP แบบ custom เก็บผลไว้เปรียบเทียบย้อนหลังได้',
      when: 'งาน investigation ที่ต้องการหลักฐานต่อเนื่อง baseline หรือ controlled measurement มากกว่า one-shot test',
      how: 'สร้าง measurement เลือก probe ตามประเทศ/ASN แล้วเก็บผลผ่าน API เพื่อเปรียบเทียบช่วงก่อน-หลังเกิดเหตุ',
      good: ['probe หลายพันจุดทั่วโลก เลือกตาม ASN/ประเทศได้', 'เก็บผลย้อนหลัง ใช้ทำ baseline ของ prefix สำคัญ', 'มี API ครบใช้ทำ automation'],
      bad: ['custom measurement ต้องใช้ credits (สะสมหรือซื้อ)', 'ไม่เร็วเท่า Globalping สำหรับ one-shot test'],
      related: ['globalping', 'ripestat', 'routeviews']
    },
    {
      id: 'pingpe',
      name: 'Ping.pe',
      url: 'https://ping.pe',
      tpl: 'https://ping.pe/{t}',
      tplTypes: ['domain', 'ipv4'],
      cat: ['multi'],
      sym: ['latency', 'web-block', 'th-routing'],
      ip: 'v4',
      access: 'web',
      price: 'free',
      keys: 'ping tcp ping traceroute mtr multi node quick',
      desc: 'Multi-node Ping, TCP Ping, Traceroute และ MTR แบบเปิดหน้าเว็บแล้วใช้ได้ทันที ไม่ต้อง login',
      when: 'อยากเห็นภาพ latency/traceroute จากหลายทวีปแบบด่วน ๆ เพื่อยืนยันว่าปัญหาไม่ได้เกิดจาก ISP local เพียงเจ้าเดียว',
      how: 'พิมพ์ target แล้วดูผลพร้อมกันจากทุก node หรือเปิดผ่าน deep-link จาก Target Launcher',
      good: ['ใช้ได้ทันทีไม่ต้องสมัคร', 'สรุปผล multi-node ในหน้าเดียว'],
      bad: ['เลือก node ไม่ละเอียดเท่า Globalping (ไม่ระบุ ASN)', 'มีข้อจำกัดการใช้งาน/โฆษณาบนหน้า'],
      related: ['globalping', 'check-host']
    },
    {
      id: 'check-host',
      name: 'Check-Host',
      url: 'https://check-host.net',
      tpl: 'https://check-host.net/check-ping?host={t}',
      tplTypes: ['domain', 'ipv4', 'ipv6'],
      cat: ['multi'],
      sym: ['web-block', 'latency', 'th-routing', 'intl-link', 'wide-outage'],
      ip: 'dual',
      access: 'web',
      price: 'free',
      keys: 'ping tcp port dns http availability history check host',
      desc: 'ตรวจ Ping, TCP port, DNS และ HTTP จากหลายประเทศ พร้อม history แบบกราฟดูได้ย้อนหลัง',
      when: 'ตอนต้องการคำตอบเร็วว่า target เข้าได้จากประเทศใดบ้าง และอยากดูประวัติว่าเคยล่มช่วงไหน',
      how: 'เลือกชนิด check (ping/tcp/http/dns) แล้วกรอก target ดูผลจากหลายประเทศพร้อม history',
      good: ['ตอบเร็ว เหมาะกับ triage ขั้นแรก', 'มี history/กราฟเปรียบเทียบย้อนหลัง'],
      bad: ['ไม่มี MTR รายประเทศลึก ๆ', 'ตัวเลือก location น้อยกว่า Globalping'],
      related: ['globalping', 'pingpe']
    },
    {
      id: 'looking-house',
      name: 'Looking.house',
      url: 'https://looking.house/looking-glass',
      cat: ['multi', 'bgp'],
      sym: ['bgp', 'latency', 'web-block', 'th-routing', 'intl-link', 'wide-outage'],
      ip: 'v4',
      access: 'web',
      price: 'free',
      keys: 'looking glass lg show route bgp provider directory asn traceroute',
      desc: 'Directory รวม public looking glass จากผู้ให้บริการหลายราย (163 จุด จาก 87 providers) ใช้สั่ง ping/traceroute/show route ในมุมมองของ ASN นั้น',
      when: 'MTR หรือ BGP path ชี้ว่าปัญหาอยู่ระหว่าง ISP/transit/peer แล้วต้องการดู route จากมุมมองของ ISP ตัวสงสัย',
      how: 'ค้นหา provider/ASN ที่ต้องการแล้วสั่ง show route หรือ traceroute จาก looking glass ของเครือข่ายนั้นโดยตรง',
      good: ['เห็น control plane ของ ISP จริง ไม่ใช่การคาดเดา', 'ครอบคลุมหลาย provider ที่ไม่ได้เปิด LG เป็นสาธารณะ'],
      bad: ['ขึ้นกับ network ที่เปิดให้ใช้งาน จึงครอบคลุมไม่ทั่วถึงทุก ASN', 'คำสั่งและ output แต่ละเจ้าไม่เหมือนกัน'],
      related: ['bgp-tools', 'bgp-he', 'peeringdb']
    },
    {
      id: 'bunny-tools',
      name: 'bunny.net Tools',
      url: 'https://tools.bunny.net',
      cat: ['multi', 'http'],
      sym: ['slow', 'web-block', 'latency', 'intl-link'],
      ip: 'v4',
      access: 'web',
      price: 'free',
      keys: 'bunny latency test http traceroute diagnostic report dns lookup cdn 120 locations',
      desc: 'Global latency, HTTP, traceroute และ diagnostic report จากกว่า 120 locations ของ bunny.net CDN รวม DNS lookup ไว้ในชุดเดียว',
      when: 'สงสัยว่า CDN edge เข้า origin ไม่ได้ หรือต้องการเห็น latency/HTTP จาก edge หลายภูมิภาคแบบเร็ว ๆ',
      how: 'เลือกเครื่องมือ (Latency/HTTP/Traceroute) แล้วกรอก hostname ดูผลสรุปราย location',
      good: ['จำนวน location เยอะ เหมาะเช็ค geo/edge', 'มี diagnostic report สรุปให้อ่านง่าย'],
      bad: ['มาจาก edge ของ bunny.net ไม่ใช่ ISP ปลายทางทุกแห่ง', 'ไม่เลือกราย ASN เหมือน Globalping'],
      related: ['globalping', 'globalping-net']
    },
    {
      id: 'netforge',
      name: 'Netforge',
      url: 'https://netforge.ai/tools',
      cat: ['multi', 'dns', 'http'],
      sym: ['latency', 'dns-issues', 'tls', 'slow'],
      ip: 'dual',
      access: 'web',
      price: 'free',
      keys: 'netforge ping traceroute port check speed test looking glass dns propagation whois rdap ssl blacklist',
      desc: 'ชุด network diagnostic รวมเครื่องมือไว้ในที่เดียว — Ping, Traceroute, port check, speed test, DNS propagation, WHOIS/RDAP, SSL/TLS และ blacklist check',
      when: 'อยากได้คำตอบแบบ quick win หลายด้านพร้อมกันโดยไม่ต้องเปิดหลายเว็บ',
      how: 'เลือกเครื่องมือที่ต้องการจากหน้า tools แล้วกรอก target — probe IPv4/IPv6 รันจากเบราว์เซอร์โดยตรง',
      good: ['รวมเครื่องมือหลายชนิดไว้ที่เดียว', 'probe v4/v6 รันจากเบราว์เซอร์ เห็นว่า network ตัวเองอนุญาตหรือไม่'],
      bad: ['แต่ละเครื่องมือลึกไม่เท่าเครื่องมือเฉพาะทาง', 'เหมาะกับ triage มากกว่าการเก็บหลักฐานขั้นสุดท้าย'],
      related: ['dnschecker', 'bgpglass', 'ssllabs']
    },
    {
      id: 'bgp-tools',
      name: 'BGP.Tools',
      url: 'https://bgp.tools',
      tpl: 'https://bgp.tools/?q={t}',
      tplTypes: ['domain', 'ipv4', 'ipv6', 'asn'],
      cat: ['bgp'],
      sym: ['bgp', 'web-block', 'ipv6', 'wide-outage'],
      ip: 'dual',
      access: 'web',
      price: 'free',
      keys: 'bgp prefix origin asn as path rpki route leak hijack whois routing near real-time',
      desc: 'ตรวจ Prefix, Origin ASN, AS path, RPKI และ routing แบบใกล้ real-time — เหมาะกับจับ route leak, hijack, invalid RPKI และ routing change',
      when: 'สงสัยว่า origin เปลี่ยน path ผิดปกติ หรือ prefix ไม่ผ่าน RPKI validation ซึ่งมักเป็นหัวใจของอาการเข้าไม่ได้/เว็บโดนแย่ง route',
      how: 'กรอก target (domain/IP/ASN) ดู origin, AS path, RPKI state และการเปลี่ยนแปลงล่าสุดของ prefix นั้น',
      good: ['ข้อมูล BGP ใกล้ real-time มากตัวหนึ่ง', 'รองรับการตรวจ RPKI, route leak และ origin เปลี่ยน'],
      bad: ['เป็น control plane ต้องยืนยันด้วย traceroute/MTR แยก', 'ข้อมูลเชิงลึกบางส่วนต้องเปรียบเทียบกับแหล่งอื่น'],
      related: ['ripestat', 'looking-house', 'cloudflare-radar']
    },
    {
      id: 'ripestat',
      name: 'RIPEstat',
      url: 'https://stat.ripe.net',
      tpl: 'https://stat.ripe.net/{t}',
      tplTypes: ['domain', 'ipv4', 'ipv6', 'asn'],
      cat: ['bgp'],
      sym: ['bgp', 'web-block'],
      ip: 'dual',
      access: 'web+api',
      price: 'free',
      keys: 'ripestat bgplay bgp history prefix asn routing registry data api widget looking glass',
      desc: 'วิเคราะห์ Prefix, ASN, BGP history และ resource registry รวมข้อมูลจากหลาย dataset มี BGPlay, Looking Glass widgets และ Data API',
      when: 'ต้องตอบคำถามเชิงเวลา — prefix นี้ประกาศโดย ASN ใด origin เปลี่ยนไหม path เปลี่ยนช่วงไหน เคยหายจาก routing table หรือไม่',
      how: 'กรอก IP/ASN/prefix แล้วเปิด BGPlay หรือ routing history ย้อนดูช่วง announcement/withdrawal',
      good: ['รวมหลาย dataset ในที่เดียว พร้อม API', 'BGPlay ดู route change แบบมีไทม์ไลน์'],
      bad: ['การรวมข้อมูลอาจหลังเวลาจริงเล็กน้อย', 'ควร cross-check กับ BGP.Tools/RouteViews'],
      related: ['bgp-tools', 'routeviews', 'ripe-atlas']
    },
    {
      id: 'bgp-he',
      name: 'Hurricane Electric BGP Toolkit',
      url: 'https://bgp.he.net',
      cat: ['bgp', 'ix'],
      sym: ['bgp', 'ipv6'],
      ip: 'dual',
      access: 'web',
      price: 'free',
      keys: 'he hurricane electric bgp asn announced prefixes peer upstream downstream ix exchange ipv6',
      desc: 'ดู ASN overview, announced prefixes, peer/upstream/downstream, IPv6 connectivity และข้อมูล internet exchange point',
      when: 'ต้องการ second opinion เสริม RIPEstat/BGP.Tools โดยเฉพาะมุม peering relationship และความพร้อมด้าน IPv6 ของ ASN',
      how: 'กรอก ASN ดู prefix ที่ประกาศ, เพื่อนร่วม route, upstream/downstream และรายชื่อ IX ที่เข้าร่วม',
      good: ['ข้อมูล peering/IX ครบ อ่านง่าย', 'เห็น IPv6 readiness ของ ASN ได้เร็ว'],
      bad: ['อัปเดตไม่ real-time เท่า BGP.Tools', 'ใช้เป็น second opinion ไม่ใช่แหล่งเดียวในการสรุป'],
      related: ['bgp-tools', 'peeringdb', 'ripestat']
    },
    {
      id: 'routeviews',
      name: 'RouteViews',
      url: 'https://www.routeviews.org',
      cat: ['bgp'],
      sym: ['bgp'],
      ip: 'dual',
      access: 'web',
      price: 'free',
      keys: 'routeviews rib mrt dump bgp update historical bgpdump bgpstream python collector',
      desc: 'แหล่งเก็บ RIB/MRT และ BGP update สาธารณะ ดาวน์โหลดมาวิเคราะหีย้อนหลังด้วย bgpdump, BGPStream หรือ Python ได้',
      when: 'ต้องพิสูจน์ว่า prefix เคยมี withdrawal, path change หรือ anomalous announcement ช่วงเวลาใดแบบมีหลักฐาน raw',
      how: 'ดาวน์โหลดไฟล์ MRT ช่วงเกิดเหตุแล้ว parse ด้วย bgpdump/BGPStream เพื่อดูทุก update ของ prefix เป้าหมาย',
      good: ['ข้อมูล raw ตรวจสอบได้เอง ใช้เป็นหลักฐานยื่น provider', 'ครอบคลุมหลาย collector ทั่วโลก'],
      bad: ['ต้องประมวลผลเอง ไม่ใช่เว็บดูสำเร็จ', 'เหมาะกับ deep investigation มากกว่าการเช็ครวดเร็ว'],
      related: ['ripestat', 'bgp-tools', 'ripe-atlas']
    },
    {
      id: 'bgpglass',
      name: 'BGP Glass',
      url: 'https://bgpglass.com',
      cat: ['bgp', 'dns'],
      sym: ['bgp', 'dns-issues'],
      ip: 'dual',
      access: 'web',
      price: 'free',
      keys: 'bgp glass looking glass cidr subnet calculator dns lookup ip asn lookup propagation',
      desc: 'Looking glass, CIDR/subnet calculator, DNS lookup และ IP/ASN lookup รวมอยู่ในที่เดียว ใช้ตรวจ propagation และดู route ได้รวดเร็ว',
      when: 'ต้องการเครื่องมือรอบด้านแบบเปิดใช้ทันที — ดู route คำนวณ subnet และเช็ค DNS คู่กันโดยไม่ต้องเปิดหลายเว็บ',
      how: 'ใช้เมนู tools เลือก Looking glass, Subnet calculator หรือ DNS lookup แล้วกรอกค่าที่ต้องการ',
      good: ['รวมหลายเครื่องมือพื้นฐานไว้ในที่เดียว', 'DNS lookup เทียบ resolver สาธารณะเห็นความต่างของ propagation'],
      bad: ['ข้อมูล routing มาจากแหล่งอื่น (เช่น RIPEstat) จึงไม่ใช่ real-time ที่สุด', 'เหมาะกับงานเร็ว ไม่ใช่ investigation ลึก'],
      related: ['bgp-tools', 'dnschecker', 'ripestat']
    },
    {
      id: 'peeringdb',
      name: 'PeeringDB',
      url: 'https://www.peeringdb.com',
      cat: ['bgp', 'ix'],
      sym: ['bgp', 'latency', 'th-routing'],
      ip: 'dual',
      access: 'web+api',
      price: 'free',
      keys: 'peeringdb ix exchange facility datacenter pop peering policy network type api',
      desc: 'ฐานข้อมูลอ้างอิงว่า ASN อยู่ที่ IX ใด มี facility/PoP ที่ไหน peering policy เป็นแบบใด network type อะไร',
      when: 'MTR หรือ BGP path ชี้ว่าปัญหาอาจอยู่ระหว่าง ISP, transit หรือ IX แล้วต้องรู้ว่าคู่กรณีอยู่ตรงไหนของระบบนิเวศ',
      how: 'ค้น ASN/ชื่อ network ดู IX, facility, peering policy และช่องทาง public peering ที่ประกาศไว้',
      good: ['ข้อมูลมาตรฐานอุตสาหกรรม ใช้อ้างอิงได้', 'เชื่อมโยง ASN กับ IX/facility ได้ทันที'],
      bad: ['ข้อมูล self-reported อาจเก่า/ไม่ครบของบาง network', 'ไม่ใช่ข้อมูล routing แบบ real-time'],
      related: ['bgp-he', 'looking-house', 'bgp-tools', 'ixp-tracker']
    },
    {
      id: 'pch-lg',
      name: 'PCH Looking Glass',
      url: 'https://www.pch.net/tools/looking_glass/',
      cat: ['ix'],
      sym: ['bgp', 'th-routing', 'intl-link'],
      ip: 'dual',
      access: 'web',
      price: 'free',
      keys: 'pch packet clearing house looking glass bgp route ixp ping traceroute vantage point',
      desc: 'Looking glass จาก vantage points ของ Packet Clearing House ที่ต่ออยู่กับ IXPs ทั่วโลก สั่ง ping/traceroute/BGP route จากมุม IX แต่ละแห่งได้',
      when: 'ต้องดู route จากมุมของ IX โดยตรง เช่น ยืนยันว่า prefix ของเราถูกมองเห็นจาก IXP ในประเทศ/ภูมิภาค หรือเทียบ path จากหลาย IX พร้อมกัน',
      how: 'เลือก query ตาม IXP/City/AS แล้วสั่ง show route, ping หรือ traceroute จาก vantage point ที่ต่ออยู่กับ IX นั้น',
      good: ['มุมมองจาก IXP จริงทั่วโลก รวม IX ในประเทศไทย', 'สั่งได้ทั้ง ping/traceroute/BGP ในเว็บเดียว', 'ใช้ฟรี ไม่ต้องสมัคร'],
      bad: ['หน้าเว็บเก่ากว่าเครื่องมือยุคใหม่ ต้องเลือก query ทีละจุด', 'ผลขึ้นกับ vantage point ที่ PCH ต่ออยู่ ณ ขณะนั้น'],
      related: ['looking-house', 'bgp-tools', 'decix-lg']
    },
    {
      id: 'decix-lg',
      name: 'DE-CIX GlobePEER Looking Glass',
      url: 'https://www.de-cix.net/en/services/looking-glass',
      cat: ['ix'],
      sym: ['bgp', 'intl-link'],
      ip: 'dual',
      access: 'web',
      price: 'free',
      keys: 'de-cix globepeer looking glass route server asn prefix frankfurt peering lg',
      desc: 'Looking glass ระดับ route server ของ DE-CIX ค้นหา ASN, peer หรือ prefix ที่ประกาศผ่าน route server ของแต่ละ location ได้',
      when: 'สงสัยว่า prefix เราถูก export ผ่าน route server ของ DE-CIX หรือไม่ หรือต้องการดูว่า peer ฝั่งต่างชาติเห็น route เราจาก IX ใด',
      how: 'เข้า LG แล้วค้นด้วย ASN/prefix เลือก location เช่น Frankfurt ดู routes received/imported/exported จาก route server',
      good: ['มาตรฐานระดับ IX ใหญ่สุดในยุโรป ครอบคลุมหลาย location', 'เห็นมุม export/import จาก route server จริง'],
      bad: ['ครอบคลุมเฉพาะเครือข่าย DE-CIX', 'ต้องมี prefix ประกาศอยู่จริงผ่าน RS ถึงจะเห็นผล'],
      related: ['pch-lg', 'bgp-tools', 'peeringdb']
    },
    {
      id: 'ixp-tracker',
      name: 'Internet Society IXP Tracker',
      url: 'https://pulse.internetsociety.org/en/ixp-tracker/',
      cat: ['ix'],
      sym: ['th-routing', 'intl-link'],
      ip: 'v4',
      access: 'web',
      price: 'free',
      keys: 'ixp tracker internet society pulse directory exchange point thailand growth members',
      desc: 'Directory และข้อมูลการเติบโตของ IXP ทั่วโลกจาก Internet Society — รายชื่อ IXP ต่อประเทศ จำนวนสมาชิก และ timeline การพัฒนา',
      when: 'ต้องการภาพรวม IXP ในประเทศ/ภูมิภาค เช่น ไทยมี IX ใด active, ต่างชาติมี IX ทางเลือกใดสำหรับวาง peering แบบ regional',
      how: 'เลือกประเทศเช่น TH แล้วดูรายการ IXP จำนวนสมาชิกและ timeline ของแต่ละแห่ง',
      good: ['ข้อมูลระดับประเทศรวมเร็ว ใช้ตอบคำถามเชิงภูมิภาคได้', 'มี timeline เห็นการเติบโตของ IX ใหม่'],
      bad: ['เป็นข้อมูล directory ไม่ใช่เครื่องมือวัด real-time', 'รายละเอียด peering policy ต้องไปดูต่อที่ PeeringDB'],
      related: ['peeringdb', 'pch-lg', 'thix-pdb']
    },
    {
      id: 'thix-pdb',
      name: 'TH-IX PeeringDB (Thailand IX)',
      url: 'https://www.peeringdb.com/ix/225',
      cat: ['ix'],
      sym: ['th-routing'],
      ip: 'v4',
      access: 'web',
      price: 'free',
      keys: 'th-ix thailand internet exchange peeringdb bangkok ixp member isp',
      desc: 'หน้าข้อมูล TH-IX (Thailand Internet Exchange) บน PeeringDB — รายชื่อ network ที่ต่ออยู่ ช่วง IP peering, policy และช่องทางติดต่อ',
      when: 'เคส Cross-ISP ไทยที่ต้องรู้ว่าใครต่อ TH-IX บ้าง ใช้ IP peering ช่วงไหน และ policy เปิดให้ peering กับเราได้หรือไม่',
      how: 'เปิดหน้า IX ดูรายชื่อ network members, ช่วง IP และ policy ของ IX แล้วข้ามไปหน้า network แต่ละตัวเพื่อดู peering contact',
      good: ['รายชื่อสมาชิกและ policy อัปเดตโดยผู้ใช้จริง', 'เชื่อมต่อข้อมูลกับ ASN แต่ละเจ้าได้ทันที'],
      bad: ['ข้อมูล self-reported จำนวนสมาชิกอาจไม่ครบ', 'เฉพาะ TH-IX — IX อื่นในไทย (BBIX, AMS-IX Bangkok) ต้องค้นแยกใน PeeringDB'],
      related: ['peeringdb', 'ixp-tracker', 'pch-lg']
    },
    {
      id: 'cloudflare-radar',
      name: 'Cloudflare Radar',
      url: 'https://radar.cloudflare.com',
      cat: ['outage', 'bgp'],
      sym: ['bgp', 'web-block', 'slow', 'intl-link', 'wide-outage'],
      ip: 'dual',
      access: 'web',
      price: 'free',
      keys: 'cloudflare radar outage center internet quality traffic anomaly routing rpki mrt explorer protocol trend',
      desc: 'ดู Internet outage, traffic anomaly, routing trend และ protocol adoption ระดับประเทศ/ASN มี Outage Center, Internet Quality, RPKI anomalies และ MRT Explorer',
      when: 'ต้องการตอบเร็วว่าเหตุการณ์ที่เจอเป็นเรื่องเฉพาะเจาะจงของเรา หรือเป็น outage วงกว้างระดับประเทศ/ASN',
      how: 'เปิด Outage Center หรือกราฟคุณภาพอินเทอร์เน็ตตามประเทศ/ASN แล้วเทียบกับช่วงเวลาเกิดเหตุ',
      good: ['มุมภาพรวมระดับประเทศ/ASN จาก traffic จริง', 'มีทั้ง routing, RPKI และ application-layer data'],
      bad: ['เห็นภาพ macro จาก traffic ของ Cloudflare เป็นหลัก', 'ไม่ใช่เครื่องมือตรวจ target เจาะจงรายตัว'],
      related: ['bgp-tools', 'ripestat', 'globalping']
    },
    {
      id: 'dnsviz',
      name: 'DNSViz',
      url: 'https://dnsviz.net',
      tpl: 'https://dnsviz.net/d/{t}/dnssec/',
      tplTypes: ['domain'],
      cat: ['dns'],
      sym: ['dns-issues'],
      ip: 'dual',
      access: 'web',
      price: 'free',
      keys: 'dnsviz dnssec chain delegation ds dnskey analysis graph configuration error',
      desc: 'วิเคราะห์ DNSSEC chain, delegation, DS, DNSKEY และ configuration error ของโดเมนแบบเห็นเป็นกราฟ',
      when: 'DNS resolve ได้จากบาง resolver แต่ fail จากบางเครือข่าย โดยเฉพาะเคสที่สงสัยว่า DNSSEC validation พัง',
      how: 'กรอก domain แล้วดูกราฟ — จุดสีแดง/เหลืองคือ chain ที่ขาดหรือ key ที่ไม่ตรง',
      good: ['เห็นปัญหา DNSSEC ชัดเป็นจุด ๆ', 'บอก delegation/glue ที่ผิดได้ด้วย'],
      bad: ['วิเคราะห์ authoritative เป็นหลัก ไม่ได้ test resolver ทุกเครือข่าย', 'ต้องตีความกราฟซักหน่อย'],
      related: ['dnschecker', 'intodns', 'dig']
    },
    {
      id: 'dnschecker',
      name: 'DNSChecker',
      url: 'https://dnschecker.org',
      tpl: 'https://dnschecker.org/#A/{t}',
      tplTypes: ['domain', 'ipv4', 'ipv6'],
      cat: ['dns'],
      sym: ['dns-issues', 'web-block', 'ipv6'],
      ip: 'dual',
      access: 'web',
      price: 'free',
      keys: 'dns checker propagation resolver map a aaaa cname mx ns txt record',
      desc: 'ตรวจ DNS propagation จาก resolver หลายประเทศ รองรับ A, AAAA, CNAME, MX, NS และ TXT แสดงเป็นแผนที่',
      when: 'เพิ่งเปลี่ยน DNS record แล้วต้องรู้ว่า resolver ทั่วโลกเห็นค่าใหม่ครบหรือยัง หรือค่าไปคนละที่',
      how: 'เลือกชนิด record แล้วกรอก domain ดูผลราย resolver พร้อม map ว่าที่ไหนอัปเดตแล้ว',
      good: ['ครอบคลุม resolver หลายประเทศ ใช้ยืนยัน propagation', 'รองรับหลาย record type ในหน้าเดียว'],
      bad: ['บอกค่าที่เห็น ไม่ได้วิเคราะห์ DNSSEC ลึกเท่า DNSViz', 'ไม่ได้บอกว่าปัญหาอยู่ที่ authoritative หรือ cache'],
      related: ['dnsviz', 'intodns', 'dig']
    },
    {
      id: 'intodns',
      name: 'IntoDNS',
      url: 'https://intodns.com',
      tpl: 'https://intodns.com/{t}',
      tplTypes: ['domain'],
      cat: ['dns'],
      sym: ['dns-issues'],
      ip: 'v4',
      access: 'web',
      price: 'free',
      keys: 'intodns health check authoritative delegation glue soa ns consistency serial mail',
      desc: 'ตรวจ health check ของ authoritative DNS — delegation, glue record, SOA, NS consistency, serial และ mail-related DNS',
      when: 'สงสัยการตั้งค่า authoritative DNS ของ domain ตัวเองว่าถูกต้องครบหรือไม่ โดยเฉพาะหลังย้ายผู้ให้บริการ DNS',
      how: 'กรอก domain แล้วอ่านรายงานเป็นข้อ ๆ ว่ามี warning/error ตรงไหนของ authoritative setup',
      good: ['สรุปปัญหา authoritative DNS เป็นข้ออ่านง่าย', 'เช็คเรื่อง SOA/serial/NS consistency ให้ครบ'],
      bad: ['เน้น authoritative ไม่ครอบคลุม resolver path จริง', 'ข้อมูลเบื้องต้น ควรเสริมด้วย DNSViz เมื่อต้องการ DNSSEC'],
      related: ['dnsviz', 'dnschecker', 'dig']
    },
    {
      id: 'ssllabs',
      name: 'SSL Labs Server Test',
      url: 'https://www.ssllabs.com/ssltest',
      tpl: 'https://www.ssllabs.com/ssltest/analyze.html?d={t}',
      tplTypes: ['domain'],
      cat: ['http'],
      sym: ['tls', 'web-block'],
      ip: 'dual',
      access: 'web',
      price: 'free',
      keys: 'ssl labs test tls certificate chain protocol cipher grade compatibility https handshake',
      desc: 'ตรวจ TLS configuration, certificate chain, protocol version, cipher suite และ client compatibility ให้คะแนนเป็น grade',
      when: 'HTTPS เข้าไม่ได้เฉพาะอุปกรณ์/OS บางรุ่น หรือต้องการมาตรฐานกลางสำหรับรายงาน TLS config ว่าควรแก้อะไร',
      how: 'กรอก domain แล้วรอ full test อ่าน grade + configuration issue ที่ระบบแนะนำ',
      good: ['มาตรฐานกลางด้าน TLS grade รายงานละเอียด', 'เห็น problem ที่ควรแก่ configure'],
      bad: ['วัด server config เป็นหลัก ไม่วัด latency/CDN จริง', 'test บางรอบใช้เวลานาน'],
      related: ['openssl', 'curl', 'netforge']
    },
    {
      id: 'webpagetest',
      name: 'WebPageTest',
      url: 'https://www.webpagetest.org',
      cat: ['http'],
      sym: ['slow', 'tls'],
      ip: 'dual',
      access: 'web+api',
      price: 'freemium',
      keys: 'webpagetest waterfall dns tcp tls ttfb download timing filmstrip lighthouse performance',
      desc: 'ทดสอบเว็บแบบ waterfall แยกเวลา DNS, TCP, TLS, TTFB และ download ชัดเจน พร้อม filmstrip และ connection view',
      when: 'ต้องอธิบายว่า “เว็บช้า” ช้าที่ network, TLS handshake, origin หรือ content loading กันแน่',
      how: 'กรอก URL เลือก location/connection แล้วดู waterfall ว่าแถบเวลาส่วนใหญ่กินไปที่ phase ไหน',
      good: ['แยก timing ระดับ sub-resource เห็น bottleneck ชัด', 'เทียบผลหลาย ๆ run ได้'],
      bad: ['รอบฟรีอาจมี queue/คิวสักหน่อย', 'ต้องตีความ waterfall ประกอบความรู้ web performance'],
      related: ['globalping-net', 'bunny-tools', 'ssllabs']
    },
    {
      id: 'globalping-net',
      name: 'GlobalPing.Net',
      url: 'https://globalping.net',
      cat: ['http'],
      sym: ['slow', 'tls', 'web-block'],
      ip: 'v4',
      access: 'web',
      price: 'free',
      keys: 'globalping.net http speed test dns tcp ssl ttfb download waterfall header certificate multi-node',
      desc: 'Multi-node HTTP test ที่แยกเวลา DNS, TCP, SSL/TLS, TTFB และ download ต่อ node รวมถึง redirect, response header และ certificate info',
      when: 'ต้องการเทียบ performance ของเว็บแบบละเอียดระหว่างหลายภูมิภาค โดยดู timing แยก phase ในหน้าเดียว',
      how: 'กรอก URL แล้วดู waterfall ต่อ node เทียบ DNS/TCP/SSL/TTFB/download พร้อมข้อมูล certificate',
      good: ['แยก phase timing ต่อ node อ่านง่าย', 'ฟรี ไม่ต้องติดตั้ง'],
      bad: ['ไม่ใช่ Globalping (jsDelivr) — คนละแพลตฟอร์มกับ globalping.io', 'จำนวน node น้อยกว่าเครื่องมือ measurement เต็มรูปแบบ'],
      related: ['globalping', 'webpagetest', 'bunny-tools']
    },
    {
      id: 'mtr',
      name: 'mtr',
      url: 'https://github.com/traviscross/mtr',
      cat: ['cli'],
      sym: ['latency', 'web-block', 'game', 'ipv6', 'th-routing', 'intl-link'],
      ip: 'dual',
      access: 'cli',
      price: 'free',
      keys: 'mtr traceroute ping loss hop command linux macos windows report',
      desc: 'ผสาน traceroute + ping ในคำสั่งเดียว วัด loss/latency ราย hop แบบต่อเนื่อง รันบน server หรือเครื่องจำลองผู้ใช้ในระบบเองได้',
      when: 'ต้องเก็บหลักฐาน path จริงจากมุมเครือข่ายในระบบ หรือจาก customer-simulation VM เพื่อชี้ว่า loss เกิดที่ hop ไหน',
      how: 'รัน `mtr -4 -zw --aslookup <target>` (หรือ `-6`) แล้วปล่อยเก็บสักระยะเพื่อดูค่าเฉลี่ย loss ราย hop',
      good: ['เห็น loss/RTT ราย hop ต่อเนื่องในหน้าเดียว', 'รันในระบบเองได้ ไม่พึ่งบริการภายนอก'],
      bad: ['ICMP อาจถูก rate-limit/reply ช้าบาง hop ทำให้ดูเหมือน loss', 'ต้องมีสิทธิ์รันบนเครื่องปลายทางที่ต้องการ'],
      related: ['globalping', 'tcping', 'wireshark']
    },
    {
      id: 'dig',
      name: 'dig (BIND)',
      url: 'https://www.isc.org/bind/',
      cat: ['cli', 'dns'],
      sym: ['dns-issues'],
      ip: 'dual',
      access: 'cli',
      price: 'free',
      keys: 'dig bind dns query ns a aaaa cname mx txt trace +norec authoritative',
      desc: 'คำสั่งมาตรฐานสำหรับ query DNS ตรง ๆ ทั้งแบบ recursive และ authoritative ใช้ยืนยันค่ารายเซ็นเซอร์ได้แม่นยำ',
      when: 'ต้องพิสูจน์ว่า authoritative ตอบอะไรจริง ๆ เพื่อแยกปัญหา propagation ออกจาก configuration',
      how: 'ลอง `dig +short example.com A @1.1.1.1` เทียบกับ `dig +norec example.com NS @ns1.example.com`',
      good: ['คำตอบจากเซิร์ฟเวอร์ที่ระบุเอง ตรวจสอบได้ทันที', 'ใช้ร่วมกับ +trace ดู delegation ทีละชั้น'],
      bad: ['ต้องรันจากเครื่องที่เข้าถึง DNS ได้', 'output ต้องอ่านเอง ไม่มีกราฟสรุป'],
      related: ['dnsviz', 'dnschecker', 'intodns']
    },
    {
      id: 'curl',
      name: 'curl',
      url: 'https://curl.se',
      cat: ['cli', 'http'],
      sym: ['tls', 'slow', 'web-block'],
      ip: 'dual',
      access: 'cli',
      price: 'free',
      keys: 'curl http https header timing verbose resolve redirect tls output test origin',
      desc: 'เครื่องมือ request HTTP แบบ command-line ใช้ดู header, redirect, timing และ error จริงของเว็บจากฝั่ง client',
      when: 'ต้องยืนยันสิ่งที่ browser เห็น — redirect chain, header ที่ขาด หรือ timing ของแต่ละ phase จาก server ในระบบ',
      how: 'ลอง `curl -sSvo /dev/null https://host/` หรือ `curl -w` เพื่อวัดเวลา DNS/connect/TLS/TTFB เป็นตัวเลข',
      good: ['reproduce ได้จาก server ลดตัวแปรฝั่ง client', 'ใช้ --resolve จำลอง host ไปที่ IP ปลายทางอื่นได้'],
      bad: ['ไม่เห็นสิ่งที่ browser render จริง', 'ต้องเข้าใจ TLS/HTTP error output บ้าง'],
      related: ['openssl', 'webpagetest', 'ssllabs']
    },
    {
      id: 'openssl',
      name: 'openssl s_client',
      url: 'https://www.openssl.org',
      cat: ['cli', 'http'],
      sym: ['tls'],
      ip: 'dual',
      access: 'cli',
      price: 'free',
      keys: 'openssl s_client tls certificate chain sni expiry cipher handshake connect debug',
      desc: 'ยืนยัน TLS handshake จริงกับเซิร์ฟเวอร์ — certificate chain, SAN, วันหมดอายุ, protocol และ cipher ที่ตกลงกันได้',
      when: 'SSL Labs ชี้ปัญหาแล้วต้องยืนยันด้วย handshake จริง หรือสงสัยว่าเฉพาะ client/OS บางตัวเท่านั้นที่ล้มเหลว',
      how: 'รัน `openssl s_client -connect host:443 -servername host` แล้วตรวจ subject, issuer, notAfter และ verify return code',
      good: ['เห็น handshake จริงแบบ raw ตรวจสอบ chain ได้ทันที', 'ทดสอบ protocol/cipher เฉพาะตัวได้'],
      bad: ['manual เทียบเคียง certificate เอง', 'เหมาะกับผู้ที่พออ่าน TLS output'],
      related: ['ssllabs', 'curl', 'wireshark']
    },
    {
      id: 'wireshark',
      name: 'Wireshark / tshark',
      url: 'https://www.wireshark.org',
      cat: ['cli'],
      sym: ['latency', 'game', 'tls'],
      ip: 'dual',
      access: 'cli',
      price: 'free',
      keys: 'wireshark tshark packet capture analysis retransmission mtu tls alert filter display',
      desc: 'Packet-level evidence ระดับสากล — capture และวิเคราะห์ packet จริง ทั้ง GUI (Wireshark) และ CLI (tshark)',
      when: 'ต้องการหลักฐานระดับ packet เช่น retransmission, MTU blackhole, TLS alert หรือ anomalous behavior ที่เครื่องมืออื่นบอกไม่ได้',
      how: 'capture บนจุดที่เห็น traffic จริง แล้วกรองด้วย display filter เช่น `tcp.analysis.retransmission` หรือ `tls.alert_message`',
      good: ['หลักฐานขั้นสุดท้ายที่เถียงไม่ได้', 'tshark ใช้ใน automation/script ได้'],
      bad: ['ต้องมีจุด capture ที่เห็น traffic ทั้งสองฝั่ง', 'ต้องใช้เวลาอ่าน/กรอง packet เอง'],
      related: ['mtr', 'arkime', 'zeek']
    },
    {
      id: 'zeek',
      name: 'Zeek',
      url: 'https://zeek.org',
      cat: ['cli'],
      sym: ['game', 'latency'],
      ip: 'dual',
      access: 'cli',
      price: 'free',
      keys: 'zeek bro session log connection analysis sensor traffic dns ssl http analyzer',
      desc: 'Network monitor ระดับ session ที่สร้าง log เชิงลึก (conn, dns, ssl, http) ใช้วิเคราะห์รูปแบบ traffic และ anomaly ย้อนหลัง',
      when: 'ต้องการมุม session/behavior ว่า connection ไปอย่างไร DNS/SSL เกิดอะไรขึ้น แทนการไล่อ่าน packet ทีละตัว',
      how: 'deploy sensor บนสะพาน traffic แล้วสืบค้น log ย้อนหลังด้วย Zeek script หรือนำ log ไป query ต่อ',
      good: ['log ระดับ session อ่านง่ายกว่า packet dump', 'สร้างหลักเชิงพฤติกรรมของ traffic ได้'],
      bad: ['ต้อง deploy sensor และดูแลทรัพยากร', 'ไม่ใช่ one-shot tool — ต้องมีการวางแผนเก็บข้อมูล'],
      related: ['arkime', 'wireshark']
    },
    {
      id: 'arkime',
      name: 'Arkime',
      url: 'https://arkime.com',
      cat: ['cli'],
      sym: ['game', 'latency'],
      ip: 'dual',
      access: 'cli',
      price: 'free',
      keys: 'arkime molester full packet capture session search elasticsearch csm',
      desc: 'Full packet capture พร้อมระบบค้นหา session ขนาดใหญ่ (เดิม Moloch) เหมาะกับการไล่ดู traffic ย้อนหลังแบบมี UI',
      when: 'ต้องไล่ย้อนหลังว่า session ใดคุยกับปลายทางไหนช่วงเกิดเหตุ โดยไม่ต้องเปิด packet ทีละใบ',
      how: 'เก็บ traffic ผ่าน sensor แล้วค้นหา session ด้วย filter เช่น IP, port, hostname แล้ว drill-down ดู payload ได้',
      good: ['ค้น session ปริมาณมากได้เร็ว มี UI ให้ทีมใช้ร่วมกัน', 'เก็บหลักฐาน full packet ไว้อ้างอิงได้'],
      bad: ['ต้องใช้ storage/cluster ทรัพยากรสูง', 'ต้องวางแผน retention และการ deploy'],
      related: ['zeek', 'wireshark']
    },
    {
      id: 'tcping',
      name: 'tcping',
      url: 'https://www.elifulkerson.com/projects/tcping.php',
      cat: ['cli'],
      sym: ['latency', 'game', 'web-block'],
      ip: 'v4',
      access: 'cli',
      price: 'free',
      keys: 'tcp ping port latency connect test winnow windows tcping',
      desc: 'ping ไปยัง port TCP ที่ระบุ เช่น 443/3389 วัดเวลาเชื่อมต่อจริง เหมาะกับปลายทางที่บล็อก ICMP',
      when: 'ปลายทางบล็อก ICMP หรือต้องรู้ latency ไป port จริงของบริการ (เกม, RDP, web) ไม่ใช่แค่ ping ทั่วไป',
      how: 'รัน `tcping <host> <port>` เพื่อดู RTT ต่อการเชื่อมต่อ TCP ไปยัง port นั้น',
      good: ['วัด latency ไป port จริงได้แม่นในสภาพที่ ICMP ถูกบล็อก', 'ตัวเล็ก ใช้เร็ว ไม่ต้องติดตั้งอะไรเยอะ'],
      bad: ['รองรับ IPv4 เป็นหลักในตัว classic', 'ไม่เห็น path เต็ม ต้องคู่กับ mtr'],
      related: ['mtr', 'tnc', 'globalping']
    },
    {
      id: 'tnc',
      name: 'Test-NetConnection',
      url: 'https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.management/test-netconnection',
      cat: ['cli'],
      sym: ['web-block', 'tls', 'ipv6'],
      ip: 'dual',
      access: 'cli',
      price: 'free',
      keys: 'test-netconnection powershell windows port tcp route ping dns splatting',
      desc: 'คำสั่ง PowerShell ของ Windows ตรวจการเชื่อมต่อ TCP, port, route และ DNS ในคำสั่งเดียว เหมาะกับจำลองจากเครื่องผู้ใช้ Windows',
      when: 'ลูกค้า/ผู้ใช้ใช้ Windows แล้วต้อง reproduce การเชื่อมต่อจากมุมมองฝั่งเขาโดยไม่ต้องติดตั้งเครื่องมือเพิ่ม',
      how: 'รัน `Test-NetConnection example.com -Port 443` เพื่อดู DNS, route, TCP test พร้อมกัน',
      good: ['มีบน Windows ทุกเครื่อง ไม่ต้องติดตั้งเพิ่ม', 'รายงาน DNS/route/port ในคำสั่งเดียว'],
      bad: ['ข้อมูลละเอียดไม่เท่า mtr/curl', 'เหมาะกับ quick check มากกว่า investigation ลึก'],
      related: ['tcping', 'curl', 'mtr']
    }
  ];

  return {
    meta: { brand: 'NetOps Toolkit', version: '1.0.12' },
    categories: categories,
    symptoms: symptoms,
    presets: presets,
    tools: tools
  };
})();
