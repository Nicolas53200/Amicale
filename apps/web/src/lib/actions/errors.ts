export function throwUserError(error: { message: string; code?: string }): never {
  const msg = friendlyMessage(error);
  console.error("[supabase]", error.code, error.message);
  throw new Error(msg);
}

function friendlyMessage(error: { message: string; code?: string }): string {
  const code = error.code ?? "";

  if (code === "23505") return "Cet élément existe déjà.";
  if (code === "23503") return "Impossible de supprimer : cet élément est utilisé ailleurs.";
  if (code === "42501" || code === "PGRST301") return "Vous n'avez pas les droits pour cette action.";
  if (code === "PGRST116") return "Élément introuvable.";
  if (code === "23514") return "Les données saisies ne sont pas valides.";

  if (error.message.includes("JWT")) return "Votre session a expiré. Veuillez vous reconnecter.";
  if (error.message.includes("network")) return "Erreur de connexion. Vérifiez votre réseau.";

  return "Une erreur est survenue. Veuillez réessayer.";
}
