import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { Candidate, CandidateRequest } from '../models/candidate.model';

@Injectable({ providedIn: 'root' })
export class CandidateApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/v1/agent/candidates`;

  findAll(): Observable<Candidate[]> {
    return this.http.get<Candidate[]>(this.baseUrl);
  }

  findById(id: number): Observable<Candidate> {
    return this.http.get<Candidate>(`${this.baseUrl}/${id}`);
  }

  create(request: CandidateRequest): Observable<Candidate> {
    return this.http.post<Candidate>(this.baseUrl, request);
  }

  update(id: number, request: CandidateRequest): Observable<Candidate> {
    return this.http.put<Candidate>(`${this.baseUrl}/${id}`, request);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  uploadCv(file: File): Observable<Candidate> {
    const fd = new FormData();
    fd.append('file', file, file.name);
    return this.http.post<Candidate>(`${this.baseUrl}/upload`, fd);
  }
}
