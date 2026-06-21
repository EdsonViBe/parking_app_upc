import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';

import { NavbarComponent } from './components/navbar/navbar.component';
import { CookieBannerComponent } from './components/cookie-banner/cookie-banner.component';
import { AuthService } from './services/auth.service';
import { User } from './models/parking.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    NavbarComponent,
    CookieBannerComponent
  ],
  template: `
    <app-navbar></app-navbar>

    <main class="main-content">
      <router-outlet></router-outlet>
    </main>

    @if (showTabbar) {
      <nav class="mobile-tabbar" aria-label="Navegación principal móvil">
        <a
          routerLink="/"
          routerLinkActive="active"
          [routerLinkActiveOptions]="{ exact: true }"
          class="tab-item"
        >
          <span class="tab-icon">🏠</span>
          <span>Inicio</span>
        </a>

        <a routerLink="/buscar" routerLinkActive="active" class="tab-item">
          <span class="tab-icon">🔎</span>
          <span>Buscar</span>
        </a>

        @if (currentUser?.role === 'conductor') {
          <a routerLink="/mis-reservas" routerLinkActive="active" class="tab-item">
            <span class="tab-icon">📅</span>
            <span>Reservas</span>
          </a>
        }

        @if (currentUser?.role === 'propietario') {
          <a routerLink="/dashboard-propietario" routerLinkActive="active" class="tab-item">
            <span class="tab-icon">🚗</span>
            <span>Mi cochera</span>
          </a>
        }

        <a routerLink="/perfil" routerLinkActive="active" class="tab-item">
          <span class="tab-icon">👤</span>
          <span>Mi Perfil</span>
        </a>

        <a routerLink="/login" class="tab-item" (click)="logout()">
          <span class="tab-icon">🚪</span>
          <span>Salir</span>
        </a>
      </nav>
    }

    <app-cookie-banner></app-cookie-banner>
  `,
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  currentUser: User | null = null;
  currentUrl = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.loadUserFromStorage();

    this.authService.getCurrentUser().subscribe(user => {
      this.currentUser = user;
    });

    this.currentUrl = this.router.url;

    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.currentUrl = event.urlAfterRedirects;
      });
  }

  get showTabbar(): boolean {
    return this.currentUrl !== '/login' && this.currentUrl !== '/registro';
  }

  logout(): void {
    this.authService.logout();
  }
}