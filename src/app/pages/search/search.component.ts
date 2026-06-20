import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { ParkingService } from '../../services/parking.service';
import { FormPersistenceService } from '../../services/form-persistence.service';
import { ParkingSpace, SearchFilters } from '../../models/parking.model';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {
  results: ParkingSpace[] = [];
  loading = false;
  districts: string[] = [];
  filters: SearchFilters = { query: '', vehicleType: '', maxPrice: 20, type: '', district: '', minRating: 0 };
  sortBy = 'rating';
  restoredFromCookie = false;

  private readonly FORM_KEY = 'busqueda';

  constructor(
    private parkingService: ParkingService,
    private route: ActivatedRoute,
    private formPersistence: FormPersistenceService
  ) {}

  ngOnInit(): void {
    this.districts = this.parkingService.getDistricts();

    // Restaura los últimos filtros usados, si los hay
    const saved = this.formPersistence.load<SearchFilters>(this.FORM_KEY);
    if (saved) {
      this.filters = { ...this.filters, ...saved };
      this.restoredFromCookie = true;
    }

    this.route.queryParams.subscribe(params => {
      if (params['q']) { this.filters.query = params['q']; }
      this.doSearch();
    });
  }

  onFiltersChange(): void {
    this.formPersistence.save<SearchFilters>(this.FORM_KEY, this.filters);
    this.doSearch();
  }

  doSearch(): void {
    this.loading = true;
    this.formPersistence.save<SearchFilters>(this.FORM_KEY, this.filters);
    this.parkingService.search(this.filters).subscribe(results => {
      this.results = this.sortResults(results);
      this.loading = false;
    });
  }

  sortResults(list: ParkingSpace[]): ParkingSpace[] {
    return [...list].sort((a, b) => {
      if (this.sortBy === 'price') return a.price - b.price;
      if (this.sortBy === 'rating') return b.rating - a.rating;
      return 0;
    });
  }

  onSortChange(): void { this.results = this.sortResults(this.results); }
  clearFilters(): void {
    this.filters = { query: '', vehicleType: '', maxPrice: 20, type: '', district: '', minRating: 0 };
    this.formPersistence.clear(this.FORM_KEY);
    this.doSearch();
  }
}
