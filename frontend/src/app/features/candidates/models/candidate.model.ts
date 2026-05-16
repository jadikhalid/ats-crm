export type CandidateStatus = 'NEW' | 'AVAILABLE' | 'IN_PROCESS' | 'PLACED' | 'ARCHIVED';

export interface Candidate {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  cvPath?: string;
  /** Présent sur la fiche détaillée (liste allégée côté API). */
  cvContent?: string;
  /** Résumé issu du parsing IA (fiche détaillée). */
  profileSummary?: string;
  skills: string[];
  status: CandidateStatus;
}

export interface CandidateRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  cvPath?: string;
  skills: string[];
  status: CandidateStatus;
}
