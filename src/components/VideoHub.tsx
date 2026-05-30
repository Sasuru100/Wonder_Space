import { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Video, Star, Play, ExternalLink, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export interface VideoItem {
  id: number;
  title: string;
  title_si: string;
  youtube_id: string;
  category: string;
  duration: string;
  views: number;
}

export default function VideoHub() {
  const { language, t } = useLanguage();
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);
  const [activeCategory, setActiveCategory] = useState('All');

  const fetchVideos = async () => {
    try {
      const res = await fetch('/api/ws_videos');
      if (res.ok) {
        const data = await res.json();
        setVideos(data);
        if (data.length > 0) {
          setSelectedVideo(data[0]);
        }
      }
    } catch (err) {
      console.error('Error fetching videos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const categories = ['All', 'Cosmos', 'Mysteries', 'Science', 'Ancient'];

  const filteredVideos = activeCategory === 'All'
    ? videos
    : videos.filter(v => v.category.toLowerCase() === activeCategory.toLowerCase());

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-purple-300 font-mono text-xs">{t.loading}</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header section */}
      <div className="text-center mb-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-purple-800 bg-purple-950/50 backdrop-blur-md text-pink-400 text-xs font-mono uppercase tracking-wider mb-4"
        >
          <Video className="w-3.5 h-3.5 animate-pulse" />
          <span>WONDER SPACE BROADCASTS</span>
        </motion.div>
        <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight mb-4 font-sans">
          {language === 'si' ? 'විස්මිත වීඩියෝ එකතුව' : 'Decrypted Video Archives'}
        </h2>
        <p className="text-purple-200/70 max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
          {language === 'si' 
            ? 'අපගේ YouTube චැනලයෙන් උපුටාගත්, විශ්වයේ සහ ලෝකයේ අමුතුම දේවල් පිළිබඳ විස්මිත වීඩියෝ මෙතැනින් නරඹන්න.'
            : 'Explore our hand-picked high-definition video broadcasts directly from the Wonder Space YouTube channel.'}
        </p>
      </div>

      {/* Category filters */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-full text-xs font-mono uppercase tracking-wider transition-all duration-300 ${
              activeCategory === cat
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]'
                : 'bg-purple-950/40 border border-purple-900/40 text-purple-300 hover:text-white hover:bg-purple-900/40'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Video Hub Grid Layout */}
      {videos.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-purple-900/40 rounded-2xl bg-purple-950/10 backdrop-blur-sm">
          <p className="text-purple-300 font-mono">{language === 'si' ? 'තවමත් වීඩියෝ ඇතුළත් කර නැත.' : 'No cosmic broadcasts added yet.'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Video Player (Left 2 columns) */}
          <div className="lg:col-span-2 space-y-4">
            {selectedVideo && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-2xl border border-purple-900/40 bg-purple-950/20 backdrop-blur-md overflow-hidden p-4"
              >
                <div className="relative aspect-video rounded-xl overflow-hidden shadow-[0_0_30px_rgba(168,85,247,0.15)] bg-black">
                  <iframe
                    src={`https://www.youtube.com/embed/${selectedVideo.youtube_id}?autoplay=0&rel=0`}
                    title={language === 'si' ? selectedVideo.title_si : selectedVideo.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    className="absolute inset-0 w-full h-full"
                  />
                </div>
                <div className="mt-5">
                  <span className="bg-purple-900/80 border border-purple-500/30 text-purple-200 text-[10px] font-mono uppercase px-2.5 py-1 rounded-full tracking-wider">
                    {selectedVideo.category}
                  </span>
                  <h3 className="text-xl md:text-2xl font-bold text-white mt-3 mb-2 font-sans leading-tight">
                    {language === 'si' ? selectedVideo.title_si : selectedVideo.title}
                  </h3>
                  <div className="flex flex-wrap gap-4 items-center text-xs text-purple-400 font-mono pt-2 border-t border-purple-900/30">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-amber-400 fill-amber-400 animate-pulse" />
                      <span>YouTube ID: {selectedVideo.youtube_id}</span>
                    </div>
                    <span>•</span>
                    <span>Duration: {selectedVideo.duration}</span>
                    <span>•</span>
                    <a
                      href={`https://youtube.com/watch?v=${selectedVideo.youtube_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-pink-400 hover:text-pink-300 transition-colors"
                    >
                      <span>Watch on YouTube</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Video Playlist Sidebar (Right 1 column) */}
          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            <h4 className="text-sm font-mono tracking-wider text-pink-400 uppercase mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-pink-500 animate-spin" style={{ animationDuration: '8s' }} />
              <span>{language === 'si' ? 'වීඩියෝ ලැයිස්තුව' : 'Broadcast Queue'} ({filteredVideos.length})</span>
            </h4>
            
            <div className="space-y-3">
              {filteredVideos.map((video) => {
                const isSelected = selectedVideo?.id === video.id;
                const videoTitle = language === 'si' ? video.title_si : video.title;
                const thumbnail = `https://img.youtube.com/vi/${video.youtube_id}/mqdefault.jpg`;

                return (
                  <motion.div
                    key={video.id}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => setSelectedVideo(video)}
                    className={`p-2.5 rounded-xl border cursor-pointer flex gap-3 transition-all duration-300 ${
                      isSelected
                        ? 'bg-purple-900/40 border-pink-500/50 shadow-[0_0_15px_rgba(236,72,153,0.15)]'
                        : 'bg-purple-950/20 border-purple-900/40 hover:border-purple-800/60 hover:bg-purple-900/10'
                    }`}
                  >
                    {/* Thumbnail */}
                    <div className="relative w-28 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-black">
                      <img
                        src={thumbnail}
                        alt={videoTitle}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                        <Play className="w-5 h-5 text-white/90 fill-white/80 group-hover:scale-110 transition-transform" />
                      </div>
                      <span className="absolute bottom-1 right-1 bg-black/80 px-1 py-0.5 rounded text-[9px] font-mono text-purple-200">
                        {video.duration}
                      </span>
                    </div>

                    {/* Meta info */}
                    <div className="flex flex-col justify-between py-0.5 overflow-hidden">
                      <h5 className={`text-xs font-bold leading-tight line-clamp-2 ${
                        isSelected ? 'text-pink-300' : 'text-purple-100'
                      }`}>
                        {videoTitle}
                      </h5>
                      <span className="text-[9px] font-mono text-purple-400 uppercase tracking-wide">
                        {video.category}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
