import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../core/services/auth.service';
import { ChatService } from '../../../../core/services/chat.service';
import { NotificationsComponent } from '../../../../shared/notifications/notifications';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule, CommonModule, NotificationsComponent],
  templateUrl: './header.html',
})
export class HeaderComponent implements OnInit, OnDestroy {
  menuOpen = false;
  user: any = JSON.parse(localStorage.getItem('user') || '{}');

  private pollInterval: any;

  constructor(
    private authService: AuthService,
    private router: Router,
    public chatService: ChatService,
  ) {}

  ngOnInit(): void {
    this.chatService.rafraichirNonLus();
    this.pollInterval = setInterval(() => this.chatService.rafraichirNonLus(), 10_000);
  }

  ngOnDestroy(): void {
    clearInterval(this.pollInterval);
  }

  toggleMenu() { this.menuOpen = !this.menuOpen; }
  logout()     { this.authService.logout(); }
}
