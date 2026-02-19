import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

export interface Theme {
  id: string;
  name: string;
  displayName: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  isDark: boolean;
}

export const AVAILABLE_THEMES: Theme[] = [
  // Blue themes
  {
    id: 'light-blue',
    name: 'light-blue',
    displayName: 'Light Blue',
    colors: { primary: '#3b82f6', secondary: '#1e40af', accent: '#60a5fa' },
    isDark: false
  },
  {
    id: 'dark-blue',
    name: 'dark-blue', 
    displayName: 'Dark Blue',
    colors: { primary: '#3b82f6', secondary: '#1e40af', accent: '#60a5fa' },
    isDark: true
  },
  
  // Purple themes
  {
    id: 'light-purple',
    name: 'light-purple',
    displayName: 'Light Purple',
    colors: { primary: '#8b5cf6', secondary: '#7c3aed', accent: '#a78bfa' },
    isDark: false
  },
  {
    id: 'dark-purple',
    name: 'dark-purple',
    displayName: 'Dark Purple', 
    colors: { primary: '#8b5cf6', secondary: '#7c3aed', accent: '#a78bfa' },
    isDark: true
  },
  
  // Green themes
  {
    id: 'light-green',
    name: 'light-green',
    displayName: 'Light Green',
    colors: { primary: '#10b981', secondary: '#059669', accent: '#34d399' },
    isDark: false
  },
  {
    id: 'dark-green',
    name: 'dark-green',
    displayName: 'Dark Green',
    colors: { primary: '#10b981', secondary: '#059669', accent: '#34d399' },
    isDark: true
  },
  
  // Orange themes
  {
    id: 'light-orange',
    name: 'light-orange',
    displayName: 'Light Orange',
    colors: { primary: '#f59e0b', secondary: '#d97706', accent: '#fbbf24' },
    isDark: false
  },
  {
    id: 'dark-orange',
    name: 'dark-orange',
    displayName: 'Dark Orange',
    colors: { primary: '#f59e0b', secondary: '#d97706', accent: '#fbbf24' },
    isDark: true
  },
  
  // Pink themes
  {
    id: 'light-pink',
    name: 'light-pink',
    displayName: 'Light Pink',
    colors: { primary: '#ec4899', secondary: '#db2777', accent: '#f472b6' },
    isDark: false
  },
  {
    id: 'dark-pink',
    name: 'dark-pink',
    displayName: 'Dark Pink',
    colors: { primary: '#ec4899', secondary: '#db2777', accent: '#f472b6' },
    isDark: true
  },
  
  // Teal themes
  {
    id: 'light-teal',
    name: 'light-teal',
    displayName: 'Light Teal',
    colors: { primary: '#14b8a6', secondary: '#0d9488', accent: '#2dd4bf' },
    isDark: false
  },
  {
    id: 'dark-teal',
    name: 'dark-teal',
    displayName: 'Dark Teal',
    colors: { primary: '#14b8a6', secondary: '#0d9488', accent: '#2dd4bf' },
    isDark: true
  },
  
  // Red themes
  {
    id: 'light-red',
    name: 'light-red',
    displayName: 'Light Red',
    colors: { primary: '#ef4444', secondary: '#dc2626', accent: '#f87171' },
    isDark: false
  },
  {
    id: 'dark-red',
    name: 'dark-red',
    displayName: 'Dark Red',
    colors: { primary: '#ef4444', secondary: '#dc2626', accent: '#f87171' },
    isDark: true
  },
  
  // Indigo themes
  {
    id: 'light-indigo',
    name: 'light-indigo',
    displayName: 'Light Indigo',
    colors: { primary: '#6366f1', secondary: '#4f46e5', accent: '#818cf8' },
    isDark: false
  },
  {
    id: 'dark-indigo',
    name: 'dark-indigo',
    displayName: 'Dark Indigo',
    colors: { primary: '#6366f1', secondary: '#4f46e5', accent: '#818cf8' },
    isDark: true
  },
  
  // Cyan themes
  {
    id: 'light-cyan',
    name: 'light-cyan',
    displayName: 'Light Cyan',
    colors: { primary: '#06b6d4', secondary: '#0891b2', accent: '#22d3ee' },
    isDark: false
  },
  {
    id: 'dark-cyan',
    name: 'dark-cyan',
    displayName: 'Dark Cyan',
    colors: { primary: '#06b6d4', secondary: '#0891b2', accent: '#22d3ee' },
    isDark: true
  },
  
  // Amber themes
  {
    id: 'light-amber',
    name: 'light-amber',
    displayName: 'Light Amber',
    colors: { primary: '#f59e0b', secondary: '#d97706', accent: '#fbbf24' },
    isDark: false
  },
  {
    id: 'dark-amber',
    name: 'dark-amber',
    displayName: 'Dark Amber',
    colors: { primary: '#f59e0b', secondary: '#d97706', accent: '#fbbf24' },
    isDark: true
  }
];

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_KEY = 'selected-theme';
  private readonly DEFAULT_THEME = 'light-blue';
  
  private currentThemeSubject = new BehaviorSubject<Theme>(
    this.getThemeById(this.DEFAULT_THEME)
  );
  
  public currentTheme$ = this.currentThemeSubject.asObservable();

  constructor(private http: HttpClient) {
    this.initializeTheme();
  }

  private initializeTheme(): void {
    const savedTheme = localStorage.getItem(this.THEME_KEY);
    let theme: Theme;
    
    if (savedTheme) {
      theme = this.getThemeById(savedTheme);
    } else {
      // Check system preference for initial theme
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      theme = this.getThemeById(prefersDark ? 'dark-blue' : this.DEFAULT_THEME);
    }
    
    this.setTheme(theme);
  }

  private getThemeById(themeId: string): Theme {
    return AVAILABLE_THEMES.find(theme => theme.id === themeId) || AVAILABLE_THEMES[0];
  }

  getCurrentTheme(): Theme {
    return this.currentThemeSubject.value;
  }

  setTheme(theme: Theme): void {
    const body = document.body;
    const html = document.documentElement;
    
    // Remove all theme classes
    AVAILABLE_THEMES.forEach(t => {
      body.classList.remove(`theme-${t.name}`);
      html.classList.remove(`theme-${t.name}`);
    });
    
    // Remove dark class
    html.classList.remove('dark');
    
    // Add new theme classes
    body.classList.add(`theme-${theme.name}`);
    html.classList.add(`theme-${theme.name}`);
    
    // Add dark class if needed
    if (theme.isDark) {
      html.classList.add('dark');
    }
    
    // Update CSS variables
    this.updateCSSVariables(theme);
    
    // Save to localStorage
    localStorage.setItem(this.THEME_KEY, theme.id);
    
    // Update subject
    this.currentThemeSubject.next(theme);
  }

  private updateCSSVariables(theme: Theme): void {
    const root = document.documentElement;
    
    // Set theme colors as hex (for non-Tailwind use)
    root.style.setProperty('--theme-primary', theme.colors.primary);
    root.style.setProperty('--theme-secondary', theme.colors.secondary);
    root.style.setProperty('--theme-accent', theme.colors.accent);
    
    // Generate color palette from primary, secondary, and accent colors
    const primary = theme.colors.primary;
    const secondary = theme.colors.secondary;
    const accent = theme.colors.accent;
    
    // Convert hex to RGB for Tailwind CSS variables
    const primaryRGB = this.hexToRGB(primary);
    const secondaryRGB = this.hexToRGB(secondary);
    const accentRGB = this.hexToRGB(accent);
    
    // Set Primary color palette (as RGB strings)
    root.style.setProperty('--color-primary-50', this.lightenRGB(primaryRGB, 95));
    root.style.setProperty('--color-primary-100', this.lightenRGB(primaryRGB, 90));
    root.style.setProperty('--color-primary-200', this.lightenRGB(primaryRGB, 80));
    root.style.setProperty('--color-primary-300', this.lightenRGB(primaryRGB, 60));
    root.style.setProperty('--color-primary-400', this.lightenRGB(primaryRGB, 30));
    root.style.setProperty('--color-primary-500', primaryRGB);
    root.style.setProperty('--color-primary-600', secondaryRGB);
    root.style.setProperty('--color-primary-700', this.darkenRGB(secondaryRGB, 10));
    root.style.setProperty('--color-primary-800', this.darkenRGB(secondaryRGB, 25));
    root.style.setProperty('--color-primary-900', this.darkenRGB(secondaryRGB, 40));
    root.style.setProperty('--color-primary-950', this.darkenRGB(secondaryRGB, 55));
    
    // Set Secondary color palette
    root.style.setProperty('--color-secondary-50', this.lightenRGB(secondaryRGB, 95));
    root.style.setProperty('--color-secondary-100', this.lightenRGB(secondaryRGB, 90));
    root.style.setProperty('--color-secondary-200', this.lightenRGB(secondaryRGB, 80));
    root.style.setProperty('--color-secondary-300', this.lightenRGB(secondaryRGB, 60));
    root.style.setProperty('--color-secondary-400', this.lightenRGB(secondaryRGB, 30));
    root.style.setProperty('--color-secondary-500', secondaryRGB);
    root.style.setProperty('--color-secondary-600', this.darkenRGB(secondaryRGB, 10));
    root.style.setProperty('--color-secondary-700', this.darkenRGB(secondaryRGB, 20));
    root.style.setProperty('--color-secondary-800', this.darkenRGB(secondaryRGB, 30));
    root.style.setProperty('--color-secondary-900', this.darkenRGB(secondaryRGB, 45));
    root.style.setProperty('--color-secondary-950', this.darkenRGB(secondaryRGB, 60));
    
    // Set Accent color palette
    root.style.setProperty('--color-accent-50', this.lightenRGB(accentRGB, 95));
    root.style.setProperty('--color-accent-100', this.lightenRGB(accentRGB, 90));
    root.style.setProperty('--color-accent-200', this.lightenRGB(accentRGB, 80));
    root.style.setProperty('--color-accent-300', this.lightenRGB(accentRGB, 60));
    root.style.setProperty('--color-accent-400', this.lightenRGB(accentRGB, 30));
    root.style.setProperty('--color-accent-500', accentRGB);
    root.style.setProperty('--color-accent-600', this.darkenRGB(accentRGB, 10));
    root.style.setProperty('--color-accent-700', this.darkenRGB(accentRGB, 20));
    root.style.setProperty('--color-accent-800', this.darkenRGB(accentRGB, 30));
    root.style.setProperty('--color-accent-900', this.darkenRGB(accentRGB, 45));
    root.style.setProperty('--color-accent-950', this.darkenRGB(accentRGB, 60));
  }

  private hexToRGB(hex: string): string {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return '59 130 246'; // fallback to blue
    const r = parseInt(result[1], 16);
    const g = parseInt(result[2], 16);
    const b = parseInt(result[3], 16);
    return `${r} ${g} ${b}`;
  }

  private lighten(color: string, percent: number): string {
    const num = parseInt(color.replace("#", ""), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
      (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
      (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
  }

  private lightenRGB(rgbString: string, percent: number): string {
    const [r, g, b] = rgbString.split(' ').map(x => parseInt(x));
    const amt = Math.round(2.55 * percent);
    const newR = Math.min(255, r + amt);
    const newG = Math.min(255, g + amt);
    const newB = Math.min(255, b + amt);
    return `${newR} ${newG} ${newB}`;
  }

  private darken(color: string, percent: number): string {
    const num = parseInt(color.replace("#", ""), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) - amt;
    const G = (num >> 8 & 0x00FF) - amt;
    const B = (num & 0x0000FF) - amt;
    return "#" + (0x1000000 + (R > 255 ? 255 : R < 0 ? 0 : R) * 0x10000 +
      (G > 255 ? 255 : G < 0 ? 0 : G) * 0x100 +
      (B > 255 ? 255 : B < 0 ? 0 : B)).toString(16).slice(1);
  }

  private darkenRGB(rgbString: string, percent: number): string {
    const [r, g, b] = rgbString.split(' ').map(x => parseInt(x));
    const amt = Math.round(2.55 * percent);
    const newR = Math.max(0, r - amt);
    const newG = Math.max(0, g - amt);
    const newB = Math.max(0, b - amt);
    return `${newR} ${newG} ${newB}`;
  }

  getAvailableThemes(): Theme[] {
    return AVAILABLE_THEMES;
  }

  toggleDarkMode(): void {
    const currentTheme = this.getCurrentTheme();
    const baseThemeName = currentTheme.name.replace(/^(light-|dark-)/, '');
    const newThemeId = currentTheme.isDark ? `light-${baseThemeName}` : `dark-${baseThemeName}`;
    const newTheme = this.getThemeById(newThemeId);
    this.setTheme(newTheme);
  }

  setColorScheme(colorScheme: string): void {
    const currentTheme = this.getCurrentTheme();
    const mode = currentTheme.isDark ? 'dark' : 'light';
    const newThemeId = `${mode}-${colorScheme}`;
    const newTheme = this.getThemeById(newThemeId);
    this.setTheme(newTheme);
  }

  isDarkMode(): boolean {
    return this.getCurrentTheme().isDark;
  }

  // Auto theme methods
  enableAutoTheme(): void {
    localStorage.setItem('auto-theme-enabled', 'true');
    this.setAutoTheme();
  }

  disableAutoTheme(): void {
    localStorage.setItem('auto-theme-enabled', 'false');
  }

  isAutoThemeEnabled(): boolean {
    return localStorage.getItem('auto-theme-enabled') === 'true';
  }

  setAutoTheme(): void {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const currentTheme = this.getCurrentTheme();
    const baseThemeName = currentTheme.name.replace(/^(light-|dark-)/, '');
    const newThemeId = prefersDark ? `dark-${baseThemeName}` : `light-${baseThemeName}`;
    const newTheme = this.getThemeById(newThemeId);
    this.setTheme(newTheme);
  }

  // Debug method
  debugThemeState(): void {
    const currentTheme = this.getCurrentTheme();
    console.log('🎨 Current Theme:', currentTheme.name, currentTheme.isDark ? '(Dark)' : '(Light)');
  }

  // User profile sync
  private syncThemeToUserProfile(theme: Theme): void {
    const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
    if (token) {
      const themeData = {
        theme_id: theme.id,
        theme_name: theme.name,
        is_dark: theme.isDark
      };

      this.http.post(`${environment.apiUrl}/user/theme`, themeData, {
        headers: { Authorization: `Bearer ${token}` }
      }).subscribe({
        next: () => console.log('Theme synced to user profile'),
        error: (error) => console.warn('Failed to sync theme to profile:', error)
      });
    }
  }
}