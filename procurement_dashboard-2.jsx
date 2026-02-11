import { useState, useEffect, useCallback, useRef } from "react";

const SEARCHES = [
  {
    id: "ted_crypto_1",
    label: "TED — Crypto / Blockchain / DeFi",
    region: "EU",
    category: "crypto",
    query: `Search ted.europa.eu for procurement notices published in the last 30 days. Search for these terms: cryptocurrency, blockchain, bitcoin, ethereum, stablecoin, DeFi, NFT, tokenization, smart contract, distributed ledger, crypto exchange, virtual currency, digital currency.

For EACH notice found return these exact fields:
- title: the full notice title
- buyer: the contracting authority / buyer name
- country: 2-letter country code (DE, FR, NL, etc.)
- date: publication date in YYYY-MM-DD format
- notice_id: the TED publication number (e.g. 2025/S 024-XXXXXX)
- url: the full ted.europa.eu URL to the notice

Return ONLY a JSON array. No markdown, no explanation. If none found, return [].`,
  },
  {
    id: "ted_crypto_2",
    label: "TED — Custody / Wallet / Key Mgmt",
    region: "EU",
    category: "crypto",
    query: `Search ted.europa.eu for procurement notices published in the last 30 days related to: crypto custody, qualified custodian, digital asset custody, cold storage wallet, hardware security module HSM, key management for digital assets, crypto wallet infrastructure.

For EACH notice found return these exact fields:
- title: the full notice title
- buyer: the contracting authority / buyer name
- country: 2-letter country code
- date: publication date YYYY-MM-DD
- notice_id: the TED publication number
- url: the full ted.europa.eu URL

Return ONLY a JSON array. No markdown. If none found, return [].`,
  },
  {
    id: "ted_crypto_3",
    label: "TED — Crypto Analytics / Forensics / AML",
    region: "EU",
    category: "crypto",
    query: `Search ted.europa.eu for procurement notices published in the last 30 days related to: blockchain analytics, chain analysis, Chainalysis, Elliptic, TRM Labs, CipherTrace, crypto forensics, cryptocurrency investigation, crypto tracing, anti-money laundering cryptocurrency, AML crypto compliance, transaction monitoring blockchain.

For EACH notice found return these exact fields:
- title: the full notice title
- buyer: the contracting authority / buyer name
- country: 2-letter country code
- date: publication date YYYY-MM-DD
- notice_id: the TED publication number
- url: the full ted.europa.eu URL

Return ONLY a JSON array. No markdown. If none found, return [].`,
  },
  {
    id: "ted_seizure",
    label: "TED — Seizure / Forfeiture / Asset Recovery",
    region: "EU",
    category: "crypto",
    query: `Search ted.europa.eu for procurement notices published in the last 60 days related to: asset seizure, asset forfeiture, confiscated assets, asset recovery, liquidation of seized assets, disposal of confiscated property, proceeds of crime, criminal asset management, seized cryptocurrency, digital asset forfeiture.

For EACH notice found return these exact fields:
- title: the full notice title
- buyer: the contracting authority / buyer name
- country: 2-letter country code
- date: publication date YYYY-MM-DD
- notice_id: the TED publication number
- url: the full ted.europa.eu URL

Return ONLY a JSON array. No markdown. If none found, return [].`,
  },
  {
    id: "ted_insider",
    label: "TED — Insider Threat / SIEM / DLP",
    region: "EU",
    category: "insider_threat",
    query: `Search ted.europa.eu for procurement notices published in the last 30 days related to: insider threat detection, insider risk program, SIEM platform, security information event management, data loss prevention DLP, user entity behavior analytics UEBA, privileged access management PAM, security operations center SOC, zero trust architecture, endpoint detection response.

For EACH notice found return these exact fields:
- title: the full notice title
- buyer: the contracting authority / buyer name
- country: 2-letter country code
- date: publication date YYYY-MM-DD
- notice_id: the TED publication number
- url: the full ted.europa.eu URL

Return ONLY a JSON array. No markdown. If none found, return [].`,
  },
  {
    id: "uk_crypto",
    label: "UK — Crypto / Blockchain / Digital Assets",
    region: "UK",
    category: "crypto",
    query: `Search find-tender.service.gov.uk AND contractsfinder.service.gov.uk for UK government tenders and contract notices from the last 30 days related to: cryptocurrency, blockchain, digital assets, bitcoin, crypto custody, blockchain analytics, Chainalysis, crypto forensics, distributed ledger technology, virtual assets, stablecoin, tokenization, DeFi.

For EACH notice found return these exact fields:
- title: the full notice title
- buyer: the contracting authority name
- country: "UK"
- date: publication date YYYY-MM-DD
- notice_id: the notice/contract reference number
- url: the full URL to the notice

Return ONLY a JSON array. No markdown. If none found, return [].`,
  },
  {
    id: "uk_seizure",
    label: "UK — Seizure / Forfeiture / Asset Recovery",
    region: "UK",
    category: "crypto",
    query: `Search find-tender.service.gov.uk AND contractsfinder.service.gov.uk for UK government tenders from the last 60 days related to: asset seizure, asset forfeiture, proceeds of crime, asset recovery agency, confiscated property disposal, seized cryptocurrency management.

For EACH notice found return these exact fields:
- title: the full notice title
- buyer: the contracting authority name
- country: "UK"
- date: publication date YYYY-MM-DD
- notice_id: the notice reference number
- url: the full URL

Return ONLY a JSON array. No markdown. If none found, return [].`,
  },
  {
    id: "uk_insider",
    label: "UK — Insider Threat / Security Ops",
    region: "UK",
    category: "insider_threat",
    query: `Search find-tender.service.gov.uk AND contractsfinder.service.gov.uk for UK government tenders from the last 30 days related to: insider threat, SIEM, data loss prevention, privileged access management, security operations center, zero trust, endpoint detection, UEBA, user behavior analytics.

For EACH notice found return these exact fields:
- title: the full notice title
- buyer: the contracting authority name
- country: "UK"
- date: publication date YYYY-MM-DD
- notice_id: the notice reference number
- url: the full URL

Return ONLY a JSON array. No markdown. If none found, return [].`,
  },
  {
    id: "nordic_crypto",
    label: "Nordics — Crypto / Blockchain",
    region: "Nordics",
    category: "crypto",
    query: `Search for government procurement tenders from Norway (doffin.no, mercell.com), Finland (hankintailmoitukset.fi, hilma), Sweden (ted.europa.eu country:SE), Denmark (udbud.dk), and Iceland from the last 60 days related to: cryptocurrency, blockchain, digital assets, crypto forensics, blockchain analytics, Chainalysis, crypto custody, virtual assets, bitcoin, stablecoin, AML cryptocurrency.

For EACH notice found return these exact fields:
- title: the full notice title
- buyer: the contracting authority name
- country: the country name or 2-letter code (NO, FI, SE, DK, IS)
- date: publication date YYYY-MM-DD
- notice_id: any reference number
- url: the full URL to the notice

Return ONLY a JSON array. No markdown. If none found, return [].`,
  },
  {
    id: "nordic_seizure",
    label: "Nordics — Seizure / Asset Recovery",
    region: "Nordics",
    category: "crypto",
    query: `Search for government procurement tenders from Norway, Finland, Sweden, Denmark, and Iceland from the last 60 days related to: asset seizure, forfeiture, confiscated property, asset recovery, proceeds of crime disposal, seized asset management, cryptocurrency seizure.

For EACH notice found return:
- title, buyer, country (2-letter code), date (YYYY-MM-DD), notice_id, url

Return ONLY a JSON array. If none found, return [].`,
  },
  {
    id: "sam_crypto",
    label: "USA — Crypto / Blockchain / Digital Assets",
    region: "US",
    category: "crypto",
    query: `Search sam.gov for US federal contract opportunities from the last 30 days related to: cryptocurrency, blockchain, digital assets, bitcoin, crypto custody, blockchain analytics, Chainalysis, Elliptic, TRM Labs, crypto forensics, virtual currency, distributed ledger, stablecoin, DeFi, tokenization, smart contracts, crypto exchange regulation, AML cryptocurrency.

For EACH opportunity found return these exact fields:
- title: the full opportunity title
- buyer: the agency / department name
- country: "US"
- date: the posted date YYYY-MM-DD
- notice_id: the solicitation number
- url: the full sam.gov URL

Return ONLY a JSON array. No markdown. If none found, return [].`,
  },
  {
    id: "sam_seizure",
    label: "USA — Seizure / Forfeiture / Asset Recovery",
    region: "US",
    category: "crypto",
    query: `Search sam.gov for US federal contract opportunities from the last 60 days related to: asset seizure, asset forfeiture, seized property disposal, US Marshals asset management, crypto asset seizure, proceeds of crime, forfeited cryptocurrency, Treasury forfeiture fund.

For EACH opportunity found return:
- title, buyer, country ("US"), date (YYYY-MM-DD), notice_id, url

Return ONLY a JSON array. If none found, return [].`,
  },
  {
    id: "sam_insider",
    label: "USA — Insider Threat / SIEM / Zero Trust",
    region: "US",
    category: "insider_threat",
    query: `Search sam.gov for US federal contract opportunities from the last 30 days related to: insider threat program, insider risk, SIEM, data loss prevention DLP, UEBA, privileged access management, security operations center SOC, zero trust architecture, continuous diagnostics monitoring CDM, endpoint detection and response.

For EACH opportunity found return:
- title, buyer, country ("US"), date (YYYY-MM-DD), notice_id, url

Return ONLY a JSON array. If none found, return [].`,
  },
  {
    id: "baltic_all",
    label: "Baltics — All Categories",
    region: "Baltics",
    category: "both",
    query: `Search for government procurement tenders from Latvia (iub.gov.lv, eis.gov.lv), Lithuania (cvpp.eviesiejipirkimai.lt), and Estonia (riigihanked.riik.ee) as well as TED europa.eu filtered to countries LV, LT, EE from the last 60 days. Search for: cryptocurrency, blockchain, digital assets, cyber security, SIEM, insider threat, data loss prevention, security operations, forensics.

For EACH notice found return:
- title, buyer, country (LV/LT/EE), date (YYYY-MM-DD), notice_id, url

Return ONLY a JSON array. If none found, return [].`,
  },
];

const REGIONS = ["All", "EU", "UK", "Nordics", "US", "Baltics"];
const CATEGORIES = ["All", "crypto", "insider_threat", "both"];
const CACHE_KEY = "procurement-cache-v3";
const NEW_MS = 24 * 60 * 60 * 1000;

function stableKey(src, item) {
  const id = item.notice_id || item.url || item.title || "";
  return `${src}:${id.replace(/[\s"'/\\]/g, "_").slice(0, 160)}`;
}

function parseJSON(text) {
  try {
    const c = text.replace(/```json\s*/g, "").replace(/```/g, "").trim();
    const s = c.indexOf("["), e = c.lastIndexOf("]");
    if (s < 0 || e < 0) return [];
    const a = JSON.parse(c.slice(s, e + 1));
    return Array.isArray(a) ? a.filter((r) => r && (r.title || r.url)) : [];
  } catch { return []; }
}

async function callAPI(search, signal) {
  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    signal,
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4000,
      system: "You are a procurement data extractor. Search the web for real government procurement notices from official portals. Return ONLY a valid JSON array. No markdown fences, no explanation. Each object must have: title, buyer, country, date, notice_id, url. Be thorough and check multiple result pages.",
      messages: [{ role: "user", content: search.query }],
      tools: [{ type: "web_search_20250305", name: "web_search" }],
    }),
  });
  if (!r.ok) throw new Error(`API ${r.status}`);
  const d = await r.json();
  return parseJSON((d.content || []).filter((b) => b.type === "text").map((b) => b.text).join("\n"));
}

async function loadCache() {
  try {
    const r = await window.storage.get(CACHE_KEY);
    if (r?.value) return JSON.parse(r.value);
  } catch {}
  return { notices: [], index: {}, lastRun: null, history: [] };
}

async function saveCache(c) {
  try { await window.storage.set(CACHE_KEY, JSON.stringify(c)); } catch (e) { console.error("save err", e); }
}

function merge(cache, items, srcId) {
  const now = new Date().toISOString();
  let added = 0;
  for (const it of items) {
    const sk = stableKey(srcId, it);
    if (cache.index[sk]) {
      cache.index[sk].last_seen = now;
      cache.index[sk].count = (cache.index[sk].count || 1) + 1;
    } else {
      cache.index[sk] = { first_seen: now, last_seen: now, count: 1 };
      cache.notices.push({ ...it, _key: sk, _src: srcId });
      added++;
    }
  }
  return added;
}

const RC = { EU: "#60a5fa", UK: "#a78bfa", US: "#fbbf24", Nordics: "#34d399", Baltics: "#f472b6" };
const CC = { crypto: "#4ade80", insider_threat: "#c084fc", both: "#fbbf24" };

export default function App() {
  const [cache, setCache] = useState({ notices: [], index: {}, lastRun: null, history: [] });
  const [sts, setSts] = useState({});
  const [flt, setFlt] = useState({ q: "", region: "All", cat: "All", newOnly: false });
  const [running, setRunning] = useState(false);
  const [ready, setReady] = useState(false);
  const [tab, setTab] = useState("notices");
  const ac = useRef(null);

  useEffect(() => { loadCache().then((c) => { setCache(c); setReady(true); }); }, []);

  const tagged = cache.notices.map((n) => {
    const s = SEARCHES.find((x) => x.id === n._src);
    const ix = cache.index[n._key];
    return { ...n, _region: s?.region || "", _cat: s?.category || "", _label: s?.label || n._src, _new: ix ? (Date.now() - new Date(ix.first_seen).getTime()) < NEW_MS : true };
  });

  const run = useCallback(async () => {
    if (running) return;
    setRunning(true);
    ac.current = new AbortController();
    const up = { ...cache, notices: [...cache.notices], index: { ...cache.index } };
    const stats = [];
    for (const s of SEARCHES) {
      setSts((p) => ({ ...p, [s.id]: { st: "load", pull: 0, add: 0, err: "" } }));
      try {
        const items = await callAPI(s, ac.current.signal);
        const added = merge(up, items, s.id);
        const stat = { st: "ok", pull: items.length, add: added, err: "" };
        setSts((p) => ({ ...p, [s.id]: stat }));
        stats.push({ id: s.id, l: s.label, ...stat });
        setCache({ ...up });
      } catch (e) {
        if (e.name === "AbortError") break;
        const stat = { st: "err", pull: 0, add: 0, err: (e.message || "").slice(0, 100) };
        setSts((p) => ({ ...p, [s.id]: stat }));
        stats.push({ id: s.id, l: s.label, ...stat });
      }
    }
    const now = new Date().toISOString();
    up.lastRun = now;
    up.history = [{ t: now, stats, newTotal: stats.reduce((a, x) => a + x.add, 0) }, ...(up.history || []).slice(0, 19)];
    setCache({ ...up });
    await saveCache(up);
    setRunning(false);
  }, [running, cache]);

  const stop = () => { ac.current?.abort(); setRunning(false); };
  const clearAll = async () => { const e = { notices: [], index: {}, lastRun: null, history: [] }; setCache(e); setSts({}); await saveCache(e); };

  const rows = tagged.filter((r) => {
    const b = [r.title, r.buyer, r.country, r.notice_id, r.url, r._label, r._region].join(" ").toLowerCase();
    if (flt.q && !b.includes(flt.q.toLowerCase())) return false;
    if (flt.region !== "All" && r._region !== flt.region) return false;
    if (flt.cat !== "All" && r._cat !== flt.cat) return false;
    if (flt.newOnly && !r._new) return false;
    return true;
  }).sort((a, b) => (b.date || "").localeCompare(a.date || ""));

  const cOk = Object.values(sts).filter((s) => s.st === "ok").length;
  const cErr = Object.values(sts).filter((s) => s.st === "err").length;
  const cLoad = Object.values(sts).filter((s) => s.st === "load").length;
  const nNew = tagged.filter((n) => n._new).length;

  if (!ready) return <div style={{ minHeight: "100vh", background: "#080b10", display: "flex", alignItems: "center", justifyContent: "center", color: "#374151", fontFamily: "monospace" }}>Loading…</div>;

  return (
    <div style={{ minHeight: "100vh", background: "#080b10", color: "#d1d5db", fontFamily: "'IBM Plex Mono', 'Fira Code', monospace", fontSize: 12 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600;700&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap');
        @keyframes fadeIn{from{opacity:0;transform:translateY(3px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.35}}
        @keyframes glow{0%,100%{box-shadow:0 0 6px #22c55e22}50%{box-shadow:0 0 18px #22c55e44}}
        *{box-sizing:border-box}::-webkit-scrollbar{width:5px}::-webkit-scrollbar-thumb{background:#1e2733;border-radius:3px}
        .hov:hover{background:#111820!important}
      `}</style>

      {/* HEADER */}
      <div style={{ borderBottom: "1px solid #151b24", padding: "14px 20px", background: "#0a0e14" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, fontFamily: "'IBM Plex Sans',sans-serif", color: "#f0f6fc" }}>
              <span style={{ color: "#22c55e" }}>◆</span> PROCUREMENT WATCH
            </div>
            <div style={{ fontSize: 10, color: "#374151", marginTop: 2 }}>
              {cache.notices.length} cached · {nNew} new · {cache.lastRun ? "Last: " + new Date(cache.lastRun).toLocaleString() : "Never run"} · {SEARCHES.length} sources
            </div>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <button onClick={clearAll} style={{ padding: "5px 10px", border: "1px solid #1e2733", borderRadius: 5, background: "transparent", color: "#4b5563", cursor: "pointer", fontSize: 10, fontFamily: "inherit" }}>Clear</button>
            {running
              ? <button onClick={stop} style={{ padding: "7px 16px", border: "1px solid #b91c1c", borderRadius: 5, background: "#180a0a", color: "#f87171", cursor: "pointer", fontSize: 11, fontFamily: "inherit", fontWeight: 600 }}>■ Stop</button>
              : <button onClick={run} style={{ padding: "7px 16px", border: "1px solid #16a34a", borderRadius: 5, background: "#071209", color: "#4ade80", cursor: "pointer", fontSize: 11, fontFamily: "inherit", fontWeight: 600, animation: cache.notices.length === 0 ? "glow 2.5s infinite" : "none" }}>▶ Pull contracts</button>
            }
          </div>
        </div>
        <div style={{ display: "flex", gap: 4, marginTop: 10 }}>
          {[["notices", `Notices (${cache.notices.length})`], ["health", "Health"]].map(([k, l]) => (
            <button key={k} onClick={() => setTab(k)} style={{ padding: "5px 12px", border: `1px solid ${tab === k ? "#1e2733" : "#151b24"}`, borderRadius: 5, background: tab === k ? "#111820" : "transparent", color: tab === k ? "#e5e7eb" : "#4b5563", cursor: "pointer", fontSize: 10, fontFamily: "inherit", fontWeight: tab === k ? 600 : 400 }}>{l}</button>
          ))}
        </div>
      </div>

      {/* STATUS BAR */}
      {Object.keys(sts).length > 0 && (
        <div style={{ borderBottom: "1px solid #151b24", padding: "8px 20px", background: "#090d12", display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", fontSize: 10 }}>
          {cOk > 0 && <span style={{ color: "#4ade80" }}>✓{cOk}</span>}
          {cErr > 0 && <span style={{ color: "#f87171" }}>✗{cErr}</span>}
          {cLoad > 0 && <span style={{ color: "#eab308", animation: "pulse 1s infinite" }}>⟳{cLoad}</span>}
          <span style={{ color: "#374151" }}>{tagged.length} total</span>
          <div style={{ display: "flex", gap: 3 }}>
            {SEARCHES.map((s) => {
              const x = sts[s.id];
              const bg = !x ? "#151b24" : x.st === "ok" ? (x.pull > 0 ? "#22c55e" : "#4b5563") : x.st === "err" ? "#ef4444" : "#eab308";
              return <div key={s.id} title={`${s.label}: ${x?.pull || 0} pulled, ${x?.add || 0} new`} style={{ width: 8, height: 8, borderRadius: 2, background: bg, animation: x?.st === "load" ? "pulse .7s infinite" : "none" }} />;
            })}
          </div>
        </div>
      )}

      <div style={{ padding: "0 20px 40px" }}>
        {/* NOTICES */}
        {tab === "notices" && (<>
          <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap", padding: "12px 0", borderBottom: "1px solid #151b24" }}>
            <input value={flt.q} onChange={(e) => setFlt((f) => ({ ...f, q: e.target.value }))} placeholder="Search…" style={{ background: "#0d1117", color: "#c9d1d9", border: "1px solid #1e2733", borderRadius: 5, padding: "6px 9px", fontSize: 11, fontFamily: "inherit", width: 200 }} />
            <select value={flt.region} onChange={(e) => setFlt((f) => ({ ...f, region: e.target.value }))} style={{ background: "#0d1117", color: "#c9d1d9", border: "1px solid #1e2733", borderRadius: 5, padding: "6px 8px", fontSize: 11, fontFamily: "inherit" }}>
              {REGIONS.map((r) => <option key={r}>{r}</option>)}
            </select>
            <select value={flt.cat} onChange={(e) => setFlt((f) => ({ ...f, cat: e.target.value }))} style={{ background: "#0d1117", color: "#c9d1d9", border: "1px solid #1e2733", borderRadius: 5, padding: "6px 8px", fontSize: 11, fontFamily: "inherit" }}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c === "All" ? "All" : c === "crypto" ? "Crypto" : c === "insider_threat" ? "Insider" : "Both"}</option>)}
            </select>
            <label style={{ fontSize: 10, color: flt.newOnly ? "#4ade80" : "#4b5563", cursor: "pointer", display: "flex", gap: 3, alignItems: "center" }}>
              <input type="checkbox" checked={flt.newOnly} onChange={(e) => setFlt((f) => ({ ...f, newOnly: e.target.checked }))} style={{ accentColor: "#22c55e" }} /> New
            </label>
            <button onClick={() => setFlt({ q: "", region: "All", cat: "All", newOnly: false })} style={{ background: "transparent", color: "#4b5563", border: "1px solid #1e2733", borderRadius: 5, padding: "5px 8px", fontSize: 10, cursor: "pointer", fontFamily: "inherit" }}>Reset</button>
            <span style={{ fontSize: 10, color: "#374151" }}>{rows.length}/{tagged.length}</span>
          </div>

          {cache.notices.length === 0 && !running && (
            <div style={{ textAlign: "center", padding: "70px 20px", color: "#374151" }}>
              <div style={{ fontSize: 44, marginBottom: 14, opacity: .2 }}>◆</div>
              <div style={{ fontSize: 13, fontFamily: "'IBM Plex Sans',sans-serif" }}>No tenders cached</div>
              <div style={{ fontSize: 11, marginTop: 4 }}>Hit <span style={{ color: "#4ade80" }}>▶ Pull contracts</span> to search {SEARCHES.length} sources</div>
            </div>
          )}
          {running && cache.notices.length === 0 && (
            <div style={{ textAlign: "center", padding: "50px 20px", color: "#4b5563", animation: "pulse 1.5s infinite" }}>Searching procurement portals…</div>
          )}

          {rows.length > 0 && (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 2 }}>
                <thead><tr>{["", "Date", "Region", "Cat", "Title", "Buyer", "Source"].map((h) => (
                  <th key={h} style={{ textAlign: "left", padding: "9px 5px", fontSize: 9, color: "#374151", fontWeight: 600, borderBottom: "1px solid #151b24", textTransform: "uppercase", letterSpacing: ".6px", position: "sticky", top: 0, background: "#080b10", zIndex: 1 }}>{h}</th>
                ))}</tr></thead>
                <tbody>{rows.map((r, i) => (
                  <tr key={r._key || i} className="hov" style={{ animation: `fadeIn .2s ease ${Math.min(i * .015, .5)}s both`, borderBottom: "1px solid #0f1318", transition: "background .15s" }}>
                    <td style={{ padding: "7px 4px", width: 36, verticalAlign: "top" }}>{r._new && <span style={{ fontSize: 8, padding: "1px 4px", borderRadius: 3, background: "#052e16", color: "#4ade80", fontWeight: 700, letterSpacing: ".3px" }}>NEW</span>}</td>
                    <td style={{ padding: "7px 5px", color: "#4b5563", whiteSpace: "nowrap", verticalAlign: "top" }}>{r.date || "—"}</td>
                    <td style={{ padding: "7px 5px", verticalAlign: "top" }}><span style={{ fontSize: 9, padding: "1px 5px", borderRadius: 3, border: "1px solid #1e2733", color: RC[r._region] || "#4b5563" }}>{r.country || r._region}</span></td>
                    <td style={{ padding: "7px 5px", verticalAlign: "top" }}><span style={{ fontSize: 9, padding: "1px 5px", borderRadius: 3, border: `1px solid ${(CC[r._cat] || "#4b5563")}22`, color: CC[r._cat] || "#4b5563" }}>{r._cat === "crypto" ? "crypto" : r._cat === "insider_threat" ? "insider" : "both"}</span></td>
                    <td style={{ padding: "7px 5px", verticalAlign: "top", maxWidth: 380 }}>
                      {r.url ? <a href={r.url} target="_blank" rel="noopener noreferrer" style={{ color: "#93c5fd", textDecoration: "none", lineHeight: 1.35 }}>{r.title}</a> : <span style={{ lineHeight: 1.35 }}>{r.title}</span>}
                      {r.notice_id && <div style={{ fontSize: 9, color: "#1e2733", marginTop: 1 }}>{r.notice_id}</div>}
                    </td>
                    <td style={{ padding: "7px 5px", color: "#4b5563", verticalAlign: "top", maxWidth: 200 }}>{r.buyer || "—"}</td>
                    <td style={{ padding: "7px 5px", color: "#1e2733", verticalAlign: "top", whiteSpace: "nowrap", fontSize: 10 }}>{r._label}</td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          )}
        </>)}

        {/* HEALTH */}
        {tab === "health" && (
          <div style={{ paddingTop: 14 }}>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
              {[
                { n: cache.notices.length, l: "Cached", c: "#e5e7eb" },
                { n: nNew, l: "New 24h", c: "#4ade80" },
                { n: Object.keys(cache.index).length, l: "Unique", c: "#60a5fa" },
                { n: (cache.history || []).length, l: "Runs", c: "#a78bfa" },
              ].map((c) => (
                <div key={c.l} style={{ background: "#0d1117", border: "1px solid #151b24", borderRadius: 6, padding: "12px 16px", minWidth: 100 }}>
                  <div style={{ fontSize: 22, fontWeight: 700, color: c.c }}>{c.n}</div>
                  <div style={{ fontSize: 10, color: "#374151", marginTop: 2 }}>{c.l}</div>
                </div>
              ))}
            </div>

            {Object.keys(sts).length > 0 && (<>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", margin: "16px 0 6px", fontFamily: "'IBM Plex Sans',sans-serif" }}>Source Breakdown</div>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead><tr>{["Source", "Status", "Pulled", "New", "Error"].map((h) => (
                  <th key={h} style={{ textAlign: "left", padding: "7px 5px", fontSize: 9, color: "#374151", fontWeight: 600, borderBottom: "1px solid #151b24", textTransform: "uppercase" }}>{h}</th>
                ))}</tr></thead>
                <tbody>{SEARCHES.map((s) => {
                  const x = sts[s.id] || {};
                  return (
                    <tr key={s.id} style={{ borderBottom: "1px solid #0f1318" }}>
                      <td style={{ padding: "7px 5px", fontSize: 11 }}>{s.label}</td>
                      <td style={{ padding: "7px 5px", fontSize: 11, color: x.st === "ok" ? "#4ade80" : x.st === "err" ? "#f87171" : x.st === "load" ? "#eab308" : "#374151" }}>
                        {x.st === "load" ? "⟳ …" : x.st === "ok" ? "✓" : x.st === "err" ? "✗" : "—"}
                      </td>
                      <td style={{ padding: "7px 5px", fontSize: 11, color: x.pull === 0 && x.st === "ok" ? "#f87171" : "#d1d5db" }}>
                        {x.pull ?? "—"}{x.pull === 0 && x.st === "ok" && <span style={{ color: "#f87171", marginLeft: 4, fontSize: 9 }}>⚠ zero</span>}
                      </td>
                      <td style={{ padding: "7px 5px", fontSize: 11, color: x.add > 0 ? "#4ade80" : "#4b5563" }}>{x.add ?? "—"}</td>
                      <td style={{ padding: "7px 5px", fontSize: 10, color: "#f87171", maxWidth: 250, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{x.err || ""}</td>
                    </tr>
                  );
                })}</tbody>
              </table>
            </>)}

            {(cache.history || []).length > 0 && (<>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", margin: "20px 0 6px", fontFamily: "'IBM Plex Sans',sans-serif" }}>Run History</div>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead><tr>{["Time", "New", "OK", "Failed"].map((h) => (
                  <th key={h} style={{ textAlign: "left", padding: "7px 5px", fontSize: 9, color: "#374151", fontWeight: 600, borderBottom: "1px solid #151b24", textTransform: "uppercase" }}>{h}</th>
                ))}</tr></thead>
                <tbody>{cache.history.map((r, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid #0f1318" }}>
                    <td style={{ padding: "7px 5px", fontSize: 10, color: "#4b5563" }}>{new Date(r.t).toLocaleString()}</td>
                    <td style={{ padding: "7px 5px", fontSize: 11, color: r.newTotal > 0 ? "#4ade80" : "#4b5563" }}>{r.newTotal}</td>
                    <td style={{ padding: "7px 5px", fontSize: 11, color: "#4ade80" }}>{r.stats?.filter((s) => s.st === "ok").length || 0}</td>
                    <td style={{ padding: "7px 5px", fontSize: 11, color: r.stats?.some((s) => s.st === "err") ? "#f87171" : "#4b5563" }}>{r.stats?.filter((s) => s.st === "err").length || 0}</td>
                  </tr>
                ))}</tbody>
              </table>
            </>)}
          </div>
        )}
      </div>
    </div>
  );
}
