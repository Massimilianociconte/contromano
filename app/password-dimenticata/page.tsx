import type { Metadata } from "next";
import { getI18n } from "@/lib/i18n";
import { ForgotForm } from "@/components/password-forms";

export const metadata: Metadata = { title: "Password dimenticata", robots: { index: false } };

export default async function ForgotPage() {
  const { d } = await getI18n();
  return (
    <div className="mx-auto flex min-h-[70dvh] max-w-[1200px] items-center justify-center px-5 py-16">
      <ForgotForm d={d} />
    </div>
  );
}
