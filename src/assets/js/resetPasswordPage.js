import { apiPost } from "./api.js";

function getTokenFromUrl() {
  const token = new URLSearchParams(location.search).get("token");
  return token ? token.trim() : "";
}

export function bindResetPasswordForm() {
  const form = document.getElementById("reset-form");
  if (!form) return;

  const token = getTokenFromUrl();
  if (!token) {
    alert("Token manquant dans l’URL.");
    return;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const password = document.getElementById("reset-password")?.value || "";
    const password2 = document.getElementById("reset-password2")?.value || "";

    if (!password || !password2) {
      alert("Veuillez remplir les deux champs.");
      return;
    }

    if (password !== password2) {
      alert("Les mots de passe ne correspondent pas.");
      return;
    }

    // Règle ECF (même règle que back)
    const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{10,}$/;
    if (!re.test(password)) {
      alert(
        "Mot de passe invalide (10+ caractères, maj, min, chiffre, spécial).",
      );
      return;
    }

    try {
      await apiPost("/api/auth/reset-password", { token, password });
      alert("✅ Mot de passe mis à jour, vous pouvez vous connecter.");
      window.location.href = "/connexion";
    } catch (err) {
      console.error(err);
      alert(err.message || "Erreur reset password");
    }
  });
}
