import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Conversation, Message } from '../models';

@Injectable({ providedIn: 'root' })
export class ChatService {
  private api = `${environment.apiUrl}/chat/conversations`;
  private socket: WebSocket | null = null;
  private messageSubject = new Subject<Message>();
  public  message$ = this.messageSubject.asObservable();
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

  connecterWebSocket(convId: number): void {
    this.deconnecterWebSocket();

    const token  = localStorage.getItem('access_token') ?? '';
    const wsBase = environment.wsUrl
      || `${location.protocol === 'https:' ? 'wss:' : 'ws:'}//${location.host}`;
    const wsUrl  = `${wsBase}/ws/chat/${convId}/?token=${token}`;

    this.socket = new WebSocket(wsUrl);

    this.socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'message') {
          this.messageSubject.next(data.message as Message);
        }
      } catch { /* JSON invalide, on ignore */ }
    };

    this.socket.onerror = () => {
      console.warn('WebSocket indisponible, mode HTTP activé.');
    };
  }

  envoyerViaWebSocket(contenu: string): boolean {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ contenu }));
      return true;
    }
    return false;
  }

  deconnecterWebSocket(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
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
