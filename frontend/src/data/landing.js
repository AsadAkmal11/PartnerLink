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
    skills: ['Python', 'PyTorch', 'OpenCV'],
    interests: ['Computer Vision', 'Robotics'],
  },
  {
    id: 'demo-2',
    name: 'Zayan Malik',
    program: 'Computer Engineering',
    tone: 'navy',
    skills: ['C/C++', 'Arduino', 'PCB Design'],
    interests: ['Embedded Systems', 'Robotics'],
  },
  {
    id: 'demo-3',
    name: 'Hira Saeed',
    program: 'Software Engineering',
    tone: 'success',
    skills: ['React', 'Node.js', 'PostgreSQL'],
    interests: ['Web Platforms', 'NLP'],
  },
  {
    id: 'demo-4',
    name: 'Omar Farooq',
    program: 'Cyber Security',
    tone: 'soft',
    skills: ['Networking', 'Linux', 'Go'],
    interests: ['Cybersecurity', 'Embedded Systems'],
  },
];

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
