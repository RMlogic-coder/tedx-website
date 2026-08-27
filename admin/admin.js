// Admin Panel & Complete Speaker CMS System
let authToken = localStorage.getItem('navonmesh_admin_token') || null;
let speakersCache = [];
let editingSpeaker = null;
let isFormDirty = false;
let confirmCallback = null;

// DOM Elements
const loginSection = document.getElementById('login-section');
const dashboardSection = document.getElementById('dashboard-section');
const loginForm = document.getElementById('login-form');
const adminPassInput = document.getElementById('admin-pass');
const loginErrorMsg = document.getElementById('login-error-msg');
const logoutBtn = document.getElementById('logout-btn');

// Progress Stats
const adminRevealedCount = document.getElementById('admin-revealed-count');
const adminTotalCount = document.getElementById('admin-total-count');
const adminProgressPercent = document.getElementById('admin-progress-percent');
const adminProgressFill = document.getElementById('admin-progress-fill');
const pillFull = document.getElementById('pill-full');
const pillDomain = document.getElementById('pill-domain');
const pillHint = document.getElementById('pill-hint');
const pillLocked = document.getElementById('pill-locked');
const rosterCountBadge = document.getElementById('roster-count-badge');
const speakersList = document.getElementById('speakers-list');

// Top Actions
const btnRevealNext = document.getElementById('btn-reveal-next');
const btnRevealAllDomains = document.getElementById('btn-reveal-all-domains');
const btnRevealAllFull = document.getElementById('btn-reveal-all-full');
const btnHideAll = document.getElementById('btn-hide-all');
const toastNotice = document.getElementById('toast-notice');

// Edit Modal Elements
const editModal = document.getElementById('edit-modal');
const modalCloseBtn = document.getElementById('modal-close-btn');
const btnModalCancel = document.getElementById('btn-modal-cancel');
const btnModalPreview = document.getElementById('btn-modal-preview');
const speakerEditForm = document.getElementById('speaker-edit-form');
const modalTitle = document.getElementById('modal-title');
const modalEyebrow = document.getElementById('modal-eyebrow');

const editPhotoPreview = document.getElementById('edit-photo-preview');
const editPhotoInput = document.getElementById('edit-photo-input');
const btnTriggerUpload = document.getElementById('btn-trigger-upload');
const btnRemovePhoto = document.getElementById('btn-remove-photo');

const editName = document.getElementById('edit-name');
const editDesignation = document.getElementById('edit-designation');
const editOrganization = document.getElementById('edit-organization');
const editDomain = document.getElementById('edit-domain');
const editHint = document.getElementById('edit-hint');
const editTalkTitle = document.getElementById('edit-talk-title');
const editTalkDesc = document.getElementById('edit-talk-desc');
const editBio = document.getElementById('edit-bio');
const editQuote = document.getElementById('edit-quote');
const editLinkedin = document.getElementById('edit-linkedin');
const editTwitter = document.getElementById('edit-twitter');
const editInstagram = document.getElementById('edit-instagram');
const editWebsite = document.getElementById('edit-website');
const editPublished = document.getElementById('edit-published');
const publishedStatusText = document.getElementById('published-status-text');

// Preview Modal Elements
const previewModal = document.getElementById('preview-modal');
const previewCloseBtn = document.getElementById('preview-close-btn');
const previewTitle = document.getElementById('preview-title');
const previewCardViewport = document.getElementById('preview-card-viewport');
const previewTabs = document.querySelectorAll('.btn-preview-tab');
let previewActiveStage = 'DOMAIN_REVEALED';
let currentPreviewSpeaker = null;

// Confirm Dialog Elements
const confirmModal = document.getElementById('confirm-modal');
const confirmTitle = document.getElementById('confirm-title');
const confirmMessage = document.getElementById('confirm-message');
const btnConfirmCancel = document.getElementById('btn-confirm-cancel');
const btnConfirmProceed = document.getElementById('btn-confirm-proceed');

// Initialization
document.addEventListener('DOMContentLoaded', () => {
  checkSession();
  setupEventListeners();
});

function setupEventListeners() {
  loginForm.addEventListener('submit', handleLogin);
  logoutBtn.addEventListener('click', handleLogout);

  btnRevealNext.addEventListener('click', handleRevealNext);
  btnRevealAllDomains.addEventListener('click', handleRevealAllDomains);
  btnRevealAllFull.addEventListener('click', handleRevealAllFull);
  btnHideAll.addEventListener('click', handleHideAll);

  // Edit Modal Event Listeners
  modalCloseBtn.addEventListener('click', requestCloseEditModal);
  btnModalCancel.addEventListener('click', requestCloseEditModal);
  speakerEditForm.addEventListener('submit', handleSaveSpeaker);
  speakerEditForm.addEventListener('input', () => { isFormDirty = true; });

  btnTriggerUpload.addEventListener('click', () => editPhotoInput.click());
  editPhotoInput.addEventListener('change', handlePhotoUpload);
  btnRemovePhoto.addEventListener('click', handleRemovePhoto);

  editPublished.addEventListener('change', () => {
    isFormDirty = true;
    publishedStatusText.textContent = editPublished.checked 
      ? 'Published (Visible on Stage)' 
      : 'Draft (Hidden from Public Stage)';
    publishedStatusText.style.color = editPublished.checked ? '#ffffff' : '#a1a1aa';
  });

  btnModalPreview.addEventListener('click', () => {
    if (editingSpeaker) {
      openPreviewModal(collectFormData());
    }
  });

  // Preview Modal Listeners
  previewCloseBtn.addEventListener('click', closePreviewModal);
  previewTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      previewTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      previewActiveStage = tab.dataset.previewStage;
      renderPreviewCard();
    });
  });

  // Confirm Modal Listeners
  btnConfirmCancel.addEventListener('click', () => {
    confirmModal.style.display = 'none';
    confirmCallback = null;
  });
  btnConfirmProceed.addEventListener('click', () => {
    confirmModal.style.display = 'none';
    if (typeof confirmCallback === 'function') confirmCallback();
    confirmCallback = null;
  });
}

// ----------------------------------------------------
// AUTHENTICATION
// ----------------------------------------------------
async function checkSession() {
  if (!authToken) {
    showLogin();
    return;
  }

  try {
    const res = await fetch('/api/admin/me', {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });

    if (res.ok) {
      showDashboard();
      loadSpeakers();
    } else {
      localStorage.removeItem('navonmesh_admin_token');
      authToken = null;
      showLogin();
    }
  } catch (err) {
    showLogin();
  }
}

async function handleLogin(e) {
  e.preventDefault();
  const password = adminPassInput.value.trim();
  if (!password) return;

  loginErrorMsg.style.display = 'none';

  try {
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    });

    const data = await res.json();
    if (res.ok && data.success) {
      authToken = data.token;
      localStorage.setItem('navonmesh_admin_token', authToken);
      adminPassInput.value = '';
      showDashboard();
      loadSpeakers();
      showToast('Authenticated as Administrator.');
    } else {
      loginErrorMsg.textContent = data.error || 'Authentication failed.';
      loginErrorMsg.style.display = 'block';
    }
  } catch (err) {
    loginErrorMsg.textContent = 'Server connection error.';
    loginErrorMsg.style.display = 'block';
  }
}

async function handleLogout() {
  try {
    await fetch('/api/admin/logout', { method: 'POST' });
  } catch (e) {}
  localStorage.removeItem('navonmesh_admin_token');
  authToken = null;
  showLogin();
}

function showLogin() {
  loginSection.style.display = 'flex';
  dashboardSection.style.display = 'none';
}

function showDashboard() {
  loginSection.style.display = 'none';
  dashboardSection.style.display = 'flex';
}

// ----------------------------------------------------
// LOAD & RENDER SPEAKERS
// ----------------------------------------------------
async function loadSpeakers() {
  try {
    const res = await fetch('/api/admin/speakers', {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });

    if (res.status === 401 || res.status === 403) {
      handleLogout();
      return;
    }

    const data = await res.json();
    if (data.success && Array.isArray(data.speakers)) {
      speakersCache = data.speakers;
      renderRoster(speakersCache);
    }
  } catch (err) {
    showToast('Error loading speakers from database.');
  }
}

function renderRoster(speakers) {
  let fullCount = 0;
  let domainCount = 0;
  let hintCount = 0;
  let lockedCount = 0;
  const total = speakers.length;

  speakersList.innerHTML = speakers.map((s, index) => {
    const stage = s.reveal_stage || (s.revealed ? 'FULL_SPEAKER_REVEALED' : 'LOCKED');
    const isPublished = s.published !== false;

    if (stage === 'FULL_SPEAKER_REVEALED') fullCount++;
    else if (stage === 'DOMAIN_REVEALED') domainCount++;
    else if (stage === 'HINT_REVEALED') hintCount++;
    else lockedCount++;

    let badgeClass = 'stage-locked';
    let badgeText = '○ LOCKED';
    if (stage === 'FULL_SPEAKER_REVEALED') {
      badgeClass = 'stage-full';
      badgeText = '● FULL REVEAL';
    } else if (stage === 'DOMAIN_REVEALED') {
      badgeClass = 'stage-domain';
      badgeText = '◈ DOMAIN REVEALED';
    } else if (stage === 'HINT_REVEALED') {
      badgeClass = 'stage-hint';
      badgeText = '◆ HINT REVEALED';
    }

    const domain = s.domain || s.category || 'Undisclosed Domain';
    const role = s.designation || s.role || 'Keynote Speaker';
    const org = s.organization ? ` • ${s.organization}` : '';
    const photo = s.photo_url || s.image || `/assets/speakers/speaker-${s.id}.jpg`;

    return `
      <div class="speaker-row ${!isPublished ? 'is-draft' : ''}" data-id="${s.id}">
        <div class="speaker-left">
          <div class="order-controls">
            <button type="button" class="btn-order-move" onclick="moveSpeaker('${s.id}', 'up')" ${index === 0 ? 'disabled' : ''} aria-label="Move Up">▲</button>
            <button type="button" class="btn-order-move" onclick="moveSpeaker('${s.id}', 'down')" ${index === total - 1 ? 'disabled' : ''} aria-label="Move Down">▼</button>
          </div>
          <span class="speaker-num">#${s.id}</span>
          <img src="${photo}" alt="${s.name}" class="speaker-thumb" onerror="this.src='/assets/speakers/speaker-${s.id}.svg'" />
          <div class="speaker-details">
            <div class="speaker-name-row">
              <span class="speaker-main-name">${s.name}</span>
              ${!isPublished ? '<span class="badge-draft-tag">DRAFT</span>' : ''}
            </div>
            <span class="speaker-sub-meta"><strong>${domain}</strong> • ${role}${org}</span>
          </div>
        </div>

        <div class="speaker-right">
          <span class="status-badge ${badgeClass}">
            ${badgeText}
          </span>

          <div class="stage-control-group">
            <button 
              type="button" 
              class="btn-stage-option ${stage === 'LOCKED' ? 'active active-locked' : ''}" 
              onclick="setStage('${s.id}', 'LOCKED')"
            >
              Lock
            </button>
            <button 
              type="button" 
              class="btn-stage-option ${stage === 'HINT_REVEALED' ? 'active active-hint' : ''}" 
              onclick="setStage('${s.id}', 'HINT_REVEALED')"
            >
              Hint
            </button>
            <button 
              type="button" 
              class="btn-stage-option ${stage === 'DOMAIN_REVEALED' ? 'active active-domain' : ''}" 
              onclick="setStage('${s.id}', 'DOMAIN_REVEALED')"
            >
              Domain
            </button>
            <button 
              type="button" 
              class="btn-stage-option ${stage === 'FULL_SPEAKER_REVEALED' ? 'active active-full' : ''}" 
              onclick="setStage('${s.id}', 'FULL_SPEAKER_REVEALED')"
            >
              Full
            </button>
          </div>

          <div class="speaker-action-btns">
            <button type="button" class="btn-row-edit" onclick="openEditModal('${s.id}')">
              Edit
            </button>
            <button type="button" class="btn-row-preview" onclick="openPreviewForSpeaker('${s.id}')">
              Preview
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');

  // Update Progress Bar (Increases whenever Domain is revealed OR Fully revealed)
  const revealedCount = fullCount + domainCount;
  const percent = Math.round((revealedCount / (total || 8)) * 100);
  adminRevealedCount.textContent = revealedCount;
  adminTotalCount.textContent = total;
  adminProgressPercent.textContent = `(${percent}%)`;
  adminProgressFill.style.width = `${percent}%`;

  pillFull.textContent = fullCount;
  pillDomain.textContent = domainCount;
  pillHint.textContent = hintCount;
  pillLocked.textContent = lockedCount;
  rosterCountBadge.textContent = `${total} SPEAKERS`;

  btnRevealNext.disabled = (revealedCount === total);
  btnRevealNext.style.opacity = (revealedCount === total) ? '0.5' : '1';
}

// ----------------------------------------------------
// SPEAKER STAGE & ORDER CONTROLS
// ----------------------------------------------------
window.setStage = async function(id, stage) {
  try {
    const res = await fetch(`/api/admin/speakers/${id}/stage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({ stage })
    });

    const data = await res.json();
    if (res.ok && data.success) {
      showToast(`Speaker #${id} stage set to ${stage.replace(/_/g, ' ')}.`);
      loadSpeakers();
    } else {
      showToast(data.error || 'Action failed.');
    }
  } catch (err) {
    showToast('Network error.');
  }
};

window.moveSpeaker = async function(id, direction) {
  try {
    const res = await fetch(`/api/admin/speakers/${id}/move`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({ direction })
    });

    const data = await res.json();
    if (res.ok && data.success) {
      showToast(`Speaker #${id} moved ${direction}.`);
      speakersCache = data.speakers;
      renderRoster(speakersCache);
    } else {
      showToast('Could not reorder speaker.');
    }
  } catch (err) {
    showToast('Network error.');
  }
};

// ----------------------------------------------------
// EDIT MODAL LOGIC (Section 2, 3, 4, 7, 8)
// ----------------------------------------------------
window.openEditModal = function(id) {
  const speaker = speakersCache.find(s => s.id === id);
  if (!speaker) return;

  editingSpeaker = JSON.parse(JSON.stringify(speaker));
  isFormDirty = false;

  modalEyebrow.textContent = `SPEAKER #${speaker.id}`;
  modalTitle.textContent = `EDIT ${speaker.name.toUpperCase()}`;

  editName.value = speaker.name || '';
  editDesignation.value = speaker.designation || speaker.role || '';
  editOrganization.value = speaker.organization || '';
  editDomain.value = speaker.domain || speaker.category || '';
  editHint.value = speaker.hint || '';
  editTalkTitle.value = speaker.talk_title || speaker.talkTitle || '';
  editTalkDesc.value = speaker.talk_description || speaker.description || '';
  editBio.value = speaker.bio || '';
  editQuote.value = speaker.quote || '';

  editLinkedin.value = speaker.linkedin_url || speaker.social?.linkedin || '';
  editTwitter.value = speaker.twitter_url || speaker.social?.x || '';
  editInstagram.value = speaker.instagram_url || speaker.social?.instagram || '';
  editWebsite.value = speaker.website_url || speaker.social?.website || '';

  const photo = speaker.photo_url || speaker.image || `/assets/speakers/speaker-${speaker.id}.jpg`;
  editPhotoPreview.src = photo;

  const currentStage = speaker.reveal_stage || (speaker.revealed ? 'FULL_SPEAKER_REVEALED' : 'LOCKED');
  const stageRadio = document.querySelector(`input[name="modal-stage"][value="${currentStage}"]`);
  if (stageRadio) stageRadio.checked = true;

  editPublished.checked = speaker.published !== false;
  publishedStatusText.textContent = editPublished.checked 
    ? 'Published (Visible on Stage)' 
    : 'Draft (Hidden from Public Stage)';
  publishedStatusText.style.color = editPublished.checked ? '#ffffff' : '#a1a1aa';

  editModal.style.display = 'flex';
};

function requestCloseEditModal() {
  if (isFormDirty) {
    showConfirmDialog(
      'You have unsaved changes.',
      'Discard your modifications and close the editor?',
      () => {
        isFormDirty = false;
        editingSpeaker = null;
        editModal.style.display = 'none';
      }
    );
  } else {
    editingSpeaker = null;
    editModal.style.display = 'none';
  }
}

function collectFormData() {
  const selectedStage = document.querySelector('input[name="modal-stage"]:checked')?.value || 'LOCKED';

  return {
    ...editingSpeaker,
    name: editName.value.trim(),
    designation: editDesignation.value.trim(),
    organization: editOrganization.value.trim(),
    domain: editDomain.value.trim(),
    hint: editHint.value.trim(),
    talk_title: editTalkTitle.value.trim(),
    talk_description: editTalkDesc.value.trim(),
    bio: editBio.value.trim(),
    quote: editQuote.value.trim(),
    linkedin_url: editLinkedin.value.trim(),
    twitter_url: editTwitter.value.trim(),
    instagram_url: editInstagram.value.trim(),
    website_url: editWebsite.value.trim(),
    photo_url: editPhotoPreview.src,
    reveal_stage: selectedStage,
    published: editPublished.checked
  };
}

async function handleSaveSpeaker(e) {
  e.preventDefault();
  if (!editingSpeaker) return;

  const payload = collectFormData();

  try {
    const res = await fetch(`/api/admin/speakers/${editingSpeaker.id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (res.ok && data.success) {
      showToast(`✓ Speaker #${editingSpeaker.id} (${data.speaker.name}) updated successfully`);
      isFormDirty = false;
      editingSpeaker = null;
      editModal.style.display = 'none';
      loadSpeakers();
    } else {
      showToast(data.error || 'Failed to save changes.');
    }
  } catch (err) {
    showToast('Network error while saving.');
  }
}

// ----------------------------------------------------
// PHOTO UPLOAD & OPTIMIZATION (Section 4)
// ----------------------------------------------------
async function handlePhotoUpload(e) {
  const file = e.target.files[0];
  if (!file) return;

  if (!file.type.match(/^image\/(jpeg|png|webp)$/)) {
    showToast('Please select a JPG, PNG, or WebP image.');
    return;
  }

  const reader = new FileReader();
  reader.onload = async (event) => {
    const base64Data = event.target.result;
    editPhotoPreview.src = base64Data; // Instant preview
    isFormDirty = true;

    try {
      showToast('Optimizing and uploading photo...');
      const res = await fetch('/api/admin/upload-photo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          speakerId: editingSpeaker?.id || 'custom',
          imageData: base64Data
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        editPhotoPreview.src = data.photo_url;
        showToast('✓ Photo uploaded and optimized successfully.');
      } else {
        showToast('Upload error: ' + (data.error || 'Unknown'));
      }
    } catch (err) {
      showToast('Failed to upload image.');
    }
  };
  reader.readAsDataURL(file);
}

function handleRemovePhoto() {
  if (!editingSpeaker) return;
  const defaultPath = `/assets/speakers/speaker-${editingSpeaker.id}.jpg`;
  editPhotoPreview.src = defaultPath;
  isFormDirty = true;
  showToast('Reset photo to default asset.');
}

// ----------------------------------------------------
// LIVE SIMULATION / PREVIEW MODAL (Section 11)
// ----------------------------------------------------
window.openPreviewForSpeaker = function(id) {
  const speaker = speakersCache.find(s => s.id === id);
  if (!speaker) return;
  openPreviewModal(speaker);
};

function openPreviewModal(speaker) {
  currentPreviewSpeaker = speaker;
  previewTitle.textContent = `PREVIEW: ${speaker.name.toUpperCase()} (#${speaker.id})`;
  
  // Set tab to active stage
  previewActiveStage = speaker.reveal_stage || 'DOMAIN_REVEALED';
  previewTabs.forEach(tab => {
    if (tab.dataset.previewStage === previewActiveStage) tab.classList.add('active');
    else tab.classList.remove('active');
  });

  renderPreviewCard();
  previewModal.style.display = 'flex';
}

function closePreviewModal() {
  previewModal.style.display = 'none';
  currentPreviewSpeaker = null;
}

function renderPreviewCard() {
  if (!currentPreviewSpeaker) return;
  const speaker = currentPreviewSpeaker;
  const stage = previewActiveStage;

  let html = '';
  if (stage === 'FULL_SPEAKER_REVEALED') {
    html = `
      <div class="speaker-card-container is-stage-full is-revealed-card is-flippable card-revealed" tabindex="0" style="width: 320px; height: 500px;" onclick="this.classList.toggle('is-flipped')">
        <div class="speaker-card-inner">
          <div class="card-face card-face-front">
            <div class="card-image-wrap">
              <img src="${speaker.photo_url || speaker.image || `/assets/speakers/speaker-${speaker.id}.jpg`}" alt="${speaker.name}" onerror="this.src='/assets/speakers/speaker-${speaker.id}.svg'" />
              <div class="card-image-overlay"></div>
              <div class="card-front-header">
                <span class="speaker-number-badge">#${speaker.id}</span>
                <span class="flip-hint-pill">Explore Talk ↻</span>
              </div>
            </div>
            <div class="card-front-body">
              <span class="speaker-category-tag">${speaker.domain || speaker.category || 'Domain'}</span>
              <h3 class="speaker-name">${speaker.name}</h3>
              <p class="speaker-role">${speaker.designation || speaker.role || ''}</p>
            </div>
          </div>
          <div class="card-face card-face-back">
            <div class="card-back-top">
              <div class="card-back-header">
                <span class="talk-badge">TEDx Talk</span>
                <span class="flip-back-btn">Flip</span>
              </div>
              <h4 class="card-talk-title">“${speaker.talk_title || speaker.talkTitle || 'Keynote Presentation'}”</h4>
              <p class="card-talk-desc">${speaker.talk_description || speaker.description || ''}</p>
              <div class="card-quote-box">"${speaker.quote || speaker.bio || 'Inspiring change.'}"</div>
            </div>
            <div class="card-back-bottom">
              <span class="name">${speaker.name}</span>
            </div>
          </div>
        </div>
      </div>
    `;
  } else if (stage === 'DOMAIN_REVEALED') {
    html = `
      <div class="speaker-card-container is-stage-domain is-flippable card-revealed" tabindex="0" style="width: 320px; height: 500px;" onclick="this.classList.toggle('is-flipped')">
        <div class="speaker-card-inner">
          <div class="card-face card-face-domain-front">
            <div class="domain-header-row">
              <span class="speaker-number-badge">#${speaker.id}</span>
              <span class="badge-domain-tag">Domain Revealed</span>
            </div>
            <div class="domain-center-content">
              <div class="domain-aperture-visual">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 28px; height: 28px; color: #e62b1e;">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="14.31" y1="8" x2="20.05" y2="17.94"></line>
                </svg>
              </div>
              <div class="domain-title-wrap">
                <span class="domain-pre-label">Domain</span>
                <h3 class="domain-main-title">${speaker.domain || speaker.category || 'Domain'}</h3>
              </div>
              <div class="domain-hint-box">“${speaker.hint || 'Clue goes here...'}”</div>
            </div>
            <div class="flip-action-pill">↻ Flip to Reveal</div>
          </div>
          <div class="card-face card-face-domain-back">
            <div class="domain-header-row">
              <span class="speaker-number-badge">#${speaker.id}</span>
              <span class="badge-domain-tag">Identity Pending</span>
            </div>
            <div class="domain-back-center-logo">
              <img src="/assets/branding/tedxiiit-raichur-logo.svg" alt="TEDxIIIT Raichur" class="tedx-branding-logo" style="max-width: 220px;" />
              <div class="domain-back-tagline" style="margin-top: 1rem; font-size: 0.7rem; color: #a1a1aa;">NAVONMESH 2026 • <span style="color: #ff2b43;">TEDx</span>IIIT RAICHUR</div>
            </div>
            <div class="flip-action-pill">Tap to Flip Back</div>
          </div>
        </div>
      </div>
    `;
  } else if (stage === 'HINT_REVEALED') {
    html = `
      <div class="speaker-card-container is-stage-hint card-revealed" style="width: 320px; height: 500px;">
        <div class="speaker-card-inner">
          <div class="card-face card-hint-face">
            <div class="hint-header-row">
              <span class="placeholder-top-num">#${speaker.id}</span>
              <span class="badge-hint-tag">Hint Revealed</span>
            </div>
            <div class="hint-center-content">
              <span class="hint-label">Speaker Clue</span>
              <div class="hint-quote-text">“${speaker.hint || 'Mystery clue text...'}”</div>
            </div>
            <div class="placeholder-bottom-status">DOMAIN LOCKED • • •</div>
          </div>
        </div>
      </div>
    `;
  } else {
    html = `
      <div class="speaker-card-container is-stage-locked card-revealed" style="width: 320px; height: 500px;">
        <div class="speaker-card-inner">
          <div class="card-face card-placeholder-face">
            <span class="placeholder-top-num">#${speaker.id}</span>
            <div class="placeholder-center-radar">
              <h3 class="placeholder-title">COMING SOON</h3>
              <span class="placeholder-subtext">Awaiting Stage Reveal</span>
            </div>
            <div class="placeholder-bottom-status">LOCKED • • •</div>
          </div>
        </div>
      </div>
    `;
  }

  previewCardViewport.innerHTML = html;
}

// ----------------------------------------------------
// GLOBAL BULK ACTIONS & CONFIRMATIONS (Section 15, 17)
// ----------------------------------------------------
async function handleRevealNext() {
  try {
    const res = await fetch('/api/admin/speakers/reveal-next', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${authToken}` }
    });

    const data = await res.json();
    if (res.ok && data.success) {
      showToast(`Speaker #${data.speaker.id} (${data.speaker.name}) revealed on public stage!`);
      loadSpeakers();
    } else {
      showToast(data.message || 'All published speakers are already revealed.');
    }
  } catch (err) {
    showToast('Network error.');
  }
}

async function handleRevealAllDomains() {
  showConfirmDialog(
    'Reveal All Speaker Domains?',
    'This will unlock the DOMAIN REVEALED stage for all currently locked/hinted speakers.',
    async () => {
      try {
        const res = await fetch('/api/admin/speakers/reveal-all-domains', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${authToken}` }
        });
        const data = await res.json();
        if (res.ok && data.success) {
          showToast('✓ All speaker domains are now unlocked & flippable on stage!');
          loadSpeakers();
        }
      } catch (err) {
        showToast('Network error.');
      }
    }
  );
}

async function handleRevealAllFull() {
  showConfirmDialog(
    'Are you sure you want to REVEAL ALL speakers?',
    'This will immediately reveal all 8 speakers fully to the public audience.',
    async () => {
      try {
        const res = await fetch('/api/admin/speakers/reveal-all', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${authToken}` }
        });
        const data = await res.json();
        if (res.ok && data.success) {
          showToast('✓ All 8 speakers are now live and fully revealed!');
          loadSpeakers();
        }
      } catch (err) {
        showToast('Network error.');
      }
    }
  );
}

async function handleHideAll() {
  showConfirmDialog(
    'Are you sure you want to RESET ALL speakers?',
    'This will lock all 8 speakers back to COMING SOON state.',
    async () => {
      try {
        const res = await fetch('/api/admin/speakers/hide-all', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${authToken}` }
        });
        const data = await res.json();
        if (res.ok && data.success) {
          showToast('✓ All speakers have been locked to COMING SOON.');
          loadSpeakers();
        }
      } catch (err) {
        showToast('Network error.');
      }
    }
  );
}

function showConfirmDialog(title, message, callback) {
  confirmTitle.textContent = title;
  confirmMessage.textContent = message;
  confirmCallback = callback;
  confirmModal.style.display = 'flex';
}

function showToast(message) {
  toastNotice.textContent = message;
  toastNotice.style.display = 'block';
  setTimeout(() => {
    toastNotice.style.display = 'none';
  }, 3500);
}
