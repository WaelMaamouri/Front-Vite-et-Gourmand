import { bindCommandeForm } from "./commande.js";

export function loadContactPage() {
  bindCommandeForm();

  const formContact = document.getElementById("form-contact");

  if (formContact) {
    formContact.addEventListener("submit", (e) => {
      e.preventDefault();
      alert("✅ Message envoyé !");
      formContact.reset();
    });
  }
}
