import React, { useEffect, useRef } from 'react';
import { MOCK_PROPERTIES } from '../data';
import { useNavigate } from 'react-router-dom';
import { Building2, Home } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function PropertyCarousel({ displayedPropertyIds, vertical = false }: { displayedPropertyIds?: string[], vertical?: boolean }) {
  const navigate = useNavigate();
  const listRef = useRef<HTMLDivElement>(null);

  // Filter properties if displayedPropertyIds is provided and not empty
  const propertiesToShow = displayedPropertyIds && displayedPropertyIds.length > 0 
    ? MOCK_PROPERTIES.filter(p => displayedPropertyIds.includes(p.id))
    : [];

  useEffect(() => {
    if (displayedPropertyIds && displayedPropertyIds.length > 0 && listRef.current) {
      listRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [displayedPropertyIds]);

  return (
    <div ref={listRef} className={`w-full ${vertical ? '' : 'max-w-5xl mx-auto mt-12 mb-20 px-4'}`}>
      {!vertical && (
        <h3 className="text-xl font-serif text-[#d4af37] mb-6 tracking-wide drop-shadow-md">Exclusive Residences</h3>
      )}
      
      <div className={`flex ${vertical ? 'flex-col gap-6' : 'gap-6 overflow-x-auto pb-8 hide-scrollbar snap-x'}`}>
        <AnimatePresence>
          {propertiesToShow.map((property, index) => {
            const isHighlighted = displayedPropertyIds?.includes(property.id);
            
            return (
              <motion.div 
                key={property.id} 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`${vertical ? 'w-full' : 'snap-center shrink-0 w-80 sm:w-96'} glass-panel rounded-xl overflow-hidden transition-all duration-500 cursor-pointer group ${isHighlighted ? 'border-2 border-[#06b6d4] shadow-[0_0_20px_rgba(6,182,212,0.4)] scale-[1.02]' : 'border border-[#d4af37]/20 hover:border-[#06b6d4]/50'}`}
                onClick={() => navigate(`/property/${property.id}`)}
              >
                <div className="relative h-40 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] to-transparent z-10"/>
                  <img src={property.image} alt={property.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute top-3 right-3 z-20 bg-black/60 backdrop-blur-md px-2 py-1 rounded border border-[#d4af37]/30 text-[#d4af37] text-xs font-mono tracking-wider">
                    {property.price}
                  </div>
                </div>
                
                <div className="p-4 flex flex-col gap-2">
                  <h4 className="text-sm font-sans font-bold text-white group-hover:text-[#d4af37] transition-colors">{property.title}</h4>
                  <div className="flex items-center gap-2 text-slate-400 text-xs">
                    <Building2 size={12} className="text-[#06b6d4] shrink-0" />
                    <span className="truncate">{property.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400 text-xs">
                    <Home size={12} className="text-[#06b6d4] shrink-0" />
                    <span className="truncate">{property.type}</span>
                  </div>
                  <button 
                    className="mt-3 w-full py-2 rounded border border-[#d4af37]/30 text-[#d4af37] text-xs font-mono uppercase tracking-widest hover:bg-[#d4af37]/10 transition-colors"
                  >
                    Access Telemetry
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
