import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { HeaderComponent } from '../layout/header/header';
import { DemandeService } from '../../../core/services/demande.service';
import { PrestataireService } from '../../../core/services/prestataire.service';

@Component({
  selector: 'app-demande-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, HeaderComponent],
  templateUrl: './demande-form.html',
})
export class DemandeFormComponent implements OnInit, OnDestroy {
  prestataire: any = null;
  prestataireLoading = true;
  prestataireUuid    = '';

  titre        = '';
  description  = '';
  adresse      = '';
  date_souhaitee = '';
  urgence      = 'normal';

  error   = '';
  loading = false;
  success = false;

  private redirectTimeout: any;

  readonly urgenceOptions = [
    { value: 'normal',       label: 'Normal'      },
    { value: 'urgent',       label: 'Urgent'      },
    { value: 'tres_urgent',  label: 'Très urgent' },
  ];

  constructor(
    private route:             ActivatedRoute,
    private router:            Router,
    private demandeService:    DemandeService,
    private prestataireService: PrestataireService,
  ) {}

  ngOnInit(): void {
    this.prestataireUuid = this.route.snapshot.params['uuid'];
    this.prestataireService.getByUuid(this.prestataireUuid).subscribe({
      next:  data  => { this.prestataire = data; this.prestataireLoading = false; },
      error: err   => { console.error(err);       this.prestataireLoading = false; },
    });
  }

  ngOnDestroy(): void {
    if (this.redirectTimeout) clearTimeout(this.redirectTimeout);
  }

  onSubmit(): void {
    if (!this.titre.trim())       { this.error = 'Le titre est obligatoire.';        return; }
    if (!this.description.trim()) { this.error = 'La description est obligatoire.';  return; }
    if (!this.adresse.trim())     { this.error = "L'adresse est obligatoire.";       return; }
    this.error   = '';
    this.loading = true;

    this.demandeService.creerDemande({
      prestataire:   this.prestataire?.id,
      titre:         this.titre,
      description:   this.description,
      adresse:       this.adresse,
      date_souhaitee: this.date_souhaitee || undefined,
      urgence:       this.urgence,
    }).subscribe({
      next:  () => { this.loading = false; this.success = true; },
      error: (err: any) => {
        this.loading = false;
        this.error   = err?.error?.detail ?? err?.error?.[0] ?? 'Une erreur est survenue. Réessayez.';
        console.error(err);
      },
    });
  }

  etoiles(max: number): number[] {
    return Array.from({ length: max }, (_, i) => i + 1);
  }

  avatarClass(): string {
    const colors = ['bg-orange-500', 'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-teal-500', 'bg-pink-500'];
    const idx = (this.prestataire?.user?.nom?.charCodeAt(0) ?? 0) % colors.length;
    return colors[idx] ?? 'bg-orange-500';
  }
}
