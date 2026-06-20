import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ReservationService } from '../../services/reservation.service';
import { Reservation } from '../../models/parking.model';

@Component({
  selector: 'app-my-reservations',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './my-reservations.component.html',
  styleUrls: ['./my-reservations.component.scss']
})
export class MyReservationsComponent implements OnInit {
  reservations: Reservation[] = [];
  activeTab: 'todas' | 'activas' | 'historial' = 'todas';

  constructor(private authService: AuthService, private reservationService: ReservationService) {}

  ngOnInit(): void {
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

  statusLabel(s: string): string {
    return { pendiente: '🕐 Pendiente', confirmada: '✅ Confirmada', completada: '🏁 Completada', cancelada: '❌ Cancelada' }[s] || s;
  }

  statusClass(s: string): string {
    return { pendiente: 'badge-warning', confirmada: 'badge-success', completada: 'badge-info', cancelada: 'badge-danger' }[s] || '';
  }
}
