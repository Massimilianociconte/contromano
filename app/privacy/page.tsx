import { legalMetadata } from "@/components/legal/legal-page";
import LegalPage from "@/components/legal/legal-page";

export const metadata = legalMetadata("privacy");

export default function Page() {
  return <LegalPage kind="privacy" />;
}
