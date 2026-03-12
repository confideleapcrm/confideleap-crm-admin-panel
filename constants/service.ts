import { ServiceKey } from "@/types/company";

export const SERVICE_DEFINITIONS: { key: ServiceKey; label: string }[] = [
  { key: "investor", label: "Investor Relation Entry" },
  { key: "public", label: "Public Relation Entry" },
  { key: "annual", label: "Annual Report" },
  { key: "smm", label: "Social Media Marketing" },
];
