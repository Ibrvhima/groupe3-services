import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Notification } from '../models';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private _notifications = signal<Notification[]>([]);
  readonly nonLues = computed(() => this._notifications().filter(n => !n.lu).length);
  readonly notifications = this._notifications.asReadonly();
  private api = environment.apiUrl;

  constructor(private http: HttpClient) {}

  charger(): void {
    this.http.get<Notification[]>(`${this.api}/notifications/`).subscribe({
      next: data => this._notifications.set(data),
    });
  }

  toutMarquerLu(): void {
    this.http.post(`${this.api}/notifications/lire/`, {}).subscribe({
      next: () => this._notifications.update(list =>
        list.map(n => ({ ...n, lu: true }))
      ),
    });
  }

  marquerLue(id: number): void {
    this.http.post<Notification>(`${this.api}/notifications/${id}/lire/`, {}).subscribe({
      next: updated => this._notifications.update(list =>
        list.map(n => n.id === updated.id ? updated : n)
      ),
    });
  }
}
