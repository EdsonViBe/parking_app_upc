import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { ParkingService } from '../../services/parking.service';
import { FormPersistenceService } from '../../services/form-persistence.service';
import { ParkingSpace } from '../../models/parking.model';

interface NewSpaceFormData {
  title: string; address: string; district: string; price: number; type: string;
  totalSpots: number; description: string; openTime: string; closeTime: string;
}

@Component({
  selector: 'app-owner-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './owner-dashboard.component.html',
  styleUrls: ['./owner-dashboard.component.scss']
})
export class OwnerDashboardComponent implements OnInit {
  mySpaces: ParkingSpace[] = [];
  showAddForm = false;
  accessDeniedRole: string | null = null;
  restoredFromCookie = false;
  formError = '';

  newSpace: NewSpaceFormData = {
    title: '', address: '', district: 'Miraflores', price: 5, type: 'cubierto',
    totalSpots: 1, description: '', openTime: '08:00', closeTime: '20:00'
  };

  private readonly FORM_KEY = 'nuevo_espacio';

  stats = { totalReservations: 47, monthlyIncome: 854, rating: 4.6, activeSpaces: 2 };

  recentActivity = [
    { user: 'Luis G.', plate: 'ABC-123', date: 'Hoy 09:00', amount: 15, status: 'confirmada' },
    { user: 'Ana T.', plate: 'XYZ-456', date: 'Ayer 14:00', amount: 8, status: 'completada' },
    { user: 'Carlos M.', plate: 'DEF-789', date: 'Lun 10:00', amount: 25, status: 'completada' }
  ];

  constructor(
    private parkingService: ParkingService,
    private route: ActivatedRoute,
    private formPersistence: FormPersistenceService
  ) {}

  ngOnInit(): void {
    this.parkingService.getAll().subscribe(spaces => {
      this.mySpaces = spaces.filter(s => s.ownerId === 10);
    });
    this.accessDeniedRole = this.route.snapshot.queryParamMap.get('accesoDenegado');

    const saved = this.formPersistence.load<NewSpaceFormData>(this.FORM_KEY);
    if (saved) {
      this.newSpace = saved;
      this.restoredFromCookie = true;
    }
  }

  onFieldChange(): void {
    this.formPersistence.save<NewSpaceFormData>(this.FORM_KEY, this.newSpace);
  }

  toggleAddForm(): void {
    this.showAddForm = !this.showAddForm;
  }

  addSpace(): void {
    if (!this.areHoursValid()) {
      this.formError = 'Los horarios son inconsistentes o inválidos. Corrige la apertura y el cierre antes de publicar.';
      return;
    }

    this.formError = '';
    alert('✅ Espacio registrado exitosamente (demo). En producción se guardaría en la base de datos.');
    this.showAddForm = false;
    this.formPersistence.clear(this.FORM_KEY);
    this.restoredFromCookie = false;
    this.newSpace = {
      title: '', address: '', district: 'Miraflores', price: 5, type: 'cubierto',
      totalSpots: 1, description: '', openTime: '08:00', closeTime: '20:00'
    };
  }

  private areHoursValid(): boolean {
    if (!this.newSpace.openTime || !this.newSpace.closeTime) return false;
    const [openHour, openMinute] = this.newSpace.openTime.split(':').map(Number);
    const [closeHour, closeMinute] = this.newSpace.closeTime.split(':').map(Number);
    const open = openHour * 60 + openMinute;
    const close = closeHour * 60 + closeMinute;
    return Number.isFinite(open) && Number.isFinite(close) && close > open;
  }
}
