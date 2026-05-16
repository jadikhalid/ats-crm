import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { CrmClient, CrmClientRequest } from '../models/client.model';

@Injectable({ providedIn: 'root' })
export class ClientApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/v1/agent/clients`;

  findAll(): Observable<CrmClient[]> {
    return this.http.get<CrmClient[]>(this.baseUrl);
  }

  findById(id: number): Observable<CrmClient> {
    return this.http.get<CrmClient>(`${this.baseUrl}/${id}`);
  }

  create(request: CrmClientRequest): Observable<CrmClient> {
    return this.http.post<CrmClient>(this.baseUrl, request);
  }

  update(id: number, request: CrmClientRequest): Observable<CrmClient> {
    return this.http.put<CrmClient>(`${this.baseUrl}/${id}`, request);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
