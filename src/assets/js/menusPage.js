import { apiGet, API_BASE as RAW_API_BASE } from "./api.js";

// Normalise: enlève le slash final pour éviter //assets...
const API_BASE = (RAW_API_BASE || "").replace(/\/$/, "");

function assetUrl(path) {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${API_BASE}${path.startsWith("/") ? "" : "/"}${path}`;
}

/**
 * Récupère la valeur sélectionnée d’un groupe.
 */
function getSelectedValue(selector) {
  const checked = document.querySelector(`${selector}:checked`);
  return checked ? checked.value : "";
}

/**
 * Construit la query string à partir des filtres saisis par l’utilisateur.
 */
function buildQueryFromFilters() {
  const minPrix = document.getElementById("filter-minPrix")?.value.trim() || "";
  const maxPrix = document.getElementById("filter-maxPrix")?.value.trim() || "";
  const minPersonnes =
    document.getElementById("filter-minPersonnes")?.value.trim() || "";

  const theme = getSelectedValue(".filter-theme");
  const regime = getSelectedValue(".filter-regime");

  const params = new URLSearchParams();
  if (theme) params.set("theme", theme);
  if (regime) params.set("regime", regime);
  if (minPersonnes) params.set("minPersonnes", minPersonnes);
  if (minPrix) params.set("minPrix", minPrix);
  if (maxPrix) params.set("maxPrix", maxPrix);

  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

/**
 * Affiche les menus dans la grille HTML.
 */
function renderMenus(grid, menus) {
  grid.innerHTML = (menus || [])
    .map((m) => {
      const imgUrl = assetUrl(m.image);

      const img = imgUrl
        ? `<img class="menu-img" src="${imgUrl}" alt="${m.titre || "Menu"}">`
        : `<div class="menu-img menu-img--placeholder">Image indisponible</div>`;

      return `
        <article class="menu-card">
          ${img}
          <div class="menu-body">
            <div class="menu-tags">
              <span class="tag tag-primary">${m.theme ?? ""}</span>
              <span class="tag">${m.regime ?? ""}</span>
            </div>

            <h3 class="menu-name">${m.titre ?? ""}</h3>
            <p class="menu-desc">${m.description ?? ""}</p>

            <p class="menu-from">A partir de:</p>
            <div class="menu-bottom">
              <p class="menu-price">${m.prixMin ?? ""}€<span>/ pers</span></p>
              <p class="menu-min">👥 ${m.nbPersonnesMin ?? ""} pers. min</p>
            </div>

            <a class="menu-btn" href="/menu?id=${m.id}" data-link>Voir les détails</a>
          </div>
        </article>
      `;
    })
    .join("");
}

/**
 * Récupère les menus depuis l’API puis met à jour l’affichage.
 */
async function fetchAndRender() {
  const grid = document.querySelector(".cards-grid");
  if (!grid) return;

  grid.innerHTML = "<p>Chargement...</p>";

  try {
    const query = buildQueryFromFilters();
    const menus = await apiGet("/api/menus" + query);
    renderMenus(grid, menus);
  } catch (e) {
    console.error(e);
    grid.innerHTML = "<p>Erreur lors du chargement des menus.</p>";
  }
}

/**
 * Branche les événements sur les filtres.
 */
function bindFilters() {
  const resetBtn = document.querySelector(".filters-reset");

  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      const minPrix = document.getElementById("filter-minPrix");
      const maxPrix = document.getElementById("filter-maxPrix");
      const minPersonnes = document.getElementById("filter-minPersonnes");

      if (minPrix) minPrix.value = "";
      if (maxPrix) maxPrix.value = "";
      if (minPersonnes) minPersonnes.value = "";

      document
        .querySelectorAll(".filter-theme, .filter-regime")
        .forEach((cb) => (cb.checked = false));

      fetchAndRender();
    });
  }

  document
    .querySelectorAll("#filter-minPrix, #filter-maxPrix, #filter-minPersonnes")
    .forEach((el) => el.addEventListener("input", fetchAndRender));

  document
    .querySelectorAll(".filter-theme, .filter-regime")
    .forEach((cb) => cb.addEventListener("change", fetchAndRender));
}
export async function loadMenusPage() {
  bindFilters();
  fetchAndRender();
}
