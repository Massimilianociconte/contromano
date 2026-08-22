import type { Metadata } from "next";
import { getI18n } from "@/lib/i18n";
import { ResetPasswordForm } from "@/components/password-forms";

export const metadata: Metadata = { title: "Reimposta password", robots: { index: false } };

type SP = Promise<Record<string, string | string[] | undefined>>;

export default async function ResetPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const { d } = await getI18n();
  const token = typeof sp.token === "string" ? sp.token : "";

  return (
    <div className="mx-auto flex min-h-[70dvh] max-w-[1200px] items-center justify-center px-5 py-16">
      <ResetPasswordForm d={d} token={token} />
    </div>
  );
}
