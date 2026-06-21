import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { User } from '../models/parking.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUser$ = new BehaviorSubject<User | null>(null);

  private mockUsers: User[] = [
    {
      id: 1,
      name: 'Luis Gutiérrez',
      email: 'luis@example.com',
      role: 'conductor',
      phone: '987654321'
    },
    {
      id: 2,
      name: 'Carlos Mendoza',
      email: 'carlos@example.com',
      role: 'propietario',
      phone: '976543210'
    }
  ];

  constructor() {
    this.loadUserFromStorage();
  }

  login(email: string, password: string): Observable<{ success: boolean; user?: User; error?: string }> {
    const user = this.mockUsers.find(u => u.email === email);

    if (user && password.length >= 6) {
      this.currentUser$.next(user);
      localStorage.setItem('parking_user', JSON.stringify(user));
      return of({ success: true, user });
    }

    return of({ success: false, error: 'Credenciales incorrectas' });
  }

  register(data: {
    name: string;
    email: string;
    password: string;
    role: 'conductor' | 'propietario';
    phone: string;
  }): Observable<{ success: boolean; user?: User; error?: string }> {
    if (this.mockUsers.find(u => u.email === data.email)) {
      return of({ success: false, error: 'El correo ya está registrado' });
    }

    const newUser: User = {
      id: Date.now(),
      name: data.name,
      email: data.email,
      role: data.role,
      phone: data.phone
    };

    this.mockUsers.push(newUser);
    this.currentUser$.next(newUser);
    localStorage.setItem('parking_user', JSON.stringify(newUser));

    return of({ success: true, user: newUser });
  }

  logout(): void {
    this.currentUser$.next(null);
    localStorage.removeItem('parking_user');
  }

  getCurrentUser(): Observable<User | null> {
    return this.currentUser$.asObservable();
  }

  getCurrentUserValue(): User | null {
    return this.currentUser$.value;
  }

  isLoggedIn(): boolean {
    return this.currentUser$.value !== null;
  }

  loadUserFromStorage(): void {
    const stored = localStorage.getItem('parking_user');

    if (stored) {
      this.currentUser$.next(JSON.parse(stored));
    }
  }

  switchRole(): void {
    const user = this.currentUser$.value;

    if (!user) {
      return;
    }

    const updatedUser: User = {
      ...user,
      role: user.role === 'conductor' ? 'propietario' : 'conductor'
    };

    this.currentUser$.next(updatedUser);
    localStorage.setItem('parking_user', JSON.stringify(updatedUser));
  }
}