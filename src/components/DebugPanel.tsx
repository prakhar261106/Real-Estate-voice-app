import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function DebugPanel({ isVisible, onClose }: { isVisible: boolean; onClose: () => void }) {
  const [debugInfo, setDebugInfo] = useState<any>(null);

  useEffect(() => {
    if (isVisible) {
      const fetchData = async () => {
        try {
          const res2 = await fetch('/api/debug');
          const data2 = await res2.json();
          setDebugInfo(data2);
        } catch (e) {
          console.error('[DebugPanel] Failed to fetch debug data', e);
        }
      };
      fetchData();
      const interval = setInterval(fetchData, 5000);
      return () => clearInterval(interval);
    }
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 300 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 300 }}
        className="fixed top-0 right-0 h-screen w-80 bg-gray-900/95 backdrop-blur-xl border-l border-white/10 z-50 overflow-y-auto p-4 text-white"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold font-mono text-purple-400">DEBUG CONSOLE</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>
        </div>

        <div className="space-y-6">
          <section>
            <h3 className="text-sm font-semibold mb-3 border-b border-white/10 pb-1">SERVER DIAGNOSTICS</h3>
            <div className="text-xs font-mono text-gray-400 space-y-1">
              <div className="flex justify-between">
                <span>Active Sessions:</span>
                <span className="text-white">{debugInfo?.active_sessions || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>WS Connections:</span>
                <span className="text-white">{debugInfo?.websocket_connections || 0}</span>
              </div>
              <div className="flex justify-between mt-2">
                <span>Memory (RSS):</span>
                <span className="text-white">
                  {debugInfo?.memory_usage ? (debugInfo.memory_usage.rss / 1024 / 1024).toFixed(2) + ' MB' : 'N/A'}
                </span>
              </div>
            </div>
          </section>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
