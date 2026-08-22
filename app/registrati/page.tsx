import type { Metadata } from "next";
import { getI18n } from "@/lib/i18n";
import { AuthForm } from "@/components/auth-form";

export const metadata: Metadata = { title: "Registrati" };

export default async function RegisterPage() {
  const { d } = await getI18n();
  return (
    <div className="mx-auto flex min-h-[70dvh] max-w-[1200px] items-center justify-center px-5 py-16">
      <AuthForm mode="register" d={d} />
    </div>
  );
}
