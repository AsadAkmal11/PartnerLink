/**
 * Card — navy-toned glassmorphism surface.
 */
export default function Card({ children, className = '' }) {
  return (
    <div
      className={`rounded-2xl border border-navy-700/70 bg-navy-900/60 backdrop-blur-sm p-6 ${className}`}
    >
      {children}
    </div>
  );
}
