import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ParkingService } from '../../services/parking.service';
import { AuthService } from '../../services/auth.service';
import { ParkingSpace, User } from '../../models/parking.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  searchQuery = '';
  featured: ParkingSpace[] = [];
  showLoginPrompt = false;
  showOwnerBlockPrompt = false;
  currentUser: User | null = null;

  stats = [
    { icon: '🚗', value: '1,200+', label: 'Espacios disponibles' },
    { icon: '👥', value: '8,500+', label: 'Conductores registrados' },
    { icon: '⭐', value: '4.7/5', label: 'Calificación promedio' },
    { icon: '🏘️', label: 'Distritos de Lima', value: '25+' }
  ];

  howItWorks = [
    { step: '1', icon: '🔍', title: 'Busca', desc: 'Ingresa tu dirección o distrito y encuentra espacios disponibles en tiempo real en el mapa interactivo.' },
    { step: '2', icon: '📅', title: 'Reserva', desc: 'Elige el espacio que más te conviene, selecciona el horario y confirma tu reserva en pocos pasos.' },
    { step: '3', icon: '💳', title: 'Paga', desc: 'Paga de forma segura desde la app con tarjeta, Yape, Plin u otros métodos de pago digitales.' },
    { step: '4', icon: '🚘', title: 'Estaciona', desc: 'Navega directamente al estacionamiento con Google Maps y disfruta de tu espacio reservado.' }
  ];

  constructor(
    private parkingService: ParkingService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.parkingService.getFeatured().subscribe(spaces => this.featured = spaces);
    this.authService.getCurrentUser().subscribe(u => this.currentUser = u);
  }

  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  get isOwner(): boolean {
    return this.currentUser?.role === 'propietario';
  }

  onSearchFocus(): void {
    if (!this.isLoggedIn) { this.showLoginPrompt = true; return; }
    if (this.isOwner) { this.showOwnerBlockPrompt = true; }
  }

  search(): void {
    if (!this.isLoggedIn) { this.showLoginPrompt = true; return; }
    if (this.isOwner) { this.showOwnerBlockPrompt = true; return; }
    this.parkingService.updateFilters({ query: this.searchQuery });
    this.router.navigate(['/buscar'], { queryParams: { q: this.searchQuery } });
  }

  goToLogin(): void {
    this.router.navigate(['/login'], { queryParams: { returnUrl: '/buscar' } });
  }

  goToOwnerDashboard(): void {
    this.router.navigate(['/dashboard-propietario']);
  }
}
