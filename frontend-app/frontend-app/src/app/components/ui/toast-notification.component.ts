import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, state, style, transition, animate } from '@angular/animations';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    handler: () => void;
  };
  persistent?: boolean;
}

@Component({
  selector: 'app-toast-notification',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div 
      class="toast-container"
      [@slideIn]="animationState"
      [class]="getToastClasses()"
    >
      <!-- Icon -->
      <div class="flex-shrink-0">
        <div class="toast-icon" [class]="getIconClasses()">
          <!-- Success Icon -->
          <svg *ngIf="toast.type === 'success'" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
          </svg>
          
          <!-- Error Icon -->
          <svg *ngIf="toast.type === 'error'" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
          </svg>
          
          <!-- Warning Icon -->
          <svg *ngIf="toast.type === 'warning'" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
          </svg>
          
          <!-- Info Icon -->
          <svg *ngIf="toast.type === 'info'" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path>
          </svg>
        </div>
      </div>

      <!-- Content -->
      <div class="flex-1 ml-3">
        <div class="toast-title">{{ toast.title }}</div>
        <div *ngIf="toast.message" class="toast-message">{{ toast.message }}</div>
        
        <!-- Action Button -->
        <button 
          *ngIf="toast.action"
          (click)="handleAction()"
          class="toast-action-btn"
        >
          {{ toast.action.label }}
        </button>
      </div>

      <!-- Close Button -->
      <div class="flex-shrink-0 ml-4">
        <button
          (click)="close()"
          class="toast-close-btn"
        >
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
          </svg>
        </button>
      </div>

      <!-- Progress Bar -->
      <div *ngIf="!toast.persistent && showProgress" class="toast-progress">
        <div class="toast-progress-bar" [style.animation-duration.ms]="toast.duration || 5000"></div>
      </div>
    </div>
  `,
  styles: [`
    .toast-container {
      @apply max-w-sm w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden;
      position: relative;
    }

    .toast-icon {
      @apply flex items-center justify-center w-8 h-8 rounded-full;
    }

    .toast-title {
      @apply text-sm font-medium text-gray-900 dark:text-white;
    }

    .toast-message {
      @apply mt-1 text-sm text-gray-500 dark:text-gray-400;
    }

    .toast-action-btn {
      @apply mt-2 text-sm font-medium rounded-md px-2 py-1 transition-colors;
    }

    .toast-close-btn {
      @apply text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700;
    }

    .toast-progress {
      @apply absolute bottom-0 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700;
    }

    .toast-progress-bar {
      @apply h-full bg-current;
      animation: progress-countdown linear;
      transform-origin: left;
    }

    @keyframes progress-countdown {
      from { transform: scaleX(1); }
      to { transform: scaleX(0); }
    }

    .toast-success .toast-icon { @apply bg-green-100 text-green-600; }
    .toast-error .toast-icon { @apply bg-red-100 text-red-600; }
    .toast-warning .toast-icon { @apply bg-yellow-100 text-yellow-600; }
    .toast-info .toast-icon { @apply bg-blue-100 text-blue-600; }
  `],
  animations: [
    trigger('slideIn', [
      state('in', style({ transform: 'translateX(0)', opacity: 1 })),
      transition(':enter', [
        style({ transform: 'translateX(100%)', opacity: 0 }),
        animate('300ms ease-out')
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({ transform: 'translateX(100%)', opacity: 0 }))
      ])
    ])
  ]
})
export class ToastNotificationComponent implements OnInit, OnDestroy {
  @Input() toast!: Toast;
  @Output() closed = new EventEmitter<string>();

  animationState = 'in';
  showProgress = true;
  private timeoutId?: number;

  ngOnInit() {
    if (!this.toast.persistent) {
      const duration = this.toast.duration || 5000;
      this.timeoutId = window.setTimeout(() => {
        this.close();
      }, duration);
    }
  }

  ngOnDestroy() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
  }

  close() {
    this.closed.emit(this.toast.id);
  }

  handleAction() {
    if (this.toast.action) {
      this.toast.action.handler();
      this.close();
    }
  }

  getToastClasses(): string {
    return `toast-${this.toast.type} p-4`;
  }

  getIconClasses(): string {
    return `toast-icon-${this.toast.type}`;
  }
}