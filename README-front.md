# Vite & Gourmand — README Frontend

## Description

Frontend du projet Vite & Gourmand développé en **JavaScript + Vite**.

Fonctionnalités :

- Connexion / inscription
- Affichage des menus
- Filtres dynamiques
- Interface utilisateur selon rôle

---

## Stack technique

- Vite
- JavaScript vanilla
- HTML / CSS
- Vercel (déploiement)

---

## Installation locale

```bash
# 1. Cloner
 git clone <repo-front>
 cd vite-gourmand-ecf-front

# 2. Installer
 npm install

# 3. Lancer
 npm run dev
```

---

## Variables d'environnement

Créer `.env` :

```env
VITE_API_URL=https://vite-et-gourmand-api.onrender.com
```

---

## Communication API

Toutes les requêtes passent par :

```js
${import.meta.env.VITE_API_URL}/api/...
```

Exemples :

- `/api/menus`
- `/api/login_check`
- `/api/auth/register`

---

## Gestion des images

Les images sont servies par le backend :

```
/assets/img/...
```

Le front reconstruit l'URL avec `API_BASE`.

---

## Déploiement

Le front est déployé sur **Vercel**.

Build automatique à chaque push sur `main`.

---

## 👨‍💻 Auteur

Projet réalisé dans le cadre de l'ECF — Formation Développeur Web Full Stack.
