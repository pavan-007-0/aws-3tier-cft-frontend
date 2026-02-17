import { Component, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AnimatedButtonComponent } from '../ui/animated-button.component';

@Component({
  selector: 'app-hero-section',
  standalone: true,
  imports: [CommonModule, RouterModule, AnimatedButtonComponent],
  template: `
    <section class="hero-section relative overflow-hidden min-h-screen flex items-center">
      <!-- Animated Background -->
      <div class="absolute inset-0 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 dark:from-gray-900 dark:via-gray-800 dark:to-black">
        <!-- Floating Shapes -->
        <div class="floating-shapes">
          <div class="shape shape-1"></div>
          <div class="shape shape-2"></div>
          <div class="shape shape-3"></div>
          <div class="shape shape-4"></div>
          <div class="shape shape-5"></div>
        </div>
        
        <!-- Grid Pattern -->
        <div class="absolute inset-0 bg-grid-pattern opacity-10"></div>
        
        <!-- Gradient Overlay -->
        <div class="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
      </div>

      <!-- Parallax Elements -->
      <div #parallaxContainer class="absolute inset-0 pointer-events-none">
        <div class="parallax-element parallax-slow">
          <div class="w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
        </div>
        <div class="parallax-element parallax-medium">
          <div class="w-32 h-32 bg-primary-300/20 rounded-full blur-2xl"></div>
        </div>
        <div class="parallax-element parallax-fast">
          <div class="w-48 h-48 bg-accent-400/10 rounded-full blur-xl"></div>
        </div>
      </div>

      <!-- Content -->
      <div class="container relative z-10">
        <div class="max-w-4xl mx-auto text-center">
          <!-- Main Heading -->
          <h1 class="hero-title text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            <span class="inline-block animate-fade-in-up" style="animation-delay: 0.2s">Shop</span>
            <span class="inline-block animate-fade-in-up gradient-text" style="animation-delay: 0.4s">Smart</span>
            <br>
            <span class="inline-block animate-fade-in-up" style="animation-delay: 0.6s">Live</span>
            <span class="inline-block animate-fade-in-up gradient-text" style="animation-delay: 0.8s">Better</span>
          </h1>

          <!-- Subtitle -->
          <p class="text-xl md:text-2xl text-gray-200 mb-8 max-w-2xl mx-auto animate-fade-in-up" style="animation-delay: 1s">
            Discover premium products with cutting-edge technology and unmatched quality. 
            Your journey to excellence starts here.
          </p>

          <!-- CTA Buttons -->
          <div class="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-up" style="animation-delay: 1.2s">
            <app-animated-button
              text="Explore Products"
              variant="gradient"
              size="lg"
              [glowEffect]="true"
              (clicked)="navigateToProducts()"
            ></app-animated-button>
            
            <app-animated-button
              text="Watch Demo"
              variant="glass"
              size="lg"
              icon="<svg class='w-5 h-5' fill='currentColor' viewBox='0 0 20 20'><path fill-rule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z' clip-rule='evenodd'></path></svg>"
              (clicked)="playDemo()"
            ></app-animated-button>
          </div>

          <!-- Stats -->
          <div class="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 animate-fade-in-up" style="animation-delay: 1.4s">
            <div class="stat-item" *ngFor="let stat of stats">
              <div class="text-3xl md:text-4xl font-bold text-white mb-2 counter" [attr.data-target]="stat.value">
                {{ stat.displayValue }}
              </div>
              <div class="text-gray-300 text-sm uppercase tracking-wider">{{ stat.label }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Scroll Indicator -->
      <div class="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div class="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
          <div class="w-1 h-3 bg-white/60 rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>

      <!-- Particles -->
      <div class="particles-container absolute inset-0 pointer-events-none">
        <div class="particle" *ngFor="let particle of particles" 
             [style.left.%]="particle.x" 
             [style.top.%]="particle.y"
             [style.animation-delay.s]="particle.delay"
             [style.animation-duration.s]="particle.duration">
        </div>
      </div>
    </section>
  `,
  styles: [`
    .hero-section {
      position: relative;
      background: linear-gradient(135deg, var(--theme-primary), var(--theme-accent));
    }

    .floating-shapes {
      position: absolute;
      inset: 0;
      overflow: hidden;
    }

    .shape {
      position: absolute;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      animation: float 20s infinite linear;
    }

    .shape-1 {
      width: 300px;
      height: 300px;
      top: 10%;
      left: -10%;
      animation-delay: 0s;
    }

    .shape-2 {
      width: 200px;
      height: 200px;
      top: 60%;
      right: -5%;
      animation-delay: -5s;
    }

    .shape-3 {
      width: 150px;
      height: 150px;
      top: 30%;
      right: 20%;
      animation-delay: -10s;
    }

    .shape-4 {
      width: 100px;
      height: 100px;
      bottom: 20%;
      left: 10%;
      animation-delay: -15s;
    }

    .shape-5 {
      width: 250px;
      height: 250px;
      bottom: -10%;
      right: -10%;
      animation-delay: -7s;
    }

    @keyframes float {
      0%, 100% { transform: translateY(0px) rotate(0deg); }
      25% { transform: translateY(-20px) rotate(90deg); }
      50% { transform: translateY(0px) rotate(180deg); }
      75% { transform: translateY(20px) rotate(270deg); }
    }

    .bg-grid-pattern {
      background-image: 
        linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px);
      background-size: 50px 50px;
    }

    .parallax-element {
      position: absolute;
      will-change: transform;
    }

    .parallax-slow { top: 20%; left: 10%; }
    .parallax-medium { top: 60%; right: 15%; }
    .parallax-fast { bottom: 30%; left: 60%; }

    .gradient-text {
      background: linear-gradient(135deg, #fbbf24, #f59e0b, #d97706);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .stat-item {
      text-align: center;
      padding: 1rem;
      border-radius: 1rem;
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2);
      transition: transform 0.3s ease;
    }

    .stat-item:hover {
      transform: translateY(-5px);
    }

    .particle {
      position: absolute;
      width: 4px;
      height: 4px;
      background: rgba(255, 255, 255, 0.6);
      border-radius: 50%;
      animation: particle-float 10s infinite linear;
    }

    @keyframes particle-float {
      0% {
        transform: translateY(100vh) scale(0);
        opacity: 0;
      }
      10% {
        opacity: 1;
      }
      90% {
        opacity: 1;
      }
      100% {
        transform: translateY(-100px) scale(1);
        opacity: 0;
      }
    }

    .animate-fade-in-up {
      opacity: 0;
      transform: translateY(30px);
      animation: fadeInUp 0.8s ease-out forwards;
    }

    @keyframes fadeInUp {
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    /* Responsive adjustments */
    @media (max-width: 768px) {
      .hero-title {
        font-size: 3rem;
      }
      
      .shape {
        display: none;
      }
    }
  `]
})
export class HeroSectionComponent implements OnInit, OnDestroy {
  @ViewChild('parallaxContainer', { static: true }) parallaxContainer!: ElementRef;

  stats = [
    { value: 10000, displayValue: '10K+', label: 'Happy Customers' },
    { value: 500, displayValue: '500+', label: 'Premium Products' },
    { value: 50, displayValue: '50+', label: 'Global Brands' },
    { value: 99, displayValue: '99%', label: 'Satisfaction Rate' }
  ];

  particles: Array<{x: number, y: number, delay: number, duration: number}> = [];

  private animationId?: number;

  ngOnInit() {
    this.generateParticles();
    this.startParallaxEffect();
    this.animateCounters();
  }

  ngOnDestroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
  }

  private generateParticles() {
    for (let i = 0; i < 20; i++) {
      this.particles.push({
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: Math.random() * 10,
        duration: 8 + Math.random() * 4
      });
    }
  }

  private startParallaxEffect() {
    const handleScroll = () => {
      const scrolled = window.pageYOffset;
      const parallaxElements = this.parallaxContainer.nativeElement.querySelectorAll('.parallax-element');
      
      parallaxElements.forEach((element: HTMLElement, index: number) => {
        const speed = 0.5 + (index * 0.2);
        const yPos = -(scrolled * speed);
        element.style.transform = `translateY(${yPos}px)`;
      });

      this.animationId = requestAnimationFrame(handleScroll);
    };

    handleScroll();
  }

  private animateCounters() {
    const counters = document.querySelectorAll('.counter');
    
    counters.forEach((counter: Element) => {
      const target = parseInt((counter as HTMLElement).dataset['target'] || '0');
      const increment = target / 100;
      let current = 0;
      
      const updateCounter = () => {
        if (current < target) {
          current += increment;
          (counter as HTMLElement).textContent = Math.ceil(current).toLocaleString();
          setTimeout(updateCounter, 20);
        } else {
          (counter as HTMLElement).textContent = target.toLocaleString();
        }
      };
      
      setTimeout(updateCounter, 1500);
    });
  }

  navigateToProducts() {
    // Navigate to products page
    console.log('Navigate to products');
  }

  playDemo() {
    // Play demo video or show modal
    console.log('Play demo');
  }
}