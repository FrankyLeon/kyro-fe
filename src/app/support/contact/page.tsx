import { SupportLayoutShell } from "@/components/support/support-nav";
import { ContactForm } from "@/components/support/contact-form";

export default function ContactSupportPage() {
  return (
    <SupportLayoutShell
      currentPath="/support/contact"
      title="Contact us"
      description="Describe your issue and our team will get back to you."
    >
      <ContactForm />
    </SupportLayoutShell>
  );
}
