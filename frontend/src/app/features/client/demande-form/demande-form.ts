import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { DemandeService } from '../../../core/services/demande.service';
import { HeaderClientComponent } from '../layout/header-client/header-client';

import { Location } from '@angular/common';

@Component({
  selector: 'app-demande-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HeaderClientComponent
  ],
  templateUrl: './demande-form.html',
})
export class DemandeFormComponent implements OnInit {

  // 🔥 ID du prestataire (vient de l’URL)
  prestataireId!: number;

  // 📦 Données du formulaire
  description = '';

  // 🎯 UI STATE
  loading = false;
  success = false;
  error = '';

  constructor(
    private demandeService: DemandeService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private location: Location
  ) {}

  ngOnInit() {

    // 🔥 récupération ID depuis l’URL
    this.prestataireId = Number(this.route.snapshot.params['id']);

    console.log('📍 PRESTATAIRE ID:', this.prestataireId);
  }

  // 🚀 ENVOI DEMANDE
  onSubmit() {

    // ❌ VALIDATION
    if (!this.description.trim()) {
      this.error = 'Veuillez écrire une demande.';
      return;
    }

    // 🔄 RESET UI
    this.loading = true;
    this.error = '';
    this.success = false;

    // 📦 DATA
    const data = {
      description: this.description,
      prestataire_id: this.prestataireId
    };

    console.log('📡 DATA ENVOYÉE:', data);

    // =====================================================
    // ✅ VERSION BACKEND (À ACTIVER)
    // 👉 décommenté quand L'API est prête
    // =====================================================

    /*
    this.demandeService.creer(data).subscribe({

      next: (res) => {

        console.log('✅ SUCCESS:', res);

        this.loading = false;
        this.success = true;
        this.description = '';

        this.cdr.detectChanges();

        // 🔥 cache message après 2.5 sec
        setTimeout(() => {
          this.success = false;
          this.cdr.detectChanges();
        }, 2500);
      },

      error: (err) => {

        console.log('❌ ERROR API:', err);

        this.loading = false;
        this.error = 'Erreur lors de l’envoi.';

        this.cdr.detectChanges();
      }

    });
    */

    // =====================================================
    // 🔒 VERSION MOCK (TEMPORAIRE)
    // 👉 utilise tant que backend pas prêt
    // =====================================================

    setTimeout(() => {

      console.log('✅ DEMANDE FAKE ENVOYÉE');

      this.loading = false;
      this.success = true;
      this.description = '';

      this.cdr.detectChanges();

      // 🔥 cache le succès automatiquement
      setTimeout(() => {

        this.success = false;

        this.cdr.detectChanges();

      }, 2500);

    }, 800);
  }

  // 🔙 RETOUR
  goBack() {
    this.location.back();
  }

  // 🔥 FIX BUG loading bloqué
  onInputChange() {

    if (this.loading) {

      this.loading = false;

      this.cdr.detectChanges();
    }

    // 🔥 supprime erreur pendant saisie
    if (this.error) {
      this.error = '';
    }
  }
}