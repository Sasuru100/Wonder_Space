import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'en' | 'si';

interface Translations {
  title: string;
  tagline: string;
  facts: string;
  places: string;
  videos: string;
  quiz: string;
  theories: string;
  admin: string;
  loading: string;
  upvote: string;
  upvoted: string;
  exploreFacts: string;
  explorePlaces: string;
  mysteryScore: string;
  coordinates: string;
  location: string;
  submitTheory: string;
  leaderboard: string;
  playQuiz: string;
  correct: string;
  wrong: string;
  next: string;
  score: string;
  username: string;
  enterName: string;
  submitScore: string;
  postTheory: string;
  theoryTitle: string;
  theoryContent: string;
  authorName: string;
  addComment: string;
  comments: string;
  category: string;
  search: string;
  adminPasscode: string;
  login: string;
  logout: string;
  addNewFact: string;
  addNewPlace: string;
  addNewVideo: string;
  addNewQuestion: string;
  delete: string;
  options: string;
  correctOption: string;
  explanation: string;
  duration: string;
  youtubeId: string;
  points: string;
}

const translations: Record<Language, Translations> = {
  en: {
    title: "Wonder Space",
    tagline: "Explore the Cosmic Mysteries, Mind-Bending Facts & Earth's Strangest Wonders",
    facts: "Mind-Bending Facts",
    places: "Strangest Places",
    videos: "Wonder Videos",
    quiz: "Space Trivia",
    theories: "Fan Theories",
    admin: "Creator Studio",
    loading: "Decrypting cosmic signals...",
    upvote: "Upvote",
    upvoted: "Upvoted!",
    exploreFacts: "Cosmic & Earth Truths",
    explorePlaces: "Anomalous Coordinates",
    mysteryScore: "Mystery Score",
    coordinates: "Coordinates",
    location: "Location",
    submitTheory: "Submit Theory",
    leaderboard: "Cosmic Leaderboard",
    playQuiz: "Initiate Quiz",
    correct: "Signal Verified! (Correct)",
    wrong: "Signal Corrupted! (Incorrect)",
    next: "Next Signal",
    score: "Score",
    username: "Space Explorer Name",
    enterName: "Enter your handle...",
    submitScore: "Submit to Leaderboard",
    postTheory: "Broadcast Your Theory",
    theoryTitle: "Theory Subject",
    theoryContent: "Detail your findings...",
    authorName: "Your Handle",
    addComment: "Transmit Comment",
    comments: "Transmissions",
    category: "Sector / Category",
    search: "Search cosmic records...",
    adminPasscode: "Admin Frequency Passcode",
    login: "Establish Link",
    logout: "Terminate Session",
    addNewFact: "Inject New Fact",
    addNewPlace: "Log Anomalous Place",
    addNewVideo: "Broadcast New Video",
    addNewQuestion: "Upload Trivia Matrix",
    delete: "Purge",
    options: "Choices",
    correctOption: "Correct Index (0-3)",
    explanation: "Cosmic Explanation",
    duration: "Video Duration",
    youtubeId: "YouTube Video ID",
    points: "Points Awarded",
  },
  si: {
    title: "Wonder Space",
    tagline: "විශ්වයේ විස්මිත අභිරහස්, මනස මවිත කරවන කරුණු සහ පෘථිවියේ අමුතුම දේවල් ගවේෂණය කරන්න",
    facts: "විස්මිත කරුණු",
    places: "අමුතුම තැන්",
    videos: "වීඩියෝ එකතුව",
    quiz: "දැනුම මිනුම",
    theories: "ප්‍රජා මතවාද",
    admin: "නිර්මාණකරණ පුවරුව",
    loading: "විශ්වීය දත්ත ලබා ගනිමින් පවතී...",
    upvote: "අගය කරන්න",
    upvoted: "අගය කරන ලදී!",
    exploreFacts: "විශ්වයේ සහ පෘථිවියේ සත්‍යයන්",
    explorePlaces: "අසාමාන්‍ය ඛණ්ඩාංක",
    mysteryScore: "අභිරහස් මට්ටම",
    coordinates: "ඛණ්ඩාංක",
    location: "පිහිටීම",
    submitTheory: "මතවාදයක් ඉදිරිපත් කරන්න",
    leaderboard: "ප්‍රමුඛ පුවරුව",
    playQuiz: "තරඟය අරඹන්න",
    correct: "නිවැරදි පිළිතුරකි!",
    wrong: "වැරදි පිළිතුරකි!",
    next: "ඊළඟ ප්‍රශ්නය",
    score: "ලකුණු",
    username: "ඔබේ නම",
    enterName: "ඔබේ නම ඇතුළත් කරන්න...",
    submitScore: "ප්‍රමුඛ පුවරුවට එක් කරන්න",
    postTheory: "ඔබේ මතවාදය විකාශනය කරන්න",
    theoryTitle: "මතවාදයේ මාතෘකාව",
    theoryContent: "ඔබ සොයාගත් දේ විස්තර කරන්න...",
    authorName: "ඔබේ නම/හැඬලය",
    addComment: "අදහසක් එක් කරන්න",
    comments: "ප්‍රතිචාර",
    category: "අංශය / කාණ්ඩය",
    search: "දත්ත ගවේෂණය කරන්න...",
    adminPasscode: "පරිපාලක මුරපදය",
    login: "සම්බන්ධ වන්න",
    logout: "සැසිය අවසන් කරන්න",
    addNewFact: "නව කරුණක් ඇතුළත් කරන්න",
    addNewPlace: "නව අමුතු තැනක් ලියාපදිංචි කරන්න",
    addNewVideo: "නව වීඩියෝවක් එක් කරන්න",
    addNewQuestion: "නව ප්‍රශ්නයක් ඇතුළත් කරන්න",
    delete: "මකා දමන්න",
    options: "විකල්පයන්",
    correctOption: "නිවැරදි විකල්ප අංකය (0-3)",
    explanation: "විස්තරාත්මක පැහැදිලි කිරීම",
    duration: "වීඩියෝ කාලය",
    youtubeId: "YouTube වීඩියෝ ID",
    points: "ලබාදෙන ලකුණු",
  }
};

interface LanguageContextProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('ws_lang');
    return (saved === 'en' || saved === 'si') ? saved : 'si'; // Default to Sinhala as the channel operates in Sinhala mainly
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('ws_lang', lang);
  };

  const t = translations[language];

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
}
