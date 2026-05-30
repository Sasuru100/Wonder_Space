import { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { MapPin, Compass, ShieldAlert, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export interface Place {
  id: number;
  name: string;
  name_si: string;
  description: string;
  description_si: string;
  location: string;
  coordinates: string;
  mystery_score: number;
  image_url?: string;
}

interface PlaceCardProps {
  place: Place;
}

export default function PlaceCard({ place }: PlaceCardProps) {
  const { language, t } = useLanguage();
  const [isFlipped, setIsFlipped] = useState(false);

  const displayName = language === 'si' ? place.name_si : place.name;
  const displayDesc = language === 'si' ? place.description_si : place.description;

  const image = place.image_url || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80';

  // Generate mystery score stars
  const renderMysteryScore = () => {
    return (
      <div className="flex items-center gap-1">
        {[...Array(10)].map((_, i) => (
          <div
            key={i}
            className={`h-4 w-1.5 rounded-sm transition-all duration-500 ${
              i < place.mystery_score
                ? 'bg-gradient-to-t from-pink-500 to-amber-400 shadow-[0_0_5px_rgba(236,72,153,0.6)]'
                : 'bg-purple-950 border border-purple-900'
            }`}
          />
        ))}
        <span className="text-xs font-mono font-bold text-amber-300 ml-1.5">{place.mystery_score}/10</span>
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative h-[420px] rounded-2xl border border-purple-900/40 bg-purple-950/10 backdrop-blur-md overflow-hidden group perspective-1000"
    >
      <div
        className={`relative w-full h-full duration-700 transform-style-3d cursor-pointer ${
          isFlipped ? 'rotate-y-180' : ''
        }`}
        onClick={() => setIsFlipped(!isFlipped)}
      >
        {/* FRONT SIDE */}
        <div className="absolute inset-0 backface-hidden flex flex-col justify-between h-full">
          {/* Card Image */}
          <div className="relative h-56 overflow-hidden">
            <img
              src={image}
              alt={displayName}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 brightness-90"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-space-950 via-space-950/20 to-transparent" />
            
            {/* Mystery Score badge */}
            <div className="absolute top-3 right-3 bg-purple-950/90 backdrop-blur-md border border-purple-500/30 px-3 py-1.5 rounded-full flex flex-col gap-0.5 items-end">
              <span className="text-[8px] text-purple-300 tracking-wider uppercase font-mono">{t.mysteryScore}</span>
              {renderMysteryScore()}
            </div>

            {/* Coordinates Badge */}
            <div className="absolute bottom-3 left-3 bg-space-950/80 backdrop-blur-md border border-purple-500/20 px-3 py-1 rounded-lg flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-pink-400 animate-spin" style={{ animationDuration: '12s' }} />
              <span className="text-[10px] font-mono text-pink-300 font-bold">{place.coordinates}</span>
            </div>
          </div>

          {/* Card Body */}
          <div className="p-5 flex-grow flex flex-col justify-between bg-gradient-to-b from-space-950/40 to-space-950/90">
            <div>
              <div className="flex items-center gap-1 text-xs text-purple-300 mb-1.5">
                <MapPin className="w-3.5 h-3.5 text-purple-400" />
                <span>{place.location}</span>
              </div>
              <h3 className="text-xl font-extrabold text-white group-hover:text-amber-300 transition-colors duration-300 mb-2 font-sans">
                {displayName}
              </h3>
              <p className="text-xs text-purple-200/70 line-clamp-3 leading-relaxed font-sans">
                {displayDesc}
              </p>
            </div>

            <div className="text-center text-[10px] text-purple-400 font-mono tracking-widest uppercase border-t border-purple-900/30 pt-3 group-hover:text-pink-400 transition-colors">
              {language === 'si' ? 'විස්තර දැනගන්න ක්ලික් කරන්න' : 'CLICK TO DECRYPT DISCOVERY'}
            </div>
          </div>
        </div>

        {/* BACK SIDE (FLIPPED) */}
        <div className="absolute inset-0 backface-hidden rotate-y-180 bg-gradient-to-b from-purple-950 via-space-950 to-space-950 border border-pink-500/30 rounded-2xl p-6 flex flex-col justify-between h-full overflow-y-auto">
          <div>
            <div className="flex items-center gap-2 mb-4 border-b border-purple-900/40 pb-3">
              <ShieldAlert className="w-5 h-5 text-pink-400 animate-pulse" />
              <h4 className="text-sm font-mono tracking-wider text-pink-300 uppercase">{t.explorePlaces}</h4>
            </div>

            <h3 className="text-lg font-bold text-white mb-3 font-sans">{displayName}</h3>
            
            <div className="space-y-3 text-xs md:text-sm text-purple-100/90 leading-relaxed font-sans">
              <p className="whitespace-pre-line">{displayDesc}</p>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-purple-900/40 flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-purple-400">{t.location}:</span>
              <span className="text-white font-bold">{place.location}</span>
            </div>
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-purple-400">{t.coordinates}:</span>
              <span className="text-pink-300 font-bold">{place.coordinates}</span>
            </div>
            <button className="mt-2 text-center text-xs text-pink-400 hover:text-pink-300 font-mono tracking-widest uppercase">
              {language === 'si' ? 'ආපසු හැරෙන්න' : 'RETURN TO COMPASS'}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
