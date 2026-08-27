import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.join(__dirname, 'data');
const dbFilePath = path.join(dataDir, 'speakers-db.json');

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

export const STAGES = {
  LOCKED: 'LOCKED',
  HINT_REVEALED: 'HINT_REVEALED',
  DOMAIN_REVEALED: 'DOMAIN_REVEALED',
  FULL_SPEAKER_REVEALED: 'FULL_SPEAKER_REVEALED'
};

const defaultSpeakers = [
  {
    id: '01',
    display_order: 1,
    name: 'Dr. Aarav Chen',
    designation: 'Quantum Physicist & Neural Architect',
    organization: 'Quantum Neural Labs',
    photo_url: '/assets/speakers/speaker-01.jpg',
    domain: 'Quantum Computing',
    hint: 'Mapping synthetic consciousness through relativistic subatomic gates.',
    talk_title: 'Beyond Silicon: Mapping the Subatomic Mind',
    talk_description: 'Pioneering the intersection of quantum entanglement and synthetic neural pathways to redefine how machines compute thought.',
    bio: 'Dr. Aarav Chen is a theoretical physicist exploring the convergence of quantum mechanics and synthetic intelligence. His research centers on scalable subatomic neural matrices.',
    quote: 'When we stop treating quantum physics as a paradox and start treating it as architecture, consciousness becomes measurable.',
    linkedin_url: 'https://linkedin.com',
    instagram_url: 'https://instagram.com',
    website_url: 'https://aaravchen.com',
    twitter_url: 'https://x.com',
    reveal_stage: 'FULL_SPEAKER_REVEALED',
    published: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '02',
    display_order: 2,
    name: 'Maya Varma',
    designation: 'Generative Biomaterial Sculptor',
    organization: 'Cellular Ecosystems Institute',
    photo_url: '/assets/speakers/speaker-02.jpg',
    domain: 'Synthetic Biology',
    hint: 'Designing living architecture from self-healing mycelium and bioluminescent algae.',
    talk_title: 'Living Structures: Architecture That Grows and Heals',
    talk_description: 'Synthesizing mycelium composites and bioluminescent algae to construct self-healing urban ecosystems that breathe with the earth.',
    bio: 'Maya Varma combines biodesign and structural biology to pioneer living architectural materials that sequester carbon and self-repair across building lifespans.',
    quote: 'The future of construction isn\'t concrete and steel—it is genetic code and cellular regeneration.',
    linkedin_url: 'https://linkedin.com',
    instagram_url: 'https://instagram.com',
    website_url: 'https://mayavarma.design',
    twitter_url: 'https://x.com',
    reveal_stage: 'FULL_SPEAKER_REVEALED',
    published: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '03',
    display_order: 3,
    name: 'Vikramaditya Roy',
    designation: 'Deep Space Propulsion Engineer',
    organization: 'Relativistic Flight Technologies',
    photo_url: '/assets/speakers/speaker-03.jpg',
    domain: 'Interstellar Dynamics',
    hint: 'Navigating relativistic laser-driven lightsails across the deep solar abyss.',
    talk_title: 'Catching Photons: Sailing Across the Solar Abyss',
    talk_description: 'Leading the next frontier in relativistic laser-driven lightsails to propel humanity\'s reach beyond our planetary cradle within a generation.',
    bio: 'Vikramaditya Roy is an aerospace propulsion pioneer whose research on directed-energy laser propulsion paves the way for interstellar robotic exploration.',
    quote: 'Distance in the cosmos is not a barrier; it is simply an engineering equation waiting for courage.',
    linkedin_url: 'https://linkedin.com',
    instagram_url: 'https://instagram.com',
    website_url: 'https://vikramadityaroy.space',
    twitter_url: 'https://x.com',
    reveal_stage: 'DOMAIN_REVEALED',
    published: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '04',
    display_order: 4,
    name: 'Elena Rostova',
    designation: 'Sonic Archaeologist & Composer',
    organization: 'Acoustic Heritage Lab',
    photo_url: '/assets/speakers/speaker-04.jpg',
    domain: 'Acoustic Anthropology',
    hint: 'Decoding the sonic resonances and acoustic soundscapes of lost millennia.',
    talk_title: 'The Echo of Millennia: Decoding Ancient Acoustic Resonances',
    talk_description: 'Restoring the acoustic soundscapes of lost civilizations using spatial impulse modeling and AI-assisted harmonic reconstruction.',
    bio: 'Elena Rostova captures and reconstructs ancient ritual acoustic spaces, studying how psychoacoustics shaped human societal evolution.',
    quote: 'Sound does not die; it embeds itself into stone, atmosphere, and time. We are only learning to listen.',
    linkedin_url: 'https://linkedin.com',
    instagram_url: 'https://instagram.com',
    website_url: 'https://elenarostova.audio',
    twitter_url: 'https://x.com',
    reveal_stage: 'HINT_REVEALED',
    published: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '05',
    display_order: 5,
    name: 'Kiran Deshmukh',
    designation: 'Clean Fusion Pioneer',
    organization: 'Stellaris Energy Foundation',
    photo_url: '/assets/speakers/speaker-05.jpg',
    domain: 'Zero-Point Energy',
    hint: 'Bottling starfire through magnetic confinement for limitless clean power.',
    talk_title: 'Bottling Stars: The Final Metric for Abundance',
    talk_description: 'Overcoming magnetic confinement instability to deliver limitless, democratized clean energy for human civilization.',
    bio: 'Kiran Deshmukh is a plasma physicist working on ultra-compact magnetohydrodynamic fusion containment systems to democratize global zero-carbon energy.',
    quote: 'Abundance is not a luxury; it is the fundamental prerequisite for human enlightenment.',
    linkedin_url: 'https://linkedin.com',
    instagram_url: 'https://instagram.com',
    website_url: 'https://kirandeshmukh.energy',
    twitter_url: 'https://x.com',
    reveal_stage: 'LOCKED',
    published: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '06',
    display_order: 6,
    name: 'Sofia Al-Mansoor',
    designation: 'Algorithmic Ethicist & Philosopher',
    organization: 'Cognitive Autonomy Initiative',
    photo_url: '/assets/speakers/speaker-06.jpg',
    domain: 'Cognitive Sovereignty',
    hint: 'Mapping the hidden geometry of autonomous choice and predictive cognition.',
    talk_title: 'The Geometry of Autonomy: Who Owns Your Next Choice?',
    talk_description: 'Investigating how subconscious predictive models reshape free will, and crafting the legislative guardrails for human cognition.',
    bio: 'Sofia Al-Mansoor researches the philosophical and regulatory intersections of neural prediction algorithms, attention economies, and constitutional human rights.',
    quote: 'Freedom in the 21st century will not be fought on borders, but within the latent spaces of our own attention.',
    linkedin_url: 'https://linkedin.com',
    instagram_url: 'https://instagram.com',
    website_url: 'https://sofiaalmansoor.org',
    twitter_url: 'https://x.com',
    reveal_stage: 'LOCKED',
    published: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '07',
    display_order: 7,
    name: 'Tariq Thorne',
    designation: 'Bionic Interface Designer',
    organization: 'Synthetic Sensory Labs',
    photo_url: '/assets/speakers/speaker-07.jpg',
    domain: 'Neuro-Prosthetics',
    hint: 'Expanding human perception to feel synthetic colors and hear raw light.',
    talk_title: 'Sensory Expansion: Feeling Colors and Hearing Light',
    talk_description: 'Designing high-bandwidth neural interfaces that restore lost motor functions while unlocking synthetic sixth and seventh senses.',
    bio: 'Tariq Thorne develops bidirectional neuromorphic prosthetics that merge human nervous systems with synthetic sensory transducers.',
    quote: 'We are not replacing what was lost. We are exploring the uncharted canvas of human perception.',
    linkedin_url: 'https://linkedin.com',
    instagram_url: 'https://instagram.com',
    website_url: 'https://tariqthorne.bionics',
    twitter_url: 'https://x.com',
    reveal_stage: 'LOCKED',
    published: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '08',
    display_order: 8,
    name: 'Ananya Sen',
    designation: 'Planetary Hydrologist',
    organization: 'Desert Frontiers Water Institute',
    photo_url: '/assets/speakers/speaker-08.jpg',
    domain: 'Atmospheric Engineering',
    hint: 'Harvesting planetary clouds and micro-condensation in hyper-arid frontiers.',
    talk_title: 'Harvesting the Clouds: Micro-Condensation in Hyper-Arid Zones',
    talk_description: 'Developing biomimetic fog nets and solar atmospheric water extractors to bring agricultural sovereignty to desert frontiers.',
    bio: 'Ananya Sen develops atmospheric harvesting nanostructures to provide clean drinking water and localized microclimates to the world\'s most arid landscapes.',
    quote: 'Water is everywhere around us—invisible in the air. All it takes is the right surface to call it home.',
    linkedin_url: 'https://linkedin.com',
    instagram_url: 'https://instagram.com',
    website_url: 'https://ananyasen.water',
    twitter_url: 'https://x.com',
    reveal_stage: 'LOCKED',
    published: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

function readDB() {
  try {
    if (!fs.existsSync(dbFilePath)) {
      writeDB(defaultSpeakers);
      return defaultSpeakers;
    }
    const data = fs.readFileSync(dbFilePath, 'utf-8');
    const parsed = JSON.parse(data);

    // Normalize backward compatibility with legacy fields
    parsed.forEach(s => {
      if (!s.reveal_stage) {
        s.reveal_stage = s.revealed ? STAGES.FULL_SPEAKER_REVEALED : STAGES.LOCKED;
      }
      if (s.published === undefined) s.published = true;
      if (!s.domain && s.category) s.domain = s.category;
      if (!s.category && s.domain) s.category = s.domain;
      if (!s.designation && s.role) s.designation = s.role;
      if (!s.role && s.designation) s.role = s.designation;
      if (!s.photo_url && s.image) s.photo_url = s.image;
      if (!s.image && s.photo_url) s.image = s.photo_url;
      if (!s.talk_title && s.talkTitle) s.talk_title = s.talkTitle;
      if (!s.talkTitle && s.talk_title) s.talkTitle = s.talk_title;
      if (!s.talk_description && s.description) s.talk_description = s.description;
      if (!s.description && s.talk_description) s.description = s.talk_description;
      if (!s.linkedin_url && s.social?.linkedin) s.linkedin_url = s.social.linkedin;
      if (!s.twitter_url && s.social?.x) s.twitter_url = s.social.x;
    });

    return parsed;
  } catch (err) {
    console.error('Error reading speakers database:', err);
    return defaultSpeakers;
  }
}

function writeDB(data) {
  try {
    fs.writeFileSync(dbFilePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing speakers database:', err);
  }
}

// Public API View: Sorted by display_order, published only, sanitized per stage
export function getPublicSpeakers() {
  const speakers = readDB();
  return speakers
    .filter(s => s.published !== false)
    .sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
    .map(s => {
      const stage = s.reveal_stage || (s.revealed ? STAGES.FULL_SPEAKER_REVEALED : STAGES.LOCKED);

      if (stage === STAGES.FULL_SPEAKER_REVEALED) {
        return {
          id: s.id,
          display_order: s.display_order,
          name: s.name,
          designation: s.designation || s.role,
          role: s.designation || s.role,
          organization: s.organization || '',
          photo_url: s.photo_url || s.image,
          image: s.photo_url || s.image,
          domain: s.domain || s.category,
          category: s.domain || s.category,
          hint: s.hint || '',
          talk_title: s.talk_title || s.talkTitle,
          talkTitle: s.talk_title || s.talkTitle,
          talk_description: s.talk_description || s.description,
          description: s.talk_description || s.description,
          bio: s.bio || '',
          quote: s.quote || '',
          linkedin_url: s.linkedin_url || '',
          instagram_url: s.instagram_url || '',
          website_url: s.website_url || '',
          twitter_url: s.twitter_url || '',
          social: {
            linkedin: s.linkedin_url || '',
            instagram: s.instagram_url || '',
            website: s.website_url || '',
            x: s.twitter_url || ''
          },
          reveal_stage: STAGES.FULL_SPEAKER_REVEALED,
          revealed: true,
          published: true
        };
      }

      if (stage === STAGES.DOMAIN_REVEALED) {
        return {
          id: s.id,
          display_order: s.display_order,
          domain: s.domain || s.category,
          category: s.domain || s.category,
          hint: s.hint || '',
          reveal_stage: STAGES.DOMAIN_REVEALED,
          revealed: false,
          published: true
        };
      }

      if (stage === STAGES.HINT_REVEALED) {
        return {
          id: s.id,
          display_order: s.display_order,
          hint: s.hint || '',
          reveal_stage: STAGES.HINT_REVEALED,
          revealed: false,
          published: true
        };
      }

      // LOCKED stage
      return {
        id: s.id,
        display_order: s.display_order,
        reveal_stage: STAGES.LOCKED,
        revealed: false,
        published: true
      };
    });
}

// Admin API View: Complete records sorted by display_order
export function getAllSpeakersAdmin() {
  const speakers = readDB();
  return speakers.sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
}

export function getSpeakerById(id) {
  const speakers = readDB();
  return speakers.find(s => s.id === id) || null;
}

export function updateSpeaker(id, updateData) {
  const speakers = readDB();
  const index = speakers.findIndex(s => s.id === id);
  if (index === -1) return null;

  const current = speakers[index];

  const domain = updateData.domain !== undefined ? updateData.domain : (updateData.category !== undefined ? updateData.category : current.domain);
  const designation = updateData.designation !== undefined ? updateData.designation : (updateData.role !== undefined ? updateData.role : current.designation);
  const photo_url = updateData.photo_url !== undefined ? updateData.photo_url : (updateData.image !== undefined ? updateData.image : current.photo_url);
  const talk_title = updateData.talk_title !== undefined ? updateData.talk_title : (updateData.talkTitle !== undefined ? updateData.talkTitle : current.talk_title);
  const talk_description = updateData.talk_description !== undefined ? updateData.talk_description : (updateData.description !== undefined ? updateData.description : current.talk_description);

  const updated = {
    ...current,
    ...updateData,
    id: current.id, // Preserve ID
    domain,
    category: domain,
    designation,
    role: designation,
    photo_url,
    image: photo_url,
    talk_title,
    talkTitle: talk_title,
    talk_description,
    description: talk_description,
    revealed: (updateData.reveal_stage ? updateData.reveal_stage === STAGES.FULL_SPEAKER_REVEALED : current.revealed),
    updated_at: new Date().toISOString()
  };

  speakers[index] = updated;
  writeDB(speakers);
  return updated;
}

export function setSpeakerStage(id, stage) {
  return updateSpeaker(id, {
    reveal_stage: stage,
    revealed: (stage === STAGES.FULL_SPEAKER_REVEALED)
  });
}

export function setSpeakerReveal(id, revealed) {
  const stage = revealed ? STAGES.FULL_SPEAKER_REVEALED : STAGES.LOCKED;
  return setSpeakerStage(id, stage);
}

export function updateSpeakerOrder(orderedIds) {
  if (!Array.isArray(orderedIds)) return null;
  const speakers = readDB();

  orderedIds.forEach((id, idx) => {
    const spk = speakers.find(s => s.id === id);
    if (spk) {
      spk.display_order = idx + 1;
      spk.updated_at = new Date().toISOString();
    }
  });

  writeDB(speakers);
  return getAllSpeakersAdmin();
}

export function moveSpeakerOrder(id, direction) {
  const speakers = getAllSpeakersAdmin();
  const index = speakers.findIndex(s => s.id === id);
  if (index === -1) return null;

  const targetIndex = direction === 'up' ? index - 1 : index + 1;
  if (targetIndex < 0 || targetIndex >= speakers.length) return speakers;

  const temp = speakers[index];
  speakers[index] = speakers[targetIndex];
  speakers[targetIndex] = temp;

  speakers.forEach((s, idx) => {
    s.display_order = idx + 1;
    s.updated_at = new Date().toISOString();
  });

  writeDB(speakers);
  return getAllSpeakersAdmin();
}

export function advanceNextStage() {
  const speakers = getAllSpeakersAdmin().filter(s => s.published !== false);
  const order = [STAGES.LOCKED, STAGES.HINT_REVEALED, STAGES.DOMAIN_REVEALED, STAGES.FULL_SPEAKER_REVEALED];

  const candidate = speakers.find(s => s.reveal_stage !== STAGES.FULL_SPEAKER_REVEALED);
  if (!candidate) return null;

  const currentIdx = order.indexOf(candidate.reveal_stage);
  const nextStage = order[Math.min(currentIdx + 1, order.length - 1)];

  return setSpeakerStage(candidate.id, nextStage);
}

export function revealNextSpeaker() {
  const speakers = getAllSpeakersAdmin().filter(s => s.published !== false);
  const candidate = speakers.find(s => s.reveal_stage !== STAGES.FULL_SPEAKER_REVEALED);
  if (!candidate) return null;

  return setSpeakerStage(candidate.id, STAGES.FULL_SPEAKER_REVEALED);
}

export function revealAllSpeakers() {
  const speakers = readDB();
  speakers.forEach(s => {
    s.reveal_stage = STAGES.FULL_SPEAKER_REVEALED;
    s.revealed = true;
    s.updated_at = new Date().toISOString();
  });
  writeDB(speakers);
  return getAllSpeakersAdmin();
}

export function revealAllDomains() {
  const speakers = readDB();
  speakers.forEach(s => {
    if (s.reveal_stage === STAGES.LOCKED || s.reveal_stage === STAGES.HINT_REVEALED) {
      s.reveal_stage = STAGES.DOMAIN_REVEALED;
      s.revealed = false;
      s.updated_at = new Date().toISOString();
    }
  });
  writeDB(speakers);
  return getAllSpeakersAdmin();
}

export function hideAllSpeakers() {
  const speakers = readDB();
  speakers.forEach(s => {
    s.reveal_stage = STAGES.LOCKED;
    s.revealed = false;
    s.updated_at = new Date().toISOString();
  });
  writeDB(speakers);
  return getAllSpeakersAdmin();
}
