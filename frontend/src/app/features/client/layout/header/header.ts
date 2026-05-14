import { Component } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../core/services/auth.service';
import { NotificationsComponent } from '../../../../shared/notifications/notifications';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule, CommonModule, NotificationsComponent],
  templateUrl: './header.html',
})
export class HeaderComponent {
  menuOpen = false;
  user: any = JSON.parse(localStorage.getItem('user') || '{}');

  constructor(private authService: AuthService, private router: Router) {}

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  logout() {
    this.authService.logout();
  }
}