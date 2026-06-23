import React, { useState } from "react";
import { X, Settings, ShieldCheck, Key, RefreshCw, Volume2, Cpu, FileText } from "lucide-react";
import { AppConfig } from "../types";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: AppConfig;
  onSave: (newConfig: AppConfig) => void;
  defaultSystemInstruction: string;
}

export default function SettingsModal({
  isOpen,
  onClose,
  config,
  onSave,
  defaultSystemInstruction
}: SettingsModalProps) {
  const [apiKey, setApiKey] = useState(config.apiKey);
  const [voice, setVoice] = useState(config.voice);
  const [systemInstruction, setSystemInstruction] = useState(config.systemInstruction);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave({
      apiKey: apiKey.trim(),
      model: "models/gemini-3.1-flash-live-preview",
      voice,
      systemInstruction: systemInstruction.trim()
    });
    onClose();
  };

  const handleResetInstruction = () => {
    setSystemInstruction(defaultSystemInstruction);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl glass-panel futuristic-border rounded-3xl shadow-[0_0_30px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-black/40 border-b border-white/10 shadow-inner">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-[#0ea5e9] border border-[#0ea5e9]/30 shadow-[0_0_10px_rgba(14,165,233,0.3)]">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]">Aura Connection Setup</h2>
              <p className="text-[10px] text-[#8b5cf6] font-bold uppercase tracking-widest drop-shadow-[0_0_5px_rgba(139,92,246,0.3)]">Configure Aura System options</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors border border-transparent hover:border-white/20"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-gradient-to-b from-transparent to-black/20">
          {/* API Key */}
          <div className="space-y-1.5">
            <label className="flex items-center text-xs font-bold text-slate-300 uppercase tracking-wider">
              <Key className="w-3.5 h-3.5 text-[#0ea5e9] mr-1.5" />
              Gemini Developer Key
            </label>
            <div className="relative shadow-[0_0_15px_rgba(0,0,0,0.3)]">
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Paste Gemini API Key (e.g., AI_...) "
                className="w-full px-4 py-2.5 text-sm bg-black/50 border border-white/10 rounded-xl focus:bg-black/80 focus:outline-none focus:ring-1 focus:ring-[#0ea5e9] focus:border-[#0ea5e9] transition-all font-mono text-white placeholder-slate-600"
              />
            </div>
            <p className="text-[10px] text-emerald-400 flex items-center space-x-1 pl-1 font-semibold drop-shadow-[0_0_5px_rgba(52,211,153,0.3)]">
              <ShieldCheck className="w-3.5 h-3.5 mr-1" />
              <span>We never save your key on any server. It is stored securely inside your browser.</span>
            </p>
          </div>

          {/* System Instructions / Persona */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="flex items-center text-xs font-bold text-slate-300 uppercase tracking-wider">
                <FileText className="w-3.5 h-3.5 text-[#0ea5e9] mr-1.5" />
                AI Consultant System Persona
              </label>
              <button
                type="button"
                onClick={handleResetInstruction}
                className="text-[10px] text-[#8b5cf6] hover:text-white font-bold flex items-center space-x-1 transition-colors drop-shadow-[0_0_5px_rgba(139,92,246,0.3)]"
              >
                <RefreshCw className="w-2.5 h-2.5 animate-spin" style={{ animationDuration: "10s" }} />
                <span>Reset to Default</span>
              </button>
            </div>
            <textarea
              value={systemInstruction}
              onChange={(e) => setSystemInstruction(e.target.value)}
              rows={5}
              className="w-full px-4 py-3 text-xs bg-black/50 border border-white/10 rounded-xl focus:bg-black/80 focus:outline-none focus:ring-1 focus:ring-[#0ea5e9] focus:border-[#0ea5e9] leading-relaxed transition-all resize-none font-medium text-white shadow-inner focus:shadow-[0_0_15px_rgba(14,165,233,0.2)]"
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-black/40 border-t border-white/10 flex justify-end space-x-3 shadow-inner">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors border border-transparent"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 text-xs font-bold uppercase tracking-widest bg-gradient-to-r from-[#0ea5e9] to-[#8b5cf6] text-white hover:from-[#0284c7] hover:to-[#7c3aed] rounded-lg transition-all border border-white/20 shadow-[0_0_15px_rgba(139,92,246,0.3)] flex items-center shadow-inner relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            <span className="relative z-10">Apply Config</span>
          </button>
        </div>
      </div>
    </div>
  );
}
