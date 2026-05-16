import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ClientApiService } from '../services/client-api.service';

@Component({
  selector: 'app-client-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <section class="panel">
      <header class="head">
        <a routerLink="/clients" class="back">← Liste</a>
        <h2>{{ isEdit ? 'Modifier le client' : 'Nouveau client' }}</h2>
      </header>

      <form [formGroup]="form" (ngSubmit)="submit()">
        <div class="grid">
          <label class="full">
            Nom de l&apos;entreprise *
            <input type="text" formControlName="companyName" />
          </label>
          <label class="full">
            Contact principal *
            <input type="text" formControlName="primaryContact" />
          </label>
          <label class="full">
            Email *
            <input type="email" formControlName="email" />
          </label>
          <label>
            Téléphone
            <input type="text" formControlName="phone" />
          </label>
          <label>
            Secteur d&apos;activité
            <input type="text" formControlName="industry" placeholder="Finance, Retail..." />
          </label>
        </div>

        @if (submitError) {
          <p class="error">{{ submitError }}</p>
        }

        <div class="actions">
          <button type="button" routerLink="/clients" class="secondary">Annuler</button>
          <button type="submit" [disabled]="form.invalid || loading">
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
      max-width: 640px;
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
    input {
      padding: 0.5rem 0.65rem;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      font-size: 1rem;
    }
    .error {
      color: #dc2626;
      font-size: 0.9rem;
      margin: 0.5rem 0 0;
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
export class ClientFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(ClientApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  private readonly idParam = this.route.snapshot.paramMap.get('id');
  readonly isEdit = this.idParam != null;

  readonly form = this.fb.nonNullable.group({
    companyName: ['', Validators.required],
    primaryContact: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
    industry: [''],
  });

  loading = false;
  submitError: string | null = null;

  constructor() {
    const id = this.idParam;
    if (id) {
      this.loading = true;
      this.api.findById(+id).subscribe({
        next: (c) => {
          this.form.patchValue({
            companyName: c.companyName,
            primaryContact: c.primaryContact,
            email: c.email,
            phone: c.phone ?? '',
            industry: c.industry ?? '',
          });
          this.loading = false;
        },
        error: () => {
          this.submitError = 'Client introuvable.';
          this.loading = false;
        },
      });
    }
  }

  submit(): void {
    if (this.form.invalid) {
      return;
    }
    const raw = this.form.getRawValue();
    const payload = {
      companyName: raw.companyName,
      primaryContact: raw.primaryContact,
      email: raw.email,
      phone: raw.phone || undefined,
      industry: raw.industry || undefined,
    };
    this.loading = true;
    this.submitError = null;
    const id = this.idParam;

    const done = {
      next: () => {
        this.loading = false;
        this.router.navigate(['/clients']);
      },
      error: () => {
        this.loading = false;
        this.submitError = "Enregistrement impossible (email déjà utilisé ou erreur serveur).";
      },
    };

    if (id) {
      this.api.update(+id, payload).subscribe(done);
    } else {
      this.api.create(payload).subscribe(done);
    }
  }
}
