import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DemandeService } from '../../../core/services/demande.service';
import { AvisService } from '../../../core/services/avis.service';
import { HeaderComponent } from '../layout/header/header';
import { ModalAlertComponent } from '../../../shared/components/modal-alert.component';

@Component({
  selector: 'app-mes-demandes',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, HeaderComponent, ModalAlertComponent],
  templateUrl: './mes-demandes.html',
  styleUrls: ['./mes-demandes.css'],
})
export class MesDemandes implements OnInit {
  demandes: any[] = [];
  loading = true;
  errorMessage: string | null = null;
  avisLoading: Record<number, boolean> = {};
  showAvisForm: Record<number, boolean> = {};
  avisData: Record<number, { note: number; commentaire: string }> = {};

  // Modal properties
  modalOpen = false;
  modalTitle = '';
  modalMessage = '';
  modalType: 'success' | 'error' | 'warning' | 'info' = 'info';
  modalIsConfirm = false;
  modalCallback: (() => void) | null = null;

  statusColors: Record<string, { bg: string; text: string; label: string }> = {
    en_attente: { bg: 'bg-yellow-50', text: 'text-yellow-600', label: 'En attente' },
    acceptee: { bg: 'bg-green-50', text: 'text-green-600', label: 'Acceptée' },
    terminee: { bg: 'bg-blue-50', text: 'text-blue-600', label: 'Terminée' },
    annulee: { bg: 'bg-red-50', text: 'text-red-600', label: 'Annulée' },
  };

  constructor(
    private demandeService: DemandeService,
    private avisService: AvisService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.loadDemandes();
  }

  loadDemandes() {
    this.loading = true;
    this.errorMessage = null;
    const token = localStorage.getItem('access_token');
    if (!token) {
      this.errorMessage = 'Vous devez vous reconnecter pour voir vos demandes.';
      this.loading = false;
      return;
    }

    this.demandeService.getMesDemandes().subscribe({
      next: (data: any) => {
        if (Array.isArray(data)) {
          this.demandes = data;
        } else if (data?.results) {
          this.demandes = data.results;
        } else if (data?.demandes) {
          this.demandes = data.demandes;
        } else if (data?.data) {
          this.demandes = data.data;
        } else {
          this.demandes = [];
          this.errorMessage =
            'Réponse serveur inattendue : aucun format de liste de demandes reconnu.';
          console.warn('Réponse inattendue getMesDemandes:', data);
        }
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erreur getMesDemandes:', err);
        console.error('Status:', err.status);
        console.error('Message:', err.message);
        console.error('Body:', err.error);

        if (err.status === 401) {
          this.errorMessage = 'Session expirée. Veuillez vous reconnecter.';
        } else if (err.status === 403) {
          this.errorMessage = 'Accès refusé. Vérifiez votre authentification.';
        } else {
          this.errorMessage = `Erreur: ${err.status} - ${err.error?.detail || err.message || 'Impossible de charger vos demandes'}`;
        }
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  getStatusColor(statut: string) {
    return this.statusColors[statut] || this.statusColors['en_attente'];
  }

  getInitiales(nom?: string, prenom?: string): string {
    const fullName = [nom, prenom].filter(Boolean).join(' ').trim();
    if (!fullName) {
      return '';
    }
    return fullName
      .split(' ')
      .filter(Boolean)
      .map((part) => part[0])
      .join('')
      .toUpperCase();
  }

  peutDonnerAvis(demande: any): boolean {
    return demande.statut === 'terminee' && !demande.avis;
  }

  afficherFormulaireAvis(demandeId: number) {
    this.showAvisForm[demandeId] = true;
    this.avisData[demandeId] = { note: 5, commentaire: '' };
    this.cdr.detectChanges();
  }

  annulerAvis(demandeId: number) {
    this.showAvisForm[demandeId] = false;
    delete this.avisData[demandeId];
    this.cdr.detectChanges();
  }

  annulerDemande(demandeId: number) {
    this.showConfirmModal(
      'Annuler la demande',
      'Êtes-vous sûr de vouloir annuler cette demande ?',
      () => {
        this.demandeService.changerStatut(demandeId, 'annulee').subscribe({
          next: () => {
            this.loadDemandes();
            this.showSuccessModal('Succès', 'Votre demande a été annulée avec succès.');
            this.cdr.detectChanges();
          },
          error: (err) => {
            console.error("Erreur lors de l'annulation:", err);
            this.showErrorModal(
              'Erreur',
              "Impossible d'annuler cette demande. Seules les demandes en attente peuvent être annulées.",
            );
            this.cdr.detectChanges();
          },
        });
      },
    );
  }

  soumettreAvis(demandeId: number) {
    const avis = this.avisData[demandeId];
    if (!avis || avis.note < 1 || avis.note > 5) {
      this.showErrorModal('Erreur', 'Veuillez sélectionner une note entre 1 et 5 étoiles.');
      return;
    }

    this.avisLoading[demandeId] = true;
    this.avisService.donnerAvis(demandeId, avis.note, avis.commentaire).subscribe({
      next: () => {
        this.loadDemandes();
        this.showAvisForm[demandeId] = false;
        delete this.avisData[demandeId];
        this.avisLoading[demandeId] = false;
        this.showSuccessModal('Succès', 'Votre avis a été enregistré avec succès !');
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error("Erreur lors de l'envoi de l'avis:", err);
        this.avisLoading[demandeId] = false;
        this.showErrorModal(
          'Erreur',
          "Une erreur est survenue lors de l'envoi de votre avis. Veuillez réessayer.",
        );
        this.cdr.detectChanges();
      },
    });
  }

  // Modal methods
  showSuccessModal(title: string, message: string) {
    this.modalTitle = title;
    this.modalMessage = message;
    this.modalType = 'success';
    this.modalIsConfirm = false;
    this.modalOpen = true;
  }

  showErrorModal(title: string, message: string) {
    this.modalTitle = title;
    this.modalMessage = message;
    this.modalType = 'error';
    this.modalIsConfirm = false;
    this.modalOpen = true;
  }

  showWarningModal(title: string, message: string) {
    this.modalTitle = title;
    this.modalMessage = message;
    this.modalType = 'warning';
    this.modalIsConfirm = false;
    this.modalOpen = true;
  }

  showConfirmModal(title: string, message: string, callback: () => void) {
    this.modalTitle = title;
    this.modalMessage = message;
    this.modalType = 'warning';
    this.modalIsConfirm = true;
    this.modalCallback = callback;
    this.modalOpen = true;
  }

  onModalConfirm() {
    if (this.modalCallback) {
      this.modalCallback();
      this.modalCallback = null;
    }
  }

  onModalCancel() {
    this.modalCallback = null;
  }

  getStarsArray(): number[] {
    return [1, 2, 3, 4, 5];
  }

  selectNote(demandeId: number, note: number) {
    const avis = this.avisData[demandeId];
    if (avis) {
      avis.note = note;
    }
  }
}
