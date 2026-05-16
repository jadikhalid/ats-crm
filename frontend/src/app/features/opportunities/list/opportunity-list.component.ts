import { Component, computed, effect, inject, OnInit, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { OpportunityApiService } from '../services/opportunity-api.service';
import { Opportunity } from '../models/opportunity.model';
import { PaginationBarComponent } from '@shared/ui/pagination-bar/pagination-bar.component';

@Component({
  selector: 'app-opportunity-list',
  standalone: true,
  imports: [DecimalPipe, RouterLink, PaginationBarComponent],
  template: `
    <section class="panel">
      <header class="head-row">
        <div>
          <h2>Opportunités</h2>
          <p class="subtitle">
            @if (loading()) {
              Chargement…
            } @else {
              Affichage {{ pageSlice().length ? rangeLabel() : '0' }} sur {{ all().length }} besoin(s)
              · Pagination (prête pour API serveur)
            }
          </p>
        </div>
        <a routerLink="/opportunities/new" class="btn-primary">Ajouter</a>
      </header>

      @if (loading()) {
        <p>Chargement...</p>
      } @else if (error()) {
        <p class="error">{{ error() }}</p>
      } @else if (all().length === 0) {
        <p class="empty">Aucune opportunité enregistrée.</p>
      } @else {
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Titre</th>
                <th>Client</th>
                <th>Statut</th>
                <th>Budget (€)</th>
                <th>Profil recherché</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              @for (o of pageSlice(); track o.id) {
                <tr>
                  <td><strong>{{ o.title }}</strong></td>
                  <td>{{ o.clientCompanyName ?? '#' + o.clientId }}</td>
                  <td><span class="badge">{{ o.status }}</span></td>
                  <td>{{ o.budget != null ? (o.budget | number : '1.2-2') : '—' }}</td>
                  <td><span class="profile">{{ truncate(o.profileSought, 120) }}</span></td>
                  <td class="actions">
                    <a [routerLink]="['/opportunities', o.id]" class="link-edit">Fiche</a>
                    <span class="sep">·</span>
                    <a [routerLink]="['/opportunities', o.id, 'edit']" class="link-edit">Modifier</a>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
        <app-pagination-bar
          [pageIndex]="pageIndex()"
          [pageSize]="pageSize()"
          [total]="all().length"
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
        vertical-align: top;
      }
      th {
        color: #475569;
        font-weight: 600;
        font-size: 0.8rem;
        text-transform: uppercase;
        letter-spacing: 0.03em;
      }
      .profile {
        color: #334155;
        font-size: 0.85rem;
      }
      .badge {
        display: inline-block;
        background: #f0fdf4;
        color: #15803d;
        padding: 0.2rem 0.5rem;
        border-radius: 6px;
        font-size: 0.75rem;
        font-weight: 600;
      }
      .actions {
        white-space: nowrap;
      }
      .sep {
        color: #94a3b8;
        margin: 0 0.35rem;
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
export class OpportunityListComponent implements OnInit {
  private readonly api = inject(OpportunityApiService);

  readonly all = signal<Opportunity[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  readonly pageIndex = signal(0);
  readonly pageSize = signal(10);

  private readonly _syncPageIndex = effect(() => {
    const total = this.all().length;
    const size = this.pageSize();
    const maxPage = total === 0 ? 0 : Math.max(0, Math.ceil(total / size) - 1);
    if (this.pageIndex() > maxPage) {
      this.pageIndex.set(maxPage);
    }
  });

  readonly pageSlice = computed(() => {
    const list = this.all();
    const size = this.pageSize();
    const maxPage = Math.max(0, Math.ceil(list.length / size) - 1);
    const idx = Math.min(this.pageIndex(), maxPage);
    const start = idx * size;
    return list.slice(start, start + size);
  });

  readonly rangeLabel = computed(() => {
    const total = this.all().length;
    if (total === 0) {
      return '0';
    }
    const start = this.pageIndex() * this.pageSize() + 1;
    const end = Math.min((this.pageIndex() + 1) * this.pageSize(), total);
    return `${start}–${end}`;
  });

  ngOnInit(): void {
    this.api.findAll().subscribe({
      next: (data) => {
        this.all.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Impossible de charger les opportunités.');
        this.loading.set(false);
      },
    });
  }

  truncate(text: string, maxLen: number): string {
    if (!text || text.length <= maxLen) {
      return text;
    }
    return text.slice(0, maxLen) + '…';
  }
}
