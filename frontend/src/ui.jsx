export const input = "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-2 focus:outline-violet-500";
export const btn = "rounded-lg bg-gradient-to-r from-violet-600 to-purple-600 px-4 py-2 text-sm font-semibold text-white hover:from-violet-700 hover:to-purple-700 disabled:opacity-50 shadow-sm";
export const btn2 = "rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium hover:bg-slate-100";
export const btnDanger = "rounded-lg border border-red-300 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50";
export const TYPES = { full: "Full-time", part: "Part-time", contract: "Contract", intern: "Internship", remote: "Remote" };
export const STATUSES = ["pending", "reviewed", "shortlisted", "rejected", "hired"];

const colors = {
  pending: "bg-slate-100 text-slate-700",
  reviewed: "bg-sky-100 text-sky-800",
  shortlisted: "bg-amber-100 text-amber-800",
  rejected: "bg-red-100 text-red-800",
  hired: "bg-emerald-100 text-emerald-800",
};
const typeColors = {
  full: "bg-violet-100 text-violet-800",
  part: "bg-sky-100 text-sky-800",
  contract: "bg-amber-100 text-amber-800",
  intern: "bg-pink-100 text-pink-800",
  remote: "bg-emerald-100 text-emerald-800",
};

export const Badge = ({ s }) => <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${colors[s] || "bg-slate-100 text-slate-700"}`}>{s}</span>;
export const TypeBadge = ({ t }) => <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${typeColors[t] || "bg-slate-100"}`}>{TYPES[t] || t}</span>;
export const Err = ({ msg }) => msg ? <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 border border-red-200">{msg}</p> : null;
export const Field = ({ label, children }) => <label className="block text-sm"><span className="mb-1 block font-semibold text-slate-700">{label}</span>{children}</label>;
export const salary = (j) => j.salary_min ? `KSh ${Number(j.salary_min).toLocaleString()}${j.salary_max ? ` – ${Number(j.salary_max).toLocaleString()}` : "+"}` : "Salary not listed";
