import React, { useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MOCK_PROPERTIES } from '../data';
import { ArrowLeft, MapPin, Building2, ShieldCheck, Map, Activity, CheckCircle2, Square } from 'lucide-react';
import { TwinkleBackground } from '../components/TwinkleBackground';

export function PropertyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const property = useMemo(() => MOCK_PROPERTIES.find((p) => p.id === id), [id]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white bg-[#050505]">
        <div className="text-center">
          <p className="font-mono text-slate-400 mb-4 tracking-widest uppercase">Property not found</p>
          <button onClick={() => navigate('/')} className="text-[#d4af37] border border-[#d4af37]/30 px-6 py-2 rounded">
            Return Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full pb-24 bg-[#050505] text-slate-200">
      <TwinkleBackground />
      {/* Hero Header */}
      <div className="relative h-[50vh] w-full mt-4 max-w-[95%] mx-auto rounded-3xl overflow-hidden glass-panel border border-white/5 shadow-2xl">
        <div className="absolute inset-0 bg-[#0a0a0a]/60 z-10 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-[#0a0a0a]/50 z-10" />
        <img 
          src={property.image} 
          alt={property.title} 
          className="w-full h-full object-cover transition-transform duration-[20s] ease-linear scale-105"
        />
        
        <div className="absolute top-6 left-6 z-20">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-2 px-4 py-2 rounded-full glass-panel border border-white/10 text-[#06b6d4] hover:bg-[#06b6d4]/10 transition-colors"
          >
            <ArrowLeft size={16} />
            <span className="text-xs font-mono tracking-widest uppercase">System Core</span>
          </button>
        </div>

        <div className="absolute bottom-10 left-10 z-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded border border-[#d4af37]/40 text-[#d4af37] text-[10px] font-mono tracking-widest uppercase mb-4 bg-black/50 backdrop-blur-sm">
            <ShieldCheck size={12} /> Verified Asset
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-2 drop-shadow-xl tracking-wide">
            {property.title}
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-slate-300 font-mono text-xs uppercase tracking-wider">
            <div className="flex items-center gap-2">
              <MapPin size={14} className="text-[#06b6d4]" />
              <span>{property.location}</span>
            </div>
            <div className="text-[#d4af37]">|</div>
            <div className="flex items-center gap-2">
              <Building2 size={14} className="text-[#06b6d4]" />
              <span>{property.type}</span>
            </div>
          </div>
        </div>
        
        <div className="absolute bottom-10 right-10 z-20 text-right">
           <div className="text-3xl font-serif text-[#d4af37] drop-shadow-lg mb-1">
             {property.price}
           </div>
           <div className="text-xs font-mono text-slate-400 tracking-widest uppercase">Starting Price</div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="max-w-[95%] mx-auto mt-10 grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
        
        {/* Left Column: Specs & Dimensions */}
        <div className="lg:col-span-8 space-y-8">
          
          <div className="glass-panel p-8 rounded-2xl border border-white/5">
            <h2 className="text-xl font-serif text-[#d4af37] mb-4">Executive Summary</h2>
            <p className="text-slate-300 leading-relaxed text-sm font-sans">
              {property.desc}
            </p>
            <div className="flex gap-12 mt-6 pt-6 border-t border-white/5">
               <div>
                  <div className="text-xs text-slate-500 font-mono tracking-widest uppercase mb-1">Super Area</div>
                  <div className="text-lg text-white font-serif">{property.super_area}</div>
               </div>
               <div>
                  <div className="text-xs text-slate-500 font-mono tracking-widest uppercase mb-1">Carpet Area</div>
                  <div className="text-lg text-white font-serif">{property.carpet_area}</div>
               </div>
            </div>
          </div>

          {/* Exhaustive Dimensions Table */}
          <div className="glass-panel p-8 rounded-2xl border border-white/5">
             <div className="flex items-center gap-3 mb-6">
                <Square size={20} className="text-[#06b6d4]" />
                <h2 className="text-xl font-serif text-white">Spatial Metrics (Exhaustive)</h2>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                {Object.entries(property.dimensions).map(([key, value]) => (
                  <div key={key} className="flex flex-col border-b border-white/5 pb-3">
                     <span className="text-[10px] font-mono text-slate-500 tracking-widest uppercase mb-1">
                       {key.replace('_', ' ')}
                     </span>
                     <span className="text-sm text-[#d4af37] font-semibold font-sans">{value}</span>
                  </div>
                ))}
             </div>
          </div>

          <div className="glass-panel p-8 rounded-2xl border border-white/5">
             <h2 className="text-xl font-serif text-white mb-6">Installed Amenities</h2>
             <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {property.amenities.map(item => (
                   <div key={item} className="flex items-center gap-2 text-sm text-slate-300">
                      <CheckCircle2 size={16} className="text-[#06b6d4]" />
                      <span>{item}</span>
                   </div>
                ))}
             </div>
          </div>
        </div>
        
        {/* Right Sidebar: Locality & Actions */}
        <div className="lg:col-span-4 space-y-8">
           
           <div className="glass-panel p-8 rounded-2xl border border-white/5">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <Map size={18} className="text-[#d4af37]" />
                  <h2 className="text-lg font-serif text-white">Zone Telemetry</h2>
                </div>
                <div className="px-2 py-1 rounded bg-[#06b6d4]/10 border border-[#06b6d4]/30 text-[#06b6d4] text-[10px] font-mono font-bold tracking-widest">
                  SCORE: {property.locality.rating}
                </div>
              </div>

              <div className="space-y-4 font-sans text-sm">
                 <div className="flex justify-between items-center">
                    <span className="text-slate-500">Transit</span>
                    <span className="text-right text-slate-200">{property.locality.metro}</span>
                 </div>
                 <div className="flex justify-between items-center">
                    <span className="text-slate-500">Medical</span>
                    <span className="text-right text-slate-200">{property.locality.hospital}</span>
                 </div>
                 <div className="flex justify-between items-center">
                    <span className="text-slate-500">Education</span>
                    <span className="text-right text-slate-200">{property.locality.school}</span>
                 </div>
                 <div className="flex justify-between items-center">
                    <span className="text-slate-500">Commercial</span>
                    <span className="text-right text-slate-200">{property.locality.commercial}</span>
                 </div>
              </div>
           </div>

           <div className="glass-panel p-8 rounded-2xl border border-[#d4af37]/20 relative overflow-hidden text-center">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#d4af37]/10 blur-3xl pointer-events-none" />
              <h3 className="text-lg font-serif text-white mb-2">Acquisition</h3>
              <p className="text-xs text-slate-400 mb-8 font-sans">Initialize secondary protocol to book a viewing.</p>
              
              <button className="w-full bg-[#d4af37] text-black font-bold text-[10px] tracking-[0.2em] uppercase py-3 rounded hover:bg-white transition-colors">
                Initiate Secure Handshake
              </button>
              
              <button 
                className="mt-4 w-full flex items-center justify-center gap-2 py-3 border border-[#06b6d4]/30 text-[#06b6d4] rounded text-[10px] font-mono tracking-widest uppercase hover:bg-[#06b6d4]/10 transition-colors"
                onClick={() => navigate('/')}
              >
                <Activity size={14} /> Resume AI Dialog
              </button>
           </div>

        </div>
      </div>
    </div>
  );
}
