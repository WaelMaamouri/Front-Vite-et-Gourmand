function safeParse(json) {
  try {
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function hasRole(user, role) {
  const roles = user?.roles;
  if (Array.isArray(roles)) return roles.includes(role);
  if (typeof roles === "string") return roles.includes(role);
  return false;
}

function toggle(selector, show) {
  const el = document.querySelector(selector);
  if (!el) return;
  el.classList.toggle("is-hidden", !show);
}

export function refreshAuthUi() {
  const box = document.getElementById("auth-actions");
  if (!box) return;

  const token = localStorage.getItem("vg_token");
  const user = safeParse(localStorage.getItem("vg_user") || "null");

  const isLogged = !!token;
  const isAdmin = isLogged && hasRole(user, "ROLE_ADMIN");
  const isEmploye = isLogged && hasRole(user, "ROLE_EMPLOYE");
  const isUser =
    isLogged &&
    hasRole(user, "ROLE_USER") &&
    !hasRole(user, "ROLE_ADMIN") &&
    !hasRole(user, "ROLE_EMPLOYE");

  // Onglets du header
  toggle(".nav-compte", isUser);
  toggle(".nav-employe", isEmploye);
  toggle(".nav-admin", isAdmin);

  // PAS CONNECTÉ
  if (!isLogged) {
    box.innerHTML = `
      <a class="header-auth-btn" href="/connexion" data-link>Connexion</a>
      <a class="header-auth-btn header-auth-btn--solid" href="/inscription" data-link>Inscription</a>
    `;
    return;
  }

  // CONNECTÉ
  box.innerHTML = `
    <span class="auth-hello">Bonjour ${user?.prenom || ""}</span>
    <a class="header-auth-btn header-auth-btn--solid" href="#" id="btn-logout">Déconnexion</a>
  `;

  document.getElementById("btn-logout")?.addEventListener("click", (e) => {
    e.preventDefault();
    localStorage.removeItem("vg_token");
    localStorage.removeItem("vg_user");
    refreshAuthUi();
    window.location.href = "/";
  });
}
