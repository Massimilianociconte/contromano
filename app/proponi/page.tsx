import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getI18n, localePath } from "@/lib/i18n";
import { getCurrentUser } from "@/lib/auth";
import { ProposeForm } from "@/components/propose/form";

export const metadata: Metadata = { title: "Proponi un cambiamento" };

type SP = Promise<Record<string, string | string[] | undefined>>;

export default async function ProposePage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const [{ lang, d }, user] = await Promise.all([getI18n(), getCurrentUser()]);
  if (!user) redirect(localePath(lang, "/accedi?next=/proponi"));
  const cat = typeof sp.cat === "string" ? sp.cat : undefined;

  return (
    <div className="mx-auto max-w-[900px] px-5 pb-16 pt-12 md:pt-16">
      <header className="mb-10 text-center rise-in">
        <h1 className="font-display text-[36px] font-semibold tracking-[-0.02em] md:text-[52px]">
          {d.propose.title}
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-muted">{d.propose.subtitle}</p>
      </header>
      <ProposeForm d={d} defaultCategory={cat} />
    </div>
  );
}
