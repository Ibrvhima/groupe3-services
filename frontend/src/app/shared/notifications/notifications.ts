import { Component, OnInit, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notifications.html',
})
export class NotificationsComponent implements OnInit {

  protected notifService = inject(NotificationService);
  ouvert = false;

  ngOnInit(): void {
    // Charge les notifications dès que le composant s'affiche
    this.notifService.charger();
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
