import type { SeoPageContent } from "./SeoLandingPage";

export const whatsappMedicineReminders: SeoPageContent = {
  eyebrow: "WhatsApp medicine reminders",
  title: "WhatsApp medicine reminders",
  highlight: "for families.",
  description:
    "Use WhatsApp to remind parents about medicines, collect simple dose confirmations, and keep caregivers updated without asking parents to install another app.",
  primaryCta: "Set up WhatsApp reminders",
  secondaryCta: "View reminder flow",
  visual: "whatsapp",
  stats: [
    { value: "Taken", label: "simple reply" },
    { value: "15 min", label: "reminder window" },
    { value: "Family", label: "updated together" },
  ],
  problemTitle: "Parents already use WhatsApp. Medicine reminders should meet them there.",
  problemBody:
    "Many reminder apps fail because the person taking the medicine never opens them. FamCare keeps the daily reminder in a place Indian families already check.",
  steps: [
    { title: "Schedule the medicine", body: "Add dose times from the caregiver dashboard." },
    { title: "Parent gets a reminder", body: "The reminder tells them which medicine to take and when." },
    { title: "Parent replies Taken", body: "Simple confirmations can update the family status." },
    { title: "Family sees the result", body: "Caregivers can check whether the dose is taken, due, or missed." },
  ],
  features: [
    { title: "No new app habit", body: "WhatsApp-first reminders reduce friction for parents who dislike learning new apps." },
    { title: "Natural confirmations", body: "A parent can reply in simple words instead of navigating screens." },
    { title: "Missed-dose awareness", body: "Caregivers can follow up when a dose is not confirmed." },
    { title: "Works with family dashboards", body: "The WhatsApp flow connects back to schedules, adherence, and family visibility." },
  ],
  proofTitle: "A reminder flow designed for real family behavior",
  proofBody:
    "FamCare treats WhatsApp as the front door for parents and the dashboard as the control room for caregivers.",
  faqs: [
    {
      question: "Does FamCare work with WhatsApp?",
      answer: "FamCare is designed to use WhatsApp as the parent-facing reminder and confirmation channel.",
    },
    {
      question: "What can a parent reply?",
      answer: "The goal is simple replies such as Taken, Done, or Missed so confirmation is easy.",
    },
    {
      question: "Can the family see missed medicines?",
      answer: "Yes. The medicine dashboard is built to show today's dose status and missed-dose awareness.",
    },
  ],
  related: [
    { href: "/medicine-reminders-for-parents", label: "Medicine reminders for parents", body: "Track parent medicine schedules." },
    { href: "/elderly-parent-care-app", label: "Elderly parent care app", body: "Support daily care beyond reminders." },
  ],
};
