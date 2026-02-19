import { apiPost } from "./api.js";

export function bindInscriptionForm() {
  const form = document.getElementById("form-inscription");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const payload = {
      prenom: document.getElementById("prenom")?.value.trim() || "",
      nom: document.getElementById("nom")?.value.trim() || "",
      email: document.getElementById("email")?.value.trim() || "",
      gsm: document.getElementById("gsm")?.value.trim() || "",
      adresse: document.getElementById("adresse")?.value.trim() || "",
      ville: document.getElementById("ville")?.value.trim() || "",
      codePostal: parseInt(
        document.getElementById("code_postal")?.value.trim() || "0",
        10,
      ),
      password: document.getElementById("mot_de_passe")?.value || "",
    };

    const confirm =
      document.getElementById("confirmation_mot_de_passe")?.value || "";
    if (payload.password !== confirm) {
      alert("Les mots de passe ne correspondent pas.");
      return;
    }

    try {
      await apiPost("/api/auth/register", payload);
      alert("✅ Inscription réussie ! Vous pouvez vous connecter.");
      window.location.href = "/connexion";
    } catch (err) {
      console.error(err);
      alert(err?.message || "Erreur lors de l'inscription.");
    }
  });
}
