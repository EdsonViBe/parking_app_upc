import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { SearchComponent } from './pages/search/search.component';
import { ParkingDetailComponent } from './pages/parking-detail/parking-detail.component';
import { BookingComponent } from './pages/booking/booking.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { OwnerDashboardComponent } from './pages/owner-dashboard/owner-dashboard.component';
import { MyReservationsComponent } from './pages/my-reservations/my-reservations.component';
import { authGuard } from './guards/auth.guard';
import { roleGuard } from './guards/role.guard';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'buscar', component: SearchComponent, canActivate: [authGuard, roleGuard], data: { role: 'conductor' } },
  { path: 'parking/:id', component: ParkingDetailComponent, canActivate: [authGuard, roleGuard], data: { role: 'conductor' } },
  { path: 'reservar/:id', component: BookingComponent, canActivate: [authGuard, roleGuard], data: { role: 'conductor' } },
  { path: 'login', component: LoginComponent },
  { path: 'registro', component: RegisterComponent },
  { path: 'dashboard-propietario', component: OwnerDashboardComponent, canActivate: [authGuard, roleGuard], data: { role: 'propietario' } },
  { path: 'mis-reservas', component: MyReservationsComponent, canActivate: [authGuard, roleGuard], data: { role: 'conductor' } },
  { path: '**', redirectTo: '' }
];
