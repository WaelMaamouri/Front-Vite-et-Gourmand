import { apiGet, apiPatch } from "./api.js";

const EMP_STATUTS = [
  "accepte",
  "preparation",
  "livraison",
  "livre",
  "attente_materiel",
  "terminee",
];

const FILTER_STATUTS = ["", "en_attente", ...EMP_STATUTS, "annulee"];

function labelStatut(s) {
  const map = {
    en_attente: "En attente",
    accepte: "Acceptée",
    preparation: "Préparation",
    livraison: "Livraison",
    livre: "Livré",
    attente_materiel: "Attente matériel",
    terminee: "Terminée",
    annulee: "Annulée",
  };
  return map[s] || s || "-";
}

function escapeHtml(str) {
  return String(str ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

/**
 * Construit les options du select de statut employé.
 */
function statutOptions(currentStatut) {
  const base = currentStatut === "en_attente" ? EMP_STATUTS : EMP_STATUTS;

  const opts = base
    .map(
      (s) =>
        `<option value="${s}" ${currentStatut === s ? "selected" : ""}>${labelStatut(
          s,
        )}</option>`,
    )
    .join("");

  const cancelOpt = `<option value="annulee" ${
    currentStatut === "annulee" ? "selected" : ""
  }>❌ Annuler</option>`;

  if (currentStatut === "annulee") {
    return cancelOpt + opts;
  }

  return opts + cancelOpt;
}

function render(container, orders) {
  if (!Array.isArray(orders) || orders.length === 0) {
    container.innerHTML = "<p>Aucune commande.</p>";
    return;
  }

  container.innerHTML = orders
    .map((c) => {
      const client =
        `${c.utilisateur?.prenom || ""} ${c.utilisateur?.nom || ""}`.trim() ||
        "-";
      const menu = c.menu?.titre || "-";
      const total = c.prestation?.prixTotal ?? "-";
      const date = c.prestation?.date || "-";
      const heure = c.prestation?.heure || "-";
      const ville = c.prestation?.ville || "-";

      const disabled = c.statut === "annulee" ? "disabled" : "";

      return `
        <article class="admin-order" data-id="${c.id}">
          <div class="admin-order-top">
            <div><strong>#${c.id}</strong> — ${escapeHtml(labelStatut(c.statut))}</div>
            <div class="admin-order-meta">${escapeHtml(c.createdAt || "")}</div>
          </div>

          <div class="admin-order-lines">
            <div><strong>Client :</strong> ${escapeHtml(client)}</div>
            <div><strong>Menu :</strong> ${escapeHtml(menu)}</div>
            <div><strong>Prestation :</strong> ${escapeHtml(date)} ${escapeHtml(
              heure,
            )} — ${escapeHtml(ville)}</div>
            <div><strong>Total :</strong> ${escapeHtml(total)} €</div>
          </div>

          ${
            c.motifAnnulation
              ? `<div class="admin-order-lines">
                   <div><strong>Motif annulation :</strong> ${escapeHtml(
                     c.motifAnnulation,
                   )}</div>
                 </div>`
              : ""
          }

          <div class="admin-order-actions">
            <select class="emp-statut-select" ${disabled}>
              ${statutOptions(c.statut)}
            </select>
            <button class="btn btn-solid emp-save" ${disabled}>Mettre à jour</button>
          </div>

          <p class="admin-msg" aria-live="polite"></p>
        </article>
      `;
    })
    .join("");
}

async function fetchOrders() {
  const statut = document.getElementById("emp-filter-statut")?.value || "";
  const qs = statut ? `?statut=${encodeURIComponent(statut)}` : "";
  return apiGet(`/api/employe/commandes${qs}`);
}

async function handleCancel(id) {
  const motif = (prompt("Motif d’annulation (obligatoire) :") || "").trim();
  if (!motif) throw new Error("Motif requis");

  const contactRaw = (
    prompt('Mode de contact ("mail" ou "telephone") :', "mail") || ""
  )
    .trim()
    .toLowerCase();

  const contact = contactRaw === "telephone" ? "telephone" : "mail";

  await apiPatch(`/api/employe/commandes/${id}/annuler`, {
    motif,
    contact,
  });
}

function bindActions(container, refresh) {
  container.addEventListener("click", async (e) => {
    const btn = e.target.closest(".emp-save");
    if (!btn) return;

    const card = btn.closest(".admin-order");
    const id = Number(card?.dataset?.id || 0);
    if (!id) return;

    const select = card.querySelector(".emp-statut-select");
    const statut = select?.value;

    const msg = card.querySelector(".admin-msg");
    if (msg) msg.textContent = "Mise à jour...";

    try {
      if (statut === "annulee") {
        await handleCancel(id);
        if (msg) msg.textContent = "✅ Commande annulée";
      } else {
        await apiPatch(`/api/employe/commandes/${id}/statut`, { statut });
        if (msg) msg.textContent = "✅ Statut mis à jour";
      }

      await refresh();
    } catch (err) {
      console.error(err);
      if (msg) msg.textContent = `❌ ${err.message || "Erreur"}`;
    }
  });
}

function renderFilterOptions() {
  const filter = document.getElementById("emp-filter-statut");
  if (!filter) return;

  if (filter.dataset.filled === "1") return;

  filter.innerHTML = FILTER_STATUTS.map((s) => {
    const label = s === "" ? "Tous" : labelStatut(s);
    return `<option value="${s}">${label}</option>`;
  }).join("");

  filter.dataset.filled = "1";
}

export async function loadEmployePage() {
  const container = document.getElementById("emp-orders");
  if (!container) return;

  renderFilterOptions();

  const filter = document.getElementById("emp-filter-statut");

  const refresh = async () => {
    container.innerHTML = "<p>Chargement...</p>";
    const orders = await fetchOrders();
    render(container, orders);
  };

  if (filter) filter.addEventListener("change", refresh);

  bindActions(container, refresh);
  await refresh();
}
