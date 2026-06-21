import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { Reservation } from '../models/parking.model';

@Injectable({ providedIn: 'root' })
export class ReservationService {
  private reservations$ = new BehaviorSubject<Reservation[]>([
    {
      id: 1001, parkingId: 1, parkingTitle: 'Cochera San Isidro Centro',
      parkingAddress: 'Av. Conquistadores 850', userId: 1,
      date: '2026-06-20', startTime: '09:00', endTime: '12:00', hours: 3,
      totalPrice: 15, status: 'confirmada', vehiclePlate: 'ABC-123',
      vehicleType: 'auto', createdAt: '2026-06-18T10:00:00'
    },
    {
      id: 1002, parkingId: 4, parkingTitle: 'Parqueo UPC Monterrico',
      parkingAddress: 'Av. La Fontana 550', userId: 1,
      date: '2026-06-15', startTime: '08:00', endTime: '17:00', hours: 9,
      totalPrice: 18, status: 'completada', vehiclePlate: 'ABC-123',
      vehicleType: 'auto', createdAt: '2026-06-12T08:00:00'
    }
  ]);

  create(reservation: Omit<Reservation, 'id' | 'createdAt'>): Observable<Reservation> {
    const newRes: Reservation = {
      ...reservation,
      id: Date.now(),
      createdAt: new Date().toISOString()
    };
    const current = this.reservations$.value;
    this.reservations$.next([...current, newRes]);
    return of(newRes);
  }

  getByUserId(userId: number): Observable<Reservation[]> {
    return of(this.reservations$.value.filter(r => r.userId === userId));
  }

  getAll(): Observable<Reservation[]> {
    return this.reservations$.asObservable();
  }

  cancel(reservationId: number): Observable<boolean> {
    const updated = this.reservations$.value.map(r =>
      r.id === reservationId ? { ...r, status: 'cancelada' as const } : r
    );
    this.reservations$.next(updated);
    return of(true);
  }

  approve(reservationId: number): Observable<boolean> {
  const updated = this.reservations$.value.map(r =>
    r.id === reservationId ? { ...r, status: 'confirmada' as const } : r
  );

  this.reservations$.next(updated);
  return of(true);
}




}
