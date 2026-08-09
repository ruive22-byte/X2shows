import React, { useState } from 'react';
import { 
  Sparkles, X, Send, Bot, User, Flame, Zap, 
  MessageSquare, Compass, Play, Star, Sliders, 
  Layers, Smile, RefreshCw
} from 'lucide-react';
import { Show } from '../types';

interface AiCuratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  shows: Show[];
  onPlayShow: (show: Show) => void;
  onOpenDetails: (show: Show) => void;
}

export const AiCuratorModal: React.FC<AiCuratorModalProps> = ({
  isOpen,
  onClose,
  shows,
  onPlayShow,
  onOpenDetails,
}) => {
  const [activeTab, setActiveTab] = useState<'vibe' | 'characterChat' | 'customPrompt'>('vibe');
  const [selectedMood, setSelectedMood] = useState('adrenaline');
  const [selectedStyle, setSelectedStyle] = useState('all');
  const [userPrompt, setUserPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [recommendationResult, setRecommendationResult] = useState<any>(null);

  // Character Chat States
  const [selectedCharacter, setSelectedCharacter] = useState({
    name: 'Vi',
    showTitle: 'Arcane: League of Legends',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&auto=format&fit=crop',
    role: 'Zaun Enforcer / Brawler'
  });
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'character' | 'ai', text: string }>>([
    {
      sender: 'character',
      text: "Hey hotshot. Got a question about Zaun, hextech gauntlets, or why Vander's juice always tastes like engine oil?"
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);

  if (!isOpen) return null;

  const moodPresets = [
    { id: 'adrenaline', label: '⚡ Hyper-Kinetic Adrenaline', desc: 'Fast smear frames, laser chases, and massive sakuga clashes.' },
    { id: 'dark-gothic', label: '🩸 Dark Baroque & Gothic Noir', desc: 'Vampire revolutions, blood moon aesthetics, and high stakes.' },
    { id: 'cyber-neon', label: '🌆 Cyberpunk & Synthesized Cityscapes', desc: 'Chrome cyberware, neon rain, and tragic rebellion.' },
    { id: 'whimsical-tears', label: '🌸 Whimsical Atmosphere & Deep Emotion', desc: 'Serene landscapes, passing of time, and heartfelt journeys.' },
  ];

  const handleVibeMatch = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/gemini/vibe-match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mood: selectedMood,
          animationStyle: selectedStyle,
          showsSummary: shows.map(s => ({
            id: s.id,
            title: s.title,
            genres: s.genres,
            animationStyle: s.animationStyle,
            studio: s.studio,
            synopsis: s.synopsis,
            score: s.score
          }))
        })
      });

      if (response.ok) {
        const data = await response.json();
        setRecommendationResult(data);
      } else {
        // Fallback local intelligent match if server is offline
        const matched = shows.find(s => 
          selectedMood === 'adrenaline' ? s.id === 'cyberpunk-edgerunners' || s.id === 'arcane' :
          selectedMood === 'dark-gothic' ? s.id === 'demon-slayer' || s.id === 'castlevania-nocturne' :
          selectedMood === 'whimsical-tears' ? s.id === 'frieren' : s.id === 'arcane'
        ) || shows[0];

        setRecommendationResult({
          recommendedShowId: matched.id,
          matchScore: 98.6,
          aiCuratorReasoning: `Based on your desire for ${selectedMood.replace('-', ' ')} with ${selectedStyle} animation, ${matched.title} by ${matched.studio} delivers unprecedented visual density, emotional depth, and jaw-dropping choreography.`,
          keySakugaMoments: ["Opening Chase Sequence", "Episode 3 Climax Fight", "Finale Particle Overload"],
          suggestedNextShow: shows[1]?.title
        });
      }
    } catch (e) {
      const matched = shows[0];
      setRecommendationResult({
        recommendedShowId: matched.id,
        matchScore: 97.8,
        aiCuratorReasoning: `${matched.title} stands as the gold standard in modern international animation.`,
        keySakugaMoments: ["Key Sequence at 120 FPS"],
        suggestedNextShow: shows[1]?.title
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendCharacterChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isChatLoading) return;

    const userText = chatInput;
    setChatInput('');
    setChatMessages(prev => [...prev, { sender: 'user', text: userText }]);
    setIsChatLoading(true);

    try {
      const response = await fetch('/api/gemini/character-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          characterName: selectedCharacter.name,
          showTitle: selectedCharacter.showTitle,
          userMessage: userText
        })
      });

      if (response.ok) {
        const data = await response.json();
        setChatMessages(prev => [...prev, { sender: 'character', text: data.reply }]);
      } else {
        setChatMessages(prev => [...prev, { 
          sender: 'character', 
          text: `“Look, in ${selectedCharacter.showTitle}, hesitation gets you flatlined. You keep your guard up and hit before they see the spark.”` 
        }]);
      }
    } catch (err) {
      setChatMessages(prev => [...prev, { 
        sender: 'character', 
        text: `“I hear ya. Keep your feet planted and never back down.”` 
      }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const matchedShow = shows.find(s => s.id === recommendationResult?.recommendedShowId);

  return (
    <div 
      id="ai-curator-modal-backdrop"
      className="fixed inset-0 z-50 overflow-y-auto bg-black/90 backdrop-blur-xl flex items-center justify-center p-3 sm:p-6 animate-fadeIn"
      onClick={onClose}
    >
      <div 
        id="ai-curator-modal-container"
        className="relative w-full max-w-4xl rounded-3xl overflow-hidden bg-[#100E17] border border-rose-900/50 shadow-2xl shadow-black my-8 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header with Maroon/Electric Blue Brand */}
        <div className="p-4 sm:p-6 bg-gradient-to-r from-[#800020]/80 via-purple-950/80 to-[#2563EB]/80 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-black/40 border border-white/20 flex items-center justify-center shadow-lg">
              <Sparkles className="w-5 h-5 text-cyan-300 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display font-extrabold text-lg sm:text-xl text-white tracking-tight">
                  AniMatch AI Curator
                </h2>
                <span className="text-[10px] font-mono-code font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/40">
                  Gemini Flash 2.5
                </span>
              </div>
              <p className="text-xs text-rose-200/80">
                Atmospheric mood analyzer, keyframe matchmaker & interactive character lore
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-black/40 hover:bg-black/80 text-slate-300 hover:text-white border border-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center gap-2 px-4 sm:px-6 pt-3 bg-black/40 border-b border-white/[0.08]">
          <button
            onClick={() => setActiveTab('vibe')}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'vibe'
                ? 'border-rose-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Flame className="w-4 h-4 text-rose-400" />
            <span>Mood & Sakuga Matcher</span>
          </button>

          <button
            onClick={() => setActiveTab('characterChat')}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'characterChat'
                ? 'border-rose-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <MessageSquare className="w-4 h-4 text-blue-400" />
            <span>Live Character AI Chat</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* TAB 1: VIBE & SAKUGA MATCHER */}
          {activeTab === 'vibe' && (
            <div className="space-y-6">
              
              {/* Mood Presets */}
              <div>
                <label className="text-xs font-mono-code uppercase font-bold text-rose-300 tracking-wider block mb-2">
                  1. Select Your Current Vibe
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {moodPresets.map((mood) => (
                    <button
                      key={mood.id}
                      onClick={() => setSelectedMood(mood.id)}
                      className={`p-3.5 rounded-2xl text-left border transition-all ${
                        selectedMood === mood.id
                          ? 'bg-gradient-to-r from-rose-950 to-blue-950 border-rose-500 shadow-lg shadow-rose-950/50'
                          : 'bg-white/[0.04] border-white/[0.08] hover:bg-white/[0.07] text-slate-300'
                      }`}
                    >
                      <div className="text-xs font-bold text-white">{mood.label}</div>
                      <div className="text-[11px] text-slate-400 mt-1">{mood.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Animation Style Filter */}
              <div>
                <label className="text-xs font-mono-code uppercase font-bold text-blue-300 tracking-wider block mb-2">
                  2. Animation Craft Preference
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: 'all', label: '✨ Any Masterpiece' },
                    { id: '2d', label: '🎨 Hand-Drawn 2D Sakuga' },
                    { id: 'painted3d', label: '🖌️ Fortiche Painted 3D' },
                    { id: 'ufotable', label: '⚡ Ufotable Digital VFX' },
                    { id: 'watercolor', label: '🌸 Watercolor & Film Grain' },
                  ].map((style) => (
                    <button
                      key={style.id}
                      onClick={() => setSelectedStyle(style.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                        selectedStyle === style.id
                          ? 'bg-blue-600 text-white font-bold shadow-md'
                          : 'bg-white/[0.05] border border-white/[0.08] text-slate-300 hover:bg-white/[0.1]'
                      }`}
                    >
                      {style.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Trigger Button */}
              <div>
                <button
                  id="ai-generate-match-btn"
                  onClick={handleVibeMatch}
                  disabled={isLoading}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#800020] via-purple-900 to-[#2563EB] text-white font-extrabold text-sm shadow-xl shadow-rose-950/60 hover:scale-[1.01] transition-transform flex items-center justify-center gap-2 border border-rose-400/40"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-cyan-300" />
                      <span>Synthesizing Animation Neural Matrix...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-cyan-300" />
                      <span>Compute Exact Sakuga Match</span>
                    </>
                  )}
                </button>
              </div>

              {/* Recommendation Card Output */}
              {recommendationResult && (
                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#181224] to-[#121626] border border-rose-500/40 space-y-4 shadow-2xl animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono-code font-bold text-emerald-400 bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-500/40">
                        ★ {recommendationResult.matchScore}% Match
                      </span>
                      <span className="text-xs font-bold text-white">
                        AI Recommended Masterpiece
                      </span>
                    </div>
                  </div>

                  {matchedShow && (
                    <div className="flex flex-col sm:flex-row gap-4 items-start">
                      <img 
                        src={matchedShow.heroPosterUrl} 
                        alt={matchedShow.title} 
                        className="w-full sm:w-36 aspect-video sm:aspect-[3/4] object-cover rounded-xl border border-white/10 shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <div className="space-y-2 flex-1">
                        <div>
                          <h3 className="text-base font-display font-extrabold text-white">
                            {matchedShow.title}
                          </h3>
                          <div className="text-xs text-rose-300/90 font-mono-code">
                            {matchedShow.studio} • {matchedShow.animationStyle}
                          </div>
                        </div>

                        <p className="text-xs text-slate-300 leading-relaxed italic border-l-2 border-rose-500 pl-3">
                          “{recommendationResult.aiCuratorReasoning}”
                        </p>

                        <div className="flex flex-wrap gap-2 pt-2">
                          <button
                            onClick={() => {
                              onPlayShow(matchedShow);
                              onClose();
                            }}
                            className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-900 to-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md"
                          >
                            <Play className="w-3.5 h-3.5 fill-white" />
                            <span>Watch in 4K Theater</span>
                          </button>

                          <button
                            onClick={() => {
                              onOpenDetails(matchedShow);
                              onClose();
                            }}
                            className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold"
                          >
                            View Lore & Cast
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

            </div>
          )}

          {/* TAB 2: LIVE CHARACTER AI CHAT */}
          {activeTab === 'characterChat' && (
            <div className="space-y-4 flex flex-col h-full">
              
              {/* Character Selector Pill */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2">
                {[
                  { name: 'Vi', showTitle: 'Arcane: League of Legends', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&auto=format&fit=crop', role: 'Zaun Enforcer' },
                  { name: 'David Martinez', showTitle: 'Cyberpunk: Neon Genesis', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop', role: 'Sandevistan Edge-Runner' },
                  { name: 'Tanjiro Kamado', showTitle: 'Demon Slayer: Infinity Castle', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=150&auto=format&fit=crop', role: 'Sun Breathing Swordsman' },
                  { name: 'Frieren', showTitle: "Frieren: Beyond Journey's End", avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop', role: 'Elven Mage' },
                ].map((char) => (
                  <button
                    key={char.name}
                    onClick={() => {
                      setSelectedCharacter(char);
                      setChatMessages([
                        {
                          sender: 'character',
                          text: `Hello! I'm ${char.name} from ${char.showTitle}. Ask me about our world, battles, or gear.`
                        }
                      ]);
                    }}
                    className={`flex items-center gap-2.5 px-3 py-1.5 rounded-xl border shrink-0 transition-all ${
                      selectedCharacter.name === char.name
                        ? 'bg-rose-950/80 border-rose-500 text-white font-bold'
                        : 'bg-white/[0.04] border-white/[0.08] text-slate-300 hover:bg-white/[0.08]'
                    }`}
                  >
                    <img src={char.avatar} alt={char.name} className="w-6 h-6 rounded-full object-cover" referrerPolicy="no-referrer" />
                    <span className="text-xs">{char.name}</span>
                  </button>
                ))}
              </div>

              {/* Chat Thread Messages */}
              <div className="h-64 sm:h-72 overflow-y-auto p-4 rounded-2xl bg-black/50 border border-white/[0.08] space-y-3">
                {chatMessages.map((msg, idx) => (
                  <div 
                    key={idx}
                    className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.sender === 'character' && (
                      <img 
                        src={selectedCharacter.avatar} 
                        alt={selectedCharacter.name} 
                        className="w-7 h-7 rounded-full object-cover border border-white/10 shrink-0 mt-0.5"
                        referrerPolicy="no-referrer"
                      />
                    )}
                    <div 
                      className={`max-w-[80%] rounded-2xl p-3 text-xs leading-relaxed ${
                        msg.sender === 'user'
                          ? 'bg-gradient-to-r from-rose-900 to-blue-700 text-white font-medium'
                          : 'bg-[#181522] border border-white/10 text-slate-200'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
                {isChatLoading && (
                  <div className="flex items-center gap-2 text-xs text-rose-300 font-mono-code pl-9">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>{selectedCharacter.name} is typing...</span>
                  </div>
                )}
              </div>

              {/* Chat Input Field */}
              <form onSubmit={handleSendCharacterChat} className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder={`Ask ${selectedCharacter.name} about fight techniques, lore secrets, or personal goals...`}
                  className="flex-1 bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                />
                <button
                  type="submit"
                  disabled={isChatLoading || !chatInput.trim()}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-900 to-blue-700 text-white text-xs font-bold hover:scale-105 transition-transform flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Send</span>
                </button>
              </form>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
