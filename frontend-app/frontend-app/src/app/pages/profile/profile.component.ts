import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService, User } from '../../services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  template: `
    <!-- Profile Header -->
    <div class="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white py-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex flex-col md:flex-row items-center space-y-6 md:space-y-0 md:space-x-8">
          <!-- Avatar -->
          <div class="relative">
            <div class="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border-4 border-white/30">
              <img 
                *ngIf="user?.avatar" 
                [src]="user?.avatar" 
                [alt]="user?.name"
                class="w-full h-full rounded-full object-cover"
              />
              <div *ngIf="!user?.avatar" class="text-4xl font-bold">
                {{ getUserInitials() }}
              </div>
            </div>
            <button class="absolute bottom-2 right-2 w-8 h-8 bg-primary-500 hover:bg-primary-600 rounded-full flex items-center justify-center transition-colors">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
              </svg>
            </button>
          </div>
          
          <!-- User Info -->
          <div class="text-center md:text-left">
            <h1 class="text-3xl font-bold mb-2">{{ user?.name }}</h1>
            <p class="text-primary-100 text-lg mb-2">{{ user?.email }}</p>
            <div class="flex flex-wrap justify-center md:justify-start gap-2">
              <span class="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium">
                {{ user?.role === 'admin' ? '👑 Administrator' : '👤 Customer' }}
              </span>
              <span class="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium">
                📅 Member since {{ formatDate(user?.createdAt) }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Profile Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        <!-- Sidebar Navigation -->
        <div class="lg:col-span-1">
          <nav class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 sticky top-8">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Account Settings</h3>
            <ul class="space-y-2">
              <li>
                <button 
                  (click)="activeTab = 'profile'"
                  [class]="activeTab === 'profile' ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'"
                  class="w-full text-left px-4 py-3 rounded-lg font-medium transition-colors flex items-center space-x-3"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                  </svg>
                  <span>Profile Info</span>
                </button>
              </li>
              <li>
                <button 
                  (click)="activeTab = 'orders'"
                  [class]="activeTab === 'orders' ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'"
                  class="w-full text-left px-4 py-3 rounded-lg font-medium transition-colors flex items-center space-x-3"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                  <span>Order History</span>
                </button>
              </li>
              <li>
                <button 
                  (click)="activeTab = 'security'"
                  [class]="activeTab === 'security' ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'"
                  class="w-full text-left px-4 py-3 rounded-lg font-medium transition-colors flex items-center space-x-3"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                  </svg>
                  <span>Security</span>
                </button>
              </li>
              <li>
                <button 
                  (click)="activeTab = 'preferences'"
                  [class]="activeTab === 'preferences' ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'"
                  class="w-full text-left px-4 py-3 rounded-lg font-medium transition-colors flex items-center space-x-3"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  </svg>
                  <span>Preferences</span>
                </button>
              </li>
            </ul>
          </nav>
        </div>

        <!-- Main Content -->
        <div class="lg:col-span-3">
          
          <!-- Profile Info Tab -->
          <div *ngIf="activeTab === 'profile'" class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
            <div class="flex items-center justify-between mb-8">
              <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Profile Information</h2>
              <button 
                *ngIf="!editMode"
                (click)="enableEditMode()"
                class="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors flex items-center space-x-2"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
                </svg>
                <span>Edit Profile</span>
              </button>
            </div>

            <form [formGroup]="profileForm" (ngSubmit)="saveProfile()" *ngIf="editMode; else viewMode">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Name -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Full Name</label>
                  <input 
                    type="text" 
                    formControlName="name"
                    class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <!-- Email -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email Address</label>
                  <input 
                    type="email" 
                    formControlName="email"
                    class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <!-- Phone -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Phone Number</label>
                  <input 
                    type="tel" 
                    formControlName="phone"
                    class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <!-- Address -->
                <div class="md:col-span-2">
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Address</label>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input 
                      type="text" 
                      formControlName="street"
                      placeholder="Street Address"
                      class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                    <input 
                      type="text" 
                      formControlName="city"
                      placeholder="City"
                      class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                    <input 
                      type="text" 
                      formControlName="state"
                      placeholder="State/Province"
                      class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                    <input 
                      type="text" 
                      formControlName="zipCode"
                      placeholder="ZIP/Postal Code"
                      class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="flex justify-end space-x-4 mt-8">
                <button 
                  type="button"
                  (click)="cancelEdit()"
                  class="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  [disabled]="profileForm.invalid || saving"
                  class="px-6 py-3 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center space-x-2"
                >
                  <span *ngIf="saving" class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                  <span>{{ saving ? 'Saving...' : 'Save Changes' }}</span>
                </button>
              </div>
            </form>

            <!-- View Mode -->
            <ng-template #viewMode>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div class="space-y-6">
                  <div>
                    <label class="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Full Name</label>
                    <p class="text-lg font-medium text-gray-900 dark:text-white">{{ user?.name }}</p>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Email Address</label>
                    <p class="text-lg font-medium text-gray-900 dark:text-white">{{ user?.email }}</p>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Phone Number</label>
                    <p class="text-lg font-medium text-gray-900 dark:text-white">{{ user?.phone || 'Not provided' }}</p>
                  </div>
                </div>
                <div class="space-y-6">
                  <div>
                    <label class="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Address</label>
                    <div class="text-lg font-medium text-gray-900 dark:text-white">
                      <p *ngIf="user?.address?.street">{{ user?.address?.street }}</p>
                      <p *ngIf="user?.address?.city">{{ user?.address?.city }}, {{ user?.address?.state }} {{ user?.address?.zipCode }}</p>
                      <p *ngIf="user?.address?.country">{{ user?.address?.country }}</p>
                      <p *ngIf="!user?.address?.street" class="text-gray-500 dark:text-gray-400">No address provided</p>
                    </div>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Account Type</label>
                    <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
                          [class]="user?.role === 'admin' ? 'bg-primary-100 text-primary-800 dark:bg-primary-900/20 dark:text-primary-400' : 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'">
                      {{ user?.role === 'admin' ? '👑 Administrator' : '👤 Customer' }}
                    </span>
                  </div>
                </div>
              </div>
            </ng-template>
          </div>

          <!-- Orders Tab -->
          <div *ngIf="activeTab === 'orders'" class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-8">Order History</h2>
            
            <div *ngIf="loadingOrders" class="flex justify-center py-12">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>

            <div *ngIf="!loadingOrders && orders.length === 0" class="text-center py-12">
              <svg class="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">No orders yet</h3>
              <p class="text-gray-500 dark:text-gray-400 mb-6">Start shopping to see your orders here!</p>
              <a routerLink="/products" class="inline-flex items-center px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors">
                Browse Products
              </a>
            </div>

            <div *ngIf="!loadingOrders && orders.length > 0" class="space-y-6">
              <div *ngFor="let order of orders" class="border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                  <div>
                    <h3 class="text-lg font-semibold text-gray-900 dark:text-white">{{ order.order_number }}</h3>
                    <p class="text-sm text-gray-500 dark:text-gray-400">Placed on {{ formatDate(order.created_at) }}</p>
                  </div>
                  <div class="flex items-center space-x-4 mt-4 md:mt-0">
                    <span class="px-3 py-1 rounded-full text-sm font-medium"
                          [ngClass]="getOrderStatusClass(order.status)">
                      {{ getOrderStatusText(order.status) }}
                    </span>
                    <span class="text-lg font-bold text-gray-900 dark:text-white">\${{ order.total_amount }}</span>
                  </div>
                </div>
                
                <div *ngIf="order.items" class="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <div *ngFor="let item of order.items" class="flex justify-between items-center py-2">
                    <span class="text-gray-900 dark:text-white">{{ item.product_name }} × {{ item.quantity }}</span>
                    <span class="font-medium text-gray-900 dark:text-white">\${{ item.unit_price }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Security Tab -->
          <div *ngIf="activeTab === 'security'" class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-8">Security Settings</h2>
            
            <form [formGroup]="passwordForm" (ngSubmit)="changePassword()" class="space-y-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Current Password</label>
                <input 
                  type="password" 
                  formControlName="currentPassword"
                  class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">New Password</label>
                <input 
                  type="password" 
                  formControlName="newPassword"
                  class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Confirm New Password</label>
                <input 
                  type="password" 
                  formControlName="confirmPassword"
                  class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <button 
                type="submit"
                [disabled]="passwordForm.invalid || changingPassword"
                class="px-6 py-3 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center space-x-2"
              >
                <span *ngIf="changingPassword" class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                <span>{{ changingPassword ? 'Changing...' : 'Change Password' }}</span>
              </button>
            </form>
          </div>

          <!-- Preferences Tab -->
          <div *ngIf="activeTab === 'preferences'" class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-8">Preferences</h2>
            
            <div class="space-y-8">
              <!-- Notifications -->
              <div>
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Notifications</h3>
                <div class="space-y-4">
                  <label class="flex items-center">
                    <input 
                      type="checkbox" 
                      [(ngModel)]="preferences.newsletter"
                      class="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span class="ml-3 text-gray-700 dark:text-gray-300">Email newsletter</span>
                  </label>
                  <label class="flex items-center">
                    <input 
                      type="checkbox" 
                      [(ngModel)]="preferences.notifications"
                      class="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span class="ml-3 text-gray-700 dark:text-gray-300">Order notifications</span>
                  </label>
                </div>
              </div>

              <!-- Theme -->
              <div>
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Theme</h3>
                <select 
                  [(ngModel)]="preferences.theme"
                  class="w-full max-w-xs px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="auto">Auto (System)</option>
                </select>
              </div>

              <button 
                (click)="savePreferences()"
                [disabled]="savingPreferences"
                class="px-6 py-3 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center space-x-2"
              >
                <span *ngIf="savingPreferences" class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                <span>{{ savingPreferences ? 'Saving...' : 'Save Preferences' }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .animate-fade-in {
      animation: fadeIn 0.3s ease-out;
    }
    
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class ProfileComponent implements OnInit, OnDestroy {
  user: User | null = null;
  activeTab = 'profile';
  editMode = false;
  saving = false;
  changingPassword = false;
  savingPreferences = false;
  loadingOrders = false;
  orders: any[] = [];
  
  profileForm: FormGroup;
  passwordForm: FormGroup;
  preferences = {
    newsletter: true,
    notifications: true,
    theme: 'auto' as 'light' | 'dark' | 'auto'
  };

  private subscriptions: Subscription[] = [];

  constructor(
    private authService: AuthService,
    private fb: FormBuilder
  ) {
    this.profileForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      street: [''],
      city: [''],
      state: [''],
      zipCode: ['']
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.subscriptions.push(
      this.authService.currentUser$.subscribe(user => {
        this.user = user;
        if (user) {
          this.updateProfileForm();
          this.loadPreferences();
          this.loadOrders();
        }
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  getUserInitials(): string {
    if (!this.user?.name) return 'U';
    return this.user.name.split(' ').map(n => n[0]).join('').toUpperCase();
  }

  formatDate(dateString?: string): string {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  enableEditMode() {
    this.editMode = true;
    this.updateProfileForm();
  }

  cancelEdit() {
    this.editMode = false;
    this.updateProfileForm();
  }

  updateProfileForm() {
    if (this.user) {
      this.profileForm.patchValue({
        name: this.user.name,
        email: this.user.email,
        phone: this.user.phone || '',
        street: this.user.address?.street || '',
        city: this.user.address?.city || '',
        state: this.user.address?.state || '',
        zipCode: this.user.address?.zipCode || ''
      });
    }
  }

  saveProfile() {
    if (this.profileForm.valid && this.user) {
      this.saving = true;
      const formValue = this.profileForm.value;
      
      const updates: Partial<User> = {
        name: formValue.name,
        email: formValue.email,
        phone: formValue.phone,
        address: {
          street: formValue.street,
          city: formValue.city,
          state: formValue.state,
          zipCode: formValue.zipCode,
          country: this.user.address?.country || 'USA'
        }
      };

      this.authService.updateProfile(updates).subscribe({
        next: () => {
          this.saving = false;
          this.editMode = false;
          // Show success message
        },
        error: (error) => {
          this.saving = false;
          console.error('Error updating profile:', error);
        }
      });
    }
  }

  changePassword() {
    if (this.passwordForm.valid) {
      const { currentPassword, newPassword, confirmPassword } = this.passwordForm.value;
      
      if (newPassword !== confirmPassword) {
        // Show error message
        return;
      }

      this.changingPassword = true;
      this.authService.changePassword(currentPassword, newPassword).subscribe({
        next: () => {
          this.changingPassword = false;
          this.passwordForm.reset();
          // Show success message
        },
        error: (error) => {
          this.changingPassword = false;
          console.error('Error changing password:', error);
        }
      });
    }
  }

  loadPreferences() {
    if (this.user?.preferences) {
      this.preferences = { ...this.user.preferences };
    }
  }

  savePreferences() {
    this.savingPreferences = true;
    
    const updates: Partial<User> = {
      preferences: this.preferences
    };

    this.authService.updateProfile(updates).subscribe({
      next: () => {
        this.savingPreferences = false;
        // Show success message
      },
      error: (error) => {
        this.savingPreferences = false;
        console.error('Error saving preferences:', error);
      }
    });
  }

  loadOrders() {
    this.loadingOrders = true;
    this.authService.getUserOrders().subscribe({
      next: (orders) => {
        this.orders = orders;
        this.loadingOrders = false;
      },
      error: (error) => {
        this.loadingOrders = false;
        console.error('Error loading orders:', error);
      }
    });
  }

  getOrderStatusClass(status: string): string {
    const classes = {
      'pending': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
      'confirmed': 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
      'processing': 'bg-primary-100 text-primary-800 dark:bg-primary-900/20 dark:text-primary-400',
      'shipped': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-400',
      'delivered': 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      'cancelled': 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
    };
    return classes[status as keyof typeof classes] || classes.pending;
  }

  getOrderStatusText(status: string): string {
    const texts = {
      'pending': '⏳ Pending',
      'confirmed': '✅ Confirmed',
      'processing': '⚙️ Processing',
      'shipped': '🚚 Shipped',
      'delivered': '📦 Delivered',
      'cancelled': '❌ Cancelled'
    };
    return texts[status as keyof typeof texts] || '⏳ Pending';
  }
}
