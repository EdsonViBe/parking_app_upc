import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../services/auth.service';
import { User } from '../../models/parking.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  currentUser: User | null = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.getCurrentUser().subscribe(user => {
      this.currentUser = user;
    });
  }

  get roleLabel(): string {
    return this.currentUser?.role === 'propietario' ? 'Propietario' : 'Conductor';
  }

  get nextRoleLabel(): string {
    return this.currentUser?.role === 'propietario' ? 'Conductor' : 'Propietario';
  }

  switchRole(): void {
    this.authService.switchRole();

    const updatedUser = this.authService.getCurrentUserValue();

    if (updatedUser?.role === 'propietario') {
      this.router.navigate(['/dashboard-propietario']);
      return;
    }

    this.router.navigate(['/']);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}