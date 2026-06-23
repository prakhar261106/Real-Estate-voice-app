import React, { useState } from "react";
import {
  Building,
  MapPin,
  CalendarDays,
  CheckCircle2,
  Layers,
  ShieldCheck,
  Cpu,
  Bookmark,
  Sparkles,
  Navigation,
  Compass,
  ArrowRight
} from "lucide-react";
import { PropertyRecommend } from "../types";

interface Room {
  name: string;
  size: string;
  color: string;
  highlights: string;
}

interface PropertyDetailSpecs {
  towers: string;
  floors: string;
  builtUpArea: string;
  possession: string;
  amenities: string[];
  proximity: { place: string; dist: string }[];
  floorPlan: Room[];
}

const PROPERTY_DETAILS_DB: Record<string, PropertyDetailSpecs> = {
  prop1: {
    towers: "8 Towers",
    floors: "14 Floors",
    builtUpArea: "1150 Sq.Ft.",
    possession: "Dec 2026 (Ready in 6 Months!)",
    amenities: ["Infinity Pool", "Gated Security Guard Rail", "Pre-fitted Gymnasium", "EV Charging spots", "Kids Play Area Lanes"],
    proximity: [
      { place: "Sector 62 Metro Station", dist: "2 Min Walk" },
      { place: "Fortis Hospital Noida", dist: "1.2 km" },
      { place: "Indirapuram Shopping Cente", dist: "2.0 km" },
      { place: "Reputed Global Schools", dist: "500 meters" }
    ],
    floorPlan: [
      { name: "Master Suite", size: "12' x 14'", color: "bg-amber-50 border-amber-300 text-amber-900", highlights: "Laminated premium wooden flooring, attachment terrace" },
      { name: "Second Bedroom", size: "11' x 12'", color: "bg-slate-50 border-slate-300 text-slate-800", highlights: "Spacious wardrobes, large responsive side window" },
      { name: "Grand Lounge", size: "14' x 18'", color: "bg-[#0A192F]/5 border-slate-300 text-[#0A192F]", highlights: "Premium Italian marble tile finishes, direct balcony lane" },
      { name: "Modular Kitchen", size: "8' x 10'", color: "bg-emerald-50 border-emerald-300 text-emerald-900", highlights: "Fully furnished modern cabinetry, gas hob, chimney pre-fit" },
      { name: "Bathrooms x2", size: "6' x 8'", color: "bg-blue-50 border-blue-300 text-blue-900", highlights: "Branded sanitaryware fittings, dual hot and cold lines" }
    ]
  },
  prop2: {
    towers: "4 Towers (Penthouse Layouts Available)",
    floors: "28 Floors (Luxury Skyscraper)",
    builtUpArea: "2150 Sq.Ft.",
    possession: "Immediate (Ready to Move)",
    amenities: ["Private Elevator", "Rooftop Sky-Lounge", "Spa & Jacuzzi Sauna", "MNC Tech Business Gate", "Mini-golf green"],
    proximity: [
      { place: "Cyber City Corporate Hub", dist: "10 Mins Drive" },
      { place: "Rapid Metro Extension", dist: "3 mins" },
      { place: "Medanta Super Hospital", dist: "4.5 km" },
      { place: "Golf Course Meadows", dist: "In Front" }
    ],
    floorPlan: [
      { name: "Master Suite + Closet", size: "14' x 16'", color: "bg-amber-50 border-amber-300 text-amber-900", highlights: "Oakwood flooring, walk-in vanity closet wardrobe" },
      { name: "Kids Bedroom", size: "12' x 13'", color: "bg-purple-50 border-purple-300 text-purple-900", highlights: "Bright cheerful themes, attached safety glass balcony" },
      { name: "Study Room", size: "10' x 11'", color: "bg-slate-50 border-slate-300 text-slate-800", highlights: "Acoustically insulated walls for peaceful work from home" },
      { name: "Modular Kitchen (VRV)", size: "10' x 12'", color: "bg-emerald-50 border-emerald-300 text-emerald-900", highlights: "European modular fittings, preheat oven, central gas lines" },
      { name: "Lounge & Dinette", size: "16' x 24'", color: "bg-[#0A192F]/5 border-slate-300 text-[#0A192F]", highlights: "Double-height grand ceiling with majestic chandeliers" }
    ]
  },
  prop3: {
    towers: "6 Towers",
    floors: "18 Floors",
    builtUpArea: "1220 Sq.Ft.",
    possession: "Oct 2027",
    amenities: ["Organic gardens", "Co-working smart pods", "Pet training trail", "Yoga pavilion", "Rainwater harvesting"],
    proximity: [
      { place: "Whitefield IT Tech Park", dist: "5 Mins Away" },
      { place: "Phoenix Marketcity Mall", dist: "3.5 km" },
      { place: "Apollo Hospital Clinic", dist: "1.0 km" },
      { place: "Proposed Metro Station", dist: "400 meters" }
    ],
    floorPlan: [
      { name: "IoT Master Suite", size: "12' x 15'", color: "bg-amber-50 border-amber-300 text-amber-900", highlights: "Smart dimming bulbs, automatic curtains panel" },
      { name: "Bedroom 2 (Guests)", size: "11' x 12'", color: "bg-slate-50 border-slate-300 text-slate-800", highlights: "Optimized climate controls, wide nature view" },
      { name: "IoT Living Room", size: "14' x 19'", color: "bg-[#0A192F]/5 border-slate-300 text-[#0A192F]", highlights: "Integrated voice consultant nodes, home automation central" },
      { name: "Kitchen", size: "8' x 11'", color: "bg-emerald-50 border-emerald-300 text-emerald-900", highlights: "Modular kitchen with RO filtration node & solar water backup" },
      { name: "Work Alcove Pod", size: "6' x 8'", color: "bg-blue-50 border-blue-300 text-blue-900", highlights: "Dedicated high-speed fiber terminal and adjustable desk" }
    ]
  },
  prop4: {
    towers: "85 Independent Villas",
    floors: "3 Storeys (G+2 levels with terrace)",
    builtUpArea: "3450 Sq.Ft.",
    possession: "June 2027",
    amenities: ["Private Lawns", "Double car closed garage", "Sports lounge arena", "Heated pool", "Bicycle trail track"],
    proximity: [
      { place: "Gurgaon Main Expressway", dist: "15 Mins Drive" },
      { place: "GD Goenka University", dist: "5 mins" },
      { place: "Sohna Hot Springs", dist: "1.8 km" },
      { place: "Retail Arcade Complex", dist: "Within Enclave" }
    ],
    floorPlan: [
      { name: "Master Suite + Deck", size: "16' x 20'", color: "bg-amber-50 border-amber-300 text-amber-900", highlights: "Top floor penthouse layout, skylight ceiling panel" },
      { name: "Family Lounge (G)", size: "18' x 22'", color: "bg-[#0A192F]/5 border-slate-300 text-[#0A192F]", highlights: "Ground floor entry courtyard connectivity" },
      { name: "Chef Kitchen", size: "12' x 14'", color: "bg-emerald-50 border-emerald-300 text-emerald-900", highlights: "Walk-in pantry cold storage, professional chef stove hub" },
      { name: "Bedroom 2 (1st)", size: "12' x 15'", color: "bg-slate-50 border-slate-300 text-slate-800", highlights: "Attached private rear balcony facing the gardens" },
      { name: "Bedroom 3 (1st)", size: "12' x 14'", color: "bg-blue-50 border-blue-300 text-blue-900", highlights: "Double bed size with built-in studies cabinet" },
      { name: "Sky Lawn Terrace", size: "18' x 28'", color: "bg-emerald-50/50 border-emerald-400 text-emerald-900", highlights: "High ceiling party deck with warm perimeter lighting" }
    ]
  }
};

interface PropertyDetailProps {
  property: PropertyRecommend;
  onBookSiteVisit: () => void;
}

export default function PropertyDetail({ property, onBookSiteVisit }: PropertyDetailProps) {
  const [activeTab, setActiveTab] = useState<"specs" | "floorplan" | "proximity">("specs");
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  const detail = PROPERTY_DETAILS_DB[property.id] || PROPERTY_DETAILS_DB.prop1;

  // Render a responsive, stylized CSS representation of the complex/society layout
  const renderSocietyVisual = () => {
    return (
      <div className="w-full bg-black/60 p-5 rounded-2xl text-white relative overflow-hidden border border-[#0ea5e9]/20 shadow-[0_0_20px_rgba(14,165,233,0.15)] glass-panel">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0ea5e9]/10 via-transparent to-[#8b5cf6]/10 pointer-events-none" />
        
        <div className="flex justify-between items-center mb-3">
          <span className="text-[9px] uppercase tracking-widest font-bold text-[#0ea5e9] drop-shadow-[0_0_5px_rgba(14,165,233,0.5)]">SOCIETY SITE MASTER PLAN</span>
          <span className="text-[10px] text-slate-400 font-mono font-bold">Aura Complex Layout</span>
        </div>

        {/* Dynamic Graphic Schematic Representing Society Blocks */}
        <div className="grid grid-cols-12 gap-3 h-36 items-center">
          
          {/* Block A */}
          <div className="col-span-4 bg-white/5 border border-white/10 rounded-xl p-3 h-full flex flex-col justify-between hover:bg-white/10 hover:border-[#0ea5e9]/50 hover:shadow-[0_0_15px_rgba(14,165,233,0.2)] transition-all group">
            <span className="text-[9px] font-bold text-[#0ea5e9]">BLOCK A / RESIDENCES</span>
            <div className="flex space-x-1.5 mt-2 transition-all">
              <span className="w-1.5 h-8 bg-slate-700 rounded group-hover:bg-[#0ea5e9]/50" />
              <span className="w-1.5 h-12 bg-[#0ea5e9] rounded animate-pulse shadow-[0_0_10px_rgba(14,165,233,0.8)]" />
              <span className="w-1.5 h-6 bg-slate-700 rounded group-hover:bg-[#0ea5e9]/50" />
            </div>
            <span className="text-[8px] text-slate-400 uppercase mt-2">Smart towers</span>
          </div>

          {/* Core Green Hub */}
          <div className="col-span-4 bg-[#8b5cf6]/20 border border-[#8b5cf6]/40 rounded-xl p-3 h-full flex flex-col justify-between hover:bg-[#8b5cf6]/30 hover:shadow-[0_0_15px_rgba(139,92,246,0.3)] transition-all relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/10 to-transparent pointer-events-none" />
            <span className="text-[9px] font-bold text-emerald-400 uppercase drop-shadow-[0_0_5px_rgba(52,211,153,0.5)]">AURA CENTRAL MEADOWS</span>
            <div className="flex justify-center space-x-1 mt-1">
              <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/50 shadow-[0_0_10px_rgba(52,211,153,0.5)] group-hover:scale-110 transition-transform">
                <Compass className="w-3.5 h-3.5 text-emerald-300" />
              </div>
            </div>
            <span className="text-[8px] text-center text-[#8b5cf6] uppercase tracking-wider font-extrabold font-mono mt-1 drop-shadow-[0_0_5px_rgba(139,92,246,0.5)]">Pool, Spa & Gym</span>
          </div>

          {/* Block B */}
          <div className="col-span-4 bg-white/5 border border-white/10 rounded-xl p-3 h-full flex flex-col justify-between hover:bg-white/10 hover:border-[#8b5cf6]/50 hover:shadow-[0_0_15px_rgba(139,92,246,0.2)] transition-all group">
            <span className="text-[9px] font-bold text-slate-300">BLOCK B / SPORTS COVE</span>
            <div className="flex space-x-1.5 items-end justify-end mt-2 transition-all">
              <span className="w-1.5 h-5 bg-slate-700 rounded group-hover:bg-[#8b5cf6]/50" />
              <span className="w-1.5 h-7 bg-slate-700 rounded group-hover:bg-[#8b5cf6]/50" />
              <span className="w-1.5 h-10 bg-[#8b5cf6] rounded shadow-[0_0_10px_rgba(139,92,246,0.8)]" />
            </div>
            <span className="text-[8px] text-slate-500 uppercase mt-2">Villas / Club-Crest</span>
          </div>

        </div>

        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-[10px] text-slate-300 border-t border-white/10 pt-3">
          <p>🏢 <strong className="text-white">Towers:</strong> {detail.towers}</p>
          <p>🔑 <strong className="text-white">Structure:</strong> {detail.floors}</p>
          <p>📐 <strong className="text-white">Super Area:</strong> {detail.builtUpArea}</p>
        </div>
      </div>
    );
  };

  // Render clickable CAD architectural 2D floor plans
  const renderFloorPlanVisual = () => {
    return (
      <div className="space-y-4">
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed">
          CAD Architect Blueprint layout. Click any zone to inspect.
        </p>
        
        {/* Floorplan Layout grid */}
        <div className="border border-white/10 rounded-2xl p-4 bg-white/5 relative shadow-inner">
          <div className="grid grid-cols-12 gap-2 h-44">
            {detail.floorPlan.map((room, idx) => {
              const isSelected = selectedRoom?.name === room.name;
              
              // Map old colors to new dark theme variants based on class substring
              let darkColorClass = "bg-white/5 border-white/10 text-slate-300";
              if (room.color.includes("amber")) darkColorClass = "bg-amber-950/30 border-amber-500/30 text-amber-200 hover:border-amber-500/60";
              if (room.color.includes("slate") || room.color.includes("0A192F")) darkColorClass = "bg-slate-900/40 border-slate-600/40 text-slate-200 hover:border-slate-500/80";
              if (room.color.includes("emerald")) darkColorClass = "bg-emerald-950/30 border-emerald-500/30 text-emerald-200 hover:border-emerald-500/60";
              if (room.color.includes("blue")) darkColorClass = "bg-[#0ea5e9]/10 border-[#0ea5e9]/30 text-[#0ea5e9] hover:border-[#0ea5e9]/60";
              if (room.color.includes("purple")) darkColorClass = "bg-[#8b5cf6]/10 border-[#8b5cf6]/30 text-[#8b5cf6] hover:border-[#8b5cf6]/60";

              return (
                <div
                  key={idx}
                  onClick={() => setSelectedRoom(room)}
                  className={`border cursor-pointer transition-all rounded-xl p-2.5 flex flex-col justify-between relative select-none hover:shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:scale-101 border-dashed ${darkColorClass} ${
                    idx === 0
                      ? "col-span-6"
                      : idx === 1
                      ? "col-span-6"
                      : idx === 2
                      ? "col-span-8"
                      : idx === 3
                      ? "col-span-4"
                      : "col-span-12"
                  } ${isSelected ? "ring-2 ring-[#0ea5e9] border-[#0ea5e9] bg-[#0ea5e9]/10 shadow-[0_0_20px_rgba(14,165,233,0.3)] text-white" : ""}`}
                >
                  <div className="flex justify-between items-start">
                    <span className="text-[9px] font-mono leading-none tracking-tight uppercase font-extrabold opacity-95">
                      {room.name}
                    </span>
                    <span className="text-[9px] font-mono font-bold font-semibold opacity-75">{room.size}</span>
                  </div>
                  {isSelected && (
                    <span className="absolute bottom-1 right-2 w-2 h-2 bg-[#0ea5e9] rounded-full animate-ping shadow-[0_0_10px_rgba(14,165,233,0.8)]" />
                  )}
                  <span className="text-[8px] opacity-60 font-mono mt-1 text-right truncate">Click info</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Dynamic room details panel */}
        {selectedRoom ? (
          <div className="bg-[#0ea5e9]/10 border border-[#0ea5e9]/30 shadow-[0_0_15px_rgba(14,165,233,0.15)] rounded-xl p-4 animate-fade-in text-xs">
            <h5 className="font-bold text-white flex items-center space-x-1 mb-1 uppercase tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-[#0ea5e9]" />
              <span>{selectedRoom.name} details ({selectedRoom.size})</span>
            </h5>
            <p className="text-slate-300 leading-relaxed font-medium">{selectedRoom.highlights}</p>
          </div>
        ) : (
          <div className="text-center py-2 text-[11px] text-slate-400 font-bold bg-white/5 rounded-xl border border-white/10 animate-pulse">
            👆 Click on a room section above to inspect detailed pre-fitted options!
          </div>
        )}
      </div>
    );
  };

  // Render location connection milestones
  const renderProximityVisual = () => {
    return (
      <div className="space-y-4">
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
          Connectivity & Regional Proximity roadmap
        </p>
        <div className="relative border-l-2 border-[#8b5cf6]/30 pl-5 space-y-4 ml-2.5 py-1">
          {detail.proximity.map((prox, idx) => (
            <div key={idx} className="relative group">
              {/* Bullet Node */}
              <div className="absolute -left-[27px] top-1 w-3 h-3 rounded-full bg-slate-900 border-2 border-[#8b5cf6] group-hover:bg-[#8b5cf6] group-hover:shadow-[0_0_10px_rgba(139,92,246,0.8)] transition-all" />
              
              <div className="space-y-0.5">
                <span className="text-[10px] font-extrabold text-[#8b5cf6] tracking-wider uppercase bg-[#8b5cf6]/10 border border-[#8b5cf6]/30 px-2 py-0.5 rounded shadow-[0_0_5px_rgba(139,92,246,0.2)] group-hover:bg-[#8b5cf6]/20 transition-all">
                  {prox.dist}
                </span>
                <h5 className="text-xs font-bold text-slate-200 pt-2 group-hover:text-white transition-colors">{prox.place}</h5>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="glass-panel futuristic-border rounded-3xl p-6 space-y-5 flex flex-col justify-between transition-all hover:shadow-[0_0_30px_rgba(14,165,233,0.15)] group relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#8b5cf6]/10 to-transparent blur-3xl opacity-50 group-hover:opacity-100 transition-opacity" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-[#0ea5e9]/10 to-transparent blur-3xl opacity-50 group-hover:opacity-100 transition-opacity" />
      
      {/* Title block */}
      <div className="space-y-2 relative z-10">
        <div className="flex items-center justify-between">
          <span className="text-[11px] bg-[#0ea5e9]/10 text-[#0ea5e9] px-3 py-1 font-extrabold rounded-full border border-[#0ea5e9]/30 uppercase tracking-widest flex items-center gap-1 shadow-[0_0_10px_rgba(14,165,233,0.2)]">
            <Building className="w-3 h-3" />
            <span>SOCIETY SHOWCASE</span>
          </span>
          <span className="text-[9px] uppercase tracking-widest font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded shadow-[0_0_5px_rgba(52,211,153,0.2)]">
            98% match
          </span>
        </div>
        <h3 className="text-lg font-extrabold tracking-tight text-white font-serif leading-tight pt-2 drop-shadow-[0_0_5px_rgba(255,255,255,0.2)]">
          {property.title} <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0ea5e9] to-[#8b5cf6]">Details</span>
        </h3>
        <p className="text-xs text-slate-400 font-medium flex items-center">
          <MapPin className="w-3.5 h-3.5 text-[#0ea5e9] mr-1 shrink-0" />
          <span>{property.location}</span>
        </p>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-3 gap-1 bg-black/40 border border-white/10 rounded-xl p-1 shrink-0 select-none relative z-10 shadow-inner">
        <button
          onClick={() => setActiveTab("specs")}
          className={`text-[10px] font-bold uppercase tracking-wider py-2 rounded-lg transition-all ${
            activeTab === "specs"
              ? "bg-[#0ea5e9]/20 text-[#0ea5e9] shadow-[0_0_10px_rgba(14,165,233,0.2)] border border-[#0ea5e9]/30"
              : "text-slate-500 hover:text-slate-300 hover:bg-white/5"
          }`}
        >
          Society Layout
        </button>
        <button
          onClick={() => setActiveTab("floorplan")}
          className={`text-[10px] font-bold uppercase tracking-wider py-2 rounded-lg transition-all ${
            activeTab === "floorplan"
              ? "bg-[#0ea5e9]/20 text-[#0ea5e9] shadow-[0_0_10px_rgba(14,165,233,0.2)] border border-[#0ea5e9]/30"
              : "text-slate-500 hover:text-slate-300 hover:bg-white/5"
          }`}
        >
          CAD Floorplan
        </button>
        <button
          onClick={() => setActiveTab("proximity")}
          className={`text-[10px] font-bold uppercase tracking-wider py-2 rounded-lg transition-all ${
            activeTab === "proximity"
              ? "bg-[#0ea5e9]/20 text-[#0ea5e9] shadow-[0_0_10px_rgba(14,165,233,0.2)] border border-[#0ea5e9]/30"
              : "text-slate-500 hover:text-slate-300 hover:bg-white/5"
          }`}
        >
          Connectivity
        </button>
      </div>

      {/* Tab Visual Content Body */}
      <div className="min-h-[200px] flex flex-col justify-center relative z-10">
        {activeTab === "specs" && renderSocietyVisual()}
        {activeTab === "floorplan" && renderFloorPlanVisual()}
        {activeTab === "proximity" && renderProximityVisual()}
      </div>

      {/* Society Amenities Quick chips */}
      <div className="space-y-2 border-t border-white/10 pt-4.5 relative z-10">
        <p className="text-[10px] font-bold text-[#8b5cf6] uppercase tracking-widest flex items-center gap-1 drop-shadow-[0_0_5px_rgba(139,92,246,0.3)]">
          <Bookmark className="w-3 h-3" />
          <span>SOCIETY AMENITIES</span>
        </p>
        <div className="flex flex-wrap gap-1.5 pt-0.5">
          {detail.amenities.map((amen, idx) => (
            <span
              key={idx}
              className="text-[10px] bg-white/5 border border-white/10 hover:border-[#8b5cf6]/50 hover:bg-[#8b5cf6]/10 text-slate-300 font-semibold px-2.5 py-1 rounded-lg transition-colors shadow-inner cursor-default"
            >
              • {amen}
            </span>
          ))}
        </div>
      </div>

      {/* Possession & Site Visit Booking Buttons, fully responsive layout */}
      <div className="bg-black/40 border border-white/10 p-4.5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 border-dashed mt-2 shadow-inner relative z-10 hover:border-[#0ea5e9]/30 transition-colors">
        <div className="space-y-0.5">
          <span className="text-[9px] uppercase tracking-wider font-extrabold text-slate-500">POSSESSION STAGE</span>
          <p className="text-xs font-extrabold text-[#0ea5e9] flex items-center drop-shadow-[0_0_5px_rgba(14,165,233,0.3)]">
            <CalendarDays className="w-3.5 h-3.5 mr-1 shrink-0" />
            {detail.possession}
          </p>
        </div>
        <button
          onClick={onBookSiteVisit}
          className="bg-gradient-to-r from-[#0ea5e9] to-[#8b5cf6] text-white px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-wider hover:from-[#0284c7] hover:to-[#7c3aed] shadow-[0_0_15px_rgba(139,92,246,0.4)] transition-all active:scale-98 shrink-0 flex items-center justify-center space-x-2 border border-white/20 relative overflow-hidden group/btn"
        >
          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform mix-blend-overlay" />
          <span className="relative z-10">Book Free Site Visit</span>
          <ArrowRight className="w-3.5 h-3.5 font-bold relative z-10 group-hover/btn:translate-x-1 transition-transform" />
        </button>
      </div>

    </div>
  );
}
