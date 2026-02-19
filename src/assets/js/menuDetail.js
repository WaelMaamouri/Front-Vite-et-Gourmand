import { apiGet } from "./api.js";

/**
 * Découpe un texte en plusieurs lignes propres
 */
function splitLines(text) {
  if (!text) return [];
  return text
    .split("\n")
    .map((x) => x.trim())
    .filter(Boolean);
}

/**
 * Formate le prix pour l’affichage.
 */
function formatPrice(prixMin) {
  const n = Number(prixMin);
  return Number.isNaN(n) ? `${prixMin}€` : `${n.toFixed(0)}€`;
}

/**
 * Génère un bloc HTML de liste (Entrées / Plats / Desserts).
 */
function renderList(title, items) {
  if (!items.length) return "";
  return `
    <div class="menu-detail-col">
      <p class="menu-detail-col-title">${title}</p>
      <ul>
        ${items.map((x) => `<li>${x}</li>`).join("")}
      </ul>
    </div>
  `;
}

/**
 * Construit l’affichage complet du menu
 */
function renderMenuDetail(container, m) {
      const imgUrl = assetUrl(m.image);

      const img = imgUrl
        ? `<img class="suggestion-img" src="${imgUrl}" alt="${m.titre}">`

  const entrees = splitLines(m.entrees);
  const plats = splitLines(m.plats);
  const desserts = splitLines(m.desserts);

  container.innerHTML = `
    <article class="menu-detail-card">
      <div class="menu-detail-top">
        <div class="menu-detail-media">${img}</div>

        <div class="menu-detail-main">
          <div class="menu-detail-tags">
            <span class="tag tag-primary">${m.theme ?? ""}</span>
            <span class="tag">${m.regime ?? ""}</span>
          </div>

          <h1 class="menu-detail-title">${m.titre}</h1>
          <p class="menu-detail-desc">${m.description ?? ""}</p>

          <div class="menu-detail-info">
            <p class="menu-detail-price">${formatPrice(m.prixMin)} <span>/ pers</span></p>
            <p class="menu-detail-min">👥 ${m.nbPersonnesMin} pers. min</p>
          </div>

          <div class="menu-detail-conditions">
            <p class="menu-detail-conditions-title">Conditions</p>
            <p class="menu-detail-conditions-text">${m.conditions ?? "-"}</p>
          </div>

          <div class="menu-detail-actions">
            <a class="btn btn-solid" href="/contact" data-link>Demander un devis</a>
            <a class="btn btn-solid" href="/menus" data-link>Voir tous les menus</a>
          </div>
        </div>
      </div>

      <div class="menu-detail-extra">
        <h2 class="menu-detail-subtitle">Détails du menu</h2>
        <p class="menu-detail-accroche">${m.details ?? "Menu personnalisable selon vos besoins."}</p>

        <h3 class="menu-detail-subsubtitle">Exemples de composition</h3>
        <div class="menu-detail-cols">
          ${renderList("Entrées", entrees)}
          ${renderList("Plats", plats)}
          ${renderList("Desserts", desserts)}
        </div>
      </div>
    </article>
  `;
}

/**
 * Affiche jusqu’à 3 menus, différents du menu actuel.
 */
function renderSuggestions(container, menus, currentId) {
  const others = menus
    .filter((x) => Number(x.id) !== Number(currentId))
    .slice(0, 3);

  if (!others.length) {
    container.innerHTML = "<p>Aucune suggestion.</p>";
    return;
  }

  container.innerHTML = others
    .map((m) => {
      const imgUrl = assetUrl(m.image);

      const img = imgUrl
        ? `<img class="suggestion-img" src="${imgUrl}" alt="${m.titre}">`
        : `<div class="suggestion-img suggestion-img--placeholder">Image</div>`;

      return `
        <article class="suggestion-card">
          ${img}
          <div class="suggestion-body">
            <p class="suggestion-tags">
              <span class="tag tag-primary">${m.theme ?? ""}</span>
              <span class="tag">${m.regime ?? ""}</span>
            </p>
            <h3 class="suggestion-title">${m.titre}</h3>
            <p class="suggestion-price">${formatPrice(m.prixMin)} / pers</p>
            <a class="suggestion-link" href="/menu?id=${m.id}" data-link>Voir le menu</a>
          </div>
        </article>
      `;
    })
    .join("");
}

/**
 * Point d’entrée de la page "détail menu".
 */
export async function loadMenuDetail() {
  const detailContainer = document.getElementById("menu-detail-content");
  const sugContainer = document.getElementById("menu-suggestions");

  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  if (!detailContainer) return;

  if (!id) {
    detailContainer.innerHTML = "<p>Menu introuvable (id manquant).</p>";
    if (sugContainer) sugContainer.innerHTML = "";
    return;
  }

  detailContainer.innerHTML = "<p>Chargement du menu...</p>";
  if (sugContainer)
    sugContainer.innerHTML = "<p>Chargement des suggestions...</p>";

  try {
    const menu = await apiGet(`/api/menus/${id}`);
    renderMenuDetail(detailContainer, menu);

    const menus = await apiGet("/api/menus");
    if (sugContainer) renderSuggestions(sugContainer, menus, id);
  } catch (e) {
    console.error(e);
    detailContainer.innerHTML =
      "<p>Erreur : impossible de charger ce menu.</p>";
    if (sugContainer) sugContainer.innerHTML = "";
  }
}
