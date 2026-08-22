"use client";

import { useActionState } from "react";
import Link from "next/link";
import { AlertTriangle, Loader2, Trash2 } from "lucide-react";
import type { Dict } from "@/lib/i18n";
import { deleteAccountAction, type FormState } from "@/app/actions";

export function DeleteAccountForm({ d }: { d: Dict }) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    (prev, fd) => deleteAccountAction(d, prev, fd),
    {}
  );

  return (
    <div
      className="card p-6 md:p-8"
      style={{ borderColor: "color-mix(in srgb, var(--oppose) 35%, var(--line))" }}
    >
      <h2 className="flex items-center gap-2 font-display text-xl font-semibold" style={{ color: "var(--oppose)" }}>
        <AlertTriangle size={18} aria-hidden /> {d.settings.dangerZone}
      </h2>
      <p className="mt-3 max-w-2xl text-[14.5px] leading-relaxed text-muted">{d.settings.deleteBody}</p>

      <form action={formAction} className="mt-6 grid max-w-lg gap-4">
        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold">{d.settings.passwordLabel}</span>
          <input name="password" type="password" required className="input !rounded-xl !py-3" autoComplete="current-password" />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold">{d.settings.confirmLabel}</span>
          <input
            name="confirm"
            required
            pattern="ELIMINA"
            title={d.settings.confirmLabel}
            placeholder="ELIMINA"
            className="input !rounded-xl !py-3"
            autoComplete="off"
          />
        </label>
        {state.error && (
          <p role="alert" className="rounded-xl px-4 py-3 text-sm font-semibold" style={{ background: "var(--cat-non-funziona-soft)", color: "var(--signal)" }}>
            {state.error}
          </p>
        )}
        <div className="flex flex-wrap items-center gap-3 pt-1">
          <button type="submit" disabled={pending} className="btn btn-danger">
            {pending ? <Loader2 size={15} className="animate-spin" aria-hidden /> : <Trash2 size={15} aria-hidden />}
            {d.settings.deleteCta}
          </button>
          <Link href={`/profilo`} className="text-sm font-medium text-muted underline underline-offset-4 hover:text-ink hover:no-underline">
            {d.settings.backToProfile}
          </Link>
        </div>
      </form>
    </div>
  );
}
