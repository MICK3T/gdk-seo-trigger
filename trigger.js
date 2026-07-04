// gdk-seo-trigger — Déclencheur cron de la machine SEO (repo gdk-seo-copilot).
//
// Pourquoi : le planificateur interne de GitHub Actions n'est pas fiable sur les
// repos récents. Ce service Railway tourne 1×/jour (cron Railway) et « réveille »
// les workflows GitHub via l'API workflow_dispatch, selon le jour.
//
// Variables d'env (Railway) :
//   GH_DISPATCH_PAT  → fine-grained token GitHub (repo gdk-seo-copilot,
//                      permission Actions: Read and write). REQUIS.
//   GH_SEO_REPO      → optionnel, défaut "MICK3T/gdk-seo-copilot".
//
// Le script s'exécute puis s'arrête (le cron Railway le relance chaque jour).

const REPO = process.env.GH_SEO_REPO || "MICK3T/gdk-seo-copilot";
const PAT = process.env.GH_DISPATCH_PAT;

async function dispatch(wf) {
  const res = await fetch(
    `https://api.github.com/repos/${REPO}/actions/workflows/${wf}/dispatches`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PAT}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "Content-Type": "application/json",
        "User-Agent": "gdk-seo-trigger",
      },
      body: JSON.stringify({ ref: "main" }),
    }
  );
  const ok = res.status === 204; // 204 = déclenché avec succès
  const detail = ok ? "" : " : " + (await res.text()).slice(0, 200);
  console.log(`${ok ? "✅" : "❌"} ${wf} → HTTP ${res.status}${detail}`);
  return ok;
}

async function main() {
  if (!PAT) {
    console.error("❌ GH_DISPATCH_PAT manquant — rien à faire.");
    process.exit(1);
  }
  const now = new Date();
  const dow = now.getUTCDay(); // 0=dimanche … 6=samedi
  const dom = now.getUTCDate();
  console.log(`🕘 Déclencheur SEO — ${now.toISOString()} (jour ${dow}, date ${dom})`);

  // publish : tous les jours (publie les articles que tu as tagués seo-approved)
  await dispatch("publish.yml");
  // generate : lundi & vendredi (1 nouvel article brouillon)
  if (dow === 1 || dow === 5) await dispatch("generate.yml");
  // optimize : dimanche (amélioration des pages faibles)
  if (dow === 0) await dispatch("optimize.yml");
  // research : le 1er du mois (nouveaux mots-clés)
  if (dom === 1) await dispatch("research.yml");

  console.log("Terminé.");
  process.exit(0);
}

main().catch((e) => {
  console.error("Erreur:", e);
  process.exit(1);
});
