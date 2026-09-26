import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function AuthForm() {
    const { login, register } = useAuth();
    const [mode, setMode] = useState("login"); // "login" | "register"
    const [form, setForm] = useState({ name: "", email: "", password: "", passwordConfirmation: "" });
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    function handleChange(e) {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");
        setSubmitting(true);
        try {
            if (mode === "login") {
                await login(form.email, form.password);
            } else {
                await register(form.name, form.email, form.password, form.passwordConfirmation);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div style={{ maxWidth: 360, margin: "80px auto", color: "#f8fafc" }}>
            <h2 style={{ marginBottom: 16 }}>{mode === "login" ? "Log In" : "Create Account"}</h2>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {mode === "register" && (
                    <input name="name" placeholder="Name" value={form.name} onChange={handleChange} required />
                )}
                <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required />
                <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} required />
                {mode === "register" && (
                    <input
                        name="passwordConfirmation"
                        type="password"
                        placeholder="Confirm Password"
                        value={form.passwordConfirmation}
                        onChange={handleChange}
                        required
                    />
                )}

                {error && <p style={{ color: "#fb7185", fontSize: 13 }}>{error}</p>}

                <button type="submit" disabled={submitting}>
                    {submitting ? "Please wait..." : mode === "login" ? "Log In" : "Sign Up"}
                </button>
            </form>

            <p style={{ marginTop: 12, fontSize: 13 }}>
                {mode === "login" ? "Need an account?" : "Already have an account?"}{" "}
                <button
                    type="button"
                    onClick={() => setMode(mode === "login" ? "register" : "login")}
                    style={{ background: "none", border: "none", color: "#38bdf8", cursor: "pointer", padding: 0 }}
                >
                    {mode === "login" ? "Sign up" : "Log in"}
                </button>
            </p>
        </div>
    );
}