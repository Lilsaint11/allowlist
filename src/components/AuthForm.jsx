import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function AuthForm() {
    const { login, register } = useAuth();

    const [mode, setMode] = useState("login");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        passwordConfirmation: "",
    });

    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    function handleChange(e) {
        setForm((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));

        if (error) {
            setError("");
        }
    }

    function switchMode() {
        setMode((prev) => (prev === "login" ? "register" : "login"));
        setError("");
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");
        setSubmitting(true);

        try {
            if (mode === "login") {
                await login(form.email, form.password);
            } else {
                if (form.password !== form.passwordConfirmation) {
                    throw new Error("Your passwords do not match.");
                }

                await register(
                    form.name,
                    form.email,
                    form.password,
                    form.passwordConfirmation
                );
            }
        } catch (err) {
            setError(
                err?.message ||
                "Something went wrong. Please check your details and try again."
            );
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="auth-page">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');

                * {
                    box-sizing: border-box;
                }

                .auth-page {
                    min-height: 100vh;
                    width: 100%;
                    background: #030712;
                    color: #f8fafc;
                    font-family: 'Plus Jakarta Sans', sans-serif;
                    position: relative;
                    overflow: hidden;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 24px;
                }

                /* -------------------------
                   BACKGROUND
                ------------------------- */

                .auth-grid {
                    position: absolute;
                    inset: 0;
                    pointer-events: none;
                    opacity: 0.45;
                    background-image:
                        linear-gradient(
                            to right,
                            rgba(255, 255, 255, 0.018) 1px,
                            transparent 1px
                        ),
                        linear-gradient(
                            to bottom,
                            rgba(255, 255, 255, 0.018) 1px,
                            transparent 1px
                        );
                    background-size: 64px 64px;
                }

                .auth-glow {
                    position: absolute;
                    width: 650px;
                    height: 650px;
                    border-radius: 50%;
                    background: rgba(14, 165, 233, 0.08);
                    filter: blur(100px);
                    pointer-events: none;
                }

                .auth-glow.one {
                    top: -350px;
                    left: -250px;
                }

                .auth-glow.two {
                    right: -350px;
                    bottom: -350px;
                    background: rgba(6, 182, 212, 0.055);
                }

                /* -------------------------
                   LAYOUT
                ------------------------- */

                .auth-container {
                    width: 100%;
                    max-width: 1050px;
                    min-height: 620px;
                    display: grid;
                    grid-template-columns: 1.05fr 0.95fr;
                    position: relative;
                    z-index: 2;
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 20px;
                    overflow: hidden;
                    background: rgba(8, 13, 25, 0.72);
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                    box-shadow:
                        0 30px 100px rgba(0, 0, 0, 0.45),
                        0 0 80px rgba(56, 189, 248, 0.035);
                }

                /* -------------------------
                   LEFT PANEL
                ------------------------- */

                .auth-brand-panel {
                    position: relative;
                    padding: 46px;
                    border-right: 1px solid rgba(255, 255, 255, 0.07);
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                    overflow: hidden;
                }

                .auth-brand-panel::before {
                    content: "";
                    position: absolute;
                    width: 480px;
                    height: 480px;
                    border: 1px solid rgba(56, 189, 248, 0.09);
                    border-radius: 50%;
                    right: -260px;
                    top: 100px;
                }

                .auth-brand-panel::after {
                    content: "";
                    position: absolute;
                    width: 360px;
                    height: 360px;
                    border: 1px solid rgba(56, 189, 248, 0.06);
                    border-radius: 50%;
                    right: -200px;
                    top: 160px;
                }

                .auth-logo {
                    display: flex;
                    align-items: center;
                    gap: 11px;
                    position: relative;
                    z-index: 2;
                }

                .auth-logo-mark {
                    width: 26px;
                    height: 26px;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                }

                .auth-logo-bar {
                    height: 5px;
                    border-radius: 3px;
                    background: #38bdf8;
                    box-shadow: 0 0 12px rgba(56, 189, 248, 0.25);
                }

                .auth-logo-bar:nth-child(2) {
                    width: 75%;
                }

                .auth-logo-bar:nth-child(3) {
                    width: 50%;
                }

                .auth-logo-name {
                    font-size: 19px;
                    font-weight: 700;
                    letter-spacing: -0.025em;
                }

                .auth-brand-copy {
                    position: relative;
                    z-index: 2;
                    max-width: 430px;
                }

                .auth-eyebrow {
                    color: #38bdf8;
                    font-size: 11px;
                    font-weight: 700;
                    letter-spacing: 0.16em;
                    text-transform: uppercase;
                    margin-bottom: 18px;
                }

                .auth-brand-title {
                    font-size: clamp(38px, 4vw, 56px);
                    line-height: 1.03;
                    letter-spacing: -0.045em;
                    font-weight: 700;
                    margin: 0 0 22px;
                }

                .auth-brand-title span {
                    color: #38bdf8;
                }

                .auth-brand-description {
                    color: #94a3b8;
                    font-size: 14px;
                    line-height: 1.75;
                    max-width: 400px;
                    margin: 0;
                }

                .auth-features {
                    position: relative;
                    z-index: 2;
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 10px;
                    max-width: 410px;
                }

                .auth-feature {
                    border: 1px solid rgba(255, 255, 255, 0.07);
                    background: rgba(255, 255, 255, 0.025);
                    border-radius: 10px;
                    padding: 13px;
                }

                .auth-feature-icon {
                    color: #38bdf8;
                    font-size: 14px;
                    margin-bottom: 7px;
                }

                .auth-feature-title {
                    font-size: 11px;
                    font-weight: 600;
                    color: #e2e8f0;
                }

                .auth-feature-text {
                    font-size: 10px;
                    color: #64748b;
                    margin-top: 3px;
                }

                /* -------------------------
                   FORM PANEL
                ------------------------- */

                .auth-form-panel {
                    display: flex;
                    align-items: center;
                    padding: 46px;
                }

                .auth-form-wrapper {
                    width: 100%;
                    max-width: 390px;
                    margin: 0 auto;
                }

                .auth-form-header {
                    margin-bottom: 30px;
                }

                .auth-form-kicker {
                    color: #38bdf8;
                    font-size: 11px;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.13em;
                    margin-bottom: 9px;
                }

                .auth-form-title {
                    margin: 0;
                    font-size: 30px;
                    letter-spacing: -0.035em;
                    font-weight: 700;
                }

                .auth-form-subtitle {
                    margin: 9px 0 0;
                    color: #64748b;
                    font-size: 13px;
                    line-height: 1.6;
                }

                /* -------------------------
                   ERROR
                ------------------------- */

                .auth-error {
                    display: flex;
                    gap: 10px;
                    align-items: flex-start;
                    padding: 12px 13px;
                    margin-bottom: 20px;
                    border-radius: 9px;
                    border: 1px solid rgba(244, 63, 94, 0.2);
                    background: rgba(244, 63, 94, 0.07);
                    color: #fda4af;
                    font-size: 12px;
                    line-height: 1.5;
                }

                .auth-error-icon {
                    color: #fb7185;
                    font-weight: 700;
                }

                /* -------------------------
                   INPUTS
                ------------------------- */

                .auth-form {
                    display: flex;
                    flex-direction: column;
                    gap: 17px;
                }

                .auth-field {
                    display: flex;
                    flex-direction: column;
                    gap: 7px;
                }

                .auth-label {
                    color: #94a3b8;
                    font-size: 10px;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.09em;
                }

                .auth-input-wrapper {
                    position: relative;
                }

                .auth-input {
                    width: 100%;
                    height: 46px;
                    padding: 0 42px 0 13px;
                    border-radius: 9px;
                    outline: none;
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    background: rgba(255, 255, 255, 0.035);
                    color: #f8fafc;
                    font-family: 'Plus Jakarta Sans', sans-serif;
                    font-size: 13px;
                    transition:
                        border-color 0.2s ease,
                        background 0.2s ease,
                        box-shadow 0.2s ease;
                }

                .auth-input::placeholder {
                    color: #475569;
                }

                .auth-input:hover {
                    border-color: rgba(255, 255, 255, 0.13);
                }

                .auth-input:focus {
                    border-color: rgba(56, 189, 248, 0.65);
                    background: rgba(56, 189, 248, 0.035);
                    box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.07);
                }

                .auth-input-icon {
                    position: absolute;
                    right: 14px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: #475569;
                    font-size: 13px;
                    pointer-events: none;
                }

                .auth-password-toggle {
                    position: absolute;
                    right: 10px;
                    top: 50%;
                    transform: translateY(-50%);
                    border: none;
                    background: transparent;
                    color: #64748b;
                    cursor: pointer;
                    font-size: 10px;
                    padding: 5px;
                }

                .auth-password-toggle:hover {
                    color: #38bdf8;
                }

                /* -------------------------
                   BUTTON
                ------------------------- */

                .auth-submit {
                    width: 100%;
                    height: 46px;
                    border: none;
                    border-radius: 9px;
                    margin-top: 3px;
                    background: #38bdf8;
                    color: #030712;
                    font-family: 'Plus Jakarta Sans', sans-serif;
                    font-size: 12px;
                    font-weight: 700;
                    cursor: pointer;
                    transition:
                        transform 0.15s ease,
                        background 0.2s ease,
                        box-shadow 0.2s ease;
                    box-shadow: 0 0 25px rgba(56, 189, 248, 0.16);
                }

                .auth-submit:hover:not(:disabled) {
                    background: #7dd3fc;
                    box-shadow: 0 0 30px rgba(56, 189, 248, 0.25);
                    transform: translateY(-1px);
                }

                .auth-submit:active:not(:disabled) {
                    transform: translateY(0);
                }

                .auth-submit:disabled {
                    opacity: 0.55;
                    cursor: not-allowed;
                }

                .auth-submit-content {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    gap: 8px;
                }

                .auth-spinner {
                    width: 13px;
                    height: 13px;
                    border: 2px solid rgba(3, 7, 18, 0.25);
                    border-top-color: #030712;
                    border-radius: 50%;
                    animation: authSpin 0.7s linear infinite;
                }

                @keyframes authSpin {
                    to {
                        transform: rotate(360deg);
                    }
                }

                /* -------------------------
                   SWITCH
                ------------------------- */

                .auth-switch {
                    text-align: center;
                    margin-top: 24px;
                    color: #64748b;
                    font-size: 12px;
                }

                .auth-switch button {
                    border: none;
                    padding: 0;
                    margin-left: 4px;
                    background: transparent;
                    color: #38bdf8;
                    font-family: inherit;
                    font-size: inherit;
                    font-weight: 600;
                    cursor: pointer;
                }

                .auth-switch button:hover {
                    color: #7dd3fc;
                }

                .auth-security {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 6px;
                    margin-top: 25px;
                    color: #475569;
                    font-size: 10px;
                }

                .auth-security-dot {
                    width: 5px;
                    height: 5px;
                    border-radius: 50%;
                    background: #38bdf8;
                    box-shadow: 0 0 8px rgba(56, 189, 248, 0.6);
                }

                /* -------------------------
                   MOBILE
                ------------------------- */

                @media (max-width: 760px) {
                    .auth-page {
                        padding: 14px;
                        align-items: flex-start;
                        padding-top: 30px;
                    }

                    .auth-container {
                        grid-template-columns: 1fr;
                        min-height: auto;
                        max-width: 470px;
                    }

                    .auth-brand-panel {
                        display: none;
                    }

                    .auth-form-panel {
                        padding: 34px 25px;
                    }

                    .auth-form-title {
                        font-size: 27px;
                    }
                }

                @media (max-width: 400px) {
                    .auth-page {
                        padding: 10px;
                    }

                    .auth-form-panel {
                        padding: 30px 20px;
                    }
                }
            `}</style>

            <div className="auth-grid" />
            <div className="auth-glow one" />
            <div className="auth-glow two" />

            <main className="auth-container">

                {/* LEFT / BRAND PANEL */}
                <section className="auth-brand-panel">

                    <div className="auth-logo">
                        <div className="auth-logo-mark">
                            <div className="auth-logo-bar" />
                            <div className="auth-logo-bar" />
                            <div className="auth-logo-bar" />
                        </div>

                        <span className="auth-logo-name">
                            Allowlist Ledger
                        </span>
                    </div>

                    <div className="auth-brand-copy">
                        <div className="auth-eyebrow">
                            Your Web3 command center
                        </div>

                        <h1 className="auth-brand-title">
                            Never lose track of your{" "}
                            <span>allowlists.</span>
                        </h1>

                        <p className="auth-brand-description">
                            Keep your wallets, projects, eligibility status,
                            and mint schedules organized in one place.
                        </p>
                    </div>

                    <div className="auth-features">
                        <div className="auth-feature">
                            <div className="auth-feature-icon">◈</div>
                            <div className="auth-feature-title">
                                Multi-wallet
                            </div>
                            <div className="auth-feature-text">
                                Track every wallet
                            </div>
                        </div>

                        <div className="auth-feature">
                            <div className="auth-feature-icon">✓</div>
                            <div className="auth-feature-title">
                                Eligibility
                            </div>
                            <div className="auth-feature-text">
                                Know where you stand
                            </div>
                        </div>

                        <div className="auth-feature">
                            <div className="auth-feature-icon">◷</div>
                            <div className="auth-feature-title">
                                Mint Sync
                            </div>
                            <div className="auth-feature-text">
                                Never miss a mint
                            </div>
                        </div>

                        <div className="auth-feature">
                            <div className="auth-feature-icon">↗</div>
                            <div className="auth-feature-title">
                                Shareable
                            </div>
                            <div className="auth-feature-text">
                                Share your ledger
                            </div>
                        </div>
                    </div>
                </section>

                {/* FORM PANEL */}
                <section className="auth-form-panel">
                    <div className="auth-form-wrapper">

                        <div className="auth-form-header">
                            <div className="auth-form-kicker">
                                {mode === "login"
                                    ? "Welcome back"
                                    : "Get started"}
                            </div>

                            <h2 className="auth-form-title">
                                {mode === "login"
                                    ? "Sign in to your ledger"
                                    : "Create your ledger"}
                            </h2>

                            <p className="auth-form-subtitle">
                                {mode === "login"
                                    ? "Access your wallets, projects, and eligibility matrix."
                                    : "Start organizing your Web3 allowlists in one place."}
                            </p>
                        </div>

                        {error && (
                            <div className="auth-error">
                                <span className="auth-error-icon">!</span>
                                <span>{error}</span>
                            </div>
                        )}

                        <form
                            className="auth-form"
                            onSubmit={handleSubmit}
                        >
                            {mode === "register" && (
                                <div className="auth-field">
                                    <label
                                        className="auth-label"
                                        htmlFor="name"
                                    >
                                        Display name
                                    </label>

                                    <div className="auth-input-wrapper">
                                        <input
                                            id="name"
                                            name="name"
                                            type="text"
                                            value={form.name}
                                            onChange={handleChange}
                                            placeholder="Your name"
                                            autoComplete="name"
                                            required
                                            className="auth-input"
                                        />

                                        <span className="auth-input-icon">
                                            ◉
                                        </span>
                                    </div>
                                </div>
                            )}

                            <div className="auth-field">
                                <label
                                    className="auth-label"
                                    htmlFor="email"
                                >
                                    Email address
                                </label>

                                <div className="auth-input-wrapper">
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        value={form.email}
                                        onChange={handleChange}
                                        placeholder="you@example.com"
                                        autoComplete="email"
                                        required
                                        className="auth-input"
                                    />

                                    <span className="auth-input-icon">
                                        @
                                    </span>
                                </div>
                            </div>

                            <div className="auth-field">
                                <label
                                    className="auth-label"
                                    htmlFor="password"
                                >
                                    Password
                                </label>

                                <div className="auth-input-wrapper">
                                    <input
                                        id="password"
                                        name="password"
                                        type={
                                            showPassword
                                                ? "text"
                                                : "password"
                                        }
                                        value={form.password}
                                        onChange={handleChange}
                                        placeholder="Enter your password"
                                        autoComplete={
                                            mode === "login"
                                                ? "current-password"
                                                : "new-password"
                                        }
                                        required
                                        className="auth-input"
                                    />

                                    <button
                                        type="button"
                                        className="auth-password-toggle"
                                        onClick={() =>
                                            setShowPassword(
                                                (prev) => !prev
                                            )
                                        }
                                    >
                                        {showPassword
                                            ? "HIDE"
                                            : "SHOW"}
                                    </button>
                                </div>
                            </div>

                            {mode === "register" && (
                                <div className="auth-field">
                                    <label
                                        className="auth-label"
                                        htmlFor="passwordConfirmation"
                                    >
                                        Confirm password
                                    </label>

                                    <div className="auth-input-wrapper">
                                        <input
                                            id="passwordConfirmation"
                                            name="passwordConfirmation"
                                            type={
                                                showConfirmPassword
                                                    ? "text"
                                                    : "password"
                                            }
                                            value={
                                                form.passwordConfirmation
                                            }
                                            onChange={handleChange}
                                            placeholder="Confirm your password"
                                            autoComplete="new-password"
                                            required
                                            className="auth-input"
                                        />

                                        <button
                                            type="button"
                                            className="auth-password-toggle"
                                            onClick={() =>
                                                setShowConfirmPassword(
                                                    (prev) => !prev
                                                )
                                            }
                                        >
                                            {showConfirmPassword
                                                ? "HIDE"
                                                : "SHOW"}
                                        </button>
                                    </div>
                                </div>
                            )}

                            <button
                                type="submit"
                                className="auth-submit"
                                disabled={submitting}
                            >
                                <span className="auth-submit-content">
                                    {submitting ? (
                                        <>
                                            <span className="auth-spinner" />
                                            {mode === "login"
                                                ? "Signing in..."
                                                : "Creating ledger..."}
                                        </>
                                    ) : (
                                        <>
                                            {mode === "login"
                                                ? "Sign in"
                                                : "Create account"}

                                            <span>→</span>
                                        </>
                                    )}
                                </span>
                            </button>
                        </form>

                        <div className="auth-switch">
                            {mode === "login"
                                ? "Don't have an account?"
                                : "Already have an account?"}

                            <button
                                type="button"
                                onClick={switchMode}
                            >
                                {mode === "login"
                                    ? "Create one"
                                    : "Sign in"}
                            </button>
                        </div>

                        <div className="auth-security">
                            <span className="auth-security-dot" />
                            Your ledger is private to your account
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}

