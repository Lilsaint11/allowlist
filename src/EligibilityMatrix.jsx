import { useState, useEffect, useMemo } from "react";

/* ============================================================
   ALLOWLIST LEDGER — Eligibility Matrix
   Drop this component into your existing Vite/React project.
   It's self-contained: own state, own localStorage keys
   ("ledger:wallets", "ledger:projects", "ledger:eligibility").
   Rename the keys if you want it to share storage with your
   existing app, or lift the state up into your current store.
   ============================================================ */

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

/** Accepts JSON array, JSON array of {address}, or raw CSV/newline text. */
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
  } catch {
    /* not JSON, fall through to CSV/newline parsing */
  }
  return text
    .split(/[\n,]/)
    .map((s) => s.trim())
    .filter((s) => s.startsWith("0x"))
    .map(normalize);
}

function pad(n) {
  return String(n).padStart(2, "0");
}

function toICSDate(dateStr) {
  // dateStr is "YYYY-MM-DD" from a <input type="date">
  return dateStr.replace(/-/g, "");
}

function nextDayICS(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  d.setDate(d.getDate() + 1);
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;
}

function escapeICSText(text) {
  return String(text).replace(/[\\;,]/g, (m) => `\\${m}`).replace(/\n/g, "\\n");
}

function buildICS(project) {
  const start = toICSDate(project.mintDate);
  const end = nextDayICS(project.mintDate);
  const stamp =
    new Date()
      .toISOString()
      .replace(/[-:]/g, "")
      .split(".")[0] + "Z";
  const uid = `${project.id}@allowlist-ledger`;

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Allowlist Ledger//Mint Reminder//EN",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${stamp}`,
    `DTSTART;VALUE=DATE:${start}`,
    `DTEND;VALUE=DATE:${end}`,
    `SUMMARY:${escapeICSText(`${project.name} — mint`)}`,
    `DESCRIPTION:${escapeICSText("Mint day tracked in Allowlist Ledger.")}`,
    "BEGIN:VALARM",
    "ACTION:DISPLAY",
    "DESCRIPTION:Mint day reminder",
    "TRIGGER:-P1D",
    "END:VALARM",
    "BEGIN:VALARM",
    "ACTION:DISPLAY",
    "DESCRIPTION:Mint day reminder",
    "TRIGGER:-PT1H",
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

const STATUS = {
  eligible: { label: "ELIGIBLE", short: "OK" },
  not_eligible: { label: "NOT ELIG.", short: "NO" },
  unchecked: { label: "UNCHECKED", short: "—" },
};

function Stamp({ status, onClick }) {
  const s = STATUS[status] || STATUS.unchecked;
  return (
    <button
      onClick={onClick}
      className="stamp"
      data-status={status}
      title="Click to cycle status manually"
    >
      [{s.short === "—" ? "—" : s.short}]
    </button>
  );
}

export default function EligibilityMatrix() {
  const [wallets, setWallets] = useState(() => load(STORAGE.wallets, []));
  const [projects, setProjects] = useState(() => load(STORAGE.projects, []));
  const [eligibility, setEligibility] = useState(() => load(STORAGE.eligibility, {}));

  const [showAddWallet, setShowAddWallet] = useState(false);
  const [showAddProject, setShowAddProject] = useState(false);
  const [checkModalProject, setCheckModalProject] = useState(null);

  useEffect(() => localStorage.setItem(STORAGE.wallets, JSON.stringify(wallets)), [wallets]);
  useEffect(() => localStorage.setItem(STORAGE.projects, JSON.stringify(projects)), [projects]);
  useEffect(
    () => localStorage.setItem(STORAGE.eligibility, JSON.stringify(eligibility)),
    [eligibility]
  );

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
    setProjects((prev) => [
      ...prev,
      { id: uid(), name: name.trim(), mintDate, sourceUrl: sourceUrl.trim() },
    ]);
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

  const sortedProjects = useMemo(
    () =>
      [...projects].sort((a, b) => {
        if (!a.mintDate) return 1;
        if (!b.mintDate) return -1;
        return new Date(a.mintDate) - new Date(b.mintDate);
      }),
    [projects]
  );

  return (
    <div className="ledger-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Big+Shoulders+Display:wght@600;800&family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@400;500&display=swap');

        .ledger-root {
          --bg-void: #0b1120;
          --surface: #12192b;
          --surface-raised: #172038;
          --hairline: #29334a;
          --ink: #e8e6de;
          --ink-dim: #9aa3b8;
          --brass: #d4a73d;
          --rust: #c1443c;
          --graphite: #5b6578;
          font-family: 'IBM Plex Sans', sans-serif;
          background: var(--bg-void);
          color: var(--ink);
          min-height: 100vh;
          padding: 32px 24px 64px;
        }
        .ledger-root * { box-sizing: border-box; }

        .masthead {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          border-bottom: 2px solid var(--hairline);
          padding-bottom: 18px;
          margin-bottom: 28px;
          flex-wrap: wrap;
          gap: 16px;
        }
        .masthead h1 {
          font-family: 'Big Shoulders Display', sans-serif;
          font-weight: 800;
          font-size: 34px;
          letter-spacing: 0.02em;
          text-transform: uppercase;
          margin: 0;
          line-height: 0.95;
        }
        .masthead .sub {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 12px;
          color: var(--ink-dim);
          letter-spacing: 0.08em;
          margin-top: 4px;
        }
        .toolbar { display: flex; gap: 10px; }
        .btn {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 12px;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          background: var(--surface-raised);
          border: 1px solid var(--hairline);
          color: var(--ink);
          padding: 9px 14px;
          border-radius: 3px;
          cursor: pointer;
          transition: border-color 0.15s ease;
        }
        .btn:hover { border-color: var(--brass); }
        .btn.primary { border-color: var(--brass); color: var(--brass); }

        .matrix-wrap {
          overflow-x: auto;
          border: 1px solid var(--hairline);
          border-radius: 4px;
          background: var(--surface);
        }
        table { border-collapse: collapse; width: 100%; min-width: 640px; }
        thead th {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 11px;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          color: var(--ink-dim);
          text-align: left;
          padding: 12px 16px;
          border-bottom: 1px solid var(--hairline);
          white-space: nowrap;
        }
        thead th.proj-col,
        thead th.wallet-col-head {
          border-left: 1px solid var(--hairline);
          text-align: center;
        }
        .proj-head-name { color: var(--ink); font-size: 12px; margin-bottom: 2px; }
        .proj-head-date { font-weight: 400; color: var(--ink-dim); }
        .proj-actions { margin-top: 6px; display: flex; gap: 6px; justify-content: center; }
        .icon-btn {
          background: none; border: none; color: var(--ink-dim);
          font-family: 'IBM Plex Mono', monospace; font-size: 10px;
          cursor: pointer; text-decoration: underline; padding: 0;
        }
        .icon-btn:hover { color: var(--brass); }

        tbody td {
          padding: 12px 16px;
          border-bottom: 1px solid var(--hairline);
          font-family: 'IBM Plex Mono', monospace;
          font-size: 13px;
          vertical-align: middle;
        }
        tbody td.wallet-col,
        tbody td.proj-row-head {
          white-space: nowrap;
          min-width: 160px;
        }
        tbody td.proj-col { text-align: center; border-left: 1px solid var(--hairline); }
        .wallet-label { color: var(--ink); font-weight: 500; }
        .wallet-addr { color: var(--ink-dim); font-size: 11px; }
        .row-remove {
          background: none; border: none; color: var(--ink-dim);
          cursor: pointer; font-size: 14px; margin-left: 8px;
        }
        .row-remove:hover { color: var(--rust); }

        .stamp {
          font-family: 'IBM Plex Mono', monospace;
          font-weight: 700;
          font-size: 11px;
          letter-spacing: 0.06em;
          padding: 5px 10px;
          border-radius: 2px;
          border: 2px solid var(--graphite);
          color: var(--graphite);
          background: transparent;
          cursor: pointer;
          transform: rotate(-2deg);
          transition: transform 0.1s ease;
        }
        .stamp:hover { transform: rotate(0deg) scale(1.04); }
        .stamp[data-status="eligible"] { border-color: var(--brass); color: var(--brass); }
        .stamp[data-status="not_eligible"] { border-color: var(--rust); color: var(--rust); }
        .stamp[data-status="unchecked"] { border-style: dashed; }

        .empty-state {
          padding: 48px 24px;
          text-align: center;
          color: var(--ink-dim);
          font-family: 'IBM Plex Mono', monospace;
          font-size: 13px;
        }

        .modal-backdrop {
          position: fixed; inset: 0; background: rgba(11,17,32,0.8);
          display: flex; align-items: center; justify-content: center;
          z-index: 50; padding: 20px;
        }
        .modal {
          background: var(--surface-raised);
          border: 1px solid var(--hairline);
          border-radius: 6px;
          padding: 24px;
          width: 100%;
          max-width: 420px;
        }
        .modal h2 {
          font-family: 'Big Shoulders Display', sans-serif;
          font-weight: 800;
          text-transform: uppercase;
          font-size: 20px;
          margin: 0 0 16px;
          color: var(--brass);
        }
        .field { margin-bottom: 14px; }
        .field label {
          display: block; font-family: 'IBM Plex Mono', monospace;
          font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em;
          color: var(--ink-dim); margin-bottom: 6px;
        }
        .field input, .field textarea {
          width: 100%; background: var(--bg-void); border: 1px solid var(--hairline);
          color: var(--ink); padding: 9px 10px; border-radius: 3px;
          font-family: 'IBM Plex Mono', monospace; font-size: 13px;
        }
        .field textarea { min-height: 90px; resize: vertical; }
        .modal-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 18px; }
        .hint { font-size: 11px; color: var(--ink-dim); margin-top: 6px; line-height: 1.5; }
        .error-box {
          background: rgba(193,68,60,0.12); border: 1px solid var(--rust);
          color: var(--rust); font-size: 11px; font-family: 'IBM Plex Mono', monospace;
          padding: 8px 10px; border-radius: 3px; margin-top: 10px;
        }
        .success-box {
          background: rgba(212,167,61,0.12); border: 1px solid var(--brass);
          color: var(--brass); font-size: 11px; font-family: 'IBM Plex Mono', monospace;
          padding: 8px 10px; border-radius: 3px; margin-top: 10px;
        }
      `}</style>

      <div className="masthead">
        <div>
          <h1>Allowlist Ledger — Manifest</h1>
          <div className="sub">
            {wallets.length} wallet{wallets.length !== 1 ? "s" : ""} × {projects.length} project
            {projects.length !== 1 ? "s" : ""} tracked
          </div>
        </div>
        <div className="toolbar">
          <button className="btn" onClick={() => setShowAddWallet(true)}>
            + Add Wallet
          </button>
          <button className="btn primary" onClick={() => setShowAddProject(true)}>
            + Add Project
          </button>
        </div>
      </div>

      <div className="matrix-wrap">
        {wallets.length === 0 || projects.length === 0 ? (
          <div className="empty-state">
            Add at least one wallet and one project to start the manifest.
            <br />
            Click a stamp to cycle it manually — dashed grey means unchecked.
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Project</th>
                {wallets.map((w) => (
                  <th key={w.id} className="wallet-col-head">
                    <div className="proj-head-name">{w.label || "Unlabeled"}</div>
                    <div className="proj-head-date">{shortAddr(w.address)}</div>
                    <div className="proj-actions">
                      <button className="icon-btn" onClick={() => removeWallet(w.id)}>
                        remove
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedProjects.map((p) => (
                <tr key={p.id}>
                  <td className="proj-row-head">
                    <span className="wallet-label">{p.name}</span>
                    <br />
                    <span className="wallet-addr">
                      {p.mintDate ? new Date(p.mintDate).toLocaleDateString() : "no mint date"}
                    </span>
                    {p.sourceUrl && (
                      <button
                        className="icon-btn"
                        style={{ display: "block", marginTop: 4 }}
                        onClick={() => setCheckModalProject(p)}
                      >
                        check all
                      </button>
                    )}
                    {p.mintDate && (
                      <button
                        className="icon-btn"
                        style={{ display: "block", marginTop: 4 }}
                        onClick={() => downloadICS(p)}
                      >
                        add to calendar
                      </button>
                    )}
                    <button className="row-remove" onClick={() => removeProject(p.id)} title="Remove project">
                      ×
                    </button>
                  </td>
                  {wallets.map((w) => (
                    <td key={w.id} className="proj-col">
                      <Stamp status={getStatus(w.id, p.id)} onClick={() => cycleStatus(w.id, p.id)} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showAddWallet && (
        <AddWalletModal onClose={() => setShowAddWallet(false)} onAdd={addWallet} />
      )}
      {showAddProject && (
        <AddProjectModal onClose={() => setShowAddProject(false)} onAdd={addProject} />
      )}
      {checkModalProject && (
        <CheckAllModal
          project={checkModalProject}
          onClose={() => setCheckModalProject(null)}
          onApply={(addresses) => {
            applyBulkResult(checkModalProject.id, addresses);
            setCheckModalProject(null);
          }}
        />
      )}
    </div>
  );
}

function AddWalletModal({ onClose, onAdd }) {
  const [address, setAddress] = useState("");
  const [label, setLabel] = useState("");
  const [connectStatus, setConnectStatus] = useState("idle"); // idle | connecting | error | connected
  const [connectError, setConnectError] = useState("");

  const hasProvider = typeof window !== "undefined" && Boolean(window.ethereum);

  async function connectWallet() {
    if (!hasProvider) {
      setConnectStatus("error");
      setConnectError("No wallet extension found. Install MetaMask, Rabby, or similar.");
      return;
    }
    setConnectStatus("connecting");
    setConnectError("");
    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      if (!accounts || accounts.length === 0) {
        throw new Error("No account returned");
      }
      setAddress(accounts[0]);
      setConnectStatus("connected");
    } catch (err) {
      setConnectStatus("error");
      // 4001 is MetaMask's "user rejected the request" code
      setConnectError(
        err.code === 4001 ? "Connection request was rejected." : err.message || "Connection failed."
      );
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>Add Wallet</h2>

        <button className="btn primary" style={{ width: "100%", marginBottom: 14 }} onClick={connectWallet} disabled={connectStatus === "connecting"}>
          {connectStatus === "connecting" ? "Connecting…" : "🦊 Connect Wallet"}
        </button>
        {connectStatus === "error" && <div className="error-box" style={{ marginBottom: 14 }}>{connectError}</div>}
        {connectStatus === "connected" && (
          <div className="success-box" style={{ marginBottom: 14 }}>
            Connected — address filled in below. Switch accounts in your wallet extension
            before reconnecting to add a different one.
          </div>
        )}

        <div className="hint" style={{ marginBottom: 14 }}>
          Or enter an address manually — useful for watch-only wallets or hardware wallets
          not currently connected.
        </div>

        <div className="field">
          <label>Address</label>
          <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="0x..." />
        </div>
        <div className="field">
          <label>Label</label>
          <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="e.g. Main, Farming #2" />
        </div>
        <div className="modal-actions">
          <button className="btn" onClick={onClose}>Cancel</button>
          <button
            className="btn primary"
            disabled={!address.trim()}
            onClick={() => onAdd(address, label)}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

function AddProjectModal({ onClose, onAdd }) {
  const [name, setName] = useState("");
  const [mintDate, setMintDate] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>Add Project</h2>
        <div className="field">
          <label>Project name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Nocturne Genesis" />
        </div>
        <div className="field">
          <label>Mint date (optional)</label>
          <input type="date" value={mintDate} onChange={(e) => setMintDate(e.target.value)} />
        </div>
        <div className="field">
          <label>Published allowlist URL (optional)</label>
          <input
            value={sourceUrl}
            onChange={(e) => setSourceUrl(e.target.value)}
            placeholder="Raw JSON/CSV of addresses"
          />
          <div className="hint">
            If the project publishes an open list (GitHub gist, IPFS, etc), paste the raw
            file URL here to unlock "check all" bulk matching. Leave blank to track this
            project manually, like today.
          </div>
        </div>
        <div className="modal-actions">
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn primary" disabled={!name.trim()} onClick={() => onAdd(name, mintDate, sourceUrl)}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

function CheckAllModal({ project, onClose, onApply }) {
  const [pastedList, setPastedList] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | error | success
  const [errorMsg, setErrorMsg] = useState("");
  const [fetchedCount, setFetchedCount] = useState(0);

  async function tryFetchSource() {
    setStatus("loading");
    setErrorMsg("");
    try {
      const proxyUrl = `/api/fetch-list?url=${encodeURIComponent(project.sourceUrl)}`;
      const res = await fetch(proxyUrl);
      const contentType = res.headers.get("content-type") || "";

      if (!res.ok) {
        // Proxy returns JSON error bodies on failure
        const body = contentType.includes("application/json") ? await res.json() : null;
        throw new Error(body?.error || `Proxy responded ${res.status}`);
      }

      const text = await res.text();
      const addresses = parseAddressList(text);
      if (addresses.length === 0) throw new Error("No addresses found in response");
      setFetchedCount(addresses.length);
      setStatus("success");
      onApply(addresses);
    } catch (err) {
      setStatus("error");
      setErrorMsg(`${err.message}. You can paste the list manually below instead.`);
    }
  }

  function applyPasted() {
    const addresses = parseAddressList(pastedList);
    if (addresses.length === 0) {
      setStatus("error");
      setErrorMsg("Couldn't find any 0x addresses in the pasted text.");
      return;
    }
    onApply(addresses);
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>Check All — {project.name}</h2>
        <div className="hint" style={{ marginBottom: 14 }}>
          Source: <span style={{ color: "var(--ink)" }}>{project.sourceUrl}</span>
        </div>
        <button className="btn primary" onClick={tryFetchSource} disabled={status === "loading"}>
          {status === "loading" ? "Fetching…" : "Fetch & match automatically"}
        </button>
        {status === "error" && <div className="error-box">{errorMsg}</div>}
        {status === "success" && (
          <div className="success-box">Matched against {fetchedCount} published addresses.</div>
        )}

        <div className="field" style={{ marginTop: 18 }}>
          <label>Or paste the list manually</label>
          <textarea
            value={pastedList}
            onChange={(e) => setPastedList(e.target.value)}
            placeholder="Paste JSON array or comma/newline separated addresses"
          />
          <div className="hint">
            Use this if the fetch above fails, or if the project's checker is gated and you
            copied the list some other way.
          </div>
        </div>
        <div className="modal-actions">
          <button className="btn" onClick={onClose}>Close</button>
          <button className="btn primary" disabled={!pastedList.trim()} onClick={applyPasted}>
            Apply pasted list
          </button>
        </div>
      </div>
    </div>
  );
}