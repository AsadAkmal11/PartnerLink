/**
 * Static landing-page content.
 *
 * IMPORTANT: every person below is FICTIONAL demonstration data.
 * None of it comes from a matching API, and the indicators shown in the UI
 * illustrate the concept only. Do not replace with real GIKI people.
 */
import {
  BookMarked,
  GraduationCap,
  Handshake,
  Layers,
  Library,
  Search,
  Sparkles,
  UserRound,
  Users,
} from 'lucide-react';

/* ── Navigation ─────────────────────────────────────────────────────────── */
export const NAV_ITEMS = [
  { id: 'home', label: 'Home' },
  { id: 'features', label: 'Features' },
  { id: 'how-it-works', label: 'How It Works' },
  { id: 'discover', label: 'Matches' },
  { id: 'faculty', label: 'Faculty' },
];

export const NAV_SECTION_IDS = NAV_ITEMS.map((item) => item.id);

/* ── Features ───────────────────────────────────────────────────────────── */
export const FEATURES = [
  {
    icon: UserRound,
    title: 'Student profiles',
    description:
      'A focused profile for your skills, interests, preferred research domains and academic details — everything a teammate needs at a glance.',
  },
  {
    icon: Search,
    title: 'Skill-based discovery',
    description:
      'Search and filter classmates by the skills your project needs, so you find people who complement your strengths instead of duplicating them.',
  },
  {
    icon: Sparkles,
    title: 'Interest matching',
    description:
      'Surface students who are drawn to the same problem spaces — computer vision, embedded systems, NLP and more.',
  },
  {
    icon: GraduationCap,
    title: 'Academic compatibility',
    description:
      'Consider academic goals and commitment alongside skills, so expectations are aligned before the project begins.',
  },
  {
    icon: Users,
    title: 'Faculty discovery',
    description:
      'Explore verified faculty by research domain and find a supervisor whose work fits the project you want to build.',
  },
  {
    icon: Library,
    title: 'FYP reference library',
    description:
      'Browse previous Final Year Projects for inspiration on scope, technology choices and research directions.',
  },
];

/* ── How it works ───────────────────────────────────────────────────────── */
export const STEPS = [
  {
    icon: Layers,
    title: 'Build your profile',
    description:
      'Add your skills, interests and the research domains you want to explore. Your profile becomes the basis for discovery.',
    points: ['Skills & tools', 'Research interests', 'Academic goals'],
  },
  {
    icon: Search,
    title: 'Discover compatible students',
    description:
      'Browse classmates with complementary skills and overlapping interests, and filter by the domain your project needs.',
    points: ['Complementary skills', 'Shared interests', 'Domain filters'],
  },
  {
    icon: Handshake,
    title: 'Connect and explore projects',
    description:
      'Reach out to potential partners, find a suitable faculty supervisor and draw ideas from previous FYPs.',
    points: ['Partner outreach', 'Faculty supervisors', 'Project references'],
  },
];

/* ── Discovery preview (FICTIONAL) ──────────────────────────────────────── */
export const DEMO_INTERESTS = [
  'Computer Vision',
  'Embedded Systems',
  'NLP',
  'Robotics',
  'Web Platforms',
  'Cybersecurity',
];

export const DEMO_STUDENTS = [
  {
    id: 'demo-1',
    name: 'Aria Noor',
    program: 'Computer Science',
    tone: 'gold',
    matchScore: 92,
    skills: ['Python', 'PyTorch', 'OpenCV'],
    interests: ['Computer Vision', 'Robotics'],
    bio: 'Building vision systems for campus robotics and medical imaging.',
    image: 'https://api.dicebear.com/9.x/notionists/svg?seed=AriaNoor&backgroundColor=1a1a22',
  },
  {
    id: 'demo-2',
    name: 'Zayan Malik',
    program: 'Computer Engineering',
    tone: 'navy',
    matchScore: 84,
    skills: ['C/C++', 'Arduino', 'PCB Design'],
    interests: ['Embedded Systems', 'Robotics'],
    bio: 'Hardware-first maker exploring edge AI and sensor networks.',
    image: 'https://api.dicebear.com/9.x/notionists/svg?seed=ZayanMalik&backgroundColor=1a1a22',
  },
  {
    id: 'demo-3',
    name: 'Hira Saeed',
    program: 'Software Engineering',
    tone: 'success',
    matchScore: 78,
    skills: ['React', 'Node.js', 'PostgreSQL'],
    interests: ['Web Platforms', 'NLP'],
    bio: 'Full-stack engineer interested in language tech and product systems.',
    image: 'https://api.dicebear.com/9.x/notionists/svg?seed=HiraSaeed&backgroundColor=1a1a22',
  },
  {
    id: 'demo-4',
    name: 'Omar Farooq',
    program: 'Cyber Security',
    tone: 'soft',
    matchScore: 71,
    skills: ['Networking', 'Linux', 'Go'],
    interests: ['Cybersecurity', 'Embedded Systems'],
    bio: 'Secure systems and embedded device hardening for FYP work.',
    image: 'https://api.dicebear.com/9.x/notionists/svg?seed=OmarFarooq&backgroundColor=1a1a22',
  },
];

/** Lanyard rail items derived from demo students (fictional). */
export const DEMO_LANYARD_MEMBERS = DEMO_STUDENTS.map((s, i) => ({
  id: s.id,
  name: s.name,
  role: s.program,
  team: 'GIKI · FYP',
  image: s.image,
  bio: s.bio,
  tags: [...s.skills.slice(0, 2), ...s.interests.slice(0, 1)],
  tone: /** @type {1|2|3|4|5} */ ((i % 5) + 1),
  drop: [6, 18, 2, 12][i] ?? 8,
}));

/** Bar-race rows for demo match scores (0–100). */
export const DEMO_MATCH_BARS = DEMO_STUDENTS.map((s, i) => ({
  id: s.id,
  label: s.name.split(' ')[0],
  value: s.matchScore,
  color: /** @type {1|2|3|4|5} */ ((i % 5) + 1),
}));

/* ── Faculty preview (FICTIONAL) ────────────────────────────────────────── */
export const FACULTY_DOMAINS = ['All', 'Intelligent Systems', 'Embedded & IoT', 'Software & Data'];

export const DEMO_FACULTY = [
  {
    id: 'fac-a',
    name: 'Faculty Member A',
    department: 'Example Department of Computing',
    domain: 'Intelligent Systems',
    areas: ['Computer Vision', 'Machine Learning', 'Medical Imaging'],
    icon: Sparkles,
  },
  {
    id: 'fac-b',
    name: 'Faculty Member B',
    department: 'Example Department of Engineering',
    domain: 'Embedded & IoT',
    areas: ['Embedded Systems', 'Sensor Networks', 'Edge AI'],
    icon: Layers,
  },
  {
    id: 'fac-c',
    name: 'Faculty Member C',
    department: 'Example Department of Computing',
    domain: 'Software & Data',
    areas: ['Distributed Systems', 'Databases', 'Cloud Platforms'],
    icon: BookMarked,
  },
  {
    id: 'fac-d',
    name: 'Faculty Member D',
    department: 'Example Department of Computing',
    domain: 'Intelligent Systems',
    areas: ['NLP', 'Information Retrieval', 'Urdu Language Tech'],
    icon: Search,
  },
];
