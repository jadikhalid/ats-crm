import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { MsalService } from '@azure/msal-angular';

import { Observable, firstValueFrom, throwError } from 'rxjs';
import { tap } from 'rxjs/operators';

import { environment } from '@env/environment';

import { TOKEN_BEARER } from '../auth/token-bearer';
import { SESSION_ACCESS_TOKEN_KEY, SESSION_CURRENT_USER_KEY } from '../auth/session.constants';
import { LoginRequest, LoginResponse, User } from '../models/user.model';
import { Role } from '../models/role.enum';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly tokenBearer = inject(TOKEN_BEARER);
  private readonly msal = inject(MsalService, { optional: true });

  private readonly currentUserSignal = signal<User | null>(
    environment.auth.mode === 'local' ? this.loadStoredUser() : null,
  );

  readonly currentUser = this.currentUserSignal.asReadonly();
  readonly isAuthenticated = computed(() => this.currentUser() !== null);
  readonly roles = computed(() => this.currentUser()?.roles ?? []);

  login(credentials: LoginRequest): Observable<LoginResponse> {
    if (environment.auth.mode === 'entra') {
      return throwError(() => new Error('La connexion par mot de passe est désactivée (Microsoft Entra ID).'));
    }
    return this.http
      .post<LoginResponse>(`${environment.apiBaseUrl}/v1/auth/login`, credentials)
      .pipe(tap((response) => this.persistSession(response)));
  }

  /**
   * Redirection SSO Microsoft — actif lorsque {@code auth.mode === 'entra'}.
   */
  loginWithMicrosoft(): void {
    if (environment.auth.mode !== 'entra') {
      return;
    }
    const cfg = environment.auth.msal;
    if (!this.msal || !cfg) {
      return;
    }
    this.msal.loginRedirect({ scopes: cfg.scopes });
  }

  /** Appelé après `handleRedirectPromise` (voir `APP_INITIALIZER`). */
  async hydrateAfterOAuthRedirect(): Promise<void> {
    if (environment.auth.mode !== 'entra') {
      return;
    }
    if (!this.msal) {
      return;
    }
    const acc =
      this.msal.instance.getActiveAccount() ?? this.msal.instance.getAllAccounts().at(0) ?? null;
    if (!acc) {
      return;
    }
    this.msal.instance.setActiveAccount(acc);

    try {
      await firstValueFrom(this.loadCurrentUser());
    } catch {
      this.currentUserSignal.set(null);
      localStorage.removeItem(SESSION_CURRENT_USER_KEY);
      localStorage.removeItem(SESSION_ACCESS_TOKEN_KEY);
    }
  }

  loadCurrentUser(): Observable<User> {
    return this.http.get<User>(`${environment.apiBaseUrl}/v1/auth/me`).pipe(
      tap((user) => {
        this.currentUserSignal.set(this.normalizeUser(user));
        localStorage.setItem(SESSION_CURRENT_USER_KEY, JSON.stringify(this.currentUserSignal()));
      }),
    );
  }

  logout(): void {
    if (environment.auth.mode === 'entra' && this.msal) {
      const cfg = environment.auth.msal;
      localStorage.removeItem(SESSION_ACCESS_TOKEN_KEY);
      localStorage.removeItem(SESSION_CURRENT_USER_KEY);
      this.currentUserSignal.set(null);
      void this.msal.logoutRedirect({
        postLogoutRedirectUri: cfg.postLogoutRedirectUri,
      });
      return;
    }

    localStorage.removeItem(SESSION_ACCESS_TOKEN_KEY);
    localStorage.removeItem(SESSION_CURRENT_USER_KEY);
    this.currentUserSignal.set(null);
    void this.router.navigate(['/auth/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(SESSION_ACCESS_TOKEN_KEY);
  }

  getBearerToken$(): Observable<string | null> {
    return this.tokenBearer.getBearerToken$();
  }

  hasRole(role: Role): boolean {
    return this.roles().includes(role);
  }

  hasAnyRole(roles: Role[]): boolean {
    return roles.some((role) => this.hasRole(role));
  }

  private persistSession(response: LoginResponse): void {
    localStorage.setItem(SESSION_ACCESS_TOKEN_KEY, response.accessToken);
    const user = this.normalizeUser(response.user);
    localStorage.setItem(SESSION_CURRENT_USER_KEY, JSON.stringify(user));
    this.currentUserSignal.set(user);
  }

  private loadStoredUser(): User | null {
    const raw = localStorage.getItem(SESSION_CURRENT_USER_KEY);
    if (!raw) {
      return null;
    }
    try {
      return this.normalizeUser(JSON.parse(raw) as User);
    } catch {
      return null;
    }
  }

  private normalizeUser(user: User): User {
    return {
      ...user,
      roles: (user.roles ?? []).map((r) => r as Role),
    };
  }
}
