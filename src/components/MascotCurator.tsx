import React, { useState, useEffect, useRef } from 'react';
import { Dices, ShieldCheck, Flame, Eye, EyeOff } from 'lucide-react';
import { MascotSupervisorEngine } from '../utils/mascotSupervisorEngine';

export type MascotState = 'IDLE' | 'WALKING' | 'CLIMBING' | 'INSPECTING' | 'ANNOYED' | 'CELEBRATING' | 'DRAGGING';

const TRASH_REACTIONS = [
  "Naw this trash! 🗑️",
  "Mid... keep scrolling 🥱",
  "Nah, not feeling this one 🛑",
  "Pure generic filler, pass! 🏃",
  "Who approved this show? 💀"
];

const HYPED_REACTIONS = [
  "YEAH! This stuff right here! 🔥",
  "FOUND THE GRAIL! 🏆",
  "Now THIS is peak animation! 🍿",
  "10/10 masterpiece, absolute heat! ✨",
  "Stop right here, this is the one! 💥"
];

export interface MascotCuratorProps {
  isVisible: boolean;
}

export const MascotCurator: React.FC<MascotCuratorProps> = ({ isVisible }) => {
  const [botState, setBotState] = useState<MascotState>('IDLE');
  const [speechText, setSpeechText] = useState<string>("Hey! Drag me or click me to pick a show!");

  // Direct GPU DOM Refs
  const mascotRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const leftFootRef = useRef<HTMLDivElement>(null);
  const rightFootRef = useRef<HTMLDivElement>(null);
  const leftArmRef = useRef<HTMLDivElement>(null);
  const rightArmRef = useRef<HTMLDivElement>(null);

  // Physics State Registers
  const posRef = useRef({ x: window.innerWidth * 0.8, y: window.innerHeight * 0.85 });
  const targetRef = useRef({ x: window.innerWidth * 0.8, y: window.innerHeight * 0.85 });
  const velRef = useRef({ x: 0, y: 0 });
  const facingLeftRef = useRef<boolean>(true);
  const stateRef = useRef<MascotState>('IDLE');
  const stepCycleRef = useRef<number>(0);
  const requestRef = useRef<number | null>(null);

  // Dragging State Refs
  const isDraggingRef = useRef<boolean>(false);
  const dragOffsetRef = useRef({ x: 0, y: 0 });

  // 🛡️ Supervisor Monitor Loop: Auto Un-stuck
  useEffect(() => {
    const supervisorInterval = setInterval(() => {
      MascotSupervisorEngine.verifyMascotLiveness(stateRef.current, () => {
        stateRef.current = 'IDLE';
        setBotState('IDLE');
        posRef.current = { x: window.innerWidth * 0.8, y: window.innerHeight * 0.85 };
        targetRef.current = { x: window.innerWidth * 0.8, y: window.innerHeight * 0.85 };
        setSpeechText("Supervisor fixed me! All good to go! 🛡️");
      });
    }, 4000);

    return () => clearInterval(supervisorInterval);
  }, []);

  // 60 FPS Camera-Tracking Physics Loop
  useEffect(() => {
    const animate = () => {
      MascotSupervisorEngine.safeExecute('PhysicsLoop', () => {
        if (!isDraggingRef.current) {
          const dx = targetRef.current.x - posRef.current.x;
          const dy = targetRef.current.y - posRef.current.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance > 3) {
            // Slower, intentional walking physics (0.015 accel = smooth step stride)
            const accel = stateRef.current === 'CLIMBING' ? 0.02 : 0.015;
            velRef.current.x += dx * accel;
            velRef.current.y += dy * accel;

            // Friction
            velRef.current.x *= 0.72;
            velRef.current.y *= 0.72;

            posRef.current.x += velRef.current.x;
            posRef.current.y += velRef.current.y;

            if (Math.abs(dx) > 1) {
              facingLeftRef.current = dx < 0;
            }

            // Stepcycle kinematics for realistic foot stride
            stepCycleRef.current += 0.18;
            const footY = Math.sin(stepCycleRef.current) * 12;
            const bounceY = Math.abs(Math.sin(stepCycleRef.current)) * 6;
            const armAngle = Math.cos(stepCycleRef.current) * 25;

            // Apply Step Kinematics
            if (leftFootRef.current) leftFootRef.current.style.transform = `translate3d(0, ${-Math.max(0, footY)}px, 0)`;
            if (rightFootRef.current) rightFootRef.current.style.transform = `translate3d(0, ${-Math.max(0, -footY)}px, 0)`;
            if (bodyRef.current) bodyRef.current.style.transform = `translate3d(0, ${-bounceY}px, 0) scaleX(${facingLeftRef.current ? 1 : -1})`;
            if (leftArmRef.current) leftArmRef.current.style.transform = `rotate(${armAngle}deg)`;
            if (rightArmRef.current) rightArmRef.current.style.transform = `rotate(${-armAngle}deg)`;
          } else {
            // Plant feet firmly on ground when stopped
            if (leftFootRef.current) leftFootRef.current.style.transform = `translate3d(0,0,0)`;
            if (rightFootRef.current) rightFootRef.current.style.transform = `translate3d(0,0,0)`;
            if (bodyRef.current) bodyRef.current.style.transform = `translate3d(0,0,0) scaleX(${facingLeftRef.current ? 1 : -1})`;
          }
        }

        // Apply GPU transform position matrix
        if (mascotRef.current) {
          mascotRef.current.style.transform = `translate3d(${posRef.current.x}px, ${posRef.current.y}px, 0)`;
        }
      }, null);

      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  // 🖱️ DRAGGING HANDLERS
  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    stateRef.current = 'DRAGGING';
    setBotState('DRAGGING');
    setSpeechText("Whoa! You're carrying me! 🪂");

    dragOffsetRef.current = {
      x: e.clientX - posRef.current.x,
      y: e.clientY - posRef.current.y,
    };

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!isDraggingRef.current) return;
      posRef.current = {
        x: moveEvent.clientX - dragOffsetRef.current.x,
        y: moveEvent.clientY - dragOffsetRef.current.y,
      };
      targetRef.current = { ...posRef.current };
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
      stateRef.current = 'IDLE';
      setBotState('IDLE');
      setSpeechText("Landed safely! Click me to start walking!");
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // Main Action Routine with Camera Following
  const triggerCuratorRoutine = () => {
    if (stateRef.current !== 'IDLE') return;

    MascotSupervisorEngine.performSystemWideBotHealing();

    const showCards = document.querySelectorAll('.show-card, [data-show-poster], #show-poster, img');

    if (!showCards || showCards.length === 0) {
      setSpeechText("Yeah bro stop asking me! Can't find any shows on this screen! 😤");
      stateRef.current = 'ANNOYED';
      setBotState('ANNOYED');
      setTimeout(() => {
        stateRef.current = 'IDLE';
        setBotState('IDLE');
      }, 4000);
      return;
    }

    const chosenElement = showCards[Math.floor(Math.random() * showCards.length)];
    
    // Smoothly scroll the card into center view ONCE natively (highly performant, separate thread)
    chosenElement.scrollIntoView({ behavior: 'smooth', block: 'center' });

    // Wait 800ms for smooth scroll to finish, then sample exact viewport coordinates
    setTimeout(() => {
      const cardRect = chosenElement.getBoundingClientRect();
      const targetX = cardRect.left + cardRect.width / 2;
      const targetY = cardRect.top - 10; // Planted right on top of card in viewport space

      // PHASE 1: Walk to bottom area under Card
      stateRef.current = 'WALKING';
      setBotState('WALKING');
      targetRef.current = { x: targetX, y: window.innerHeight * 0.85 };
      setSpeechText("Walking over to inspect this show... 🏃");

      // PHASE 2: Climb onto Card
      setTimeout(() => {
        stateRef.current = 'CLIMBING';
        setBotState('CLIMBING');
        // Recalculate target coordinates in case the user scrolled slightly in the meantime
        const freshRect = chosenElement.getBoundingClientRect();
        const freshTargetX = freshRect.left + freshRect.width / 2;
        const freshTargetY = freshRect.top - 10;
        targetRef.current = { x: freshTargetX, y: freshTargetY };
        setSpeechText("Climbing onto the show frame... 🧗");

        // PHASE 3: Stand & Inspect for 15 SECONDS
        setTimeout(() => {
          stateRef.current = 'INSPECTING';
          setBotState('INSPECTING');
          const trashQuote = TRASH_REACTIONS[Math.floor(Math.random() * TRASH_REACTIONS.length)];
          setSpeechText(trashQuote);

          (chosenElement as HTMLElement).style.outline = '4px solid #ff4444';

          // ⏱️ 15 SECONDS INSPECTION
          setTimeout(() => {
            (chosenElement as HTMLElement).style.outline = 'none';

            // PHASE 4: Walk to Next
            stateRef.current = 'WALKING';
            setBotState('WALKING');
            const walkAwayRect = chosenElement.getBoundingClientRect();
            const walkAwayX = walkAwayRect.left + walkAwayRect.width / 2;
            const walkAwayY = walkAwayRect.top - 10;
            targetRef.current = { x: Math.min(window.innerWidth - 100, walkAwayX + 180), y: walkAwayY };
            setSpeechText("Let me check the next card real quick...");

            // PHASE 5: Stand & Celebrate for 15 SECONDS
            setTimeout(() => {
              stateRef.current = 'CELEBRATING';
              setBotState('CELEBRATING');
              const winnerQuote = HYPED_REACTIONS[Math.floor(Math.random() * HYPED_REACTIONS.length)];
              setSpeechText(winnerQuote);

              // ⏱️ 15 SECONDS CELEBRATION
              setTimeout(() => {
                // PHASE 6: Walk Back to general standing area in viewport
                stateRef.current = 'WALKING';
                setBotState('WALKING');
                targetRef.current = { x: window.innerWidth * 0.8, y: window.innerHeight * 0.85 };
                setSpeechText("Heading back down! Click me whenever!");

                setTimeout(() => {
                  stateRef.current = 'IDLE';
                  setBotState('IDLE');
                }, 5000);
              }, 15000);
            }, 4000);
          }, 15000);
        }, 4000);
      }, 4000);
    }, 800);
  };

  const triggerRef = useRef(triggerCuratorRoutine);
  triggerRef.current = triggerCuratorRoutine;

  useEffect(() => {
    (window as any).__triggerMascotCurator = () => {
      triggerRef.current();
    };
    return () => {
      delete (window as any).__triggerMascotCurator;
    };
  }, []);

  useEffect(() => {
    (window as any).__isMascotIdle = (botState === 'IDLE' || botState === 'ANNOYED');
    return () => {
      delete (window as any).__isMascotIdle;
    };
  }, [botState]);

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden font-sans">
      
      {/* RENDER DRAGGABLE MASCOT WHEN VISIBLE */}
      {isVisible && (
        <div
          ref={mascotRef}
          onMouseDown={handleMouseDown}
          className="absolute top-0 left-0 pointer-events-auto cursor-grab active:cursor-grabbing flex flex-col items-center will-change-transform select-none"
          style={{ transform: `translate3d(${posRef.current.x}px, ${posRef.current.y}px, 0)` }}
        >
          {/* Un-Mirrored Speech Bubble */}
          <div className="mb-3 px-4 py-2 bg-white text-black font-black text-xs rounded-2xl border-2 border-black shadow-[4px_4px_0px_#000000] whitespace-nowrap animate-bounce max-w-xs text-center relative z-20">
            {speechText}
            <div className="w-2.5 h-2.5 bg-white border-b-2 border-r-2 border-black rotate-45 absolute -bottom-1.5 left-1/2 -translate-x-1/2" />
          </div>

          {/* Cartoon Character Body */}
          <div
            ref={bodyRef}
            className="relative w-20 h-28 flex flex-col items-center will-change-transform origin-bottom"
          >
            {/* Floppy Ears */}
            <div className="absolute -top-3 w-16 flex justify-between px-1 z-0">
              <div className="w-3 h-6 bg-[#00f2fe] border-2 border-black rounded-full -rotate-12" />
              <div className="w-3 h-6 bg-[#00f2fe] border-2 border-black rounded-full rotate-12" />
            </div>

            {/* Head */}
            <div className="relative w-14 h-14 bg-[#00f2fe] border-2 border-black rounded-3xl shadow-[3px_3px_0px_#000000] flex flex-col items-center justify-center z-10 overflow-hidden">
              <div className="flex gap-2">
                <div className="w-3.5 h-5 bg-white border-2 border-black rounded-full flex items-center justify-center relative">
                  <div className="w-1.5 h-2 bg-black rounded-full" />
                </div>
                <div className="w-3.5 h-5 bg-white border-2 border-black rounded-full flex items-center justify-center relative">
                  <div className="w-1.5 h-2 bg-black rounded-full" />
                </div>
              </div>
              <div className="w-4 h-1.5 border-b-2 border-black rounded-full mt-1" />
            </div>

            {/* Hoodie Body */}
            <div className="relative w-12 h-9 bg-yellow-400 border-2 border-black rounded-2xl mt-[-4px] flex items-center justify-between px-1 z-10 shadow-[2px_2px_0px_#000000]">
              <div
                ref={leftArmRef}
                className="w-3 h-7 bg-white border-2 border-black rounded-full origin-top flex items-end justify-center pb-0.5"
              >
                <div className="w-2 h-2 bg-black rounded-full" />
              </div>

              <Flame className="w-4 h-4 text-orange-500 animate-pulse" />

              <div
                ref={rightArmRef}
                className="w-3 h-7 bg-white border-2 border-black rounded-full origin-top flex items-end justify-center pb-0.5"
              >
                <div className="w-2 h-2 bg-black rounded-full" />
              </div>
            </div>

            {/* Sneakers */}
            <div className="flex gap-3 mt-[-2px] relative w-full justify-center z-0">
              <div
                ref={leftFootRef}
                className="w-6 h-4 bg-red-500 border-2 border-black rounded-xl shadow-[2px_2px_0px_#000000] flex items-center justify-start px-0.5"
              >
                <div className="w-1.5 h-2 bg-white rounded-sm border border-black" />
              </div>

              <div
                ref={rightFootRef}
                className="w-6 h-4 bg-red-500 border-2 border-black rounded-xl shadow-[2px_2px_0px_#000000] flex items-center justify-start px-0.5"
              >
                <div className="w-1.5 h-2 bg-white rounded-sm border border-black" />
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
