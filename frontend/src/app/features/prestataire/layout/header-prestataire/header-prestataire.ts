import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-header-prestataire',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header-prestataire.html',
})
export class HeaderPrestataireComponent {

  menuOpen = false;

  user: any = JSON.parse(localStorage.getItem('user') || '{}');

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  logout() {
    this.authService.logout();
  }
}