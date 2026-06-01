import {
  Component, OnInit, OnDestroy, AfterViewChecked,
  ViewChild, ElementRef, ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { ChatService } from '../../../core/services/chat.service';
import { PrestataireSidebarComponent } from '../layout/sidebar/sidebar';
import { Conversation, Message } from '../../../core/models';

@Component({
  selector:    'app-chat-prestataire',
  standalone:  true,
  imports:     [CommonModule, FormsModule, PrestataireSidebarComponent],
  templateUrl: './chat.html',
})
export class ChatPrestataireComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('messagesEnd') private messagesEnd!: ElementRef;

  conversations: Conversation[]      = [];
  convActive:    Conversation | null = null;
  messages:      Message[]           = [];
  contenu        = '';
  loading        = true;
  sending        = false;

  currentUser: any = JSON.parse(localStorage.getItem('user') || '{}');

  private wsSub!:       Subscription;
  private shouldScroll = false;

  constructor(
    private chatService: ChatService,
    private route:       ActivatedRoute,
    private cdr:         ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.chargerConversations();

    const demandeId = this.route.snapshot.queryParamMap.get('demandeId');
    if (demandeId) {
      this.chatService.ouvrirConversation(+demandeId).subscribe({
        next: conv => {
          this.selectionner(conv);
          this.chargerConversations();
        },
        error: (err) => {
          console.error('Erreur ouverture conversation', err);
          this.loading = false;
          this.cdr.detectChanges();
        },
      });
    }
  }

  ngOnDestroy(): void {
    this.wsSub?.unsubscribe();
    this.chatService.deconnecterWebSocket();
  }

  ngAfterViewChecked(): void {
    if (this.shouldScroll) {
      this.scrollBas();
      this.shouldScroll = false;
    }
  }

  chargerConversations(): void {
    this.chatService.getConversations().subscribe({
      next: convs => {
        this.conversations = convs;
        this.loading       = false;
        this.cdr.detectChanges();
      },
      error: () => { this.loading = false; this.cdr.detectChanges(); },
    });
  }

  selectionner(conv: Conversation): void {
    this.convActive = conv;
    this.messages   = [];
    this.cdr.detectChanges();

    this.wsSub?.unsubscribe();
    this.chatService.deconnecterWebSocket();
    this.chargerMessages();

    this.chatService.connecterWebSocket(conv.id);
    this.wsSub = this.chatService.message$.subscribe(msg => {
      if (!this.messages.find(m => m.id === msg.id)) {
        this.messages     = [...this.messages, msg];
        this.shouldScroll = true;
        this.conversations = this.conversations.map(c =>
          c.id === this.convActive!.id ? { ...c, non_lus: 0 } : c
        );
        this.cdr.detectChanges();
      }
    });
  }

  chargerMessages(): void {
    if (!this.convActive) return;
    this.chatService.getMessages(this.convActive.id).subscribe({
      next: msgs => {
        this.messages     = msgs;
        this.shouldScroll = true;
        this.conversations = this.conversations.map(c =>
          c.id === this.convActive!.id ? { ...c, non_lus: 0 } : c
        );
        this.cdr.detectChanges();
      },
    });
  }

  envoyer(): void {
    const texte = this.contenu.trim();
    if (!texte || this.sending || !this.convActive) return;

    const sent = this.chatService.envoyerViaWebSocket(texte);

    if (sent) {
      const msgLocal: any = {
        id:         Date.now(),
        contenu:    texte,
        date_envoi: new Date().toISOString(),
        lu:         false,
        expediteur: {
          id:     this.currentUser.id,
          nom:    this.currentUser.nom,
          prenom: this.currentUser.prenom,
          photo:  this.currentUser.photo || null,
        },
      };
      this.messages     = [...this.messages, msgLocal];
      this.contenu      = '';
      this.shouldScroll = true;
      this.cdr.detectChanges();
    } else {
      this.sending = true;
      this.chatService.envoyerMessage(this.convActive.id, texte).subscribe({
        next: msg => {
          this.messages     = [...this.messages, msg];
          this.contenu      = '';
          this.sending      = false;
          this.shouldScroll = true;
          this.cdr.detectChanges();
        },
        error: () => { this.sending = false; this.cdr.detectChanges(); },
      });
    }
  }

  onEnter(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.envoyer();
    }
  }

  interlocuteur(conv: Conversation): string {
    const moi = this.currentUser?.id;
    const c   = conv.client;
    const p   = conv.prestataire;
    const u   = moi === c.id ? p : c;
    return `${u.nom} ${u.prenom}`;
  }

  retourListe(): void {
    this.convActive = null;
    this.wsSub?.unsubscribe();
    this.chatService.deconnecterWebSocket();
    this.cdr.detectChanges();
  }

  isFromMe(msg: Message): boolean {
    return msg.expediteur.id === this.currentUser?.id;
  }

  avatarColor(conv: Conversation): string {
    const colors = ['bg-blue-500', 'bg-purple-500', 'bg-green-600', 'bg-teal-500', 'bg-indigo-500', 'bg-pink-500'];
    const nom = this.interlocuteur(conv);
    const idx = nom.charCodeAt(0) % colors.length;
    return colors[idx] ?? 'bg-blue-500';
  }

  private scrollBas(): void {
    try { this.messagesEnd?.nativeElement?.scrollIntoView({ behavior: 'smooth' }); } catch {}
  }
}
