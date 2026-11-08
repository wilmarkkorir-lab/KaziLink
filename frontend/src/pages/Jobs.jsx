import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import { input, salary, TypeBadge, TYPES } from "../ui.jsx";

export default function Jobs() {
  const [q, setQ] = useState({ search: "", job_type: "", category: "", location: "", salary_min: "", ordering: "-created_at" });
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const params = new URLSearchParams(Object.entries(q).filter(([, v]) => v));
    setLoading(true);
    const t = setTimeout(() => api(`/jobs/?${params}`).then(setJobs).finally(() => setLoading(false)), 250);
    return () => clearTimeout(t);
  }, [q]);
  const set = (k) => (e) => setQ({ ...q, [k]: e.target.value });

  const cardGradients = [
    "from-violet-50 to-purple-50 border-violet-200 hover:border-violet-400",
    "from-sky-50 to-cyan-50 border-sky-200 hover:border-sky-400",
    "from-emerald-50 to-teal-50 border-emerald-200 hover:border-emerald-400",
    "from-amber-50 to-orange-50 border-amber-200 hover:border-amber-400",
    "from-pink-50 to-rose-50 border-pink-200 hover:border-pink-400",
  ];

  return (
    <div className="grid gap-6 md:grid-cols-[260px_1fr]">
      {/* Step 4: Search & Filters */}
      <aside className="space-y-3">
        <div className="rounded-xl bg-gradient-to-br from-violet-600 to-purple-700 p-4 text-white shadow">
          <h2 className="mb-3 font-bold text-lg">🔍 Search & Filter</h2>
          <div className="space-y-2">
            <input className="w-full rounded-lg border-0 bg-white/20 px-3 py-2 text-sm text-white placeholder-white/70 focus:outline-2 focus:outline-white" placeholder="Search title, company…" value={q.search} onChange={set("search")} />
            <select className="w-full rounded-lg border-0 bg-white/20 px-3 py-2 text-sm text-white focus:outline-2 focus:outline-white" value={q.job_type} onChange={set("job_type")}>
              <option value="" className="text-slate-900">Any job type</option>
              {Object.entries(TYPES).map(([k, v]) => <option key={k} value={k} className="text-slate-900">{v}</option>)}
            </select>
            <input className="w-full rounded-lg border-0 bg-white/20 px-3 py-2 text-sm text-white placeholder-white/70 focus:outline-2 focus:outline-white" placeholder="Category (e.g. Engineering)" value={q.category} onChange={set("category")} />
            <input className="w-full rounded-lg border-0 bg-white/20 px-3 py-2 text-sm text-white placeholder-white/70 focus:outline-2 focus:outline-white" placeholder="Location" value={q.location} onChange={set("location")} />
            <input className="w-full rounded-lg border-0 bg-white/20 px-3 py-2 text-sm text-white placeholder-white/70 focus:outline-2 focus:outline-white" type="number" placeholder="Min salary (KSh)" value={q.salary_min} onChange={set("salary_min")} />
            <select className="w-full rounded-lg border-0 bg-white/20 px-3 py-2 text-sm text-white focus:outline-2 focus:outline-white" value={q.ordering} onChange={set("ordering")}>
              <option value="-created_at" className="text-slate-900">Newest first</option>
              <option value="-salary_min" className="text-slate-900">Highest salary</option>
            </select>
          </div>
        </div>
      </aside>

      {/* Step 1: Job Listings */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-slate-600">
            {loading ? "Loading…" : <><span className="font-bold text-violet-600">{jobs.length}</span> job{jobs.length === 1 ? "" : "s"} found</>}
          </p>
        </div>
        {!loading && !jobs.length && (
          <div className="rounded-xl border-2 border-dashed border-slate-300 p-10 text-center text-slate-500">
            <p className="text-4xl mb-2">🔎</p>
            <p>No jobs match these filters. Try removing one.</p>
          </div>
        )}
        {jobs.map((j, i) => (
          <Link key={j.id} to={`/jobs/${j.id}`} className={`block rounded-xl border-2 bg-gradient-to-r p-4 transition-all hover:shadow-md ${cardGradients[i % cardGradients.length]}`}>
            <div className="flex items-start justify-between gap-2">
              <div>
                <h2 className="font-bold text-slate-800">{j.title}</h2>
                <p className="text-sm text-slate-600">{j.company} · {j.location}</p>
                <p className="mt-1 text-sm font-semibold text-emerald-700">{salary(j)}</p>
              </div>
              <TypeBadge t={j.job_type} />
            </div>
          </Link>
        ))}
      </section>
    </div>
  );
}
