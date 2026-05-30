import { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { ThumbsUp, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface Fact {
  id: number;
  title: string;
  description: string;
  title_si: string;
  description_si: string;
  category: string;
  upvotes: number;
  image_url?: string;
}

interface FactCardProps {
  fact: Fact;
  onUpvote: (id: number) => void;
}

export default function FactCard({ fact, onUpvote }: FactCardProps) {
  const { language, t } = useLanguage();
  const [upvoted, setUpvoted] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const handleUpvote = () => {
    if (upvoted) return;
    setUpvoted(true);
    onUpvote(fact.id);
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 2000);
  };

  const displayTitle = language === 'si' ? fact.title_si : fact.title;
  const displayDesc = language === 'si' ? fact.description_si : fact.description;

  // Placeholder cosmic image if none provided
  const image = fact.image_url || 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80';

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.4 }}
      className="relative overflow-hidden rounded-2xl border border-purple-900/40 bg-purple-950/20 backdrop-blur-md flex flex-col justify-between h-full hover:border-pink-500/40 transition-colors duration-300 group"
    >
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600/10 rounded-full blur-3xl pointer-events-none group-hover:bg-pink-600/20 transition-all duration-500" />

      {/* Image container */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={image}
          alt={displayTitle}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 brightness-90"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-space-950 via-space-950/20 to-transparent" />
        <span className="absolute top-3 left-3 bg-purple-900/80 backdrop-blur-md border border-purple-500/30 text-purple-200 text-[10px] font-mono uppercase px-2.5 py-1 rounded-full tracking-wider">
          {fact.category}
        </span>
      </div>

      {/* Content */}
      <div className="p-5 flex-grow flex flex-col justify-between">
        <div>
          <h3 className="text-lg font-bold text-white group-hover:text-pink-300 transition-colors duration-300 mb-2 font-sans line-clamp-2">
            {displayTitle}
          </h3>
          <p className="text-xs md:text-sm text-purple-200/80 leading-relaxed font-sans line-clamp-4">
            {displayDesc}
          </p>
        </div>

        {/* Footer Actions */}
        <div className="mt-5 pt-4 border-t border-purple-900/30 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-purple-400 font-mono">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" style={{ animationDuration: '6s' }} />
            <span>{fact.upvotes + (upvoted ? 1 : 0)} upvotes</span>
          </div>

          <button
            onClick={handleUpvote}
            disabled={upvoted}
            className={`relative flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-300 overflow-hidden ${
              upvoted
                ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-[0_0_15px_rgba(236,72,153,0.4)]'
                : 'bg-purple-900/40 hover:bg-purple-800/60 text-purple-100 border border-purple-500/20 hover:border-purple-400/40'
            }`}
          >
            <ThumbsUp className={`w-3.5 h-3.5 ${upvoted ? 'scale-110 animate-bounce' : ''}`} />
            <span>{upvoted ? t.upvoted : t.upvote}</span>

            {/* Confetti particles */}
            <AnimatePresence>
              {showConfetti && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  {[...Array(6)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ scale: 0, x: 0, y: 0 }}
                      animate={{
                        scale: [0, 1, 0],
                        x: (Math.random() - 0.5) * 50,
                        y: (Math.random() - 0.5) * 50,
                      }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                      className="absolute w-1.5 h-1.5 bg-pink-400 rounded-full"
                    />
                  ))}
                </div>
              )}
            </AnimatePresence>
          </button>
        </div>
      </div>
    </motion.div>
  );
}
