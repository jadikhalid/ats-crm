import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { MatchingResult, MatchingScoreRequest } from '../models/matching-result.model';

@Injectable({ providedIn: 'root' })
export class MatchingApiService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiBaseUrl}/v1/agent/matching`;

  score(request: MatchingScoreRequest): Observable<MatchingResult> {
    return this.http.post<MatchingResult>(this.url, request);
  }
}
