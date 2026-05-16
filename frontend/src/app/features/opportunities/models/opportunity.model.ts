export type OpportunityStatus = 'OPEN' | 'WON' | 'LOST';

export interface Opportunity {
  id: number;
  title: string;
  description: string;
  profileSought: string;
  status: OpportunityStatus;
  budget?: number | null;
  clientId: number;
  clientCompanyName: string | null;
}

export interface OpportunityRequest {
  title: string;
  description: string;
  profileSought: string;
  status: OpportunityStatus;
  budget?: number | null;
  clientId: number;
}
