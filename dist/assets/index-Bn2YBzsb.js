(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))r(i);new MutationObserver(i=>{for(const a of i)if(a.type==="childList")for(const s of a.addedNodes)s.tagName==="LINK"&&s.rel==="modulepreload"&&r(s)}).observe(document,{childList:!0,subtree:!0});function t(i){const a={};return i.integrity&&(a.integrity=i.integrity),i.referrerPolicy&&(a.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?a.credentials="include":i.crossOrigin==="anonymous"?a.credentials="omit":a.credentials="same-origin",a}function r(i){if(i.ep)return;i.ep=!0;const a=t(i);fetch(i.href,a)}})();const Y="modulepreload",Q=function(n){return"/"+n},V={},L=function(e,t,r){let i=Promise.resolve();if(t&&t.length>0){let s=function(d){return Promise.all(d.map(m=>Promise.resolve(m).then(l=>({status:"fulfilled",value:l}),l=>({status:"rejected",reason:l}))))};document.getElementsByTagName("link");const o=document.querySelector("meta[property=csp-nonce]"),c=(o==null?void 0:o.nonce)||(o==null?void 0:o.getAttribute("nonce"));i=s(t.map(d=>{if(d=Q(d),d in V)return;V[d]=!0;const m=d.endsWith(".css"),l=m?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${d}"]${l}`))return;const p=document.createElement("link");if(p.rel=m?"stylesheet":Y,m||(p.as="script"),p.crossOrigin="",p.href=d,c&&p.setAttribute("nonce",c),document.head.appendChild(p),m)return new Promise((f,h)=>{p.addEventListener("load",f),p.addEventListener("error",()=>h(new Error(`Unable to preload CSS for ${d}`)))})}))}function a(s){const o=new Event("vite:preloadError",{cancelable:!0});if(o.payload=s,window.dispatchEvent(o),!o.defaultPrevented)throw s}return i.then(s=>{for(const o of s||[])o.status==="rejected"&&a(o.reason);return e().catch(a)})};class g{constructor(e,t,r,i,a=""){this.url=e,this.title=t,this.pathHtml=r,this.authorize=i,this.pathJS=a}}const X="Vite & Gourmand",N=[new g("/","Accueil","/pages/home.html",[]),new g("/menus","Menus","/pages/menus.html",[]),new g("/contact","Contact","/pages/contact.html",[]),new g("/connexion","Connexion","/pages/connexion.html",[]),new g("/inscription","Inscription","/pages/inscription.html",[]),new g("/menu","Détail menu","/pages/menu-detail.html",[]),new g("/compte","Mon compte","/pages/compte.html",[]),new g("/employe","Espace Employé","/pages/employe.html",[]),new g("/admin","Espace Admin","/pages/admin.html",[]),new g("/avis","Laisser un avis","/pages/avis.html",[]),new g("/404","Page introuvable","/pages/404.html",[])],x="";function Z(){return typeof window>"u"?null:localStorage.getItem("vg_token")}function H(n={}){const e=Z();return{Accept:"application/json",...e?{Authorization:`Bearer ${e}`}:{},...n}}async function B(n,e){const t=n.headers.get("content-type")||"";let r=null;if(t.includes("application/json"))r=await n.json().catch(()=>({}));else{const i=await n.text().catch(()=>"");if(!n.ok)throw new Error(`Erreur API (${e}) ${n.status}: ${i.slice(0,160)}`);return i}if(!n.ok)throw n.status===401?(typeof window<"u"&&(localStorage.removeItem("vg_token"),localStorage.removeItem("vg_user")),new Error("Non autorisé (401). Merci de vous reconnecter.")):new Error((r==null?void 0:r.message)||`Erreur API (${e}) ${n.status}`);return r}async function v(n){const e=await fetch(x+n,{method:"GET",headers:H(),credentials:"omit"});return B(e,"GET")}async function D(n,e){const t=await fetch(x+n,{method:"POST",headers:H({"Content-Type":"application/json"}),credentials:"omit",body:JSON.stringify(e??{})});return B(t,"POST")}async function C(n,e){const t=await fetch(x+n,{method:"PATCH",headers:H({"Content-Type":"application/json"}),credentials:"omit",body:JSON.stringify(e??{})});return B(t,"PATCH")}async function K(n,e=null){const t=await fetch(x+n,{method:"DELETE",headers:H({"Content-Type":"application/json"}),credentials:"omit",body:e?JSON.stringify(e):void 0});return B(t,"DELETE")}function z(n){const e=document.querySelector(`${n}:checked`);return e?e.value:""}function ee(){var o,c,d;const n=((o=document.getElementById("filter-minPrix"))==null?void 0:o.value.trim())||"",e=((c=document.getElementById("filter-maxPrix"))==null?void 0:c.value.trim())||"",t=((d=document.getElementById("filter-minPersonnes"))==null?void 0:d.value.trim())||"",r=z(".filter-theme"),i=z(".filter-regime"),a=new URLSearchParams;r&&a.set("theme",r),i&&a.set("regime",i),t&&a.set("minPersonnes",t),n&&a.set("minPrix",n),e&&a.set("maxPrix",e);const s=a.toString();return s?`?${s}`:""}function te(n,e){n.innerHTML=e.map(t=>`
        <article class="menu-card">
          ${t.image?`<img class="menu-img" src="${t.image}" alt="${t.titre}">`:'<div class="menu-img menu-img--placeholder">Image indisponible</div>'}
          <div class="menu-body">
            <div class="menu-tags">
              <span class="tag tag-primary">${t.theme??""}</span>
              <span class="tag">${t.regime??""}</span>
            </div>

            <h3 class="menu-name">${t.titre}</h3>
            <p class="menu-desc">${t.description??""}</p>

            <p class="menu-from">A partir de:</p>
            <div class="menu-bottom">
              <p class="menu-price">${t.prixMin}€<span>/ pers</span></p>
              <p class="menu-min">👥 ${t.nbPersonnesMin} pers. min</p>
            </div>

            <a class="menu-btn" href="/menu?id=${t.id}" data-link>Voir les détails</a>
          </div>
        </article>
      `).join("")}async function I(){const n=document.querySelector(".cards-grid");if(n){n.innerHTML="<p>Chargement...</p>";try{const e=ee(),t=await v("/api/menus"+e);te(n,t)}catch(e){console.error(e),n.innerHTML="<p>Erreur lors du chargement des menus.</p>"}}}function ne(){const n=document.querySelector(".filters-reset");n&&n.addEventListener("click",()=>{const e=document.getElementById("filter-minPrix"),t=document.getElementById("filter-maxPrix"),r=document.getElementById("filter-minPersonnes");e&&(e.value=""),t&&(t.value=""),r&&(r.value=""),document.querySelectorAll(".filter-theme, .filter-regime").forEach(i=>i.checked=!1),I()}),document.querySelectorAll("#filter-minPrix, #filter-maxPrix, #filter-minPersonnes").forEach(e=>e.addEventListener("input",I)),document.querySelectorAll(".filter-theme, .filter-regime").forEach(e=>e.addEventListener("change",I))}async function ie(){ne(),I()}function k(n){return n?n.split(`
`).map(e=>e.trim()).filter(Boolean):[]}function G(n){const e=Number(n);return Number.isNaN(e)?`${n}€`:`${e.toFixed(0)}€`}function O(n,e){return e.length?`
    <div class="menu-detail-col">
      <p class="menu-detail-col-title">${n}</p>
      <ul>
        ${e.map(t=>`<li>${t}</li>`).join("")}
      </ul>
    </div>
  `:""}function re(n,e){const t=e.image?`<img class="menu-detail-img" src="${e.image}" alt="${e.titre}">`:"",r=k(e.entrees),i=k(e.plats),a=k(e.desserts);n.innerHTML=`
    <article class="menu-detail-card">
      <div class="menu-detail-top">
        <div class="menu-detail-media">${t}</div>

        <div class="menu-detail-main">
          <div class="menu-detail-tags">
            <span class="tag tag-primary">${e.theme??""}</span>
            <span class="tag">${e.regime??""}</span>
          </div>

          <h1 class="menu-detail-title">${e.titre}</h1>
          <p class="menu-detail-desc">${e.description??""}</p>

          <div class="menu-detail-info">
            <p class="menu-detail-price">${G(e.prixMin)} <span>/ pers</span></p>
            <p class="menu-detail-min">👥 ${e.nbPersonnesMin} pers. min</p>
          </div>

          <div class="menu-detail-conditions">
            <p class="menu-detail-conditions-title">Conditions</p>
            <p class="menu-detail-conditions-text">${e.conditions??"-"}</p>
          </div>

          <div class="menu-detail-actions">
            <a class="btn btn-solid" href="/contact" data-link>Demander un devis</a>
            <a class="btn btn-solid" href="/menus" data-link>Voir tous les menus</a>
          </div>
        </div>
      </div>

      <div class="menu-detail-extra">
        <h2 class="menu-detail-subtitle">Détails du menu</h2>
        <p class="menu-detail-accroche">${e.details??"Menu personnalisable selon vos besoins."}</p>

        <h3 class="menu-detail-subsubtitle">Exemples de composition</h3>
        <div class="menu-detail-cols">
          ${O("Entrées",r)}
          ${O("Plats",i)}
          ${O("Desserts",a)}
        </div>
      </div>
    </article>
  `}function ae(n,e,t){const r=e.filter(i=>Number(i.id)!==Number(t)).slice(0,3);if(!r.length){n.innerHTML="<p>Aucune suggestion.</p>";return}n.innerHTML=r.map(i=>`
        <article class="suggestion-card">
          ${i.image?`<img class="suggestion-img" src="${i.image}" alt="${i.titre}">`:'<div class="suggestion-img suggestion-img--placeholder">Image</div>'}
          <div class="suggestion-body">
            <p class="suggestion-tags">
              <span class="tag tag-primary">${i.theme??""}</span>
              <span class="tag">${i.regime??""}</span>
            </p>
            <h3 class="suggestion-title">${i.titre}</h3>
            <p class="suggestion-price">${G(i.prixMin)} / pers</p>
            <a class="suggestion-link" href="/menu?id=${i.id}" data-link>Voir le menu</a>
          </div>
        </article>
      `).join("")}async function se(){const n=document.getElementById("menu-detail-content"),e=document.getElementById("menu-suggestions"),r=new URLSearchParams(window.location.search).get("id");if(n){if(!r){n.innerHTML="<p>Menu introuvable (id manquant).</p>",e&&(e.innerHTML="");return}n.innerHTML="<p>Chargement du menu...</p>",e&&(e.innerHTML="<p>Chargement des suggestions...</p>");try{const i=await v(`/api/menus/${r}`);re(n,i);const a=await v("/api/menus");e&&ae(e,a,r)}catch(i){console.error(i),n.innerHTML="<p>Erreur : impossible de charger ce menu.</p>",e&&(e.innerHTML="")}}}function oe(){const n=new URLSearchParams(location.search).get("id"),e=Number(n);return Number.isFinite(e)&&e>0?e:0}function ce(){const n=JSON.parse(localStorage.getItem("vg_user")||"null"),e=Number(n&&n.id?n.id:0);return Number.isFinite(e)&&e>0?e:0}async function le(){const n=document.getElementById("cmd-menu");if(n){n.innerHTML='<option value="">-- Choisir un menu --</option>';try{const e=await v("/api/menus");for(const t of e){const r=document.createElement("option");r.value=String(t.id),r.textContent=`${t.titre} (${t.prixMin}€/pers min)`,n.appendChild(r)}}catch(e){console.error("Erreur chargement menus:",e)}}}async function de(){const n=document.getElementById("commande-form");n&&(await le(),n.addEventListener("submit",async e=>{var $,E,A,M,T,_;if(e.preventDefault(),!ce()){alert("Vous devez être connecté pour demander un devis."),window.location.href="/connexion";return}const r=document.getElementById("cmd-menu"),i=r?Number(r.value||0):0,a=oe()||i;if(!a){alert("Veuillez choisir un menu.");return}const s=(($=document.getElementById("cmd-date"))==null?void 0:$.value)||"",o=((E=document.getElementById("cmd-heure"))==null?void 0:E.value)||"",c=((A=document.getElementById("cmd-adresse"))==null?void 0:A.value)||"",d=((M=document.getElementById("cmd-ville"))==null?void 0:M.value)||"",m=Number(((T=document.getElementById("cmd-km"))==null?void 0:T.value)||0),l=Number(((_=document.getElementById("cmd-personnes"))==null?void 0:_.value)||0),p=[];if(s||p.push("date"),o||p.push("heure"),c||p.push("adresse"),d||p.push("ville"),(!l||l<=0)&&p.push("personnes"),d.trim().toLowerCase()!=="bordeaux"&&(!m||m<=0)&&p.push("km"),p.length){alert("Champs manquants : "+p.join(", "));return}const h={menuId:a,datePrestation:s,heureLivraison:o,adressePrestation:c,villePrestation:d,kmParcourus:m,nbPersonnes:l};try{const b=await D("/api/commandes",h),w=b==null?void 0:b.pricing;alert(w?`✅ Demande envoyée ! (Commande #${b.id})

Prix menu : ${w.prixMenuBrut}€
Remise : -${w.remise}€
Menu après remise : ${w.prixMenuNet}€
Livraison : ${w.prixLivraison}€

TOTAL : ${w.total}€`:"✅ Demande envoyée !"),n.reset(),r&&(r.value="")}catch(b){console.error(b),alert(b.message||"Erreur envoi demande")}}))}function ue(){de();const n=document.getElementById("form-contact");n&&n.addEventListener("submit",e=>{e.preventDefault(),alert("✅ Message envoyé !"),n.reset()})}const q=["accepte","preparation","livraison","livre","attente_materiel","terminee"],me=["","en_attente",...q,"annulee"];function U(n){return{en_attente:"En attente",accepte:"Acceptée",preparation:"Préparation",livraison:"Livraison",livre:"Livré",attente_materiel:"Attente matériel",terminee:"Terminée",annulee:"Annulée"}[n]||n||"-"}function y(n){return String(n??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;")}function pe(n){const t=q.map(i=>`<option value="${i}" ${n===i?"selected":""}>${U(i)}</option>`).join(""),r=`<option value="annulee" ${n==="annulee"?"selected":""}>❌ Annuler</option>`;return n==="annulee"?r+t:t+r}function fe(n,e){if(!Array.isArray(e)||e.length===0){n.innerHTML="<p>Aucune commande.</p>";return}n.innerHTML=e.map(t=>{var m,l,p,f,h,$,E;const r=`${((m=t.utilisateur)==null?void 0:m.prenom)||""} ${((l=t.utilisateur)==null?void 0:l.nom)||""}`.trim()||"-",i=((p=t.menu)==null?void 0:p.titre)||"-",a=((f=t.prestation)==null?void 0:f.prixTotal)??"-",s=((h=t.prestation)==null?void 0:h.date)||"-",o=(($=t.prestation)==null?void 0:$.heure)||"-",c=((E=t.prestation)==null?void 0:E.ville)||"-",d=t.statut==="annulee"?"disabled":"";return`
        <article class="admin-order" data-id="${t.id}">
          <div class="admin-order-top">
            <div><strong>#${t.id}</strong> — ${y(U(t.statut))}</div>
            <div class="admin-order-meta">${y(t.createdAt||"")}</div>
          </div>

          <div class="admin-order-lines">
            <div><strong>Client :</strong> ${y(r)}</div>
            <div><strong>Menu :</strong> ${y(i)}</div>
            <div><strong>Prestation :</strong> ${y(s)} ${y(o)} — ${y(c)}</div>
            <div><strong>Total :</strong> ${y(a)} €</div>
          </div>

          ${t.motifAnnulation?`<div class="admin-order-lines">
                   <div><strong>Motif annulation :</strong> ${y(t.motifAnnulation)}</div>
                 </div>`:""}

          <div class="admin-order-actions">
            <select class="emp-statut-select" ${d}>
              ${pe(t.statut)}
            </select>
            <button class="btn btn-solid emp-save" ${d}>Mettre à jour</button>
          </div>

          <p class="admin-msg" aria-live="polite"></p>
        </article>
      `}).join("")}async function ge(){var t;const n=((t=document.getElementById("emp-filter-statut"))==null?void 0:t.value)||"",e=n?`?statut=${encodeURIComponent(n)}`:"";return v(`/api/employe/commandes${e}`)}async function ve(n){const e=(prompt("Motif d’annulation (obligatoire) :")||"").trim();if(!e)throw new Error("Motif requis");const r=(prompt('Mode de contact ("mail" ou "telephone") :',"mail")||"").trim().toLowerCase()==="telephone"?"telephone":"mail";await C(`/api/employe/commandes/${n}/annuler`,{motif:e,contact:r})}function he(n,e){n.addEventListener("click",async t=>{var d;const r=t.target.closest(".emp-save");if(!r)return;const i=r.closest(".admin-order"),a=Number(((d=i==null?void 0:i.dataset)==null?void 0:d.id)||0);if(!a)return;const s=i.querySelector(".emp-statut-select"),o=s==null?void 0:s.value,c=i.querySelector(".admin-msg");c&&(c.textContent="Mise à jour...");try{o==="annulee"?(await ve(a),c&&(c.textContent="✅ Commande annulée")):(await C(`/api/employe/commandes/${a}/statut`,{statut:o}),c&&(c.textContent="✅ Statut mis à jour")),await e()}catch(m){console.error(m),c&&(c.textContent=`❌ ${m.message||"Erreur"}`)}})}function ye(){const n=document.getElementById("emp-filter-statut");n&&n.dataset.filled!=="1"&&(n.innerHTML=me.map(e=>{const t=e===""?"Tous":U(e);return`<option value="${e}">${t}</option>`}).join(""),n.dataset.filled="1")}async function $e(){const n=document.getElementById("emp-orders");if(!n)return;ye();const e=document.getElementById("emp-filter-statut"),t=async()=>{n.innerHTML="<p>Chargement...</p>";const r=await ge();fe(n,r)};e&&e.addEventListener("change",t),he(n,t),await t()}function u(n){return String(n??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;")}function S(n){return{en_attente:"En attente",accepte:"Acceptée",preparation:"Préparation",livraison:"Livraison",livre:"Livré",attente_materiel:"Attente matériel",terminee:"Terminée",annulee:"Annulée"}[n]||n||"-"}const Ee=["en_attente","accepte","preparation","livraison","livre","attente_materiel","terminee","annulee"];async function be(){return v("/api/admin/avis/pending")}function Le(n,e){if(!Array.isArray(e)||e.length===0){n.innerHTML="<p>Aucun avis en attente.</p>";return}n.innerHTML=e.map(t=>{var r,i,a;return`
      <article class="admin-item" data-avis-id="${u(t.id)}">
        <div class="admin-item-top">
          <div><strong>#${u(t.id)}</strong> — ${u(((r=t.menu)==null?void 0:r.titre)||"-")}</div>
          <div>⭐ ${u(t.note??"-")}</div>
        </div>

        <p class="admin-item-line"><strong>Auteur :</strong> ${u(((i=t.utilisateur)==null?void 0:i.prenom)||"")} ${u(((a=t.utilisateur)==null?void 0:a.nom)||"")}</p>
        <p class="admin-item-line"><strong>Commentaire :</strong> ${u(t.commentaire||"-")}</p>

        <div class="admin-item-actions">
          <button class="btn btn-solid admin-avis-accept" type="button">Accepter</button>
          <button class="btn btn-outline admin-avis-refuse" type="button">Refuser</button>
        </div>

        <p class="admin-msg" aria-live="polite"></p>
      </article>
    `}).join("")}function we(n,e){n.addEventListener("click",async t=>{var d;const r=t.target.closest(".admin-avis-accept"),i=t.target.closest(".admin-avis-refuse");if(!r&&!i)return;const a=t.target.closest("[data-avis-id]"),s=Number(((d=a==null?void 0:a.dataset)==null?void 0:d.avisId)||0);if(!s)return;const o=a.querySelector(".admin-msg");o&&(o.textContent="Mise à jour...");const c={valide:!!r};try{await C(`/api/admin/avis/${s}`,c),o&&(o.textContent="✅ Avis mis à jour"),await e()}catch(m){console.error(m),o&&(o.textContent=`❌ ${m.message||"Erreur"}`)}})}async function Ae(){return v("/api/admin/horaires")}function Me(n,e){if(!Array.isArray(e)||e.length===0){n.innerHTML="<p>Aucun horaire.</p>";return}n.innerHTML=e.map(t=>`
      <article class="admin-item" data-horaire-id="${u(t.id)}">
        <div class="admin-item-top">
          <div><strong>${u(t.jour)}</strong></div>
          <div>${u(t.ouverture)} - ${u(t.fermeture)}</div>
        </div>

        <div class="admin-item-actions">
          <button class="btn btn-danger-solid admin-horaire-delete" type="button">Supprimer</button>
        </div>

        <p class="admin-msg" aria-live="polite"></p>
      </article>
    `).join("")}function Te(n){const e=document.getElementById("admin-horaire-form");e&&e.addEventListener("submit",async t=>{var s,o,c;t.preventDefault();const r=(s=document.getElementById("h-jour"))==null?void 0:s.value.trim(),i=(o=document.getElementById("h-ouv"))==null?void 0:o.value,a=(c=document.getElementById("h-fer"))==null?void 0:c.value;if(!r||!i||!a){alert("Tous les champs horaires sont obligatoires.");return}try{await D("/api/admin/horaires",{jour:r,ouverture:i,fermeture:a}),e.reset(),await n()}catch(d){console.error(d),alert(d.message||"Erreur ajout horaire")}})}function _e(n,e){n.addEventListener("click",async t=>{var o;if(!t.target.closest(".admin-horaire-delete"))return;const i=t.target.closest("[data-horaire-id]"),a=Number(((o=i==null?void 0:i.dataset)==null?void 0:o.horaireId)||0);if(!a)return;const s=i.querySelector(".admin-msg");s&&(s.textContent="Suppression...");try{await K(`/api/admin/horaires/${a}`),await e()}catch(c){console.error(c),s&&(s.textContent=`❌ ${c.message||"Erreur"}`)}})}async function Pe(){return v("/api/admin/menus")}function Ie(n,e){if(!Array.isArray(e)||e.length===0){n.innerHTML="<p>Aucun menu.</p>";return}n.innerHTML=e.map(t=>`
      <article class="admin-item" data-menu-id="${u(t.id)}">
        <div class="admin-item-top">
          <div><strong>${u(t.titre)}</strong></div>
          <div>${u(t.prixMin)} € / pers</div>
        </div>

        <p class="admin-item-line"><strong>Thème :</strong> ${u(t.theme||"-")}</p>
        <p class="admin-item-line"><strong>Régime :</strong> ${u(t.regime||"-")}</p>
        <p class="admin-item-line"><strong>Min :</strong> ${u(t.nbPersonnesMin)} pers</p>

        <div class="admin-item-actions">
          <button class="btn btn-danger-solid admin-menu-delete" type="button">Supprimer</button>
        </div>

        <p class="admin-msg" aria-live="polite"></p>
      </article>
    `).join("")}function Se(n){const e=document.getElementById("admin-menu-form");e&&e.addEventListener("submit",async t=>{var p,f,h,$,E,A,M,T;t.preventDefault();const r=(p=document.getElementById("m-titre"))==null?void 0:p.value.trim(),i=Number(((f=document.getElementById("m-prix"))==null?void 0:f.value)||0),a=Number(((h=document.getElementById("m-nb"))==null?void 0:h.value)||0),s=(($=document.getElementById("m-theme"))==null?void 0:$.value.trim())||"",o=((E=document.getElementById("m-regime"))==null?void 0:E.value.trim())||"",c=((A=document.getElementById("m-image"))==null?void 0:A.value.trim())||"",d=((M=document.getElementById("m-desc"))==null?void 0:M.value.trim())||"",m=((T=document.getElementById("m-cond"))==null?void 0:T.value.trim())||"";if(!r||i<=0||a<=0||!d){alert("Champs menu invalides (titre, prix, nb min, description).");return}const l={titre:r,prixMin:i,nbPersonnesMin:a,theme:s,regime:o,image:c,description:d,conditions:m};try{await D("/api/admin/menus",l),e.reset(),await n()}catch(_){console.error(_),alert(_.message||"Erreur création menu")}})}function xe(n,e){n.addEventListener("click",async t=>{var o;if(!t.target.closest(".admin-menu-delete"))return;const i=t.target.closest("[data-menu-id]"),a=Number(((o=i==null?void 0:i.dataset)==null?void 0:o.menuId)||0);if(!a)return;const s=i.querySelector(".admin-msg");s&&(s.textContent="Suppression...");try{await K(`/api/admin/menus/${a}`),await e()}catch(c){console.error(c),s&&(s.textContent=`❌ ${c.message||"Erreur"}`)}})}async function He(){var t;const n=((t=document.getElementById("admin-filter-statut"))==null?void 0:t.value)||"",e=n?`?statut=${encodeURIComponent(n)}`:"";return v(`/api/admin/commandes${e}`)}function Be(n,e){if(!Array.isArray(e)||e.length===0){n.innerHTML="<p>Aucune commande.</p>";return}n.innerHTML=e.map(t=>{var a,s,o,c,d,m,l;const r=`${((a=t.utilisateur)==null?void 0:a.prenom)||""} ${((s=t.utilisateur)==null?void 0:s.nom)||""}`.trim()||"-",i=Ee.map(p=>`<option value="${u(p)}" ${t.statut===p?"selected":""}>${u(S(p))}</option>`).join("");return`
        <article class="admin-order" data-id="${u(t.id)}">
          <!-- Informations principales de la commande -->
          <div class="admin-order-top">
            <div><strong>#${u(t.id)}</strong> — ${u(S(t.statut))}</div>
            <div class="admin-order-meta">${u(t.createdAt||"")}</div>
          </div>

          <!-- Détails client/menu/prestation -->
          <div class="admin-order-lines">
            <div><strong>Client :</strong> ${u(r)}</div>
            <div><strong>Menu :</strong> ${u(((o=t.menu)==null?void 0:o.titre)||"-")}</div>
            <div><strong>Prestation :</strong> ${u(((c=t.prestation)==null?void 0:c.date)||"-")} ${u(((d=t.prestation)==null?void 0:d.heure)||"-")} — ${u(((m=t.prestation)==null?void 0:m.ville)||"-")}</div>
            <div><strong>Total :</strong> ${u(((l=t.prestation)==null?void 0:l.prixTotal)??"-")} €</div>
          </div>

          <!-- Action admin : changer le statut -->
          <div class="admin-order-actions">
            <select class="admin-statut-select">${i}</select>

            <input
              class="admin-motif-input"
              type="text"
              placeholder="Motif annulation (si annulée)"
              value="${u(t.motifAnnulation||"")}"
            />

            <button class="btn btn-solid admin-save" type="button">Mettre à jour</button>
          </div>

          <p class="admin-msg" aria-live="polite"></p>
        </article>
      `}).join(""),n.querySelectorAll(".admin-order").forEach(t=>{const r=t.querySelector(".admin-statut-select"),i=t.querySelector(".admin-motif-input");!r||!i||(i.style.display=r.value==="annulee"?"block":"none")})}function Ce(n,e){n.addEventListener("change",t=>{const r=t.target.closest(".admin-statut-select");if(!r)return;const i=r.closest(".admin-order"),a=i==null?void 0:i.querySelector(".admin-motif-input");a&&(a.style.display=r.value==="annulee"?"block":"none")}),n.addEventListener("click",async t=>{var m,l,p;const r=t.target.closest(".admin-save");if(!r)return;const i=r.closest(".admin-order"),a=Number(((m=i==null?void 0:i.dataset)==null?void 0:m.id)||0);if(!a)return;const s=((l=i.querySelector(".admin-statut-select"))==null?void 0:l.value)||"",o=(((p=i.querySelector(".admin-motif-input"))==null?void 0:p.value)||"").trim(),c=i.querySelector(".admin-msg");c&&(c.textContent="Mise à jour...");const d=s==="annulee"?{statut:s,motifAnnulation:o}:{statut:s};try{await C(`/api/admin/commandes/${a}/statut`,d),c&&(c.textContent="✅ Statut mis à jour"),await e()}catch(f){console.error(f),c&&(c.textContent=`❌ ${f.message||"Erreur"}`)}})}async function ke(){return v("/api/admin/stats/summary")}function Oe(n,e){if(!(e!=null&&e.ok)){n.innerHTML=`
      <section class="admin-card admin-card--warn">
        <div class="admin-card__head">
          <div>
            <div class="admin-card__title">Statistiques des commandes</div>
            <div class="admin-muted">Résumé de l’activité récente</div>
          </div>
        </div>
        <p class="admin-muted" style="margin-top:10px">
          Statistiques indisponibles pour le moment.
        </p>
      </section>
    `;return}const t=Number(e.totalEvents??0),r=(e.byType||[]).map(s=>`
        <li class="admin-row">
          <span class="admin-badge">${u(s.type??"-")}</span>
          <span class="admin-count">${u(s.count??0)}</span>
        </li>
      `).join(""),i=(e.byStatut||[]).slice(0,8).map(s=>`
        <li class="admin-row">
          <span class="admin-badge admin-badge--soft">${u(S(s.statut)??"-")}</span>
          <span class="admin-count">${u(s.count??0)}</span>
        </li>
      `).join(""),a=(e.lastEvents||[]).slice(0,8).map(s=>`
        <li class="admin-last">
          <span class="admin-last__id">#${u(s.commandeId??"-")}</span>
          <span class="admin-last__meta">
            ${u(s.type??"-")} • ${u(S(s.statut)??"-")}
          </span>
          <span class="admin-last__date">${u(s.createdAt??"")}</span>
        </li>
      `).join("");n.innerHTML=`
    <section class="admin-card">
      <div class="admin-card__head">
        <div>
          <div class="admin-card__title">Statistiques des commandes</div>
          <div class="admin-muted">Résumé de l’activité récente</div>
        </div>

        <div class="admin-kpi" title="Nombre total d'événements enregistrés">
          <div class="admin-kpi__label">Total</div>
          <div class="admin-kpi__value">${u(t)}</div>
        </div>
      </div>

      <div class="admin-grid">
        <div class="admin-panel">
          <div class="admin-panel__title">Événements par type</div>
          <ul class="admin-list">${r||'<li class="admin-muted">—</li>'}</ul>
        </div>

        <div class="admin-panel">
          <div class="admin-panel__title">Événements par statut</div>
          <ul class="admin-list">${i||'<li class="admin-muted">—</li>'}</ul>
        </div>
      </div>

      <div class="admin-panel" style="margin-top:12px">
        <div class="admin-panel__title">Derniers événements</div>
        <ul class="admin-last-list">${a||'<li class="admin-muted">—</li>'}</ul>
      </div>
    </section>
  `}async function je(){const n=document.getElementById("admin-avis"),e=document.getElementById("admin-horaires"),t=document.getElementById("admin-menus"),r=document.getElementById("admin-orders"),i=document.getElementById("admin-mongo-stats"),a=async()=>{if(n){n.innerHTML="<p>Chargement...</p>";try{const l=await be();Le(n,l)}catch(l){console.error(l),n.innerHTML="<p>Erreur chargement avis.</p>"}}},s=async()=>{if(e){e.innerHTML="<p>Chargement...</p>";try{const l=await Ae();Me(e,l)}catch(l){console.error(l),e.innerHTML="<p>Erreur chargement horaires.</p>"}}},o=async()=>{if(t){t.innerHTML="<p>Chargement...</p>";try{const l=await Pe();Ie(t,l)}catch(l){console.error(l),t.innerHTML="<p>Erreur chargement menus.</p>"}}},c=async()=>{if(r){r.innerHTML="<p>Chargement...</p>";try{const l=await He();Be(r,l)}catch(l){console.error(l),r.innerHTML="<p>Erreur chargement commandes.</p>"}}},d=async()=>{if(i){i.innerHTML="<p>Chargement...</p>";try{const l=await ke();Oe(i,l)}catch(l){console.error(l),i.innerHTML="<p>Mongo: erreur.</p>"}}};n&&we(n,a),e&&_e(e,s),t&&xe(t,o),r&&Ce(r,c),Te(s),Se(o);const m=document.getElementById("admin-filter-statut");m&&m.addEventListener("change",c),await Promise.allSettled([a(),s(),o(),c(),d()])}function Re(n){return{en_attente:"En attente",accepte:"Acceptée",preparation:"Préparation",livraison:"Livraison",livre:"Livrée",attente_materiel:"Attente matériel",terminee:"Terminée",annulee:"Annulée"}[n]||n||"-"}function Ne(n,e){if(!Array.isArray(e)||e.length===0){n.innerHTML="<p>Vous n’avez aucune commande.</p>";return}n.innerHTML=e.map(t=>{var r,i,a,s,o,c;return`
      <article class="my-order">
        <div class="my-order-top">
          <strong>Commande #${t.id}</strong>
          <span class="badge">${Re(t.statut)}</span>
        </div>

        <p><strong>Menu :</strong> ${((r=t.menu)==null?void 0:r.titre)||"-"}</p>
        <p><strong>Date :</strong> ${((i=t.prestation)==null?void 0:i.date)||"-"} ${((a=t.prestation)==null?void 0:a.heure)||""}</p>
        <p><strong>Ville :</strong> ${((s=t.prestation)==null?void 0:s.ville)||"-"}</p>
        <p><strong>Total :</strong> ${((o=t.prestation)==null?void 0:o.prixTotal)||"-"} €</p>

        <a class="menu-btn" href="/avis?commandeId=${t.id}&menuId=${((c=t.menu)==null?void 0:c.id)||""}" data-link>
          Laisser un avis
        </a>
      </article>
    `}).join("")}async function qe(){const n=document.getElementById("compte-orders");if(n){n.innerHTML="<p>Chargement...</p>";try{const e=await v("/api/me/commandes");Ne(n,e)}catch(e){n.innerHTML=`<p>Erreur : ${e.message}</p>`}}}function De(n){return n?n.length>1&&n.endsWith("/")?n.slice(0,-1):n:"/"}function Ue(n){const e=De(n);return N.find(t=>t.url===e)??N.find(t=>t.url==="/404")}async function J(n,e){const t=document.getElementById(n);if(t)try{const r=await fetch(e);if(!r.ok)throw new Error(`HTTP ${r.status}`);t.innerHTML=await r.text()}catch(r){console.error(`Erreur chargement partial ${e}:`,r),t.innerHTML=""}}async function W(n){try{const e=await fetch(n);if(!e.ok)throw new Error(`HTTP ${e.status}`);return await e.text()}catch(e){throw console.error(`Erreur chargement page ${n}:`,e),e}}function Fe(n){document.querySelectorAll("[data-nav]").forEach(e=>{const t=e.getAttribute("href")===n;e.classList.toggle("active",t)})}async function j(n){const e=Ue(n);if(!e){console.error("Route introuvable:",n);return}document.title=`${X} - ${e.title}`;try{const t=await W(e.pathHtml),r=document.getElementById("app");r&&(r.innerHTML=t)}catch(t){console.error("Erreur render, fallback 404:",t);const r=N.find(a=>a.url==="/404"),i=document.getElementById("app");if(r&&i)try{i.innerHTML=await W(r.pathHtml)}catch{i.innerHTML="<p>Page introuvable.</p>"}else i&&(i.innerHTML="<p>Page introuvable.</p>")}Fe(e.url),e.url==="/menus"&&ie(),e.url==="/menu"&&se(),e.url==="/inscription"&&(await L(()=>import("./inscription-6Fvn6RbN.js"),[])).bindInscriptionForm(),e.url==="/connexion"&&(await L(()=>import("./loginPage-DAD2I6hd.js"),[])).loadLoginPage(),n==="/avis"&&(await L(()=>import("./avisPage-DQVnq79p.js"),[])).loadAvisPage(),e.url==="/"&&(await L(()=>import("./homePage-DjAAjUOY.js"),[])).loadHomePage(),e.url==="/forgot-password"&&(await L(()=>import("./forgotPasswordPage-CVPwYX1f.js"),[])).bindForgotPasswordForm(),e.url==="/reset-password"&&(await L(()=>import("./resetPasswordPage-Dt6kkh7r.js"),[])).bindResetPasswordForm(),e.url==="/contact"&&ue(),e.url==="/employe"&&$e(),e.url==="/admin"&&je(),e.url==="/compte"&&qe()}async function Ve(){await J("site-header","/partials/header.html"),(await L(()=>Promise.resolve().then(()=>Je),void 0)).refreshAuthUi(),await J("site-footer","/partials/footer.html"),document.body.addEventListener("click",e=>{const t=e.target.closest("a[data-link]");if(!t||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey||e.button!==0)return;const r=t.getAttribute("href");if(!r||r.startsWith("#")||r.startsWith("http")||r.startsWith("mailto:")||r.startsWith("tel:")||r.endsWith(".html"))return;e.preventDefault();const i=new URL(r,location.origin);history.pushState(null,"",i.pathname+i.search),j(i.pathname)}),window.addEventListener("popstate",()=>{j(location.pathname)}),j(location.pathname)}function ze(n){try{return JSON.parse(n)}catch{return null}}function P(n,e){const t=n==null?void 0:n.roles;return Array.isArray(t)||typeof t=="string"?t.includes(e):!1}function R(n,e){const t=document.querySelector(n);t&&t.classList.toggle("is-hidden",!e)}function F(){var o;const n=document.getElementById("auth-actions");if(!n)return;const e=localStorage.getItem("vg_token"),t=ze(localStorage.getItem("vg_user")||"null"),r=!!e,i=r&&P(t,"ROLE_ADMIN"),a=r&&P(t,"ROLE_EMPLOYE"),s=r&&P(t,"ROLE_USER")&&!P(t,"ROLE_ADMIN")&&!P(t,"ROLE_EMPLOYE");if(R(".nav-compte",s),R(".nav-employe",a),R(".nav-admin",i),!r){n.innerHTML=`
      <a class="header-auth-btn" href="/connexion" data-link>Connexion</a>
      <a class="header-auth-btn header-auth-btn--solid" href="/inscription" data-link>Inscription</a>
    `;return}n.innerHTML=`
    <span class="auth-hello">Bonjour ${(t==null?void 0:t.prenom)||""}</span>
    <a class="header-auth-btn header-auth-btn--solid" href="#" id="btn-logout">Déconnexion</a>
  `,(o=document.getElementById("btn-logout"))==null||o.addEventListener("click",c=>{c.preventDefault(),localStorage.removeItem("vg_token"),localStorage.removeItem("vg_user"),F(),window.location.href="/"})}const Je=Object.freeze(Object.defineProperty({__proto__:null,refreshAuthUi:F},Symbol.toStringTag,{value:"Module"}));F();Ve();export{D as a,v as b,F as r};
