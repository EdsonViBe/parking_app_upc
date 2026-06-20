import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { ParkingSpace, SearchFilters } from '../models/parking.model';

@Injectable({ providedIn: 'root' })
export class ParkingService {
  private parkingSpaces: ParkingSpace[] = [
    {
      id: 1, title: 'Cochera San Isidro Centro', address: 'Av. Conquistadores 850', district: 'San Isidro',
      price: 5, priceDay: 35, rating: 4.8, reviews: 124, type: 'cubierto',
      vehicleTypes: ['auto', 'moto'], features: ['Techado', 'Cámara de seguridad', 'Acceso 24h', 'Iluminación LED'],
      available: true, totalSpots: 5, availableSpots: 2, lat: -12.0964, lng: -77.0428,
      ownerId: 10, ownerName: 'Carlos Mendoza', images: [], schedule: { open: '06:00', close: '23:00' },
      description: 'Espacio seguro y techado en el corazón de San Isidro, a pasos de las principales empresas financieras.'
    },
    {
      id: 2, title: 'Garaje Miraflores - Óvalo Gutiérrez', address: 'Jr. Schell 325', district: 'Miraflores',
      price: 4, priceDay: 28, rating: 4.5, reviews: 87, type: 'descubierto',
      vehicleTypes: ['auto', 'moto', 'bicicleta'], features: ['Vigilancia', 'Cámara de seguridad', 'Fácil acceso'],
      available: true, totalSpots: 8, availableSpots: 5, lat: -12.1211, lng: -77.0291,
      ownerId: 11, ownerName: 'Ana Torres', images: [], schedule: { open: '07:00', close: '22:00' },
      description: 'Amplio garaje en Miraflores, ideal para visitar el Óvalo Gutiérrez, restaurantes y tiendas de la zona.'
    },
    {
      id: 3, title: 'Cochera Barranco - Zona Bares', address: 'Av. Grau 266', district: 'Barranco',
      price: 3.5, priceDay: 25, rating: 4.2, reviews: 56, type: 'mixto',
      vehicleTypes: ['auto', 'moto'], features: ['Vigilante nocturno', 'Acceso nocturno', 'Cerca de bares'],
      available: true, totalSpots: 10, availableSpots: 7, lat: -12.1503, lng: -77.0224,
      ownerId: 12, ownerName: 'Roberto Silva', images: [], schedule: { open: '18:00', close: '04:00' },
      description: 'Perfecto para salidas nocturnas en Barranco. Vigilante toda la noche.'
    },
    {
      id: 4, title: 'Parqueo UPC Monterrico', address: 'Av. La Fontana 550', district: 'La Molina',
      price: 2, priceDay: 15, rating: 4.6, reviews: 210, type: 'cubierto',
      vehicleTypes: ['auto', 'moto', 'bicicleta'], features: ['Techado', 'Estacionamiento para motos', 'Bicicletero', 'Económico'],
      available: true, totalSpots: 20, availableSpots: 12, lat: -12.0836, lng: -76.9613,
      ownerId: 13, ownerName: 'María Quispe', images: [], schedule: { open: '06:00', close: '22:00' },
      description: 'Económico y seguro, ideal para estudiantes universitarios cerca del campus.'
    },
    {
      id: 5, title: 'Cochera Centro Histórico', address: 'Jr. de la Unión 450', district: 'Lima Cercado',
      price: 3, priceDay: 20, rating: 3.9, reviews: 45, type: 'cubierto',
      vehicleTypes: ['auto'], features: ['Techado', 'Cerca de monumentos', 'Vigilancia'],
      available: false, totalSpots: 6, availableSpots: 0, lat: -12.0464, lng: -77.0282,
      ownerId: 14, ownerName: 'Pedro Vargas', images: [], schedule: { open: '08:00', close: '20:00' },
      description: 'Ubicado en el Centro Histórico de Lima, ideal para turistas que visitan monumentos y museos.'
    },
    {
      id: 6, title: 'Garage Aeropuerto Jorge Chávez', address: 'Av. Elmer Faucett 390', district: 'Callao',
      price: 4.5, priceDay: 30, rating: 4.7, reviews: 302, type: 'cubierto',
      vehicleTypes: ['auto', 'moto'], features: ['Techado', 'Acceso 24h', 'Shuttle al aeropuerto', 'Cámara de seguridad', 'Tarifa diaria especial'],
      available: true, totalSpots: 30, availableSpots: 8, lat: -12.0219, lng: -77.1143,
      ownerId: 15, ownerName: 'Luis Fernández', images: [], schedule: { open: '00:00', close: '23:59' },
      description: 'A solo 5 minutos del aeropuerto. Servicio de shuttle incluido. Reserva con anticipación.'
    }
  ];

  private searchFilters$ = new BehaviorSubject<SearchFilters>({
    query: '', vehicleType: '', maxPrice: 20, type: '', district: '', minRating: 0
  });

  getAll(): Observable<ParkingSpace[]> {
    return of(this.parkingSpaces);
  }

  getById(id: number): Observable<ParkingSpace | undefined> {
    return of(this.parkingSpaces.find(p => p.id === id));
  }

  search(filters: SearchFilters): Observable<ParkingSpace[]> {
    let results = [...this.parkingSpaces];
    if (filters.query) {
      const q = filters.query.toLowerCase();
      results = results.filter(p =>
        p.title.toLowerCase().includes(q) || p.address.toLowerCase().includes(q) ||
        p.district.toLowerCase().includes(q)
      );
    }
    if (filters.vehicleType) results = results.filter(p => p.vehicleTypes.includes(filters.vehicleType as any));
    if (filters.type) results = results.filter(p => p.type === filters.type);
    if (filters.district) results = results.filter(p => p.district === filters.district);
    if (filters.maxPrice > 0) results = results.filter(p => p.price <= filters.maxPrice);
    if (filters.minRating > 0) results = results.filter(p => p.rating >= filters.minRating);
    return of(results);
  }

  getDistricts(): string[] {
    return [...new Set(this.parkingSpaces.map(p => p.district))];
  }

  getFeatured(): Observable<ParkingSpace[]> {
    return of(this.parkingSpaces.filter(p => p.available && p.rating >= 4.5));
  }

  updateFilters(filters: Partial<SearchFilters>): void {
    this.searchFilters$.next({ ...this.searchFilters$.value, ...filters });
  }

  getFilters(): Observable<SearchFilters> {
    return this.searchFilters$.asObservable();
  }
}
