"use client";

import { useState, useEffect, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

interface Entry {
  id: string;
  type: string;
  label: string;
  amount: string;
  status: string;
  created_at: string;
  commission_id?: string;
  commissions: { name: string; icon?: string; color?: string } | null;
}

interface Commission {
  id: string;
  name: string;
  icon?: string;
  color?: string;
  budget: string;
}

interface Document {
  id: string;
  title: string;
  content?: string;
  created_at: string;
  commissions: { name: string; icon?: string } | null;
  members: { first_name: string; last_name: string } | null;
}

const fmt = (n: number) =>
  new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(n);

const tabs = [
  { id: "tableau", icon: "\u{1F4CA}", label: "Tableau" },
  { id: "journal", icon: "\u{1F4D2}", label: "Journal" },
  { id: "documents", icon: "\u{1F4C4}", label: "Documents" },
  { id: "budgets", icon: "\u{1F4B0}", label: "Budgets" },
];

const inputClass =
  "w-full rounded-[14px] border border-border bg-surface-primary px-3 py-2 text-[13px] text-content-primary";

export function ComptaDashboard() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [activeTab, setActiveTab] = useState("tableau");

  // Journal filters
  const [journalSearch, setJournalSearch] = useState("");
  const [journalCommissionFilter, setJournalCommissionFilter] = useState("");

  // New operation form
  const [newOpLabel, setNewOpLabel] = useState("");
  const [newOpAmount, setNewOpAmount] = useState("");
  const [newOpType, setNewOpType] = useState("depense");
  const [newOpCommission, setNewOpCommission] = useState("");
  const [submittingOp, setSubmittingOp] = useState(false);

  // New document form
  const [newDocTitle, setNewDocTitle] = useState("");
  const [newDocContent, setNewDocContent] = useState("");
  const [newDocCommission, setNewDocCommission] = useState("");
  const [submittingDoc, setSubmittingDoc] = useState(false);

  const loadDocuments = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("documents")
      .select(
        "*, commissions:commission_id(name, icon), members:created_by(first_name, last_name)"
      )
      .order("created_at", { ascending: false });
    if (data) setDocuments(data as Document[]);
  }, []);

  useEffect(() => {
    async function load() {
      const supabase = createClient();

      const [entriesRes, commissionsRes] = await Promise.all([
        supabase
          .from("accounting_entries")
          .select("*, commissions:commission_id(name, icon, color)")
          .order("created_at", { ascending: false }),
        supabase
          .from("commissions")
          .select("id, name, icon, color, budget")
          .eq("active", true)
          .order("name"),
      ]);

      if (entriesRes.data) setEntries(entriesRes.data as Entry[]);
      if (commissionsRes.data) setCommissions(commissionsRes.data);
    }
    load();
    loadDocuments();
  }, [loadDocuments]);

  const recettes = entries
    .filter((e) => e.type === "recette")
    .reduce((s, e) => s + parseFloat(e.amount), 0);
  const depenses = entries
    .filter((e) => e.type !== "recette")
    .reduce((s, e) => s + parseFloat(e.amount), 0);
  const solde = recettes - depenses;

  const statusBadge = (status: string) => {
    switch (status) {
      case "valide":
        return <Badge variant="success">Valid&eacute;</Badge>;
      case "recette":
        return <Badge variant="success">Recette</Badge>;
      case "rejete":
        return <Badge variant="danger">Rejet&eacute;</Badge>;
      default:
        return <Badge variant="warning">En attente</Badge>;
    }
  };

  const commissionBilan = commissions.map((c) => {
    const commEntries = entries.filter((e) => e.commissions?.name === c.name);
    const rec = commEntries
      .filter((e) => e.type === "recette")
      .reduce((s, e) => s + parseFloat(e.amount), 0);
    const dep = commEntries
      .filter((e) => e.type !== "recette")
      .reduce((s, e) => s + parseFloat(e.amount), 0);
    return { ...c, recettes: rec, depenses: dep, solde: rec - dep };
  });

  // Journal: filtered entries
  const filteredEntries = entries.filter((e) => {
    const matchesCommission =
      !journalCommissionFilter ||
      e.commissions?.name === journalCommissionFilter;
    const matchesSearch =
      !journalSearch ||
      e.label.toLowerCase().includes(journalSearch.toLowerCase());
    return matchesCommission && matchesSearch;
  });

  // New operation submit
  async function handleNewOperation(ev: React.FormEvent) {
    ev.preventDefault();
    if (!newOpLabel.trim() || !newOpAmount.trim()) return;
    setSubmittingOp(true);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    await supabase.from("accounting_entries").insert({
      org_id: user?.user_metadata?.org_id,
      label: newOpLabel.trim(),
      amount: parseFloat(newOpAmount),
      type: newOpType,
      status: "en_attente",
      commission_id: newOpCommission || null,
    });

    setNewOpLabel("");
    setNewOpAmount("");
    setNewOpType("depense");
    setNewOpCommission("");
    setSubmittingOp(false);

    // Reload entries
    const { data } = await supabase
      .from("accounting_entries")
      .select("*, commissions:commission_id(name, icon, color)")
      .order("created_at", { ascending: false });
    if (data) setEntries(data as Entry[]);
  }

  // New document submit
  async function handleNewDocument(ev: React.FormEvent) {
    ev.preventDefault();
    if (!newDocTitle.trim()) return;
    setSubmittingDoc(true);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data: member } = await supabase
      .from("members")
      .select("id")
      .eq("user_id", user?.id ?? "")
      .single();

    await supabase.from("documents").insert({
      org_id: user?.user_metadata?.org_id,
      title: newDocTitle.trim(),
      content: newDocContent.trim() || null,
      commission_id: newDocCommission || null,
      created_by: member?.id || null,
    });

    setNewDocTitle("");
    setNewDocContent("");
    setNewDocCommission("");
    setSubmittingDoc(false);
    loadDocuments();
  }

  // Budget data
  const budgetData = commissions.map((c) => {
    const budget = parseFloat(c.budget) || 0;
    const commEntries = entries.filter((e) => e.commissions?.name === c.name);
    const spent = commEntries
      .filter((e) => e.type !== "recette")
      .reduce((s, e) => s + parseFloat(e.amount), 0);
    const pct = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;
    return { ...c, budgetNum: budget, spent, pct, remaining: budget - spent };
  });

  const totalBudget = budgetData.reduce((s, c) => s + c.budgetNum, 0);
  const totalSpent = budgetData.reduce((s, c) => s + c.spent, 0);
  const totalPct = totalBudget > 0 ? Math.min((totalSpent / totalBudget) * 100, 100) : 0;

  return (
    <div className="flex flex-col gap-4">
      {/* Solde card -- always visible */}
      <div className="-mt-2 rounded-[16px] bg-surface-elevated p-4 shadow-sm">
        <p className="text-[10px] font-bold uppercase tracking-widest text-content-muted">
          Solde g&eacute;n&eacute;ral amicale
        </p>
        <p
          className={cn(
            "mt-1 text-3xl font-bold tabular-nums",
            solde >= 0 ? "text-emerald-600" : "text-red-600"
          )}
        >
          {fmt(solde)}
        </p>
        <p className="mt-1 text-[11px] text-content-muted">
          Mis &agrave; jour aujourd&apos;hui
        </p>
      </div>

      {/* Icon tabs */}
      <div className="-mx-4 overflow-x-auto px-4 scrollbar-none">
        <div className="flex gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-[12px] font-semibold transition-all",
                activeTab === tab.id
                  ? "bg-brand-500 text-white shadow-sm"
                  : "bg-surface-elevated text-content-secondary"
              )}
            >
              <span className="text-[14px]">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ===== TAB: Tableau ===== */}
      {activeTab === "tableau" && (
        <>
          {/* Stat cards row */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-[14px] bg-surface-elevated p-3 shadow-sm">
              <p className="text-[10px] font-semibold uppercase text-content-muted">
                Recettes
              </p>
              <p className="mt-1 text-lg font-bold tabular-nums text-emerald-600">
                {fmt(recettes)}
              </p>
            </div>
            <div className="rounded-[14px] bg-surface-elevated p-3 shadow-sm">
              <p className="text-[10px] font-semibold uppercase text-content-muted">
                D&eacute;penses
              </p>
              <p className="mt-1 text-lg font-bold tabular-nums text-content-primary">
                {fmt(depenses)}
              </p>
            </div>
            <div className="rounded-[14px] bg-surface-elevated p-3 shadow-sm">
              <p className="text-[10px] font-semibold uppercase text-content-muted">
                Solde
              </p>
              <p
                className={cn(
                  "mt-1 text-lg font-bold tabular-nums",
                  solde >= 0 ? "text-emerald-600" : "text-red-600"
                )}
              >
                {fmt(solde)}
              </p>
            </div>
          </div>

          {/* Bilan par commission */}
          {commissionBilan.length > 0 && (
            <div className="rounded-[16px] bg-surface-elevated p-4 shadow-sm">
              <h3 className="mb-3 text-[14px] font-bold text-content-primary">
                Bilan par commission
              </h3>
              <div className="flex flex-col gap-2">
                {commissionBilan.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between rounded-[10px] bg-surface-secondary px-3 py-2.5"
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: c.color || "#E8553A" }}
                      />
                      <span className="text-[13px] font-medium text-content-primary">
                        {c.icon} {c.name}
                      </span>
                    </div>
                    <span
                      className={cn(
                        "text-[13px] font-semibold tabular-nums",
                        c.solde >= 0 ? "text-emerald-600" : "text-red-600"
                      )}
                    >
                      {c.solde >= 0 ? "+" : ""}
                      {fmt(c.solde)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Dernieres operations */}
          <div className="rounded-[16px] bg-surface-elevated p-4 shadow-sm">
            <h3 className="mb-3 text-[14px] font-bold text-content-primary">
              Derni&egrave;res op&eacute;rations
            </h3>
            {entries.length === 0 ? (
              <EmptyState
                icon="\u{1F4B0}"
                title="Aucune op&eacute;ration"
                description="Les op&eacute;rations comptables appara&icirc;tront ici"
              />
            ) : (
              <div className="flex flex-col gap-2">
                {entries.slice(0, 10).map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-center gap-3 rounded-[10px] bg-surface-secondary px-3 py-2.5"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-[13px] font-medium text-content-primary">
                          {entry.label}
                        </span>
                        {statusBadge(entry.status)}
                      </div>
                      <p className="mt-0.5 text-[11px] text-content-muted">
                        {entry.commissions?.icon} {entry.commissions?.name}{" "}
                        &middot;{" "}
                        {new Date(entry.created_at).toLocaleDateString("fr-FR")}
                      </p>
                    </div>
                    <p
                      className={cn(
                        "shrink-0 text-[13px] font-semibold tabular-nums",
                        entry.type === "recette"
                          ? "text-emerald-600"
                          : "text-content-primary"
                      )}
                    >
                      {entry.type === "recette" ? "+" : "-"}
                      {fmt(parseFloat(entry.amount))}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* ===== TAB: Journal ===== */}
      {activeTab === "journal" && (
        <>
          {/* Filters */}
          <div className="rounded-[16px] bg-surface-elevated p-4 shadow-sm">
            <h3 className="mb-3 text-[14px] font-bold text-content-primary">
              Filtres
            </h3>
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                type="text"
                placeholder="Rechercher une op&eacute;ration..."
                value={journalSearch}
                onChange={(e) => setJournalSearch(e.target.value)}
                className={cn(inputClass, "flex-1")}
              />
              <select
                value={journalCommissionFilter}
                onChange={(e) => setJournalCommissionFilter(e.target.value)}
                className={cn(inputClass, "sm:w-48")}
              >
                <option value="">Toutes les commissions</option>
                {commissions.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.icon} {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* New operation form */}
          <div className="rounded-[16px] bg-surface-elevated p-4 shadow-sm">
            <h3 className="mb-3 text-[14px] font-bold text-content-primary">
              Nouvelle op&eacute;ration
            </h3>
            <form
              onSubmit={handleNewOperation}
              className="flex flex-col gap-3"
            >
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <input
                  type="text"
                  placeholder="Libell&eacute; de l'op&eacute;ration"
                  value={newOpLabel}
                  onChange={(e) => setNewOpLabel(e.target.value)}
                  className={inputClass}
                  required
                />
                <input
                  type="number"
                  placeholder="Montant"
                  value={newOpAmount}
                  onChange={(e) => setNewOpAmount(e.target.value)}
                  className={inputClass}
                  min="0"
                  step="0.01"
                  required
                />
                <select
                  value={newOpType}
                  onChange={(e) => setNewOpType(e.target.value)}
                  className={inputClass}
                >
                  <option value="depense">D&eacute;pense</option>
                  <option value="recette">Recette</option>
                </select>
                <select
                  value={newOpCommission}
                  onChange={(e) => setNewOpCommission(e.target.value)}
                  className={inputClass}
                >
                  <option value="">Sans commission</option>
                  {commissions.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.icon} {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={submittingOp}
                  className="btn-gradient rounded-[14px] px-6 py-2.5 text-[13px] font-semibold text-white disabled:opacity-50"
                >
                  {submittingOp ? "Ajout en cours..." : "Ajouter"}
                </button>
              </div>
            </form>
          </div>

          {/* Full journal */}
          <div className="rounded-[16px] bg-surface-elevated p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-[14px] font-bold text-content-primary">
                Journal complet
              </h3>
              <span className="text-[12px] text-content-muted">
                {filteredEntries.length} op&eacute;ration
                {filteredEntries.length !== 1 ? "s" : ""}
              </span>
            </div>
            {filteredEntries.length === 0 ? (
              <EmptyState
                icon="\u{1F4D2}"
                title="Aucune op&eacute;ration trouv&eacute;e"
                description="Aucune op&eacute;ration ne correspond aux filtres s&eacute;lectionn&eacute;s"
              />
            ) : (
              <div className="flex flex-col gap-2">
                {filteredEntries.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-center gap-3 rounded-[10px] bg-surface-secondary px-3 py-2.5"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-[13px] font-medium text-content-primary">
                          {entry.label}
                        </span>
                        {statusBadge(entry.status)}
                      </div>
                      <p className="mt-0.5 text-[11px] text-content-muted">
                        {entry.commissions?.icon} {entry.commissions?.name}{" "}
                        &middot;{" "}
                        {new Date(entry.created_at).toLocaleDateString("fr-FR")}
                      </p>
                    </div>
                    <p
                      className={cn(
                        "shrink-0 text-[13px] font-semibold tabular-nums",
                        entry.type === "recette"
                          ? "text-emerald-600"
                          : "text-content-primary"
                      )}
                    >
                      {entry.type === "recette" ? "+" : "-"}
                      {fmt(parseFloat(entry.amount))}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* ===== TAB: Documents ===== */}
      {activeTab === "documents" && (
        <>
          {/* New document form */}
          <div className="rounded-[16px] bg-surface-elevated p-4 shadow-sm">
            <h3 className="mb-3 text-[14px] font-bold text-content-primary">
              Nouveau document
            </h3>
            <form
              onSubmit={handleNewDocument}
              className="flex flex-col gap-3"
            >
              <input
                type="text"
                placeholder="Titre du document"
                value={newDocTitle}
                onChange={(e) => setNewDocTitle(e.target.value)}
                className={inputClass}
                required
              />
              <textarea
                placeholder="Contenu (optionnel)"
                value={newDocContent}
                onChange={(e) => setNewDocContent(e.target.value)}
                className={cn(inputClass, "min-h-[80px] resize-y")}
                rows={3}
              />
              <select
                value={newDocCommission}
                onChange={(e) => setNewDocCommission(e.target.value)}
                className={inputClass}
              >
                <option value="">Sans commission</option>
                {commissions.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.icon} {c.name}
                  </option>
                ))}
              </select>
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={submittingDoc}
                  className="btn-gradient rounded-[14px] px-6 py-2.5 text-[13px] font-semibold text-white disabled:opacity-50"
                >
                  {submittingDoc ? "Ajout en cours..." : "Ajouter"}
                </button>
              </div>
            </form>
          </div>

          {/* Document list */}
          <div className="rounded-[16px] bg-surface-elevated p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-[14px] font-bold text-content-primary">
                Documents
              </h3>
              <span className="text-[12px] text-content-muted">
                {documents.length} document{documents.length !== 1 ? "s" : ""}
              </span>
            </div>
            {documents.length === 0 ? (
              <EmptyState
                icon="\u{1F4C4}"
                title="Aucun document"
                description="Les documents comptables appara&icirc;tront ici"
              />
            ) : (
              <div className="flex flex-col gap-2">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center gap-3 rounded-[10px] bg-surface-secondary px-3 py-2.5"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-surface-elevated text-[18px]">
                      {doc.commissions?.icon || "\u{1F4C4}"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-[13px] font-medium text-content-primary">
                          {doc.title}
                        </span>
                        {doc.commissions && (
                          <Badge variant="neutral">{doc.commissions.name}</Badge>
                        )}
                      </div>
                      <p className="mt-0.5 text-[11px] text-content-muted">
                        {doc.members
                          ? `${doc.members.first_name} ${doc.members.last_name}`
                          : "Auteur inconnu"}{" "}
                        &middot;{" "}
                        {new Date(doc.created_at).toLocaleDateString("fr-FR")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* ===== TAB: Budgets ===== */}
      {activeTab === "budgets" && (
        <>
          {/* Total budget summary */}
          <div className="rounded-[16px] bg-surface-elevated p-4 shadow-sm">
            <h3 className="mb-3 text-[14px] font-bold text-content-primary">
              Budget global
            </h3>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <p className="text-[12px] text-content-muted">Budget total</p>
                <p className="mt-0.5 text-lg font-bold tabular-nums text-content-primary">
                  {fmt(totalBudget)}
                </p>
              </div>
              <div>
                <p className="text-[12px] text-content-muted">
                  D&eacute;pens&eacute;
                </p>
                <p className="mt-0.5 text-lg font-bold tabular-nums text-content-primary">
                  {fmt(totalSpent)}
                </p>
              </div>
              <div>
                <p className="text-[12px] text-content-muted">Restant</p>
                <p
                  className={cn(
                    "mt-0.5 text-lg font-bold tabular-nums",
                    totalBudget - totalSpent >= 0
                      ? "text-emerald-600"
                      : "text-red-600"
                  )}
                >
                  {fmt(totalBudget - totalSpent)}
                </p>
              </div>
            </div>
            <div className="mt-3">
              <div className="flex items-center justify-between text-[11px] text-content-muted">
                <span>Consommation globale</span>
                <span className="tabular-nums">{Math.round(totalPct)}%</span>
              </div>
              <div className="mt-1 h-2.5 overflow-hidden rounded-full bg-surface-secondary">
                <div
                  className={cn(
                    "h-full rounded-full transition-all",
                    totalPct >= 90
                      ? "bg-red-500"
                      : totalPct >= 70
                        ? "bg-amber-500"
                        : "bg-emerald-500"
                  )}
                  style={{ width: `${totalPct}%` }}
                />
              </div>
            </div>
          </div>

          {/* Per commission budgets */}
          <div className="rounded-[16px] bg-surface-elevated p-4 shadow-sm">
            <h3 className="mb-3 text-[14px] font-bold text-content-primary">
              Budget par commission
            </h3>
            {budgetData.length === 0 ? (
              <EmptyState
                icon="\u{1F4B0}"
                title="Aucun budget"
                description="Les budgets des commissions appara&icirc;tront ici"
              />
            ) : (
              <div className="flex flex-col gap-3">
                {budgetData.map((c) => (
                  <div
                    key={c.id}
                    className="rounded-[10px] bg-surface-secondary px-3 py-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: c.color || "#E8553A" }}
                        />
                        <span className="text-[13px] font-medium text-content-primary">
                          {c.icon} {c.name}
                        </span>
                      </div>
                      <Badge
                        variant={
                          c.pct >= 90
                            ? "danger"
                            : c.pct >= 70
                              ? "warning"
                              : "success"
                        }
                      >
                        {Math.round(c.pct)}%
                      </Badge>
                    </div>
                    <div className="mt-2">
                      <div className="h-2 overflow-hidden rounded-full bg-surface-elevated">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all",
                            c.pct >= 90
                              ? "bg-red-500"
                              : c.pct >= 70
                                ? "bg-amber-500"
                                : "bg-emerald-500"
                          )}
                          style={{ width: `${c.pct}%` }}
                        />
                      </div>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-[11px] text-content-muted">
                      <span className="tabular-nums">
                        {fmt(c.spent)} d&eacute;pens&eacute;
                      </span>
                      <span className="tabular-nums">
                        {fmt(c.budgetNum)} budg&eacute;t&eacute;
                      </span>
                    </div>
                    <p
                      className={cn(
                        "mt-1 text-[12px] font-semibold tabular-nums",
                        c.remaining >= 0 ? "text-emerald-600" : "text-red-600"
                      )}
                    >
                      {c.remaining >= 0 ? "Restant : " : "D&eacute;passement : "}
                      {fmt(Math.abs(c.remaining))}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
