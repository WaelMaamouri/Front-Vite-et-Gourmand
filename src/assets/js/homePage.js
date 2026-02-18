import { apiGet } from "./api.js";

function stars(n) {
  const k = Math.max(0, Math.min(5, Number(n) || 0));
  return "⭐".repeat(k);
}

function renderHomeAvis(container, avis) {
  if (!Array.isArray(avis) || avis.length === 0) {
    container.innerHTML = "<p>Aucun avis pour le moment.</p>";
    return;
  }

  container.innerHTML = avis
    .slice(0, 6)
    .map((a) => {
      const nom =
        `${a.utilisateur?.prenom || ""} ${a.utilisateur?.nom || ""}`.trim() ||
        "Client";
      const menu = a.menu?.titre || "";
      return `
        <article class="avis-card">
          <div class="avis-top">
            <strong>${nom}</strong>
            <span class="avis-stars">${stars(a.note)}</span>
          </div>
          ${menu ? `<p class="avis-menu">${menu}</p>` : ""}
          <p class="avis-text">${a.commentaire || ""}</p>
        </article>
      `;
    })
    .join("");
}

export async function loadHomePage() {
  const box = document.getElementById("home-avis");
  if (!box) return;

  box.innerHTML = "<p>Chargement...</p>";
  try {
    const avis = await apiGet("/api/avis");
    renderHomeAvis(box, avis);
  } catch (e) {
    console.error(e);
    box.innerHTML = "<p>Impossible de charger les avis.</p>";
  }
}
