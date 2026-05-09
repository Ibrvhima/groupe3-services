import { Component } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './sidebar.html',
})
export class SidebarComponent {
  menuOpen = false;
  user: any = JSON.parse(localStorage.getItem('user') || '{}');

  menuItems = [
    { label: 'Dashboard', icon: 'home', route: '/admin' },
    { label: 'Utilisateurs', icon: 'users', route: '/admin/utilisateurs' },
    { label: 'Prestataires', icon: 'briefcase', route: '/admin/prestataires' },
    { label: 'Signalements', icon: 'flag', route: '/admin/signalements' },
  ];

  constructor(private authService: AuthService, private router: Router) {}

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  logout() {
    this.authService.logout();
  }
}