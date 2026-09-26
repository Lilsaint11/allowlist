import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

export function AuthProvider({ children }) {
    const [token, setToken] = useState(() => localStorage.getItem("auth_token"));
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // On load, if we have a token, verify it and fetch the user
    useEffect(() => {
        if (!token) {
            setLoading(false);
            return;
        }

        fetch(`${API_URL}/me`, {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
            },
        })
            .then((res) => {
                if (!res.ok) throw new Error("Invalid token");
                return res.json();
            })
            .then((data) => setUser(data))
            .catch(() => {
                // token was invalid/expired
                localStorage.removeItem("auth_token");
                setToken(null);
                setUser(null);
            })
            .finally(() => setLoading(false));
    }, [token]);

    async function login(email, password) {
        const res = await fetch(`${API_URL}/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            body: JSON.stringify({ email, password }),
        });

        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.message || "Login failed");
        }

        const data = await res.json();
        localStorage.setItem("auth_token", data.token);
        setToken(data.token);
        setUser(data.user);
    }

    async function register(name, email, password, passwordConfirmation) {
        const res = await fetch(`${API_URL}/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            body: JSON.stringify({
                name,
                email,
                password,
                password_confirmation: passwordConfirmation,
            }),
        });

        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.message || "Registration failed");
        }

        const data = await res.json();
        localStorage.setItem("auth_token", data.token);
        setToken(data.token);
        setUser(data.user);
    }

    async function logout() {
        await fetch(`${API_URL}/logout`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
            },
        });
        localStorage.removeItem("auth_token");
        setToken(null);
        setUser(null);
    }

    return (
        <AuthContext.Provider value={{ token, user, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}