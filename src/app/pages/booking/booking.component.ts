import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ParkingService } from '../../services/parking.service';
import { AuthService } from '../../services/auth.service';
import { ReservationService } from '../../services/reservation.service';
import { FormPersistenceService } from '../../services/form-persistence.service';
import { ParkingSpace, User } from '../../models/parking.model';

interface BookingFormData {
  date: string; startTime: string; endTime: string;
  vehiclePlate: string; vehicleType: string; paymentMethod: string;
}

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './booking.component.html',
  styleUrls: ['./booking.component.scss']
})
export class BookingComponent implements OnInit {
  space: ParkingSpace | undefined;
  loading = false;
  submitted = false;
  error = '';
  currentUser: User | null = null;
  restoredFromCookie = false;

  form: BookingFormData = {
    date: '', startTime: '09:00', endTime: '11:00',
    vehiclePlate: '', vehicleType: 'auto', paymentMethod: 'tarjeta'
  };

  private formKey = '';

  get hours(): number {
    if (!this.form.startTime || !this.form.endTime) return 0;
    const [sh, sm] = this.form.startTime.split(':').map(Number);
    const [eh, em] = this.form.endTime.split(':').map(Number);
    const diff = (eh * 60 + em) - (sh * 60 + sm);
    return Math.max(0, diff / 60);
  }

  get totalPrice(): number {
    return this.space ? this.hours * this.space.price : 0;
  }

  get minDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private parkingService: ParkingService,
    private authService: AuthService,
    private reservationService: ReservationService,
    private formPersistence: FormPersistenceService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.formKey = `reserva_${id}`;
    this.parkingService.getById(id).subscribe(space => this.space = space);
    this.authService.getCurrentUser().subscribe(u => this.currentUser = u);

    const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
    this.form.date = tomorrow.toISOString().split('T')[0];

    // Restaura los datos que el usuario ya había ingresado para esta reserva
    const saved = this.formPersistence.load<BookingFormData>(this.formKey);
    if (saved) {
      this.form = { ...this.form, ...saved };
      this.restoredFromCookie = true;
    }
  }

  onFieldChange(): void {
    this.formPersistence.save<BookingFormData>(this.formKey, this.form);
  }

  confirm(): void {
    if (!this.authService.isLoggedIn()) { this.router.navigate(['/login']); return; }
    if (!this.form.date || this.hours <= 0 || !this.form.vehiclePlate) {
      this.error = 'Por favor completa todos los campos correctamente.';
      return;
    }
    this.loading = true; this.error = '';
    this.reservationService.create({
      parkingId: this.space!.id,
      parkingTitle: this.space!.title,
      parkingAddress: this.space!.address,
      userId: this.currentUser!.id,
      date: this.form.date,
      startTime: this.form.startTime,
      endTime: this.form.endTime,
      hours: this.hours,
      totalPrice: this.totalPrice,
      status: 'confirmada',
      vehiclePlate: this.form.vehiclePlate,
      vehicleType: this.form.vehicleType
    }).subscribe(() => {
      this.loading = false;
      this.submitted = true;
      this.formPersistence.clear(this.formKey);
    });
  }
}
