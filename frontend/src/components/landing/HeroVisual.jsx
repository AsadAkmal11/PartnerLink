import { motion } from 'motion/react';
import { BadgeCheck, Search, Sparkles, SlidersHorizontal } from 'lucide-react';
import Avatar from '../common/Avatar.jsx';
import Badge from '../common/Badge.jsx';
import { EASE_OUT, float } from '../../lib/motion.js';

/* Fictional people shown in the illustrative dashboard */
const PREVIEW_ROWS = [
  { name: 'Aria Noor', program: 'Computer Science', tone: 'gold', tags: ['Computer Vision', 'PyTorch'], fit: 'Strong overlap', level: 0.9 },
  { name: 'Zayan Malik', program: 'Computer Engineering', tone: 'navy', tags: ['Embedded', 'C/C++'], fit: 'Complementary skills', level: 0.72 },
  { name: 'Hira Saeed', program: 'Software Engineering', tone: 'success', tags: ['React', 'NLP'], fit: 'Shared interest', level: 0.58 },
];

const FILTERS = ['Computer Vision', 'Embedded', 'NLP'];

const FLOATING_TAGS = [
  { label: 'Machine Learning', className: 'left-[-3.5rem] bottom-[18%]', delay: 0.2 },
  { label: 'IoT', className: 'right-[-1.75rem] top-[-1rem]', delay: 1.1 },
  { label: 'UI/UX', className: 'left-[30%] bottom-[-1.1rem]', delay: 0.6 },
];

function Row({ row, index }) {
  return (
    <motion.li
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 1 + index * 0.15, ease: EASE_OUT }}
      className={`flex items-center gap-3 rounded-xl border p-3 ${
        index === 0 ? 'border-primary/35 bg-primary/[0.06]' : 'border-border bg-surface'
      }`}
    >
      <Avatar name={row.name} tone={row.tone} size="sm" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-semibold text-text">{row.name}</p>
          {index === 0 && <BadgeCheck size={14} className="shrink-0 text-primary-highlight" aria-hidden="true" />}
        </div>
        <p className="truncate text-xs text-text-muted">{row.program}</p>
        <div className="mt-1.5 hidden flex-wrap gap-1 sm:flex">
          {row.tags.map((tag) => (
            <Badge key={tag} size="sm" variant={index === 0 ? 'gold' : 'default'}>
              {tag}
            </Badge>
          ))}
        </div>
      </div>
      <div className="w-24 shrink-0 text-right sm:w-28">
        <p className="text-[0.6875rem] font-medium text-text-secondary">{row.fit}</p>
        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-border/70">
          <motion.div
            className="h-full origin-left rounded-full bg-gradient-to-r from-primary to-primary-highlight"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: row.level }}
            transition={{ duration: 1.1, delay: 1.3 + index * 0.15, ease: EASE_OUT }}
          />
        </div>
      </div>
    </motion.li>
  );
}

/**
 * HeroVisual — an illustrative (non-functional) preview of partner discovery,
 * with floating profile cards and skill tags around it.
 */
export default function HeroVisual() {
  return (
    <div className="relative mx-auto w-full max-w-xl lg:max-w-none">
      {/* Soft gold halo behind the window */}
      <div
        aria-hidden="true"
        className="absolute inset-6 -z-10 rounded-[2rem] opacity-80 blur-3xl"
        style={{ background: 'radial-gradient(closest-side, color-mix(in oklab, var(--color-primary) 28%, transparent), transparent)' }}
      />

      {/* Dashboard window */}
      <motion.figure
        initial={{ opacity: 0, y: 30, rotateX: 8 }}
        animate={{ opacity: 1, y: 0, rotateX: 0 }}
        transition={{ duration: 1, delay: 0.45, ease: EASE_OUT }}
        style={{ transformPerspective: 1200 }}
        className="gold-hairline relative overflow-hidden rounded-2xl border border-border bg-surface-elevated/90 shadow-elevated backdrop-blur"
        aria-label="Illustrative preview of the PartnerLink discovery dashboard with fictional students"
      >
        {/* Window chrome */}
        <div className="flex items-center gap-2 border-b border-border px-4 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-text-muted/40" />
          <span className="h-2.5 w-2.5 rounded-full bg-text-muted/40" />
          <span className="h-2.5 w-2.5 rounded-full bg-primary/70" />
          <span className="ml-3 truncate text-xs font-medium text-text-muted">partnerlink / discover</span>
          <Badge size="sm" variant="outline" className="ml-auto">
            Illustrative preview
          </Badge>
        </div>

        <div className="space-y-4 p-4 sm:p-5">
          {/* Search */}
          <div className="flex items-center gap-2">
            <div className="flex h-10 flex-1 items-center gap-2 rounded-xl border border-border bg-surface px-3 text-sm text-text-muted">
              <Search size={15} aria-hidden="true" />
              <span className="truncate">Search by skill, interest or domain</span>
            </div>
            <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-surface text-text-secondary">
              <SlidersHorizontal size={15} aria-hidden="true" />
            </span>
          </div>

          {/* Filter chips */}
          <div className="flex flex-wrap gap-1.5">
            {FILTERS.map((filter, i) => (
              <Badge key={filter} variant={i === 0 ? 'gold' : 'default'}>
                {filter}
              </Badge>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <p className="font-display text-sm font-bold text-text">Suggested partners</p>
            <p className="text-xs text-text-muted">Fictional profiles</p>
          </div>

          <ul className="space-y-2.5">
            {PREVIEW_ROWS.map((row, i) => (
              <Row key={row.name} row={row} index={i} />
            ))}
          </ul>
        </div>
      </motion.figure>

      {/* Floating "your profile" card */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 1.2, ease: EASE_OUT }}
        className="absolute -left-4 -top-14 hidden sm:block lg:-left-10"
        aria-hidden="true"
      >
        <motion.div
          {...float(8, 6)}
          className="flex items-center gap-3 rounded-2xl border border-border bg-surface/95 p-3 pr-4 shadow-elevated backdrop-blur"
        >
          <Avatar name="Your Profile" tone="gold" size="md" />
          <div>
            <p className="text-xs text-text-muted">Your profile</p>
            <div className="mt-1 flex gap-1">
              <Badge size="sm" variant="gold">Python</Badge>
              <Badge size="sm">Vision</Badge>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Floating "shared interest" card */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 1.5, ease: EASE_OUT }}
        className="absolute -bottom-12 -right-2 hidden sm:block lg:-right-8"
        aria-hidden="true"
      >
        <motion.div
          {...float(10, 7, 0.8)}
          className="flex max-w-[15rem] items-start gap-3 rounded-2xl border border-primary/30 bg-surface/95 p-3.5 shadow-elevated backdrop-blur"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary-highlight">
            <Sparkles size={17} />
          </span>
          <div>
            <p className="text-xs font-semibold text-text">Shared interest found</p>
            <p className="mt-0.5 text-xs leading-snug text-text-muted">Both exploring computer vision</p>
          </div>
        </motion.div>
      </motion.div>

      {/* Floating skill tags — large screens only */}
      {FLOATING_TAGS.map((tag) => (
        <motion.div
          key={tag.label}
          aria-hidden="true"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 1.6 + tag.delay, ease: EASE_OUT }}
          className={`absolute hidden lg:block ${tag.className}`}
        >
          <motion.span
            {...float(6, 5 + tag.delay * 2, tag.delay)}
            className="block rounded-full border border-border bg-surface/90 px-3 py-1.5 text-xs font-medium text-text-secondary shadow-card backdrop-blur"
          >
            {tag.label}
          </motion.span>
        </motion.div>
      ))}
    </div>
  );
}
