import { SupportLayoutShell } from "@/components/support/support-nav";
import { ContactForm } from "@/components/support/contact-form";
import { getI18n } from "@/i18n/get-i18n";

export default async function ContactSupportPage() {
  const { t } = await getI18n();

  return (
    <SupportLayoutShell
      currentPath="/support/contact"
      title={t("support.contactUs")}
      description={t("support.contactBody")}
    >
      <ContactForm />
    </SupportLayoutShell>
  );
}
