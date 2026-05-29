import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal-alert',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="isOpen" class="fixed inset-0 z-50 flex items-center justify-center">
      <!-- Backdrop -->
      <div (click)="close()" class="absolute inset-0 bg-black bg-opacity-50"></div>

      <!-- Modal -->
      <div class="relative bg-white rounded-2xl shadow-xl max-w-sm w-full mx-4 p-6">
        <!-- Icon -->
        <div
          [class]="
            'w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ' +
            (type === 'success'
              ? 'bg-green-100'
              : type === 'error'
                ? 'bg-red-100'
                : type === 'warning'
                  ? 'bg-yellow-100'
                  : 'bg-orange-100')
          "
        >
          <svg
            *ngIf="type === 'success'"
            xmlns="http://www.w3.org/2000/svg"
            class="w-6 h-6 text-green-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M5 13l4 4L19 7"
            />
          </svg>
          <svg
            *ngIf="type === 'error'"
            xmlns="http://www.w3.org/2000/svg"
            class="w-6 h-6 text-red-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
          <svg
            *ngIf="type === 'warning'"
            xmlns="http://www.w3.org/2000/svg"
            class="w-6 h-6 text-yellow-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 9v2m0 4v2m0-6a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <svg
            *ngIf="type === 'info'"
            xmlns="http://www.w3.org/2000/svg"
            class="w-6 h-6 text-orange-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        <!-- Titre -->
        <h3 class="text-lg font-bold text-gray-800 text-center mb-2">{{ title }}</h3>

        <!-- Message -->
        <p class="text-sm text-gray-600 text-center mb-6">{{ message }}</p>

        <!-- Boutons -->
        <div class="flex gap-3">
          <button
            *ngIf="isConfirm"
            (click)="cancel()"
            class="flex-1 px-4 py-2 rounded-lg text-sm font-semibold border border-gray-300 text-gray-700 hover:bg-gray-50 transition"
          >
            Annuler
          </button>
          <button
            (click)="confirm()"
            [class]="
              'flex-1 px-4 py-2 rounded-lg text-sm font-semibold text-white transition ' +
              (type === 'success'
                ? 'bg-green-600 hover:bg-green-700'
                : type === 'error'
                  ? 'bg-red-600 hover:bg-red-700'
                  : type === 'warning'
                    ? 'bg-yellow-600 hover:bg-yellow-700'
                    : 'bg-orange-600 hover:bg-orange-700')
            "
          >
            {{ isConfirm ? 'Confirmer' : 'OK' }}
          </button>
        </div>
      </div>
    </div>
  `,
})
export class ModalAlertComponent {
  @Input() isOpen = false;
  @Input() title = 'Notification';
  @Input() message = '';
  @Input() type: 'success' | 'error' | 'warning' | 'info' = 'info';
  @Input() isConfirm = false;

  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  confirm() {
    this.confirmed.emit();
    this.close();
  }

  cancel() {
    this.cancelled.emit();
    this.close();
  }

  close() {
    this.isOpen = false;
  }
}
