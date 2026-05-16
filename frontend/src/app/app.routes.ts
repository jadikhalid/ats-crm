import { Routes } from '@angular/router';
import { authGuard } from '@core/guards/auth.guard';
import { guestGuard } from '@core/guards/guest.guard';
import { roleGuard } from '@core/guards/role.guard';
import { Role } from '@core/models/role.enum';

export const routes: Routes = [
  {
    path: 'auth',
    loadComponent: () =>
      import('./layout/auth-layout/auth-layout.component').then((m) => m.AuthLayoutComponent),
    children: [
      {
        path: 'login',
        canActivate: [guestGuard],
        loadComponent: () =>
          import('./features/auth/login/login.component').then((m) => m.LoginComponent),
      },
      { path: '', redirectTo: 'login', pathMatch: 'full' },
    ],
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./layout/main-layout/main-layout.component').then((m) => m.MainLayoutComponent),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
      },
      {
        path: 'client',
        canActivate: [roleGuard],
        data: { roles: [Role.Client, Role.Admin] },
        loadComponent: () =>
          import('./features/client/client-space.component').then((m) => m.ClientSpaceComponent),
      },
      {
        path: 'agent',
        canActivate: [roleGuard],
        data: { roles: [Role.Agent, Role.Admin] },
        loadComponent: () =>
          import('./features/agent/agent-space.component').then((m) => m.AgentSpaceComponent),
      },
      {
        path: 'candidates/new',
        canActivate: [roleGuard],
        data: { roles: [Role.Agent, Role.Admin] },
        loadComponent: () =>
          import('./features/candidates/form/candidate-form.component').then((m) => m.CandidateFormComponent),
      },
      {
        path: 'candidates/:id/edit',
        canActivate: [roleGuard],
        data: { roles: [Role.Agent, Role.Admin] },
        loadComponent: () =>
          import('./features/candidates/form/candidate-form.component').then((m) => m.CandidateFormComponent),
      },
      {
        path: 'candidates/:id',
        canActivate: [roleGuard],
        data: { roles: [Role.Agent, Role.Admin] },
        loadComponent: () =>
          import('./features/candidates/detail/candidate-detail.component').then(
            (m) => m.CandidateDetailComponent
          ),
      },
      {
        path: 'candidates',
        canActivate: [roleGuard],
        data: { roles: [Role.Agent, Role.Admin] },
        loadComponent: () =>
          import('./features/candidates/list/candidate-list.component').then(
            (m) => m.CandidateListComponent
          ),
      },
      {
        path: 'clients/new',
        canActivate: [roleGuard],
        data: { roles: [Role.Agent, Role.Admin] },
        loadComponent: () =>
          import('./features/clients/form/client-form.component').then((m) => m.ClientFormComponent),
      },
      {
        path: 'clients/:id/edit',
        canActivate: [roleGuard],
        data: { roles: [Role.Agent, Role.Admin] },
        loadComponent: () =>
          import('./features/clients/form/client-form.component').then((m) => m.ClientFormComponent),
      },
      {
        path: 'clients',
        canActivate: [roleGuard],
        data: { roles: [Role.Agent, Role.Admin] },
        loadComponent: () =>
          import('./features/clients/list/client-list.component').then((m) => m.ClientListComponent),
      },
      {
        path: 'opportunities/new',
        canActivate: [roleGuard],
        data: { roles: [Role.Agent, Role.Admin] },
        loadComponent: () =>
          import('./features/opportunities/form/opportunity-form.component').then(
            (m) => m.OpportunityFormComponent
          ),
      },
      {
        path: 'opportunities/:id/edit',
        canActivate: [roleGuard],
        data: { roles: [Role.Agent, Role.Admin] },
        loadComponent: () =>
          import('./features/opportunities/form/opportunity-form.component').then(
            (m) => m.OpportunityFormComponent
          ),
      },
      {
        path: 'opportunities/:id',
        canActivate: [roleGuard],
        data: { roles: [Role.Agent, Role.Admin] },
        loadComponent: () =>
          import('./features/opportunities/detail/opportunity-detail.component').then(
            (m) => m.OpportunityDetailComponent
          ),
      },
      {
        path: 'opportunities',
        canActivate: [roleGuard],
        data: { roles: [Role.Agent, Role.Admin] },
        loadComponent: () =>
          import('./features/opportunities/list/opportunity-list.component').then(
            (m) => m.OpportunityListComponent
          ),
      },
      {
        path: 'admin',
        canActivate: [roleGuard],
        data: { roles: [Role.Admin] },
        loadComponent: () =>
          import('./features/admin/admin-space.component').then((m) => m.AdminSpaceComponent),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
