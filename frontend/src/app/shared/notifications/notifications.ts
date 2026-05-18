import { Component, OnInit, OnDestroy, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notifications.html',
})
export class NotificationsComponent implements OnInit, OnDestroy {

  protected notifService = inject(NotificationService);
  ouvert = false;

  private pollInterval?: ReturnType<typeof setInterval>;

  ngOnInit(): void {
    this.notifService.charger();
    // Rafraîchit le badge toutes les 10 secondes pour détecter les nouveaux messages
    this.pollInterval = setInterval(() => this.notifService.charger(), 10_000);
  }

  ngOnDestroy(): void {
    clearInterval(this.pollInterval);
  }

  toggleDropdown(): void {
    this.ouvert = !this.ouvert;
  }

  marquerToutLu(): void {
    this.notifService.toutMarquerLu();
  }

  /** Ferme le dropdown si on clique en dehors */
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('[data-notif-container]')) {
      this.ouvert = false;
    }
  }
}
