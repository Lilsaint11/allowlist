import { useState, useEffect, useMemo } from "react";

const STORAGE = {
  wallets: "ledger:wallets",
  projects: "ledger:projects",
  eligibility: "ledger:eligibility",
};

const uid = () => Math.random().toString(36).slice(2, 9);

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function shortAddr(addr) {
  if (!addr) return "";
  return addr.length > 12 ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : addr;
}

function normalize(addr) {
  return (addr || "").trim().toLowerCase();
}

function parseAddressList(raw) {
  const text = raw.trim();
  if (!text) return [];
  try {
    const json = JSON.parse(text);
    if (Array.isArray(json)) {
      return json
        .map((item) => (typeof item === "string" ? item : item?.address || item?.wallet || ""))
        .map(normalize)
        .filter(Boolean);
    }
  } catch {}
  return text
    .split(/[\n,]/)
    .map((s) => s.trim())
    .filter((s) => s.startsWith("0x"))
    .map(normalize);
}

function buildICS(project) {
  if (!project.mintDate) return "";

  const startDate = new Date(project.mintDate);
  // Default to 1 hour event duration
  const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);

  const formatICSDate = (d) =>
    d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

  const start = formatICSDate(startDate);
  const end = formatICSDate(endDate);
  const stamp = formatICSDate(new Date());

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Allowlist Ledger//Mint Reminder//EN",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${project.id}@allowlist-ledger`,
    `DTSTAMP:${stamp}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${project.name} — Mint Time`,
    `DESCRIPTION:Mint event tracked in Allowlist Ledger.`,
    "BEGIN:VALARM",
    "ACTION:DISPLAY",
    "DESCRIPTION:Mint starting in 15 minutes!",
    "TRIGGER:-PT15M", // 15-minute alert
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

function downloadICS(project) {
  const ics = buildICS(project);
  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${project.name.replace(/[^a-z0-9]/gi, "-").toLowerCase()}-mint.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

const STATUS_CONFIG = {
  eligible: { label: "Eligible", bg: "rgba(34, 197, 94, 0.15)", color: "#4ade80", border: "#22c55e" },
  not_eligible: { label: "Not Eligible", bg: "rgba(239, 68, 68, 0.15)", color: "#f87171", border: "#ef4444" },
  unchecked: { label: "Unchecked", bg: "rgba(148, 163, 184, 0.1)", color: "#94a3b8", border: "#475569" },
};

function StatusBadge({ status, onClick }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.unchecked;
  return (
    <button
      onClick={onClick}
      className="status-badge"
      style={{
        backgroundColor: cfg.bg,
        color: cfg.color,
        borderColor: cfg.border,
      }}
      title="Click to change status"
    >
      <span className="dot" style={{ backgroundColor: cfg.color }} />
      {cfg.label}
    </button>
  );
}

export default function EligibilityMatrix() {
  const [wallets, setWallets] = useState(() => load(STORAGE.wallets, []));
  const [projects, setProjects] = useState(() => load(STORAGE.projects, []));
  const [eligibility, setEligibility] = useState(() => load(STORAGE.eligibility, {}));
  const [viewMode, setViewMode] = useState("cards"); // 'cards' | 'table'
  const [searchQuery, setSearchQuery] = useState("");

  const [showAddWallet, setShowAddWallet] = useState(false);
  const [showAddProject, setShowAddProject] = useState(false);
  const [checkModalProject, setCheckModalProject] = useState(null);

  useEffect(() => localStorage.setItem(STORAGE.wallets, JSON.stringify(wallets)), [wallets]);
  useEffect(() => localStorage.setItem(STORAGE.projects, JSON.stringify(projects)), [projects]);
  useEffect(() => localStorage.setItem(STORAGE.eligibility, JSON.stringify(eligibility)), [eligibility]);

  const cellKey = (walletId, projectId) => `${walletId}|${projectId}`;

  function getStatus(walletId, projectId) {
    return eligibility[cellKey(walletId, projectId)]?.status || "unchecked";
  }

  function cycleStatus(walletId, projectId) {
    const order = ["unchecked", "eligible", "not_eligible"];
    const current = getStatus(walletId, projectId);
    const next = order[(order.indexOf(current) + 1) % order.length];
    setEligibility((prev) => ({
      ...prev,
      [cellKey(walletId, projectId)]: {
        status: next,
        method: "manual",
        checkedAt: new Date().toISOString(),
      },
    }));
  }

  function addWallet(address, label) {
    setWallets((prev) => [...prev, { id: uid(), address: address.trim(), label: label.trim() }]);
    setShowAddWallet(false);
  }

  function addProject(name, mintDate, sourceUrl) {
    setProjects((prev) => [...prev, { id: uid(), name: name.trim(), mintDate, sourceUrl: sourceUrl.trim() }]);
    setShowAddProject(false);
  }

  function removeWallet(id) {
    setWallets((prev) => prev.filter((w) => w.id !== id));
  }

  function removeProject(id) {
    setProjects((prev) => prev.filter((p) => p.id !== id));
  }

  function applyBulkResult(projectId, matchedAddresses) {
    const matchedSet = new Set(matchedAddresses.map(normalize));
    setEligibility((prev) => {
      const next = { ...prev };
      wallets.forEach((w) => {
        next[cellKey(w.id, projectId)] = {
          status: matchedSet.has(normalize(w.address)) ? "eligible" : "not_eligible",
          method: "auto",
          checkedAt: new Date().toISOString(),
        };
      });
      return next;
    });
  }

  const filteredProjects = useMemo(() => {
    return projects
      .filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
      .sort((a, b) => {
        if (!a.mintDate) return 1;
        if (!b.mintDate) return -1;
        return new Date(a.mintDate) - new Date(b.mintDate);
      });
  }, [projects, searchQuery]);

  return (
    <div className="app-container">
      <style>{`
        :root {
          --bg-main: #0f172a;
          --bg-card: #1e293b;
          --bg-card-hover: #334155;
          --border-color: #334155;
          --text-main: #f8fafc;
          --text-muted: #94a3b8;
          --accent: #6366f1;
          --accent-hover: #4f46e5;
        }

        .app-container {
          min-height: 100vh;
          background-color: var(--bg-main);
          color: var(--text-main);
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          padding: 20px;
          box-sizing: border-box;
        }

        .header {
          display: flex;
          flex-direction: column;
          gap: 16px;
          max-width: 1200px;
          margin: 0 auto 24px auto;
        }

        @media (min-width: 768px) {
          .header {
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
          }
        }

        .header-titles h1 {
          font-size: 24px;
          font-weight: 700;
          margin: 0 0 4px 0;
          letter-spacing: -0.02em;
        }

        .header-titles p {
          color: var(--text-muted);
          font-size: 14px;
          margin: 0;
        }

        .header-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          align-items: center;
        }

        .btn {
          background-color: var(--bg-card);
          color: var(--text-main);
          border: 1px solid var(--border-color);
          padding: 10px 16px;
          border-radius: 8px;
          font-weight: 500;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s ease;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }

        .btn:hover {
          background-color: var(--bg-card-hover);
        }

        .btn-primary {
          background-color: var(--accent);
          border-color: var(--accent);
        }

        .btn-primary:hover {
          background-color: var(--accent-hover);
        }

        .controls-bar {
          max-width: 1200px;
          margin: 0 auto 24px auto;
          display: flex;
          gap: 12px;
          justify-content: space-between;
          align-items: center;
        }

        .search-input {
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          color: var(--text-main);
          padding: 8px 14px;
          border-radius: 8px;
          font-size: 14px;
          width: 100%;
          max-width: 320px;
        }

        .view-toggle {
          display: flex;
          background: var(--bg-card);
          padding: 3px;
          border-radius: 8px;
          border: 1px solid var(--border-color);
        }

        .toggle-btn {
          background: transparent;
          border: none;
          color: var(--text-muted);
          padding: 6px 12px;
          font-size: 13px;
          font-weight: 500;
          border-radius: 6px;
          cursor: pointer;
        }

        .toggle-btn.active {
          background: var(--accent);
          color: white;
        }

        /* Card List Styles (Mobile Friendly) */
        .cards-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
          max-width: 1200px;
          margin: 0 auto;
        }

        @media (min-width: 768px) {
          .cards-grid {
            grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
          }
        }

        .project-card {
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 18px;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        .card-title {
          font-size: 18px;
          font-weight: 600;
          margin: 0 0 4px 0;
        }

        .card-date {
          font-size: 12px;
          color: var(--text-muted);
        }

        .wallet-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
          border-top: 1px solid var(--border-color);
          padding-top: 12px;
        }

        .wallet-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
        }

        .wallet-info {
          display: flex;
          flex-direction: column;
        }

        .wallet-name {
          font-size: 13px;
          font-weight: 500;
        }

        .wallet-addr-text {
          font-size: 11px;
          color: var(--text-muted);
          font-family: monospace;
        }

        .status-badge {
          border: 1px solid;
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: transform 0.1s ease;
        }

        .status-badge:active {
          transform: scale(0.95);
        }

        .dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
        }

        .card-footer {
          display: flex;
          gap: 8px;
          border-top: 1px solid var(--border-color);
          padding-top: 12px;
        }

        .btn-sm {
          padding: 6px 10px;
          font-size: 12px;
          border-radius: 6px;
        }

        /* Matrix Table View */
        .table-wrap {
          max-width: 1200px;
          margin: 0 auto;
          overflow-x: auto;
          border: 1px solid var(--border-color);
          border-radius: 12px;
          background: var(--bg-card);
        }

        table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }

        th, td {
          padding: 14px;
          border-bottom: 1px solid var(--border-color);
        }

        th {
          background: #111827;
          color: var(--text-muted);
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        /* Modals */
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
          z-index: 100;
        }

        .modal-content {
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 24px;
          width: 100%;
          max-width: 440px;
        }

        .form-group {
          margin-bottom: 16px;
        }

        .form-group label {
          display: block;
          font-size: 12px;
          color: var(--text-muted);
          margin-bottom: 6px;
          text-transform: uppercase;
        }

        .form-group input, .form-group textarea {
          width: 100%;
          padding: 10px;
          background: var(--bg-main);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          color: var(--text-main);
          box-sizing: border-box;
        }
      `}</style>

      {/* Main Header */}
      <div className="header">
        <div className="header-titles">
          <h1>Allowlist Ledger</h1>
          <p>
            Tracking {wallets.length} wallet{wallets.length !== 1 ? "s" : ""} across {projects.length} project
            {projects.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="header-actions">
          <button className="btn" onClick={() => setShowAddWallet(true)}>
            + Add Wallet
          </button>
          <button className="btn btn-primary" onClick={() => setShowAddProject(true)}>
            + Add Project
          </button>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="controls-bar">
        <input
          type="text"
          className="search-input"
          placeholder="Filter projects..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <div className="view-toggle">
          <button
            className={`toggle-btn ${viewMode === "cards" ? "active" : ""}`}
            onClick={() => setViewMode("cards")}
          >
            Cards
          </button>
          <button
            className={`toggle-btn ${viewMode === "table" ? "active" : ""}`}
            onClick={() => setViewMode("table")}
          >
            Matrix
          </button>
        </div>
      </div>

      {/* CARDS VIEW (Mobile optimized) */}
      {viewMode === "cards" && (
        <div className="cards-grid">
          {filteredProjects.map((p) => (
            <div key={p.id} className="project-card">
              <div className="card-header">
                <div>
                  <h3 className="card-title">{p.name}</h3>
                 {/* Example for Card Display */}
                  <div className="card-date">
                    📅 {p.mintDate ? new Date(p.mintDate).toLocaleString([], {
                        dateStyle: 'short',
                        timeStyle: 'short'
                      }) : "TBD"}
                  </div>
                </div>
                <button
                  className="btn btn-sm"
                  style={{ color: "#ef4444", background: "transparent", border: "none" }}
                  onClick={() => removeProject(p.id)}
                >
                  ✕
                </button>
              </div>

              <div className="wallet-list">
                {wallets.map((w) => (
                  <div key={w.id} className="wallet-row">
                    <div className="wallet-info">
                      <span className="wallet-name">{w.label || "Unlabeled"}</span>
                      <span className="wallet-addr-text">{shortAddr(w.address)}</span>
                    </div>
                    <StatusBadge
                      status={getStatus(w.id, p.id)}
                      onClick={() => cycleStatus(w.id, p.id)}
                    />
                  </div>
                ))}
              </div>

              <div className="card-footer">
                {p.sourceUrl && (
                  <button className="btn btn-sm" onClick={() => setCheckModalProject(p)}>
                    Auto Check
                  </button>
                )}
                {p.mintDate && (
                  <button className="btn btn-sm" onClick={() => downloadICS(p)}>
                    Add Calendar
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MATRIX TABLE VIEW (Desktop optimized) */}
      {viewMode === "table" && (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Project</th>
                {wallets.map((w) => (
                  <th key={w.id}>
                    <div>{w.label || "Unlabeled"}</div>
                    <div style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "monospace" }}>
                      {shortAddr(w.address)}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredProjects.map((p) => (
                <tr key={p.id}>
                  <td>
                    <strong>{p.name}</strong>
                    <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{p.mintDate || "No date"}</div>
                  </td>
                  {wallets.map((w) => (
                    <td key={w.id}>
                      <StatusBadge
                        status={getStatus(w.id, p.id)}
                        onClick={() => cycleStatus(w.id, p.id)}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Wallet Modal */}
      {showAddWallet && (
        <div className="modal-overlay" onClick={() => setShowAddWallet(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Add Wallet</h3>
            <div className="form-group">
              <label>Label</label>
              <input id="w-label" placeholder="e.g. Main Vault" />
            </div>
            <div className="form-group">
              <label>Address</label>
              <input id="w-addr" placeholder="0x..." />
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <button className="btn" onClick={() => setShowAddWallet(false)}>
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={() => {
                  const label = document.getElementById("w-label").value;
                  const addr = document.getElementById("w-addr").value;
                  if (addr) addWallet(addr, label);
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Project Modal */}
      {showAddProject && (
          <div className="modal-overlay" onClick={() => setShowAddProject(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h3>Add Project</h3>
              <div className="form-group">
                <label>Project Name</label>
                <input id="p-name" placeholder="e.g. Pudgy Penguins" />
              </div>
              <div className="form-group">
                <label>Mint Date & Time</label>
                {/* Changed from 'date' to 'datetime-local' */}
                <input id="p-date" type="datetime-local" />
              </div>
              <div className="form-group">
                <label>Source URL (Optional)</label>
                <input id="p-url" placeholder="https://..." />
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                <button className="btn" onClick={() => setShowAddProject(false)}>
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    const name = document.getElementById("p-name").value;
                    const date = document.getElementById("p-date").value;
                    const url = document.getElementById("p-url").value;
                    if (name) addProject(name, date, url);
                  }}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
      )}
    </div>
  );
}