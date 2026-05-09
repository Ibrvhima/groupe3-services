import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SidebarComponent } from '../layout/sidebar/sidebar';
import { AdminService } from '../../../core/services/admin.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, SidebarComponent],
  templateUrl: './dashboard.html',
})
export class DashboardComponent implements OnInit {
  stats: any = null;
  loading = true;

  constructor(
    private adminService: AdminService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.adminService.getStats().subscribe({
      next: (data: any) => {
        this.stats = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  getStatusClass(statut: string): string {
    const statusClasses: { [key: string]: string } = {
      'en attente': 'text-xs bg-yellow-50 text-yellow-600 px-2 py-1 rounded-full font-medium',
      acceptée: 'text-xs bg-green-50 text-green-600 px-2 py-1 rounded-full font-medium',
      terminée: 'text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full font-medium',
      annulée: 'text-xs bg-red-50 text-red-500 px-2 py-1 rounded-full font-medium',
    };
    return (
      statusClasses[statut] || 'text-xs bg-gray-50 text-gray-600 px-2 py-1 rounded-full font-medium'
    );
  }
}
