import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

const STATUS_CONFIG = {
    eligible: { label: "Eligible", color: "#38bdf8" },
    not_eligible: { label: "Not Eligible", color: "#fb7185" },
    unchecked: { label: "Unchecked", color: "#94a3b8" },
};

export default function PublicLedgerView() {
    const { shareId } = useParams();
    const [data, setData] = useState(null);
    const [error, setError] = useState(false);

    useEffect(() => {
        fetch(`${API_URL}/public/ledger/${shareId}`)
            .then((res) => {
                if (!res.ok) throw new Error();
                return res.json();
            })
            .then(setData)
            .catch(() => setError(true));
    }, [shareId]);

    if (error) return <div style={{ color: "#fff", padding: 40 }}>Ledger not found.</div>;
    if (!data) return <div style={{ color: "#fff", padding: 40 }}>Loading...</div>;

    return (
        <div style={{ minHeight: "100vh", background: "#030712", color: "#f8fafc", padding: "40px 20px" }}>
            <div style={{ maxWidth: 600, margin: "0 auto" }}>
                <h1 style={{ marginBottom: 4 }}>{data.project.name}</h1>
                <p style={{ color: "#94a3b8", fontSize: 13, marginBottom: 24 }}>
                    {data.project.mint_date
                        ? new Date(data.project.mint_date).toLocaleString()
                        : "Mint date TBD"}
                </p>

                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                        <tr>
                            <th style={{ textAlign: "left", padding: 8, borderBottom: "1px solid #1e293b" }}>Wallet</th>
                            <th style={{ textAlign: "left", padding: 8, borderBottom: "1px solid #1e293b" }}>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.eligibility.map((e, i) => {
                            const cfg = STATUS_CONFIG[e.status] || STATUS_CONFIG.unchecked;
                            return (
                                <tr key={i}>
                                    <td style={{ padding: 8, borderBottom: "1px solid #1e293b" }}>
                                        {e.wallet_label || "Unlabeled"}
                                    </td>
                                    <td style={{ padding: 8, borderBottom: "1px solid #1e293b", color: cfg.color }}>
                                        {cfg.label}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}