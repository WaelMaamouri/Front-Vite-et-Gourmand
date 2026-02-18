import{b as c}from"./index-Bn2YBzsb.js";function m(e){const n=Math.max(0,Math.min(5,Number(e)||0));return"⭐".repeat(n)}function p(e,n){if(!Array.isArray(n)||n.length===0){e.innerHTML="<p>Aucun avis pour le moment.</p>";return}e.innerHTML=n.slice(0,6).map(t=>{var s,i,a;const o=`${((s=t.utilisateur)==null?void 0:s.prenom)||""} ${((i=t.utilisateur)==null?void 0:i.nom)||""}`.trim()||"Client",r=((a=t.menu)==null?void 0:a.titre)||"";return`
        <article class="avis-card">
          <div class="avis-top">
            <strong>${o}</strong>
            <span class="avis-stars">${m(t.note)}</span>
          </div>
          ${r?`<p class="avis-menu">${r}</p>`:""}
          <p class="avis-text">${t.commentaire||""}</p>
        </article>
      `}).join("")}async function l(){const e=document.getElementById("home-avis");if(e){e.innerHTML="<p>Chargement...</p>";try{const n=await c("/api/avis");p(e,n)}catch(n){console.error(n),e.innerHTML="<p>Impossible de charger les avis.</p>"}}}export{l as loadHomePage};
