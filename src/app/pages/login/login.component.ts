import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FormPersistenceService } from '../../services/form-persistence.service';

interface LoginFormData {
  email: string;
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  email = ''; password = ''; error = ''; loading = false;
  returnUrl: string | null = null;
  restoredFromCookie = false;

  private readonly FORM_KEY = 'login';

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private formPersistence: FormPersistenceService
  ) {}

  ngOnInit(): void {
    this.returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');

    // Restaura el correo ingresado previamente (no la contraseña, por seguridad)
    const saved = this.formPersistence.load<LoginFormData>(this.FORM_KEY);
    if (saved?.email) {
      this.email = saved.email;
      this.restoredFromCookie = true;
    }
  }

  onFieldChange(): void {
    this.formPersistence.save<LoginFormData>(this.FORM_KEY, { email: this.email });
  }

  login(): void {
    if (!this.email || !this.password) { this.error = 'Completa todos los campos.'; return; }
    this.loading = true; this.error = '';
    this.authService.login(this.email, this.password).subscribe(result => {
      this.loading = false;
      if (result.success) {
        this.formPersistence.clear(this.FORM_KEY);
        const role = result.user?.role;
        const ownerOnlyUrl = this.returnUrl === '/dashboard-propietario';
        const driverOnlyUrl = this.returnUrl && ['/buscar', '/mis-reservas'].some(p => this.returnUrl!.startsWith(p));

        // Si el returnUrl no corresponde al rol del usuario, lo mandamos a su zona por defecto
        const returnUrlMatchesRole =
          this.returnUrl &&
          !((role === 'conductor' && ownerOnlyUrl) || (role === 'propietario' && driverOnlyUrl));

        if (returnUrlMatchesRole) {
          this.router.navigateByUrl(this.returnUrl!);
        } else {
          this.router.navigate([role === 'propietario' ? '/dashboard-propietario' : '/']);
        }
      } else { this.error = result.error || 'Error al iniciar sesión'; }
    });
  }

  fillDemo(role: 'conductor' | 'propietario'): void {
    this.email = role === 'conductor' ? 'luis@example.com' : 'carlos@example.com';
    this.password = 'demo123';
    this.onFieldChange();
  }
}
