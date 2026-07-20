"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function InvitationCodePage() {
  const [code, setCode] = useState("");
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = code.trim().toUpperCase();
    if (trimmed) {
      router.push(`/invitation/${trimmed}`);
    }
  }

  return (
    <div className="rounded-[20px] bg-surface-elevated p-6 shadow-sm">
      <h2 className="mb-2 text-center text-lg font-bold text-content-primary">
        Rejoindre une amicale
      </h2>
      <p className="mb-5 text-center text-[12px] text-content-muted">
        Entrez le code d&apos;invitation fourni par votre amicale
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="code"
            className="text-[13px] font-medium text-content-secondary"
          >
            Code d&apos;invitation
          </label>
          <Input
            id="code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="INV-XXXX-0000"
            required
            className="text-center font-mono text-lg tracking-widest"
          />
        </div>
        <Button type="submit">Continuer</Button>
      </form>
      <div className="mt-5 text-center">
        <Link
          href="/login"
          className="text-[13px] font-medium text-brand-500 hover:underline"
        >
          Retour à la connexion
        </Link>
      </div>
    </div>
  );
}
