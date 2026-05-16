import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { OpportunityApiService } from '../services/opportunity-api.service';
import { ClientApiService } from '../../clients/services/client-api.service';
import { CrmClient } from '../../clients/models/client.model';
import { OpportunityStatus } from '../models/opportunity.model';

@Component({
  selector: 'app-opportunity-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <section class="panel">
      <header class="head">
        <a routerLink="/opportunities" class="back">← Liste</a>
        <h2>{{ isEdit ? 'Modifier l&apos;opportunité' : 'Nouvelle opportunité' }}</h2>
      </header>

      @if (clientsLoadError) {
        <p class="error">{{ clientsLoadError }}</p>
      }

      <form [formGroup]="form" (ngSubmit)="submit()">
        <div class="grid">
          <label class="full">
            Titre *
            <input type="text" formControlName="title" />
          </label>
          <label class="full">
            Client *
            <select formControlName="clientId">
              <option [ngValue]="null" disabled>— Choisir un client —</option>
              @for (cl of clients; track cl.id) {
                <option [ngValue]="cl.id">{{ cl.companyName }} ({{ cl.email }})</option>
              }
            </select>
          </label>
          <label class="full">
            Description / fiche de poste *
            <textarea formControlName="description" rows="4"></textarea>
          </label>
          <label class="full">
            Profil recherché *
            <textarea formControlName="profileSought" rows="3"></textarea>
          </label>
          <label>
            Statut *
            <select formControlName="status">
              @for (st of statuses; track st) {
                <option [value]="st">{{ st }}</option>
              }
            </select>
          </label>
          <label>
            Budget (€)
            <input type="number" formControlName="budget" step="0.01" min="0" placeholder="Optionnel" />
          </label>
        </div>

        @if (submitError) {
          <p class="error">{{ submitError }}</p>
        }

        <div class="actions">
          <button type="button" routerLink="/opportunities" class="secondary">Annuler</button>
          <button type="submit" [disabled]="form.invalid || loading || clients.length === 0">
            {{ loading ? 'Enregistrement...' : 'Enregistrer' }}
          </button>
        </div>
      </form>
    </section>
  `,
  styles: `
    .panel {
      background: #fff;
      border-radius: 12px;
      padding: 1.5rem;
      max-width: 720px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
    }
    .head {
      margin-bottom: 1.5rem;
    }
    .back {
      display: inline-block;
      margin-bottom: 0.5rem;
      color: #2563eb;
      text-decoration: none;
      font-size: 0.9rem;
    }
    h2 {
      margin: 0;
      color: #0f172a;
    }
    .grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }
    .full {
      grid-column: 1 / -1;
    }
    label {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
      font-size: 0.85rem;
      color: #334155;
    }
    input,
    select,
    textarea {
      padding: 0.5rem 0.65rem;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      font-size: 1rem;
    }
    .error {
      color: #dc2626;
      font-size: 0.9rem;
    }
    .actions {
      display: flex;
      gap: 0.75rem;
      margin-top: 1.25rem;
    }
    button {
      padding: 0.6rem 1.1rem;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      border: none;
    }
    button[type='submit'] {
      background: #2563eb;
      color: #fff;
    }
    button[type='submit']:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    .secondary {
      background: #f1f5f9;
      color: #334155;
      border: 1px solid #cbd5e1 !important;
    }
  `,
})
export class OpportunityFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(OpportunityApiService);
  private readonly clientApi = inject(ClientApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  private readonly idParam = this.route.snapshot.paramMap.get('id');
  readonly isEdit = this.idParam != null;

  readonly statuses: OpportunityStatus[] = ['OPEN', 'WON', 'LOST'];

  clients: CrmClient[] = [];
  clientsLoadError: string | null = null;

  readonly form = this.fb.group({
    title: ['', Validators.required],
    clientId: this.fb.control<number | null>(null, Validators.required),
    description: ['', Validators.required],
    profileSought: ['', Validators.required],
    status: ['OPEN' as OpportunityStatus, Validators.required],
    budget: this.fb.control<number | null>(null),
  });

  loading = false;
  submitError: string | null = null;

  constructor() {
    this.clientApi.findAll().subscribe({
      next: (list) => {
        this.clients = list;
        const id = this.idParam;
        if (id) {
          this.loadOpportunity(+id);
        }
      },
      error: () => {
        this.clientsLoadError = 'Impossible de charger la liste des clients.';
      },
    });
  }

  private loadOpportunity(id: number): void {
    this.loading = true;
    this.api.findById(id).subscribe({
      next: (o) => {
        this.form.patchValue({
          title: o.title,
          clientId: o.clientId,
          description: o.description,
          profileSought: o.profileSought,
          status: o.status,
          budget: o.budget ?? null,
        });
        this.loading = false;
      },
      error: () => {
        this.submitError = 'Opportunité introuvable.';
        this.loading = false;
      },
    });
  }

  submit(): void {
    if (this.form.invalid) {
      return;
    }
    const raw = this.form.getRawValue();
    const clientId = raw.clientId;
    if (clientId == null) {
      return;
    }
    const budgetVal = raw.budget;
    const budget =
      budgetVal == null || (typeof budgetVal === 'string' && budgetVal === '')
        ? undefined
        : Number(budgetVal);
    const payload = {
      title: raw.title!,
      description: raw.description!,
      profileSought: raw.profileSought!,
      status: raw.status!,
      budget: budget != null && !Number.isNaN(budget) ? budget : undefined,
      clientId,
    };
    this.loading = true;
    this.submitError = null;
    const id = this.idParam;

    const done = {
      next: () => {
        this.loading = false;
        this.router.navigate(['/opportunities']);
      },
      error: () => {
        this.loading = false;
        this.submitError = "Enregistrement impossible (client invalide ou erreur serveur).";
      },
    };

    if (id) {
      this.api.update(+id, payload).subscribe(done);
    } else {
      this.api.create(payload).subscribe(done);
    }
  }
}
