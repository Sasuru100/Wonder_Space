import { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { MessageSquare, Flame, Send, User, ChevronRight, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface Theory {
  id: number;
  title: string;
  author: string;
  content: string;
  upvotes: number;
  category: string;
}

export interface TheoryComment {
  id: number;
  theory_id: number;
  author: string;
  content: string;
}

export default function TheoriesBoard() {
  const { language, t } = useLanguage();
  const [theories, setTheories] = useState<Theory[]>([]);
  const [loading, setLoading] = useState(true);

  // Active theory for comments modal
  const [selectedTheory, setSelectedTheory] = useState<Theory | null>(null);
  const [comments, setComments] = useState<TheoryComment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);

  // Form states
  const [newTitle, setNewTitle] = useState('');
  const [newAuthor, setNewAuthor] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState('Cosmos');

  const [commentAuthor, setCommentAuthor] = useState('');
  const [commentContent, setCommentContent] = useState('');

  const [upvotedTheories, setUpvotedTheories] = useState<number[]>([]);

  const fetchTheories = async () => {
    try {
      const res = await fetch('/api/ws_theories');
      if (res.ok) {
        setTheories(await res.json());
      }
    } catch (err) {
      console.error('Error fetching theories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTheories();
  }, []);

  const handleTheoryUpvote = async (id: number) => {
    if (upvotedTheories.includes(id)) return;

    try {
      const res = await fetch('/api/ws_theories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'upvote', id }),
      });

      if (res.ok) {
        setUpvotedTheories([...upvotedTheories, id]);
        setTheories(prev => prev.map(t => t.id === id ? { ...t, upvotes: t.upvotes + 1 } : t));
      }
    } catch (err) {
      console.error('Error upvoting theory:', err);
    }
  };

  const submitTheory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newAuthor.trim() || !newContent.trim()) return;

    try {
      const res = await fetch('/api/ws_theories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle,
          author: newAuthor,
          content: newContent,
          category: newCategory,
        }),
      });

      if (res.ok) {
        setNewTitle('');
        setNewContent('');
        fetchTheories();
      }
    } catch (err) {
      console.error('Error submitting theory:', err);
    }
  };

  const openComments = async (theory: Theory) => {
    setSelectedTheory(theory);
    setCommentsLoading(true);
    try {
      const res = await fetch(`/api/ws_comments?theory_id=${theory.id}`);
      if (res.ok) {
        setComments(await res.json());
      }
    } catch (err) {
      console.error('Error fetching comments:', err);
    } finally {
      setCommentsLoading(false);
    }
  };

  const submitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTheory || !commentAuthor.trim() || !commentContent.trim()) return;

    try {
      const res = await fetch('/api/ws_comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          theory_id: selectedTheory.id,
          author: commentAuthor,
          content: commentContent,
        }),
      });

      if (res.ok) {
        setCommentContent('');
        // Re-fetch comments
        const commentsRes = await fetch(`/api/ws_comments?theory_id=${selectedTheory.id}`);
        if (commentsRes.ok) {
          setComments(await commentsRes.json());
        }
      }
    } catch (err) {
      console.error('Error submitting comment:', err);
    }
  };

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
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-purple-800 bg-purple-950/50 backdrop-blur-md text-pink-400 text-xs font-mono uppercase tracking-wider mb-4">
          <MessageSquare className="w-3.5 h-3.5 animate-bounce" />
          <span>FAN DISCUSSIONS BOARD</span>
        </div>
        <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight mb-4 font-sans">
          {language === 'si' ? 'ප්‍රජා මතවාද හා සාකච්ඡා පිටුව' : 'Community Hypotheses Board'}
        </h2>
        <p className="text-purple-200/70 max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
          {language === 'si'
            ? 'විශ්වයේ හෝ ලෝකයේ ඔබට සිතෙන අමුතු දේවල්, අභිරහස් සහ විද්‍යාත්මක මතවාද මෙහි පළ කර අනෙක් අය සමඟ සාකච්ඡා කරන්න.'
            : 'Post your own findings, read other explorers\' research, upvote theories, and engage in cosmic transmissions.'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Theory Submission Form (Left column on desktop) */}
        <div className="lg:col-span-1">
          <div className="rounded-2xl border border-purple-900/40 bg-purple-950/20 backdrop-blur-md p-6 sticky top-24">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2 border-b border-purple-900/30 pb-3 font-sans">
              <Sparkles className="w-4 h-4 text-pink-500 animate-spin" style={{ animationDuration: '10s' }} />
              <span>{t.postTheory}</span>
            </h3>

            <form onSubmit={submitTheory} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-purple-300 mb-1">{t.theoryTitle}</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="e.g. Bermuda Triangle Portal Theory"
                  className="w-full px-4 py-2.5 rounded-lg border border-purple-800 bg-space-950 text-white text-xs md:text-sm focus:outline-none focus:border-pink-500"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-purple-300 mb-1">{t.authorName}</label>
                <input
                  type="text"
                  required
                  value={newAuthor}
                  onChange={e => setNewAuthor(e.target.value)}
                  placeholder="e.g. Explorer_07"
                  className="w-full px-4 py-2.5 rounded-lg border border-purple-800 bg-space-950 text-white text-xs md:text-sm focus:outline-none focus:border-pink-500"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-purple-300 mb-1">{t.category}</label>
                <select
                  value={newCategory}
                  onChange={e => setNewCategory(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-purple-800 bg-space-950 text-white text-xs md:text-sm focus:outline-none focus:border-pink-500"
                >
                  <option value="Cosmos">Cosmos</option>
                  <option value="Earth Mysteries">Earth Mysteries</option>
                  <option value="Ancient History">Ancient History</option>
                  <option value="Paranormal">Paranormal</option>
                  <option value="Science">Science</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono text-purple-300 mb-1">{t.theoryContent}</label>
                <textarea
                  required
                  rows={4}
                  value={newContent}
                  onChange={e => setNewContent(e.target.value)}
                  placeholder="Transcribe your evidence or thoughts..."
                  className="w-full px-4 py-2.5 rounded-lg border border-purple-800 bg-space-950 text-white text-xs md:text-sm focus:outline-none focus:border-pink-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-xs uppercase tracking-widest hover:scale-[1.02] transition-transform flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(236,72,153,0.3)]"
              >
                <Send className="w-4 h-4" />
                <span>{t.submitTheory}</span>
              </button>
            </form>
          </div>
        </div>

        {/* Theories Feed (Right columns on desktop) */}
        <div className="lg:col-span-2 space-y-4">
          {theories.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-purple-900/40 rounded-2xl bg-purple-950/10 backdrop-blur-sm">
              <p className="text-purple-300 font-mono">No theories reported in this quadrant yet. Be the first!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {theories.map((theory) => {
                const isUpvoted = upvotedTheories.includes(theory.id);

                return (
                  <motion.div
                    key={theory.id}
                    layoutId={`theory-card-${theory.id}`}
                    className="p-5 rounded-2xl border border-purple-900/40 bg-purple-950/20 backdrop-blur-md flex flex-col justify-between gap-4 hover:border-pink-500/30 transition-colors"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="bg-purple-900/60 border border-purple-500/20 text-purple-300 text-[9px] font-mono uppercase px-2 py-0.5 rounded">
                          {theory.category}
                        </span>
                        <div className="flex items-center gap-1 text-[10px] text-purple-400 font-mono">
                          <User className="w-3.5 h-3.5" />
                          <span>BY {theory.author.toUpperCase()}</span>
                        </div>
                      </div>

                      <h4 className="text-lg font-bold text-white mb-2 font-sans">{theory.title}</h4>
                      <p className="text-xs md:text-sm text-purple-200/80 leading-relaxed font-sans line-clamp-3">
                        {theory.content}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-purple-900/30">
                      <button
                        onClick={() => handleTheoryUpvote(theory.id)}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono transition-colors ${
                          isUpvoted
                            ? 'bg-pink-900/30 text-pink-400 border border-pink-500/30'
                            : 'bg-purple-950 hover:bg-purple-900/40 text-purple-300 border border-purple-900/40'
                        }`}
                      >
                        <Flame className={`w-3.5 h-3.5 ${isUpvoted ? 'fill-pink-500 animate-pulse' : ''}`} />
                        <span>{theory.upvotes} {isUpvoted ? 'Voted' : 'Upvote'}</span>
                      </button>

                      <button
                        onClick={() => openComments(theory)}
                        className="flex items-center gap-1 text-xs text-pink-400 hover:text-pink-300 transition-colors font-mono"
                      >
                        <span>View Transmissions</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* DETAILED THEORY & COMMENTS MODAL */}
      <AnimatePresence>
        {selectedTheory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl rounded-2xl border border-purple-900 bg-space-950 p-6 space-y-5 relative"
            >
              <button
                onClick={() => setSelectedTheory(null)}
                className="absolute top-4 right-4 text-purple-400 hover:text-white font-mono text-sm"
              >
                ✕ CLOSE
              </button>

              {/* Theory Body */}
              <div className="space-y-3">
                <span className="bg-purple-900/80 text-purple-200 text-[9px] font-mono uppercase px-2 py-0.5 rounded">
                  {selectedTheory.category}
                </span>
                <h3 className="text-xl font-bold text-white font-sans">{selectedTheory.title}</h3>
                <p className="text-xs text-purple-400 font-mono">BROADCAST BY {selectedTheory.author.toUpperCase()}</p>
                <p className="text-xs md:text-sm text-purple-200/90 leading-relaxed font-sans whitespace-pre-wrap">
                  {selectedTheory.content}
                </p>
              </div>

              {/* Comments Section */}
              <div className="border-t border-purple-900/40 pt-4 space-y-4">
                <h4 className="text-sm font-mono tracking-wider text-pink-400 uppercase">
                  {t.comments} ({comments.length})
                </h4>

                {/* Comments List */}
                <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                  {commentsLoading ? (
                    <p className="text-xs text-purple-400 font-mono">Retrieving comments...</p>
                  ) : comments.length === 0 ? (
                    <p className="text-xs text-purple-400 font-mono">No comments logged. Initiate transmission below.</p>
                  ) : (
                    comments.map((comment) => (
                      <div key={comment.id} className="p-3 rounded-lg bg-purple-950/40 border border-purple-900/30 text-xs">
                        <p className="font-mono text-pink-300 mb-1">@{comment.author.toUpperCase()}</p>
                        <p className="text-purple-200">{comment.content}</p>
                      </div>
                    ))
                  )}
                </div>

                {/* Comment Form */}
                <form onSubmit={submitComment} className="space-y-3 pt-2">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input
                      type="text"
                      required
                      value={commentAuthor}
                      onChange={e => setCommentAuthor(e.target.value)}
                      placeholder={t.authorName}
                      className="sm:col-span-1 px-3 py-2 rounded-lg border border-purple-800 bg-space-950 text-white text-xs focus:outline-none focus:border-pink-500"
                    />
                    <input
                      type="text"
                      required
                      value={commentContent}
                      onChange={e => setCommentContent(e.target.value)}
                      placeholder="Type your response..."
                      className="sm:col-span-2 px-3 py-2 rounded-lg border border-purple-800 bg-space-950 text-white text-xs focus:outline-none focus:border-pink-500"
                    />
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-lg bg-pink-600 hover:bg-pink-500 text-white font-mono text-xs flex items-center gap-1"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{t.addComment}</span>
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
