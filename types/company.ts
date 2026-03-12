export type ServiceKey = "investor" | "public" | "annual" | "smm";

export interface Company {
  name: string;
  company_register_address: string;
  website: string;
  gst_number: string;
  pan_number: string;
  contact_number: string;
  linkedin: string;
  social_media: string;
  domain: string;
  industry: string;
  status: "Active" | "Inactive" | "Pending";
}

export interface Employee {
  firstName: string;
  lastName: string;
  email: string;
  designation: string;
  phone: string;
  linkedin: string;
}

export interface CustomerServiceState {
  selected: boolean;
  price: string;
}
