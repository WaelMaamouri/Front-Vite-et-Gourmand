/**
 * Récupère la valeur d’un champ input par son id.
 */
function getValue(id) {
  const el = document.getElementById(id);
  return el ? el.value.trim() : "";
}

/**
 * Initialise le formulaire d’inscription.
 */
export function bindInscriptionForm() {
  const form = document.getElementById("form-inscription");
  console.log("form-inscription =", form);

  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const prenom = getValue("prenom");
    const nom = getValue("nom");
    const email = getValue("email");
    const gsm = getValue("gsm");
    const adresse = getValue("adresse");
    const ville = getValue("ville");
    const codePostalStr = getValue("code_postal");
    const password = document.getElementById("mot_de_passe")?.value || "";
    const password2 =
      document.getElementById("confirmation_mot_de_passe")?.value || "";

    console.log({
      prenom,
      nom,
      email,
      gsm,
      adresse,
      ville,
      codePostalStr,
      passwordLen: password.length,
    });

    /**
     * Vérifie que tous les champs obligatoires sont remplis
     */
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

    /**
     * Vérifie que les deux mots de passe correspondent
     */
    if (password !== password2) {
      alert("Les mots de passe ne correspondent pas.");
      return;
    }

    /**
     * Conversion et validation du code postal
     */
    const codePostal = parseInt(codePostalStr, 10);
    if (Number.isNaN(codePostal)) {
      alert("Code postal invalide.");
      return;
    }

    /**
     * Vérifie que les CGU sont acceptées
     */
    const cgu = document.getElementById("cgu");
    if (cgu && !cgu.checked) {
      alert("Vous devez accepter les conditions.");
      return;
    }

    // Données envoyées à l’API
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
      const res = await fetch("http://127.0.0.1:8000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        alert(data.message || "Erreur lors de l'inscription.");
        return;
      }

      alert("✅ Inscription réussie ! Vous pouvez vous connecter.");
      window.location.href = "/connexion";
    } catch (err) {
      console.error(err);
      alert("Erreur serveur. Vérifie que Symfony est démarré.");
    }
  });
}
