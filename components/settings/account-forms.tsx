"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import type { Dict } from "@/lib/i18n";
import { updateProfileAction, changePasswordAction, type FormState } from "@/app/actions";

function Feedback({ state }: { state: { error?: string; ok?: string | boolean } }) {
  if (state.error)
    return (
      <p role="alert" className="rounded-xl px-4 py-2.5 text-sm font-semibold" style={{ background: "var(--cat-non-funziona-soft)", color: "var(--signal)" }}>
        {state.error}
      </p>
    );
  if (state.ok)
    return (
      <p role="status" className="rounded-xl px-4 py-2.5 text-sm font-semibold" style={{ background: "var(--cat-creare-soft)", color: "var(--consensus)" }}>
        {state.ok}
      </p>
    );
  return null;
}

export function ProfileForm({
  d,
  initialName,
  initialBio,
  savedText,
}: {
  d: Dict;
  initialName: string;
  initialBio: string;
  savedText: string;
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    (prev, fd) => updateProfileAction(d, prev, fd),
    {}
  );

  return (
    <div className="card p-6 md:p-8">
      <h2 className="font-display text-xl font-semibold">{d.settings.profileTitle}</h2>
      <p className="mt-1 text-sm text-muted">{d.settings.profileSubtitle}</p>
      <form action={formAction} className="mt-5 grid max-w-lg gap-4">
        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold">{d.settings.nameLabel}</span>
          <input name="name" defaultValue={initialName} required minLength={2} maxLength={60} className="input !rounded-xl !py-3" />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold">
            {d.settings.bioLabel} <span className="font-normal text-faint">({d.common.optional})</span>
          </span>
          <textarea name="bio" defaultValue={initialBio} maxLength={280} rows={3} placeholder={d.settings.bioPlaceholder} className="input resize-y !rounded-xl" />
          <span className="tabular mt-1 block text-right text-[11.5px] text-faint">{initialBio.length}/280</span>
        </label>
        <Feedback state={state.error ? { error: state.error } : state.ok ? { ok: savedText } : {}} />
        <div>
          <button type="submit" disabled={pending} className="btn btn-primary !py-2.5">
            {pending && <Loader2 size={14} className="animate-spin" aria-hidden />}
            {d.settings.saveProfile}
          </button>
        </div>
      </form>
    </div>
  );
}

export function PasswordChangeForm({ d }: { d: Dict }) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    (prev, fd) => changePasswordAction(d, prev, fd),
    {}
  );

  return (
    <div className="card p-6 md:p-8">
      <h2 className="font-display text-xl font-semibold">{d.settings.passwordTitle}</h2>
      <form action={formAction} className="mt-5 grid max-w-lg gap-4" autoComplete="new-password">
        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold">{d.settings.currentLabel}</span>
          <input name="current" type="password" required className="input !rounded-xl !py-3" autoComplete="current-password" />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold">{d.settings.newLabel}</span>
            <input name="next" type="password" required minLength={8} className="input !rounded-xl !py-3" autoComplete="new-password" />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold">{d.settings.newConfirmLabel}</span>
            <input name="confirm" type="password" required minLength={8} className="input !rounded-xl !py-3" autoComplete="new-password" />
          </label>
        </div>
        <Feedback state={state.error ? { error: state.error } : state.ok ? { ok: d.settings.changed } : {}} />
        <div>
          <button type="submit" disabled={pending} className="btn btn-primary !py-2.5">
            {pending && <Loader2 size={14} className="animate-spin" aria-hidden />}
            {d.settings.changeCta}
          </button>
        </div>
      </form>
    </div>
  );
}
