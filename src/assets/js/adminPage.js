import {
  apiGet,
  apiPost,
  apiPostForm,
  apiPatch,
  apiPut,
  apiDelete,
  API_BASE as RAW_API_BASE,
} from "./api.js";

const API_BASE = (RAW_API_BASE || "").replace(/\/$/, "");

function menuAssetUrl(path) {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  if (path.startsWith("/")) return `${API_BASE}${path}`;
  return `${API_BASE}/${path}`;
}

/** Derniers menus admin (pour le bouton « Modifier »). */
let lastAdminMenus = [];
let menuEditingId = null;
let menuEditingImage = "";

/** Taille max image menu (upload). */
const MAX_MENU_IMAGE_BYTES = 5 * 1024 * 1024;

let menuImagePreviewObjectUrl = null;

function extractUploadedImagePath(data) {
  if (data == null) return "";
  if (typeof data === "string") return data;
  const o = data.data && typeof data.data === "object" ? data.data : data;
  const path =
    o.path ||
    o.image ||
    o.url ||
    o.filePath ||
    o.location ||
    (typeof o.file === "string" ? o.file : "");
  return typeof path === "string" ? path : "";
}

/**
 * POST multipart vers l’API : champ fichier attendu : "file".
 * Réponse JSON : au moins un de path | image | url | filePath | location.
 */
async function uploadMenuImageFile(file) {
  if (file.size > MAX_MENU_IMAGE_BYTES) {
    throw new Error("Image trop volumineuse (maximum 5 Mo).");
  }
  const fd = new FormData();
  fd.append("file", file);
  const data = await apiPostForm("/api/admin/menus/upload", fd);
  const path = extractUploadedImagePath(data);
  if (!path) {
    throw new Error(
      "Réponse serveur inattendue : fournissez path, image ou url après l’upload.",
    );
  }
  return path;
}

function resetMenuImagePreview() {
  const preview = document.getElementById("m-image-preview");
  const previewLabel = document.getElementById("m-image-preview-label");
  const input = document.getElementById("m-image-file");
  if (menuImagePreviewObjectUrl) {
    URL.revokeObjectURL(menuImagePreviewObjectUrl);
    menuImagePreviewObjectUrl = null;
  }
  if (preview) {
    preview.hidden = true;
    preview.style.display = "none";
    preview.removeAttribute("src");
  }
  if (previewLabel) {
    previewLabel.hidden = true;
    previewLabel.style.display = "none";
  }
  if (input) input.value = "";
}

function bindMenuImagePreview() {
  const input = document.getElementById("m-image-file");
  const preview = document.getElementById("m-image-preview");
  const previewLabel = document.getElementById("m-image-preview-label");
  if (!input || !preview) return;

  input.addEventListener("change", () => {
    if (menuImagePreviewObjectUrl) {
      URL.revokeObjectURL(menuImagePreviewObjectUrl);
      menuImagePreviewObjectUrl = null;
    }
    const f = input.files?.[0];
    if (!f) {
      preview.hidden = true;
      preview.style.display = "none";
      preview.removeAttribute("src");
      if (previewLabel) {
        previewLabel.hidden = true;
        previewLabel.style.display = "none";
      }
      return;
    }
    menuImagePreviewObjectUrl = URL.createObjectURL(f);
    preview.src = menuImagePreviewObjectUrl;
    preview.hidden = false;
    preview.style.display = "block";
    if (previewLabel) {
      previewLabel.hidden = false;
      previewLabel.style.display = "block";
    }
  });
}

/**
 * Sécurise les textes affichés dans le HTML (évite l’injection de code).
 */
function esc(str) {
  return String(str ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

/**
 * Transforme un statut “technique”
 */
function labelStatutCommande(s) {
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

/**
 * Liste des statuts possibles côté admin (utilisée pour le <select> des commandes).
 */
const ADMIN_STATUTS = [
  "en_attente",
  "accepte",
  "preparation",
  "livraison",
  "livre",
  "attente_materiel",
  "terminee",
  "annulee",
];

/** Récupère les avis en attente via l’API */
async function fetchAvisPending() {
  return apiGet("/api/admin/avis/pending");
}

/** Affiche la liste des avis en attente dans la page */
function renderAvis(container, avis) {
  if (!Array.isArray(avis) || avis.length === 0) {
    container.innerHTML = "<p>Aucun avis en attente.</p>";
    return;
  }

  container.innerHTML = avis
    .map(
      (a) => `
      <article class="admin-item" data-avis-id="${esc(a.id)}">
        <div class="admin-item-top">
          <div><strong>#${esc(a.id)}</strong> — ${esc(a.menu?.titre || "-")}</div>
          <div>⭐ ${esc(a.note ?? "-")}</div>
        </div>

        <p class="admin-item-line"><strong>Auteur :</strong> ${esc(a.utilisateur?.prenom || "")} ${esc(a.utilisateur?.nom || "")}</p>
        <p class="admin-item-line"><strong>Commentaire :</strong> ${esc(a.commentaire || "-")}</p>

        <div class="admin-item-actions">
          <button class="btn btn-solid admin-avis-accept" type="button">Accepter</button>
          <button class="btn btn-outline admin-avis-refuse" type="button">Refuser</button>
        </div>

        <p class="admin-msg" aria-live="polite"></p>
      </article>
    `,
    )
    .join("");
}

/**
 * Ajoute les actions sur les avis (accepter/refuser).
 */
function bindAvisActions(container, refresh) {
  container.addEventListener("click", async (e) => {
    const acceptBtn = e.target.closest(".admin-avis-accept");
    const refuseBtn = e.target.closest(".admin-avis-refuse");
    if (!acceptBtn && !refuseBtn) return;

    const card = e.target.closest("[data-avis-id]");
    const id = Number(card?.dataset?.avisId || 0);
    if (!id) return;

    const msg = card.querySelector(".admin-msg");
    if (msg) msg.textContent = "Mise à jour...";

    const payload = { valide: !!acceptBtn };

    try {
      await apiPatch(`/api/admin/avis/${id}`, payload);
      if (msg) msg.textContent = "✅ Avis mis à jour";
      await refresh();
    } catch (err) {
      console.error(err);
      if (msg) msg.textContent = `❌ ${err.message || "Erreur"}`;
    }
  });
}

/* 
   HORAIRES (Admin)
   Rôle : afficher / ajouter / supprimer des horaires.
 */

async function fetchHoraires() {
  return apiGet("/api/admin/horaires");
}

/** Affiche les horaires */
function renderHoraires(container, horaires) {
  if (!Array.isArray(horaires) || horaires.length === 0) {
    container.innerHTML = "<p>Aucun horaire.</p>";
    return;
  }

  container.innerHTML = horaires
    .map(
      (h) => `
      <article class="admin-item" data-horaire-id="${esc(h.id)}">
        <div class="admin-item-top">
          <div><strong>${esc(h.jour)}</strong></div>
          <div>${esc(h.ouverture)} - ${esc(h.fermeture)}</div>
        </div>

        <div class="admin-item-actions">
          <button class="btn btn-danger-solid admin-horaire-delete" type="button">Supprimer</button>
        </div>

        <p class="admin-msg" aria-live="polite"></p>
      </article>
    `,
    )
    .join("");
}

/**
 * Gère le formulaire d’ajout d’horaire (validation simple + POST).
 */
function bindHoraireForm(refresh) {
  const form = document.getElementById("admin-horaire-form");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const jour = document.getElementById("h-jour")?.value.trim();
    const ouverture = document.getElementById("h-ouv")?.value;
    const fermeture = document.getElementById("h-fer")?.value;

    if (!jour || !ouverture || !fermeture) {
      alert("Tous les champs horaires sont obligatoires.");
      return;
    }

    try {
      await apiPost("/api/admin/horaires", { jour, ouverture, fermeture });
      form.reset();
      await refresh();
    } catch (err) {
      console.error(err);
      alert(err.message || "Erreur ajout horaire");
    }
  });
}

/**
 * Gère la suppression d’un horaire (DELETE).
 */
function bindHoraireActions(container, refresh) {
  container.addEventListener("click", async (e) => {
    const btn = e.target.closest(".admin-horaire-delete");
    if (!btn) return;

    const card = e.target.closest("[data-horaire-id]");
    const id = Number(card?.dataset?.horaireId || 0);
    if (!id) return;

    const msg = card.querySelector(".admin-msg");
    if (msg) msg.textContent = "Suppression...";

    try {
      await apiDelete(`/api/admin/horaires/${id}`);
      await refresh();
    } catch (err) {
      console.error(err);
      if (msg) msg.textContent = `❌ ${err.message || "Erreur"}`;
    }
  });
}

/* 
   MENUS (Admin)
   Rôle : afficher / ajouter / supprimer des menus.
    */

async function fetchMenusAdmin() {
  return apiGet("/api/admin/menus");
}

/** Affiche les menus */
function renderMenus(container, menus) {
  if (!Array.isArray(menus) || menus.length === 0) {
    container.innerHTML = "<p>Aucun menu.</p>";
    return;
  }

  container.innerHTML = menus
    .map(
      (m) => `
      <article class="admin-item" data-menu-id="${esc(m.id)}">
        <div class="admin-item-top">
          <div><strong>${esc(m.titre)}</strong></div>
          <div>${esc(m.prixMin)} € / pers</div>
        </div>

        <p class="admin-item-line"><strong>Thème :</strong> ${esc(m.theme || "-")}</p>
        <p class="admin-item-line"><strong>Régime :</strong> ${esc(m.regime || "-")}</p>
        <p class="admin-item-line"><strong>Min :</strong> ${esc(m.nbPersonnesMin)} pers</p>

        <div class="admin-item-actions">
          <button class="btn btn-solid admin-menu-edit" type="button">Modifier</button>
          <button class="btn btn-danger-solid admin-menu-delete" type="button">Supprimer</button>
        </div>

        <p class="admin-msg" aria-live="polite"></p>
      </article>
    `,
    )
    .join("");
}

function setMenuFormCreateMode() {
  menuEditingId = null;
  menuEditingImage = "";
  const hid = document.getElementById("m-menu-id");
  if (hid) hid.value = "";
  const cancel = document.getElementById("m-menu-cancel-edit");
  if (cancel) cancel.hidden = true;
  const sub = document.getElementById("m-menu-submit");
  if (sub) sub.textContent = "Créer menu";
}

/**
 * Gère le formulaire de création / édition de menu (POST ou PUT).
 */
function bindMenuForm(refresh) {
  const form = document.getElementById("admin-menu-form");
  if (!form) return;

  const cancelBtn = document.getElementById("m-menu-cancel-edit");
  if (cancelBtn) {
    cancelBtn.addEventListener("click", () => {
      form.reset();
      resetMenuImagePreview();
      setMenuFormCreateMode();
    });
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const titre = document.getElementById("m-titre")?.value.trim();
    const prixMin = Number(document.getElementById("m-prix")?.value || 0);
    const nbPersonnesMin = Number(document.getElementById("m-nb")?.value || 0);
    const theme = document.getElementById("m-theme")?.value.trim() || "";
    const regime = document.getElementById("m-regime")?.value.trim() || "";
    const entree = document.getElementById("m-entree")?.value.trim() || "";
    const plat = document.getElementById("m-plat")?.value.trim() || "";
    const dessert = document.getElementById("m-dessert")?.value.trim() || "";
    const imageFile = document.getElementById("m-image-file")?.files?.[0];
    const description = document.getElementById("m-desc")?.value.trim() || "";
    const conditions = document.getElementById("m-cond")?.value.trim() || "";

    if (!titre || prixMin <= 0 || nbPersonnesMin <= 0 || !description) {
      alert("Champs menu invalides (titre, prix, nb min, description).");
      return;
    }

    let image = "";
    try {
      if (imageFile) {
        image = await uploadMenuImageFile(imageFile);
      }
    } catch (err) {
      console.error(err);
      alert(
        err.message ||
          "Échec de l’envoi de l’image. Vérifiez POST /api/admin/menus/upload (multipart, champ file).",
      );
      return;
    }

    const editing = menuEditingId != null && menuEditingId > 0;
    if (editing && !image && menuEditingImage) {
      image = menuEditingImage;
    }

    const payload = {
      titre,
      prixMin,
      nbPersonnesMin,
      theme,
      regime,
      image,
      description,
      conditions,
    };

    try {
      if (editing) {
        await apiPut(`/api/admin/menus/${menuEditingId}`, payload);
      } else {
        await apiPost("/api/admin/menus", payload);
      }
      form.reset();
      resetMenuImagePreview();
      setMenuFormCreateMode();
      await refresh();
    } catch (err) {
      console.error(err);
      alert(
        err.message ||
          (editing ? "Erreur mise à jour menu" : "Erreur création menu"),
      );
    }
  });
}

/**
 * Remplit le formulaire pour éditer un menu existant.
 */
function bindMenuEditClicks(container) {
  container.addEventListener("click", (e) => {
    const btn = e.target.closest(".admin-menu-edit");
    if (!btn) return;

    const card = e.target.closest("[data-menu-id]");
    const id = Number(card?.dataset?.menuId || 0);
    if (!id) return;

    const menu = lastAdminMenus.find((m) => Number(m.id) === id);
    if (!menu) return;

    menuEditingId = id;
    menuEditingImage = typeof menu.image === "string" ? menu.image : "";

    const hid = document.getElementById("m-menu-id");
    if (hid) hid.value = String(id);

    const setVal = (elId, v) => {
      const el = document.getElementById(elId);
      if (el) el.value = v ?? "";
    };

    setVal("m-titre", menu.titre);
    setVal("m-prix", menu.prixMin ?? "");
    setVal("m-nb", menu.nbPersonnesMin ?? "");
    setVal("m-theme", menu.theme ?? "");
    setVal("m-regime", menu.regime ?? "");
    setVal("m-entree", menu.entree ?? "");
    setVal("m-plat", menu.plat ?? "");
    setVal("m-dessert", menu.dessert ?? "");
    setVal("m-desc", menu.description ?? "");
    setVal("m-cond", menu.conditions ?? "");

    const fileInput = document.getElementById("m-image-file");
    if (fileInput) fileInput.value = "";

    const preview = document.getElementById("m-image-preview");
    if (preview) {
      const url = menuAssetUrl(menuEditingImage);
      if (url) {
        preview.src = url;
        preview.hidden = false;
      } else {
        preview.removeAttribute("src");
        preview.hidden = true;
      }
    }

    if (menuImagePreviewObjectUrl) {
      URL.revokeObjectURL(menuImagePreviewObjectUrl);
      menuImagePreviewObjectUrl = null;
    }

    const cancel = document.getElementById("m-menu-cancel-edit");
    if (cancel) cancel.hidden = false;
    const sub = document.getElementById("m-menu-submit");
    if (sub) sub.textContent = "Enregistrer les modifications";

    container.querySelectorAll(".admin-item").forEach((el) => {
      el.classList.remove("admin-item--editing");
    });
    card.classList.add("admin-item--editing");

    document.getElementById("m-titre")?.focus();
  });
}

/** Gère la suppression d’un menu (DELETE). */
function bindMenuActions(container, refresh) {
  container.addEventListener("click", async (e) => {
    const btn = e.target.closest(".admin-menu-delete");
    if (!btn) return;

    const card = e.target.closest("[data-menu-id]");
    const id = Number(card?.dataset?.menuId || 0);
    if (!id) return;

    const msg = card.querySelector(".admin-msg");
    if (msg) msg.textContent = "Suppression...";

    try {
      await apiDelete(`/api/admin/menus/${id}`);
      if (menuEditingId === id) {
        const form = document.getElementById("admin-menu-form");
        form?.reset();
        resetMenuImagePreview();
        setMenuFormCreateMode();
      }
      await refresh();
    } catch (err) {
      console.error(err);
      if (msg) msg.textContent = `❌ ${err.message || "Erreur"}`;
    }
  });
}

/* 
   COMMANDES (Admin)
   Rôle : afficher les commandes, filtrer par statut,
   et permettre à l’admin de modifier le statut (PATCH).
 */

async function fetchAdminOrders() {
  const statut = document.getElementById("admin-filter-statut")?.value || "";
  const qs = statut ? `?statut=${encodeURIComponent(statut)}` : "";
  return apiGet(`/api/admin/commandes${qs}`);
}

/** Affiche la liste des commandes + select de statut */
function renderOrders(container, orders) {
  if (!Array.isArray(orders) || orders.length === 0) {
    container.innerHTML = "<p>Aucune commande.</p>";
    return;
  }

  container.innerHTML = orders
    .map((c) => {
      const client =
        `${c.utilisateur?.prenom || ""} ${c.utilisateur?.nom || ""}`.trim() ||
        "-";

      const options = ADMIN_STATUTS.map(
        (s) =>
          `<option value="${esc(s)}" ${c.statut === s ? "selected" : ""}>${esc(
            labelStatutCommande(s),
          )}</option>`,
      ).join("");

      return `
        <article class="admin-order" data-id="${esc(c.id)}">
          <!-- Informations principales de la commande -->
          <div class="admin-order-top">
            <div><strong>#${esc(c.id)}</strong> — ${esc(labelStatutCommande(c.statut))}</div>
            <div class="admin-order-meta">${esc(c.createdAt || "")}</div>
          </div>

          <!-- Détails client/menu/prestation -->
          <div class="admin-order-lines">
            <div><strong>Client :</strong> ${esc(client)}</div>
            <div><strong>Menu :</strong> ${esc(c.menu?.titre || "-")}</div>
            <div><strong>Prestation :</strong> ${esc(c.prestation?.date || "-")} ${esc(c.prestation?.heure || "-")} — ${esc(c.prestation?.ville || "-")}</div>
            <div><strong>Total :</strong> ${esc(c.prestation?.prixTotal ?? "-")} €</div>
          </div>

          <!-- Action admin : changer le statut -->
          <div class="admin-order-actions">
            <select class="admin-statut-select">${options}</select>

            <input
              class="admin-motif-input"
              type="text"
              placeholder="Motif annulation (si annulée)"
              value="${esc(c.motifAnnulation || "")}"
            />

            <button class="btn btn-solid admin-save" type="button">Mettre à jour</button>
          </div>

          <p class="admin-msg" aria-live="polite"></p>
        </article>
      `;
    })
    .join("");

  container.querySelectorAll(".admin-order").forEach((card) => {
    const select = card.querySelector(".admin-statut-select");
    const motif = card.querySelector(".admin-motif-input");
    if (!select || !motif) return;
    motif.style.display = select.value === "annulee" ? "block" : "none";
  });
}

/**
 * Gère les actions sur les commandes :
 */
function bindOrdersActions(container, refresh) {
  container.addEventListener("change", (e) => {
    const select = e.target.closest(".admin-statut-select");
    if (!select) return;
    const card = select.closest(".admin-order");
    const motif = card?.querySelector(".admin-motif-input");
    if (motif)
      motif.style.display = select.value === "annulee" ? "block" : "none";
  });

  container.addEventListener("click", async (e) => {
    const btn = e.target.closest(".admin-save");
    if (!btn) return;

    const card = btn.closest(".admin-order");
    const id = Number(card?.dataset?.id || 0);
    if (!id) return;

    const statut = card.querySelector(".admin-statut-select")?.value || "";
    const motifAnnulation = (
      card.querySelector(".admin-motif-input")?.value || ""
    ).trim();

    const msg = card.querySelector(".admin-msg");
    if (msg) msg.textContent = "Mise à jour...";

    const payload =
      statut === "annulee" ? { statut, motifAnnulation } : { statut };

    try {
      await apiPatch(`/api/admin/commandes/${id}/statut`, payload);
      if (msg) msg.textContent = "✅ Statut mis à jour";
      await refresh();
    } catch (err) {
      console.error(err);
      if (msg) msg.textContent = `❌ ${err.message || "Erreur"}`;
    }
  });
}

/* 
   STATS MONGO (Admin)
   Rôle : afficher un résumé des statistiques des commandes.
*/

async function fetchMongoSummary() {
  return apiGet("/api/admin/stats/summary");
}

/** Affiche les stats si disponibles, sinon un message simple. */
function renderMongoStats(container, data) {
  if (!data?.ok) {
    container.innerHTML = `
      <section class="admin-card admin-card--warn">
        <div class="admin-card__head">
          <div>
            <div class="admin-card__title">Statistiques des commandes</div>
            <div class="admin-muted">Résumé de l’activité récente</div>
          </div>
        </div>
        <p class="admin-muted" style="margin-top:10px">
          Statistiques indisponibles pour le moment.
        </p>
      </section>
    `;
    return;
  }

  const total = Number(data.totalEvents ?? 0);

  const byType = (data.byType || [])
    .map(
      (x) => `
        <li class="admin-row">
          <span class="admin-badge">${esc(x.type ?? "-")}</span>
          <span class="admin-count">${esc(x.count ?? 0)}</span>
        </li>
      `,
    )
    .join("");

  const byStatut = (data.byStatut || [])
    .slice(0, 8)
    .map(
      (x) => `
        <li class="admin-row">
          <span class="admin-badge admin-badge--soft">${esc(
            labelStatutCommande(x.statut) ?? "-",
          )}</span>
          <span class="admin-count">${esc(x.count ?? 0)}</span>
        </li>
      `,
    )
    .join("");

  const last = (data.lastEvents || [])
    .slice(0, 8)
    .map(
      (e) => `
        <li class="admin-last">
          <span class="admin-last__id">#${esc(e.commandeId ?? "-")}</span>
          <span class="admin-last__meta">
            ${esc(e.type ?? "-")} • ${esc(labelStatutCommande(e.statut) ?? "-")}
          </span>
          <span class="admin-last__date">${esc(e.createdAt ?? "")}</span>
        </li>
      `,
    )
    .join("");

  container.innerHTML = `
    <section class="admin-card">
      <div class="admin-card__head">
        <div>
          <div class="admin-card__title">Statistiques des commandes</div>
          <div class="admin-muted">Résumé de l’activité récente</div>
        </div>

        <div class="admin-kpi" title="Nombre total d'événements enregistrés">
          <div class="admin-kpi__label">Total</div>
          <div class="admin-kpi__value">${esc(total)}</div>
        </div>
      </div>

      <div class="admin-grid">
        <div class="admin-panel">
          <div class="admin-panel__title">Événements par type</div>
          <ul class="admin-list">${byType || `<li class="admin-muted">—</li>`}</ul>
        </div>

        <div class="admin-panel">
          <div class="admin-panel__title">Événements par statut</div>
          <ul class="admin-list">${byStatut || `<li class="admin-muted">—</li>`}</ul>
        </div>
      </div>

      <div class="admin-panel" style="margin-top:12px">
        <div class="admin-panel__title">Derniers événements</div>
        <ul class="admin-last-list">${last || `<li class="admin-muted">—</li>`}</ul>
      </div>
    </section>
  `;
}

/* 
   ENTRY : loadAdminPage()
   Rôle : point d’entrée de la page admin.
*/

export async function loadAdminPage() {
  const avisBox = document.getElementById("admin-avis");
  const horairesBox = document.getElementById("admin-horaires");
  const menusBox = document.getElementById("admin-menus");
  const ordersBox = document.getElementById("admin-orders");
  const mongoBox = document.getElementById("admin-mongo-stats");

  const refreshAvis = async () => {
    if (!avisBox) return;
    avisBox.innerHTML = "<p>Chargement...</p>";
    try {
      const data = await fetchAvisPending();
      renderAvis(avisBox, data);
    } catch (err) {
      console.error(err);
      avisBox.innerHTML = "<p>Erreur chargement avis.</p>";
    }
  };

  const refreshHoraires = async () => {
    if (!horairesBox) return;
    horairesBox.innerHTML = "<p>Chargement...</p>";
    try {
      const data = await fetchHoraires();
      renderHoraires(horairesBox, data);
    } catch (err) {
      console.error(err);
      horairesBox.innerHTML = "<p>Erreur chargement horaires.</p>";
    }
  };

  const refreshMenus = async () => {
    if (!menusBox) return;
    menusBox.innerHTML = "<p>Chargement...</p>";
    try {
      const data = await fetchMenusAdmin();
      lastAdminMenus = Array.isArray(data) ? data : [];
      renderMenus(menusBox, data);
    } catch (err) {
      console.error(err);
      lastAdminMenus = [];
      menusBox.innerHTML = "<p>Erreur chargement menus.</p>";
    }
  };

  const refreshOrders = async () => {
    if (!ordersBox) return;
    ordersBox.innerHTML = "<p>Chargement...</p>";
    try {
      const data = await fetchAdminOrders();
      renderOrders(ordersBox, data);
    } catch (err) {
      console.error(err);
      ordersBox.innerHTML = "<p>Erreur chargement commandes.</p>";
    }
  };

  const refreshMongo = async () => {
    if (!mongoBox) return;
    mongoBox.innerHTML = "<p>Chargement...</p>";
    try {
      const data = await fetchMongoSummary();
      renderMongoStats(mongoBox, data);
    } catch (err) {
      console.error(err);
      mongoBox.innerHTML = "<p>Mongo: erreur.</p>";
    }
  };

  if (avisBox) bindAvisActions(avisBox, refreshAvis);
  if (horairesBox) bindHoraireActions(horairesBox, refreshHoraires);
  if (menusBox) {
    bindMenuActions(menusBox, refreshMenus);
    bindMenuEditClicks(menusBox);
  }
  if (ordersBox) bindOrdersActions(ordersBox, refreshOrders);

  bindHoraireForm(refreshHoraires);
  setMenuFormCreateMode();
  bindMenuForm(refreshMenus);
  bindMenuImagePreview();

  const filter = document.getElementById("admin-filter-statut");
  if (filter) filter.addEventListener("change", refreshOrders);

  await Promise.allSettled([
    refreshAvis(),
    refreshHoraires(),
    refreshMenus(),
    refreshOrders(),
    refreshMongo(),
  ]);
}
