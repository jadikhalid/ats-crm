import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { Opportunity, OpportunityRequest } from '../models/opportunity.model';

@Injectable({ providedIn: 'root' })
export class OpportunityApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/v1/agent/opportunities`;

  findAll(): Observable<Opportunity[]> {
    return this.http.get<Opportunity[]>(this.baseUrl);
  }

  findById(id: number): Observable<Opportunity> {
    return this.http.get<Opportunity>(`${this.baseUrl}/${id}`);
  }

  create(request: OpportunityRequest): Observable<Opportunity> {
    return this.http.post<Opportunity>(this.baseUrl, request);
  }

  update(id: number, request: OpportunityRequest): Observable<Opportunity> {
    return this.http.put<Opportunity>(`${this.baseUrl}/${id}`, request);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
