export interface ParkingSpace {
  id: number;
  title: string;
  address: string;
  district: string;
  price: number; // por hora en soles
  priceDay?: number;
  rating: number;
  reviews: number;
  type: 'cubierto' | 'descubierto' | 'mixto';
  vehicleTypes: ('auto' | 'moto' | 'bicicleta')[];
  features: string[];
  available: boolean;
  totalSpots: number;
  availableSpots: number;
  lat: number;
  lng: number;
  ownerId: number;
  ownerName: string;
  images: string[];
  schedule: { open: string; close: string };
  description: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'conductor' | 'propietario';
  phone?: string;
  avatar?: string;
}

export interface Reservation {
  id: number;
  parkingId: number;
  parkingTitle: string;
  parkingAddress: string;
  userId: number;
  date: string;
  startTime: string;
  endTime: string;
  hours: number;
  totalPrice: number;
  status: 'pendiente' | 'confirmada' | 'completada' | 'cancelada';
  vehiclePlate: string;
  vehicleType: string;
  createdAt: string;
}

export interface SearchFilters {
  query: string;
  vehicleType: string;
  maxPrice: number;
  type: string;
  district: string;
  minRating: number;
}
