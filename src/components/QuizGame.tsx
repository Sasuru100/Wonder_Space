import { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Award, Timer, RefreshCw, Trophy, Send, CheckCircle, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface QuizQuestion {
  id: number;
  question: string;
  question_si: string;
  options: string[];
  options_si: string[];
  correct_option_index: number;
  explanation: string;
  explanation_si: string;
  points: number;
}

export interface LeaderboardEntry {
  id: number;
  username: string;
  score: number;
  played_at: string;
}

export default function QuizGame() {
  const { language, t } = useLanguage();
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Game States: 'IDLE' | 'PLAYING' | 'ANSWERED' | 'GAMEOVER'
  const [gameState, setGameState] = useState<'IDLE' | 'PLAYING' | 'ANSWERED' | 'GAMEOVER'>('IDLE');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [username, setUsername] = useState('');
  const [scoreSubmitted, setScoreSubmitted] = useState(false);

  // Web Audio Synth for Space SFX
  const playSound = (type: 'correct' | 'wrong' | 'click' | 'gameover') => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      if (type === 'correct') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
        osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.3); // A5
        gainNode.gain.setValueAtTime(0.15, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.4);
      } else if (type === 'wrong') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, audioCtx.currentTime); // A3
        osc.frequency.linearRampToValueAtTime(110, audioCtx.currentTime + 0.4); // A2
        gainNode.gain.setValueAtTime(0.15, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.5);
      } else if (type === 'click') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(600, audioCtx.currentTime);
        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.1);
      } else if (type === 'gameover') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, audioCtx.currentTime);
        osc.frequency.linearRampToValueAtTime(220, audioCtx.currentTime + 0.8);
        gainNode.gain.setValueAtTime(0.15, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.9);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.9);
      }
    } catch (e) {
      console.warn('Web Audio not fully supported or active:', e);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [questionsRes, leaderboardRes] = await Promise.all([
        fetch('/api/ws_quiz'),
        fetch('/api/ws_quiz?type=leaderboard')
      ]);
      if (questionsRes.ok) {
        setQuestions(await questionsRes.json());
      }
      if (leaderboardRes.ok) {
        setLeaderboard(await leaderboardRes.json());
      }
    } catch (err) {
      console.error('Error fetching quiz data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Timer logic
  useEffect(() => {
    if (gameState !== 'PLAYING') return;

    if (timeLeft === 0) {
      // Auto-submit as wrong when time runs out
      handleAnswerSelect(-1); // -1 signifies timeout
      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft, gameState]);

  const startQuiz = () => {
    playSound('click');
    setGameState('PLAYING');
    setCurrentQuestionIndex(0);
    setScore(0);
    setTimeLeft(15);
    setSelectedOption(null);
    setScoreSubmitted(false);
  };

  const handleAnswerSelect = (optionIndex: number) => {
    if (gameState !== 'PLAYING') return;

    setSelectedOption(optionIndex);
    setGameState('ANSWERED');

    const currentQuestion = questions[currentQuestionIndex];
    if (optionIndex === currentQuestion.correct_option_index) {
      setScore(prev => prev + currentQuestion.points);
      playSound('correct');
    } else {
      playSound('wrong');
    }
  };

  const nextQuestion = () => {
    playSound('click');
    if (currentQuestionIndex + 1 < questions.length) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOption(null);
      setTimeLeft(15);
      setGameState('PLAYING');
    } else {
      setGameState('GAMEOVER');
      playSound('gameover');
    }
  };

  const submitScore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;

    try {
      const res = await fetch('/api/ws_quiz?type=submit_score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, score }),
      });

      if (res.ok) {
        setScoreSubmitted(true);
        // Refresh leaderboard
        const leaderRes = await fetch('/api/ws_quiz?type=leaderboard');
        if (leaderRes.ok) {
          setLeaderboard(await leaderRes.json());
        }
      }
    } catch (err) {
      console.error('Error submitting score:', err);
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

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header section */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-purple-800 bg-purple-950/50 backdrop-blur-md text-pink-400 text-xs font-mono uppercase tracking-wider mb-4">
          <Award className="w-3.5 h-3.5 animate-bounce" />
          <span>COSMIC KNOWLEDGE MATRIX</span>
        </div>
        <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight mb-4 font-sans">
          {language === 'si' ? 'විස්මිත දැනුම මිනුම' : 'Space & Mystery Trivia'}
        </h2>
        <p className="text-purple-200/70 max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
          {language === 'si'
            ? 'විශ්වයේ සහ ලෝකයේ ඇති අභිරහස් පිළිබඳ ඔබේ දැනුම පරීක්ෂා කර, ප්‍රමුඛ පුවරුවේ ඉහළටම යන්න.'
            : 'Test your decoding capabilities. Prove your cosmic intelligence and secure your rank on the galaxy leaderboard.'}
        </p>
      </div>

      {questions.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-purple-900/40 rounded-2xl bg-purple-950/10 backdrop-blur-sm">
          <p className="text-purple-300 font-mono">{language === 'si' ? 'ප්‍රශ්න තවමත් ඇතුළත් කර නැත.' : 'No trivia coordinates logged yet.'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Trivia Arena */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl border border-purple-900/40 bg-purple-950/20 backdrop-blur-md p-6 md:p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-purple-600/5 rounded-full blur-3xl pointer-events-none" />

              {/* IDLE STATE (Start Screen) */}
              {gameState === 'IDLE' && (
                <div className="text-center py-10 space-y-6">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-purple-600 to-pink-600 flex items-center justify-center mx-auto shadow-[0_0_25px_rgba(168,85,247,0.4)]">
                    <Award className="w-10 h-10 text-white animate-pulse" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold text-white font-sans">
                      {language === 'si' ? 'විශ්වීය අභියෝගයට සූදානම්ද?' : 'Ready to Test Your Cosmic IQ?'}
                    </h3>
                    <p className="text-xs md:text-sm text-purple-300">
                      {questions.length} questions • 15 seconds per question • Space leaderboard entry
                    </p>
                  </div>
                  <button
                    onClick={startQuiz}
                    className="px-8 py-3.5 rounded-full font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 text-white shadow-[0_0_20px_rgba(236,72,153,0.45)] hover:scale-105 transition-transform duration-300 uppercase text-xs tracking-widest"
                  >
                    {t.playQuiz}
                  </button>
                </div>
              )}

              {/* PLAYING & ANSWERED STATES */}
              {(gameState === 'PLAYING' || gameState === 'ANSWERED') && currentQuestion && (
                <div className="space-y-6">
                  {/* Progress Bar & Timer */}
                  <div className="flex items-center justify-between border-b border-purple-900/30 pb-4">
                    <span className="text-xs font-mono text-purple-400">
                      SIGNAL {currentQuestionIndex + 1} OF {questions.length}
                    </span>
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-purple-800 bg-purple-950/80">
                      <Timer className={`w-4 h-4 text-pink-400 ${timeLeft <= 5 ? 'animate-ping' : ''}`} />
                      <span className="text-xs font-mono font-bold text-pink-300">{timeLeft}s</span>
                    </div>
                  </div>

                  {/* Question */}
                  <h3 className="text-lg md:text-xl font-bold text-white font-sans leading-relaxed">
                    {language === 'si' ? currentQuestion.question_si : currentQuestion.question}
                  </h3>

                  {/* Options List */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                    {(language === 'si' ? currentQuestion.options_si : currentQuestion.options).map((opt, idx) => {
                      const isCorrect = idx === currentQuestion.correct_option_index;
                      const isSelected = idx === selectedOption;
                      const showAnswerStyles = gameState === 'ANSWERED';

                      let btnStyle = 'border-purple-900/40 bg-purple-950/20 hover:border-purple-600/60 hover:bg-purple-900/10 text-purple-100';
                      if (showAnswerStyles) {
                        if (isCorrect) {
                          btnStyle = 'border-green-500/60 bg-green-950/40 text-green-200 shadow-[0_0_15px_rgba(34,197,94,0.15)]';
                        } else if (isSelected) {
                          btnStyle = 'border-red-500/60 bg-red-950/40 text-red-200 shadow-[0_0_15px_rgba(239,68,68,0.15)]';
                        } else {
                          btnStyle = 'border-purple-900/20 bg-purple-950/5 opacity-50 text-purple-400';
                        }
                      }

                      return (
                        <button
                          key={idx}
                          disabled={gameState === 'ANSWERED'}
                          onClick={() => handleAnswerSelect(idx)}
                          className={`p-4 rounded-xl border text-left text-xs md:text-sm font-medium transition-all duration-300 flex items-center justify-between ${btnStyle}`}
                        >
                          <span>{opt}</span>
                          {showAnswerStyles && isCorrect && <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 ml-2" />}
                          {showAnswerStyles && isSelected && !isCorrect && <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 ml-2" />}
                        </button>
                      );
                    })}
                  </div>

                  {/* Time-out alert */}
                  {gameState === 'ANSWERED' && selectedOption === -1 && (
                    <div className="p-3 bg-red-950/20 border border-red-900/30 rounded-xl flex items-center gap-2 text-xs text-red-400 font-mono">
                      <AlertTriangle className="w-4 h-4 text-red-500 animate-bounce" />
                      <span>TIME EXPIRED! Signal Decryption Failed.</span>
                    </div>
                  )}

                  {/* Explanation (Shown when Answered) */}
                  <AnimatePresence>
                    {gameState === 'ANSWERED' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="p-4 rounded-xl border border-pink-500/20 bg-pink-950/10 backdrop-blur-sm space-y-2 mt-4"
                      >
                        <h4 className="text-xs font-mono font-bold text-pink-400 uppercase tracking-wider flex items-center gap-1.5">
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>COSMIC KNOWLEDGE EXPLAINED</span>
                        </h4>
                        <p className="text-xs md:text-sm text-purple-200/90 leading-relaxed font-sans">
                          {language === 'si' ? currentQuestion.explanation_si : currentQuestion.explanation}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Action Button */}
                  {gameState === 'ANSWERED' && (
                    <div className="flex justify-end pt-4 border-t border-purple-900/30">
                      <button
                        onClick={nextQuestion}
                        className="px-6 py-2.5 rounded-full font-bold bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-[0_0_15px_rgba(168,85,247,0.3)] hover:scale-105 transition-transform text-xs uppercase tracking-widest flex items-center gap-1.5"
                      >
                        <span>{t.next}</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* GAMEOVER STATE (Result Screen) */}
              {gameState === 'GAMEOVER' && (
                <div className="text-center py-8 space-y-6">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-500 to-pink-500 flex items-center justify-center mx-auto shadow-[0_0_25px_rgba(245,158,11,0.4)] animate-bounce">
                    <Trophy className="w-10 h-10 text-white" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-3xl font-extrabold text-white font-sans">
                      {language === 'si' ? 'අභියෝගය අවසන්!' : 'Mission Completed!'}
                    </h3>
                    <p className="text-sm text-purple-300">
                      Your Decryption Score: <span className="text-amber-400 font-mono font-bold text-xl">{score} pts</span>
                    </p>
                  </div>

                  {/* Leaderboard Submission Form */}
                  {!scoreSubmitted ? (
                    <form onSubmit={submitScore} className="max-w-md mx-auto p-4 rounded-xl border border-purple-900/50 bg-purple-950/40 space-y-3">
                      <label className="block text-left text-xs font-mono text-purple-300">{t.username}</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          required
                          value={username}
                          onChange={e => setUsername(e.target.value)}
                          placeholder={t.enterName}
                          className="flex-grow px-4 py-2 text-xs md:text-sm rounded-lg border border-purple-800 bg-space-950 text-white focus:outline-none focus:border-pink-500"
                        />
                        <button
                          type="submit"
                          className="px-4 py-2 rounded-lg bg-pink-600 hover:bg-pink-500 text-white font-mono text-xs flex items-center gap-1"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>{t.submitScore}</span>
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="p-4 bg-green-950/20 border border-green-900/30 rounded-xl text-xs md:text-sm text-green-400 font-mono inline-block">
                      ✓ Transmission Verified. Score recorded on the galaxy leaderboard!
                    </div>
                  )}

                  <div className="pt-4">
                    <button
                      onClick={startQuiz}
                      className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-full border border-purple-500/30 bg-purple-900/20 text-purple-200 hover:text-white hover:bg-purple-900/40 text-xs font-mono uppercase tracking-wider transition-all duration-300"
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span>{language === 'si' ? 'නැවත ක්‍රීඩා කරන්න' : 'Re-Initiate Mission'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Persistent Leaderboard Sidebar */}
          <div className="rounded-2xl border border-purple-900/40 bg-purple-950/20 backdrop-blur-md p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2 border-b border-purple-900/30 pb-3 font-sans">
              <Trophy className="w-5 h-5 text-amber-400 animate-pulse" />
              <span>{t.leaderboard}</span>
            </h3>

            {leaderboard.length === 0 ? (
              <p className="text-xs text-purple-400 font-mono text-center py-10">No scores logged in this sector yet.</p>
            ) : (
              <div className="space-y-2.5 max-h-[400px] overflow-y-auto pr-1">
                {leaderboard.map((entry, idx) => {
                  let badgeStyle = 'text-purple-300';
                  if (idx === 0) badgeStyle = 'text-amber-400 font-bold';
                  if (idx === 1) badgeStyle = 'text-slate-300 font-bold';
                  if (idx === 2) badgeStyle = 'text-amber-600 font-bold';

                  return (
                    <div
                      key={entry.id}
                      className="flex items-center justify-between p-2.5 rounded-lg bg-purple-950/40 border border-purple-900/30 text-xs font-mono"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className={`w-5 text-center ${badgeStyle}`}>#{idx + 1}</span>
                        <span className="text-purple-100 font-medium truncate max-w-[120px]">{entry.username}</span>
                      </div>
                      <span className="text-pink-400 font-bold">{entry.score} pts</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
