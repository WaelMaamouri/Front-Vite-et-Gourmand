import { apiPost } from "./api.js";

function getParam(name) {
  return new URLSearchParams(location.search).get(name);
}

function toInt(v) {
  const n = Number.parseInt(String(v || ""), 10);
  return Number.isFinite(n) ? n : 0;
}

export function loadAvisPage() {
  const form = document.getElementById("avis-form");
  if (!form) return;

  const commandeId = toInt(getParam("commandeId"));

  if (!commandeId) {
    alert("Commande introuvable : id manquant.");
    return;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const note = toInt(document.getElementById("avis-note")?.value);
    const commentaire = (
      document.getElementById("avis-commentaire")?.value || ""
    ).trim();

    const missing = [];
    if (!note || note < 1 || note > 5) missing.push("note (1-5)");
    if (!commentaire) missing.push("commentaire");

    if (missing.length) {
      alert("Champs invalides : " + missing.join(", "));
      return;
    }

    const payload = { commandeId, note, commentaire };

    const btn = form.querySelector('button[type="submit"]');
    if (btn) btn.disabled = true;

    try {
      await apiPost("/api/avis", payload);
      alert("✅ Avis envoyé (en attente de validation) !");
      form.reset();
    } catch (err) {
      alert(err.message || "Erreur avis");
    } finally {
      if (btn) btn.disabled = false;
    }
  });
}
