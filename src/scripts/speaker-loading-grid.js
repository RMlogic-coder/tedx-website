import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { playSound } from './audio-synth.js';

gsap.registerPlugin(ScrollTrigger);

let currentSpeakersState = [];
let isInitialLoaded = false;

export async function initSpeakersSection() {
  const gridElement = document.querySelector('.speakers-grid');
  const loaderWrap = document.querySelector('.speakers-loader-wrap');
  const progressFill = document.querySelector('.loader-progress-fill');
  const percentageText = document.querySelector('.loader-percentage');
  const section = document.querySelector('.speakers-section');

  if (!gridElement || !section) return;

  // 1. Fetch initial public speaker state from backend API (database-driven CMS)
  try {
    const res = await fetch('/api/speakers');
    const data = await res.json();
    if (data.success && Array.isArray(data.speakers)) {
      currentSpeakersState = data.speakers;
    }
  } catch (err) {
    console.warn('Could not fetch from /api/speakers, falling back to local defaults.', err);
  }

  // Render cards based on database reveal state
  renderSpeakerCards(gridElement, currentSpeakersState);

  // 2. Setup dynamic loading sequence reflecting Domain Revealed & Fully Revealed speakers
  setupSpeakersLoader({
    section,
    loaderWrap,
    progressFill,
    percentageText,
    gridElement
  });

  // 3. Setup real-time Server-Sent Events (SSE) listener
  setupSSEListener(gridElement, progressFill, percentageText);
}

// Increases whenever a Domain is revealed OR a Full speaker is revealed
function calculateRevealPercentage(speakers) {
  if (!speakers || !speakers.length) return 0;
  const revealedCount = speakers.filter(s => 
    s.reveal_stage === 'DOMAIN_REVEALED' || 
    s.reveal_stage === 'FULL_SPEAKER_REVEALED' || 
    s.revealed === true
  ).length;
  const total = speakers.length || 8;
  return Math.round((revealedCount / total) * 100);
}

function renderSpeakerCards(grid, speakers) {
  if (!speakers || !speakers.length) {
    grid.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; color: #8e8e93; padding: 4rem 1rem;">No speakers published at this time.</div>`;
    return;
  }

  grid.innerHTML = speakers.map(speaker => {
    const stage = speaker.reveal_stage || (speaker.revealed ? 'FULL_SPEAKER_REVEALED' : 'LOCKED');

    if (stage === 'FULL_SPEAKER_REVEALED' || speaker.revealed) {
      return renderFullSpeakerCardHTML(speaker);
    } else if (stage === 'DOMAIN_REVEALED') {
      return renderDomainRevealedCardHTML(speaker);
    } else if (stage === 'HINT_REVEALED') {
      return renderHintRevealedCardHTML(speaker);
    } else {
      return renderLockedCardHTML(speaker);
    }
  }).join('');

  setupCardInteractions();
}

// -------------------------------------------------------------------------
// STAGE 4: FULL SPEAKER REVEALED CARD (Flippable to talk details & socials)
// -------------------------------------------------------------------------
function renderFullSpeakerCardHTML(speaker) {
  const domain = speaker.domain || speaker.category || 'Special Presentation';
  const role = speaker.designation || speaker.role || '';
  const org = speaker.organization ? ` • ${speaker.organization}` : '';
  const photo = speaker.photo_url || speaker.image || `/assets/speakers/speaker-${speaker.id}.jpg`;
  const talkTitle = speaker.talk_title || speaker.talkTitle || 'Keynote Presentation';
  const talkDesc = speaker.talk_description || speaker.description || 'Exploring transformative ideas on the Navonmesh stage.';

  const socials = [];
  if (speaker.linkedin_url || speaker.social?.linkedin) {
    const url = speaker.linkedin_url || speaker.social?.linkedin;
    socials.push(`
      <a href="${url}" target="_blank" rel="noopener noreferrer" class="social-icon-btn" aria-label="${speaker.name} on LinkedIn">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.64 1.64 0 1 0 0-3.28 1.64 1.64 0 0 0 0 3.28m1.4 9.74v-8.37H5.06v8.37h2.8z"/>
        </svg>
      </a>
    `);
  }
  if (speaker.twitter_url || speaker.social?.x) {
    const url = speaker.twitter_url || speaker.social?.x;
    socials.push(`
      <a href="${url}" target="_blank" rel="noopener noreferrer" class="social-icon-btn" aria-label="${speaker.name} on X">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      </a>
    `);
  }
  if (speaker.instagram_url || speaker.social?.instagram) {
    const url = speaker.instagram_url || speaker.social?.instagram;
    socials.push(`
      <a href="${url}" target="_blank" rel="noopener noreferrer" class="social-icon-btn" aria-label="${speaker.name} on Instagram">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
        </svg>
      </a>
    `);
  }
  if (speaker.website_url || speaker.social?.website) {
    const url = speaker.website_url || speaker.social?.website;
    socials.push(`
      <a href="${url}" target="_blank" rel="noopener noreferrer" class="social-icon-btn" aria-label="${speaker.name} Website">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="2" y1="12" x2="22" y2="12"></line>
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1 4-10z"></path>
        </svg>
      </a>
    `);
  }

  return `
    <div 
      class="speaker-card-container is-stage-full is-revealed-card is-flippable card-revealed" 
      data-id="${speaker.id}"
      data-stage="FULL_SPEAKER_REVEALED"
      tabindex="0"
      role="button"
      aria-label="Speaker ${speaker.id}: ${speaker.name}, ${role}. Press Enter or click to flip card."
      aria-expanded="false"
    >
      <div class="speaker-card-inner">
        <!-- FRONT FACE -->
        <div class="card-face card-face-front">
          <div class="card-image-wrap">
            <img 
              src="${photo}" 
              alt="Portrait of ${speaker.name}" 
              loading="lazy"
              onerror="this.src='/assets/speakers/speaker-${speaker.id}.svg'"
            />
            <div class="card-image-overlay"></div>
            
            <div class="card-front-header">
              <span class="speaker-number-badge">#${speaker.id}</span>
              <span class="flip-hint-pill">
                Explore Talk
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M7 17l9.2-9.2M17 17V7H7"/>
                </svg>
              </span>
            </div>
          </div>

          <div class="card-front-body">
            <span class="speaker-category-tag">${domain}</span>
            <h3 class="speaker-name">${speaker.name}</h3>
            <p class="speaker-role">${role}${org}</p>
          </div>
        </div>

        <!-- BACK FACE -->
        <div class="card-face card-face-back">
          <div class="card-back-top">
            <div class="card-back-header">
              <span class="talk-badge">TEDx Talk</span>
              <button class="flip-back-btn" type="button" aria-label="Flip back to front">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M1 4v6h6M23 20v-6h-6"/>
                  <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/>
                </svg>
                Flip
              </button>
            </div>

            <h4 class="card-talk-title">“${talkTitle}”</h4>
            <p class="card-talk-desc">${talkDesc}</p>
            
            ${speaker.quote || speaker.bio ? `
              <div class="card-quote-box">
                "${speaker.quote || speaker.bio}"
              </div>
            ` : ''}
          </div>

          <div class="card-back-bottom">
            <div class="card-speaker-meta-back">
              <span class="name">${speaker.name}</span>
              <span class="id">SPEAKER #${speaker.id}</span>
            </div>

            ${socials.length > 0 ? `
              <div class="card-social-links">
                ${socials.join('')}
              </div>
            ` : ''}
          </div>
        </div>
      </div>
    </div>
  `;
}

// -------------------------------------------------------------------------
// STAGE 3: DOMAIN REVEALED CARD (Flippable to TEDxIIIT Raichur red+black back)
// -------------------------------------------------------------------------
function renderDomainRevealedCardHTML(speaker) {
  const domain = speaker.domain || speaker.category || 'Undisclosed Domain';

  return `
    <div 
      class="speaker-card-container is-stage-domain is-flippable card-revealed" 
      data-id="${speaker.id}"
      data-stage="DOMAIN_REVEALED"
      tabindex="0"
      role="button"
      aria-label="Speaker ${speaker.id}: Domain revealed as ${domain}. Press Enter or click to flip card to view TEDxIIIT Raichur branding."
      aria-expanded="false"
    >
      <div class="speaker-card-inner">
        <!-- DOMAIN FRONT FACE -->
        <div class="card-face card-face-domain-front">
          <div class="domain-header-row">
            <span class="speaker-number-badge">#${speaker.id}</span>
            <span class="badge-domain-tag">Domain Revealed</span>
          </div>

          <div class="domain-center-content">
            <div class="domain-aperture-visual" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="14.31" y1="8" x2="20.05" y2="17.94"></line>
                <line x1="9.69" y1="8" x2="21.17" y2="8"></line>
                <line x1="7.38" y1="12" x2="13.12" y2="2.06"></line>
                <line x1="9.69" y1="16" x2="3.95" y2="6.06"></line>
                <line x1="14.31" y1="16" x2="2.83" y2="16"></line>
                <line x1="16.62" y1="12" x2="10.88" y2="21.94"></line>
              </svg>
            </div>

            <div class="domain-title-wrap">
              <span class="domain-pre-label">Domain</span>
              <h3 class="domain-main-title">${domain}</h3>
            </div>

            ${speaker.hint ? `
              <div class="domain-hint-box">
                “${speaker.hint}”
              </div>
            ` : ''}
          </div>

          <div class="flip-action-pill">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M1 4v6h6M23 20v-6h-6"/>
              <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/>
            </svg>
            <span>↻ Flip to Reveal</span>
          </div>
        </div>

        <!-- DOMAIN BACK FACE (Sophisticated Red + Black Gradient + Centered Official TEDx Logo) -->
        <div class="card-face card-face-domain-back">
          <div class="domain-header-row">
            <span class="speaker-number-badge">#${speaker.id}</span>
            <span class="badge-domain-tag">Identity Pending</span>
          </div>

          <div class="domain-back-center-logo">
            <img 
              src="/assets/branding/tedxiiit-raichur-logo.svg" 
              alt="TEDxIIIT Raichur Official Logo" 
              class="tedx-branding-logo"
            />
            <div class="domain-back-tagline">
              NAVONMESH 2026 • <span>TEDx</span>IIIT RAICHUR
            </div>
          </div>

          <div class="flip-action-pill">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M1 4v6h6M23 20v-6h-6"/>
              <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/>
            </svg>
            <span>Tap to Flip Back</span>
          </div>
        </div>
      </div>
    </div>
  `;
}

// -------------------------------------------------------------------------
// STAGE 2: HINT REVEALED CARD (Non-flippable mystery with clue)
// -------------------------------------------------------------------------
function renderHintRevealedCardHTML(speaker) {
  return `
    <div 
      class="speaker-card-container is-stage-hint card-revealed" 
      data-id="${speaker.id}"
      data-stage="HINT_REVEALED"
      tabindex="-1"
      aria-label="Speaker ${speaker.id}: Clue revealed. Domain and identity awaiting unlock."
    >
      <div class="speaker-card-inner">
        <div class="card-face card-hint-face">
          <div class="hint-header-row">
            <span class="placeholder-top-num">#${speaker.id}</span>
            <span class="badge-hint-tag">Hint Revealed</span>
          </div>

          <div class="hint-center-content">
            <div class="hint-mystery-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            </div>
            <span class="hint-label">Speaker Clue</span>
            <div class="hint-quote-text">
              “${speaker.hint || 'A visionary voice preparing to reshape the boundaries of human knowledge.'}”
            </div>
          </div>

          <div class="placeholder-bottom-status">
            <span class="placeholder-status-dot"></span>
            <span>DOMAIN LOCKED • • •</span>
          </div>
        </div>
      </div>
    </div>
  `;
}

// -------------------------------------------------------------------------
// STAGE 1: LOCKED CARD (Non-flippable mystery placeholder)
// -------------------------------------------------------------------------
function renderLockedCardHTML(speaker) {
  return `
    <div 
      class="speaker-card-container is-stage-locked is-unrevealed card-revealed" 
      data-id="${speaker.id}"
      data-stage="LOCKED"
      tabindex="-1"
      aria-label="Speaker ${speaker.id}: Awaiting stage unlock. Coming soon."
    >
      <div class="speaker-card-inner">
        <div class="card-face card-placeholder-face">
          <span class="placeholder-top-num">#${speaker.id}</span>
          
          <div class="placeholder-center-radar">
            <div class="radar-rings">
              <div class="radar-ring-outer"></div>
              <div class="radar-ring-inner"></div>
              <div class="radar-core-dot"></div>
            </div>
            <h3 class="placeholder-title">COMING SOON</h3>
            <span class="placeholder-subtext">Awaiting Stage Reveal</span>
          </div>

          <div class="placeholder-bottom-status">
            <span class="placeholder-status-dot"></span>
            <span>LOCKED • • •</span>
          </div>
        </div>
      </div>
    </div>
  `;
}

// -------------------------------------------------------------------------
// DYNAMIC VIEWPORT SCROLL LOADER (High Opacity, Bold Line Graph Track)
// -------------------------------------------------------------------------
function setupSpeakersLoader({ section, loaderWrap, progressFill, percentageText, gridElement }) {
  ScrollTrigger.create({
    trigger: section,
    start: 'top 75%',
    once: true,
    onEnter: () => {
      if (isInitialLoaded) return;
      isInitialLoaded = true;

      const targetPercentage = calculateRevealPercentage(currentSpeakersState);
      const duration = 1.4;
      const obj = { value: 0 };

      gsap.to(obj, {
        value: targetPercentage,
        duration: duration,
        ease: 'power2.out',
        onUpdate: () => {
          const current = Math.floor(obj.value);
          if (percentageText) percentageText.textContent = `${current}%`;
          if (progressFill) progressFill.style.width = `${current}%`;
        },
        onComplete: () => {
          if (percentageText) percentageText.textContent = `${targetPercentage}%`;
          if (progressFill) progressFill.style.width = `${targetPercentage}%`;

          setTimeout(() => {
            // Keep loader high opacity and fully crisp!
            loaderWrap.style.opacity = '1';

            gridElement.classList.add('is-revealed');
            
            const cards = gridElement.querySelectorAll('.speaker-card-container');
            cards.forEach((card, i) => {
              setTimeout(() => {
                card.classList.add('card-revealed');
              }, i * 80);
            });
          }, 250);
        }
      });
    }
  });
}

// -------------------------------------------------------------------------
// 3D FLIP CARD INTERACTION CONTROLLER (Keyboard + Click + Touch)
// -------------------------------------------------------------------------
function setupCardInteractions() {
  const flippableCards = document.querySelectorAll('.speaker-card-container.is-flippable');

  flippableCards.forEach(card => {
    if (card._hasFlipBound) return;
    card._hasFlipBound = true;

    card.addEventListener('click', (e) => {
      if (e.target.closest('a')) return;
      toggleCardFlip(card);
    });

    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        if (e.target.closest('a')) return;
        e.preventDefault();
        toggleCardFlip(card);
      } else if (e.key === 'Escape' && card.classList.contains('is-flipped')) {
        card.classList.remove('is-flipped');
        card.setAttribute('aria-expanded', 'false');
        playSound('flip');
      }
    });

    const flipBackBtn = card.querySelector('.flip-back-btn');
    if (flipBackBtn) {
      flipBackBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        card.classList.remove('is-flipped');
        card.setAttribute('aria-expanded', 'false');
        playSound('flip');
      });
    }
  });
}

function toggleCardFlip(card) {
  const isFlipped = card.classList.toggle('is-flipped');
  card.setAttribute('aria-expanded', isFlipped ? 'true' : 'false');
  playSound('flip');
}

// -------------------------------------------------------------------------
// SERVER-SENT EVENTS (SSE) REAL-TIME SYNCHRONIZATION
// -------------------------------------------------------------------------
function setupSSEListener(gridElement, progressFill, percentageText) {
  if (!window.EventSource) return;

  const eventSource = new EventSource('/api/speakers/stream');

  eventSource.addEventListener('speaker-update', (event) => {
    try {
      const data = JSON.parse(event.data);
      if (!data || !Array.isArray(data.speakers)) return;

      const newSpeakers = data.speakers;
      handleLiveSpeakerUpdates(gridElement, newSpeakers, progressFill, percentageText);
    } catch (err) {
      console.warn('Error parsing SSE speaker-update event:', err);
    }
  });
}

function handleLiveSpeakerUpdates(gridElement, newSpeakers, progressFill, percentageText) {
  // Update progress bar dynamically whenever domain or full reveal changes
  const targetPercentage = calculateRevealPercentage(newSpeakers);
  if (percentageText) percentageText.textContent = `${targetPercentage}%`;
  if (progressFill) progressFill.style.width = `${targetPercentage}%`;

  const currentIds = currentSpeakersState.map(s => s.id).join(',');
  const newIds = newSpeakers.map(s => s.id).join(',');

  if (currentIds !== newIds) {
    renderSpeakerCards(gridElement, newSpeakers);
    currentSpeakersState = newSpeakers;
    return;
  }

  newSpeakers.forEach(newSpeaker => {
    const existingIndex = currentSpeakersState.findIndex(s => s.id === newSpeaker.id);
    const prevSpeaker = currentSpeakersState[existingIndex];

    const cardElement = gridElement.querySelector(`.speaker-card-container[data-id="${newSpeaker.id}"]`);

    const prevStage = prevSpeaker?.reveal_stage || (prevSpeaker?.revealed ? 'FULL_SPEAKER_REVEALED' : 'LOCKED');
    const newStage = newSpeaker.reveal_stage || (newSpeaker.revealed ? 'FULL_SPEAKER_REVEALED' : 'LOCKED');

    const contentChanged = JSON.stringify(prevSpeaker) !== JSON.stringify(newSpeaker);

    if ((prevStage !== newStage || contentChanged) && cardElement) {
      let tempHTML = '';
      if (newStage === 'FULL_SPEAKER_REVEALED' || newSpeaker.revealed) {
        tempHTML = renderFullSpeakerCardHTML(newSpeaker);
      } else if (newStage === 'DOMAIN_REVEALED') {
        tempHTML = renderDomainRevealedCardHTML(newSpeaker);
      } else if (newStage === 'HINT_REVEALED') {
        tempHTML = renderHintRevealedCardHTML(newSpeaker);
      } else {
        tempHTML = renderLockedCardHTML(newSpeaker);
      }

      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = tempHTML;
      const newCard = tempDiv.firstElementChild;
      newCard.classList.add('card-revealing-now');

      cardElement.replaceWith(newCard);
      setupCardInteractions();
      playSound('flip');

      setTimeout(() => {
        newCard.classList.remove('card-revealing-now');
      }, 1500);
    }
  });

  currentSpeakersState = newSpeakers;
}
