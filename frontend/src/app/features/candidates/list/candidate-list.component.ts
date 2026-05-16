import { Component, computed, effect, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CandidateApiService } from '../services/candidate-api.service';
import { Candidate } from '../models/candidate.model';
import { PaginationBarComponent } from '@shared/ui/pagination-bar/pagination-bar.component';

@Component({
  selector: 'app-candidate-list',
  standalone: true,
  imports: [RouterLink, PaginationBarComponent],
  template: `
    <section class="panel">
      <header class="head-row">
        <div>
          <h2>Candidats</h2>
          <p class="subtitle">
            @if (loading()) {
              Chargement…
            } @else {
              {{ filteredTotal() }} résultat(s) sur {{ all().length }}
              · Filtre compétences
            }
          </p>
        </div>
        <div class="head-actions">
          <a routerLink="/candidates/new" class="btn-primary">Ajouter</a>
        </div>
      </header>

      <div
        class="drop-zone"
        [class.drop-active]="dragOver()"
        [class.drop-busy]="uploading()"
        (dragover)="onDragOver($event)"
        (dragleave)="onDragLeave($event)"
        (drop)="onDrop($event)"
        (click)="fileInput.click()"
        role="button"
        tabindex="0"
        (keydown.enter)="fileInput.click()"
        (keydown.space)="$event.preventDefault(); fileInput.click()"
      >
        <input
          #fileInput
          type="file"
          class="visually-hidden"
          accept=".pdf,.txt,.text,application/pdf,text/plain"
          (change)="onFilePicked($event)"
        />
        @if (uploading()) {
          <p class="drop-title">Import en cours…</p>
          <p class="drop-hint">Extraction Tika et parsing IA</p>
        } @else {
          <p class="drop-title">Glissez un CV ici</p>
          <p class="drop-hint">PDF ou texte · création automatique du candidat après analyse IA</p>
        }
      </div>
      @if (uploadError()) {
        <p class="error upload-err">{{ uploadError() }}</p>
      }

      @if (!loading()) {
        <div class="toolbar">
          <input
            type="search"
            class="search"
            placeholder="Mot-clé (compétences)…"
            [value]="searchSkill()"
            (input)="onSearch($event)"
          />
        </div>
      }

      @if (loading()) {
        <p>Chargement...</p>
      } @else if (error()) {
        <p class="error">{{ error() }}</p>
      } @else if (all().length === 0) {
        <p class="empty">Aucun candidat enregistré.</p>
      } @else if (filteredTotal() === 0) {
        <p class="empty">Aucun résultat pour ce filtre.</p>
      } @else {
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Nom</th>
                <th>Email</th>
                <th>Téléphone</th>
                <th>Compétences</th>
                <th>Statut</th>
                <th>CV</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              @for (c of pageSlice(); track c.id) {
                <tr>
                  <td>{{ c.firstName }} {{ c.lastName }}</td>
                  <td>{{ c.email }}</td>
                  <td>{{ c.phone ?? '—' }}</td>
                  <td><span class="skills">{{ c.skills.join(', ') || '—' }}</span></td>
                  <td><span class="badge">{{ c.status }}</span></td>
                  <td>{{ c.cvPath ? 'Oui' : '—' }}</td>
                  <td class="actions">
                    <a [routerLink]="['/candidates', c.id]" class="link-edit">Fiche</a>
                    <span class="sep">·</span>
                    <a [routerLink]="['/candidates', c.id, 'edit']" class="link-edit">Modifier</a>
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
      .head-actions {
        display: flex;
        gap: 0.5rem;
        flex-wrap: wrap;
        align-items: center;
      }
      h2 {
        margin: 0;
      }
      .subtitle {
        margin: 0.35rem 0 0;
        color: #64748b;
        font-size: 0.9rem;
      }
      .drop-zone {
        margin-bottom: 1rem;
        padding: 1.25rem 1rem;
        border: 2px dashed #94a3b8;
        border-radius: 12px;
        background: #f8fafc;
        cursor: pointer;
        text-align: center;
        transition:
          border-color 0.15s,
          background 0.15s;
      }
      .drop-zone:hover,
      .drop-zone:focus-visible {
        border-color: #2563eb;
        background: #eff6ff;
        outline: none;
      }
      .drop-zone.drop-active {
        border-color: #4f46e5;
        background: #eef2ff;
      }
      .drop-zone.drop-busy {
        opacity: 0.7;
        pointer-events: none;
      }
      .drop-title {
        margin: 0;
        font-weight: 600;
        color: #0f172a;
        font-size: 0.95rem;
      }
      .drop-hint {
        margin: 0.35rem 0 0;
        font-size: 0.85rem;
        color: #64748b;
      }
      .visually-hidden {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        border: 0;
      }
      .upload-err {
        margin-bottom: 0.75rem;
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
      .btn-primary:hover {
        background: #1d4ed8;
      }
      .toolbar {
        margin-bottom: 1rem;
      }
      .search {
        width: 100%;
        max-width: 320px;
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
      .skills {
        color: #334155;
      }
      .badge {
        display: inline-block;
        background: #e0f2fe;
        color: #0369a1;
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
      .link-edit:hover {
        text-decoration: underline;
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
export class CandidateListComponent implements OnInit {
  private readonly api = inject(CandidateApiService);
  private readonly router = inject(Router);

  readonly all = signal<Candidate[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  readonly searchSkill = signal('');
  readonly pageIndex = signal(0);
  readonly pageSize = signal(10);

  readonly uploading = signal(false);
  readonly uploadError = signal<string | null>(null);
  readonly dragOver = signal(false);

  readonly filtered = computed(() => {
    const q = this.searchSkill().trim().toLowerCase();
    const list = this.all();
    if (!q) {
      return list;
    }
    return list.filter((c) => {
      const skillsText = (c.skills ?? []).join(' ').toLowerCase();
      return skillsText.includes(q);
    });
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
    this.loadList();
  }

  private loadList(): void {
    this.api.findAll().subscribe({
      next: (data) => {
        this.all.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Impossible de charger les candidats.');
        this.loading.set(false);
      },
    });
  }

  onSearch(ev: Event): void {
    this.searchSkill.set((ev.target as HTMLInputElement).value);
    this.pageIndex.set(0);
  }

  onDragOver(ev: DragEvent): void {
    ev.preventDefault();
    ev.stopPropagation();
    this.dragOver.set(true);
  }

  onDragLeave(ev: DragEvent): void {
    ev.preventDefault();
    ev.stopPropagation();
    this.dragOver.set(false);
  }

  onDrop(ev: DragEvent): void {
    ev.preventDefault();
    ev.stopPropagation();
    this.dragOver.set(false);
    const file = ev.dataTransfer?.files?.[0];
    if (file) {
      void this.processUpload(file);
    }
  }

  onFilePicked(ev: Event): void {
    const input = ev.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (file) {
      void this.processUpload(file);
    }
  }

  private processUpload(file: File): void {
    this.uploadError.set(null);
    this.uploading.set(true);
    this.api.uploadCv(file).subscribe({
      next: (created) => {
        this.uploading.set(false);
        this.router.navigate(['/candidates', created.id]);
      },
      error: (err) => {
        this.uploading.set(false);
        const detail = err?.error?.detail ?? err?.error?.title ?? err?.message ?? "Échec de l'import CV.";
        this.uploadError.set(typeof detail === 'string' ? detail : JSON.stringify(detail));
      },
    });
  }
}
