import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-home-enterprise',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <!-- Hero Section with Gradient Background -->
    <section class="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 dark:from-gray-900 dark:via-purple-900 dark:to-indigo-900">
      <!-- Animated Background Elements -->
      <div class="absolute inset-0 overflow-hidden">
        <div class="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div class="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-amber-500/10 rounded-full blur-2xl animate-bounce-subtle"></div>
      </div>

      <!-- Grid Pattern Overlay -->
      <div class="absolute inset-0 bg-grid-pattern opacity-5"></div>

      <div class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <!-- Main Hero Content -->
        <div class="space-y-8">
          <!-- Badge -->
          <div class="inline-flex items-center px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white/90 text-sm font-medium animate-fade-in">
            <span class="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
            New: AI-Powered Shopping Experience
          </div>

          <!-- Main Heading -->
          <h1 class="text-5xl md:text-7xl lg:text-8xl font-bold text-white leading-tight animate-slide-in-up">
            Shop the
            <span class="bg-gradient-to-r from-purple-400 via-indigo-400 to-amber-400 bg-clip-text text-transparent animate-gradient-x">
              Future
            </span>
            <br />
            <span class="text-4xl md:text-6xl lg:text-7xl text-white/90">
              Today
            </span>
          </h1>

          <!-- Subtitle -->
          <p class="text-xl md:text-2xl text-white/80 max-w-4xl mx-auto leading-relaxed animate-slide-in-up delay-200">
            Discover premium products with cutting-edge technology, exceptional quality, and unbeatable prices. 
            Your perfect shopping experience starts here.
          </p>

          <!-- CTA Buttons -->
          <div class="flex flex-col sm:flex-row gap-4 justify-center items-center animate-slide-in-up delay-400">
            <button class="group relative px-8 py-4 bg-white text-purple-900 rounded-2xl font-semibold text-lg hover:bg-white/90 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl">
              <span class="relative z-10">Shop Now</span>
              <div class="absolute inset-0 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
            </button>
            
            <button class="group px-8 py-4 border-2 border-white/30 text-white rounded-2xl font-semibold text-lg hover:bg-white/10 hover:border-white/50 transition-all duration-300 backdrop-blur-sm">
              <span class="flex items-center">
                View Deals
                <svg class="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path>
                </svg>
              </span>
            </button>
          </div>

          <!-- Stats -->
          <div class="grid grid-cols-3 gap-8 max-w-2xl mx-auto mt-16 animate-slide-in-up delay-600">
            <div class="text-center">
              <div class="text-3xl md:text-4xl font-bold text-white mb-2">50K+</div>
              <div class="text-white/70 text-sm md:text-base">Happy Customers</div>
            </div>
            <div class="text-center">
              <div class="text-3xl md:text-4xl font-bold text-white mb-2">10K+</div>
              <div class="text-white/70 text-sm md:text-base">Products</div>
            </div>
            <div class="text-center">
              <div class="text-3xl md:text-4xl font-bold text-white mb-2">99%</div>
              <div class="text-white/70 text-sm md:text-base">Satisfaction</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Scroll Indicator -->
      <div class="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div class="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
          <div class="w-1 h-3 bg-white/50 rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="py-24 bg-white dark:bg-gray-900 relative overflow-hidden">
      <!-- Background Pattern -->
      <div class="absolute inset-0 bg-dot-pattern opacity-5"></div>
      
      <div class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Section Header -->
        <div class="text-center mb-20">
          <h2 class="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Why Choose 
            <span class="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              EcomStore
            </span>
          </h2>
          <p class="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Experience the future of online shopping with our innovative features and exceptional service
          </p>
        </div>

        <!-- Features Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <!-- Feature 1 -->
          <div class="group relative p-8 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-200/50 dark:border-gray-700/50">
            <div class="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-indigo-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div class="relative z-10">
              <div class="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <span class="text-2xl">⚡</span>
              </div>
              <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-4">Lightning Fast</h3>
              <p class="text-gray-600 dark:text-gray-300 leading-relaxed">
                Quick loading times and instant search results for seamless shopping
              </p>
            </div>
          </div>

          <!-- Feature 2 -->
          <div class="group relative p-8 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-200/50 dark:border-gray-700/50">
            <div class="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-indigo-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div class="relative z-10">
              <div class="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <span class="text-2xl">🔒</span>
              </div>
              <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-4">Secure & Safe</h3>
              <p class="text-gray-600 dark:text-gray-300 leading-relaxed">
                Advanced security measures to protect your data and transactions
              </p>
            </div>
          </div>

          <!-- Feature 3 -->
          <div class="group relative p-8 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-200/50 dark:border-gray-700/50">
            <div class="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-indigo-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div class="relative z-10">
              <div class="w-16 h-16 bg-gradient-to-br from-pink-400 to-pink-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <span class="text-2xl">💝</span>
              </div>
              <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-4">Customer Love</h3>
              <p class="text-gray-600 dark:text-gray-300 leading-relaxed">
                24/7 support and hassle-free returns for complete satisfaction
              </p>
            </div>
          </div>

          <!-- Feature 4 -->
          <div class="group relative p-8 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-200/50 dark:border-gray-700/50">
            <div class="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-indigo-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div class="relative z-10">
              <div class="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <span class="text-2xl">💰</span>
              </div>
              <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-4">Best Prices</h3>
              <p class="text-gray-600 dark:text-gray-300 leading-relaxed">
                Competitive pricing with regular deals and exclusive offers
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Products Preview Section -->
    <section class="py-24 bg-gray-50 dark:bg-gray-800 relative">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Section Header -->
        <div class="text-center mb-16">
          <h2 class="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Featured Products
          </h2>
          <p class="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Discover our handpicked selection of premium products
          </p>
        </div>

        <!-- Products Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          <!-- Product Card 1 -->
          <div class="group relative bg-white dark:bg-gray-900 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 overflow-hidden border border-gray-200/50 dark:border-gray-700/50">
            <div class="aspect-w-16 aspect-h-12 bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900/20 dark:to-indigo-900/20">
              <div class="flex items-center justify-center">
                <span class="text-6xl">👕</span>
              </div>
            </div>
            <div class="p-6">
              <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">Premium T-Shirt</h3>
              <p class="text-gray-600 dark:text-gray-300 mb-4">Comfortable cotton blend</p>
              <div class="flex items-center justify-between">
                <span class="text-2xl font-bold text-purple-600 dark:text-purple-400">$29.99</span>
                <button class="px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors duration-200">
                  Add to Cart
                </button>
              </div>
            </div>
          </div>

          <!-- Product Card 2 -->
          <div class="group relative bg-white dark:bg-gray-900 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 overflow-hidden border border-gray-200/50 dark:border-gray-700/50">
            <div class="aspect-w-16 aspect-h-12 bg-gradient-to-br from-indigo-100 to-amber-100 dark:from-indigo-900/20 dark:to-amber-900/20">
              <div class="flex items-center justify-center">
                <span class="text-6xl">👟</span>
              </div>
            </div>
            <div class="p-6">
              <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">Sport Sneakers</h3>
              <p class="text-gray-600 dark:text-gray-300 mb-4">High-performance athletic shoes</p>
              <div class="flex items-center justify-between">
                <span class="text-2xl font-bold text-purple-600 dark:text-purple-400">$89.99</span>
                <button class="px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors duration-200">
                  Add to Cart
                </button>
              </div>
            </div>
          </div>

          <!-- Product Card 3 -->
          <div class="group relative bg-white dark:bg-gray-900 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 overflow-hidden border border-gray-200/50 dark:border-gray-700/50">
            <div class="aspect-w-16 aspect-h-12 bg-gradient-to-br from-amber-100 to-purple-100 dark:from-amber-900/20 dark:to-purple-900/20">
              <div class="flex items-center justify-center">
                <span class="text-6xl">🎧</span>
              </div>
            </div>
            <div class="p-6">
              <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">Wireless Headphones</h3>
              <p class="text-gray-600 dark:text-gray-300 mb-4">Premium sound quality</p>
              <div class="flex items-center justify-between">
                <span class="text-2xl font-bold text-purple-600 dark:text-purple-400">$199.99</span>
                <button class="px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors duration-200">
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- View All Products Button -->
        <div class="text-center">
          <button class="group inline-flex items-center px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-2xl font-semibold text-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
            View All Products
            <svg class="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path>
            </svg>
          </button>
        </div>
      </div>
    </section>

    <!-- Newsletter Section -->
    <section class="py-24 bg-gradient-to-r from-purple-600 via-indigo-600 to-amber-600 relative overflow-hidden">
      <!-- Background Elements -->
      <div class="absolute inset-0">
        <div class="absolute top-0 left-0 w-full h-full bg-black/10"></div>
        <div class="absolute -top-24 -right-24 w-48 h-48 bg-white/10 rounded-full blur-2xl"></div>
        <div class="absolute -bottom-24 -left-24 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
      </div>

      <div class="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 class="text-4xl md:text-5xl font-bold text-white mb-6">
          Stay Updated
        </h2>
        <p class="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
          Get the latest deals, new arrivals, and exclusive offers delivered to your inbox
        </p>
        
        <div class="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
          <input 
            type="email" 
            placeholder="Enter your email" 
            class="flex-1 px-6 py-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50"
          >
          <button class="px-8 py-4 bg-white text-purple-600 rounded-2xl font-semibold hover:bg-white/90 transition-colors duration-200 whitespace-nowrap">
            Subscribe
          </button>
        </div>
      </div>
    </section>
  `,
  styles: [`
    @keyframes gradient-x {
      0%, 100% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
    }
    
    .animate-gradient-x {
      background-size: 200% 200%;
      animation: gradient-x 3s ease infinite;
    }
    
    .animate-fade-in {
      animation: fadeIn 0.8s ease-out;
    }
    
    .animate-slide-in-up {
      animation: slideInUp 0.8s ease-out;
    }
    
    .delay-200 { animation-delay: 0.2s; }
    .delay-400 { animation-delay: 0.4s; }
    .delay-600 { animation-delay: 0.6s; }
    
    @keyframes fadeIn {
      0% { opacity: 0; }
      100% { opacity: 1; }
    }
    
    @keyframes slideInUp {
      0% { 
        opacity: 0; 
        transform: translateY(30px); 
      }
      100% { 
        opacity: 1; 
        transform: translateY(0); 
      }
    }
    
    .bg-grid-pattern {
      background-image: 
        linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px);
      background-size: 50px 50px;
    }
    
    .bg-dot-pattern {
      background-image: radial-gradient(circle, rgba(0,0,0,0.1) 1px, transparent 1px);
      background-size: 20px 20px;
    }
  `]
})
export class HomeEnterpriseComponent implements OnInit {
  
  constructor() { }

  ngOnInit(): void {
  }
}
