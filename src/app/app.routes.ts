import { Routes } from '@angular/router';

import { HomeComponent } from './pages/home/home.component';
import { SearchComponent } from './pages/search/search.component';
import { ParkingDetailComponent } from './pages/parking-detail/parking-detail.component';
import { BookingComponent } from './pages/booking/booking.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { OwnerDashboardComponent } from './pages/owner-dashboard/owner-dashboard.component';
import { MyReservationsComponent } from './pages/my-reservations/my-reservations.component';
import { ProfileComponent } from './pages/profile/profile.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'buscar', component: SearchComponent },
  { path: 'parking/:id', component: ParkingDetailComponent },
  { path: 'reservar/:id', component: BookingComponent },
  { path: 'login', component: LoginComponent },
  { path: 'registro', component: RegisterComponent },
  { path: 'dashboard-propietario', component: OwnerDashboardComponent },
  { path: 'mis-reservas', component: MyReservationsComponent },
  { path: 'perfil', component: ProfileComponent },
  { path: '**', redirectTo: '' }
];