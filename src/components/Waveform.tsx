import React, { useEffect, useState, useRef } from "react";
import { motion } from "motion/react";

interface WaveformProps {
  state: "idle" | "connecting" | "listening" | "speaking" | "error";
  userAmplitude?: number; // 0.0 to 1.0 for real-time mic monitoring
}

export default function Waveform({ state, userAmplitude = 0 }: WaveformProps) {
  const [phase, setPhase] = useState(0);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    let active = true;

    const animate = () => {
      if (!active) return;
      setPhase((prev) => (prev + 0.08) % (Math.PI * 2));
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      active = false;
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  // Compute SVG path representing procedural waveforms based on state
  const renderPath = (index: number) => {
    const width = 340;
    const height = 120;
    const midY = height / 2;
    const points: string[] = [];

    // Different parameters based on state to convey feeling
    let amplitude = 4;
    let frequency = 0.03;
    let speedShift = phase * (1 + index * 0.3);

    if (state === "connecting") {
      amplitude = 6;
      frequency = 0.05;
    } else if (state === "listening") {
      // Scale with physical audio amplitude
      amplitude = 4 + userAmplitude * 50;
      frequency = 0.04 + userAmplitude * 0.15;
    } else if (state === "speaking") {
      amplitude = 16 + Math.sin(phase * 2.5 + index) * 7;
      frequency = 0.035;
    } else if (state === "error") {
      amplitude = 3;
      frequency = 0.12; // jittery
    } else {
      // idle - warm breath wave
      amplitude = 3 + Math.sin(phase) * 1.5;
      frequency = 0.02;
    }

    for (let x = 0; x <= width; x += 5) {
      const y = midY + Math.sin(x * frequency + speedShift) * amplitude;
      points.push(`${x},${y}`);
    }

    return `M 0,${midY} ` + points.map((p) => `L ${p}`).join(" ") + ` L ${width},${midY}`;
  };

  return (
    <div className="flex flex-col items-center justify-center py-8">
      <div className="relative w-[340px] h-[190px] flex items-center justify-center perspective-[1000px]">
        
        {/* Immersive Theme Glow Outer Rings */}
        <div className="absolute inset-0 bg-radial-gradient from-[#0ea5e9]/20 via-[#8b5cf6]/10 to-transparent rounded-full blur-3xl pointer-events-none mix-blend-screen" />

        <motion.div 
          animate={{ rotateX: state === 'speaking' ? [0, 5, -5, 0] : 0, rotateY: state === 'listening' ? [0, 10, -10, 0] : 0 }}
          transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
          className="absolute w-52 h-52 rounded-full border border-[#0ea5e9]/20 flex items-center justify-center shadow-[0_0_30px_rgba(14,165,233,0.15)] transform-style-preserve-3d"
        >
          
          {/* Animated Wave Rings (Speaking State Simulation) */}
          <motion.div
            className={`absolute rounded-full border ${
              state === "speaking"
                ? "border-[#0ea5e9] bg-[#0ea5e9]/10 shadow-[0_0_20px_rgba(14,165,233,0.4)]"
                : state === "listening"
                ? "border-[#8b5cf6]/60 bg-[#8b5cf6]/10 shadow-[0_0_20px_rgba(139,92,246,0.3)]"
                : "border-white/10"
            }`}
            initial={{ scale: 0.9, opacity: 0.4 }}
            animate={
              state === "speaking"
                ? { scale: [0.95, 1.35, 0.95], opacity: [0.3, 0.9, 0.3] }
                : state === "listening"
                ? { scale: [1, 1.2 + userAmplitude * 0.5, 1], opacity: [0.3, 0.75, 0.3] }
                : { scale: [0.95, 1.05, 0.95], opacity: [0.15, 0.35, 0.15] }
            }
            transition={{
              repeat: Infinity,
              duration: state === "speaking" ? 1.6 : state === "listening" ? 1.1 : 3.8,
              ease: "easeInOut",
            }}
            style={{ width: "95%", height: "95%" }}
          />

          <motion.div
            className="absolute rounded-full border border-[#8b5cf6]/20"
            initial={{ scale: 0.8, opacity: 0.1 }}
            animate={
              state === "speaking"
                ? { scale: [1.1, 1.55, 1.1], opacity: [0.1, 0.6, 0.1] }
                : state === "listening"
                ? { scale: [1.05, 1.4 + userAmplitude * 0.6, 1.05], opacity: [0.1, 0.4, 0.1] }
                : { scale: [0.9, 1.15, 0.9], opacity: [0.08, 0.25, 0.08] }
            }
            transition={{
              repeat: Infinity,
              duration: state === "speaking" ? 2.0 : state === "listening" ? 1.4 : 4.5,
              ease: "easeInOut",
            }}
            style={{ width: "100%", height: "100%" }}
          />

          {/* Core Central Mic Button - Glass Panel with Neon Accents */}
          <div className="z-10 w-36 h-36 rounded-full glass-panel flex flex-col items-center justify-center border border-white/20 relative overflow-hidden group shadow-[0_0_50px_rgba(0,0,0,0.8)] backdrop-blur-xl">
            
            {/* Center soft glow ring */}
            <div className="absolute inset-0 bg-gradient-to-tr from-[#0ea5e9]/20 to-[#8b5cf6]/20 rounded-full opacity-60 pointer-events-none mix-blend-overlay" />

            {state === "listening" ? (
              <div className="flex flex-col items-center justify-center space-y-2 relative z-10">
                <div className="flex space-x-1.5 items-end h-8 justify-center">
                  <motion.div className="w-1 bg-[#8b5cf6] shadow-[0_0_8px_rgba(139,92,246,0.8)] rounded-full" animate={{ height: [12, 34, 12] }} transition={{ repeat: Infinity, duration: 0.7, delay: 0.1 }} />
                  <motion.div className="w-1 bg-[#0ea5e9] shadow-[0_0_8px_rgba(14,165,233,0.8)] rounded-full" animate={{ height: [16, 46, 16] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} />
                  <motion.div className="w-1 bg-[#8b5cf6] shadow-[0_0_8px_rgba(139,92,246,0.8)] rounded-full" animate={{ height: [26, 14, 26] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0.0 }} />
                  <motion.div className="w-1 bg-[#0ea5e9] shadow-[0_0_8px_rgba(14,165,233,0.8)] rounded-full" animate={{ height: [14, 40, 14] }} transition={{ repeat: Infinity, duration: 0.7, delay: 0.35 }} />
                  <motion.div className="w-1 bg-[#8b5cf6] shadow-[0_0_8px_rgba(139,92,246,0.8)] rounded-full" animate={{ height: [8, 24, 8] }} transition={{ repeat: Infinity, duration: 0.9, delay: 0.15 }} />
                </div>
                <span className="text-[9px] font-bold text-white tracking-widest uppercase drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]">LISTENING</span>
              </div>
            ) : state === "speaking" ? (
              <div className="flex flex-col items-center justify-center space-y-2 relative z-10">
                <div className="flex space-x-1.5 items-end h-8 justify-center">
                  <motion.div className="w-1 bg-[#0ea5e9] shadow-[0_0_8px_rgba(14,165,233,0.8)] rounded-full" animate={{ height: [14, 34, 14] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.0 }} />
                  <motion.div className="w-1.5 bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)] rounded-full" animate={{ height: [22, 10, 22] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0.3 }} />
                  <motion.div className="w-1 bg-[#0ea5e9] shadow-[0_0_8px_rgba(14,165,233,0.8)] rounded-full" animate={{ height: [12, 44, 12] }} transition={{ repeat: Infinity, duration: 0.5, delay: 0.15 }} />
                  <motion.div className="w-1 bg-[#0ea5e9] shadow-[0_0_8px_rgba(14,165,233,0.8)] rounded-full" animate={{ height: [24, 14, 24] }} transition={{ repeat: Infinity, duration: 0.7, delay: 0.45 }} />
                </div>
                <span className="text-[9px] font-bold text-white tracking-widest uppercase animate-pulse drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]">SPEAKING</span>
              </div>
            ) : state === "connecting" ? (
              <div className="flex flex-col items-center justify-center space-y-2 relative z-10">
                <div className="w-7 h-7 rounded-full border-2 border-transparent border-t-[#0ea5e9] border-l-[#8b5cf6] animate-spin mb-1 shadow-[0_0_10px_rgba(14,165,233,0.5)]" />
                <span className="text-[8px] font-bold text-slate-300 tracking-widest uppercase">CALLING</span>
              </div>
            ) : state === "error" ? (
              <div className="flex flex-col items-center justify-center text-red-400 relative z-10 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]">
                <span className="text-xl font-bold font-mono">!</span>
                <span className="text-[8px] font-bold tracking-widest uppercase mt-1">TRY RECONNECT</span>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center space-y-2 relative z-10">
                <svg viewBox="0 0 24 24" className="w-7 h-7 fill-[#0ea5e9] drop-shadow-[0_0_8px_rgba(14,165,233,0.5)]" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                  <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
                </svg>
                <span className="text-[9px] font-bold text-white tracking-widest uppercase drop-shadow-[0_0_5px_rgba(255,255,255,0.4)]">AURA ESTATE</span>
              </div>
            )}
          </div>
        </motion.div>

        {/* Elegant Neon Vector curves flowing in background */}
        <div className="absolute bottom-0 w-[340px] h-[120px] pointer-events-none opacity-60 mix-blend-screen">
          <svg viewBox="0 0 340 120" className="w-full h-full drop-shadow-[0_0_8px_rgba(14,165,233,0.8)]">
            <path
              d={renderPath(0)}
              fill="none"
              stroke={
                state === "speaking"
                  ? "#0ea5e9"
                  : state === "listening"
                    ? "#8b5cf6"
                    : state === "error"
                      ? "#f87171"
                      : "#0ea5e9"
              }
              strokeWidth="3"
              strokeLinecap="round"
              className="transition-all duration-300"
            />
            <path
              d={renderPath(1)}
              fill="none"
              stroke={
                state === "speaking"
                  ? "#8b5cf6"
                  : state === "listening"
                    ? "#0ea5e9"
                    : state === "error"
                      ? "#ef4444"
                      : "#38bdf8"
              }
              strokeWidth="1.5"
              strokeLinecap="round"
              opacity="0.7"
              className="transition-all duration-300 drop-shadow-[0_0_10px_rgba(139,92,246,0.8)]"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
