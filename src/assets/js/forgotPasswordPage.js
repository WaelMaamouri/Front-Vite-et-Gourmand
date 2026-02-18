import { apiPost } from "./api.js";

export function bindForgotPasswordForm() {
  const form = document.getElementById("forgot-form");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("forgot-email")?.value.trim() || "";
    if (!email) {
      alert("Veuillez saisir votre email.");
      return;
    }

    try {
      await apiPost("/api/auth/forgot-password", { email });
      alert("✅ Si le compte existe, un email a été envoyé.");
      form.reset();
    } catch (err) {
      console.error(err);
      alert(err.message || "Erreur envoi email");
    }
  });
}
