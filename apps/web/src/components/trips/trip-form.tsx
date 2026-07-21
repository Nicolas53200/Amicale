"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createTrip, updateTrip } from "@/lib/actions/trips";
import { cn } from "@/lib/utils";

interface TripData {
  id: string;
  name?: string | null;
  destination: string;
  description?: string | null;
  start_date: string;
  end_date: string;
  price_adult: number;
  price_child?: number | null;
  max_seats?: number | null;
  min_seats?: number | null;
  transport?: string | null;
  accommodation?: string | null;
  icon?: string | null;
  color?: string | null;
  children_allowed?: boolean;
  max_adults_per_household?: number | null;
  registration_deadline?: string | null;
  child_age_limit?: number | null;
  guides_needed?: number | null;
  included?: string[] | null;
  not_included?: string[] | null;
  commission_id?: string | null;
}

export function TripForm({ trip }: { trip?: TripData }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [childrenAllowed, setChildrenAllowed] = useState(trip?.children_allowed ?? false);
  const [included, setIncluded] = useState<string[]>(trip?.included ?? []);
  const [notIncluded, setNotIncluded] = useState<string[]>(trip?.not_included ?? []);
  const [newIncluded, setNewIncluded] = useState("");
  const [newNotIncluded, setNewNotIncluded] = useState("");
  const isEdit = !!trip;

  function formatDateForInput(dateStr: string | null | undefined) {
    if (!dateStr) return "";
    return dateStr.slice(0, 10);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    const fd = new FormData(e.currentTarget);
    fd.set("children_allowed", childrenAllowed ? "true" : "false");
    fd.set("included", JSON.stringify(included));
    fd.set("not_included", JSON.stringify(notIncluded));
    if (isEdit) {
      await updateTrip(trip.id, fd);
      router.push(`/bureau/voyages/${trip.id}`);
    } else {
      await createTrip(fd);
      router.push("/bureau/voyages");
    }
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="rounded-[16px] bg-surface-elevated p-4 shadow-sm">
        <h3 className="mb-3 text-[14px] font-bold text-content-primary">
          Destination
        </h3>
        <div className="flex flex-col gap-3">
          <div>
            <label className="mb-1 block text-[12px] font-medium text-content-secondary">Nom du voyage</label>
            <Input name="name" placeholder="Weekend a Saint-Malo, Marche de Noel..." defaultValue={trip?.name ?? ""} />
          </div>
          <div>
            <label className="mb-1 block text-[12px] font-medium text-content-secondary">Destination</label>
            <Input name="destination" required placeholder="Saint-Malo, Strasbourg..." defaultValue={trip?.destination} />
          </div>
          <div>
            <label className="mb-1 block text-[12px] font-medium text-content-secondary">Description</label>
            <Textarea name="description" placeholder="Programme du voyage..." defaultValue={trip?.description ?? ""} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-[12px] font-medium text-content-secondary">Date de depart</label>
              <Input name="start_date" type="date" required defaultValue={formatDateForInput(trip?.start_date)} />
            </div>
            <div>
              <label className="mb-1 block text-[12px] font-medium text-content-secondary">Date de retour</label>
              <Input name="end_date" type="date" required defaultValue={formatDateForInput(trip?.end_date)} />
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-[16px] bg-surface-elevated p-4 shadow-sm">
        <h3 className="mb-3 text-[14px] font-bold text-content-primary">
          Logistique
        </h3>
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-[12px] font-medium text-content-secondary">Transport</label>
              <Input name="transport" placeholder="Car privatise, TGV..." defaultValue={trip?.transport ?? ""} />
            </div>
            <div>
              <label className="mb-1 block text-[12px] font-medium text-content-secondary">Hebergement</label>
              <Input name="accommodation" placeholder="Hotel 3*, Camping..." defaultValue={trip?.accommodation ?? ""} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-[12px] font-medium text-content-secondary">Icone</label>
              <Input name="icon" placeholder="ti-sailboat" defaultValue={trip?.icon ?? ""} />
            </div>
            <div>
              <label className="mb-1 block text-[12px] font-medium text-content-secondary">Couleur</label>
              <Input name="color" type="color" defaultValue={trip?.color ?? "#1a5276"} />
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-[16px] bg-surface-elevated p-4 shadow-sm">
        <h3 className="mb-3 text-[14px] font-bold text-content-primary">
          Tarifs et places
        </h3>
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="mb-1 block text-[12px] font-medium text-content-secondary">Prix adulte</label>
              <Input name="price_adult" type="number" step="0.01" required placeholder="0.00" defaultValue={trip?.price_adult ?? ""} />
            </div>
            <div>
              <label className="mb-1 block text-[12px] font-medium text-content-secondary">Prix enfant</label>
              <Input name="price_child" type="number" step="0.01" placeholder="0.00" defaultValue={trip?.price_child ?? ""} />
            </div>
            <div>
              <label className="mb-1 block text-[12px] font-medium text-content-secondary">Places max</label>
              <Input name="max_seats" type="number" placeholder="Illimite" defaultValue={trip?.max_seats ?? ""} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="mb-1 block text-[12px] font-medium text-content-secondary">Places min</label>
              <Input name="min_seats" type="number" placeholder="0" defaultValue={trip?.min_seats ?? ""} />
            </div>
            <div>
              <label className="mb-1 block text-[12px] font-medium text-content-secondary">Max adultes/foyer</label>
              <Input name="max_adults_per_household" type="number" placeholder="Illimite" defaultValue={trip?.max_adults_per_household ?? ""} />
            </div>
            <div>
              <label className="mb-1 block text-[12px] font-medium text-content-secondary">Accompagnateurs</label>
              <Input name="guides_needed" type="number" placeholder="0" defaultValue={trip?.guides_needed ?? ""} />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-[12px] font-medium text-content-secondary">Date limite d&apos;inscription</label>
            <Input name="registration_deadline" type="date" defaultValue={formatDateForInput(trip?.registration_deadline)} />
          </div>
          <div className="flex items-center justify-between rounded-[12px] bg-surface-secondary p-3">
            <div>
              <p className="text-[13px] font-semibold text-content-primary">Enfants autorises</p>
              <p className="text-[11px] text-content-muted">Les enfants peuvent participer</p>
            </div>
            <button
              type="button"
              onClick={() => setChildrenAllowed((v) => !v)}
              className={cn(
                "relative h-7 w-12 rounded-full transition-colors",
                childrenAllowed ? "bg-brand-500" : "bg-content-muted/30"
              )}
            >
              <span
                className={cn(
                  "absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform",
                  childrenAllowed ? "translate-x-5" : "translate-x-0.5"
                )}
              />
            </button>
          </div>
          {childrenAllowed && (
            <div>
              <label className="mb-1 block text-[12px] font-medium text-content-secondary">Age limite enfants</label>
              <Input name="child_age_limit" type="number" placeholder="14" defaultValue={trip?.child_age_limit ?? ""} />
            </div>
          )}
        </div>
      </div>

      <div className="rounded-[16px] bg-surface-elevated p-4 shadow-sm">
        <h3 className="mb-3 text-[14px] font-bold text-content-primary">
          Inclus / Non inclus
        </h3>
        <div className="flex flex-col gap-3">
          <div>
            <label className="mb-1 block text-[12px] font-medium text-content-secondary">Inclus dans le prix</label>
            <div className="flex flex-col gap-1.5">
              {included.map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="flex-1 rounded-[8px] bg-green-50 px-3 py-1.5 text-[12px] text-green-700 dark:bg-green-500/10 dark:text-green-400">
                    {item}
                  </span>
                  <button
                    type="button"
                    onClick={() => setIncluded((prev) => prev.filter((_, j) => j !== i))}
                    className="text-[12px] text-content-muted hover:text-red-500"
                  >
                    &times;
                  </button>
                </div>
              ))}
              <div className="flex gap-2">
                <Input
                  value={newIncluded}
                  onChange={(e) => setNewIncluded(e.target.value)}
                  placeholder="Transport A/R, Hotel..."
                  className="flex-1"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      if (newIncluded.trim()) {
                        setIncluded((prev) => [...prev, newIncluded.trim()]);
                        setNewIncluded("");
                      }
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    if (newIncluded.trim()) {
                      setIncluded((prev) => [...prev, newIncluded.trim()]);
                      setNewIncluded("");
                    }
                  }}
                  className="rounded-[10px] bg-green-50 px-3 text-[12px] font-semibold text-green-700 dark:bg-green-500/10 dark:text-green-400"
                >
                  +
                </button>
              </div>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-[12px] font-medium text-content-secondary">Non inclus</label>
            <div className="flex flex-col gap-1.5">
              {notIncluded.map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="flex-1 rounded-[8px] bg-red-50 px-3 py-1.5 text-[12px] text-red-700 dark:bg-red-500/10 dark:text-red-400">
                    {item}
                  </span>
                  <button
                    type="button"
                    onClick={() => setNotIncluded((prev) => prev.filter((_, j) => j !== i))}
                    className="text-[12px] text-content-muted hover:text-red-500"
                  >
                    &times;
                  </button>
                </div>
              ))}
              <div className="flex gap-2">
                <Input
                  value={newNotIncluded}
                  onChange={(e) => setNewNotIncluded(e.target.value)}
                  placeholder="Dejeuner, depenses perso..."
                  className="flex-1"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      if (newNotIncluded.trim()) {
                        setNotIncluded((prev) => [...prev, newNotIncluded.trim()]);
                        setNewNotIncluded("");
                      }
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    if (newNotIncluded.trim()) {
                      setNotIncluded((prev) => [...prev, newNotIncluded.trim()]);
                      setNewNotIncluded("");
                    }
                  }}
                  className="rounded-[10px] bg-red-50 px-3 text-[12px] font-semibold text-red-700 dark:bg-red-500/10 dark:text-red-400"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex-1 rounded-[14px] bg-surface-elevated px-4 py-3 text-[13px] font-semibold text-content-primary shadow-sm"
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="btn-gradient flex-1 rounded-[14px] px-4 py-3 text-[13px] font-semibold text-white"
        >
          {submitting
            ? isEdit ? "Enregistrement..." : "Creation..."
            : isEdit ? "Enregistrer" : "Creer le voyage"
          }
        </button>
      </div>
    </form>
  );
}
