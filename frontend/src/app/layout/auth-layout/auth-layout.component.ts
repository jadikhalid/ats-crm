import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <div class="auth-shell">
      <div class="auth-card">
        <router-outlet />
      </div>
    </div>
  `,
  styles: [
    `
      .auth-shell {
        display: flex;
        min-height: 100vh;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%);
        padding: 1.5rem;
      }
      .auth-card {
        width: 100%;
        max-width: 420px;
        background: #fff;
        border-radius: 12px;
        padding: 2rem;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
      }
    `,
  ],
})
export class AuthLayoutComponent {}
