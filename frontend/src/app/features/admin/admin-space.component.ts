import { Component, inject, OnInit, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env/environment';

@Component({
  selector: 'app-admin-space',
  standalone: true,
  template: `
    <section class="panel">
      <h2>Administration</h2>
      @if (status(); as s) {
        <p>{{ s.message }}</p>
      } @else {
        <p>Chargement...</p>
      }
    </section>
  `,
  styles: [
    `
      .panel {
        background: #fff;
        border-radius: 12px;
        padding: 1.5rem;
      }
    `,
  ],
})
export class AdminSpaceComponent implements OnInit {
  private readonly http = inject(HttpClient);
  readonly status = signal<{ message: string } | null>(null);

  ngOnInit(): void {
    this.http
      .get<{ message: string }>(`${environment.apiBaseUrl}/v1/admin/status`)
      .subscribe((data) => this.status.set(data));
  }
}
