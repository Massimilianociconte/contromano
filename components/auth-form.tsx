"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import type { Dict } from "@/lib/i18n";
import { loginAction, registerAction, type FormState } from "@/app/actions";

export function AuthForm({ mode, d, next }: { mode: "login" | "register"; d: Dict; next?: string }) {
  const action = mode === "login" ? loginAction : registerAction;
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    (prev, fd) => action(d, prev, fd),
    {}
  );

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="card p-7 md:p-9">
        <h1 className="font-display text-[28px] font-semibold tracking-[-0.02em]">
          {mode === "login" ? d.auth.loginTitle : d.auth.registerTitle}
        </h1>
        <p className="mt-1.5 text-sm text-muted">
          {mode === "login" ? d.auth.loginSubtitle : d.auth.registerSubtitle}
        </p>

        <form action={formAction} className="mt-7 grid gap-4">
          {next && <input type="hidden" name="next" value={next} />}
          {mode === "register" && (
            <>
              <label className="block">
                <span className="mb-1.5 block text-sm font-semibold">{d.auth.name}</span>
                <input name="name" required minLength={2} maxLength={60} className="input !rounded-xl !py-3" autoComplete="name" />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm font-semibold">{d.auth.username}</span>
                <input name="username" required pattern="[a-zA-Z0-9_]{3,20}" title="3-20 caratteri: lettere, numeri, _" className="input !rounded-xl !py-3" autoComplete="username" />
              </label>
            </>
          )}
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold">{d.auth.email}</span>
            <input name="email" type="email" required className="input !rounded-xl !py-3" autoComplete="email" />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold">{d.auth.password}</span>
            <input name="password" type="password" required minLength={8} placeholder={d.auth.passwordHint} className="input !rounded-xl !py-3" autoComplete={mode === "login" ? "current-password" : "new-password"} />
          </label>

          {state.error && (
            <p role="alert" className="rounded-xl px-4 py-3 text-sm font-semibold" style={{ background: "var(--cat-non-funziona-soft)", color: "var(--signal)" }}>
              {state.error}
            </p>
          )}

          <button type="submit" disabled={pending} className="btn btn-primary btn-lg mt-1 w-full">
            {pending && <Loader2 size={16} className="animate-spin" aria-hidden />}
            {mode === "login" ? d.auth.loginCta : d.auth.registerCta}
          </button>
        </form>

        {mode === "login" && (
          <>
            <div className="flex justify-end">
              <Link href="/password-dimenticata" className="text-[13px] font-semibold underline underline-offset-4 hover:no-underline" style={{ color: "var(--muted)" }}>
                {d.forgot.title}
              </Link>
            </div>
            <p className="mt-1 rounded-xl px-4 py-2.5 text-center text-[12.5px]" style={{ background: "var(--surface2)", color: "var(--muted)" }}>
              {d.auth.demoHint}
            </p>
          </>
        )}
      </div>

      <p className="mt-6 text-center text-sm text-muted">
        {mode === "login" ? d.auth.noAccount : d.auth.hasAccount}{" "}
        <Link href={mode === "login" ? "/registrati" : "/accedi"} className="font-semibold text-ink underline underline-offset-4 hover:no-underline">
          {mode === "login" ? d.nav.register : d.nav.login}
        </Link>
      </p>
    </div>
  );
}
