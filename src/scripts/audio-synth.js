// Lightweight Web Audio API Synthesizer for Cinematic FX
let audioCtx = null;
let isAudioActive = false;
let droneOsc1 = null;
let droneOsc2 = null;
let droneGain = null;

function getAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function initAudioSystem() {
  const toggleBtn = document.querySelector('.audio-toggle-btn');
  if (!toggleBtn) return;

  toggleBtn.addEventListener('click', () => {
    isAudioActive = !isAudioActive;
    toggleBtn.classList.toggle('is-active', isAudioActive);
    toggleBtn.setAttribute('aria-pressed', isAudioActive ? 'true' : 'false');
    
    const label = toggleBtn.querySelector('.audio-label');
    if (label) label.textContent = isAudioActive ? 'Sound On' : 'Sound Off';

    if (isAudioActive) {
      startAmbientDrone();
    } else {
      stopAmbientDrone();
    }
  });
}

function startAmbientDrone() {
  const ctx = getAudioContext();
  if (!ctx) return;

  // Gentle deep stage resonant drone
  droneGain = ctx.createGain();
  droneGain.gain.setValueAtTime(0.001, ctx.currentTime);
  droneGain.gain.exponentialRampToValueAtTime(0.03, ctx.currentTime + 3.0);
  droneGain.connect(ctx.destination);

  // Sub-bass oscillator (55Hz / A1)
  droneOsc1 = ctx.createOscillator();
  droneOsc1.type = 'sine';
  droneOsc1.frequency.setValueAtTime(55, ctx.currentTime);
  droneOsc1.connect(droneGain);
  droneOsc1.start();

  // Subtle warm harmonic (110Hz)
  droneOsc2 = ctx.createOscillator();
  droneOsc2.type = 'sine';
  droneOsc2.frequency.setValueAtTime(110, ctx.currentTime);
  droneOsc2.connect(droneGain);
  droneOsc2.start();
}

function stopAmbientDrone() {
  if (!audioCtx || !droneGain) return;
  try {
    droneGain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.5);
    setTimeout(() => {
      if (droneOsc1) { droneOsc1.stop(); droneOsc1.disconnect(); droneOsc1 = null; }
      if (droneOsc2) { droneOsc2.stop(); droneOsc2.disconnect(); droneOsc2 = null; }
    }, 500);
  } catch (e) {
    // Ignore error on teardown
  }
}

export function playSound(type = 'flip') {
  if (!isAudioActive) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  if (type === 'flip') {
    // Elegant soft tactile switch sound
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(420, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(180, ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.04, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.08);
  }
}
