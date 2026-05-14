import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../core/services/auth.service';
import { NotificationsComponent } from '../../../../shared/notifications/notifications';

@Component({
  selector: 'app-prestataire-header',
  standalone: true,
  imports: [RouterModule, CommonModule, NotificationsComponent],
  templateUrl: './header.html',
})
export class PrestataireHeaderComponent {
  menuOpen = false;
  user: any = JSON.parse(localStorage.getItem('user') || '{}');

  constructor(private authService: AuthService) {}

  toggleMenu() { this.menuOpen = !this.menuOpen; }
  logout()     { this.authService.logout(); }
}
