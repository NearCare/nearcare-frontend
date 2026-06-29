import type { Metadata } from "next";
import SeoLandingPage from "../seo-pages/SeoLandingPage";
import { whatsappMedicineReminders } from "../seo-pages/whatsappMedicineReminders";

const canonical = "https://famcarehealth.com/whatsapp-medicine-reminders";

export const metadata: Metadata = {
  title: "WhatsApp Medicine Reminders",
  description:
    "WhatsApp medicine reminders for families. Remind parents, collect simple dose confirmations, and keep caregivers updated.",
  alternates: { canonical },
  openGraph: {
    title: "WhatsApp Medicine Reminders | FamCare",
    description:
      "Send medicine reminders over WhatsApp and help families know when parent doses are taken, due, or missed.",
    url: canonical,
    images: [{ url: "/family-whatsapp.webp", width: 1200, height: 630, alt: "WhatsApp medicine reminders with FamCare" }],
  },
};

export default function WhatsAppMedicineRemindersPage() {
  return <SeoLandingPage content={whatsappMedicineReminders} canonical={canonical} />;
}
