import { useState, useEffect } from 'react';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import Starfield from './components/Starfield';
import Navbar from './components/Navbar';
import FactCard, { Fact } from './components/FactCard';
import PlaceCard, { Place } from './components/PlaceCard';
import VideoHub from './components/VideoHub';
import QuizGame from './components/QuizGame';
import TheoriesBoard from './components/TheoriesBoard';
import AdminPanel from './components/AdminPanel';
import { Sparkles, Globe, Compass, ArrowDownCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function AppContent() {
  const { language, t } = useLanguage();
  const [activeTab, setActiveTab] = useState('facts');
  const [facts, setFacts] = useState<Fact[]>([]);
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [factsRes, placesRes] = await Promise.all([
        fetch('/api/ws_facts'),
        fetch('/api/ws_places'),
      ]);

      if (factsRes.ok) setFacts(await factsRes.json());
      if (placesRes.ok) setPlaces(await placesRes.json());
    } catch (err) {
      console.error('Error fetching landing data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleFactUpvote = async (id: number) => {
    try {
      const res = await fetch('/api/ws_facts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'upvote', id }),
      });
      if (res.ok) {
        // Update local state upvotes
        setFacts(prev => prev.map(f => f.id === id ? { ...f, upvotes: f.upvotes + 1 } : f));
      }
    } catch (err) {
      console.error('Error upvoting fact:', err);
    }
  };

  // Filter logic
  const filteredFacts = facts.filter(f => {
    const title = language === 'si' ? f.title_si : f.title;
    const desc = language === 'si' ? f.description_si : f.description;
    return (
      title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const filteredPlaces = places.filter(p => {
    const name = language === 'si' ? p.name_si : p.name;
    const desc = language === 'si' ? p.description_si : p.description;
    return (
      name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.location.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="min-h-screen text-white relative">
      <Starfield />
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* HERO BANNER */}
      <AnimatePresence mode="wait">
        {activeTab === 'facts' && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-7xl mx-auto px-4 pt-16 pb-12 text-center space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-purple-800 bg-purple-950/50 backdrop-blur-md text-pink-400 text-xs font-mono uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              <span>{language === 'si' ? 'විස්මිත අවකාශයට සාදරයෙන් පිළිගනිමු' : 'WELCOME TO THE UNKNOWN'}</span>
            </div>

            <h1 className="text-4xl md:text-7xl font-black tracking-tight leading-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-amber-300">
              {t.title}
            </h1>

            <p className="text-purple-200/80 max-w-3xl mx-auto text-sm md:text-lg leading-relaxed font-sans">
              {t.tagline}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <button
                onClick={() => {
                  const el = document.getElementById('facts-grid');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-6 py-3 rounded-full font-bold bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:scale-105 transition-transform duration-300 text-xs tracking-wider uppercase flex items-center gap-1.5"
              >
                <Compass className="w-4 h-4" />
                <span>{language === 'si' ? 'දැන්ම ගවේෂණය කරන්න' : 'INITIATE DISCOVERY'}</span>
              </button>
            </div>

            <div className="pt-8 animate-bounce">
              <ArrowDownCircle className="w-8 h-8 mx-auto text-purple-400 opacity-60" />
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* SEARCH BAR (For Facts & Places) */}
      {(activeTab === 'facts' || activeTab === 'places') && (
        <div className="max-w-md mx-auto px-4 mb-8">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={t.search}
              className="w-full px-5 py-3 rounded-xl border border-purple-900/60 bg-purple-950/30 backdrop-blur-md text-white text-xs md:text-sm focus:outline-none focus:border-pink-500 transition-colors shadow-[0_0_15px_rgba(168,85,247,0.05)] placeholder-purple-400"
            />
            <span className="absolute right-4 top-3.5 text-purple-400 text-xs font-mono">📡</span>
          </div>
        </div>
      )}

      {/* CONTENT ARENA */}
      <main className="pb-24">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-purple-300 font-mono text-xs">{t.loading}</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {activeTab === 'facts' && (
              <motion.div
                key="facts"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                id="facts-grid"
                className="max-w-7xl mx-auto px-4"
              >
                <div className="text-center mb-8">
                  <h2 className="text-2xl md:text-4xl font-extrabold text-white mb-2 font-sans">{t.exploreFacts}</h2>
                  <p className="text-xs md:text-sm text-purple-300">{filteredFacts.length} signals decrypted</p>
                </div>

                {filteredFacts.length === 0 ? (
                  <p className="text-center text-purple-400 font-mono py-10">No signals matching search criteria.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                    {filteredFacts.map((fact) => (
                      <FactCard key={fact.id} fact={fact} onUpvote={handleFactUpvote} />
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'places' && (
              <motion.div
                key="places"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="max-w-7xl mx-auto px-4"
              >
                <div className="text-center mb-8">
                  <h2 className="text-2xl md:text-4xl font-extrabold text-white mb-2 font-sans">{t.explorePlaces}</h2>
                  <p className="text-xs md:text-sm text-purple-300">{filteredPlaces.length} anomalous coordinates recorded</p>
                </div>

                {filteredPlaces.length === 0 ? (
                  <p className="text-center text-purple-400 font-mono py-10">No coordinates matching search criteria.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                    {filteredPlaces.map((place) => (
                      <PlaceCard key={place.id} place={place} />
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'videos' && (
              <motion.div
                key="videos"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <VideoHub />
              </motion.div>
            )}

            {activeTab === 'quiz' && (
              <motion.div
                key="quiz"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <QuizGame />
              </motion.div>
            )}

            {activeTab === 'theories' && (
              <motion.div
                key="theories"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <TheoriesBoard />
              </motion.div>
            )}

            {activeTab === 'admin' && (
              <motion.div
                key="admin"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <AdminPanel />
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </main>

      {/* FOOTER */}
      <footer className="border-t border-purple-900/30 bg-space-950/80 backdrop-blur-md py-6 text-center text-xs text-purple-400 font-mono mt-20">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2025 WONDER SPACE. All rights reserved.</p>
          <p className="flex items-center gap-1">
            <span>Made with 💜 for Wonder Space YouTube Channel</span>
          </p>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}
