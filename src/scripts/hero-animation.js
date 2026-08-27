import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function initHeroStageAnimation() {
  const heroContainer = document.querySelector('.hero-scroll-container');
  const stagePinned = document.querySelector('.hero-stage-pinned');
  const glyphsLayer = document.querySelector('#glyphs-layer');
  const glyphs = document.querySelectorAll('.glyph-item');
  const officialLogoLayer = document.querySelector('#official-logo-layer');
  const shineBeam = document.querySelector('#shine-beam');
  const spotlight = document.querySelector('.stage-spotlight');
  const ambientGlow = document.querySelector('.stage-ambient-glow');
  const scrollIndicator = document.querySelector('.scroll-indicator');
  const logoSubtext = document.querySelector('.logo-subtext');
  const stageTagline = document.querySelector('.stage-tagline');

  if (!heroContainer || !stagePinned || !glyphs.length || !glyphsLayer || !officialLogoLayer || !shineBeam) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion) {
    // Accessible instant layout: show official logo directly
    gsap.set(glyphsLayer, { display: 'none' });
    gsap.set(officialLogoLayer, { clipPath: 'inset(0 0% 0 0%)', opacity: 1 });
    gsap.set(shineBeam, { display: 'none' });
    if (logoSubtext) gsap.set(logoSubtext, { opacity: 1 });
    return;
  }

  // Initial 3D flight trajectories for the 7 official glyph units:
  // [0: N], [1: A], [2: V], [3: O], [4: N], [5: मे (scaled 1.1x)], [6: ष (scaled 1.1x)]
  const trajectories = [
    { x: -320, y: -180, z: -700, rx: 35,  ry: -40, rz: -18, scale: 0.45 }, // 0: N
    { x: -220, y: 220,  z: -850, rx: -30, ry: 35,  rz: 15,  scale: 0.4  }, // 1: A
    { x: -110, y: -240, z: -950, rx: 40,  ry: -25, rz: -10, scale: 0.38 }, // 2: V
    { x: 0,    y: 160,  z: -1100, rx: -40, ry: 50,  rz: 25,  scale: 0.35 }, // 3: O
    { x: 110,  y: -200, z: -900, rx: 30,  ry: -35, rz: -15, scale: 0.38 }, // 4: N
    { x: 220,  y: 220,  z: -800, rx: -35, ry: 30,  rz: 18,  scale: 0.4  }, // 5: मे
    { x: 320,  y: -140, z: -650, rx: 25,  ry: -30, rz: -12, scale: 0.45 }, // 6: ष
  ];

  // Set initial states (Clean, flat, zero neon glow)
  gsap.set(glyphsLayer, {
    clipPath: 'inset(0 0% 0 0%)',
    opacity: 1
  });

  gsap.set(officialLogoLayer, {
    clipPath: 'inset(0 100% 0 0%)',
    opacity: 1
  });

  gsap.set(shineBeam, {
    left: '-10%',
    opacity: 0
  });

  // Set initial glyph positions in 3D perspective space (Clean spatial blur, NO neon bloom)
  glyphs.forEach((glyph, idx) => {
    const t = trajectories[idx] || trajectories[0];
    gsap.set(glyph, {
      opacity: 0.45,
      x: t.x,
      y: t.y,
      z: t.z,
      rotateX: t.rx,
      rotateY: t.ry,
      rotateZ: t.rz,
      scale: t.scale,
      filter: 'blur(3px)',
      transformOrigin: '50% 50%',
    });
  });

  // Master Scroll-Driven Stage Timeline
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: heroContainer,
      start: 'top top',
      end: '+=2800',
      pin: stagePinned,
      pinSpacing: true,
      scrub: 0.8,
      anticipatePin: 1,
      invalidateOnRefresh: true,
    }
  });

  // =========================================================================
  // PHASE 1: Awakening (0.00 -> 0.08)
  // =========================================================================
  tl.to(scrollIndicator, {
    opacity: 0,
    y: 15,
    duration: 0.06,
    ease: 'power2.out'
  }, 0);

  tl.to(spotlight, {
    opacity: 0.8,
    duration: 0.2,
    ease: 'power1.inOut'
  }, 0.02);

  tl.to(ambientGlow, {
    opacity: 0.8,
    duration: 0.2,
    ease: 'power1.inOut'
  }, 0.02);

  // =========================================================================
  // PHASE 2: Character-by-character 3D flight (0.06 -> 0.65)
  // =========================================================================
  const totalGlyphs = glyphs.length;
  const startFlight = 0.06;
  const endFlight = 0.65;
  const flightSpan = endFlight - startFlight;

  glyphs.forEach((glyph, idx) => {
    const glyphStart = startFlight + (idx / totalGlyphs) * (flightSpan * 0.68);
    const glyphDuration = flightSpan * 0.42;

    tl.to(glyph, {
      opacity: 1,
      x: 0,
      y: 0,
      z: 0,
      rotateX: 0,
      rotateY: 0,
      rotateZ: 0,
      scale: 1,
      filter: 'blur(0px)', // Completely sharp, crisp, NO GLOW
      duration: glyphDuration,
      ease: 'power2.out',
    }, glyphStart);
  });

  // =========================================================================
  // PHASE 3: Short Stable Hold (0.65 -> 0.75)
  // All characters are perfectly aligned and stable. No extra movement.
  // =========================================================================

  // =========================================================================
  // PHASE 4: CLEAN SHARP SPECULAR SHINE SWEEP (0.75 -> 0.83)
  // Narrow, controlled, quick reflection travelling across logo (~500ms equivalent)
  // NO residual glow, NO fuzzy bloom.
  // =========================================================================
  
  // Fade in narrow specular beam right as sweep starts
  tl.to(shineBeam, {
    opacity: 1,
    duration: 0.015,
    ease: 'power1.in'
  }, 0.75);

  // Animate the mask sweep object from 0 to 100
  const maskProgress = { val: 0 };

  tl.to(maskProgress, {
    val: 100,
    duration: 0.08, // Quick, crisp, controlled (~500ms)
    ease: 'power1.inOut',
    onUpdate: () => {
      const p = maskProgress.val;
      // Position narrow reflection beam across width (-5% to 105%)
      const beamLeft = -5 + (p * 1.10);
      shineBeam.style.left = `${beamLeft}%`;

      // Layer A (Individual Glyphs): Clipped OUT cleanly from left to right
      glyphsLayer.style.clipPath = `inset(0 0% 0 ${p}%)`;

      // Layer B (Official Master Logo): Clipped IN cleanly from left to right
      officialLogoLayer.style.clipPath = `inset(0 ${100 - p}% 0 0%)`;
    }
  }, 0.75);

  // Immediately fade out reflection beam as it exits the right edge
  tl.to(shineBeam, {
    opacity: 0,
    duration: 0.015,
    ease: 'power1.out'
  }, 0.825);

  // Hide Layer A completely after shine completes for clean DOM state
  tl.to(glyphsLayer, {
    opacity: 0,
    duration: 0.01
  }, 0.83);

  // Reveal tagline underneath clean official logo
  tl.to(logoSubtext, {
    opacity: 1,
    y: 0,
    duration: 0.06,
    ease: 'power2.out'
  }, 0.83);

  tl.to(stageTagline, {
    opacity: 0,
    y: -20,
    duration: 0.06,
    ease: 'power2.in'
  }, 0.83);

  // =========================================================================
  // PHASE 5: Locked Official Logo & Section Transition (0.86 -> 1.00)
  // Clean, flat, crisp official logo remains locked, transitioning to Speakers
  // =========================================================================
  tl.to(stagePinned, {
    scale: 0.94,
    opacity: 0.1,
    filter: 'blur(8px)',
    duration: 0.14,
    ease: 'power2.inOut'
  }, 0.88);

  tl.to(spotlight, {
    opacity: 0,
    duration: 0.10,
    ease: 'power2.in'
  }, 0.90);

  setTimeout(() => {
    ScrollTrigger.refresh();
  }, 200);
}
