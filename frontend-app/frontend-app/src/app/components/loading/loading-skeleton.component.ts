import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-skeleton',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="animate-pulse">
      <!-- Product Card Skeleton -->
      <div *ngIf="type === 'product-card'" class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div class="aspect-square bg-gray-200 dark:bg-gray-700"></div>
        <div class="p-4 space-y-3">
          <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
        </div>
      </div>

      <!-- Product Grid Skeleton -->
      <div *ngIf="type === 'product-grid'" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <div *ngFor="let item of [1,2,3,4,5,6,7,8]" class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div class="aspect-square bg-gray-200 dark:bg-gray-700 shimmer"></div>
          <div class="p-4 space-y-3">
            <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 shimmer"></div>
            <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 shimmer"></div>
            <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 shimmer"></div>
          </div>
        </div>
      </div>

      <!-- Text Lines Skeleton -->
      <div *ngIf="type === 'text'" class="space-y-3">
        <div *ngFor="let line of getLines()" 
             class="h-4 bg-gray-200 dark:bg-gray-700 rounded shimmer"
             [style.width.%]="line"></div>
      </div>

      <!-- Profile Skeleton -->
      <div *ngIf="type === 'profile'" class="flex items-center space-x-4">
        <div class="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full shimmer"></div>
        <div class="flex-1 space-y-2">
          <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 shimmer"></div>
          <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3 shimmer"></div>
        </div>
      </div>

      <!-- Table Skeleton -->
      <div *ngIf="type === 'table'" class="space-y-3">
        <div *ngFor="let row of [1,2,3,4,5]" class="flex space-x-4">
          <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 shimmer"></div>
          <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 shimmer"></div>
          <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/5 shimmer"></div>
          <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/6 shimmer"></div>
        </div>
      </div>

      <!-- Custom Skeleton -->
      <div *ngIf="type === 'custom'" [style.width.px]="width" [style.height.px]="height" 
           class="bg-gray-200 dark:bg-gray-700 rounded shimmer"></div>
    </div>
  `,
  styles: [`
    .shimmer {
      background: linear-gradient(90deg, 
        rgba(255,255,255,0) 0%, 
        rgba(255,255,255,0.2) 20%, 
        rgba(255,255,255,0.5) 60%, 
        rgba(255,255,255,0)
      );
      background-size: 200px 100%;
      background-repeat: no-repeat;
      animation: shimmer 1.5s infinite;
    }

    .dark .shimmer {
      background: linear-gradient(90deg, 
        rgba(255,255,255,0) 0%, 
        rgba(255,255,255,0.03) 20%, 
        rgba(255,255,255,0.06) 60%, 
        rgba(255,255,255,0)
      );
    }

    @keyframes shimmer {
      0% { background-position: -200px 0; }
      100% { background-position: calc(200px + 100%) 0; }
    }
  `]
})
export class LoadingSkeletonComponent {
  @Input() type: 'product-card' | 'product-grid' | 'text' | 'profile' | 'table' | 'custom' = 'text';
  @Input() lines: number = 3;
  @Input() width: number = 200;
  @Input() height: number = 20;

  getLines(): number[] {
    const widths = [100, 75, 90, 60, 85];
    return Array.from({ length: this.lines }, (_, i) => widths[i % widths.length]);
  }
}