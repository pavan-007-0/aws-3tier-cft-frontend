import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService, Theme } from '../../services/theme.service';

@Component({
  selector: 'app-theme-switcher-new',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative inline-block text-left">
      <!-- Theme Toggle Button -->
      <button
        (click)="toggleThemeMenu()"
        class="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 dark:bg-gray-800/50 dark:hover:bg-gray-700/50 backdrop-blur-sm border border-white/20 dark:border-gray-600/30 transition-all duration-200 group"
        [class.ring-2]="showThemeMenu"
        [class.ring-primary-500/50]="showThemeMenu"
      >
        <!-- Theme Icon -->
        <div class="relative w-5 h-5 flex items-center justify-center">
          <span 
            *ngIf="!currentTheme.isDark" 
            class="text-yellow-400 text-base"
          >☀️</span>
          <span 
            *ngIf="currentTheme.isDark" 
            class="text-blue-300 text-base"
          >🌙</span>
        </div>
      </button>

      <!-- Theme Menu Dropdown -->
      <div 
        *ngIf="showThemeMenu"
        class="absolute right-0 top-full mt-2 w-80 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 py-3 z-[9999] animate-slide-up overflow-hidden"
        (click)="$event.stopPropagation()"
        style="transform: translateX(calc(100% - 2.5rem));"
      >
        <!-- Header -->
        <div class="px-6 py-3 border-b border-gray-200/50 dark:border-gray-700/50">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Theme Settings</h3>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Customize your experience</p>
        </div>

        <!-- Dark Mode Toggle -->
        <div class="px-6 py-4 border-b border-gray-200/50 dark:border-gray-700/50">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <span class="text-2xl">{{ currentTheme.isDark ? '🌙' : '☀️' }}</span>
              <div>
                <span class="text-sm font-medium text-gray-900 dark:text-white">Dark Mode</span>
                <p class="text-xs text-gray-500 dark:text-gray-400">Toggle dark theme</p>
              </div>
            </div>
            <button
              (click)="toggleDarkMode()"
              class="relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-900"
              [class]="currentTheme.isDark ? 'bg-primary-600' : 'bg-gray-300'"
            >
              <span
                class="inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform"
                [class]="currentTheme.isDark ? 'translate-x-6' : 'translate-x-1'"
              ></span>
            </button>
          </div>
          
          <button
            (click)="setAutoTheme()"
            class="w-full mt-3 text-left px-4 py-3 text-sm rounded-xl transition-all duration-200 flex items-center justify-between group"
            [class.bg-primary-50]="themeService.isAutoThemeEnabled() && !currentTheme.isDark"
            [class.dark:bg-primary-900/30]="themeService.isAutoThemeEnabled() && currentTheme.isDark"
            [class.text-primary-700]="themeService.isAutoThemeEnabled() && !currentTheme.isDark"
            [class.dark:text-primary-300]="themeService.isAutoThemeEnabled() && currentTheme.isDark"
            [class.text-gray-600]="!themeService.isAutoThemeEnabled()"
            [class.dark:text-gray-400]="!themeService.isAutoThemeEnabled()"
            [class.hover:bg-gray-100]="!themeService.isAutoThemeEnabled()"
            [class.dark:hover:bg-gray-800/50]="!themeService.isAutoThemeEnabled()"
          >
            <span class="flex items-center space-x-3">
              <span class="text-lg">🤖</span>
              <div>
                <div class="font-medium">Auto (System)</div>
                <div class="text-xs opacity-75">Follow system preference</div>
              </div>
            </span>
            <span 
              *ngIf="themeService.isAutoThemeEnabled()"
              class="text-primary-600 dark:text-primary-400 text-lg"
            >✓</span>
          </button>
        </div>

        <!-- Color Schemes -->
        <div class="px-6 py-4">
          <h4 class="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <span class="text-lg mr-2">🎨</span>
            Color Schemes
          </h4>
          
          <div class="grid grid-cols-2 gap-3">
            <button
              *ngFor="let colorScheme of colorSchemes"
              (click)="setColorScheme(colorScheme.name)"
              class="flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-all duration-200 group w-full text-left border-2 border-transparent"
              [class.bg-primary-50]="isCurrentColorScheme(colorScheme.name) && !currentTheme.isDark"
              [class.dark:bg-primary-900/30]="isCurrentColorScheme(colorScheme.name) && currentTheme.isDark"
              [class.border-primary-200]="isCurrentColorScheme(colorScheme.name) && !currentTheme.isDark"
              [class.dark:border-primary-700]="isCurrentColorScheme(colorScheme.name) && currentTheme.isDark"
            >
              <!-- Color Preview -->
              <div class="flex space-x-1 flex-shrink-0">
                <div 
                  class="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                  [style.background-color]="colorScheme.colors.primary"
                ></div>
                <div 
                  class="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                  [style.background-color]="colorScheme.colors.secondary"
                ></div>
              </div>
              
              <!-- Color Name -->
              <div class="flex-1 min-w-0">
                <span class="text-sm font-medium text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                  {{ colorScheme.displayName }}
                </span>
              </div>
              
              <!-- Check Icon -->
              <div class="flex-shrink-0">
                <span 
                  *ngIf="isCurrentColorScheme(colorScheme.name)"
                  class="text-primary-600 dark:text-primary-400 text-lg"
                >✓</span>
              </div>
            </button>
          </div>
        </div>

        <!-- Footer -->
        <div class="px-6 py-3 border-t border-gray-200/50 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-800/30">
          <p class="text-xs text-gray-500 dark:text-gray-400 text-center">
            ✨ Preferences saved automatically
          </p>
        </div>
      </div>

      <!-- Backdrop -->
      <div 
        *ngIf="showThemeMenu"
        class="fixed inset-0 z-[9998] bg-black/20 backdrop-blur-sm"
        (click)="closeThemeMenu()"
      ></div>
    </div>
  `,
  styles: [`
    .animate-slide-up {
      animation: slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .rotate-180 {
      transform: rotate(180deg);
    }
    
    @keyframes slideUp {
      0% { 
        transform: translateY(10px) translateX(calc(100% - 2.5rem)); 
        opacity: 0; 
        scale: 0.95;
      }
      100% { 
        transform: translateY(0) translateX(calc(100% - 2.5rem)); 
        opacity: 1; 
        scale: 1;
      }
    }
  `]
})
export class ThemeSwitcherNewComponent implements OnInit {
  currentTheme!: Theme;
  showThemeMenu = false;
  
  colorSchemes = [
    { name: 'blue', displayName: 'Blue', colors: { primary: '#3b82f6', secondary: '#1e40af', accent: '#60a5fa' } },
    { name: 'purple', displayName: 'Purple', colors: { primary: '#8b5cf6', secondary: '#7c3aed', accent: '#a78bfa' } },
    { name: 'green', displayName: 'Green', colors: { primary: '#10b981', secondary: '#059669', accent: '#34d399' } },
    { name: 'orange', displayName: 'Orange', colors: { primary: '#f59e0b', secondary: '#d97706', accent: '#fbbf24' } },
    { name: 'pink', displayName: 'Pink', colors: { primary: '#ec4899', secondary: '#db2777', accent: '#f472b6' } },
    { name: 'teal', displayName: 'Teal', colors: { primary: '#14b8a6', secondary: '#0d9488', accent: '#2dd4bf' } },
    { name: 'red', displayName: 'Red', colors: { primary: '#ef4444', secondary: '#dc2626', accent: '#f87171' } },
    { name: 'indigo', displayName: 'Indigo', colors: { primary: '#6366f1', secondary: '#4f46e5', accent: '#818cf8' } },
    { name: 'cyan', displayName: 'Cyan', colors: { primary: '#06b6d4', secondary: '#0891b2', accent: '#22d3ee' } },
    { name: 'amber', displayName: 'Amber', colors: { primary: '#f59e0b', secondary: '#d97706', accent: '#fbbf24' } },
  ];

  constructor(public themeService: ThemeService) {}

  ngOnInit() {
    this.themeService.currentTheme$.subscribe(theme => {
      this.currentTheme = theme;
    });
  }

  toggleThemeMenu() {
    this.showThemeMenu = !this.showThemeMenu;
  }

  closeThemeMenu() {
    this.showThemeMenu = false;
  }

  toggleDarkMode() {
    this.themeService.toggleDarkMode();
  }

  setColorScheme(colorScheme: string) {
    this.themeService.setColorScheme(colorScheme);
  }

  setAutoTheme() {
    if (this.themeService.isAutoThemeEnabled()) {
      this.themeService.disableAutoTheme();
    } else {
      this.themeService.enableAutoTheme();
    }
  }

  isCurrentColorScheme(colorScheme: string): boolean {
    return this.currentTheme.name.includes(colorScheme);
  }
}