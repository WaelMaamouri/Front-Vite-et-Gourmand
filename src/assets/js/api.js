export const API_BASE = import.meta.env.VITE_API_URL || "";

function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("vg_token");
}

function getHeaders(extra = {}) {
  const token = getToken();
  return {
    Accept: "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  };
}

async function parseJsonOrThrow(res, method) {
  const ct = res.headers.get("content-type") || "";

  let data = null;

  if (ct.includes("application/json")) {
    data = await res.json().catch(() => ({}));
  } else {
    const text = await res.text().catch(() => "");
    if (!res.ok) {
      throw new Error(
        `Erreur API (${method}) ${res.status}: ${text.slice(0, 160)}`,
      );
    }
    return text;
  }

  if (!res.ok) {
    if (res.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("vg_token");
        localStorage.removeItem("vg_user");
      }
      throw new Error("Non autorisé (401). Merci de vous reconnecter.");
    }
    throw new Error(data?.message || `Erreur API (${method}) ${res.status}`);
  }

  return data;
}

export async function apiGet(path) {
  const res = await fetch(API_BASE + path, {
    method: "GET",
    headers: getHeaders(),
    credentials: "omit",
  });
  return parseJsonOrThrow(res, "GET");
}

export async function apiPost(path, body) {
  const res = await fetch(API_BASE + path, {
    method: "POST",
    headers: getHeaders({ "Content-Type": "application/json" }),
    credentials: "omit",
    body: JSON.stringify(body ?? {}),
  });
  return parseJsonOrThrow(res, "POST");
}

export async function apiPatch(path, body) {
  const res = await fetch(API_BASE + path, {
    method: "PATCH",
    headers: getHeaders({ "Content-Type": "application/json" }),
    credentials: "omit",
    body: JSON.stringify(body ?? {}),
  });
  return parseJsonOrThrow(res, "PATCH");
}

export async function apiPut(path, body) {
  const res = await fetch(API_BASE + path, {
    method: "PUT",
    headers: getHeaders({ "Content-Type": "application/json" }),
    credentials: "omit",
    body: JSON.stringify(body ?? {}),
  });
  return parseJsonOrThrow(res, "PUT");
}

export async function apiDelete(path, body = null) {
  const res = await fetch(API_BASE + path, {
    method: "DELETE",
    headers: getHeaders({ "Content-Type": "application/json" }),
    credentials: "omit",
    body: body ? JSON.stringify(body) : undefined,
  });
  return parseJsonOrThrow(res, "DELETE");
}
