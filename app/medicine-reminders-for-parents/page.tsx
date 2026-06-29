import type { Metadata } from "next";
import SeoLandingPage from "../seo-pages/SeoLandingPage";
import { medicineRemindersForParents } from "../seo-pages/medicineRemindersForParents";

const canonical = "https://famcarehealth.com/medicine-reminders-for-parents";

export const metadata: Metadata = {
  title: "Medicine Reminders for Parents",
  description:
    "Set medicine reminders for parents, send WhatsApp dose alerts, and track taken or missed medicines from a family dashboard.",
  alternates: { canonical },
  openGraph: {
    title: "Medicine Reminders for Parents | FamCare",
    description:
      "FamCare helps children manage parent medicine schedules with WhatsApp reminders, dose confirmations, and missed-dose visibility.",
    url: canonical,
    images: [{ url: "/family-sunset.png", width: 1200, height: 630, alt: "Medicine reminders for parents with FamCare" }],
  },
};

export default function MedicineRemindersForParentsPage() {
  return <SeoLandingPage content={medicineRemindersForParents} canonical={canonical} />;
}
