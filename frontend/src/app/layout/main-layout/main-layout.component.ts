import { Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { Role } from '@core/models/role.enum';

interface NavItem {
  label: string;
  path: string;
  roles: Role[];
}

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="layout">
      <aside class="sidebar">
        <div class="brand">
          <h1>ESN ATS/CRM</h1>
          @if (user(); as u) {
            <p class="user">{{ u.firstName }} {{ u.lastName }}</p>
            <p class="roles">{{ roleLabels() }}</p>
          }
        </div>
        <nav>
          @for (item of visibleNav(); track item.path) {
            <a [routerLink]="item.path" routerLinkActive="active">{{ item.label }}</a>
          }
        </nav>
        <button type="button" class="logout" (click)="logout()">Déconnexion</button>
      </aside>
      <main class="content">
        <router-outlet />
      </main>
    </div>
  `,
  styles: [
    `
      .layout {
        display: flex;
        min-height: 100vh;
      }
      .sidebar {
        width: 260px;
        background: #0f172a;
        color: #e2e8f0;
        display: flex;
        flex-direction: column;
        padding: 1.5rem 1rem;
      }
      .brand h1 {
        font-size: 1.1rem;
        margin: 0 0 0.5rem;
      }
      .user {
        margin: 0;
        font-weight: 600;
      }
      .roles {
        margin: 0.25rem 0 1.5rem;
        font-size: 0.75rem;
        color: #94a3b8;
      }
      nav {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        flex: 1;
      }
      nav a {
        color: #cbd5e1;
        text-decoration: none;
        padding: 0.6rem 0.75rem;
        border-radius: 8px;
        font-size: 0.9rem;
      }
      nav a:hover,
      nav a.active {
        background: #1e293b;
        color: #fff;
      }
      .logout {
        margin-top: 1rem;
        background: transparent;
        border: 1px solid #475569;
        color: #e2e8f0;
        padding: 0.5rem;
        border-radius: 8px;
        cursor: pointer;
      }
      .logout:hover {
        background: #1e293b;
      }
      .content {
        flex: 1;
        padding: 2rem;
        background: #f8fafc;
      }
    `,
  ],
})
export class MainLayoutComponent {
  private readonly auth = inject(AuthService);

  readonly user = this.auth.currentUser;

  private readonly navItems: NavItem[] = [
    { label: 'Tableau de bord', path: '/', roles: [Role.Client, Role.Agent, Role.Admin] },
    { label: 'Candidats', path: '/candidates', roles: [Role.Agent, Role.Admin] },
    { label: 'Clients CRM', path: '/clients', roles: [Role.Agent, Role.Admin] },
    { label: 'Opportunités', path: '/opportunities', roles: [Role.Agent, Role.Admin] },
    { label: 'Espace Client', path: '/client', roles: [Role.Client, Role.Admin] },
    { label: 'Espace Agent', path: '/agent', roles: [Role.Agent, Role.Admin] },
    { label: 'Administration', path: '/admin', roles: [Role.Admin] },
  ];

  readonly visibleNav = computed(() =>
    this.navItems.filter((item) => this.auth.hasAnyRole(item.roles))
  );

  readonly roleLabels = computed(() =>
    (this.user()?.roles ?? [])
      .map((r) => r.replace('ROLE_', ''))
      .join(', ')
  );

  logout(): void {
    this.auth.logout();
  }
}
