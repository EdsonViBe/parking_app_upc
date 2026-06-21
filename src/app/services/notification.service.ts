import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  notifyReservationConfirmed(): Observable<{ success: boolean; incidentId?: number }> {
    return of({ success: false, incidentId: Date.now() });
  }
}
