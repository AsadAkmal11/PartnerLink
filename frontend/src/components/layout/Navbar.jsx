import { Link } from 'react-router-dom';
import { Handshake } from 'lucide-react';
import { motion } from 'motion/react';

export default function Navbar() {
  return (
    <motion.header
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="sticky top-0 z-50 border-b border-navy-700/40 bg-navy-900/80 backdrop-blur-md"
    >
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <motion.span
            whileHover={{ rotate: 15, scale: 1.1 }}
            transition={{ type: 'spring', stiffness: 300 }}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-cream-100/15 text-cream-100 border border-cream-100/20"
          >
            <Handshake size={17} />
          </motion.span>
          <span
            className="text-lg font-bold text-cream-100"
            style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
          >
            PartnerLink
          </span>
        </Link>

        {/* Badge */}
        <span className="flex items-center gap-1.5 text-xs uppercase tracking-widest font-semibold text-cream-200/60">
          <span className="h-1.5 w-1.5 rounded-full bg-cream-400 animate-soft-pulse" />
          GIKI Exclusive
        </span>
      </nav>
    </motion.header>
  );
}
