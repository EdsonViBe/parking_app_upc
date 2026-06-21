import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute } from '@angular/router';

import { ParkingService } from '../../services/parking.service';
import { ReservationService } from '../../services/reservation.service';
import { FormPersistenceService } from '../../services/form-persistence.service';
import { ParkingSpace, Reservation } from '../../models/parking.model';

interface NewSpaceFormData {
  title: string;
  address: string;
  district: string;
  price: number;
  type: string;
  totalSpots: number;
  description: string;
  openTime: string;
  closeTime: string;
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
  pendingReservations: Reservation[] = [];

  showAddForm = false;
  accessDeniedRole: string | null = null;
  restoredFromCookie = false;
  formError = '';

  editingSpaceId: number | null = null;

  newSpace: NewSpaceFormData = {
    title: '',
    address: '',
    district: 'Miraflores',
    price: 5,
    type: 'cubierto',
    totalSpots: 1,
    description: '',
    openTime: '08:00',
    closeTime: '20:00'
  };

  editSpace: NewSpaceFormData = {
    title: '',
    address: '',
    district: 'Miraflores',
    price: 5,
    type: 'cubierto',
    totalSpots: 1,
    description: '',
    openTime: '08:00',
    closeTime: '20:00'
  };

  private readonly FORM_KEY = 'nuevo_espacio';

  stats = {
    totalReservations: 47,
    monthlyIncome: 854,
    rating: 4.6,
    activeSpaces: 2
  };

  recentActivity = [
    { user: 'Luis G.', plate: 'ABC-123', date: 'Hoy 09:00', amount: 15, status: 'confirmada' },
    { user: 'Ana T.', plate: 'XYZ-456', date: 'Ayer 14:00', amount: 8, status: 'completada' },
    { user: 'Carlos M.', plate: 'DEF-789', date: 'Lun 10:00', amount: 25, status: 'completada' }
  ];

  constructor(
    private parkingService: ParkingService,
    private reservationService: ReservationService,
    private route: ActivatedRoute,
    private formPersistence: FormPersistenceService
  ) {}

  ngOnInit(): void {
    this.parkingService.getAll().subscribe(spaces => {
      this.mySpaces = spaces.filter(space => space.ownerId === 10);
      this.stats.activeSpaces = this.mySpaces.length;
    });

    this.reservationService.getAll().subscribe(reservations => {
      this.pendingReservations = reservations.filter(res => res.status === 'pendiente');
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
    if (!this.areHoursValid(this.newSpace)) {
      this.formError =
        'Los horarios son inconsistentes o inválidos. Corrige la apertura y el cierre antes de publicar.';
      return;
    }

    const createdSpace: ParkingSpace = {
      id: Date.now(),
      title: this.newSpace.title || 'Nuevo espacio de estacionamiento',
      address: this.newSpace.address || 'Dirección no especificada',
      district: this.newSpace.district,
      price: Number(this.newSpace.price),
      priceDay: Number(this.newSpace.price) * 7,
      rating: 4.5,
      reviews: 0,
      type: this.newSpace.type as any,
      vehicleTypes: ['auto', 'moto'],
      features: ['Publicado desde demo', 'Acceso seguro'],
      available: true,
      totalSpots: Number(this.newSpace.totalSpots),
      availableSpots: Number(this.newSpace.totalSpots),
      lat: -12.0964,
      lng: -77.0428,
      ownerId: 10,
      ownerName: 'Usuario Demo',
      images: [],
      schedule: {
        open: this.newSpace.openTime,
        close: this.newSpace.closeTime
      },
      description:
        this.newSpace.description ||
        'Espacio publicado desde el panel del propietario.'
    };

    this.mySpaces = [createdSpace, ...this.mySpaces];
    this.stats.activeSpaces = this.mySpaces.length;

    this.formError = '';
    alert('✅ Espacio registrado exitosamente.');
    this.showAddForm = false;
    this.formPersistence.clear(this.FORM_KEY);
    this.restoredFromCookie = false;

    this.newSpace = {
      title: '',
      address: '',
      district: 'Miraflores',
      price: 5,
      type: 'cubierto',
      totalSpots: 1,
      description: '',
      openTime: '08:00',
      closeTime: '20:00'
    };
  }

  startEdit(space: ParkingSpace): void {
    this.editingSpaceId = space.id;

    this.editSpace = {
      title: space.title,
      address: space.address,
      district: space.district,
      price: space.price,
      type: space.type,
      totalSpots: space.totalSpots,
      description: space.description,
      openTime: space.schedule.open,
      closeTime: space.schedule.close
    };
  }

  cancelEdit(): void {
    this.editingSpaceId = null;
  }

  saveEdit(): void {
    if (this.editingSpaceId === null) return;

    if (!this.areHoursValid(this.editSpace)) {
      alert('Corrige el horario de apertura y cierre.');
      return;
    }

    this.mySpaces = this.mySpaces.map(space => {
      if (space.id !== this.editingSpaceId) return space;

      return {
        ...space,
        title: this.editSpace.title,
        address: this.editSpace.address,
        district: this.editSpace.district,
        price: Number(this.editSpace.price),
        priceDay: Number(this.editSpace.price) * 7,
        type: this.editSpace.type as any,
        totalSpots: Number(this.editSpace.totalSpots),
        availableSpots: Number(this.editSpace.totalSpots),
        description: this.editSpace.description,
        schedule: {
          open: this.editSpace.openTime,
          close: this.editSpace.closeTime
        }
      };
    });

    this.editingSpaceId = null;
    alert('✅ Espacio actualizado correctamente.');
  }

  approveReservation(id: number): void {
    this.reservationService.approve(id).subscribe(() => {
      this.pendingReservations = this.pendingReservations.filter(res => res.id !== id);
      alert('✅ Reserva aprobada correctamente.');
    });
  }

  cancelReservation(id: number): void {
    if (confirm('¿Deseas cancelar esta reserva del conductor?')) {
      this.reservationService.cancel(id).subscribe(() => {
        this.pendingReservations = this.pendingReservations.filter(res => res.id !== id);
        alert('❌ Reserva cancelada.');
      });
    }
  }

  private areHoursValid(spaceForm: NewSpaceFormData): boolean {
    if (!spaceForm.openTime || !spaceForm.closeTime) return false;

    const [openHour, openMinute] = spaceForm.openTime.split(':').map(Number);
    const [closeHour, closeMinute] = spaceForm.closeTime.split(':').map(Number);

    const open = openHour * 60 + openMinute;
    const close = closeHour * 60 + closeMinute;

    return Number.isFinite(open) && Number.isFinite(close) && close > open;
  }
}