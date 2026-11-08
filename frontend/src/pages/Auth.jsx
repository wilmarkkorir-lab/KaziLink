import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../App.jsx";
import { btn, Err, Field, input } from "../ui.jsx";

export default function Auth({ mode }) {
  const { login } = useAuth();
  const [f, setF] = useState({ username: "", email: "", password: "", role: "seeker" });
  const [err, setErr] = useState("");
  const reg = mode === "register";
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const submit = async (e) => {
    e.preventDefault(); setErr("");
    try { login(await api(`/auth/${mode}/`, { method: "POST", body: f })); } catch (x) { setErr(x.message); }
  };
  return (
    <div className="mx-auto max-w-sm">
      <div className="rounded-2xl bg-gradient-to-br from-violet-600 to-sky-500 p-1 shadow-xl">
        <div className="rounded-xl bg-white p-6 space-y-4">
          <div className="text-center">
            <span className="text-3xl">{reg ? "🚀" : "👋"}</span>
            <h1 className="mt-1 text-2xl font-black text-slate-800">{reg ? "Join Kazi Link" : "Welcome back"}</h1>
            <p className="text-sm text-slate-500">{reg ? "Create your free account" : "Sign in to your account"}</p>
          </div>
          <Err msg={err} />
          <form onSubmit={submit} className="space-y-3">
            <Field label="Username"><input className={input} value={f.username} onChange={set("username")} required /></Field>
            {reg && <Field label="Email"><input type="email" className={input} value={f.email} onChange={set("email")} required /></Field>}
            <Field label="Password"><input type="password" className={input} value={f.password} onChange={set("password")} required /></Field>
            {reg && (
              <Field label="I am a">
                <select className={input} value={f.role} onChange={set("role")}>
                  <option value="seeker">🔍 Job Seeker</option>
                  <option value="employer">🏢 Employer</option>
                </select>
              </Field>
            )}
            <button className={btn + " w-full py-2.5 text-base mt-2"}>{reg ? "Create Account →" : "Sign In →"}</button>
          </form>
          <p className="text-center text-sm text-slate-500">
            {reg ? <>Have an account? <Link className="font-semibold text-violet-600 hover:underline" to="/login">Sign in</Link></>
              : <>New here? <Link className="font-semibold text-violet-600 hover:underline" to="/register">Create an account</Link></>}
          </p>
        </div>
      </div>
    </div>
  );
}
