import React, { useState, useEffect, useRef } from 'react';
import { Zap, ChevronRight, Sparkles, Swords, Flame, ShieldAlert, Cpu, Crosshair, Target } from 'lucide-react';

interface SplashScreenProps {
  onComplete: () => void;
  onSkip?: () => void;
  autoPlay?: boolean;
  durationSeconds?: number;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onComplete,
  onSkip,
  autoPlay = true
}) => {
  // 4-Second Sequence Phases:
  // 0.0s - 0.7s: dropSlam (X and 2 drop from top and slam together)
  // 0.7s - 1.5s: lightningStrike (Lightning hits the middle, sketch warrior army charges and clashes)
  // 1.5s - 2.8s: showsConnect (SHOWS rushes in and snaps into TOON, warriors locked in full running combat)
  // 2.8s - 4.0s: vortexExit (Left army sucked to top-left, right army sucked to bottom-right, screen blasts out)
  // 4.0s: finished (Clean transition to main UI)
  const [phase, setPhase] = useState<'dropSlam' | 'lightningStrike' | 'showsConnect' | 'vortexExit' | 'finished'>('dropSlam');
  const [progress, setProgress] = useState<number>(0);
  const [isExiting, setIsExiting] = useState<boolean>(false);
  const [voltageCounter, setVoltageCounter] = useState<number>(940000);
  const timerRef = useRef<NodeJS.Timeout[]>([]);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const startTime = Date.now();
    const duration = 4000; // Exactly 4.0 seconds

    progressIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.round((elapsed / duration) * 100));
      setProgress(pct);
      setVoltageCounter(Math.floor(950000 + Math.random() * 350000));
    }, 40);

    const t1 = setTimeout(() => {
      setPhase('lightningStrike');
    }, 700);

    const t2 = setTimeout(() => {
      setPhase('showsConnect');
    }, 1500);

    const t3 = setTimeout(() => {
      setPhase('vortexExit');
      setIsExiting(true);
    }, 2800);

    const t4 = setTimeout(() => {
      setPhase('finished');
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      onComplete();
    }, 4000);

    timerRef.current = [t1, t2, t3, t4];

    return () => {
      timerRef.current.forEach(clearTimeout);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, [onComplete]);

  const handleManualSkip = () => {
    setIsExiting(true);
    timerRef.current.forEach(clearTimeout);
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    setTimeout(() => {
      setPhase('finished');
      if (onSkip) {
        onSkip();
      } else {
        onComplete();
      }
    }, 250);
  };

  if (phase === 'finished') {
    return null;
  }

  return (
    <div
      id="x2-cinematic-splash-overlay"
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center select-none overflow-hidden transition-opacity duration-300 ${
        isExiting && phase === 'vortexExit' ? 'opacity-100' : 'opacity-100'
      } ${phase === 'dropSlam' || phase === 'lightningStrike' ? 'splash-screen-shake' : ''}`}
      style={{
        backgroundColor: '#020609',
        fontFamily: "'Fredoka', 'Nunito', sans-serif"
      }}
    >
      {/* BACKGROUND CYBER-INDUSTRIAL GRID & SHUTTERS */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Angular Matrix Grid Overlay */}
        <div 
          className="absolute inset-0 opacity-15"
          style={{
            backgroundImage: `linear-gradient(#00f2fe 1px, transparent 1px), linear-gradient(90deg, #00f2fe 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }}
        />

        {/* Top Heavy Shutter Door */}
        <div 
          className={`absolute top-0 left-0 right-0 h-1/2 z-10 overflow-hidden pointer-events-none ${
            phase === 'vortexExit' ? 'splash-shutter-exit-top' : 'splash-shutter-top'
          }`}
          style={{
            background: 'linear-gradient(180deg, #020609 0%, #03141f 75%, #052335 100%)',
            borderBottom: '3px solid #00f2fe',
            boxShadow: '0 10px 40px rgba(0, 242, 254, 0.4)'
          }}
        >
          <div className="absolute top-4 left-6 flex items-center gap-2 text-[10px] font-mono font-black text-[#00f2fe] tracking-widest uppercase">
            <span className="w-2 h-2 bg-[#00f2fe] shadow-[0_0_8px_#00f2fe]" />
            <span>HYDRAULIC_CHASSIS // 4.0s_BURST</span>
          </div>

          <div className="absolute top-4 right-6 flex items-center gap-2 text-[10px] font-mono font-black text-[#7dd3fc] tracking-widest">
            <Zap className="w-3.5 h-3.5 text-[#00f2fe] animate-pulse" />
            <span>{voltageCounter.toLocaleString()}V DETONATION</span>
          </div>
        </div>

        {/* Bottom Heavy Shutter Door */}
        <div 
          className={`absolute bottom-0 left-0 right-0 h-1/2 z-10 overflow-hidden pointer-events-none ${
            phase === 'vortexExit' ? 'splash-shutter-exit-bottom' : 'splash-shutter-bottom'
          }`}
          style={{
            background: 'linear-gradient(0deg, #020609 0%, #03141f 75%, #052335 100%)',
            borderTop: '3px solid #00f2fe',
            boxShadow: '0 -10px 40px rgba(0, 242, 254, 0.4)'
          }}
        >
          <div className="absolute bottom-4 left-6 flex items-center gap-2 text-[10px] font-mono font-black text-[#00f2fe] tracking-widest uppercase">
            <span className="w-2 h-2 bg-[#00f2fe] shadow-[0_0_8px_#00f2fe]" />
            <span>SAKUGA_WARRIORS // RUNNING_CHARGE // DUAL_VORTEX_EXIT</span>
          </div>
        </div>
      </div>

      {/* 2.8s – 4.0s: TWO OPPOSITE DIRECTION VORTEX RIFTS (Top-Left & Bottom-Right) */}
      <div 
        className={`absolute -top-28 -left-28 w-96 h-96 z-20 pointer-events-none transition-all duration-700 ${
          phase === 'vortexExit' ? 'opacity-100 scale-150' : 'opacity-0 scale-50'
        }`}
      >
        <div className="w-full h-full border-4 border-dashed border-[#00f2fe] animate-[spin_1.2s_linear_infinite] shadow-[0_0_80px_#00f2fe]" />
        <div className="absolute inset-6 border-4 border-dotted border-white animate-[spin_0.8s_linear_infinite_reverse]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[11px] font-mono font-black text-[#00f2fe] bg-[#020609] px-2.5 py-1 border border-[#00f2fe] whitespace-nowrap shadow-[0_0_15px_#00f2fe]">
          ◄◄ GRAVITY VORTEX 01 [TOP-LEFT]
        </div>
      </div>

      <div 
        className={`absolute -bottom-28 -right-28 w-96 h-96 z-20 pointer-events-none transition-all duration-700 ${
          phase === 'vortexExit' ? 'opacity-100 scale-150' : 'opacity-0 scale-50'
        }`}
      >
        <div className="w-full h-full border-4 border-dashed border-[#38bdf8] animate-[spin_1.2s_linear_infinite_reverse] shadow-[0_0_80px_#38bdf8]" />
        <div className="absolute inset-6 border-4 border-dotted border-[#00f2fe] animate-[spin_0.8s_linear_infinite]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[11px] font-mono font-black text-[#38bdf8] bg-[#020609] px-2.5 py-1 border border-[#38bdf8] whitespace-nowrap shadow-[0_0_15px_#38bdf8]">
          GRAVITY VORTEX 02 [BOTTOM-RIGHT] ►►
        </div>
      </div>

      {/* 0.7s+: MASSIVE CENTRAL LIGHTNING STRIKE HITTING THE MIDDLE */}
      <div 
        className={`absolute inset-0 z-25 pointer-events-none flex items-center justify-center transition-opacity duration-200 ${
          phase === 'dropSlam' ? 'opacity-0' : 'opacity-100'
        }`}
      >
        {/* Main Central Lightning Strike Bolt directly through the center intersection */}
        <svg 
          className="absolute w-full h-full stroke-[#00f2fe] stroke-[4px] fill-none anim-center-lightning"
          viewBox="0 0 1000 600"
          preserveAspectRatio="none"
        >
          {/* Top to Bottom vertical lightning blast hitting the middle (500, 300) */}
          <path d="M 500 0 L 485 100 L 525 180 L 475 250 L 500 300 L 460 380 L 535 460 L 490 530 L 500 600" />
          {/* Cross horizontal jagged arcs */}
          <path d="M 100 300 L 250 285 L 380 320 L 500 300 L 620 280 L 760 325 L 900 300" />
        </svg>

        {/* High-Voltage Flash Strobe Overlay */}
        <div className="absolute inset-0 splash-lightning-flash" />

        {/* Center Shockwave Spark Line */}
        <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 h-[3px] electric-spark-line" />
      </div>

      {/* =========================================================================
          HIGHLY ANIMATED SKETCH WARRIORS (NO BOXES) RUNNING AT EACH OTHER
          + FLOATING HUD BOXES WAY ABOVE FOLLOWING THEM
          + TWO COMPLETELY DIFFERENT VORTEX SUCTION EXITS
         ========================================================================= */}

      {/* 1. LEFT SKETCH ARMY (CHARGING RIGHT TOWARDS CENTER, SUCKED TO TOP-LEFT) */}
      <div 
        className={`absolute left-4 sm:left-12 md:left-24 top-1/2 -translate-y-1/2 z-35 flex flex-col items-start gap-5 pointer-events-none ${
          phase === 'vortexExit' ? 'anim-suction-topleft' : 'anim-warrior-charge-left'
        } ${phase === 'dropSlam' ? 'opacity-0' : 'opacity-100'}`}
      >
        {/* FLOATING HUD BOX WAY ABOVE FOLLOWING THE LEFT ARMY */}
        <div className="anim-hud-float-left mb-2 self-start flex flex-col gap-1">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#02131d]/95 border-2 border-[#00f2fe] shadow-[0_0_20px_rgba(0,242,254,0.6)] backdrop-blur-md">
            <Swords className="w-4 h-4 text-[#00f2fe] animate-pulse" />
            <span className="text-[11px] font-mono font-black text-[#00f2fe] tracking-wider uppercase">
              ⚡ VANGUARD FORCES [120 FPS CHARGE]
            </span>
            <span className="w-2 h-2 rounded-full bg-[#00f2fe] animate-ping" />
          </div>
          {/* Realtime Combat Gauge */}
          <div className="flex items-center gap-1.5 text-[9px] font-mono font-bold text-[#7dd3fc] px-2 py-0.5 bg-[#020609]/80 border border-[#00f2fe]/40">
            <span>DPS: 948,200</span>
            <span>//</span>
            <span>KATANA OVERDRIVE: 100%</span>
          </div>
        </div>

        {/* SKETCH WARRIORS CONTAINER: NO WRAPPER BOXES, FREE-STANDING RUNNING CHARACTERS */}
        <div className="flex flex-col gap-5 items-start pl-2">
          
          {/* Fighter 1: Sketch Cyber Ronin sprinting forward with Katana slash */}
          <div className="relative flex items-center gap-3 anim-warrior-fighter-1">
            {/* Sketch Warrior SVG with animated running legs and glowing energy blade */}
            <svg 
              width="68" 
              height="64" 
              viewBox="0 0 70 65" 
              className="stroke-[#00f2fe] stroke-[2.5px] fill-none overflow-visible filter drop-shadow-[0_0_10px_#00f2fe]"
            >
              {/* Leaning Forward Sprint Torso */}
              <line x1="32" y1="20" x2="38" y2="40" stroke="#ffffff" strokeWidth="3" />
              
              {/* Armored Helmet / Head with Cyber Crest */}
              <polygon points="34,8 44,18 24,18" stroke="#ffffff" fill="#00f2fe" fillOpacity="0.4" />
              <circle cx="34" cy="14" r="3" fill="#ffffff" />

              {/* Running Legs Sprint Cycle */}
              <g className="anim-running-legs-a">
                <line x1="38" y1="40" x2="54" y2="52" strokeWidth="3" />
                <line x1="54" y1="52" x2="62" y2="60" strokeWidth="2.5" stroke="#ffffff" />
              </g>
              <g className="anim-running-legs-b">
                <line x1="38" y1="40" x2="20" y2="50" strokeWidth="3" />
                <line x1="20" y1="50" x2="10" y2="58" strokeWidth="2.5" stroke="#ffffff" />
              </g>

              {/* Leading Arm Swinging Huge Energy Katana Rightwards */}
              <line x1="33" y1="24" x2="48" y2="22" strokeWidth="3" />
              <line x1="48" y1="22" x2="72" y2="10" stroke="#ffffff" strokeWidth="4" />

              {/* Energy Katana Slash Trail Arc */}
              <path 
                d="M 45 4 Q 75 14 65 38" 
                stroke="#00f2fe" 
                strokeWidth="3" 
                strokeDasharray="4 2" 
                className="sketch-spark-burst" 
              />
              
              {/* Charging Wind Speed Lines behind character */}
              <line x1="12" y1="26" x2="-8" y2="26" stroke="#00f2fe" strokeWidth="1.5" strokeDasharray="3 3" />
              <line x1="16" y1="36" x2="-4" y2="36" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="3 3" />
            </svg>

            {/* Combat Name Tag & Status Callout */}
            <div className="flex flex-col">
              <div className="flex items-center gap-1">
                <span className="text-xs font-black text-white tracking-wider drop-shadow-[0_0_8px_#00f2fe]">CYBER RONIN</span>
                <span className="text-[9px] px-1 py-0.2 bg-[#00f2fe] text-[#020609] font-black tracking-widest uppercase">SLASH!</span>
              </div>
              <span className="text-[9px] font-mono text-[#7dd3fc]">CHARGING CENTER ◄◄</span>
            </div>
          </div>

          {/* Fighter 2: Sketch Shock Brawler sprinting with rapid fist barrage */}
          <div className="relative flex items-center gap-3 anim-warrior-fighter-2">
            <svg 
              width="68" 
              height="64" 
              viewBox="0 0 70 65" 
              className="stroke-[#38bdf8] stroke-[2.5px] fill-none overflow-visible filter drop-shadow-[0_0_10px_#38bdf8]"
            >
              {/* Leaning Forward Torso */}
              <line x1="30" y1="22" x2="38" y2="40" stroke="#38bdf8" strokeWidth="3" />
              
              {/* Head with Visor */}
              <rect x="24" y="10" width="16" height="12" stroke="#ffffff" fill="#38bdf8" fillOpacity="0.4" />
              
              {/* Running Legs Sprint Cycle */}
              <g className="anim-running-legs-b">
                <line x1="38" y1="40" x2="52" y2="52" strokeWidth="3" />
                <line x1="52" y1="52" x2="60" y2="59" strokeWidth="2.5" stroke="#ffffff" />
              </g>
              <g className="anim-running-legs-a">
                <line x1="38" y1="40" x2="22" y2="48" strokeWidth="3" />
                <line x1="22" y1="48" x2="14" y2="58" strokeWidth="2.5" stroke="#ffffff" />
              </g>

              {/* High Voltage Punching Arms Charging Forward */}
              <line x1="32" y1="24" x2="58" y2="20" strokeWidth="3.5" stroke="#ffffff" />
              <line x1="32" y1="28" x2="52" y2="34" strokeWidth="3.5" stroke="#00f2fe" />

              {/* Shockwave Fist Impact Sparks */}
              <polygon points="60,16 68,20 60,24 64,20" fill="#00f2fe" stroke="none" className="sketch-spark-burst" />
              
              {/* Speed Lines */}
              <line x1="14" y1="22" x2="-6" y2="22" stroke="#00f2fe" strokeWidth="1.5" strokeDasharray="3 3" />
            </svg>

            <div className="flex flex-col">
              <div className="flex items-center gap-1">
                <span className="text-xs font-black text-white tracking-wider drop-shadow-[0_0_8px_#38bdf8]">SHOCK BRAWLER</span>
                <span className="text-[9px] px-1 py-0.2 bg-[#38bdf8] text-[#020609] font-black tracking-widest uppercase">POW!</span>
              </div>
              <span className="text-[9px] font-mono text-[#7dd3fc]">VOLTAGE FIST ◄◄</span>
            </div>
          </div>

          {/* Fighter 3: Shadow Ninja leaping forward with Twin Shurikens */}
          <div className="relative flex items-center gap-3 anim-warrior-fighter-3">
            <svg 
              width="68" 
              height="64" 
              viewBox="0 0 70 65" 
              className="stroke-[#00f2fe] stroke-[2.5px] fill-none overflow-visible filter drop-shadow-[0_0_10px_#00f2fe]"
            >
              {/* Mid-air Jump Lean */}
              <line x1="28" y1="20" x2="36" y2="38" stroke="#ffffff" strokeWidth="3" />
              
              {/* Masked Head */}
              <circle cx="28" cy="14" r="7" stroke="#ffffff" fill="#00f2fe" fillOpacity="0.4" />
              
              {/* Aerial Combat Legs */}
              <line x1="36" y1="38" x2="52" y2="44" strokeWidth="3" />
              <line x1="36" y1="38" x2="20" y2="54" strokeWidth="3" />

              {/* Shuriken Throwing Arms */}
              <line x1="30" y1="22" x2="56" y2="16" strokeWidth="3" stroke="#ffffff" />
              
              {/* Spinning Energy Shuriken */}
              <polygon points="62,12 66,16 62,20 58,16" fill="#00f2fe" stroke="#ffffff" className="sketch-spark-burst" />

              {/* Speed Lines */}
              <line x1="10" y1="18" x2="-10" y2="18" stroke="#00f2fe" strokeWidth="1.5" strokeDasharray="3 3" />
            </svg>

            <div className="flex flex-col">
              <div className="flex items-center gap-1">
                <span className="text-xs font-black text-white tracking-wider drop-shadow-[0_0_8px_#00f2fe]">SHADOW NINJA</span>
                <span className="text-[9px] px-1 py-0.2 bg-[#00f2fe] text-[#020609] font-black tracking-widest uppercase">STRIKE!</span>
              </div>
              <span className="text-[9px] font-mono text-[#7dd3fc]">AERIAL DASH ◄◄</span>
            </div>
          </div>

        </div>
      </div>

      {/* 2. RIGHT SKETCH ARMY (CHARGING LEFT TOWARDS CENTER, SUCKED TO BOTTOM-RIGHT) */}
      <div 
        className={`absolute right-4 sm:right-12 md:right-24 top-1/2 -translate-y-1/2 z-35 flex flex-col items-end gap-5 pointer-events-none ${
          phase === 'vortexExit' ? 'anim-suction-bottomright' : 'anim-warrior-charge-right'
        } ${phase === 'dropSlam' ? 'opacity-0' : 'opacity-100'}`}
      >
        {/* FLOATING HUD BOX WAY ABOVE FOLLOWING THE RIGHT ARMY */}
        <div className="anim-hud-float-right mb-2 self-end flex flex-col items-end gap-1">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#02131d]/95 border-2 border-[#38bdf8] shadow-[0_0_20px_rgba(56,189,248,0.6)] backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-[#38bdf8] animate-ping" />
            <span className="text-[11px] font-mono font-black text-[#38bdf8] tracking-wider uppercase">
              ⚡ ASSAULT DIVISION [1.21 GW CLASH]
            </span>
            <Flame className="w-4 h-4 text-[#38bdf8] animate-pulse" />
          </div>
          {/* Realtime Combat Gauge */}
          <div className="flex items-center gap-1.5 text-[9px] font-mono font-bold text-[#7dd3fc] px-2 py-0.5 bg-[#020609]/80 border border-[#38bdf8]/40">
            <span>VOLTAGE: 1,210,000V</span>
            <span>//</span>
            <span>CLASH STATUS: ACTIVE</span>
          </div>
        </div>

        {/* SKETCH WARRIORS CONTAINER: NO WRAPPER BOXES, FREE-STANDING RUNNING CHARACTERS */}
        <div className="flex flex-col gap-5 items-end pr-2">
          
          {/* Fighter 4: Sketch Thunder Knight charging left with Energy Lance */}
          <div className="relative flex items-center gap-3 anim-warrior-fighter-4">
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-1">
                <span className="text-[9px] px-1 py-0.2 bg-[#00f2fe] text-[#020609] font-black tracking-widest uppercase">THRUST!</span>
                <span className="text-xs font-black text-white tracking-wider drop-shadow-[0_0_8px_#00f2fe]">THUNDER KNIGHT</span>
              </div>
              <span className="text-[9px] font-mono text-[#7dd3fc]">►► CHARGING CENTER</span>
            </div>

            <svg 
              width="68" 
              height="64" 
              viewBox="0 0 70 65" 
              className="stroke-[#00f2fe] stroke-[2.5px] fill-none overflow-visible filter drop-shadow-[0_0_10px_#00f2fe]"
            >
              {/* Leaning Forward Leftwards Sprint Torso */}
              <line x1="38" y1="20" x2="32" y2="40" stroke="#ffffff" strokeWidth="3" />
              
              {/* Horned Helmet */}
              <polygon points="36,8 26,18 46,18" stroke="#ffffff" fill="#00f2fe" fillOpacity="0.4" />
              <line x1="26" y1="8" x2="36" y2="14" />
              <line x1="46" y1="8" x2="36" y2="14" />

              {/* Running Legs Sprint Cycle */}
              <g className="anim-running-legs-a">
                <line x1="32" y1="40" x2="16" y2="52" strokeWidth="3" />
                <line x1="16" y1="52" x2="8" y2="60" strokeWidth="2.5" stroke="#ffffff" />
              </g>
              <g className="anim-running-legs-b">
                <line x1="32" y1="40" x2="50" y2="50" strokeWidth="3" />
                <line x1="50" y1="50" x2="60" y2="58" strokeWidth="2.5" stroke="#ffffff" />
              </g>

              {/* Huge Energy Lance Thrusting Leftwards into Center */}
              <line x1="37" y1="24" x2="-2" y2="24" stroke="#ffffff" strokeWidth="3.5" />
              <polygon points="-2,24 6,19 6,29" fill="#00f2fe" stroke="none" className="sketch-spark-burst" />

              {/* Speed Lines */}
              <line x1="58" y1="24" x2="78" y2="24" stroke="#00f2fe" strokeWidth="1.5" strokeDasharray="3 3" />
              <line x1="54" y1="34" x2="74" y2="34" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="3 3" />
            </svg>
          </div>

          {/* Fighter 5: Dual Blade Assassin sprinting left with twin spinning daggers */}
          <div className="relative flex items-center gap-3 anim-warrior-fighter-5">
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-1">
                <span className="text-[9px] px-1 py-0.2 bg-[#38bdf8] text-[#020609] font-black tracking-widest uppercase">CLASH!</span>
                <span className="text-xs font-black text-white tracking-wider drop-shadow-[0_0_8px_#38bdf8]">DUAL BLADE</span>
              </div>
              <span className="text-[9px] font-mono text-[#7dd3fc]">►► TWIN DAGGER STORM</span>
            </div>

            <svg 
              width="68" 
              height="64" 
              viewBox="0 0 70 65" 
              className="stroke-[#38bdf8] stroke-[2.5px] fill-none overflow-visible filter drop-shadow-[0_0_10px_#38bdf8]"
            >
              {/* Leaning Forward Sprint Torso */}
              <line x1="38" y1="22" x2="30" y2="40" stroke="#38bdf8" strokeWidth="3" />
              
              {/* Masked Head */}
              <circle cx="38" cy="14" r="7" stroke="#ffffff" fill="#38bdf8" fillOpacity="0.4" />
              
              {/* Running Legs Sprint Cycle */}
              <g className="anim-running-legs-b">
                <line x1="30" y1="40" x2="18" y2="52" strokeWidth="3" />
                <line x1="18" y1="52" x2="10" y2="59" strokeWidth="2.5" stroke="#ffffff" />
              </g>
              <g className="anim-running-legs-a">
                <line x1="30" y1="40" x2="48" y2="48" strokeWidth="3" />
                <line x1="48" y1="48" x2="56" y2="58" strokeWidth="2.5" stroke="#ffffff" />
              </g>

              {/* Twin Daggers Slashing Leftwards */}
              <line x1="36" y1="24" x2="12" y2="16" stroke="#ffffff" strokeWidth="3" />
              <line x1="36" y1="28" x2="8" y2="34" stroke="#00f2fe" strokeWidth="3" />

              {/* Curved Spark Trails */}
              <path d="M 12 12 Q 2 24 16 32" stroke="#00f2fe" strokeWidth="2" strokeDasharray="3 2" className="sketch-spark-burst" />

              {/* Speed Lines */}
              <line x1="56" y1="20" x2="76" y2="20" stroke="#00f2fe" strokeWidth="1.5" strokeDasharray="3 3" />
            </svg>
          </div>

          {/* Fighter 6: Blaster Mecha firing photon energy beams */}
          <div className="relative flex items-center gap-3 anim-warrior-fighter-6">
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-1">
                <span className="text-[9px] px-1 py-0.2 bg-[#00f2fe] text-[#020609] font-black tracking-widest uppercase">BURST!</span>
                <span className="text-xs font-black text-white tracking-wider drop-shadow-[0_0_8px_#00f2fe]">BLASTER MECHA</span>
              </div>
              <span className="text-[9px] font-mono text-[#7dd3fc]">►► PHOTON CANNON</span>
            </div>

            <svg 
              width="68" 
              height="64" 
              viewBox="0 0 70 65" 
              className="stroke-[#00f2fe] stroke-[2.5px] fill-none overflow-visible filter drop-shadow-[0_0_10px_#00f2fe]"
            >
              {/* Armored Torso */}
              <rect x="28" y="18" width="16" height="22" stroke="#ffffff" fill="#00f2fe" fillOpacity="0.3" />
              
              {/* Visor Head */}
              <polygon points="36,8 44,18 28,18" stroke="#ffffff" fill="#38bdf8" />
              
              {/* Legs */}
              <line x1="32" y1="40" x2="20" y2="56" strokeWidth="3" />
              <line x1="40" y1="40" x2="52" y2="56" strokeWidth="3" />

              {/* High Power Blaster Arm Aiming Left */}
              <line x1="30" y1="24" x2="6" y2="24" strokeWidth="4" stroke="#ffffff" />
              <circle cx="2" cy="24" r="4" fill="#00f2fe" className="sketch-spark-burst" />

              {/* Speed Lines */}
              <line x1="56" y1="26" x2="76" y2="26" stroke="#00f2fe" strokeWidth="1.5" strokeDasharray="3 3" />
            </svg>
          </div>

        </div>
      </div>

      {/* =========================================================================
          MAIN CENTERPIECE: X & 2 DROP SLAM + LIGHTNING + SHOWS CONNECT TO TOON
         ========================================================================= */}
      <div 
        className={`relative z-40 flex flex-col items-center justify-center transition-transform duration-700 ${
          phase === 'vortexExit' ? 'splash-zoom-exit' : ''
        }`}
        style={{
          transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {/* Core Collision Stage: X slams into 2 from the Top */}
        <div className="flex items-center gap-3 sm:gap-6 flex-wrap justify-center px-4">
          
          {/* THE X2 DUAL TITANIUM CHASSIS COLLISION */}
          <div className="relative flex items-center justify-center">
            
            {/* Ambient Cyan Lightning Aura Glow */}
            <div className="absolute -inset-6 bg-gradient-to-r from-[#00f2fe] via-[#14b8a6] to-[#38bdf8] opacity-80 blur-2xl animate-pulse" />
            
            {/* The "X" Block dropping from Top-Left */}
            <div className={`relative w-16 h-20 sm:w-20 sm:h-24 md:w-24 md:h-28 bg-[#02131d] border-[3.5px] border-[#00f2fe] flex items-center justify-center shadow-[0_0_45px_rgba(0,242,254,0.8),inset_0_0_25px_rgba(0,242,254,0.5)] transform -mr-1 z-10 ${
              phase === 'dropSlam' ? 'anim-x-drop-slam' : ''
            }`}>
              <div className="absolute inset-1.5 bg-gradient-to-br from-[#052233] to-[#01090e] flex items-center justify-center overflow-hidden border border-[#00f2fe]/40">
                <span 
                  className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter text-white splash-x2-text select-none"
                  style={{
                    textShadow: '0 0 25px #00f2fe, 0 0 45px #00f2fe'
                  }}
                >
                  X
                </span>
              </div>
              {/* Corner High-Voltage Rivets */}
              <div className="absolute -top-1 -left-1 w-2.5 h-2.5 bg-[#00f2fe] shadow-[0_0_10px_#00f2fe]" />
              <div className="absolute -bottom-1 -left-1 w-2.5 h-2.5 bg-[#00f2fe] shadow-[0_0_10px_#00f2fe]" />
            </div>

            {/* Central Electric Collision Seam Spark */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-24 bg-[#ffffff] shadow-[0_0_30px_#00f2fe] z-20 pointer-events-none opacity-80" />

            {/* The "2" Block dropping from Top-Right and colliding into X */}
            <div className={`relative w-16 h-20 sm:w-20 sm:h-24 md:w-24 md:h-28 bg-[#02131d] border-[3.5px] border-[#38bdf8] flex items-center justify-center shadow-[0_0_45px_rgba(56,189,248,0.8),inset_0_0_25px_rgba(56,189,248,0.5)] transform -ml-1 z-10 ${
              phase === 'dropSlam' ? 'anim-two-drop-slam' : ''
            }`}>
              <div className="absolute inset-1.5 bg-gradient-to-bl from-[#052233] to-[#01090e] flex items-center justify-center overflow-hidden border border-[#38bdf8]/40">
                <span 
                  className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter text-[#00f2fe] splash-x2-text select-none"
                  style={{
                    textShadow: '0 0 25px #00f2fe, 0 0 45px #38bdf8'
                  }}
                >
                  2
                </span>
              </div>
              {/* Corner High-Voltage Rivets */}
              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#38bdf8] shadow-[0_0_10px_#38bdf8]" />
              <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-[#38bdf8] shadow-[0_0_10px_#38bdf8]" />
            </div>

          </div>

          {/* SHOWS RUSHES IN AND CONNECTS INTO TOON */}
          <div className="flex flex-col items-start justify-center overflow-visible">
            
            <div className="flex items-center gap-2 sm:gap-3 py-1">
              
              {/* "SHOWS" rushing in from left */}
              <div 
                className={`text-4xl sm:text-5xl md:text-6xl font-black tracking-wider text-white drop-shadow-[0_2px_20px_rgba(0,242,254,0.6)] ${
                  phase === 'showsConnect' || phase === 'vortexExit' ? 'anim-shows-rush opacity-100' : 'opacity-0 translate-x-[-80px]'
                }`}
              >
                SHOWS
              </div>

              {/* "TOON" connecting and locking in with shockwave */}
              <div 
                className={`text-4xl sm:text-5xl md:text-6xl font-black tracking-wider text-[#00f2fe] drop-shadow-[0_0_30px_#00f2fe] ${
                  phase === 'showsConnect' || phase === 'vortexExit' ? 'anim-toon-snap opacity-100' : 'opacity-0 translate-x-[80px]'
                }`}
              >
                TOON
              </div>

              {/* Cyber 4K Pill Badge */}
              <span className={`px-2.5 py-1 text-[11px] sm:text-xs font-black uppercase bg-[#00f2fe]/20 border border-[#00f2fe] text-[#00f2fe] shadow-[0_0_20px_rgba(0,242,254,0.5)] hidden sm:inline-block ${
                phase === 'showsConnect' || phase === 'vortexExit' ? 'opacity-100' : 'opacity-0'
              }`}>
                ⚡ CYBER 4K
              </span>
            </div>

            {/* High-Voltage Sub-Headline Tagline */}
            <div 
              className={`flex items-center gap-2 text-xs sm:text-sm font-black text-[#7dd3fc] tracking-widest uppercase transition-all duration-500 ${
                phase === 'showsConnect' || phase === 'vortexExit' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
              }`}
            >
              <Zap className="w-4 h-4 text-[#00f2fe] animate-bounce shadow-[0_0_10px_#00f2fe]" />
              <span>LIGHTNING-CHARGED SAKUGA STREAMING PLATFORM</span>
            </div>

          </div>

        </div>

        {/* Feature Badges under Centerpiece */}
        <div 
          className={`flex items-center gap-3 mt-6 transition-all duration-500 ${
            phase === 'showsConnect' || phase === 'vortexExit' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <div className="flex items-center gap-1.5 px-3 py-1 bg-[#031822] border border-[#00f2fe]/50 text-[11px] font-black text-[#ccfbf1] shadow-[0_0_10px_rgba(0,242,254,0.2)] backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-[#00f2fe]" />
            <span>120 FPS SAKUGA</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 bg-[#031822] border border-[#00f2fe]/50 text-[11px] font-black text-[#ccfbf1] shadow-[0_0_10px_rgba(0,242,254,0.2)] backdrop-blur-md">
            <Zap className="w-3.5 h-3.5 text-[#38bdf8]" />
            <span>DOLBY ATMOS 7.1</span>
          </div>

          <div className="px-3 py-1 bg-[#00f2fe]/20 border border-[#00f2fe] text-[11px] font-black text-[#00f2fe] shadow-[0_0_15px_rgba(0,242,254,0.4)] hidden sm:inline-block">
            4K HDR UNLEASHED
          </div>
        </div>

        {/* 4.0-Second Timeline Progress Bar */}
        <div className="w-64 sm:w-88 h-2 bg-[#02131d] mt-6 overflow-hidden border border-[#00f2fe]/50 shadow-[0_0_20px_rgba(0,242,254,0.3)] relative">
          <div 
            className="h-full bg-gradient-to-r from-[#14b8a6] via-[#00f2fe] to-[#ffffff] transition-all duration-40 ease-linear shadow-[0_0_15px_#00f2fe]"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex items-center justify-between w-64 sm:w-88 mt-2 text-[10px] font-mono font-black text-[#7dd3fc]">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-[#00f2fe] animate-ping" />
            <span>X2 COLLISION // DUAL VORTEX SUCTION</span>
          </span>
          <span>{Math.min(4.0, (progress * 0.04)).toFixed(1)}s / 4.0s</span>
        </div>

      </div>

      {/* Interactive Skip Button: Bottom Right Glass Control */}
      <div className="absolute bottom-6 right-6 z-50">
        <button
          onClick={handleManualSkip}
          className="group flex items-center gap-2 px-5 py-2.5 bg-[#02131d]/90 hover:bg-[#00f2fe]/20 text-[#ccfbf1] hover:text-white border-2 border-[#00f2fe] text-xs font-black shadow-[0_0_25px_rgba(0,242,254,0.4)] hover:shadow-[0_0_35px_rgba(0,242,254,0.8)] backdrop-blur-xl transition-all duration-200 transform hover:scale-105 active:scale-95 cursor-pointer"
          title="Skip intro and jump to catalog"
        >
          <Zap className="w-3.5 h-3.5 text-[#00f2fe] fill-[#00f2fe]" />
          <span>SKIP INTRO (4.0s)</span>
          <ChevronRight className="w-3.5 h-3.5 text-[#00f2fe] group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* Bottom Left System Identifier */}
      <div className="absolute bottom-6 left-6 z-50 hidden sm:flex items-center gap-2 text-[10px] font-mono font-black text-[#7dd3fc]/80">
        <span className="w-2 h-2 bg-[#00f2fe] shadow-[0_0_8px_#00f2fe]" />
        <span>X2 SHOWS TOON // 4-SECOND OVERDRIVE ENGINE</span>
      </div>
    </div>
  );
};
