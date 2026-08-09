import React, { useState, useEffect } from 'react';
import { Bug, Sparkles, Eye, EyeOff } from 'lucide-react';

export interface MiniBug {
  id: string;
  x: number;
  y: number;
  color: string;
  typeLabel: string;
  role: 'Sentinel' | 'UniversalAI' | 'SelfHealing' | 'GlobalRepo' | 'AppAuditor' | 'StreamMonitor';
  isZapping: boolean;
  zapMessage: string;
}

const ZAP_MESSAGES = {
  Sentinel: ['Purged Tracker 🛡️', 'Ad Script Deleted! ⚡', 'DOM Sanitized 🧹'],
  UniversalAI: ['Local LLM Ping 🧠', 'Cloud Fallback Ready ☁️', 'Prompt Optimizing 🔮'],
  SelfHealing: ['Exception Caught 🩹', 'Applying Auto-Patch 🧩', 'Runtime Recovered ⚡'],
  GlobalRepo: ['Directory Indexed 📂', 'Validating Imports 🔍', 'AST Tree Checked 🌳'],
  AppAuditor: ['Fixer Coordinated 🛠️', 'Catalog Cleaned 🧼', 'Repair Pipeline Active ⚙️'],
  StreamMonitor: ['Buffer Checked 🩺', 'Latency Audited 📡', 'Server Failover Ready 🔄'],
};

export interface CyberBugSwarmProps {
  isVisible: boolean;
}

export const CyberBugSwarm: React.FC<CyberBugSwarmProps> = ({ isVisible }) => {
  // 12 Mini Bugs (2 per role for optimal 60 FPS performance)
  const [bugs, setBugs] = useState<MiniBug[]>([
    { id: 'sentinel-1', x: 12, y: 22, color: 'text-green-400 bg-green-500/20 border-green-400', typeLabel: 'Sentinel #1', role: 'Sentinel', isZapping: false, zapMessage: '' },
    { id: 'sentinel-2', x: 72, y: 32, color: 'text-green-400 bg-green-500/20 border-green-400', typeLabel: 'Sentinel #2', role: 'Sentinel', isZapping: false, zapMessage: '' },

    { id: 'universal-1', x: 18, y: 62, color: 'text-cyan-400 bg-cyan-500/20 border-cyan-400', typeLabel: 'Universal AI #1', role: 'UniversalAI', isZapping: false, zapMessage: '' },
    { id: 'universal-2', x: 82, y: 78, color: 'text-cyan-400 bg-cyan-500/20 border-cyan-400', typeLabel: 'Universal AI #2', role: 'UniversalAI', isZapping: false, zapMessage: '' },

    { id: 'healer-1', x: 42, y: 28, color: 'text-rose-400 bg-rose-500/20 border-rose-400', typeLabel: 'Self-Healer #1', role: 'SelfHealing', isZapping: false, zapMessage: '' },
    { id: 'healer-2', x: 78, y: 58, color: 'text-rose-400 bg-rose-500/20 border-rose-400', typeLabel: 'Self-Healer #2', role: 'SelfHealing', isZapping: false, zapMessage: '' },

    { id: 'repo-1', x: 32, y: 82, color: 'text-purple-400 bg-purple-500/20 border-purple-400', typeLabel: 'Repo Agent #1', role: 'GlobalRepo', isZapping: false, zapMessage: '' },
    { id: 'repo-2', x: 88, y: 22, color: 'text-purple-400 bg-purple-500/20 border-purple-400', typeLabel: 'Repo Agent #2', role: 'GlobalRepo', isZapping: false, zapMessage: '' },

    { id: 'auditor-1', x: 22, y: 38, color: 'text-yellow-400 bg-yellow-500/20 border-yellow-400', typeLabel: 'Auditor #1', role: 'AppAuditor', isZapping: false, zapMessage: '' },
    { id: 'auditor-2', x: 72, y: 82, color: 'text-yellow-400 bg-yellow-500/20 border-yellow-400', typeLabel: 'Auditor #2', role: 'AppAuditor', isZapping: false, zapMessage: '' },

    { id: 'stream-1', x: 28, y: 18, color: 'text-orange-400 bg-orange-500/20 border-orange-400', typeLabel: 'Stream Monitor #1', role: 'StreamMonitor', isZapping: false, zapMessage: '' },
    { id: 'stream-2', x: 62, y: 82, color: 'text-orange-400 bg-orange-500/20 border-orange-400', typeLabel: 'Stream Monitor #2', role: 'StreamMonitor', isZapping: false, zapMessage: '' },
  ]);

  // Throttled Movement Loop (Fires every 4 seconds)
  useEffect(() => {
    if (!isVisible) return;

    const interval = setInterval(() => {
      setBugs((prevBugs) =>
        prevBugs.map((bug) => {
          const newX = Math.max(5, Math.min(90, bug.x + (Math.random() * 8 - 4)));
          const newY = Math.max(8, Math.min(88, bug.y + (Math.random() * 8 - 4)));
          const shouldZap = Math.random() > 0.8;

          const roleMessages = ZAP_MESSAGES[bug.role];
          const randomMsg = roleMessages[Math.floor(Math.random() * roleMessages.length)];

          return {
            ...bug,
            x: newX,
            y: newY,
            isZapping: shouldZap,
            zapMessage: randomMsg,
          };
        })
      );
    }, 4000);

    return () => clearInterval(interval);
  }, [isVisible]);

  return (
    <>
      {/* GPU-ACCELERATED MINI BUGS OVERLAY */}
      {isVisible && (
        <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden">
          {bugs.map((bug) => (
            <div
              key={bug.id}
              className="absolute transition-all duration-1000 ease-out flex items-center gap-1.5 will-change-transform"
              style={{
                transform: `translate3d(${bug.x}vw, ${bug.y}vh, 0)`,
              }}
            >
              <div
                className={`p-1.5 border-2 rounded-full shadow-[2px_2px_0px_#000000] flex items-center justify-center transition-transform ${bug.color} ${
                  bug.isZapping ? 'scale-110' : 'scale-100'
                }`}
              >
                <Bug className="w-3.5 h-3.5" />
              </div>

              {bug.isZapping && (
                <div className="flex items-center gap-1.5 bg-[#07151e]/95 text-white text-[10px] font-mono font-bold px-2 py-0.5 border-2 border-black rounded-xl shadow-[2px_2px_0px_#000000]">
                  <Sparkles className="w-3 h-3 text-yellow-300 animate-spin" />
                  <span>
                    <strong>{bug.typeLabel}:</strong> {bug.zapMessage}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
};
