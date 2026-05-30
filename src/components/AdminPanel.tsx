import { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { ShieldAlert, Plus, Trash2, KeyRound, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { Fact } from './FactCard';
import { Place } from './PlaceCard';
import { VideoItem } from './VideoHub';
import { QuizQuestion } from './QuizGame';

export default function AdminPanel() {
  const { language, t } = useLanguage();
  const [passcode, setPasscode] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [error, setError] = useState('');

  // Loaded items for deletion
  const [facts, setFacts] = useState<Fact[]>([]);
  const [places, setPlaces] = useState<Place[]>([]);
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);

  // Form states
  const [factForm, setFactForm] = useState({ title: '', description: '', title_si: '', description_si: '', category: 'Cosmos', image_url: '' });
  const [placeForm, setPlaceForm] = useState({ name: '', name_si: '', description: '', description_si: '', location: '', coordinates: '', mystery_score: 5, image_url: '' });
  const [videoForm, setVideoForm] = useState({ title: '', title_si: '', youtube_id: '', category: 'Cosmos', duration: '12:30' });
  const [questionForm, setQuestionForm] = useState({
    question: '', question_si: '',
    opt0: '', opt1: '', opt2: '', opt3: '',
    opt0_si: '', opt1_si: '', opt2_si: '', opt3_si: '',
    correct_option_index: 0, explanation: '', explanation_si: '', points: 10
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === 'wonder2025') {
      setIsAuthorized(true);
      setError('');
      fetchAdminData();
    } else {
      setError('Invalid Frequency Key!');
    }
  };

  const fetchAdminData = async () => {
    try {
      const [factsRes, placesRes, videosRes, quizRes] = await Promise.all([
        fetch('/api/ws_facts'),
        fetch('/api/ws_places'),
        fetch('/api/ws_videos'),
        fetch('/api/ws_quiz')
      ]);

      if (factsRes.ok) setFacts(await factsRes.json());
      if (placesRes.ok) setPlaces(await placesRes.json());
      if (videosRes.ok) setVideos(await videosRes.json());
      if (quizRes.ok) setQuestions(await quizRes.json());
    } catch (err) {
      console.error('Error fetching admin data:', err);
    }
  };

  const deleteItem = async (table: string, id: number) => {
    if (!window.confirm(`Purge item ID ${id} from ${table}?`)) return;

    let endpoint = '';
    if (table === 'facts') endpoint = '/api/ws_facts';
    if (table === 'places') endpoint = '/api/ws_places';
    if (table === 'videos') endpoint = '/api/ws_videos';
    if (table === 'quiz') endpoint = '/api/ws_quiz';

    try {
      const res = await fetch(endpoint, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-passcode': passcode
        },
        body: JSON.stringify({ id })
      });

      if (res.ok) {
        fetchAdminData();
      }
    } catch (err) {
      console.error('Error deleting item:', err);
    }
  };

  const submitFact = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/ws_facts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-passcode': passcode },
        body: JSON.stringify(factForm)
      });
      if (res.ok) {
        setFactForm({ title: '', description: '', title_si: '', description_si: '', category: 'Cosmos', image_url: '' });
        fetchAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const submitPlace = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/ws_places', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-passcode': passcode },
        body: JSON.stringify(placeForm)
      });
      if (res.ok) {
        setPlaceForm({ name: '', name_si: '', description: '', description_si: '', location: '', coordinates: '', mystery_score: 5, image_url: '' });
        fetchAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const submitVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/ws_videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-passcode': passcode },
        body: JSON.stringify(videoForm)
      });
      if (res.ok) {
        setVideoForm({ title: '', title_si: '', youtube_id: '', category: 'Cosmos', duration: '12:30' });
        fetchAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const submitQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    const formattedData = {
      question: questionForm.question,
      question_si: questionForm.question_si,
      options: [questionForm.opt0, questionForm.opt1, questionForm.opt2, questionForm.opt3],
      options_si: [questionForm.opt0_si, questionForm.opt1_si, questionForm.opt2_si, questionForm.opt3_si],
      correct_option_index: Number(questionForm.correct_option_index),
      explanation: questionForm.explanation,
      explanation_si: questionForm.explanation_si,
      points: Number(questionForm.points)
    };

    try {
      const res = await fetch('/api/ws_quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-passcode': passcode },
        body: JSON.stringify(formattedData)
      });
      if (res.ok) {
        setQuestionForm({
          question: '', question_si: '',
          opt0: '', opt1: '', opt2: '', opt3: '',
          opt0_si: '', opt1_si: '', opt2_si: '', opt3_si: '',
          correct_option_index: 0, explanation: '', explanation_si: '', points: 10
        });
        fetchAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!isAuthorized) {
    return (
      <div className="max-w-md mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-2xl border border-purple-900 bg-purple-950/20 backdrop-blur-md p-6 space-y-5 shadow-[0_0_30px_rgba(168,85,247,0.1)]"
        >
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-purple-900/50 flex items-center justify-center mx-auto border border-purple-500/30">
              <KeyRound className="w-6 h-6 text-pink-400 animate-pulse" />
            </div>
            <h3 className="text-xl font-bold text-white font-sans">{t.admin}</h3>
            <p className="text-xs text-purple-300">Establish secure link to inject broadcasts</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-purple-300 mb-1">{t.adminPasscode}</label>
              <input
                type="password"
                required
                value={passcode}
                onChange={e => setPasscode(e.target.value)}
                placeholder="Enter passcode (wonder2025)..."
                className="w-full px-4 py-2.5 rounded-lg border border-purple-800 bg-space-950 text-white text-xs md:text-sm focus:outline-none focus:border-pink-500"
              />
            </div>

            {error && <p className="text-xs text-red-400 font-mono text-center">{error}</p>}

            <button
              type="submit"
              className="w-full py-2.5 rounded-lg bg-pink-600 hover:bg-pink-500 text-white font-mono text-xs font-bold uppercase tracking-wider"
            >
              {t.login}
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-12">
      {/* Authorized Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-purple-900/40 pb-5">
        <div className="flex items-center gap-3">
          <ShieldAlert className="w-8 h-8 text-pink-500 animate-pulse" />
          <div>
            <h2 className="text-2xl font-bold text-white font-sans">WONDER SPACE STUDIO</h2>
            <p className="text-xs text-green-400 font-mono">✓ SECURE SESSION ESTABLISHED</p>
          </div>
        </div>
        <button
          onClick={() => setIsAuthorized(false)}
          className="px-4 py-2 rounded-lg bg-red-950/40 border border-red-800/40 hover:bg-red-900/40 text-red-200 text-xs font-mono"
        >
          {t.logout}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* FACT MANAGER */}
        <div className="rounded-2xl border border-purple-900/40 bg-purple-950/10 backdrop-blur-md p-6 space-y-6">
          <h3 className="text-lg font-bold text-white font-sans flex items-center gap-2 border-b border-purple-900/30 pb-3">
            <Plus className="w-5 h-5 text-pink-500" />
            <span>{t.addNewFact}</span>
          </h3>

          <form onSubmit={submitFact} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text" required placeholder="Title (EN)"
                value={factForm.title} onChange={e => setFactForm({ ...factForm, title: e.target.value })}
                className="px-3 py-2 rounded-lg border border-purple-800 bg-space-950 text-white text-xs"
              />
              <input
                type="text" required placeholder="මාතෘකාව (SI)"
                value={factForm.title_si} onChange={e => setFactForm({ ...factForm, title_si: e.target.value })}
                className="px-3 py-2 rounded-lg border border-purple-800 bg-space-950 text-white text-xs"
              />
            </div>
            <textarea
              required placeholder="Description (EN)" rows={3}
              value={factForm.description} onChange={e => setFactForm({ ...factForm, description: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-purple-800 bg-space-950 text-white text-xs"
            />
            <textarea
              required placeholder="විස්තරය (SI)" rows={3}
              value={factForm.description_si} onChange={e => setFactForm({ ...factForm, description_si: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-purple-800 bg-space-950 text-white text-xs"
            />
            <div className="grid grid-cols-2 gap-3">
              <select
                value={factForm.category} onChange={e => setFactForm({ ...factForm, category: e.target.value })}
                className="px-3 py-2 rounded-lg border border-purple-800 bg-space-950 text-white text-xs"
              >
                <option value="Cosmos">Cosmos</option>
                <option value="Earth">Earth</option>
                <option value="Science">Science</option>
                <option value="Ancient">Ancient</option>
                <option value="Mysteries">Mysteries</option>
              </select>
              <input
                type="text" placeholder="Image URL (Optional)"
                value={factForm.image_url} onChange={e => setFactForm({ ...factForm, image_url: e.target.value })}
                className="px-3 py-2 rounded-lg border border-purple-800 bg-space-950 text-white text-xs"
              />
            </div>
            <button type="submit" className="w-full py-2 bg-pink-600 hover:bg-pink-500 text-white font-mono text-xs rounded-lg font-bold">
              INJECT FACT
            </button>
          </form>

          {/* Delete list */}
          <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
            {facts.map(fact => (
              <div key={fact.id} className="flex items-center justify-between p-2 bg-purple-950/40 border border-purple-900/30 rounded text-xs font-mono">
                <span className="truncate max-w-[250px]">{fact.title}</span>
                <button onClick={() => deleteItem('facts', fact.id)} className="text-red-400 hover:text-red-300">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* PLACE MANAGER */}
        <div className="rounded-2xl border border-purple-900/40 bg-purple-950/10 backdrop-blur-md p-6 space-y-6">
          <h3 className="text-lg font-bold text-white font-sans flex items-center gap-2 border-b border-purple-900/30 pb-3">
            <Plus className="w-5 h-5 text-pink-500" />
            <span>{t.addNewPlace}</span>
          </h3>

          <form onSubmit={submitPlace} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text" required placeholder="Name (EN)"
                value={placeForm.name} onChange={e => setPlaceForm({ ...placeForm, name: e.target.value })}
                className="px-3 py-2 rounded-lg border border-purple-800 bg-space-950 text-white text-xs"
              />
              <input
                type="text" required placeholder="නම (SI)"
                value={placeForm.name_si} onChange={e => setPlaceForm({ ...placeForm, name_si: e.target.value })}
                className="px-3 py-2 rounded-lg border border-purple-800 bg-space-950 text-white text-xs"
              />
            </div>
            <textarea
              required placeholder="Description (EN)" rows={2}
              value={placeForm.description} onChange={e => setPlaceForm({ ...placeForm, description: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-purple-800 bg-space-950 text-white text-xs"
            />
            <textarea
              required placeholder="විස්තරය (SI)" rows={2}
              value={placeForm.description_si} onChange={e => setPlaceForm({ ...placeForm, description_si: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-purple-800 bg-space-950 text-white text-xs"
            />
            <div className="grid grid-cols-3 gap-2">
              <input
                type="text" required placeholder="Location"
                value={placeForm.location} onChange={e => setPlaceForm({ ...placeForm, location: e.target.value })}
                className="px-3 py-2 rounded-lg border border-purple-800 bg-space-950 text-white text-xs"
              />
              <input
                type="text" required placeholder="Coordinates"
                value={placeForm.coordinates} onChange={e => setPlaceForm({ ...placeForm, coordinates: e.target.value })}
                className="px-3 py-2 rounded-lg border border-purple-800 bg-space-950 text-white text-xs"
              />
              <input
                type="number" required min="1" max="10" placeholder="Mystery Score (1-10)"
                value={placeForm.mystery_score} onChange={e => setPlaceForm({ ...placeForm, mystery_score: Number(e.target.value) })}
                className="px-3 py-2 rounded-lg border border-purple-800 bg-space-950 text-white text-xs"
              />
            </div>
            <input
              type="text" placeholder="Image URL"
              value={placeForm.image_url} onChange={e => setPlaceForm({ ...placeForm, image_url: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-purple-800 bg-space-950 text-white text-xs"
            />
            <button type="submit" className="w-full py-2 bg-pink-600 hover:bg-pink-500 text-white font-mono text-xs rounded-lg font-bold">
              LOG PLACE
            </button>
          </form>

          {/* Delete list */}
          <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
            {places.map(place => (
              <div key={place.id} className="flex items-center justify-between p-2 bg-purple-950/40 border border-purple-900/30 rounded text-xs font-mono">
                <span className="truncate max-w-[250px]">{place.name}</span>
                <button onClick={() => deleteItem('places', place.id)} className="text-red-400 hover:text-red-300">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* VIDEO MANAGER */}
        <div className="rounded-2xl border border-purple-900/40 bg-purple-950/10 backdrop-blur-md p-6 space-y-6">
          <h3 className="text-lg font-bold text-white font-sans flex items-center gap-2 border-b border-purple-900/30 pb-3">
            <Plus className="w-5 h-5 text-pink-500" />
            <span>{t.addNewVideo}</span>
          </h3>

          <form onSubmit={submitVideo} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text" required placeholder="Title (EN)"
                value={videoForm.title} onChange={e => setVideoForm({ ...videoForm, title: e.target.value })}
                className="px-3 py-2 rounded-lg border border-purple-800 bg-space-950 text-white text-xs"
              />
              <input
                type="text" required placeholder="මාතෘකාව (SI)"
                value={videoForm.title_si} onChange={e => setVideoForm({ ...videoForm, title_si: e.target.value })}
                className="px-3 py-2 rounded-lg border border-purple-800 bg-space-950 text-white text-xs"
              />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <input
                type="text" required placeholder="YouTube Video ID"
                value={videoForm.youtube_id} onChange={e => setVideoForm({ ...videoForm, youtube_id: e.target.value })}
                className="px-3 py-2 rounded-lg border border-purple-800 bg-space-950 text-white text-xs"
              />
              <select
                value={videoForm.category} onChange={e => setVideoForm({ ...videoForm, category: e.target.value })}
                className="px-3 py-2 rounded-lg border border-purple-800 bg-space-950 text-white text-xs"
              >
                <option value="Cosmos">Cosmos</option>
                <option value="Mysteries">Mysteries</option>
                <option value="Science">Science</option>
                <option value="Ancient">Ancient</option>
              </select>
              <input
                type="text" required placeholder="Duration (e.g. 10:45)"
                value={videoForm.duration} onChange={e => setVideoForm({ ...videoForm, duration: e.target.value })}
                className="px-3 py-2 rounded-lg border border-purple-800 bg-space-950 text-white text-xs"
              />
            </div>
            <button type="submit" className="w-full py-2 bg-pink-600 hover:bg-pink-500 text-white font-mono text-xs rounded-lg font-bold">
              BROADCAST VIDEO
            </button>
          </form>

          {/* Delete list */}
          <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
            {videos.map(vid => (
              <div key={vid.id} className="flex items-center justify-between p-2 bg-purple-950/40 border border-purple-900/30 rounded text-xs font-mono">
                <span className="truncate max-w-[250px]">{vid.title}</span>
                <button onClick={() => deleteItem('videos', vid.id)} className="text-red-400 hover:text-red-300">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* TRIVIA QUESTION MANAGER */}
        <div className="rounded-2xl border border-purple-900/40 bg-purple-950/10 backdrop-blur-md p-6 space-y-6">
          <h3 className="text-lg font-bold text-white font-sans flex items-center gap-2 border-b border-purple-900/30 pb-3">
            <Plus className="w-5 h-5 text-pink-500" />
            <span>{t.addNewQuestion}</span>
          </h3>

          <form onSubmit={submitQuestion} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text" required placeholder="Question (EN)"
                value={questionForm.question} onChange={e => setQuestionForm({ ...questionForm, question: e.target.value })}
                className="px-3 py-2 rounded-lg border border-purple-800 bg-space-950 text-white text-xs"
              />
              <input
                type="text" required placeholder="ප්‍රශ්නය (SI)"
                value={questionForm.question_si} onChange={e => setQuestionForm({ ...questionForm, question_si: e.target.value })}
                className="px-3 py-2 rounded-lg border border-purple-800 bg-space-950 text-white text-xs"
              />
            </div>

            {/* Options (EN) */}
            <div className="grid grid-cols-4 gap-2">
              {[0, 1, 2, 3].map(idx => (
                <input
                  key={idx} type="text" required placeholder={`Opt ${idx} (EN)`}
                  value={(questionForm as any)[`opt${idx}`]}
                  onChange={e => setQuestionForm({ ...questionForm, [`opt${idx}`]: e.target.value })}
                  className="px-2 py-1.5 rounded border border-purple-800 bg-space-950 text-white text-[10px]"
                />
              ))}
            </div>

            {/* Options (SI) */}
            <div className="grid grid-cols-4 gap-2">
              {[0, 1, 2, 3].map(idx => (
                <input
                  key={idx} type="text" required placeholder={`පිළිතුර ${idx} (SI)`}
                  value={(questionForm as any)[`opt${idx}_si`]}
                  onChange={e => setQuestionForm({ ...questionForm, [`opt${idx}_si`]: e.target.value })}
                  className="px-2 py-1.5 rounded border border-purple-800 bg-space-950 text-white text-[10px]"
                />
              ))}
            </div>

            <div className="grid grid-cols-3 gap-2">
              <select
                value={questionForm.correct_option_index}
                onChange={e => setQuestionForm({ ...questionForm, correct_option_index: Number(e.target.value) })}
                className="px-3 py-2 rounded-lg border border-purple-800 bg-space-950 text-white text-xs"
              >
                <option value={0}>Correct Index: 0</option>
                <option value={1}>Correct Index: 1</option>
                <option value={2}>Correct Index: 2</option>
                <option value={3}>Correct Index: 3</option>
              </select>
              <input
                type="number" required placeholder="Points"
                value={questionForm.points} onChange={e => setQuestionForm({ ...questionForm, points: Number(e.target.value) })}
                className="px-3 py-2 rounded-lg border border-purple-800 bg-space-950 text-white text-xs"
              />
            </div>

            <textarea
              required placeholder="Explanation (EN)" rows={2}
              value={questionForm.explanation} onChange={e => setQuestionForm({ ...questionForm, explanation: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-purple-800 bg-space-950 text-white text-xs"
            />
            <textarea
              required placeholder="විස්තර කිරීම (SI)" rows={2}
              value={questionForm.explanation_si} onChange={e => setQuestionForm({ ...questionForm, explanation_si: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-purple-800 bg-space-950 text-white text-xs"
            />

            <button type="submit" className="w-full py-2 bg-pink-600 hover:bg-pink-500 text-white font-mono text-xs rounded-lg font-bold">
              UPLOAD QUESTION
            </button>
          </form>

          {/* Delete list */}
          <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
            {questions.map(q => (
              <div key={q.id} className="flex items-center justify-between p-2 bg-purple-950/40 border border-purple-900/30 rounded text-xs font-mono">
                <span className="truncate max-w-[250px]">{q.question}</span>
                <button onClick={() => deleteItem('quiz', q.id)} className="text-red-400 hover:text-red-300">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
