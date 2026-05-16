import { Component, computed, input, output } from '@angular/core';

/**
 * Pagination côté client (compatible futur passage en Spring Data paginé).
 */
@Component({
  selector: 'app-pagination-bar',
  standalone: true,
  template: `
    <div class="pagination-bar">
      <span class="meta">
        @if (total() === 0) {
          Aucun résultat
        } @else {
          {{ rangeStart() }}–{{ rangeEnd() }} sur {{ total() }}
          @if (totalPages() > 0) {
            · Page {{ pageIndex() + 1 }} / {{ totalPages() }}
          }
        }
      </span>
      <div class="controls">
        <label>
          Par page
          <select [value]="pageSize()" (change)="onSizeChange($event)">
            @for (n of sizes; track n) {
              <option [value]="n">{{ n }}</option>
            }
          </select>
        </label>
        <button type="button" [disabled]="pageIndex() <= 0 || total() === 0" (click)="goPrev()">Précédent</button>
        <button
          type="button"
          [disabled]="totalPages() === 0 || pageIndex() >= totalPages() - 1"
          (click)="goNext()"
        >
          Suivant
        </button>
      </div>
    </div>
  `,
  styles: `
    .pagination-bar {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      align-items: center;
      gap: 0.75rem;
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 1px solid #e2e8f0;
      font-size: 0.875rem;
      color: #64748b;
    }
    .controls {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex-wrap: wrap;
    }
    label {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      font-size: 0.8rem;
      color: #475569;
    }
    select {
      padding: 0.35rem 0.5rem;
      border-radius: 6px;
      border: 1px solid #cbd5e1;
    }
    button {
      padding: 0.35rem 0.75rem;
      border-radius: 6px;
      border: 1px solid #cbd5e1;
      background: #fff;
      cursor: pointer;
      font-size: 0.85rem;
    }
    button:disabled {
      opacity: 0.45;
      cursor: not-allowed;
    }
    button:not(:disabled):hover {
      background: #f8fafc;
    }
  `,
})
export class PaginationBarComponent {
  readonly pageIndex = input.required<number>();
  readonly pageSize = input.required<number>();
  readonly total = input.required<number>();

  readonly pageIndexChange = output<number>();
  readonly pageSizeChange = output<number>();

  readonly sizes = [5, 10, 20, 50];

  readonly totalPages = computed(() => {
    const t = this.total();
    const s = this.pageSize();
    if (t === 0) {
      return 0;
    }
    return Math.ceil(t / s);
  });

  readonly rangeStart = computed(() => {
    if (this.total() === 0) {
      return 0;
    }
    return this.pageIndex() * this.pageSize() + 1;
  });

  readonly rangeEnd = computed(() => {
    if (this.total() === 0) {
      return 0;
    }
    return Math.min((this.pageIndex() + 1) * this.pageSize(), this.total());
  });

  goPrev(): void {
    const next = Math.max(0, this.pageIndex() - 1);
    this.pageIndexChange.emit(next);
  }

  goNext(): void {
    const lastIndex = Math.max(0, this.totalPages() - 1);
    const next = Math.min(lastIndex, this.pageIndex() + 1);
    this.pageIndexChange.emit(next);
  }

  onSizeChange(ev: Event): void {
    const v = +(ev.target as HTMLSelectElement).value;
    this.pageSizeChange.emit(v);
    this.pageIndexChange.emit(0);
  }
}
