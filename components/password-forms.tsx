"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { useLocalePath } from "@/lib/i18n/path-client";
import type { Dict } from "@/lib/i18n";
import {
  requestPasswordResetAction,
  performPasswordResetAction,
  type FormState,
} from "@/app/actions";

export function ForgotForm({ d }: { d: Dict }) {
  const lp = useLocalePath();
  const [state, formAction, pending] = useActionState<FormState, FormData>(requestPasswordResetAction, {});

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="card p-7 md:p-9">
        <h1 className="font-display text-[28px] font-semibold tracking-[-0.02em]">{d.forgot.title}</h1>
        <p className="mt-1.5 text-sm text-muted">{d.forgot.subtitle}</p>

        {state.ok ? (
          <div className="mt-6 grid gap-3">
            <p
              role="status"
              className="rounded-xl px-4 py-3 text-sm font-medium"
              style={{ background: "var(--cat-creare-soft)", color: "var(--consensus)" }}
            >
              ✓ {d.forgot.sent}
            </p>
            {state.debugLink && (
              <p className="rounded-xl px-4 py-3 text-[12.5px] leading-relaxed break-all" style={{ background: "var(--surface2)", color: "var(--muted)" }}>
                {d.forgot.devLink}{" "}
                <a href={state.debugLink} className="font-semibold underline underline-offset-2" style={{ color: "var(--info)" }}>
                  {state.debugLink.replace(/^https?:\/\//, "")}
                </a>
              </p>
            )}
          </div>
        ) : (
          <form action={formAction} className="mt-6 grid gap-4">
            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold">{d.forgot.emailLabel}</span>
              <input name="email" type="email" required className="input !rounded-xl !py-3" autoComplete="email" />
            </label>
            {(() => {
              const msg = state.error
                ? ((d.errors as Record<string, string>)[state.error] ?? d.errors.generic)
                : undefined;
              return msg ? (
                <p role="alert" className="rounded-xl px-4 py-3 text-sm font-semibold" style={{ background: "var(--cat-non-funziona-soft)", color: "var(--signal)" }}>
                  {msg}
                </p>
              ) : null;
            })()}
            <button type="submit" disabled={pending} className="btn btn-primary w-full !py-3">
              {pending && <Loader2 size={15} className="animate-spin" aria-hidden />}
              {d.forgot.cta}
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-muted">
          {d.forgot.noAccount}{" "}
          <Link href={lp("/registrati")} className="font-semibold text-ink underline underline-offset-4 hover:no-underline">
            {d.nav.register}
          </Link>
        </p>
      </div>
    </div>
  );
}

export function ResetPasswordForm({ d, token }: { d: Dict; token: string }) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(performPasswordResetAction, {});

  if (!token) {
    return (
      <p role="alert" className="card mx-auto max-w-md p-6 text-center text-sm font-semibold" style={{ color: "var(--oppose)" }}>
        {d.errors.resetInvalid}
      </p>
    );
  }

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="card p-7 md:p-9">
        <h1 className="font-display text-[28px] font-semibold tracking-[-0.02em]">{d.reset.title}</h1>
        <p className="mt-1.5 text-sm text-muted">{d.reset.subtitle}</p>
        <form action={formAction} className="mt-6 grid gap-4">
          <input type="hidden" name="token" value={token} />
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold">{d.reset.passwordLabel}</span>
            <input name="password" type="password" required minLength={8} className="input !rounded-xl !py-3" autoComplete="new-password" />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold">{d.reset.confirmLabel}</span>
            <input name="confirm" type="password" required minLength={8} className="input !rounded-xl !py-3" autoComplete="new-password" />
          </label>
          {(() => { const msg = state.error ? ((d.errors as Record<string,string>)[state.error] ?? d.errors.generic) : undefined; return msg ? (
            <p role="alert" className="rounded-xl px-4 py-3 text-sm font-semibold" style={{ background: "var(--cat-non-funziona-soft)", color: "var(--signal)" }}>
              {msg}
            </p>
          ) : null; })()}
          <button type="submit" disabled={pending} className="btn btn-primary w-full !py-3">
            {pending && <Loader2 size={15} className="animate-spin" aria-hidden />}
            {d.reset.cta}
          </button>
        </form>
      </div>
    </div>
  );
}
