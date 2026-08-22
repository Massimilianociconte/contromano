import type { Metadata } from "next";
import { getI18n } from "@/lib/i18n";
import { AuthForm } from "@/components/auth-form";

export const metadata: Metadata = { title: "Accedi" };

type SP = Promise<Record<string, string | string[] | undefined>>;

export default async function LoginPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const { d } = await getI18n();
  const next = typeof sp.next === "string" ? sp.next : undefined;
  const justReset = sp.reset === "1";
  return (
    <div className="mx-auto flex min-h-[70dvh] max-w-[1200px] flex-col items-center justify-center gap-4 px-5 py-16">
      {justReset && (
        <p
          role="status"
          className="w-full max-w-md rounded-xl px-4 py-3 text-center text-sm font-medium"
          style={{ background: "var(--cat-creare-soft)", color: "var(--consensus)" }}
        >
          ✓ {d.reset.done}
        </p>
      )}
      <AuthForm mode="login" d={d} next={next} />
    </div>
  );
}
