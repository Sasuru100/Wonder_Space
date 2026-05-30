import { useLanguage } from '../contexts/LanguageContext';
import { Sparkles, Globe, MapPin, Video, Award, MessageSquare, ShieldAlert, Languages } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Navbar({ activeTab, setActiveTab }: NavbarProps) {
  const { language, setLanguage, t } = useLanguage();

  const tabs = [
    { id: 'facts', label: t.facts, icon: Sparkles },
    { id: 'places', label: t.places, icon: MapPin },
    { id: 'videos', label: t.videos, icon: Video },
    { id: 'quiz', label: t.quiz, icon: Award },
    { id: 'theories', label: t.theories, icon: MessageSquare },
    { id: 'admin', label: t.admin, icon: ShieldAlert },
  ];

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-space-950/80 border-b border-purple-900/40 px-4 py-3">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand Logo & Name */}
        <div 
          onClick={() => setActiveTab('facts')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="relative w-10 h-10 rounded-full bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center shadow-[0_0_15px_rgba(168,85,247,0.5)] group-hover:scale-110 transition-transform duration-300">
            <Globe className="w-6 h-6 text-white animate-pulse" />
            <div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-purple-600 to-pink-500 blur opacity-30 group-hover:opacity-75 transition-opacity" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-amber-300 font-sans">
              WONDER SPACE
            </h1>
            <p className="text-[10px] text-purple-300 tracking-widest uppercase font-mono">
              {language === 'si' ? 'විස්මිත අවකාශය' : 'Cosmic Mysteries'}
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex flex-wrap justify-center gap-1 bg-purple-950/40 p-1 rounded-full border border-purple-900/30">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-medium transition-all duration-300 ${
                  isActive
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-[0_0_10px_rgba(168,85,247,0.4)]'
                    : 'text-purple-200 hover:text-white hover:bg-purple-900/30'
                }`}
              >
                <Icon className="w-3.5 h-3.5 md:w-4 md:h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Language Toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setLanguage(language === 'en' ? 'si' : 'en')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-purple-800 bg-purple-950/60 hover:bg-purple-900/80 text-xs text-purple-200 hover:text-white transition-all duration-300 shadow-[0_0_10px_rgba(147,51,234,0.1)]"
          >
            <Languages className="w-4 h-4 text-purple-400" />
            <span className="font-bold">{language === 'en' ? 'සිංහල' : 'English'}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
