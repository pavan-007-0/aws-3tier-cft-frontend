import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService, Theme } from '../../services/theme.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-theme-switcher',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative">
      <!-- Theme Toggle Button - Fixed size, no overflow -->
      <button
        (click)="toggleMenu($event)"
        class="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        type="button"
        aria-label="Theme settings"
      >
        <!-- Sun Icon (dark mode) -->
        <svg *ngIf="currentTheme?.isDark" class="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clip-rule="evenodd"></path>
        </svg>
        <!-- Moon Icon (light mode) -->
        <svg *ngIf="!currentTheme?.isDark" class="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
          <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"></path>
        </svg>
      </button>

      <!-- Dropdown Menu -->
      <div 
        *ngIf="showMenu"
        class="absolute right-0 top-12 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden"
      >
        <!-- Dark Mode Toggle -->
        <div class="p-4 border-b border-gray-200 dark:border-gray-700">
          <div class="flex items-center justify-between">
            <span class="text-sm font-medium text-gray-900 dark:text-white">Dark Mode</span>
            <button
              (click)="toggleDarkMode($event)"
              class="relative w-11 h-6 rounded-full transition-colors"
              [class.bg-primary-600]="currentTheme?.isDark"
              [class.bg-gray-300]="!currentTheme?.isDark"
              type="button"
            >
              <span
                class="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform"
                [class.translate-x-5]="currentTheme?.isDark"
              ></span>
            </button>
          </div>
        </div>

        <!-- Color Schemes -->
        <div class="p-4">
          <p class="text-xs font-medium text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wide">Color Scheme</p>
          <div class="grid grid-cols-5 gap-2">
            <button
              *ngFor="let color of colorSchemes"
              (click)="setColorScheme(color.name, $event)"
              class="w-8 h-8 rounded-full border-2 transition-all hover:scale-110"
              [style.background-color]="color.primary"
              [class.border-gray-900]="isActiveColor(color.name)"
              [class.dark:border-white]="isActiveColor(color.name)"
              [class.border-transparent]="!isActiveColor(color.name)"
              [title]="color.label"
              type="button"
            >
              <span *ngIf="isActiveColor(color.name)" class="flex items-center justify-center text-white text-xs">✓</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ThemeSwitcherComponent implements OnInit, OnDestroy {
  currentTheme: Theme | null = null;
  showMenu = false;
  private subscription: Subscription | null = null;

  colorSchemes = [
    { name: 'blue', primary: '#3b82f6', label: 'Blue' },
    { name: 'purple', primary: '#8b5cf6', label: 'Purple' },
    { name: 'green', primary: '#10b981', label: 'Green' },
    { name: 'orange', primary: '#f59e0b', label: 'Orange' },
    { name: 'pink', primary: '#ec4899', label: 'Pink' },
    { name: 'teal', primary: '#14b8a6', label: 'Teal' },
    { name: 'red', primary: '#ef4444', label: 'Red' },
    { name: 'indigo', primary: '#6366f1', label: 'Indigo' },
    { name: 'cyan', primary: '#06b6d4', label: 'Cyan' },
    { name: 'amber', primary: '#d97706', label: 'Amber' }
  ];

  constructor(private themeService: ThemeService) {}

  ngOnInit() {
    this.subscription = this.themeService.currentTheme$.subscribe(theme => {
      this.currentTheme = theme;
    });
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    this.showMenu = false;
  }

  toggleMenu(event: Event) {
    event.stopPropagation();
    this.showMenu = !this.showMenu;
  }

  toggleDarkMode(event: Event) {
    event.stopPropagation();
    this.themeService.toggleDarkMode();
  }

  setColorScheme(colorName: string, event: Event) {
    event.stopPropagation();
    this.themeService.setColorScheme(colorName);
  }

  isActiveColor(colorName: string): boolean {
    return this.currentTheme?.name.includes(colorName) || false;
  }
}
