import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Conversation, Message } from '../models';

@Injectable({ providedIn: 'root' })
export class ChatService {
  private api = `${environment.apiUrl}/chat/conversations`;

  /** WebSocket de la conversation active. */
  private socket: WebSocket | null = null;

  /** Observable qui émet chaque message reçu en temps réel. */
  private messageSubject = new Subject<Message>();
  public  message$ = this.messageSubject.asObservable();

  /** Compteur de messages non lus (signal réactif). */
  readonly nonLus = signal<number>(0);

  constructor(private http: HttpClient) {}

  // ── REST ─────────────────────────────────────────────────────────────────────

  getConversations(): Observable<Conversation[]> {
    return this.http.get<Conversation[]>(`${this.api}/`);
  }

  ouvrirConversation(demandeId: number): Observable<Conversation> {
    return this.http.post<Conversation>(`${this.api}/ouvrir/`, { demande_id: demandeId });
  }

  getMessages(convId: number): Observable<Message[]> {
    return this.http.get<Message[]>(`${this.api}/${convId}/messages/`);
  }

  /** Fallback HTTP pour envoyer un message quand le WebSocket est indisponible. */
  envoyerMessage(convId: number, contenu: string): Observable<Message> {
    return this.http.post<Message>(`${this.api}/${convId}/messages/envoyer/`, { contenu });
  }

  // ── WebSocket ─────────────────────────────────────────────────────────────────

  /**
   * Ouvre une connexion WebSocket pour la conversation donnée.
   * Le token JWT est passé en query string car WS ne supporte pas les headers custom.
   */
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

  /**
   * Envoie un message via WebSocket (instantané).
   * Retourne true si le message a été envoyé, false si le WebSocket est fermé.
   */
  envoyerViaWebSocket(contenu: string): boolean {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ contenu }));
      return true;
    }
    return false;
  }

  /** Ferme la connexion WebSocket courante proprement. */
  deconnecterWebSocket(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  // ── Utilitaire ────────────────────────────────────────────────────────────────

  rafraichirNonLus(): void {
    this.http.get<Conversation[]>(`${this.api}/`).subscribe({
      next: convs => {
        const total = convs.reduce((sum, c) => sum + c.non_lus, 0);
        this.nonLus.set(total);
      },
    });
  }
}
