import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { HeaderComponent } from '../layout/header/header';
import { ModalAlertComponent } from '../../../shared/components/modal-alert.component';
import { DemandeService } from '../../../core/services/demande.service';
import { PrestataireService } from '../../../core/services/prestataire.service';

@Component({
  selector: 'app-demande-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, HeaderComponent, ModalAlertComponent],
  templateUrl: './demande-form.html',
})
export class DemandeFormComponent implements OnInit {
  prestataire: any = null;
  description = '';
  date_intervention = '';
  error = '';
  loading = false;
  prestataireUuid = '';
  private redirectTimeout: any;

  // Modal properties
  modalOpen = false;
  modalTitle = '';
  modalMessage = '';
  modalType: 'success' | 'error' | 'warning' | 'info' = 'info';
  modalIsConfirm = false;
  modalCallback: (() => void) | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private demandeService: DemandeService,
    private prestataireService: PrestataireService,
  ) {}

  ngOnInit() {
    this.prestataireUuid = this.route.snapshot.params['uuid'];
    this.prestataireService.getByUuid(this.prestataireUuid).subscribe({
      next: (data: any) => (this.prestataire = data),
      error: (err: unknown) => console.error(err),
    });
  }

  onSubmit() {
    if (!this.description) {
      this.error = 'Veuillez décrire votre besoin.';
      return;
    }
    this.error = '';

    this.showConfirmModal(
      "Confirmer l'envoi",
      'Voulez-vous envoyer cette demande au prestataire ?',
      () => this.sendDemande(),
    );
  }

  sendDemande() {
    this.loading = true;

    this.demandeService
      .creerDemande({
        prestataire: this.prestataire?.id,
        description: this.description,
        adresse: '',
        date_souhaitee: this.date_intervention || undefined,
      })
      .subscribe({
        next: () => {
          this.loading = false;
          this.showSuccessModal();
        },
        error: (err: unknown) => {
          this.loading = false;
          this.error = 'Une erreur est survenue. Réessayez.';
          console.error(err);
        },
      });
  }

  showSuccessModal() {
    this.modalTitle = 'Demande envoyée';
    this.modalMessage =
      "Votre demande a bien été prise en compte. Le prestataire l'examinera et vous répondra bientôt.";
    this.modalType = 'success';
    this.modalIsConfirm = false;
    this.modalOpen = true;
  }

  showConfirmModal(title: string, message: string, callback: () => void) {
    this.modalTitle = title;
    this.modalMessage = message;
    this.modalType = 'warning';
    this.modalIsConfirm = true;
    this.modalOpen = true;
    this.modalCallback = callback;
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

  goHome() {
    this.modalOpen = false;
    this.router.navigate(['/client']);
  }

  ngOnDestroy() {
    if (this.redirectTimeout) {
      clearTimeout(this.redirectTimeout);
    }
  }
}
