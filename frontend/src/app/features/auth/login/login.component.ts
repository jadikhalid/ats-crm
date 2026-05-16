import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import type { AuthMode } from '@env/environment.types';
import { environment } from '@env/environment';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <h2>Connexion</h2>

    @if (authMode === 'entra') {
      <p class="hint">Connexion sécurisée via Microsoft Entra ID (organisation).</p>

      @if (error()) {
        <p class="error">{{ error() }}</p>
      }

      <button type="button" class="btn-ms" [disabled]="loading()" (click)="sso()">
        {{ loading() ? 'Redirection…' : 'Se connecter avec Microsoft' }}
      </button>
    } @else {
      <p class="hint">Comptes de démo — mot de passe : <code>password</code></p>

      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <label>
          Email
          <input type="email" formControlName="email" placeholder="agent@esn.local" />
        </label>
        <label>
          Mot de passe
          <input type="password" formControlName="password" />
        </label>

        @if (error()) {
          <p class="error">{{ error() }}</p>
        }

        <button type="submit" [disabled]="form.invalid || loading()">
          {{ loading() ? 'Connexion...' : 'Se connecter' }}
        </button>
      </form>

      <ul class="demo-accounts">
        <li><button type="button" (click)="fillDemo('client@esn.local')">Client</button></li>
        <li><button type="button" (click)="fillDemo('agent@esn.local')">Agent</button></li>
        <li><button type="button" (click)="fillDemo('admin@esn.local')">Admin</button></li>
      </ul>
    }
  `,
  styles: [
    `
      h2 {
        margin: 0 0 0.5rem;
        color: #0f172a;
      }
      .hint {
        font-size: 0.85rem;
        color: #64748b;
        margin-bottom: 1.5rem;
      }
      form {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }
      label {
        display: flex;
        flex-direction: column;
        gap: 0.35rem;
        font-size: 0.85rem;
        color: #334155;
      }
      input {
        padding: 0.6rem 0.75rem;
        border: 1px solid #cbd5e1;
        border-radius: 8px;
        font-size: 1rem;
      }
      button[type='submit'] {
        background: #2563eb;
        color: #fff;
        border: none;
        padding: 0.75rem;
        border-radius: 8px;
        font-weight: 600;
        cursor: pointer;
      }
      button[type='submit']:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
      .btn-ms {
        width: 100%;
        padding: 0.75rem 1rem;
        border-radius: 10px;
        border: none;
        background: #0078d4;
        color: #fff;
        font-weight: 700;
        font-size: 0.95rem;
        cursor: pointer;
      }
      .btn-ms:disabled {
        opacity: 0.65;
        cursor: not-allowed;
      }
      .error {
        color: #dc2626;
        font-size: 0.85rem;
        margin: 0;
      }
      .demo-accounts {
        list-style: none;
        padding: 0;
        margin: 1.5rem 0 0;
        display: flex;
        gap: 0.5rem;
      }
      .demo-accounts button {
        flex: 1;
        background: #f1f5f9;
        border: 1px solid #cbd5e1;
        padding: 0.4rem;
        border-radius: 6px;
        cursor: pointer;
        font-size: 0.8rem;
      }
    `,
  ],
})
export class LoginComponent {
  readonly authMode: AuthMode = environment.auth.mode;

  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  fillDemo(email: string): void {
    this.form.patchValue({ email, password: 'password' });
  }

  sso(): void {
    this.loading.set(true);
    this.error.set(null);
    try {
      this.auth.loginWithMicrosoft();
    } catch (e: unknown) {
      this.loading.set(false);
      this.error.set(e instanceof Error ? e.message : 'Connexion SSO impossible.');
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      return;
    }
    this.loading.set(true);
    this.error.set(null);

    this.auth.login(this.form.getRawValue()).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/']);
      },
      error: () => {
        this.loading.set(false);
        this.error.set('Identifiants invalides');
      },
    });
  }
}
