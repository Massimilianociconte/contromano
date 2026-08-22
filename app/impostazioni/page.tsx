import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getI18n } from "@/lib/i18n";
import { getCurrentUser } from "@/lib/auth";
import { DeleteAccountForm } from "@/components/settings/delete-form";

export const metadata: Metadata = { title: "Impostazioni", robots: { index: false } };

export default async function SettingsPage() {
  const [{ d }, user] = await Promise.all([getI18n(), getCurrentUser()]);
  if (!user) redirect("/accedi?next=/impostazioni");

  return (
    <div className="mx-auto max-w-[820px] px-5 pb-16 pt-12 md:pt-16">
      <header className="mb-10 rise-in">
        <h1 className="font-display text-[32px] font-semibold tracking-[-0.02em] md:text-[40px]">
          {d.settings.title}
        </h1>
        <p className="mt-2 text-muted">{d.settings.subtitle}</p>
      </header>
      <DeleteAccountForm d={d} />
    </div>
  );
}
