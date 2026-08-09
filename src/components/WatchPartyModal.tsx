import React, { useState } from 'react';
import { 
  Users, X, Copy, Check, Send, Play, Pause, 
  Volume2, Sparkles, Smile, Shield, Radio, Flame
} from 'lucide-react';
import { Show } from '../types';

interface WatchPartyModalProps {
  isOpen: boolean;
  onClose: () => void;
  show: Show | null;
  onPlayShow: (show: Show) => void;
}

export const WatchPartyModal: React.FC<WatchPartyModalProps> = ({
  isOpen,
  onClose,
  show,
  onPlayShow,
}) => {
  const [copied, setCopied] = useState(false);
  const [partyMessages, setPartyMessages] = useState([
    { user: 'Kenji_Sakuga', time: '14:22', text: 'THAT SMEAR FRAME ON EPISODE 3 WAS UNREAL! 🔥', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100&auto=format&fit=crop' },
    { user: 'CyberValkyrie', time: '14:23', text: 'The bass drop in Dolby Atmos literally shook my desk ⚡', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100&auto=format&fit=crop' },
    { user: 'ZenitsuMaster', time: '14:24', text: 'Wait until the second phase at 18:40... absolute cinema 🍿', avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?q=80&w=100&auto=format&fit=crop' },
  ]);
  const [chatInput, setChatInput] = useState('');
  const roomCode = 'XTWO-SAKUGA-4K-99';

  if (!isOpen) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`https://xtwoshows.live/room/${roomCode}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    setPartyMessages(prev => [
      ...prev,
      {
        user: 'You (Host)',
        time: 'Just now',
        text: chatInput,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&auto=format&fit=crop'
      }
    ]);
    setChatInput('');
  };

  const handleSendReaction = (emoji: string) => {
    setPartyMessages(prev => [
      ...prev,
      {
        user: 'You (Host)',
        time: 'Just now',
        text: `Sent reaction: ${emoji}`,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&auto=format&fit=crop'
      }
    ]);
  };

  return (
    <div 
      id="watch-party-modal-backdrop"
      className="fixed inset-0 z-50 overflow-y-auto bg-black/90 backdrop-blur-xl flex items-center justify-center p-3 sm:p-6 animate-fadeIn"
      onClick={onClose}
    >
      <div 
        id="watch-party-modal-container"
        className="relative w-full max-w-4xl rounded-3xl overflow-hidden bg-[#110E18] border border-blue-600/40 shadow-2xl shadow-black my-8 flex flex-col md:flex-row max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Left Section: Video Room Preview & Controls */}
        <div className="w-full md:w-3/5 p-4 sm:p-6 flex flex-col justify-between border-b md:border-b-0 md:border-r border-white/[0.08] space-y-4">
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-blue-950/80 border border-blue-500/40 text-blue-300">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-white font-display">
                  Live Watch Party Lounge
                </h3>
                <div className="flex items-center gap-1.5 text-[10px] font-mono-code text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>4 Viewers Connected in 4K HDR Sync</span>
                </div>
              </div>
            </div>

            <button onClick={onClose} className="md:hidden text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Show Card in Room */}
          {show && (
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-[#181522] border border-white/10 group">
              <img 
                src={show.backdropUrl || show.heroPosterUrl} 
                alt={show.title} 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-4">
                <div className="text-xs font-mono-code text-rose-400 font-bold">{show.studio}</div>
                <h4 className="text-base font-bold text-white">{show.title}</h4>
                <div className="text-[11px] text-slate-300">Episode 1: 4K Dolby Atmos</div>
              </div>

              {/* Center Play to launch theater */}
              <button
                onClick={() => {
                  onPlayShow(show);
                  onClose();
                }}
                className="absolute inset-0 m-auto w-14 h-14 rounded-full bg-gradient-to-tr from-rose-900 to-blue-600 text-white flex items-center justify-center shadow-2xl hover:scale-110 transition-transform"
              >
                <Play className="w-6 h-6 fill-white ml-0.5" />
              </button>
            </div>
          )}

          {/* Room Link Invite Bar */}
          <div className="p-3 rounded-2xl bg-black/40 border border-white/[0.08] space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400 font-mono-code">
              <span>INVITE CODE</span>
              <span className="text-blue-400 font-bold">{roomCode}</span>
            </div>
            <div className="flex items-center gap-2">
              <input 
                type="text"
                readOnly
                value={`https://xtwoshows.live/room/${roomCode}`}
                className="flex-1 bg-black/60 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none font-mono-code"
              />
              <button
                onClick={handleCopyLink}
                className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors flex items-center gap-1 shrink-0"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Member Avatars */}
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-mono-code text-slate-400 uppercase">In Room:</span>
            <div className="flex items-center -space-x-2 overflow-hidden">
              {[
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=100&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?q=80&w=100&auto=format&fit=crop',
              ].map((avatar, i) => (
                <img 
                  key={i} 
                  src={avatar} 
                  alt="Member" 
                  className="w-8 h-8 rounded-full border-2 border-[#110E18] object-cover" 
                  referrerPolicy="no-referrer"
                />
              ))}
            </div>
          </div>

        </div>

        {/* Right Section: Realtime Chat Stream */}
        <div className="w-full md:w-2/5 p-4 sm:p-6 flex flex-col justify-between space-y-4 bg-black/30">
          
          <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
              Live Reaction Stream
            </span>
            <button onClick={onClose} className="hidden md:block text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Chat Messages */}
          <div className="h-64 sm:h-72 overflow-y-auto space-y-3 pr-1 scrollbar-thin">
            {partyMessages.map((msg, idx) => (
              <div key={idx} className="p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06] space-y-1">
                <div className="flex items-center justify-between text-[10px]">
                  <div className="flex items-center gap-1.5 font-bold text-rose-300">
                    <img src={msg.avatar} alt={msg.user} className="w-4 h-4 rounded-full object-cover" referrerPolicy="no-referrer" />
                    <span>{msg.user}</span>
                  </div>
                  <span className="text-slate-500 font-mono-code">{msg.time}</span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed">
                  {msg.text}
                </p>
              </div>
            ))}
          </div>

          {/* Fast Emoji Reactions */}
          <div className="flex items-center justify-between gap-1 pt-2 border-t border-white/[0.08]">
            {['🔥', '⚡', '🩸', '😱', '🌸', '🍿'].map((emoji) => (
              <button
                key={emoji}
                onClick={() => handleSendReaction(emoji)}
                className="p-1.5 rounded-lg bg-white/[0.06] hover:bg-rose-950 text-base transition-transform hover:scale-125"
                title={`Send ${emoji}`}
              >
                {emoji}
              </button>
            ))}
          </div>

          {/* Message Input Form */}
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Drop a reaction..."
              className="flex-1 bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              disabled={!chatInput.trim()}
              className="p-2 rounded-xl bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-40 transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>

      </div>
    </div>
  );
};
