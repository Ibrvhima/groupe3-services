import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { PrestataireService } from '../../../core/services/prestataire.service';
import { HeaderComponent } from '../layout/header/header';

@Component({
  selector: 'app-prestataire-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent],
  templateUrl: './prestataire-detail.html',
})
export class PrestataireDetailComponent implements OnInit {
  prestataire: any = null;
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private prestataireService: PrestataireService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.params['id'];
    this.prestataireService.getById(id).subscribe({
      next: (data: any) => {
        this.prestataire = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  getInitiales(nom: string, prenom: string): string {
    return (nom?.charAt(0) || '') + (prenom?.charAt(0) || '');
  }


  
}