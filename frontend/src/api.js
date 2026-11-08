export const API = import.meta.env.VITE_API_URL ?? "https://kazilink-veqi.onrender.com/api";
export async function api(path, { method = "GET", body, form } = {}) {
  const headers = {}; const t = localStorage.getItem("token");
  if (t) headers.Authorization = `Token ${t}`;
  let data;
  if (form) data = form;
  else if (body) { headers["Content-Type"] = "application/json"; data = JSON.stringify(body); }
  const r = await fetch(API + path, { method, headers, body: data });
  if (r.status === 204) return null;
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(Object.values(j).flat().join(" ") || "Request failed");
  return j;
}
