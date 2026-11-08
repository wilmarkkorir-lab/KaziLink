import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../App.jsx";
import { Badge, btn, btn2, btnDanger, Err, Field, input, salary, STATUSES, TypeBadge, TYPES } from "../ui.jsx";

export default function Dashboard() {
  const { user } = useAuth();
  const roleColors = { seeker: "from-sky-500 to-cyan-400", employer: "from-violet-600 to-purple-500", admin: "from-rose-500 to-orange-400" };
  const roleIcons = { seeker: "🔍", employer: "🏢", admin: "🛡️" };
  return (
    <div className="space-y-5">
      <div className={`rounded-2xl bg-gradient-to-r ${roleColors[user.role] || "from-slate-600 to-slate-500"} p-5 text-white shadow-lg`}>
        <p className="text-3xl">{roleIcons[user.role]}</p>
        <h1 className="mt-1 text-2xl font-black">Welcome, {user.username}!</h1>
        <p className="text-white/80 capitalize">{user.role} Dashboard</p>
      </div>
      {user.role === "seeker" && <Seeker />}
      {user.role === "employer" && <Employer />}
      {user.role === "admin" && <Admin />}
    </div>
  );
}

/* ── Step 3: Job Application Workflow (Seeker) ── */
function Seeker() {
  const [apps, setApps] = useState([]);
  useEffect(() => { api("/applications/").then(setApps); }, []);
  if (!apps.length) return (
    <div className="rounded-xl border-2 border-dashed border-sky-300 bg-sky-50 p-8 text-center">
      <p className="text-4xl mb-2">📭</p>
      <p className="text-slate-600">No applications yet.</p>
      <Link className="mt-2 inline-block font-semibold text-sky-600 underline" to="/">Browse jobs and apply</Link>
    </div>
  );
  return (
    <div className="space-y-2">
      <h2 className="font-bold text-slate-700">My Applications</h2>
      {apps.map((a) => (
        <div key={a.id} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
          <div>
            <Link to={`/jobs/${a.job}`} className="font-semibold text-violet-700 hover:underline">{a.job_title}</Link>
            <p className="text-sm text-slate-500">{a.company} · applied {new Date(a.created_at).toLocaleDateString()}</p>
          </div>
          <Badge s={a.status} />
        </div>
      ))}
    </div>
  );
}

/* ── Step 2: Job Posting + Step 3: Application Management (Employer) ── */
const blank = { title: "", company: "", location: "", category: "", job_type: "full", description: "", salary_min: "", salary_max: "" };
function Employer() {
  const [jobs, setJobs] = useState([]); const [f, setF] = useState(blank); const [err, setErr] = useState("");
  const [open, setOpen] = useState(null); const [apps, setApps] = useState([]);
  const load = () => api("/jobs/mine/").then(setJobs);
  useEffect(() => { load(); }, []);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const post = async (e) => {
    e.preventDefault(); setErr("");
    const body = { ...f, salary_min: f.salary_min || null, salary_max: f.salary_max || null };
    try { await api("/jobs/", { method: "POST", body }); setF(blank); load(); } catch (x) { setErr(x.message); }
  };
  const toggle = async (j) => { await api(`/jobs/${j.id}/`, { method: "PATCH", body: { is_active: !j.is_active } }); load(); };
  const remove = async (j) => { if (confirm(`Delete "${j.title}"?`)) { await api(`/jobs/${j.id}/`, { method: "DELETE" }); load(); } };
  const view = async (j) => { if (open === j.id) return setOpen(null); setApps(await api(`/jobs/${j.id}/applicants/`)); setOpen(j.id); };
  const setStatus = async (a, status) => {
    await api(`/applications/${a.id}/`, { method: "PATCH", body: { status } });
    setApps(apps.map((x) => (x.id === a.id ? { ...x, status } : x)));
  };
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Step 2: Post a Job */}
      <form onSubmit={post} className="space-y-3 rounded-xl border-2 border-violet-200 bg-gradient-to-br from-violet-50 to-purple-50 p-5 shadow-sm">
        <h2 className="font-bold text-violet-700 text-lg">📝 Post a New Job</h2>
        <Err msg={err} />
        <Field label="Job Title"><input className={input} value={f.title} onChange={set("title")} required /></Field>
        <Field label="Company"><input className={input} value={f.company} onChange={set("company")} required /></Field>
        <div className="grid grid-cols-2 gap-2">
          <Field label="Location"><input className={input} value={f.location} onChange={set("location")} required /></Field>
          <Field label="Category"><input className={input} value={f.category} onChange={set("category")} required /></Field>
          <Field label="Job Type">
            <select className={input} value={f.job_type} onChange={set("job_type")}>
              {Object.entries(TYPES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </Field>
          <span />
          <Field label="Min Salary (KSh)"><input type="number" className={input} value={f.salary_min} onChange={set("salary_min")} /></Field>
          <Field label="Max Salary (KSh)"><input type="number" className={input} value={f.salary_max} onChange={set("salary_max")} /></Field>
        </div>
        <Field label="Description"><textarea rows={5} className={input} value={f.description} onChange={set("description")} required /></Field>
        <button className={btn + " w-full"}>Publish Job →</button>
      </form>

      {/* My Jobs */}
      <div className="space-y-3">
        <h2 className="font-bold text-slate-700 text-lg">📋 Your Job Listings</h2>
        {!jobs.length && <p className="rounded-xl border-2 border-dashed border-slate-300 p-6 text-center text-slate-500">No jobs posted yet.</p>}
        {jobs.map((j) => (
          <div key={j.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-semibold text-slate-800">{j.title}
                  {!j.is_active && <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">Closed</span>}
                </p>
                <p className="text-sm text-slate-500">{j.applications_count} applicant(s)</p>
              </div>
              <div className="flex gap-1 flex-wrap justify-end">
                <button className={btn2} onClick={() => view(j)}>👥 Applicants</button>
                <button className={btn2} onClick={() => toggle(j)}>{j.is_active ? "Close" : "Reopen"}</button>
                <button className={btnDanger} onClick={() => remove(j)}>Delete</button>
              </div>
            </div>
            {open === j.id && (
              <div className="mt-3 space-y-2 border-t border-slate-100 pt-3">
                {!apps.length && <p className="text-sm text-slate-500">No applications yet.</p>}
                {apps.map((a) => (
                  <div key={a.id} className="rounded-lg bg-slate-50 p-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-700">{a.applicant_name} <span className="font-normal text-slate-500">({a.applicant_email})</span></span>
                      <select className="rounded-lg border border-slate-300 px-2 py-1 text-xs" value={a.status} onChange={(e) => setStatus(a, e.target.value)}>
                        {STATUSES.map((s) => <option key={s}>{s}</option>)}
                      </select>
                    </div>
                    {a.cover_letter && <p className="mt-1 text-slate-600 line-clamp-2">{a.cover_letter}</p>}
                    {a.resume && <a className="mt-1 inline-block text-violet-600 underline text-xs" href={a.resume} target="_blank" rel="noreferrer">📄 Download Resume</a>}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Step 5: Admin Management ── */
function Admin() {
  const [stats, setStats] = useState(null); const [users, setUsers] = useState([]); const [jobs, setJobs] = useState([]);
  const [q, setQ] = useState("");
  const load = () => { api("/admin/stats/").then(setStats); api("/jobs/").then(setJobs); };
  useEffect(() => { load(); }, []);
  useEffect(() => { api(`/admin/users/?search=${encodeURIComponent(q)}`).then(setUsers); }, [q]);
  const toggleUser = async (u) => {
    const r = await api(`/admin/users/${u.id}/`, { method: "PATCH", body: { is_active: !u.is_active } });
    setUsers(users.map((x) => (x.id === u.id ? r : x)));
  };
  const delJob = async (j) => { if (confirm(`Remove "${j.title}"?`)) { await api(`/jobs/${j.id}/`, { method: "DELETE" }); load(); } };
  if (!stats) return null;

  const cards = [
    { label: "Job Seekers", value: stats.users.seeker || 0, color: "from-sky-500 to-cyan-400", icon: "🔍" },
    { label: "Employers", value: stats.users.employer || 0, color: "from-violet-600 to-purple-500", icon: "🏢" },
    { label: "Active Jobs", value: `${stats.active_jobs}/${stats.jobs}`, color: "from-emerald-500 to-teal-400", icon: "📋" },
    { label: "Applications", value: stats.total_applications, color: "from-amber-500 to-orange-400", icon: "📨" },
  ];

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {cards.map(({ label, value, color, icon }) => (
          <div key={label} className={`rounded-xl bg-gradient-to-br ${color} p-4 text-white shadow-md`}>
            <p className="text-2xl">{icon}</p>
            <p className="text-3xl font-black mt-1">{value}</p>
            <p className="text-sm text-white/80">{label}</p>
          </div>
        ))}
      </div>

      {/* Users Management */}
      <section className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center justify-between bg-gradient-to-r from-sky-500 to-cyan-400 px-4 py-3">
          <h2 className="font-bold text-white">👥 User Management</h2>
          <input className="rounded-lg border-0 bg-white/20 px-3 py-1.5 text-sm text-white placeholder-white/70 focus:outline-2 focus:outline-white max-w-xs" placeholder="Search users…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <div className="divide-y divide-slate-100">
          {users.map((u) => (
            <div key={u.id} className="flex items-center justify-between px-4 py-3 text-sm hover:bg-slate-50">
              <div>
                <span className="font-semibold text-slate-800">{u.username}</span>
                <span className="ml-2 text-slate-500">({u.role}) {u.email}</span>
                {!u.is_active && <span className="ml-2 rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-700">Inactive</span>}
              </div>
              {u.role !== "admin" && (
                <button className={u.is_active ? btnDanger : btn2} onClick={() => toggleUser(u)}>
                  {u.is_active ? "Deactivate" : "Activate"}
                </button>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Job Listings Management */}
      <section className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-violet-600 to-purple-500 px-4 py-3">
          <h2 className="font-bold text-white">📋 Job Listings Management</h2>
        </div>
        <div className="divide-y divide-slate-100">
          {jobs.map((j) => (
            <div key={j.id} className="flex items-center justify-between px-4 py-3 text-sm hover:bg-slate-50">
              <div>
                <span className="font-semibold text-slate-800">{j.title}</span>
                <span className="ml-2 text-slate-500">· {j.company} · by {j.employer_name}</span>
              </div>
              <button className={btnDanger} onClick={() => delJob(j)}>Remove</button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
