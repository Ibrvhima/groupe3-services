import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Conversation, Message } from '../models';

@Injectable({ providedIn: 'root' })
export class ChatService {
  private api = `${environment.apiUrl}/chat/conversations`;

  readonly nonLus = signal<number>(0);

  constructor(private http: HttpClient) {}

  getConversations(): Observable<Conversation[]> {
    return this.http.get<Conversation[]>(`${this.api}/`);
  }

  ouvrirConversation(demandeId: number): Observable<Conversation> {
    return this.http.post<Conversation>(`${this.api}/ouvrir/`, { demande_id: demandeId });
  }

  getMessages(convId: number): Observable<Message[]> {
    return this.http.get<Message[]>(`${this.api}/${convId}/messages/`);
  }

  envoyerMessage(convId: number, contenu: string): Observable<Message> {
    return this.http.post<Message>(`${this.api}/${convId}/messages/envoyer/`, { contenu });
  }

  rafraichirNonLus(): void {
    this.http.get<Conversation[]>(`${this.api}/`).subscribe({
      next: convs => {
        const total = convs.reduce((sum, c) => sum + c.non_lus, 0);
        this.nonLus.set(total);
      },
    });
  }
}
