import { useState, useEffect, useCallback, useRef } from "react";

const SEARCHES = [
  {
    id: "ted_crypto",
    label: "EU/EEA — Crypto & Blockchain",
    region: "EU",
    category: "crypto",
    query: "Search TED europa.eu tenders published in the last 30 days related to cryptocurrency, blockchain, digital asset custody, crypto forensics, or blockchain analytics. For each tender found, provide: the exact title, the buyer/contracting authority name, the country, the publication date, the TED notice number, and the URL. Return ONLY a JSON array of objects with fields: title, buyer, country, date, notice_id, url. If you find none, return an empty array [].",
  },
  {
    id: "ted_seizure",
    label: "EU/EEA — Seizure & Asset Recovery",
    region: "EU",
    category: "crypto",
    query: "Search TED europa.eu tenders published in the last 60 days related to asset seizure, forfeiture, asset recovery, liquidation of seized assets, or disposal of confiscated property. For each tender found, provide: the exact title, the buyer/contracting authority name, the country, the publication date, the TED notice number, and the URL. Return ONLY a JSON array of objects with fields: title, buyer, country, date, notice_id, url. If you find none, return an empty array [].",
  },
  {
    id: "ted_insider",
    label: "EU/EEA — Insider Threat & SIEM",
    region: "EU",
    category: "insider_threat",
    query: "Search TED europa.eu tenders published in the last 60 days related to insider threat, SIEM, data loss prevention, UEBA, user behavior analytics, privileged access management, security operations center, or zero trust architecture. For each tender found, provide: the exact title, the buyer/contracting authority name, the country, the publication date, the TED notice number, and the URL. Return ONLY a JSON array of objects with fields: title, buyer, country, date, notice_id, url. If you find none, return an empty array [].",
  },
  {
    id: "uk_crypto",
    label: "UK — Crypto & Digital Assets",
    region: "UK",
    category: "crypto",
    query: "Search find-tender.service.gov.uk and contractsfinder.service.gov.uk for recent UK government tenders related to cryptocurrency, blockchain, digital assets, crypto custody, or blockchain forensics. For each tender found, provide: the exact title, the buyer/contracting authority name, the country (UK), the publication date, the notice ID, and the URL. Return ONLY a JSON array of objects with fields: title, buyer, country, date, notice_id, url. If you find none, return an empty array [].",
  },
  {
    id: "uk_insider",
    label: "UK — Insider Threat & Security Ops",
    region: "UK",
    category: "insider_threat",
    query: "Search find-tender.service.gov.uk and contractsfinder.service.gov.uk for recent UK government tenders related to insider threat, SIEM, data loss prevention, security operations center, privileged access management, or zero trust. For each tender found, provide: the exact title, the buyer/contracting authority name, the country (UK), the publication date, the notice ID, and the URL. Return ONLY a JSON array of objects with fields: title, buyer, country, date, notice_id, url. If you find none, return an empty array [].",
  },
  {
    id: "nordic_crypto",
    label: "Nordics — Crypto & Blockchain",
    region: "Nordics",
    category: "crypto",
    query: "Search for recent government procurement tenders from Norway (doffin.no), Finland (hankintailmoitukset.fi), Sweden, Denmark (udbud.dk), or Iceland related to cryptocurrency, blockchain, digital assets, crypto forensics, or blockchain analytics. For each tender found, provide: the exact title, the buyer/contracting authority name, the country, the publication date, the notice ID if available, and the URL. Return ONLY a JSON array of objects with fields: title, buyer, country, date, notice_id, url. If you find none, return an empty array [].",
  },
  {
    id: "sam_crypto",
    label: "USA — Crypto & Digital Assets",
    region: "US",
    category: "crypto",
    query: "Search sam.gov for recent US federal government contract opportunities related to cryptocurrency, blockchain, digital assets, crypto custody, blockchain analytics, or crypto forensics. For each opportunity found, provide: the exact title, the agency name, the country (US), the posted date, the solicitation number, and the URL. Return ONLY a JSON array of objects with fields: title, buyer, country, date, notice_id, url. If you find none, return an empty array [].",
  },
  {
    id: "sam_insider",
    label: "USA — Insider Threat & SIEM",
    region: "US",
    category: "insider_threat",
    query: "Search sam.gov for recent US federal government contract opportunities related to insider threat, SIEM, data loss prevention, UEBA, privileged access management, security operations center, or zero trust. For each opportunity found, provide: the exact title, the agency name, the country (US), the posted date, the solicitation number, and the URL. Return ONLY a JSON array of objects with fields: title, buyer, country, date, notice_id, url. If you find none, return an empty array [].",
  },
  {
    id: "baltic_all",
    label: "Baltics — All Categories",
    region: "Baltics",
    category: "both",
    query: "Search for recent government procurement tenders from Latvia, Lithuania, or Estonia related to cryptocurrency, blockchain, digital assets, insider threat, SIEM, cybersecurity, data loss prevention, or security operations. Check sites like iub.gov.lv, cvpp.eviesiejipirkimai.lt, riigihanked.riik.ee, and TED europa.eu filtered to LV/LT/EE. For each tender found, provide: the exact title, the buyer/contracting authority name, the country, the publication date, the notice ID if available, and the URL. Return ONLY a JSON array of objects with fields: title, buyer, country, date, notice_id, url. If you find none, return an empty array [].",
  },
];

const REGIONS = ["All", "EU", "UK", "Nordics", "US", "Baltics"];
const CATEGORIES = ["All", "crypto", "insider_threat", "both"];

function parseResults(text) {
  try {
    const cleaned = text.replace(/```json\s*/g, "").replace(/```/g, "").trim();
    const start = cleaned.indexOf("[");
    const end = cleaned.lastIndexOf("]");
    if (start === -1 || end === -1) return [];
    const arr = JSON.parse(cleaned.slice(start, end + 1));
    if (!Array.isArray(arr)) return [];
    return arr.filter((r) => r && r.title);
  } catch {
    return [];
  }
}

async function runSearch(search, signal) {
  const resp = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    signal,
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4000,
      system:
        "You are a procurement research assistant. Search the web thoroughly and return ONLY a valid JSON array. No commentary, no markdown fences, no explanation — just the JSON array. If you find no results, return []. Each object must have: title, buyer, country, date, notice_id, url.",
      messages: [{ role: "user", content: search.query }],
      tools: [{ type: "web_search_20250305", name: "web_search" }],
    }),
  });
  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(`API ${resp.status}: ${err.slice(0, 200)}`);
  }
  const data = await resp.json();
  const text = (data.content || [])
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("\n");
  return parseResults(text);
}

function Spinner() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" style={{ animation: "spin 1s linear infinite" }}>
      <circle cx="8" cy="8" r="6" fill="none" stroke="#6b7280" strokeWidth="2" strokeDasharray="28" strokeDashoffset="8" strokeLinecap="round" />
    </svg>
  );
}

export default function ProcurementDashboard() {
  const [results, setResults] = useState([]);
  const [statuses, setStatuses] = useState({});
  const [filter, setFilter] = useState({ q: "", region: "All", category: "All" });
  const [running, setRunning] = useState(false);
  const [lastRun, setLastRun] = useState(null);
  const abortRef = useRef(null);

  const runAll = useCallback(async () => {
    if (running) return;
    setRunning(true);
    setResults([]);
    setStatuses({});
    abortRef.current = new AbortController();

    const allResults = [];
    for (const s of SEARCHES) {
      setStatuses((prev) => ({ ...prev, [s.id]: { status: "loading", count: 0 } }));
      try {
        const items = await runSearch(s, abortRef.current.signal);
        const tagged = items.map((r) => ({
          ...r,
          _region: s.region,
          _category: s.category,
          _source: s.label,
        }));
        allResults.push(...tagged);
        setResults([...allResults]);
        setStatuses((prev) => ({ ...prev, [s.id]: { status: "ok", count: items.length } }));
      } catch (e) {
        if (e.name === "AbortError") break;
        setStatuses((prev) => ({
          ...prev,
          [s.id]: { status: "error", count: 0, error: e.message },
        }));
      }
    }
    setLastRun(new Date().toLocaleString());
    setRunning(false);
  }, [running]);

  const stop = () => {
    abortRef.current?.abort();
    setRunning(false);
  };

  const filtered = results.filter((r) => {
    const blob = [r.title, r.buyer, r.country, r.notice_id, r.url, r._source].join(" ").toLowerCase();
    if (filter.q && !blob.includes(filter.q.toLowerCase())) return false;
    if (filter.region !== "All" && r._region !== filter.region) return false;
    if (filter.category !== "All" && r._category !== filter.category) return false;
    return true;
  });

  const okCount = Object.values(statuses).filter((s) => s.status === "ok").length;
  const errCount = Object.values(statuses).filter((s) => s.status === "error").length;
  const loadCount = Object.values(statuses).filter((s) => s.status === "loading").length;

  return (
    <div style={{ minHeight: "100vh", background: "#0a0e13", color: "#d1d5db", fontFamily: "'IBM Plex Mono', 'JetBrains Mono', 'Fira Code', monospace" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600;700&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap');
        @keyframes spin { to { transform: rotate(360deg) } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(6px) } to { opacity: 1; transform: translateY(0) } }
        @keyframes pulse { 0%, 100% { opacity: 1 } 50% { opacity: 0.5 } }
        * { box-sizing: border-box; }
      `}</style>

      {/* Header */}
      <div style={{ borderBottom: "1px solid #1e2733", padding: "20px 24px", background: "#0d1117" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 17, fontWeight: 700, fontFamily: "'IBM Plex Sans', sans-serif", color: "#f0f6fc", letterSpacing: "-0.3px" }}>
              ◆ PROCUREMENT WATCH
            </h1>
            <div style={{ fontSize: 11, color: "#6b7280", marginTop: 4 }}>
              Live tender search · EU/EEA · UK · Nordics · Baltics · USA
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {lastRun && <span style={{ fontSize: 11, color: "#4b5563" }}>Last: {lastRun}</span>}
            {running ? (
              <button onClick={stop} style={{ padding: "8px 16px", border: "1px solid #dc2626", borderRadius: 6, background: "#1c1012", color: "#f87171", cursor: "pointer", fontSize: 12, fontFamily: "inherit", fontWeight: 600 }}>
                ■ Stop
              </button>
            ) : (
              <button onClick={runAll} style={{ padding: "8px 16px", border: "1px solid #22c55e", borderRadius: 6, background: "#0a1a0f", color: "#4ade80", cursor: "pointer", fontSize: 12, fontFamily: "inherit", fontWeight: 600 }}>
                ▶ Pull contracts
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Health bar */}
      {Object.keys(statuses).length > 0 && (
        <div style={{ borderBottom: "1px solid #1e2733", padding: "12px 24px", background: "#0c1015", display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ display: "flex", gap: 16, fontSize: 12 }}>
            <span style={{ color: "#4ade80" }}>✓ {okCount} ok</span>
            {errCount > 0 && <span style={{ color: "#f87171" }}>✗ {errCount} failed</span>}
            {loadCount > 0 && <span style={{ color: "#fbbf24", animation: "pulse 1.5s infinite" }}>⟳ {loadCount} searching…</span>}
            <span style={{ color: "#9ca3af" }}>{results.length} tenders found</span>
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", flex: 1 }}>
            {SEARCHES.map((s) => {
              const st = statuses[s.id];
              if (!st) return <div key={s.id} style={{ width: 8, height: 8, borderRadius: 2, background: "#1e2733" }} />;
              const bg = st.status === "ok" ? (st.count > 0 ? "#22c55e" : "#6b7280") : st.status === "error" ? "#ef4444" : "#eab308";
              return (
                <div key={s.id} title={`${s.label}: ${st.count} results${st.error ? " — " + st.error : ""}`} style={{ width: 8, height: 8, borderRadius: 2, background: bg, animation: st.status === "loading" ? "pulse 1s infinite" : "none" }} />
              );
            })}
          </div>
        </div>
      )}

      {/* Source detail */}
      {Object.keys(statuses).length > 0 && (
        <div style={{ borderBottom: "1px solid #1e2733", padding: "10px 24px", background: "#0b0f14" }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 12px" }}>
            {SEARCHES.map((s) => {
              const st = statuses[s.id];
              if (!st) return null;
              const color = st.status === "ok" ? (st.count > 0 ? "#4ade80" : "#6b7280") : st.status === "error" ? "#f87171" : "#fbbf24";
              return (
                <div key={s.id} style={{ fontSize: 10, color, whiteSpace: "nowrap" }}>
                  {st.status === "loading" ? "⟳" : st.status === "ok" ? "✓" : "✗"} {s.label} ({st.count})
                  {st.error && <span style={{ color: "#f87171", marginLeft: 4 }}>{st.error.slice(0, 50)}</span>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Filters */}
      <div style={{ padding: "14px 24px", display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", borderBottom: "1px solid #1e2733" }}>
        <input
          value={filter.q}
          onChange={(e) => setFilter((f) => ({ ...f, q: e.target.value }))}
          placeholder="Search titles, buyers, countries…"
          style={{ background: "#111820", color: "#d1d5db", border: "1px solid #1e2733", borderRadius: 6, padding: "7px 10px", fontSize: 12, fontFamily: "inherit", width: 260 }}
        />
        <select value={filter.region} onChange={(e) => setFilter((f) => ({ ...f, region: e.target.value }))} style={{ background: "#111820", color: "#d1d5db", border: "1px solid #1e2733", borderRadius: 6, padding: "7px 10px", fontSize: 12, fontFamily: "inherit" }}>
          {REGIONS.map((r) => <option key={r} value={r}>{r === "All" ? "All regions" : r}</option>)}
        </select>
        <select value={filter.category} onChange={(e) => setFilter((f) => ({ ...f, category: e.target.value }))} style={{ background: "#111820", color: "#d1d5db", border: "1px solid #1e2733", borderRadius: 6, padding: "7px 10px", fontSize: 12, fontFamily: "inherit" }}>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c === "All" ? "All categories" : c === "crypto" ? "Crypto / Blockchain" : c === "insider_threat" ? "Insider Threat / SIEM" : "Both"}</option>)}
        </select>
        <button onClick={() => setFilter({ q: "", region: "All", category: "All" })} style={{ background: "#111820", color: "#6b7280", border: "1px solid #1e2733", borderRadius: 6, padding: "7px 10px", fontSize: 11, cursor: "pointer", fontFamily: "inherit" }}>
          Reset
        </button>
        <span style={{ fontSize: 11, color: "#4b5563", marginLeft: 4 }}>
          {filtered.length} / {results.length}
        </span>
      </div>

      {/* Results */}
      <div style={{ padding: "0 24px 40px" }}>
        {results.length === 0 && !running && (
          <div style={{ textAlign: "center", padding: "80px 20px", color: "#4b5563" }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>◆</div>
            <div style={{ fontSize: 14, fontFamily: "'IBM Plex Sans', sans-serif", marginBottom: 8 }}>No tenders loaded yet</div>
            <div style={{ fontSize: 12 }}>
              Hit <span style={{ color: "#4ade80", fontWeight: 600 }}>▶ Pull contracts</span> to search across 9 sources
            </div>
          </div>
        )}

        {results.length === 0 && running && (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "#6b7280" }}>
            <div style={{ animation: "pulse 1.5s infinite", fontSize: 14 }}>Searching procurement portals…</div>
          </div>
        )}

        {filtered.length > 0 && (
          <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 8 }}>
            <thead>
              <tr>
                {["Date", "Region", "Category", "Title", "Buyer", "Source"].map((h) => (
                  <th key={h} style={{ textAlign: "left", padding: "10px 8px", fontSize: 10, color: "#6b7280", fontWeight: 600, borderBottom: "1px solid #1e2733", textTransform: "uppercase", letterSpacing: "0.5px", position: "sticky", top: 0, background: "#0a0e13" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, i) => (
                <tr key={i} style={{ animation: `fadeIn 0.3s ease ${Math.min(i * 0.03, 1)}s both`, borderBottom: "1px solid #141b23" }}>
                  <td style={{ padding: "10px 8px", fontSize: 11, color: "#6b7280", whiteSpace: "nowrap", verticalAlign: "top" }}>
                    {r.date || "—"}
                  </td>
                  <td style={{ padding: "10px 8px", verticalAlign: "top" }}>
                    <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 4, border: "1px solid #1e2733", color: r._region === "EU" ? "#60a5fa" : r._region === "UK" ? "#a78bfa" : r._region === "US" ? "#fbbf24" : r._region === "Nordics" ? "#34d399" : "#f472b6", background: "transparent" }}>
                      {r.country || r._region}
                    </span>
                  </td>
                  <td style={{ padding: "10px 8px", verticalAlign: "top" }}>
                    <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 4, border: `1px solid ${r._category === "crypto" ? "#22543d" : r._category === "insider_threat" ? "#3b1764" : "#4a3520"}`, color: r._category === "crypto" ? "#4ade80" : r._category === "insider_threat" ? "#c084fc" : "#fbbf24" }}>
                      {r._category === "crypto" ? "crypto" : r._category === "insider_threat" ? "insider" : "both"}
                    </span>
                  </td>
                  <td style={{ padding: "10px 8px", verticalAlign: "top", maxWidth: 400 }}>
                    {r.url ? (
                      <a href={r.url} target="_blank" rel="noopener noreferrer" style={{ color: "#93c5fd", textDecoration: "none", fontSize: 12, lineHeight: 1.4 }}>
                        {r.title}
                      </a>
                    ) : (
                      <span style={{ fontSize: 12, lineHeight: 1.4 }}>{r.title}</span>
                    )}
                    {r.notice_id && <div style={{ fontSize: 10, color: "#4b5563", marginTop: 2 }}>{r.notice_id}</div>}
                  </td>
                  <td style={{ padding: "10px 8px", fontSize: 11, color: "#9ca3af", verticalAlign: "top", maxWidth: 200 }}>
                    {r.buyer || "—"}
                  </td>
                  <td style={{ padding: "10px 8px", fontSize: 10, color: "#4b5563", verticalAlign: "top", whiteSpace: "nowrap" }}>
                    {r._source}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
