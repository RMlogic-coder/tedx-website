import '../styles/main.css';
import { initSmoothScroll } from './lenis-scroll.js';
import { initHeroStageAnimation } from './hero-animation.js';
import { initSpeakersSection } from './speaker-loading-grid.js';
import { initSponsorsSection } from './sponsors.js';
import { initAudioSystem } from './audio-synth.js';

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Lenis smooth inertia scroll
  const lenis = initSmoothScroll();

  // Initialize Hero scroll-driven 3D letter flight & stage
  initHeroStageAnimation();

  // Initialize Speakers loader & 3D cards
  initSpeakersSection();

  // Initialize Sponsors animated dots
  initSponsorsSection();

  // Initialize Audio system
  initAudioSystem();

  // Setup Navigation HUD scroll triggers & smooth anchor jumps
  setupNavigation(lenis);
});

function setupNavigation(lenis) {
  const nav = document.querySelector('.site-nav');
  const navLinks = document.querySelectorAll('.nav-link-item');

  // Glassmorphic state toggle on scroll
  window.addEventListener('scroll', () => {
    if (window.scrollY > 150) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  }, { passive: true });

  // Smooth anchor navigation
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');
      if (targetId && targetId.startsWith('#')) {
        e.preventDefault();
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          if (lenis) {
            lenis.scrollTo(targetElement, { offset: -40, duration: 1.5 });
          } else {
            targetElement.scrollIntoView({ behavior: 'smooth' });
          }
        }
      }
    });
  });
}
