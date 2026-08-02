import { useState, useEffect, useMemo } from "react";
import { CiEdit } from "react-icons/ci";
import { FaCalendarDays } from "react-icons/fa6";


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

function buildICS(project) {
  if (!project.mintDate) return "";

  const startDate = new Date(project.mintDate);
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
    "TRIGGER:-PT15M",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

function downloadICS(project) {
  const ics = buildICS(project);
  if (!ics) return;
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
  eligible: { label: "Eligible", bg: "rgba(56, 189, 248, 0.12)", color: "#38bdf8", border: "rgba(56, 189, 248, 0.3)" },
  not_eligible: { label: "Not Eligible", bg: "rgba(244, 63, 94, 0.12)", color: "#fb7185", border: "rgba(244, 63, 94, 0.3)" },
  unchecked: { label: "Unchecked", bg: "rgba(148, 163, 184, 0.08)", color: "#94a3b8", border: "rgba(148, 163, 184, 0.2)" },
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
      title="Click to cycle status"
    >
      <span className="dot" style={{ backgroundColor: cfg.color }} />
      {cfg.label}
    </button>
  );
}

export default function AllowlistLedgerApp() {
  const [currentPage, setCurrentPage] = useState("app");
  const [wallets, setWallets] = useState(() => load(STORAGE.wallets, []));
  const [projects, setProjects] = useState(() => load(STORAGE.projects, []));
  const [eligibility, setEligibility] = useState(() => load(STORAGE.eligibility, {}));
  const [viewMode, setViewMode] = useState("cards");
  const [searchQuery, setSearchQuery] = useState("");

  const [showAddWallet, setShowAddWallet] = useState(false);
  const [showAddProject, setShowAddProject] = useState(false);
  const [editingProject, setEditingProject] = useState(null); // Stores project being edited

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

  function updateProject(id, name, mintDate, sourceUrl) {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, name: name.trim(), mintDate, sourceUrl: sourceUrl.trim() } : p
      )
    );
    setEditingProject(null);
  }

  function removeWallet(id) {
    setWallets((prev) => prev.filter((w) => w.id !== id));
  }

  function removeProject(id) {
    setProjects((prev) => prev.filter((p) => p.id !== id));
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
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');

        :root {
          --bg-main: #030712;
          --bg-surface: rgba(15, 23, 42, 0.65);
          --bg-surface-hover: rgba(30, 41, 59, 0.8);
          --border-color: rgba(255, 255, 255, 0.08);
          --border-highlight: rgba(56, 189, 248, 0.3);
          --text-main: #f8fafc;
          --text-muted: #94a3b8;
          --accent: #38bdf8;
          --accent-glow: rgba(56, 189, 248, 0.35);
        }

        .app-container {
          min-height: 100vh;
          background-color: var(--bg-main);
          color: var(--text-main);
          font-family: 'Plus Jakarta Sans', sans-serif;
          position: relative;
          overflow: hidden;
          box-sizing: border-box;
        }

        .font-mono {
          font-family: 'JetBrains Mono', monospace;
        }

        .bg-grid {
          position: absolute;
          inset: 0;
          background-image: linear-gradient(to right, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
          background-size: 80px 100%;
          pointer-events: none;
          z-index: 0;
        }

        .navbar {
          position: relative;
          z-index: 10;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 24px 40px;
          max-width: 1280px;
          margin: 0 auto;
        }

        .brand-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          font-weight: 700;
          font-size: 20px;
          letter-spacing: -0.02em;
          cursor: pointer;
        }

        .brand-icon {
          width: 22px;
          height: 22px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .brand-icon-bar {
          height: 5px;
          background: #38bdf8;
          border-radius: 2px;
        }

        .brand-icon-bar:nth-child(2) {
          width: 75%;
        }

        .btn-pill {
          background: #38bdf8;
          color: #030712;
          border: none;
          padding: 8px 20px;
          border-radius: 30px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 0 20px var(--accent-glow);
        }

        .btn-pill:hover {
          background: #7dd3fc;
          box-shadow: 0 0 28px rgba(56, 189, 248, 0.5);
        }

        .main-wrapper {
          position: relative;
          z-index: 5;
          max-width: 1080px;
          margin: 0 auto;
          padding: 32px 20px;
        }

        .header {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-bottom: 28px;
        }

        @media (min-width: 640px) {
          .header {
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
          }
        }

        .header-titles h1 {
          font-size: 22px;
          font-weight: 700;
          margin: 0 0 6px 0;
          letter-spacing: -0.02em;
        }

        .header-titles p {
          color: var(--text-muted);
          font-size: 13px;
          margin: 0;
        }

        .header-actions {
          display: flex;
          gap: 10px;
          align-items: center;
        }

        .btn {
          background-color: var(--bg-surface);
          color: var(--text-main);
          border: 1px solid var(--border-color);
          padding: 8px 14px;
          border-radius: 8px;
          font-weight: 500;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.15s ease;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          backdrop-filter: blur(8px);
        }

        .btn:hover {
          background-color: var(--bg-surface-hover);
          border-color: var(--border-highlight);
        }

        .controls-bar {
          display: flex;
          gap: 12px;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .search-input {
          background: var(--bg-surface);
          border: 1px solid var(--border-color);
          color: var(--text-main);
          padding: 8px 14px;
          border-radius: 8px;
          font-size: 13px;
          width: 100%;
          max-width: 280px;
          outline: none;
          transition: border-color 0.15s ease;
          backdrop-filter: blur(8px);
        }

        .search-input:focus {
          border-color: var(--accent);
        }

        .view-toggle {
          display: flex;
          background: var(--bg-surface);
          padding: 3px;
          border-radius: 8px;
          border: 1px solid var(--border-color);
        }

        .toggle-btn {
          background: transparent;
          border: none;
          color: var(--text-muted);
          padding: 5px 12px;
          font-size: 12px;
          font-weight: 500;
          border-radius: 6px;
          cursor: pointer;
        }

        .toggle-btn.active {
          background: var(--accent);
          color: #030712;
          font-weight: 600;
        }

        .cards-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
        }

        @media (min-width: 640px) {
          .cards-grid {
            grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          }
        }

        .project-card {
          background: var(--bg-surface);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 16px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          backdrop-filter: blur(8px);
          transition: border-color 0.15s ease;
        }

        .project-card:hover {
          border-color: var(--border-highlight);
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 12px;
        }

        .card-title {
          font-size: 15px;
          font-weight: 600;
          margin: 0 0 4px 0;
        }

        .card-date {
          font-size: 12px;
          color: var(--text-muted);
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }

        .card-date:hover {
          color: var(--accent);
        }

        .wallet-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin: 12px 0;
        }

        .wallet-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 6px 0;
        }

        .wallet-name {
          font-size: 13px;
          font-weight: 500;
        }

        .wallet-addr-text {
          font-size: 11px;
          color: var(--text-muted);
          margin-top: 1px;
        }

        .status-badge {
          border: 1px solid;
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 500;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: transform 0.1s ease;
        }

        .status-badge:active {
          transform: scale(0.96);
        }

        .dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
        }

        .card-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-top: 1px solid var(--border-color);
          padding-top: 12px;
          margin-top: 8px;
        }

        .btn-sm {
          padding: 5px 10px;
          font-size: 11px;
          border-radius: 6px;
        }

        .table-wrap {
          overflow-x: auto;
          border: 1px solid var(--border-color);
          border-radius: 12px;
          background: var(--bg-surface);
          backdrop-filter: blur(8px);
        }

        table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }

        th, td {
          padding: 12px 16px;
          border-bottom: 1px solid var(--border-color);
        }

        th {
          background: rgba(0, 0, 0, 0.2);
          color: var(--text-muted);
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(6px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
          z-index: 100;
        }

        .modal-content {
          background: #090d16;
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 20px;
          width: 100%;
          max-width: 400px;
        }

        .modal-content h3 {
          margin: 0 0 16px 0;
          font-size: 16px;
        }

        .form-group {
          margin-bottom: 14px;
        }

        .form-group label {
          display: block;
          font-size: 11px;
          color: var(--text-muted);
          margin-bottom: 6px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .form-group input {
          width: 100%;
          padding: 8px 12px;
          background: var(--bg-main);
          border: 1px solid var(--border-color);
          border-radius: 6px;
          color: var(--text-main);
          box-sizing: border-box;
          font-size: 13px;
          outline: none;
        }

        .form-group input:focus {
          border-color: var(--accent);
        }
      `}</style>

      <div className="bg-grid" />

      <nav className="navbar">
        <div className="brand-logo">
          <div className="brand-icon">
            <div className="brand-icon-bar" />
            <div className="brand-icon-bar" />
            <div className="brand-icon-bar" />
          </div>
          <span>Allowlist Ledger</span>
        </div>
      </nav>

      <div className="main-wrapper">
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
              + Wallet
            </button>
            <button className="btn-pill" onClick={() => setShowAddProject(true)}>
              + Project
            </button>
          </div>
        </div>

        <div className="controls-bar">
          <input
            type="text"
            className="search-input"
            placeholder="Search projects..."
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

        {viewMode === "cards" && (
          <div className="cards-grid">
            {filteredProjects.map((p) => (
              <div key={p.id} className="project-card">
                <div>
                  <div className="card-header">
                    <div>
                      <h3 className="card-title">{p.name}</h3>
                      <div className="card-date font-mono" onClick={() => setEditingProject(p)} title="Click to update date">
                        <FaCalendarDays className="text-[#38bdf8]"/>{" "}
                        {p.mintDate
                          ? new Date(p.mintDate).toLocaleString([], {
                              dateStyle: "short",
                              timeStyle: "short",
                            })
                          : "TBD (Click to set)"} <CiEdit />
                      </div>
                    </div>
                    <button
                      className="btn btn-sm"
                      style={{ color: "#fb7185", background: "transparent", border: "none" }}
                      onClick={() => removeProject(p.id)}
                    >
                      ✕
                    </button>
                  </div>

                  <div className="wallet-list">
                    {wallets.length > 0 ? (
                      wallets.map((w) => (
                        <div key={w.id} className="wallet-row">
                          <div>
                            <div className="wallet-name">{w.label || "Unlabeled"}</div>
                            <div className="wallet-addr-text font-mono">{shortAddr(w.address)}</div>
                          </div>
                          <StatusBadge
                            status={getStatus(w.id, p.id)}
                            onClick={() => cycleStatus(w.id, p.id)}
                          />
                        </div>
                      ))
                    ) : (
                      <div style={{ padding: "8px 0", fontSize: 12, color: "var(--text-muted)" }}>
                        No wallets added yet.
                      </div>
                    )}
                  </div>
                </div>

                <div className="card-footer">
                  <button className="btn btn-sm" onClick={() => setEditingProject(p)}>
                    Edit
                  </button>
                  {p.mintDate && (
                    <button className="btn btn-sm" onClick={() => downloadICS(p)}>
                      + Calendar
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {viewMode === "table" && (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Project</th>
                  {wallets.map((w) => (
                    <th key={w.id}>
                      <div>{w.label || "Unlabeled"}</div>
                      <div className="font-mono" style={{ fontSize: 10, color: "var(--text-muted)" }}>
                        {shortAddr(w.address)}
                      </div>
                    </th>
                  ))}
                  <th style={{ width: 60 }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredProjects.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <strong>{p.name}</strong>
                      <div
                        className="font-mono card-date"
                        style={{ fontSize: 11 }}
                        onClick={() => setEditingProject(p)}
                      >
                        {p.mintDate
                          ? new Date(p.mintDate).toLocaleString([], {
                              dateStyle: "short",
                              timeStyle: "short",
                            })
                          : "TBD (Set date)"} ✏️
                      </div>
                    </td>
                    {wallets.map((w) => (
                      <td key={w.id}>
                        <StatusBadge
                          status={getStatus(w.id, p.id)}
                          onClick={() => cycleStatus(w.id, p.id)}
                        />
                      </td>
                    ))}
                    <td>
                      <button className="btn btn-sm" onClick={() => setEditingProject(p)}>
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* EDIT PROJECT MODAL */}
        {editingProject && (
          <div className="modal-overlay" onClick={() => setEditingProject(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h3>Edit Project</h3>
              <div className="form-group">
                <label>Project Name</label>
                <input id="edit-p-name" defaultValue={editingProject.name} />
              </div>
              <div className="form-group">
                <label>Mint Date & Time</label>
                <input id="edit-p-date" type="datetime-local" defaultValue={editingProject.mintDate || ""} />
              </div>
              <div className="form-group">
                <label>Source URL (Optional)</label>
                <input id="edit-p-url" defaultValue={editingProject.sourceUrl || ""} />
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 18 }}>
                <button className="btn" onClick={() => setEditingProject(null)}>
                  Cancel
                </button>
                <button
                  className="btn-pill"
                  onClick={() => {
                    const name = document.getElementById("edit-p-name").value;
                    const date = document.getElementById("edit-p-date").value;
                    const url = document.getElementById("edit-p-url").value;
                    if (name) updateProject(editingProject.id, name, date, url);
                  }}
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ADD PROJECT MODAL */}
        {showAddProject && (
          <div className="modal-overlay" onClick={() => setShowAddProject(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h3>Add Project</h3>
              <div className="form-group">
                <label>Project Name</label>
                <input id="p-name" placeholder="e.g. Aero Genesis" />
              </div>
              <div className="form-group">
                <label>Mint Date & Time (Leave empty if TBD)</label>
                <input id="p-date" type="datetime-local" />
              </div>
              <div className="form-group">
                <label>Source URL (Optional)</label>
                <input id="p-url" placeholder="https://..." />
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 18 }}>
                <button className="btn" onClick={() => setShowAddProject(false)}>
                  Cancel
                </button>
                <button
                  className="btn-pill"
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

        {/* ADD WALLET MODAL */}
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
                <input id="w-addr" className="font-mono" placeholder="0x..." />
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 18 }}>
                <button className="btn" onClick={() => setShowAddWallet(false)}>
                  Cancel
                </button>
                <button
                  className="btn-pill"
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
      </div>
    </div>
  );
}