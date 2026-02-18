// loginPage.js
import { apiPost, apiGet } from "./api.js";
import { refreshAuthUi } from "./authUi.js";

export function loadLoginPage() {
  const form = document.getElementById("form-connexion");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = (document.getElementById("email")?.value || "").trim();
    const password = document.getElementById("password")?.value || "";

    if (!email || !password) {
      alert("Email et mot de passe obligatoires.");
      return;
    }

    const submitBtn = form.querySelector(
      'button[type="submit"], input[type="submit"]',
    );
    if (submitBtn) submitBtn.disabled = true;

    try {
      const data = await apiPost("/api/login_check", {
        username: email,
        password,
      });

      if (!data?.token || !String(data.token).includes(".")) {
        throw new Error("Token JWT invalide reçu du serveur.");
      }

      localStorage.setItem("vg_token", data.token);

      // Récupère l'utilisateur connecté
      const me = await apiGet("/api/auth/me");
      localStorage.setItem("vg_user", JSON.stringify(me));

      refreshAuthUi();
      window.location.href = "/menus";
    } catch (err) {
      console.error(err);
      localStorage.removeItem("vg_token");
      localStorage.removeItem("vg_user");
      refreshAuthUi();
      alert(err?.message || "Erreur de connexion.");
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  });
}
