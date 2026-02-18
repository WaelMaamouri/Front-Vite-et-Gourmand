import { apiGet, apiPost } from "./api.js";

// Récupère l'id menu depuis l'URL
function getMenuIdFromUrl() {
  const id = new URLSearchParams(location.search).get("id");
  const n = Number(id);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

// Vérifie si l'utilisateur est connecté
function getUserId() {
  const u = JSON.parse(localStorage.getItem("vg_user") || "null");
  const n = Number(u && u.id ? u.id : 0);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

// Remplit la liste déroulante des menus
async function fillMenusSelect() {
  const select = document.getElementById("cmd-menu");
  if (!select) return;

  select.innerHTML = `<option value="">-- Choisir un menu --</option>`;

  try {
    const menus = await apiGet("/api/menus");
    for (const m of menus) {
      const opt = document.createElement("option");
      opt.value = String(m.id);
      opt.textContent = `${m.titre} (${m.prixMin}€/pers min)`;
      select.appendChild(opt);
    }
  } catch (e) {
    console.error("Erreur chargement menus:", e);
  }
}

export async function bindCommandeForm() {
  const form = document.getElementById("commande-form");
  if (!form) return;

  await fillMenusSelect();

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const userId = getUserId();
    if (!userId) {
      alert("Vous devez être connecté pour demander un devis.");
      window.location.href = "/connexion";
      return;
    }

    const select = document.getElementById("cmd-menu");
    const menuFromSelect = select ? Number(select.value || 0) : 0;
    const menuId = getMenuIdFromUrl() || menuFromSelect;

    if (!menuId) {
      alert("Veuillez choisir un menu.");
      return;
    }

    const datePrestation = document.getElementById("cmd-date")?.value || "";
    const heureLivraison = document.getElementById("cmd-heure")?.value || "";
    const adressePrestation =
      document.getElementById("cmd-adresse")?.value || "";
    const villePrestation = document.getElementById("cmd-ville")?.value || "";
    const kmParcourus = Number(document.getElementById("cmd-km")?.value || 0);
    const nbPersonnes = Number(
      document.getElementById("cmd-personnes")?.value || 0,
    );

    const missing = [];
    if (!datePrestation) missing.push("date");
    if (!heureLivraison) missing.push("heure");
    if (!adressePrestation) missing.push("adresse");
    if (!villePrestation) missing.push("ville");
    if (!nbPersonnes || nbPersonnes <= 0) missing.push("personnes");

    const villeLower = villePrestation.trim().toLowerCase();
    if (villeLower !== "bordeaux" && (!kmParcourus || kmParcourus <= 0)) {
      missing.push("km");
    }

    if (missing.length) {
      alert("Champs manquants : " + missing.join(", "));
      return;
    }

    const payload = {
      menuId,
      datePrestation,
      heureLivraison,
      adressePrestation,
      villePrestation,
      kmParcourus,
      nbPersonnes,
    };

    try {
      const res = await apiPost("/api/commandes", payload);

      const p = res?.pricing;
      if (p) {
        alert(
          `✅ Demande envoyée ! (Commande #${res.id})\n\n` +
            `Prix menu : ${p.prixMenuBrut}€\n` +
            `Remise : -${p.remise}€\n` +
            `Menu après remise : ${p.prixMenuNet}€\n` +
            `Livraison : ${p.prixLivraison}€\n\n` +
            `TOTAL : ${p.total}€`,
        );
      } else {
        alert("✅ Demande envoyée !");
      }

      form.reset();
      if (select) select.value = "";
    } catch (err) {
      console.error(err);
      alert(err.message || "Erreur envoi demande");
    }
  });
}
