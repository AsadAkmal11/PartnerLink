import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';
import { motion } from 'motion/react';

export default function NotFoundPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-6 text-center"
    >
      <span
        className="text-8xl font-extrabold text-navy-700"
        style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
      >
        404
      </span>
      <h1 className="text-2xl font-bold text-cream-100">Page not found</h1>
      <p className="text-cream-200/50">This route doesn&apos;t exist yet. More pages are coming soon.</p>
      <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
        <Link
          to="/"
          className="flex items-center gap-2 rounded-xl bg-cream-100 px-6 py-2.5 text-sm font-bold text-navy-950 hover:bg-cream-200 transition-colors"
        >
          <Home size={16} />
          Back to home
        </Link>
      </motion.div>
    </motion.div>
  );
}
