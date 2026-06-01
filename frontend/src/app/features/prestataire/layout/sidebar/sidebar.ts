import { Component } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../core/services/auth.service';
import { ChatService } from '../../../../core/services/chat.service';
import { NotificationsComponent } from '../../../../shared/notifications/notifications';

@Component({
  selector: 'app-prestataire-sidebar',
  standalone: true,
  imports: [RouterModule, CommonModule, NotificationsComponent],
  templateUrl: './sidebar.html',
})
export class PrestataireSidebarComponent {
  menuOpen = false;
  user: any = JSON.parse(localStorage.getItem('user') || '{}');

  constructor(
    private authService: AuthService,
    public chatService: ChatService,
    private router: Router,
  ) {}

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  logout() {
    this.authService.logout();
  }
}
