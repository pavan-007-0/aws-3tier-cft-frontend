import { Injectable } from '@angular/core';
import { trigger, state, style, transition, animate, keyframes, query, stagger, group } from '@angular/animations';

@Injectable({
  providedIn: 'root'
})
export class AnimationService {

  // Fade animations
  static fadeIn = trigger('fadeIn', [
    transition(':enter', [
      style({ opacity: 0 }),
      animate('300ms ease-in', style({ opacity: 1 }))
    ])
  ]);

  static fadeInUp = trigger('fadeInUp', [
    transition(':enter', [
      style({ opacity: 0, transform: 'translateY(30px)' }),
      animate('400ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
    ])
  ]);

  static fadeInDown = trigger('fadeInDown', [
    transition(':enter', [
      style({ opacity: 0, transform: 'translateY(-30px)' }),
      animate('400ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
    ])
  ]);

  static fadeInLeft = trigger('fadeInLeft', [
    transition(':enter', [
      style({ opacity: 0, transform: 'translateX(-30px)' }),
      animate('400ms ease-out', style({ opacity: 1, transform: 'translateX(0)' }))
    ])
  ]);

  static fadeInRight = trigger('fadeInRight', [
    transition(':enter', [
      style({ opacity: 0, transform: 'translateX(30px)' }),
      animate('400ms ease-out', style({ opacity: 1, transform: 'translateX(0)' }))
    ])
  ]);

  // Scale animations
  static scaleIn = trigger('scaleIn', [
    transition(':enter', [
      style({ opacity: 0, transform: 'scale(0.8)' }),
      animate('300ms ease-out', style({ opacity: 1, transform: 'scale(1)' }))
    ])
  ]);

  static scaleInBounce = trigger('scaleInBounce', [
    transition(':enter', [
      style({ opacity: 0, transform: 'scale(0.3)' }),
      animate('600ms cubic-bezier(0.68, -0.55, 0.265, 1.55)', 
        style({ opacity: 1, transform: 'scale(1)' }))
    ])
  ]);

  // Slide animations
  static slideInUp = trigger('slideInUp', [
    transition(':enter', [
      style({ transform: 'translateY(100%)' }),
      animate('400ms ease-out', style({ transform: 'translateY(0)' }))
    ])
  ]);

  static slideInDown = trigger('slideInDown', [
    transition(':enter', [
      style({ transform: 'translateY(-100%)' }),
      animate('400ms ease-out', style({ transform: 'translateY(0)' }))
    ])
  ]);

  // Stagger animations for lists
  static staggerIn = trigger('staggerIn', [
    transition('* => *', [
      query(':enter', [
        style({ opacity: 0, transform: 'translateY(30px)' }),
        stagger(100, [
          animate('400ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
        ])
      ], { optional: true })
    ])
  ]);

  // Hover animations
  static hoverScale = trigger('hoverScale', [
    state('normal', style({ transform: 'scale(1)' })),
    state('hovered', style({ transform: 'scale(1.05)' })),
    transition('normal <=> hovered', animate('200ms ease-in-out'))
  ]);

  static hoverLift = trigger('hoverLift', [
    state('normal', style({ transform: 'translateY(0) scale(1)', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' })),
    state('hovered', style({ 
      transform: 'translateY(-4px) scale(1.02)', 
      boxShadow: '0 10px 25px rgba(0,0,0,0.15)' 
    })),
    transition('normal <=> hovered', animate('200ms ease-out'))
  ]);

  // Loading animations
  static pulse = trigger('pulse', [
    state('normal', style({ transform: 'scale(1)', opacity: 1 })),
    state('pulsed', style({ transform: 'scale(1.1)', opacity: 0.8 })),
    transition('normal <=> pulsed', animate('1s ease-in-out'))
  ]);

  static shimmer = trigger('shimmer', [
    transition(':enter', [
      animate('1.5s ease-in-out infinite', keyframes([
        style({ backgroundPosition: '-200px 0', offset: 0 }),
        style({ backgroundPosition: 'calc(200px + 100%) 0', offset: 1 })
      ]))
    ])
  ]);

  // Route animations
  static routeSlide = trigger('routeSlide', [
    transition('* <=> *', [
      style({ position: 'relative' }),
      query(':enter, :leave', [
        style({
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%'
        })
      ], { optional: true }),
      query(':enter', [
        style({ left: '-100%' })
      ], { optional: true }),
      query(':leave', animate('300ms ease-in', style({ left: '100%' })), { optional: true }),
      query(':enter', animate('300ms ease-in', style({ left: '0%' })), { optional: true })
    ])
  ]);

  // Complex animations
  static cardFlip = trigger('cardFlip', [
    state('front', style({ transform: 'rotateY(0deg)' })),
    state('back', style({ transform: 'rotateY(180deg)' })),
    transition('front <=> back', animate('600ms ease-in-out'))
  ]);

  static morphButton = trigger('morphButton', [
    state('normal', style({ 
      borderRadius: '8px',
      width: 'auto',
      height: '40px'
    })),
    state('loading', style({ 
      borderRadius: '20px',
      width: '40px',
      height: '40px'
    })),
    transition('normal <=> loading', animate('300ms ease-in-out'))
  ]);

  // Notification animations
  static slideInNotification = trigger('slideInNotification', [
    transition(':enter', [
      style({ transform: 'translateX(100%)', opacity: 0 }),
      animate('300ms ease-out', style({ transform: 'translateX(0)', opacity: 1 }))
    ]),
    transition(':leave', [
      animate('300ms ease-in', style({ transform: 'translateX(100%)', opacity: 0 }))
    ])
  ]);

  // Shopping cart animations
  static addToCart = trigger('addToCart', [
    transition('* => added', [
      animate('600ms ease-out', keyframes([
        style({ transform: 'scale(1)', offset: 0 }),
        style({ transform: 'scale(1.2)', offset: 0.3 }),
        style({ transform: 'scale(0.9)', offset: 0.6 }),
        style({ transform: 'scale(1)', offset: 1 })
      ]))
    ])
  ]);

  // Page transitions
  static pageTransition = trigger('pageTransition', [
    transition(':enter', [
      style({ opacity: 0, transform: 'translateY(20px)' }),
      animate('400ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
    ])
  ]);

  // Skeleton loading
  static skeletonPulse = trigger('skeletonPulse', [
    transition(':enter', [
      animate('1.5s ease-in-out infinite alternate', keyframes([
        style({ opacity: 1, offset: 0 }),
        style({ opacity: 0.4, offset: 1 })
      ]))
    ])
  ]);
}