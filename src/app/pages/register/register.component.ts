import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FormPersistenceService } from '../../services/form-persistence.service';

interface RegisterFormData {
  name: string;
  email: string;
  phone: string;
  role: 'conductor' | 'propietario';
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  form = { name: '', email: '', phone: '', password: '', confirmPassword: '', role: 'conductor' as 'conductor' | 'propietario' };
  error = ''; loading = false;
  restoredFromCookie = false;

  private readonly FORM_KEY = 'registro';

  constructor(
    private authService: AuthService,
    private router: Router,
    private formPersistence: FormPersistenceService
  ) {}

  ngOnInit(): void {
    const saved = this.formPersistence.load<RegisterFormData>(this.FORM_KEY);
    if (saved) {
      this.form.name = saved.name || '';
      this.form.email = saved.email || '';
      this.form.phone = saved.phone || '';
      this.form.role = saved.role || 'conductor';
      this.restoredFromCookie = !!(saved.name || saved.email || saved.phone);
    }
  }

  onFieldChange(): void {
    this.formPersistence.save<RegisterFormData>(this.FORM_KEY, {
      name: this.form.name, email: this.form.email, phone: this.form.phone, role: this.form.role
    });
  }

  register(): void {
    if (!this.form.name || !this.form.email || !this.form.password) { this.error = 'Completa todos los campos obligatorios.'; return; }
    if (this.form.password !== this.form.confirmPassword) { this.error = 'Las contraseñas no coinciden.'; return; }
    if (this.form.password.length < 6) { this.error = 'La contraseña debe tener al menos 6 caracteres.'; return; }
    this.loading = true; this.error = '';
    this.authService.register(this.form).subscribe(result => {
      this.loading = false;
      if (result.success) {
        this.formPersistence.clear(this.FORM_KEY);
        this.router.navigate([this.form.role === 'propietario' ? '/dashboard-propietario' : '/']);
      }
      else { this.error = result.error || 'Error al registrarse'; }
    });
  }
}
