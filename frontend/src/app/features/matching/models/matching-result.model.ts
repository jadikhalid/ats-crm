export interface MatchingScoreRequest {
  candidateId: number;
  opportunityId: number;
}

export interface MatchingResult {
  score: number;
  strengths: string[];
  weaknesses: string[];
}
