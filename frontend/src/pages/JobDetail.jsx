import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../App.jsx";
import { btn, Err, Field, input, salary, TypeBadge } from "../ui.jsx";

export default function JobDetail() {
  const { id } = useParams(); const { user } = useAuth();
  const [job, setJob] = useState(null); const [cover, setCover] = useState(""); const [file, setFile] = useState(null);
  const [err, setErr] = useState(""); const [done, setDone] = useState(false);
  useEffect(() => { api(`/jobs/${id}/`).then(setJob).catch((e) => setErr(e.message)); }, [id]);
  const apply = async (e) => {
    e.preventDefault(); setErr("");
    const form = new FormData(); form.append("job", id); form.append("cover_letter", cover);
    if (file) form.append("resume", file);
    try { await api("/applications/", { method: "POST", form }); setDone(true); } catch (x) { setErr(x.message); }
  };
  if (!job) return <Err msg={err} />;
  return (
    <article className="max-w-2xl space-y-5">
      {/* Job header */}
      <div className="rounded-xl bg-gradient-to-r from-violet-600 to-sky-500 p-6 text-white shadow-lg">
        <h1 className="text-3xl font-black">{job.title}</h1>
        <p className="mt-1 text-white/80">{job.company} · {job.location}</p>
        <div className="mt-3 flex items-center gap-3">
          <TypeBadge t={job.job_type} />
          <span className="rounded-full bg-white/20 px-3 py-0.5 text-sm font-semibold">{salary(job)}</span>
        </div>
      </div>

      {/* Description */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-3 font-bold text-slate-700">Job Description</h2>
        <p className="whitespace-pre-line text-slate-700 leading-relaxed">{job.description}</p>
      </div>

      {/* Step 3: Application workflow */}
      <div className="rounded-xl border-2 border-violet-200 bg-gradient-to-br from-violet-50 to-purple-50 p-5">
        {!user && (
          <p className="text-slate-700">
            <Link className="font-semibold text-violet-600 underline" to="/login">Sign in</Link> as a job seeker to apply.
          </p>
        )}
        {user?.role === "seeker" && (
          done ? (
            <div className="rounded-lg bg-emerald-100 p-4 text-center text-emerald-800">
              <p className="text-2xl mb-1">🎉</p>
              <p className="font-semibold">Application submitted!</p>
              <p className="text-sm mt-1">Track it in your <Link className="underline font-medium" to="/dashboard">dashboard</Link>.</p>
            </div>
          ) : (
            <form onSubmit={apply} className="space-y-4">
              <h2 className="font-bold text-violet-700 text-lg">📨 Apply for this Job</h2>
              <Err msg={err} />
              <Field label="Cover Letter"><textarea rows={5} className={input} value={cover} onChange={(e) => setCover(e.target.value)} placeholder="Tell the employer why you're a great fit…" /></Field>
              <Field label="Resume (PDF / DOC)"><input type="file" accept=".pdf,.doc,.docx" className="text-sm text-slate-600" onChange={(e) => setFile(e.target.files[0])} /></Field>
              <button className={btn + " w-full py-2.5 text-base"}>Submit Application →</button>
            </form>
          )
        )}
        {user?.role === "employer" && <p className="text-sm text-slate-500">Employers cannot apply for jobs.</p>}
      </div>
    </article>
  );
}
