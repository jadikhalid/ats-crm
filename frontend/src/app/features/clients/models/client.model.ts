export interface CrmClient {
  id: number;
  companyName: string;
  primaryContact: string;
  email: string;
  phone?: string;
  industry?: string;
}

export interface CrmClientRequest {
  companyName: string;
  primaryContact: string;
  email: string;
  phone?: string;
  industry?: string;
}
