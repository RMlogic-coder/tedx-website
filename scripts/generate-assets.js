import fs from 'fs';
import path from 'path';

const speakersDir = path.resolve('public/assets/speakers');
if (!fs.existsSync(speakersDir)) {
  fs.mkdirSync(speakersDir, { recursive: true });
}

const sponsorsDir = path.resolve('public/assets/sponsors');
if (!fs.existsSync(sponsorsDir)) {
  fs.mkdirSync(sponsorsDir, { recursive: true });
}

const speakers = [
  { id: '01', name: 'Dr. Aarav Chen', category: 'Quantum Computing', theme: '#eb0028', initials: 'AC', gender: 'm' },
  { id: '02', name: 'Maya Varma', category: 'Synthetic Biology', theme: '#ff4d6d', initials: 'MV', gender: 'f' },
  { id: '03', name: 'Vikramaditya Roy', category: 'Interstellar Dynamics', theme: '#c1121f', initials: 'VR', gender: 'm' },
  { id: '04', name: 'Elena Rostova', category: 'Acoustic Anthropology', theme: '#780000', initials: 'ER', gender: 'f' },
  { id: '05', name: 'Kiran Deshmukh', category: 'Zero-Point Energy', theme: '#e62b1e', initials: 'KD', gender: 'm' },
  { id: '06', name: 'Sofia Al-Mansoor', category: 'Cognitive Sovereignty', theme: '#ba181b', initials: 'SM', gender: 'f' },
  { id: '07', name: 'Tariq Thorne', category: 'Neuro-Prosthetics', theme: '#a4161a', initials: 'TT', gender: 'm' },
  { id: '08', name: 'Ananya Sen', category: 'Atmospheric Engineering', theme: '#eb0028', initials: 'AS', gender: 'f' },
];

speakers.forEach(speaker => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1000" width="800" height="1000">
  <defs>
    <radialGradient id="bg-glow-${speaker.id}" cx="50%" cy="35%" r="65%">
      <stop offset="0%" stop-color="#2a0d14"/>
      <stop offset="50%" stop-color="#141418"/>
      <stop offset="100%" stop-color="#070709"/>
    </radialGradient>
    <linearGradient id="lighting-${speaker.id}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.15"/>
      <stop offset="40%" stop-color="${speaker.theme}" stop-opacity="0.4"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0.95"/>
    </linearGradient>
    <linearGradient id="edge-light-${speaker.id}" x1="100%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#E62B1E" stop-opacity="0.6"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
    </linearGradient>
    <filter id="noise-${speaker.id}">
      <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" result="noise"/>
      <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.08 0"/>
      <feComposite in2="SourceGraphic" in="gl" operator="in"/>
    </filter>
  </defs>

  <!-- Deep Stage Backdrop -->
  <rect width="800" height="1000" fill="url(#bg-glow-${speaker.id})"/>
  
  <!-- Subtle Stage Rim Light -->
  <circle cx="400" cy="380" r="320" fill="none" stroke="${speaker.theme}" stroke-width="1.5" stroke-opacity="0.25" stroke-dasharray="8 8"/>
  <circle cx="400" cy="380" r="260" fill="none" stroke="#FFFFFF" stroke-width="1" stroke-opacity="0.1"/>

  <!-- High Fashion Editorial Portrait Silhouette -->
  <g transform="translate(0, 40)">
    <!-- Shoulders / Torso -->
    <path d="M 160 900 C 180 720 260 620 340 560 L 460 560 C 540 620 620 720 640 900 Z" fill="#0d0d12" stroke="#ffffff" stroke-opacity="0.08" stroke-width="2"/>
    <path d="M 160 900 C 180 720 260 620 340 560 L 460 560 C 540 620 620 720 640 900 Z" fill="url(#lighting-${speaker.id})"/>

    <!-- Neck -->
    <path d="M 350 560 L 350 470 C 370 485 430 485 450 470 L 450 560 Z" fill="#18181f"/>
    <!-- Neck Rim light -->
    <path d="M 445 470 L 445 560" stroke="#E62B1E" stroke-width="3" stroke-linecap="round" opacity="0.6"/>

    <!-- Head & Jaw -->
    <path d="M 280 340 C 280 200 520 200 520 340 C 520 440 470 510 400 510 C 330 510 280 440 280 340 Z" fill="#1c1c24"/>
    <path d="M 280 340 C 280 200 520 200 520 340 C 520 440 470 510 400 510 C 330 510 280 440 280 340 Z" fill="url(#lighting-${speaker.id})"/>
    
    <!-- Editorial Chiaroscuro Shadow Edge -->
    <path d="M 400 200 C 480 200 515 280 515 360 C 515 440 460 500 400 510 Z" fill="#E62B1E" opacity="0.18"/>
    <path d="M 515 300 C 520 360 480 450 410 500" stroke="#FF4D6D" stroke-width="3.5" stroke-linecap="round" opacity="0.7"/>

    <!-- Facial Structure Accents -->
    <path d="M 370 340 L 400 395 L 380 415" fill="none" stroke="#FFFFFF" stroke-width="1.5" stroke-opacity="0.25" stroke-linecap="round"/>
    <line x1="330" y1="320" x2="370" y2="320" stroke="#FFFFFF" stroke-width="2" stroke-opacity="0.3" stroke-linecap="round"/>
    <line x1="430" y1="320" x2="470" y2="320" stroke="#FFFFFF" stroke-width="2" stroke-opacity="0.3" stroke-linecap="round"/>
  </g>

  <!-- Editorial Typographic Badging on Portrait -->
  <rect x="40" y="40" width="80" height="32" rx="4" fill="#000000" fill-opacity="0.6" stroke="#ffffff" stroke-opacity="0.15"/>
  <text x="80" y="61" text-anchor="middle" font-family="'Space Grotesk', -apple-system, sans-serif" font-size="14" font-weight="700" letter-spacing="3" fill="#E62B1E">
    ${speaker.id}
  </text>

  <!-- Monogram Watermark -->
  <text x="730" y="100" text-anchor="end" font-family="'Inter', sans-serif" font-size="44" font-weight="900" letter-spacing="4" fill="#ffffff" fill-opacity="0.04">
    ${speaker.initials}
  </text>

  <!-- Bottom Gradient Vignette -->
  <rect y="700" width="800" height="300" fill="url(#bottom-fade-${speaker.id})"/>
  <defs>
    <linearGradient id="bottom-fade-${speaker.id}" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#070709" stop-opacity="0"/>
      <stop offset="70%" stop-color="#070709" stop-opacity="0.9"/>
      <stop offset="100%" stop-color="#070709" stop-opacity="1"/>
    </linearGradient>
  </defs>

  <!-- Speaker Name / Category Overlay for Clean Look -->
  <text x="50" y="910" font-family="'Inter', sans-serif" font-size="28" font-weight="700" letter-spacing="1" fill="#FFFFFF">
    ${speaker.name.toUpperCase()}
  </text>
  <text x="50" y="945" font-family="'Inter', sans-serif" font-size="14" font-weight="600" letter-spacing="3" fill="#E62B1E">
    ${speaker.category.toUpperCase()}
  </text>
</svg>`;

  fs.writeFileSync(path.join(speakersDir, `speaker-${speaker.id}.jpg`), svg);
  fs.writeFileSync(path.join(speakersDir, `speaker-${speaker.id}.svg`), svg);
});

console.log('Successfully generated speaker assets in /public/assets/speakers');
