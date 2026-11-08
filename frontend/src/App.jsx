import { createContext, useContext, useEffect, useState } from "react";
import { Link, Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { api } from "./api";
import Jobs from "./pages/Jobs.jsx";
import JobDetail from "./pages/JobDetail.jsx";
import Auth from "./pages/Auth.jsx";
import Dashboard from "./pages/Dashboard.jsx";

const AuthCtx = createContext(null);
export const useAuth = () => useContext(AuthCtx);

export default function App() {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  const nav = useNavigate();
  useEffect(() => {
    if (!localStorage.getItem("token")) return setReady(true);
    api("/auth/me/").then(setUser).catch(() => localStorage.removeItem("token")).finally(() => setReady(true));
  }, []);
  const login = (d) => { localStorage.setItem("token", d.token); setUser(d.user); nav("/dashboard"); };
  const logout = () => { localStorage.removeItem("token"); setUser(null); nav("/"); };
  if (!ready) return null;
  return (
    <AuthCtx.Provider value={{ user, login, logout }}>
      <header className="bg-gradient-to-r from-violet-700 via-purple-600 to-sky-500 shadow-lg">
        <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2">
            <span className="rounded-lg bg-white/20 px-2 py-1 text-xl font-black tracking-tight text-white">KL</span>
            <span className="text-xl font-bold text-white">Kazi Link</span>
          </Link>
          <div className="flex items-center gap-3 text-sm">
            <Link to="/" className="font-medium text-white/90 hover:text-white">Browse Jobs</Link>
            {user ? (
              <>
                <Link to="/dashboard" className="font-medium text-white/90 hover:text-white">Dashboard</Link>
                <button onClick={logout} className="rounded-full bg-white/20 px-3 py-1.5 font-medium text-white hover:bg-white/30">
                  Sign out ({user.username})
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="font-medium text-white/90 hover:text-white">Sign in</Link>
                <Link to="/register" className="rounded-full bg-white px-4 py-1.5 font-semibold text-violet-700 hover:bg-violet-50">
                  Get Started
                </Link>
              </>
            )}
          </div>
        </nav>
      </header>

      {/* Hero banner on home */}
      <div className="bg-gradient-to-br from-violet-600 via-purple-500 to-sky-400 py-10 text-center text-white">
        <h1 className="text-4xl font-black tracking-tight">Find Your Dream Job</h1>
        <p className="mt-2 text-lg text-white/80">Connecting talent with opportunity across Kenya and beyond</p>
        <div className="mt-4 flex justify-center gap-6 text-sm font-medium">
          <span className="rounded-full bg-white/20 px-4 py-1.5">📋 Job Listings</span>
          <span className="rounded-full bg-white/20 px-4 py-1.5">📨 Easy Applications</span>
          <span className="rounded-full bg-white/20 px-4 py-1.5">🔍 Smart Search</span>
          <span className="rounded-full bg-white/20 px-4 py-1.5">🛡️ Admin Tools</span>
        </div>
      </div>

      <main className="mx-auto max-w-5xl px-4 py-6">
        <Routes>
          <Route path="/" element={<Jobs />} />
          <Route path="/jobs/:id" element={<JobDetail />} />
          <Route path="/login" element={<Auth mode="login" />} />
          <Route path="/register" element={<Auth mode="register" />} />
          <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/login" />} />
        </Routes>
      </main>

      <footer className="mt-10 border-t border-slate-200 bg-white py-6 text-center text-sm text-slate-500">
        © {new Date().getFullYear()} <span className="font-semibold text-violet-600">Kazi Link</span> — Connecting talent with opportunity
      </footer>
    </AuthCtx.Provider>
  );
}
