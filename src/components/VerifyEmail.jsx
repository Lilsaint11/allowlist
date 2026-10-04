import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

export default function VerifyEmail() {
    const [params] = useSearchParams();
    const [status, setStatus] = useState("verifying");

    useEffect(() => {
        const url = `${API_URL}/email/verify/${params.get("id") ? "" : ""}`;
        // Rebuild the full backend URL from the query string Laravel generated
        const backendUrl = `${window.location.origin.replace(window.location.port, "8000")}/api${window.location.pathname.replace("/verify-email", "/email/verify")}${window.location.search}`;

        fetch(window.location.href.replace(window.location.origin, `${API_URL.replace("/api", "")}`).replace("/verify-email", "/api/email/verify"))
            .then((res) => (res.ok ? setStatus("success") : setStatus("error")))
            .catch(() => setStatus("error"));
    }, []);

    return (
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#030712", color: "#fff" }}>
            {status === "verifying" && <p>Verifying your email...</p>}
            {status === "success" && <p>✅ Email verified! You can close this tab and log in.</p>}
            {status === "error" && <p>❌ Verification link invalid or expired.</p>}
        </div>
    );
}