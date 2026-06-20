import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CookieService } from '../../services/cookie.service';

@Component({
  selector: 'app-cookie-banner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cookie-banner.component.html',
  styleUrls: ['./cookie-banner.component.scss']
})
export class CookieBannerComponent implements OnInit {
  visible = false;
  private readonly ACCEPT_KEY = 'pkv2_cookies_aceptadas';

  constructor(private cookieService: CookieService) {}

  ngOnInit(): void {
    this.visible = !this.cookieService.has(this.ACCEPT_KEY);
  }

  accept(): void {
    this.cookieService.set(this.ACCEPT_KEY, 'true', 365);
    this.visible = false;
  }
}
