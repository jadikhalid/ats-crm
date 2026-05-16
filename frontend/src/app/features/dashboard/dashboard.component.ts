import { Component, inject, OnInit, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '@core/services/auth.service';
import { environment } from '@env/environment';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  template: `
    <section class="dashboard">
      <h2>Tableau de bord</h2>
      @if (user(); as u) {
        <p>Bienvenue, <strong>{{ u.firstName }} {{ u.lastName }}</strong> ({{ u.email }}).</p>
      }
      <p class="subtitle">Accès selon votre rôle — utilisez le menu latéral.</p>

      @if (scopes().length) {
        <ul class="scopes">
          @for (scope of scopes(); track scope.scope) {
            <li>
              <strong>{{ scope.scope }}</strong> — {{ scope.message }}
            </li>
          }
        </ul>
      }
    </section>
  `,
  styles: [
    `
      .dashboard {
        background: #fff;
        border-radius: 12px;
        padding: 1.5rem;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
      }
      h2 {
        margin-top: 0;
      }
      .subtitle {
        color: #64748b;
      }
      .scopes {
        margin-top: 1.5rem;
        padding-left: 1.25rem;
      }
    `,
  ],
})
export class DashboardComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly http = inject(HttpClient);

  readonly user = this.auth.currentUser;
  readonly scopes = signal<{ scope: string; message: string }[]>([]);

  ngOnInit(): void {
    const endpoints = [
      { path: '/v1/client/status', role: 'client' },
      { path: '/v1/agent/status', role: 'agent' },
      { path: '/v1/admin/status', role: 'admin' },
    ];

    for (const endpoint of endpoints) {
      this.http
        .get<{ scope: string; message: string }>(`${environment.apiBaseUrl}${endpoint.path}`)
        .subscribe({
          next: (data) => this.scopes.update((list) => [...list, data]),
          error: () => undefined,
        });
    }
  }
}
