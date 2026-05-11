import { Component, OnInit } from '@angular/core';
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
export class DemandeFormComponent implements OnInit {
  prestataire: any = null;
  description = '';
  date_intervention = '';
  error = '';
  loading = false;
  prestataireId: number = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private demandeService: DemandeService,
    private prestataireService: PrestataireService
  ) {}

  ngOnInit() {
    this.prestataireId = this.route.snapshot.params['id'];
    this.prestataireService.getById(this.prestataireId).subscribe({
      next: (data: any) => this.prestataire = data,
      error: (err) => console.error(err)
    });
  }

  onSubmit() {
    if (!this.description) {
      this.error = 'Veuillez décrire votre besoin.';
      return;
    }
    this.error = '';
    this.loading = true;

    this.demandeService.creer({
      prestataire: this.prestataireId,
      description: this.description,
      date_intervention: this.date_intervention || null
    }).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/client']);
      },
      error: (err) => {
        this.loading = false;
        this.error = 'Une erreur est survenue. Réessayez.';
        console.error(err);
      }
    });
  }
}