import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CandidateApiService } from '../services/candidate-api.service';
import { CandidateStatus } from '../models/candidate.model';

@Component({
  selector: 'app-candidate-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <section class="panel">
      <header class="head">
        <a routerLink="/candidates" class="back">← Liste</a>
        <h2>{{ isEdit ? 'Modifier le candidat' : 'Nouveau candidat' }}</h2>
      </header>

      <form [formGroup]="form" (ngSubmit)="submit()">
        <div class="grid">
          <label>
            Prénom *
            <input type="text" formControlName="firstName" />
          </label>
          <label>
            Nom *
            <input type="text" formControlName="lastName" />
          </label>
          <label class="full">
            Email *
            <input type="email" formControlName="email" />
          </label>
          <label class="full">
            Téléphone
            <input type="text" formControlName="phone" />
          </label>
          <label class="full">
            Chemin / URL CV
            <input type="text" formControlName="cvPath" placeholder="/storage/cv/..." />
          </label>
          <label class="full">
            Compétences <span class="hint">(séparées par des virgules)</span>
            <textarea formControlName="skillsText" rows="2" placeholder="Java, Spring Boot, Angular"></textarea>
          </label>
          <label>
            Statut *
            <select formControlName="status">
              @for (st of statuses; track st) {
                <option [value]="st">{{ st }}</option>
              }
            </select>
          </label>
        </div>

        @if (submitError) {
          <p class="error">{{ submitError }}</p>
        }

        <div class="actions">
          <button type="button" routerLink="/candidates" class="secondary">Annuler</button>
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
    form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
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
    input[readonly] {
      background: #f1f5f9;
    }
    .hint {
      font-weight: 400;
      color: #94a3b8;
    }
    .error {
      color: #dc2626;
      font-size: 0.9rem;
      margin: 0;
    }
    .actions {
      display: flex;
      gap: 0.75rem;
      margin-top: 0.5rem;
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
export class CandidateFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(CandidateApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly statuses: CandidateStatus[] = [
    'NEW',
    'AVAILABLE',
    'IN_PROCESS',
    'PLACED',
    'ARCHIVED',
  ];

  readonly form = this.fb.nonNullable.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
    cvPath: [''],
    skillsText: [''],
    status: ['NEW' as CandidateStatus, Validators.required],
  });

  private readonly idParam = this.route.snapshot.paramMap.get('id');
  readonly isEdit = this.idParam != null;

  loading = false;
  submitError: string | null = null;

  constructor() {
    const cid = this.idParam;
    if (cid) {
      this.loading = true;
      this.api.findById(+cid).subscribe({
        next: (c) => {
          this.form.patchValue({
            firstName: c.firstName,
            lastName: c.lastName,
            email: c.email,
            phone: c.phone ?? '',
            cvPath: c.cvPath ?? '',
            skillsText: (c.skills ?? []).join(', '),
            status: c.status,
          });
          this.loading = false;
        },
        error: () => {
          this.submitError = 'Candidat introuvable.';
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
    const skills = raw.skillsText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const payload = {
      firstName: raw.firstName,
      lastName: raw.lastName,
      email: raw.email,
      phone: raw.phone || undefined,
      cvPath: raw.cvPath || undefined,
      skills,
      status: raw.status,
    };
    this.loading = true;
    this.submitError = null;
    const cid = this.idParam;

    const done = {
      next: () => {
        this.loading = false;
        this.router.navigate(['/candidates']);
      },
      error: () => {
        this.loading = false;
        this.submitError = "Enregistrement impossible (email déjà utilisé ou erreur serveur).";
      },
    };

    if (cid) {
      this.api.update(+cid, payload).subscribe(done);
    } else {
      this.api.create(payload).subscribe(done);
    }
  }
}
