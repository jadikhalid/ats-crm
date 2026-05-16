import { Component, computed, effect, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ClientApiService } from '../services/client-api.service';
import { CrmClient } from '../models/client.model';
import { PaginationBarComponent } from '@shared/ui/pagination-bar/pagination-bar.component';

@Component({
  selector: 'app-client-list',
  standalone: true,
  imports: [RouterLink, PaginationBarComponent],
  template: `
    <section class="panel">
      <header class="head-row">
        <div>
          <h2>Clients</h2>
          <p class="subtitle">
            @if (loading()) {
              Chargement…
            } @else {
              {{ filteredTotal() }} résultat(s) sur {{ all().length }}
              · Filtre secteur
            }
          </p>
        </div>
        <a routerLink="/clients/new" class="btn-primary">Ajouter</a>
      </header>

      @if (!loading()) {
        <div class="toolbar">
          <input
            type="search"
            class="search"
            placeholder="Mot-clé (secteur d&apos;activité)…"
            [value]="sectorQuery()"
            (input)="onSearch($event)"
          />
        </div>
      }

      @if (loading()) {
        <p>Chargement...</p>
      } @else if (error()) {
        <p class="error">{{ error() }}</p>
      } @else if (all().length === 0) {
        <p class="empty">Aucun client enregistré.</p>
      } @else if (filteredTotal() === 0) {
        <p class="empty">Aucun résultat pour ce filtre.</p>
      } @else {
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Entreprise</th>
                <th>Contact principal</th>
                <th>Email</th>
                <th>Téléphone</th>
                <th>Secteur</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              @for (c of pageSlice(); track c.id) {
                <tr>
                  <td><strong>{{ c.companyName }}</strong></td>
                  <td>{{ c.primaryContact }}</td>
                  <td>{{ c.email }}</td>
                  <td>{{ c.phone ?? '—' }}</td>
                  <td>{{ c.industry ?? '—' }}</td>
                  <td class="actions">
                    <a [routerLink]="['/clients', c.id, 'edit']" class="link-edit">Modifier</a>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
        <app-pagination-bar
          [pageIndex]="pageIndex()"
          [pageSize]="pageSize()"
          [total]="filteredTotal()"
          (pageIndexChange)="pageIndex.set($event)"
          (pageSizeChange)="pageSize.set($event)"
        />
      }
    </section>
  `,
  styles: [
    `
      .panel {
        background: #fff;
        border-radius: 12px;
        padding: 1.5rem;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
      }
      .head-row {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        align-items: flex-start;
        gap: 1rem;
        margin-bottom: 1rem;
      }
      h2 {
        margin: 0;
      }
      .subtitle {
        margin: 0.35rem 0 0;
        color: #64748b;
        font-size: 0.9rem;
      }
      .btn-primary {
        display: inline-block;
        padding: 0.5rem 1rem;
        background: #2563eb;
        color: #fff !important;
        border-radius: 8px;
        text-decoration: none;
        font-weight: 600;
        font-size: 0.9rem;
      }
      .toolbar {
        margin-bottom: 1rem;
      }
      .search {
        width: 100%;
        max-width: 360px;
        padding: 0.5rem 0.75rem;
        border: 1px solid #cbd5e1;
        border-radius: 8px;
        font-size: 0.95rem;
      }
      .table-wrap {
        overflow-x: auto;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        font-size: 0.9rem;
      }
      th,
      td {
        text-align: left;
        padding: 0.75rem;
        border-bottom: 1px solid #e2e8f0;
      }
      th {
        color: #475569;
        font-weight: 600;
        font-size: 0.8rem;
        text-transform: uppercase;
        letter-spacing: 0.03em;
      }
      .actions {
        white-space: nowrap;
      }
      .link-edit {
        color: #2563eb;
        font-weight: 500;
        text-decoration: none;
        font-size: 0.85rem;
      }
      .error {
        color: #dc2626;
      }
      .empty {
        color: #64748b;
      }
    `,
  ],
})
export class ClientListComponent implements OnInit {
  private readonly api = inject(ClientApiService);

  readonly all = signal<CrmClient[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  readonly sectorQuery = signal('');
  readonly pageIndex = signal(0);
  readonly pageSize = signal(10);

  readonly filtered = computed(() => {
    const q = this.sectorQuery().trim().toLowerCase();
    const list = this.all();
    if (!q) {
      return list;
    }
    return list.filter((c) => (c.industry ?? '').toLowerCase().includes(q));
  });

  readonly filteredTotal = computed(() => this.filtered().length);

  private readonly _syncPageIndex = effect(() => {
    const total = this.filteredTotal();
    const size = this.pageSize();
    const maxPage = total === 0 ? 0 : Math.max(0, Math.ceil(total / size) - 1);
    if (this.pageIndex() > maxPage) {
      this.pageIndex.set(maxPage);
    }
  });

  readonly pageSlice = computed(() => {
    const f = this.filtered();
    const size = this.pageSize();
    const maxPage = Math.max(0, Math.ceil(f.length / size) - 1);
    const idx = Math.min(this.pageIndex(), maxPage);
    const start = idx * size;
    return f.slice(start, start + size);
  });

  ngOnInit(): void {
    this.api.findAll().subscribe({
      next: (data) => {
        this.all.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Impossible de charger les clients.');
        this.loading.set(false);
      },
    });
  }

  onSearch(ev: Event): void {
    this.sectorQuery.set((ev.target as HTMLInputElement).value);
    this.pageIndex.set(0);
  }
}
