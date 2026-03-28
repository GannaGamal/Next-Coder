/**
 * Admin Roadmap Service — fake CRUD for track management.
 * Replace each function body with a real fetch() call when the backend is ready.
 */

export interface AdminLink {
  title: string;
  url: string;
  type: string;
}

export interface AdminSubtopic {
  nodeId: string;
  title: string;
  description: string;
  links: AdminLink[];
}

export interface AdminTopic {
  nodeId: string;
  title: string;
  description: string;
  links: AdminLink[];
  subtopics: AdminSubtopic[];
}

export interface AdminTrack {
  id: string;
  trackName: string;
  topics: AdminTopic[];
  createdAt: string;
  updatedAt: string;
}

// ─── Seeded fake data ─────────────────────────────────────────────────────────

let fakeDb: AdminTrack[] = [
  {
    id: 'track-1',
    trackName: 'Frontend Development',
    createdAt: '2024-01-10',
    updatedAt: '2024-03-15',
    topics: [
      { nodeId: 't1', title: 'HTML Fundamentals', description: 'Structure of web pages', links: [{ title: 'MDN HTML Guide', url: 'https://developer.mozilla.org/en-US/docs/Web/HTML', type: 'documentation' }], subtopics: [{ nodeId: 's1', title: 'Semantic HTML', description: 'Using meaningful tags', links: [] }, { nodeId: 's2', title: 'Forms & Inputs', description: 'Building interactive forms', links: [] }] },
      { nodeId: 't2', title: 'CSS & Styling', description: 'Visual design and layouts', links: [{ title: 'CSS Tricks', url: 'https://css-tricks.com', type: 'article' }], subtopics: [{ nodeId: 's3', title: 'Flexbox', description: 'One-dimensional layouts', links: [] }, { nodeId: 's4', title: 'Grid', description: 'Two-dimensional layouts', links: [] }] },
      { nodeId: 't3', title: 'JavaScript Basics', description: 'Core language concepts', links: [], subtopics: [{ nodeId: 's5', title: 'ES6+ Features', description: 'Modern JS syntax', links: [] }] },
      { nodeId: 't4', title: 'React Framework', description: 'Component-based UI', links: [{ title: 'React Docs', url: 'https://react.dev', type: 'documentation' }], subtopics: [] },
      { nodeId: 't5', title: 'TypeScript', description: 'Type-safe JavaScript', links: [], subtopics: [] },
    ],
  },
  {
    id: 'track-2',
    trackName: 'Backend Development',
    createdAt: '2024-01-12',
    updatedAt: '2024-03-20',
    topics: [
      { nodeId: 't6', title: 'Node.js', description: 'Server-side JavaScript runtime', links: [{ title: 'Node.js Docs', url: 'https://nodejs.org', type: 'documentation' }], subtopics: [{ nodeId: 's6', title: 'Express.js', description: 'Minimal web framework', links: [] }] },
      { nodeId: 't7', title: 'Databases', description: 'Data storage and retrieval', links: [], subtopics: [{ nodeId: 's7', title: 'SQL Basics', description: 'Relational databases', links: [] }, { nodeId: 's8', title: 'MongoDB', description: 'NoSQL document database', links: [] }] },
      { nodeId: 't8', title: 'REST APIs', description: 'API design principles', links: [], subtopics: [] },
      { nodeId: 't9', title: 'Authentication & Security', description: 'JWT, OAuth, HTTPS', links: [], subtopics: [] },
    ],
  },
  {
    id: 'track-3',
    trackName: 'DevOps Engineering',
    createdAt: '2024-02-01',
    updatedAt: '2024-03-18',
    topics: [
      { nodeId: 't10', title: 'Linux & Shell Scripting', description: 'Command-line fundamentals', links: [], subtopics: [] },
      { nodeId: 't11', title: 'Docker & Containers', description: 'Containerisation basics', links: [{ title: 'Docker Docs', url: 'https://docs.docker.com', type: 'documentation' }], subtopics: [{ nodeId: 's9', title: 'Docker Compose', description: 'Multi-container apps', links: [] }] },
      { nodeId: 't12', title: 'CI/CD Pipelines', description: 'Continuous integration and delivery', links: [], subtopics: [] },
      { nodeId: 't13', title: 'Kubernetes', description: 'Container orchestration', links: [], subtopics: [] },
      { nodeId: 't14', title: 'Cloud Platforms (AWS)', description: 'Core AWS services', links: [], subtopics: [] },
    ],
  },
  {
    id: 'track-4',
    trackName: 'Data Science',
    createdAt: '2024-02-14',
    updatedAt: '2024-03-10',
    topics: [
      { nodeId: 't15', title: 'Python for Data Science', description: 'NumPy, Pandas, Matplotlib', links: [], subtopics: [] },
      { nodeId: 't16', title: 'Machine Learning', description: 'Supervised and unsupervised learning', links: [], subtopics: [{ nodeId: 's10', title: 'Scikit-learn', description: 'ML library', links: [] }, { nodeId: 's11', title: 'Model Evaluation', description: 'Accuracy, F1, ROC', links: [] }] },
      { nodeId: 't17', title: 'Deep Learning', description: 'Neural networks and TensorFlow', links: [], subtopics: [] },
    ],
  },
  {
    id: 'track-5',
    trackName: 'Mobile Development',
    createdAt: '2024-03-01',
    updatedAt: '2024-03-22',
    topics: [
      { nodeId: 't18', title: 'React Native', description: 'Cross-platform mobile apps', links: [{ title: 'React Native Docs', url: 'https://reactnative.dev', type: 'documentation' }], subtopics: [] },
      { nodeId: 't19', title: 'State Management', description: 'Redux, Zustand, Context', links: [], subtopics: [] },
      { nodeId: 't20', title: 'App Store Deployment', description: 'Publishing to iOS and Android', links: [], subtopics: [] },
    ],
  },
  {
    id: 'track-6',
    trackName: 'Cybersecurity',
    createdAt: '2024-03-05',
    updatedAt: '2024-03-25',
    topics: [
      { nodeId: 't21', title: 'Network Security', description: 'Firewalls, VPNs, Protocols', links: [], subtopics: [] },
      { nodeId: 't22', title: 'Ethical Hacking', description: 'Penetration testing basics', links: [], subtopics: [{ nodeId: 's12', title: 'Kali Linux', description: 'Security-focused OS', links: [] }] },
      { nodeId: 't23', title: 'Web Application Security', description: 'OWASP Top 10', links: [], subtopics: [] },
      { nodeId: 't24', title: 'Cryptography', description: 'Encryption fundamentals', links: [], subtopics: [] },
    ],
  },
];

let nextId = 7;
const delay = (ms = 500) => new Promise<void>((r) => setTimeout(r, ms));

// ─── CRUD ─────────────────────────────────────────────────────────────────────

/** GET all tracks */
export const adminGetTracks = async (): Promise<AdminTrack[]> => {
  await delay(400);
  return [...fakeDb];
};

/** POST create new track */
export const adminCreateTrack = async (payload: { trackName: string; topics: AdminTopic[] }): Promise<AdminTrack> => {
  await delay(600);
  const now = new Date().toISOString().split('T')[0];
  const newTrack: AdminTrack = {
    id: `track-${nextId++}`,
    trackName: payload.trackName,
    topics: payload.topics,
    createdAt: now,
    updatedAt: now,
  };
  fakeDb = [newTrack, ...fakeDb];
  return newTrack;
};

/** PUT update track */
export const adminUpdateTrack = async (id: string, payload: { trackName: string; topics: AdminTopic[] }): Promise<AdminTrack> => {
  await delay(600);
  fakeDb = fakeDb.map((t) =>
    t.id === id ? { ...t, trackName: payload.trackName, topics: payload.topics, updatedAt: new Date().toISOString().split('T')[0] } : t
  );
  return fakeDb.find((t) => t.id === id)!;
};

/** DELETE track */
export const adminDeleteTrack = async (id: string): Promise<void> => {
  await delay(500);
  fakeDb = fakeDb.filter((t) => t.id !== id);
};
