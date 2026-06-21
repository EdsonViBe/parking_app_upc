import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ReservationService } from '../../services/reservation.service';
import { ParkingService } from '../../services/parking.service';
import { ParkingSpace, Reservation } from '../../models/parking.model';

interface ReservationReview {
  rating: number;
  comment: string;
}

@Component({
  selector: 'app-my-reservations',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './my-reservations.component.html',
  styleUrls: ['./my-reservations.component.scss']
})
export class MyReservationsComponent implements OnInit {
  reservations: Reservation[] = [];
  activeTab: 'todas' | 'activas' | 'historial' = 'todas';
  parkingById = new Map<number, ParkingSpace>();
  navigationError = '';
  reviewForms: Record<number, ReservationReview> = {};
  reviewErrors: Record<number, string> = {};
  savedReviews: Record<number, ReservationReview> = {};

  constructor(
    private authService: AuthService,
    private reservationService: ReservationService,
    private parkingService: ParkingService
  ) {}

  ngOnInit(): void {
    this.parkingService.getAll().subscribe(spaces => {
      this.parkingById = new Map(spaces.map(space => [space.id, space]));
    });
    this.authService.getCurrentUser().subscribe(user => {
      if (user) {
        this.reservationService.getByUserId(user.id).subscribe(r => this.reservations = r);
      }
    });
  }

  get filtered(): Reservation[] {
    if (this.activeTab === 'activas') return this.reservations.filter(r => r.status === 'confirmada' || r.status === 'pendiente');
    if (this.activeTab === 'historial') return this.reservations.filter(r => r.status === 'completada' || r.status === 'cancelada');
    return this.reservations;
  }

  cancel(id: number): void {
    if (confirm('¿Estás seguro de cancelar esta reserva?')) {
      this.reservationService.cancel(id).subscribe(() => {
        this.reservations = this.reservations.map(r => r.id === id ? { ...r, status: 'cancelada' as const } : r);
      });
    }
  }

  openDirections(reservation: Reservation): void {
    this.navigationError = '';
    if (!navigator.onLine) {
      this.navigationError = 'No es posible cargar la navegación porque no hay conexión a Internet.';
      return;
    }

    const parking = this.parkingById.get(reservation.parkingId);
    const destination = parking
      ? `${parking.lat},${parking.lng}`
      : reservation.parkingAddress;

    window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`, '_blank');
  }

  getReviewForm(id: number): ReservationReview {
    if (!this.reviewForms[id]) {
      this.reviewForms[id] = { rating: 5, comment: '' };
    }
    return this.reviewForms[id];
  }

  saveReview(reservation: Reservation): void {
    const form = this.getReviewForm(reservation.id);
    if (!form.comment.trim()) {
      this.reviewErrors[reservation.id] = 'Completa un comentario antes de enviar tu valoración.';
      return;
    }

    this.savedReviews[reservation.id] = { ...form, comment: form.comment.trim() };
    this.reviewErrors[reservation.id] = '';
  }

  statusLabel(s: string): string {
    return { pendiente: '🕐 Pendiente', confirmada: '✅ Confirmada', completada: '🏁 Completada', cancelada: '❌ Cancelada' }[s] || s;
  }

  statusClass(s: string): string {
    return { pendiente: 'badge-warning', confirmada: 'badge-success', completada: 'badge-info', cancelada: 'badge-danger' }[s] || '';
  }
}
