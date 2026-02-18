// Import des routes du site et du nom du site
import { allRoutes, websiteName } from "./allRoutes.js";

// Import des fonctions spécifiques à certaines pages
import { loadMenusPage } from "../menusPage.js";
import { loadMenuDetail } from "../menuDetail.js";
import { loadContactPage } from "../contact.js";
import { loadEmployePage } from "../employePage.js";
import { loadAdminPage } from "../adminPage.js";
import { loadComptePage } from "../comptePage.js";

/**
 * Normalise le chemin URL
 */
function normalizePath(path) {
  if (!path) return "/";
  if (path.length > 1 && path.endsWith("/")) return path.slice(0, -1);
  return path;
}

/**
 * Recherche la route correspondant à l’URL
 * → sinon renvoie la route 404
 */
function findRoute(pathname) {
  const p = normalizePath(pathname);
  return (
    allRoutes.find((r) => r.url === p) ??
    allRoutes.find((r) => r.url === "/404")
  );
}

/**
 * Charge le header et le footer
 */
async function loadPartial(id, file) {
  const el = document.getElementById(id);
  if (!el) return;

  try {
    const res = await fetch(file);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    el.innerHTML = await res.text();
  } catch (err) {
    console.error(`Erreur chargement partial ${file}:`, err);
    el.innerHTML = "";
  }
}

/**
 * Charge le HTML d’une page
 */
async function loadPage(file) {
  try {
    const res = await fetch(file);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.text();
  } catch (err) {
    console.error(`Erreur chargement page ${file}:`, err);
    throw err;
  }
}

/**
 * Met à jour le lien actif dans la navigation
 */
function setActiveNav(pathname) {
  document.querySelectorAll("[data-nav]").forEach((a) => {
    const isActive = a.getAttribute("href") === pathname;
    a.classList.toggle("active", isActive);
  });
}

/**
 * Fonction principale de rendu des pages
 */
async function render(pathname) {
  const route = findRoute(pathname);

  if (!route) {
    console.error("Route introuvable:", pathname);
    return;
  }

  document.title = `${websiteName} - ${route.title}`;

  try {
    const html = await loadPage(route.pathHtml);
    const app = document.getElementById("app");
    if (app) app.innerHTML = html;
  } catch (err) {
    console.error("Erreur render, fallback 404:", err);

    const route404 = allRoutes.find((r) => r.url === "/404");
    const app = document.getElementById("app");

    if (route404 && app) {
      try {
        app.innerHTML = await loadPage(route404.pathHtml);
      } catch {
        app.innerHTML = "<p>Page introuvable.</p>";
      }
    } else if (app) {
      app.innerHTML = "<p>Page introuvable.</p>";
    }
  }

  // Mise à jour du menu actif
  setActiveNav(route.url);

  // Initialisation spécifique selon la page
  if (route.url === "/menus") loadMenusPage();
  if (route.url === "/menu") loadMenuDetail();

  // Import dynamique pour optimiser le chargement
  if (route.url === "/inscription") {
    const mod = await import("../inscription.js");
    mod.bindInscriptionForm();
  }

  if (route.url === "/connexion") {
    const mod = await import("../loginPage.js");
    mod.loadLoginPage();
  }

  if (pathname === "/avis") {
    const mod = await import("../avisPage.js");
    mod.loadAvisPage();
  }

  if (route.url === "/") {
    const mod = await import("../homePage.js");
    mod.loadHomePage();
  }

  if (route.url === "/forgot-password") {
    const mod = await import("../forgotPasswordPage.js");
    mod.bindForgotPasswordForm();
  }

  if (route.url === "/reset-password") {
    const mod = await import("../resetPasswordPage.js");
    mod.bindResetPasswordForm();
  }

  // Pages utilisateurs
  if (route.url === "/contact") loadContactPage();
  if (route.url === "/employe") loadEmployePage();
  if (route.url === "/admin") loadAdminPage();
  if (route.url === "/compte") loadComptePage();
}

/**
 * Initialise le router SPA
 */
export async function initRouter() {
  await loadPartial("site-header", "/partials/header.html");

  const auth = await import("../authUi.js");
  auth.refreshAuthUi();

  await loadPartial("site-footer", "/partials/footer.html");

  document.body.addEventListener("click", (e) => {
    const link = e.target.closest("a[data-link]");
    if (!link) return;

    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0)
      return;

    const href = link.getAttribute("href");
    if (!href) return;

    if (
      href.startsWith("#") ||
      href.startsWith("http") ||
      href.startsWith("mailto:") ||
      href.startsWith("tel:")
    ) {
      return;
    }

    if (href.endsWith(".html")) return;

    // Empêche le rechargement de la page
    e.preventDefault();

    const url = new URL(href, location.origin);
    history.pushState(null, "", url.pathname + url.search);

    // Lance le rendu de la nouvelle page
    render(url.pathname);
  });

  // Gestion du bouton retour du navigateur
  window.addEventListener("popstate", () => {
    render(location.pathname);
  });

  // Premier rendu au chargement du site
  render(location.pathname);
}
