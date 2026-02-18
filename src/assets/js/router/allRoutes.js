import Route from "./Route.js";

export const websiteName = "Vite & Gourmand";

export const allRoutes = [
  new Route("/", "Accueil", "/pages/home.html", []),
  new Route("/menus", "Menus", "/pages/menus.html", []),
  new Route("/contact", "Contact", "/pages/contact.html", []),
  new Route("/connexion", "Connexion", "/pages/connexion.html", []),
  new Route("/inscription", "Inscription", "/pages/inscription.html", []),
  new Route("/menu", "Détail menu", "/pages/menu-detail.html", []),
  new Route("/compte", "Mon compte", "/pages/compte.html", []),
  new Route("/employe", "Espace Employé", "/pages/employe.html", []),
  new Route("/admin", "Espace Admin", "/pages/admin.html", []),
  new Route("/avis", "Laisser un avis", "/pages/avis.html", []),
  new Route("/404", "Page introuvable", "/pages/404.html", []),
];
