import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component';
import { CookieBannerComponent } from './components/cookie-banner/cookie-banner.component';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, CookieBannerComponent],
  template: `
    <div class="mobile-shell">
      <app-navbar></app-navbar>
      <main class="main-content">
        <router-outlet></router-outlet>
      </main>
      <app-cookie-banner></app-cookie-banner>
    </div>
  `,
  styles: [`
    .mobile-shell {
      min-height: 100vh;
      background: var(--gray-50);
    }

    .main-content {
      min-height: calc(100vh - 64px);
      padding-bottom: env(safe-area-inset-bottom);
    }
  `]
})
export class AppComponent implements OnInit {
  constructor(private authService: AuthService) {}
  ngOnInit(): void { this.authService.loadUserFromStorage(); }
}
