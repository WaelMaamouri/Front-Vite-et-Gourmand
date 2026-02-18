import { API_BASE } from "./api.js";

function getVal(id) {
  const el = document.getElementById(id);
  return el ? el.value.trim() : "";
}

export function bindInscriptionForm() {
  const form = document.getElementById("form-inscription");
  console.log("form-inscription =", form);
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const prenom = getVal("prenom");
    const nom = getVal("nom");
    const email = getVal("email");
    const gsm = getVal("gsm");
    const adresse = getVal("adresse");
    const ville = getVal("ville");
    const codePostalStr = getVal("code_postal");

    const password = document.getElementById("mot_de_passe")?.value || "";
    const confirm =
      document.getElementById("confirmation_mot_de_passe")?.value || "";

    if (
      !prenom ||
      !nom ||
      !email ||
      !gsm ||
      !adresse ||
      !ville ||
      !codePostalStr ||
      !password
    ) {
      alert("Merci de remplir tous les champs obligatoires.");
      return;
    }

    if (password !== confirm) {
      alert("Les mots de passe ne correspondent pas.");
      return;
    }

    const codePostal = parseInt(codePostalStr, 10);
    if (Number.isNaN(codePostal)) {
      alert("Code postal invalide.");
      return;
    }

    const cgu = document.getElementById("cgu");
    if (cgu && !cgu.checked) {
      alert("Vous devez accepter les conditions.");
      return;
    }

    const payload = {
      prenom,
      nom,
      email,
      password,
      adresse,
      ville,
      codePostal,
      gsm,
    };

    try {
      const API = import.meta.env.VITE_API_URL || "";
      const r = await fetch(`${API}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        alert(data?.message || `Erreur lors de l'inscription (${res.status}).`);
        return;
      }

      alert("✅ Inscription réussie ! Vous pouvez vous connecter.");
      window.location.href = "/connexion";
    } catch (err) {
      console.error(err);
      alert("Erreur serveur. Vérifie que l’API est accessible.");
    }
  });
}
