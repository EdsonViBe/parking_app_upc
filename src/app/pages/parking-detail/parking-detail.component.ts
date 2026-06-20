import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ParkingService } from '../../services/parking.service';
import { ParkingSpace } from '../../models/parking.model';

@Component({
  selector: 'app-parking-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './parking-detail.component.html',
  styleUrls: ['./parking-detail.component.scss']
})
export class ParkingDetailComponent implements OnInit {
  space: ParkingSpace | undefined;
  loading = true;

  reviews = [
    { user: 'Carlos M.', avatar: 'C', rating: 5, date: 'Hace 2 días', comment: 'Excelente lugar, muy seguro y el propietario fue muy amable. Definitivamente volvería.' },
    { user: 'Ana T.', avatar: 'A', rating: 4, date: 'Hace 1 semana', comment: 'Buena ubicación, el espacio es amplio. Solo faltaría mejor señalización de entrada.' },
    { user: 'Marco R.', avatar: 'M', rating: 5, date: 'Hace 2 semanas', comment: 'Perfecto para trabajar en la zona. Lo reservo casi a diario, nunca he tenido problemas.' }
  ];

  constructor(private route: ActivatedRoute, private parkingService: ParkingService) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.parkingService.getById(id).subscribe(space => {
      this.space = space;
      this.loading = false;
    });
  }

  getStars(rating: number): string { return '★'.repeat(Math.round(rating)) + '☆'.repeat(5 - Math.round(rating)); }
}
