import React from 'react';
import { TwinkleBackground } from '../components/TwinkleBackground';
import { OrbCanvas } from '../components/Orb';
import { PropertyCarousel } from '../components/PropertyCarousel';
import { Filter, Home as HomeIcon, MapPin, DollarSign } from 'lucide-react';
import { useGeminiVoice } from '../hooks/useGeminiVoice';

export function Home() {
  const {
    connectionState,
    serverState,
    highlightedPropertyId,
    errorMsg,
    startSession,
    cleanup
  } = useGeminiVoice();

  const getOrbState = () => {
    if (connectionState === 'CONNECTING') return 'CONNECTING';
    if (connectionState === 'CONNECTED') return serverState;
    return 'IDLE';
  };

  return (
    <>
      <TwinkleBackground />
      <div className="min-h-screen w-full flex flex-col relative z-10 p-4 lg:p-6 lg:overflow-hidden overflow-y-auto">
        
        {/* Top Header */}
        <header className="flex items-center justify-between w-full mb-6 lg:mb-8 shrink-0">
          <div>
            <h1 className="text-2xl lg:text-3xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#d4af37] via-white to-[#d4af37] tracking-wider drop-shadow-sm">
              Aura <span className="font-light">Engine</span>
            </h1>
            <p className="text-[10px] lg:text-xs font-sans tracking-[0.3em] font-medium text-[#06b6d4] uppercase mt-1">Terminal 01</p>
          </div>
          <div className="glass-panel px-3 py-1.5 lg:px-4 lg:py-2 rounded-full border border-white/10 flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${connectionState === 'CONNECTED' ? 'bg-[#06b6d4] shadow-[0_0_8px_#06b6d4]' : 'bg-red-500'}`} />
            <span className="text-[10px] lg:text-xs font-mono text-slate-300 uppercase tracking-widest">{connectionState}</span>
          </div>
        </header>

        {/* Main HUD Layout */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:h-[calc(100vh-140px)] lg:overflow-hidden">
          
          {/* Left Panel: Quick Filters */}
          <div className="hidden lg:col-span-3 lg:flex flex-col gap-4 overflow-y-auto">
             <div className="glass-panel rounded-2xl p-6 h-full flex flex-col border border-[#d4af37]/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#d4af37]/5 blur-3xl pointer-events-none" />
                <h2 className="text-[#d4af37] font-mono text-sm tracking-widest mb-6 flex items-center gap-2 uppercase">
                   <Filter size={16} /> Parameters
                </h2>
                <div className="space-y-6 flex-1 text-sm font-sans text-slate-300">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-white/50 pb-2 border-b border-white/5">
                      <HomeIcon size={14} className="text-[#06b6d4]" /> <span>Type: Ultra Premium</span>
                    </div>
                    <div className="flex items-center gap-3 text-white/50 pb-2 border-b border-white/5">
                      <MapPin size={14} className="text-[#06b6d4]" /> <span>Zone: Noida Expressway</span>
                    </div>
                    <div className="flex items-center gap-3 text-white/50 pb-2 border-b border-white/5">
                      <DollarSign size={14} className="text-[#06b6d4]" /> <span>Range: 4Cr - 10Cr</span>
                    </div>
                  </div>
                  <div className="mt-8">
                     <p className="text-xs font-mono text-white/30 uppercase leading-relaxed tracking-wider">
                       Aura synchronizes to your query context. Instruct the AI directly to adjust targeting parameters.
                     </p>
                  </div>
                </div>
             </div>
          </div>

          {/* Center Panel: Orb */}
          <div className="lg:col-span-6 flex flex-col items-center justify-center relative lg:h-full shrink-0">
              <OrbCanvas 
                state={getOrbState()} 
                onClick={connectionState === 'IDLE' ? startSession : cleanup} 
              />
              <div className="mt-8 text-center h-8">
                {connectionState === 'IDLE' && <p className="text-slate-400 font-mono text-xs tracking-widest uppercase">Click to Start</p>}
                {connectionState === 'CONNECTING' && <p className="text-[#8b5cf6] animate-pulse font-mono text-xs tracking-widest uppercase">Requesting Microphone...</p>}
                {connectionState === 'CONNECTED' && serverState === 'LISTENING' && <p className="text-[#06b6d4] font-mono text-xs tracking-widest uppercase">Connected / Receiving Audio</p>}
                {connectionState === 'CONNECTED' && serverState === 'SPEAKING' && <p className="text-[#d4af37] font-mono text-xs tracking-widest uppercase animate-pulse">Connected / Transmitting Data</p>}
              </div>

              {errorMsg && (
                <div className="mt-4 max-w-sm p-4 bg-red-950/80 border border-red-500/50 text-red-200 text-xs font-mono tracking-wide rounded-lg backdrop-blur-md">
                  {errorMsg}
                </div>
              )}
          </div>

          {/* Right Panel: Property Showcase */}
          <div className="lg:col-span-3 lg:h-full lg:overflow-y-auto hide-scrollbar shrink-0 mt-4 lg:mt-0">
             <div className="sticky top-0 bg-transparent backdrop-blur-md z-10 pb-4 mb-4 pt-1">
                <h2 className="text-[#06b6d4] font-mono text-sm tracking-widest uppercase pl-2 border-l-2 border-[#06b6d4]">
                   Live Telemetry
                </h2>
             </div>
             {/* Instead of a horizontal carousel, make it a vertical stack here */}
             <PropertyCarousel highlightedPropertyId={highlightedPropertyId} vertical />
          </div>

        </div>
      </div>
    </>
  );
}
