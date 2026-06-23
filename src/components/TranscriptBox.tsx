import React, { useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import { TranscriptMessage } from '../types';

export function TranscriptBox({ 
  messages, 
  onSendText 
}: { 
  messages: TranscriptMessage[], 
  onSendText: (text: string) => void 
}) {
  const [inputText, setInputText] = React.useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim()) {
      onSendText(inputText.trim());
      setInputText('');
    }
  };

  return (
    <div className="w-full h-full max-w-2xl mx-auto border border-white/5 bg-black/40 backdrop-blur-md rounded-2xl flex flex-col">
      <div className="flex-1 overflow-y-auto p-5 space-y-4 hide-scrollbar" ref={scrollRef}>
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-[#d4af37]/50 font-serif italic text-center px-8">
            "Your exclusive real estate consultation will appear here..."
          </div>
        ) : (
          messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`flex ${msg.speaker === 'USER' ? 'justify-end' : 'justify-start'} animate-fade-in`}
            >
              <div 
                className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                  msg.speaker === 'USER' 
                    ? 'bg-[#d4af37]/10 text-[#d4af37] border border-[#d4af37]/20 rounded-tr-sm' 
                    : 'bg-[#06b6d4]/10 text-[#e2e8f0] border border-[#06b6d4]/20 rounded-tl-sm'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))
        )}
      </div>
      
      <div className="p-3 border-t border-[#d4af37]/10">
        <form onSubmit={handleSubmit} className="relative flex items-center">
          <input
            type="text"
            className="w-full bg-black/40 border border-[#d4af37]/20 rounded-xl py-3 pl-4 pr-12 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-[#d4af37]/50 transition-all"
            placeholder="Type your message..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
          <button 
            type="submit" 
            disabled={!inputText.trim()}
            className="absolute right-2 p-2 text-[#d4af37] hover:text-[#06b6d4] disabled:opacity-30 transition-colors"
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}
