import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ParkingService } from '../../services/parking.service';
import { AuthService } from '../../services/auth.service';
import { ReservationService } from '../../services/reservation.service';
import { FormPersistenceService } from '../../services/form-persistence.service';
import { NotificationService } from '../../services/notification.service';
import { ParkingSpace, User } from '../../models/parking.model';

interface BookingFormData {
  date: string; startTime: string; endTime: string;
  vehiclePlate: string; vehicleType: string; paymentMethod: string;
  cardNumber: string; cardName: string; cardExpiry: string; cardCvv: string;
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
  notificationError = '';
  currentUser: User | null = null;
  restoredFromCookie = false;

  form: BookingFormData = {
    date: '', startTime: '09:00', endTime: '11:00',
    vehiclePlate: '', vehicleType: 'auto', paymentMethod: 'tarjeta',
    cardNumber: '', cardName: '', cardExpiry: '', cardCvv: ''
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

  get isCardPayment(): boolean {
    return this.form.paymentMethod === 'tarjeta' || this.form.paymentMethod === 'tarjeta_rechazada';
  }

  get cardBrand(): string {
    const clean = this.form.cardNumber.replace(/\D/g, '');
    if (clean.startsWith('4')) return 'Visa';
    if (/^5[1-5]/.test(clean)) return 'Mastercard';
    if (/^3[47]/.test(clean)) return 'Amex';
    return 'Tarjeta';
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private parkingService: ParkingService,
    private authService: AuthService,
    private reservationService: ReservationService,
    private formPersistence: FormPersistenceService,
    private notificationService: NotificationService
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
    const { cardNumber, cardCvv, ...safeForm } = this.form;
    this.formPersistence.save(this.formKey, { ...safeForm, cardNumber: '', cardCvv: '' });
  }

  onCardNumberChange(value: string): void {
    const clean = value.replace(/\D/g, '').slice(0, 16);
    this.form.cardNumber = clean.replace(/(.{4})/g, '$1 ').trim();
    this.onFieldChange();
  }

  onExpiryChange(value: string): void {
    const clean = value.replace(/\D/g, '').slice(0, 4);
    this.form.cardExpiry = clean.length > 2 ? `${clean.slice(0, 2)}/${clean.slice(2)}` : clean;
    this.onFieldChange();
  }

  onCvvChange(value: string): void {
    this.form.cardCvv = value.replace(/\D/g, '').slice(0, 4);
  }

  confirm(): void {
    if (!this.authService.isLoggedIn()) { this.router.navigate(['/login']); return; }
    if (this.isCardPayment && !this.isCardFormValid()) {
      this.error = 'Completa los datos de la tarjeta antes de continuar.';
      return;
    }
    if (this.form.paymentMethod === 'tarjeta_rechazada') {
      this.error = 'El método de pago fue rechazado. Elige otro método de pago para continuar.';
      return;
    }
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
      this.notificationService.notifyReservationConfirmed().subscribe(result => {
        this.loading = false;
        this.submitted = true;
        this.formPersistence.clear(this.formKey);
        if (!result.success) {
          this.notificationError = `No pudimos enviar la notificación. Registramos el incidente #${result.incidentId} y reintentaremos el envío posteriormente.`;
        }
      });
    });
  }

  private isCardFormValid(): boolean {
    const digits = this.form.cardNumber.replace(/\D/g, '');
    return digits.length >= 13 &&
      this.form.cardName.trim().length >= 3 &&
      /^(0[1-9]|1[0-2])\/\d{2}$/.test(this.form.cardExpiry) &&
      /^\d{3,4}$/.test(this.form.cardCvv);
  }
}
