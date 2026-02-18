import { apiGet } from "./api.js";

function labelStatut(s) {
  const map = {
    en_attente: "En attente",
    accepte: "Acceptée",
    preparation: "Préparation",
    livraison: "Livraison",
    livre: "Livrée",
    attente_materiel: "Attente matériel",
    terminee: "Terminée",
    annulee: "Annulée",
  };
  return map[s] || s || "-";
}

function renderMyOrders(container, orders) {
  if (!Array.isArray(orders) || orders.length === 0) {
    container.innerHTML = "<p>Vous n’avez aucune commande.</p>";
    return;
  }

  container.innerHTML = orders
    .map(
      (c) => `
      <article class="my-order">
        <div class="my-order-top">
          <strong>Commande #${c.id}</strong>
          <span class="badge">${labelStatut(c.statut)}</span>
        </div>

        <p><strong>Menu :</strong> ${c.menu?.titre || "-"}</p>
        <p><strong>Date :</strong> ${c.prestation?.date || "-"} ${c.prestation?.heure || ""}</p>
        <p><strong>Ville :</strong> ${c.prestation?.ville || "-"}</p>
        <p><strong>Total :</strong> ${c.prestation?.prixTotal || "-"} €</p>

        <a class="menu-btn" href="/avis?commandeId=${c.id}&menuId=${c.menu?.id || ""}" data-link>
          Laisser un avis
        </a>
      </article>
    `,
    )
    .join("");
}

export async function loadComptePage() {
  const container = document.getElementById("compte-orders");
  if (!container) return;

  container.innerHTML = "<p>Chargement...</p>";

  try {
    const orders = await apiGet("/api/me/commandes");
    renderMyOrders(container, orders);
  } catch (e) {
    container.innerHTML = `<p>Erreur : ${e.message}</p>`;
  }
}
