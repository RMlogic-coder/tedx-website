import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';
import { fileURLToPath } from 'url';
import {
  STAGES,
  getPublicSpeakers,
  getAllSpeakersAdmin,
  getSpeakerById,
  updateSpeaker,
  updateSpeakerOrder,
  moveSpeakerOrder,
  setSpeakerStage,
  setSpeakerReveal,
  advanceNextStage,
  revealNextSpeaker,
  revealAllSpeakers,
  revealAllDomains,
  hideAllSpeakers
} from './db.js';
import {
  verifyAdminPassword,
  generateToken,
  requireAdminAuth
} from './auth.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));
app.use(cookieParser());

// Server-Sent Events (SSE) Client Pool for Live Public Updates
const sseClients = new Set();

function broadcastSSE(eventType, data = {}) {
  const publicSpeakers = getPublicSpeakers();
  const payload = JSON.stringify({
    type: eventType,
    speakers: publicSpeakers,
    timestamp: new Date().toISOString(),
    ...data
  });

  for (const client of sseClients) {
    try {
      client.write(`event: speaker-update\n`);
      client.write(`data: ${payload}\n\n`);
    } catch (err) {
      sseClients.delete(client);
    }
  }
}

// ----------------------------------------------------
// PUBLIC API ENDPOINTS
// ----------------------------------------------------

// 1. Get Public Speakers (Sanitized, Sorted, Published Only)
app.get('/api/speakers', (req, res) => {
  const speakers = getPublicSpeakers();
  res.json({ success: true, speakers });
});

// 2. Real-Time Server-Sent Events Stream for Live Sync
app.get('/api/speakers/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');

  res.flushHeaders();

  // Send initial state immediately
  const initialPayload = JSON.stringify({
    type: 'initial-state',
    speakers: getPublicSpeakers(),
    timestamp: new Date().toISOString()
  });
  res.write(`event: speaker-update\ndata: ${initialPayload}\n\n`);

  sseClients.add(res);

  // Heartbeat every 25 seconds
  const heartbeat = setInterval(() => {
    try {
      res.write(': heartbeat\n\n');
    } catch (e) {
      clearInterval(heartbeat);
      sseClients.delete(res);
    }
  }, 25000);

  req.on('close', () => {
    clearInterval(heartbeat);
    sseClients.delete(res);
  });
});

// ----------------------------------------------------
// ADMIN AUTHENTICATION & CMS OPERATIONS
// ----------------------------------------------------

// Admin Login
app.post('/api/admin/login', (req, res) => {
  const { password } = req.body;
  if (!password || !verifyAdminPassword(password)) {
    return res.status(401).json({ success: false, error: 'Invalid admin passphrase.' });
  }

  const token = generateToken({ role: 'admin', timestamp: Date.now() });

  res.cookie('admin_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });

  return res.json({
    success: true,
    token,
    message: 'Admin authentication successful.'
  });
});

// Verify Current Session
app.get('/api/admin/me', requireAdminAuth, (req, res) => {
  res.json({ success: true, user: req.admin });
});

// Admin Logout
app.post('/api/admin/logout', (req, res) => {
  res.clearCookie('admin_token');
  res.json({ success: true, message: 'Logged out successfully.' });
});

// Get Full Speaker List (Admin Only)
app.get('/api/admin/speakers', requireAdminAuth, (req, res) => {
  const speakers = getAllSpeakersAdmin();
  res.json({ success: true, speakers, stages: STAGES });
});

// Get Single Speaker (Admin Only)
app.get('/api/admin/speakers/:id', requireAdminAuth, (req, res) => {
  const speaker = getSpeakerById(req.params.id);
  if (!speaker) {
    return res.status(404).json({ success: false, error: 'Speaker not found.' });
  }
  res.json({ success: true, speaker });
});

// Update Full Speaker Profile (Admin CMS)
app.post('/api/admin/speakers/:id', requireAdminAuth, (req, res) => {
  const { id } = req.params;
  const updated = updateSpeaker(id, req.body);
  if (!updated) {
    return res.status(404).json({ success: false, error: 'Speaker not found.' });
  }

  broadcastSSE('speaker-updated', { speakerId: id, speaker: updated });
  res.json({ success: true, speaker: updated });
});

// Photo Upload Endpoint (Admin Only)
app.post('/api/admin/upload-photo', requireAdminAuth, async (req, res) => {
  try {
    const { speakerId, imageData } = req.body;
    if (!imageData) {
      return res.status(400).json({ success: false, error: 'No image data provided.' });
    }

    // Extract base64 buffer
    const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    const filename = `speaker-${speakerId || 'custom'}-${Date.now()}.jpg`;
    const publicSpeakersDir = path.join(rootDir, 'public', 'assets', 'speakers');
    const distSpeakersDir = path.join(rootDir, 'dist', 'assets', 'speakers');

    if (!fs.existsSync(publicSpeakersDir)) fs.mkdirSync(publicSpeakersDir, { recursive: true });
    if (!fs.existsSync(distSpeakersDir)) fs.mkdirSync(distSpeakersDir, { recursive: true });

    const targetPublic = path.join(publicSpeakersDir, filename);
    const targetDist = path.join(distSpeakersDir, filename);

    // Process with sharp: auto-orient, resize max 1200x1200, crisp JPEG 90%
    const processedBuf = await sharp(buffer)
      .rotate()
      .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 90 })
      .toBuffer();

    fs.writeFileSync(targetPublic, processedBuf);
    fs.writeFileSync(targetDist, processedBuf);

    const photo_url = `/assets/speakers/${filename}`;

    res.json({
      success: true,
      photo_url,
      message: 'Photo uploaded and optimized successfully.'
    });
  } catch (err) {
    console.error('Error processing photo upload:', err);
    res.status(500).json({ success: false, error: 'Failed to process image upload.' });
  }
});

// Reorder Entire Speaker List
app.post('/api/admin/speakers/reorder', requireAdminAuth, (req, res) => {
  const { orderedIds } = req.body;
  const updated = updateSpeakerOrder(orderedIds);
  if (!updated) {
    return res.status(400).json({ success: false, error: 'Invalid speaker order array.' });
  }

  broadcastSSE('order-updated', { speakers: updated });
  res.json({ success: true, speakers: updated });
});

// Move Speaker Order (up/down)
app.post('/api/admin/speakers/:id/move', requireAdminAuth, (req, res) => {
  const { id } = req.params;
  const { direction } = req.body; // 'up' or 'down'

  const updated = moveSpeakerOrder(id, direction);
  if (!updated) {
    return res.status(400).json({ success: false, error: 'Failed to move speaker.' });
  }

  broadcastSSE('order-updated', { speakers: updated });
  res.json({ success: true, speakers: updated });
});

// Set Specific Stage for Speaker (Admin Only)
app.post('/api/admin/speakers/:id/stage', requireAdminAuth, (req, res) => {
  const { id } = req.params;
  const { stage } = req.body;

  if (!Object.values(STAGES).includes(stage)) {
    return res.status(400).json({ success: false, error: 'Invalid stage specified.' });
  }

  const updated = setSpeakerStage(id, stage);
  if (!updated) {
    return res.status(404).json({ success: false, error: 'Speaker not found.' });
  }

  broadcastSSE('stage-updated', { speakerId: id, stage, speaker: updated });
  res.json({ success: true, speaker: updated });
});

// Advance Next Eligible Stage (Admin Only)
app.post('/api/admin/speakers/advance-next', requireAdminAuth, (req, res) => {
  const updated = advanceNextStage();
  if (!updated) {
    return res.status(400).json({ success: false, message: 'All published speakers are already fully revealed.' });
  }

  broadcastSSE('stage-updated', { speakerId: updated.id, stage: updated.reveal_stage, speaker: updated });
  res.json({ success: true, speaker: updated });
});

// Reveal Next Speaker in Sequence (Admin Only)
app.post('/api/admin/speakers/reveal-next', requireAdminAuth, (req, res) => {
  const next = revealNextSpeaker();
  if (!next) {
    return res.status(400).json({ success: false, message: 'All speakers are already fully revealed.' });
  }

  broadcastSSE('speaker-revealed', { revealedId: next.id, speaker: next });
  res.json({ success: true, speaker: next });
});

// Reveal All Domains (Admin Only)
app.post('/api/admin/speakers/reveal-all-domains', requireAdminAuth, (req, res) => {
  const speakers = revealAllDomains();
  broadcastSSE('all-domains-revealed', { count: speakers.length });
  res.json({ success: true, speakers });
});

// Reveal All Speakers Fully (Admin Only)
app.post('/api/admin/speakers/reveal-all', requireAdminAuth, (req, res) => {
  const speakers = revealAllSpeakers();
  broadcastSSE('all-revealed', { count: speakers.length });
  res.json({ success: true, speakers });
});

// Hide / Lock All Speakers (Admin Only)
app.post('/api/admin/speakers/hide-all', requireAdminAuth, (req, res) => {
  const speakers = hideAllSpeakers();
  broadcastSSE('all-hidden', { count: speakers.length });
  res.json({ success: true, speakers });
});

// ----------------------------------------------------
// STATIC FILE SERVING & ADMIN ROUTE
// ----------------------------------------------------

app.use(express.static(path.join(rootDir, 'dist')));
app.use(express.static(path.join(rootDir, 'public')));

app.use('/admin', express.static(path.join(rootDir, 'admin')));
app.get('/admin', (req, res) => {
  res.sendFile(path.join(rootDir, 'admin', 'index.html'));
});

app.use((req, res) => {
  const distIndex = path.join(rootDir, 'dist', 'index.html');
  if (fs.existsSync(distIndex)) {
    return res.sendFile(distIndex);
  }
  res.sendFile(path.join(rootDir, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`\n=================================================`);
  console.log(`🚀 TEDxIIIT Raichur "Navonmesh" Fullstack Server`);
  console.log(`🌐 Public Website:  http://localhost:${PORT}/`);
  console.log(`🔒 Admin Panel:     http://localhost:${PORT}/admin`);
  console.log(`⚡ Real-Time SSE:   http://localhost:${PORT}/api/speakers/stream`);
  console.log(`=================================================\n`);
});
