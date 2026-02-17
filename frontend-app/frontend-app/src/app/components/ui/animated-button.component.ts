import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, state, style, transition, animate } from '@angular/animations';

@Component({
  selector: 'app-animated-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      [class]="getButtonClasses()"
      [disabled]="disabled || loading"
      (click)="handleClick()"
      (mouseenter)="isHovered = true"
      (mouseleave)="isHovered = false"
      [@buttonState]="getAnimationState()"
      [@ripple]="rippleState"
    >
      <!-- Loading Spinner -->
      <div *ngIf="loading" class="absolute inset-0 flex items-center justify-center">
        <div class="loading-spinner"></div>
      </div>

      <!-- Button Content -->
      <div class="flex items-center justify-center space-x-2" [class.opacity-0]="loading">
        <!-- Icon -->
        <div *ngIf="icon && iconPosition === 'left'" [innerHTML]="icon" class="w-5 h-5"></div>
        
        <!-- Text -->
        <span *ngIf="text" class="font-medium">{{ text }}</span>
        
        <!-- Icon Right -->
        <div *ngIf="icon && iconPosition === 'right'" [innerHTML]="icon" class="w-5 h-5"></div>
        
        <!-- Success Check -->
        <svg *ngIf="success" class="w-5 h-5 text-white animate-scale-in" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
        </svg>
      </div>

      <!-- Ripple Effect -->
      <div *ngIf="showRipple" class="ripple-effect" [@rippleAnimation]="rippleState"></div>

      <!-- Glow Effect -->
      <div *ngIf="glowEffect && isHovered" class="glow-effect"></div>
    </button>
  `,
  styles: [`
    .loading-spinner {
      width: 20px;
      height: 20px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      border-top-color: white;
      animation: spin 1s ease-in-out infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .ripple-effect {
      position: absolute;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.6);
      transform: scale(0);
      animation: ripple 0.6s linear;
      pointer-events: none;
    }

    @keyframes ripple {
      to {
        transform: scale(4);
        opacity: 0;
      }
    }

    .glow-effect {
      position: absolute;
      inset: -2px;
      background: linear-gradient(45deg, var(--theme-primary), var(--theme-accent));
      border-radius: inherit;
      opacity: 0.5;
      filter: blur(8px);
      z-index: -1;
      animation: glow-pulse 2s ease-in-out infinite alternate;
    }

    @keyframes glow-pulse {
      0% { opacity: 0.5; }
      100% { opacity: 0.8; }
    }

    .animate-scale-in {
      animation: scaleIn 0.3s ease-out;
    }

    @keyframes scaleIn {
      0% { transform: scale(0); }
      100% { transform: scale(1); }
    }

    /* Button Variants */
    .btn-gradient {
      background: linear-gradient(135deg, var(--theme-primary), var(--theme-accent));
      background-size: 200% 200%;
      animation: gradient-shift 3s ease infinite;
    }

    @keyframes gradient-shift {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }

    .btn-glass {
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .btn-neon {
      box-shadow: 0 0 20px var(--theme-primary);
      border: 2px solid var(--theme-primary);
    }
  `],
  animations: [
    trigger('buttonState', [
      state('normal', style({ transform: 'scale(1)' })),
      state('hovered', style({ transform: 'scale(1.05)' })),
      state('pressed', style({ transform: 'scale(0.95)' })),
      state('loading', style({ transform: 'scale(1)' })),
      state('success', style({ transform: 'scale(1.1)' })),
      transition('* => *', animate('150ms ease-out'))
    ]),
    trigger('ripple', [
      transition('* => ripple', [
        style({ transform: 'scale(0)', opacity: 0.6 }),
        animate('600ms ease-out', style({ transform: 'scale(4)', opacity: 0 }))
      ])
    ]),
    trigger('rippleAnimation', [
      transition(':enter', [
        style({ transform: 'scale(0)', opacity: 0.6 }),
        animate('600ms ease-out', style({ transform: 'scale(4)', opacity: 0 }))
      ])
    ])
  ]
})
export class AnimatedButtonComponent implements OnInit {
  @Input() text: string = '';
  @Input() icon: string = '';
  @Input() iconPosition: 'left' | 'right' = 'left';
  @Input() variant: 'primary' | 'secondary' | 'outline' | 'gradient' | 'glass' | 'neon' = 'primary';
  @Input() size: 'sm' | 'md' | 'lg' | 'xl' = 'md';
  @Input() loading: boolean = false;
  @Input() disabled: boolean = false;
  @Input() success: boolean = false;
  @Input() rippleEffect: boolean = true;
  @Input() glowEffect: boolean = false;
  @Input() fullWidth: boolean = false;
  
  @Output() clicked = new EventEmitter<void>();

  isHovered = false;
  isPressed = false;
  showRipple = false;
  rippleState = 'normal';

  ngOnInit() {
    if (this.success) {
      setTimeout(() => this.success = false, 2000);
    }
  }

  handleClick() {
    if (this.disabled || this.loading) return;
    
    this.isPressed = true;
    setTimeout(() => this.isPressed = false, 150);
    
    if (this.rippleEffect) {
      this.showRipple = true;
      this.rippleState = 'ripple';
      setTimeout(() => {
        this.showRipple = false;
        this.rippleState = 'normal';
      }, 600);
    }
    
    this.clicked.emit();
  }

  getAnimationState(): string {
    if (this.success) return 'success';
    if (this.loading) return 'loading';
    if (this.isPressed) return 'pressed';
    if (this.isHovered && !this.disabled) return 'hovered';
    return 'normal';
  }

  getButtonClasses(): string {
    const baseClasses = 'relative inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 overflow-hidden';
    
    const sizeClasses = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base',
      xl: 'px-8 py-4 text-lg'
    };

    const variantClasses = {
      primary: 'bg-primary-600 hover:bg-primary-700 text-white focus:ring-primary-500',
      secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-900 focus:ring-gray-500 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white',
      outline: 'border-2 border-primary-600 text-primary-600 hover:bg-primary-600 hover:text-white focus:ring-primary-500 dark:border-primary-400 dark:text-primary-400',
      gradient: 'btn-gradient text-white focus:ring-primary-500',
      glass: 'btn-glass text-white focus:ring-white/50',
      neon: 'btn-neon bg-transparent text-primary-400 hover:text-white focus:ring-primary-500'
    };

    const disabledClasses = this.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer';
    const widthClasses = this.fullWidth ? 'w-full' : '';

    return `${baseClasses} ${sizeClasses[this.size]} ${variantClasses[this.variant]} ${disabledClasses} ${widthClasses}`;
  }
}
