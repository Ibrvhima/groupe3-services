import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-admin-header',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './header.html',
})
export class AdminHeaderComponent {
  menuOpen = false;
  user: any = JSON.parse(localStorage.getItem('user') || '{}');

  constructor(private authService: AuthService) {}

  toggleMenu() { this.menuOpen = !this.menuOpen; }
  logout()     { this.authService.logout(); }
}
