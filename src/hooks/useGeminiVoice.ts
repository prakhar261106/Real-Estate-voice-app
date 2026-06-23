import { useState, useRef, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { AudioBufferQueue } from '../AudioQueue';
import { TranscriptMessage, ConnectionState } from '../types';

const workletCode = `
class AudioRecorderWorklet extends AudioWorkletProcessor {
  constructor() {
    super();
    this.bufferSize = 4096;
    this.buffer = new Float32Array(this.bufferSize);
    this.bytesWritten = 0;
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0];
    if (input.length > 0) {
      const channelData = input[0];
      for (let i = 0; i < channelData.length; i++) {
        this.buffer[this.bytesWritten++] = channelData[i];
        if (this.bytesWritten >= this.bufferSize) {
          this.port.postMessage(this.buffer);
          this.buffer = new Float32Array(this.bufferSize);
          this.bytesWritten = 0;
        }
      }
    }
    return true;
  }
}
registerProcessor('audio-recorder-worklet', AudioRecorderWorklet);
`;

const getWorkletUrl = () => {
  const blob = new Blob([workletCode], { type: 'application/javascript' });
  return URL.createObjectURL(blob);
};

export function useGeminiVoice() {
  const [connectionState, setConnectionState] = useState<ConnectionState>('IDLE');
  const [serverState, setServerState] = useState<'LISTENING' | 'SPEAKING'>('LISTENING');
  const [messages, setMessages] = useState<TranscriptMessage[]>([]);
  const [highlightedPropertyId, setHighlightedPropertyId] = useState<string | undefined>();
  const [errorMsg, setErrorMsg] = useState("");

  const wsRef = useRef<WebSocket | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const workletNodeRef = useRef<AudioWorkletNode | null>(null);
  const audioQueueRef = useRef<AudioBufferQueue | null>(null);

  const cleanup = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach(track => track.stop());
      micStreamRef.current = null;
    }
    if (workletNodeRef.current) {
      workletNodeRef.current.disconnect();
      workletNodeRef.current = null;
    }
    if (audioQueueRef.current) {
      audioQueueRef.current.stopAll();
    }
    if (audioCtxRef.current) {
      audioCtxRef.current.close();
      audioCtxRef.current = null;
    }
    setConnectionState('IDLE');
  }, []);

  const floatTo16BitPCM = (float32Array: Float32Array) => {
    const buffer = new ArrayBuffer(float32Array.length * 2);
    const view = new DataView(buffer);
    let offset = 0;
    for (let i = 0; i < float32Array.length; i++, offset += 2) {
      let s = Math.max(-1, Math.min(1, float32Array[i]));
      view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    }
    return buffer;
  };

  const startSession = async () => {
    try {
      if (window.self !== window.top) {
        setErrorMsg("⚠️ Please run this app locally or in a new tab. Microphone access is blocked inside preview iframes.");
        setConnectionState('IDLE');
        return;
      }

      setConnectionState('CONNECTING');
      setErrorMsg("");

      // 1. Initialize Web Audio API synchronously FIRST to avoid browser permission issues
      const inputAudioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outputAudioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      audioCtxRef.current = inputAudioCtx;
      
      audioQueueRef.current = new AudioBufferQueue(outputAudioCtx, setServerState);

      // 2. Request microphone
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ 
          audio: { channelCount: 1, sampleRate: 16000, echoCancellation: true, noiseSuppression: true } 
        });
        micStreamRef.current = stream;
      } catch (micErr) {
        setErrorMsg("Microphone access denied. Please click the lock icon in your browser's address bar to allow microphone access and refresh the page.");
        setConnectionState('IDLE');
        return; // Stop here if mic is denied
      }

      // Resume context if suspended
      if (inputAudioCtx.state === 'suspended') {
        await inputAudioCtx.resume();
      }
      if (outputAudioCtx.state === 'suspended') {
        await outputAudioCtx.resume();
      }

      try {
        const workletUrl = getWorkletUrl();
        await inputAudioCtx.audioWorklet.addModule(workletUrl);
      } catch (err) {
        console.error("Failed to load AudioWorklet from blob URL:", err);
        setErrorMsg(`Failed to load AudioWorklet via Blob URL. Check console for details.`);
        setConnectionState('IDLE');
        return;
      }

      // 3. Establish WebSocket connection
      const WS_URL = import.meta.env.VITE_BACKEND_WS_URL || "ws://localhost:3001/api/voice";
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = async () => {
        setConnectionState('CONNECTED');
        setServerState('LISTENING');

        try {
          const source = inputAudioCtx.createMediaStreamSource(stream);
          const workletNode = new AudioWorkletNode(inputAudioCtx, "audio-recorder-worklet");
          workletNodeRef.current = workletNode;

          workletNode.port.onmessage = (event) => {
            if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
              const float32Array: Float32Array = event.data;
              const pcmBuffer = floatTo16BitPCM(float32Array);
              
              const base64 = window.btoa(String.fromCharCode(...new Uint8Array(pcmBuffer)));
              
              wsRef.current.send(JSON.stringify({ audio: base64 }));
              
              // Barge-in check
              const maxAmp = Math.max(...float32Array);
              if (maxAmp > 0.05 && audioQueueRef.current?.isCurrentlyPlaying()) {
                wsRef.current.send(JSON.stringify({ clientContent: { turnComplete: true } }));
                audioQueueRef.current.stopAll();
              }
            }
          };

          source.connect(workletNode);
          workletNode.connect(inputAudioCtx.destination);
          
        } catch (nodeErr) {
          setErrorMsg("Error initializing audio processor.");
          cleanup();
        }
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.error) {
           setErrorMsg(data.error);
           cleanup();
           return;
        }

        if (data.interrupted) {
          audioQueueRef.current?.stopAll();
          return;
        }

        if (data.functionCall) {
          if (data.functionCall.name === "highlight_property") {
             const args = data.functionCall.args;
             if (args && args.property_id) {
               setHighlightedPropertyId(args.property_id);
             }
          }
        }

        if (data.text) {
          setMessages(prev => {
            const last = prev[prev.length - 1];
            if (last && last.speaker === 'AGENT') {
               const updated = [...prev];
               updated[updated.length - 1] = { ...last, text: last.text + data.text };
               return updated;
            }
            return [...prev, {
              id: uuidv4(),
              speaker: 'AGENT',
              text: data.text,
              timestamp: new Date()
            }];
          });
        }

        if (data.audio) {
           setServerState('SPEAKING');
           audioQueueRef.current?.enqueueAndPlay(data.audio);
        }
      };

      ws.onerror = () => {
        setConnectionState(prev => {
           if (prev === 'CONNECTING') {
              setErrorMsg("Failed to reach server.");
           }
           return prev;
        });
        cleanup();
      };
      
      ws.onclose = () => {
        cleanup();
      };

    } catch (e: any) {
      setErrorMsg(e.message || "Failed to start session");
      cleanup();
    }
  };

  const sendText = useCallback((text: string) => {
    setMessages(prev => [...prev, {
      id: uuidv4(),
      speaker: 'USER',
      text,
      timestamp: new Date()
    }]);

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ text }));
      // Tell server the turn is complete so it processes it
      wsRef.current.send(JSON.stringify({ clientContent: { turnComplete: true } }));
    }
  }, []);

  useEffect(() => {
    return () => cleanup();
  }, [cleanup]);

  return {
    connectionState,
    serverState,
    messages,
    highlightedPropertyId,
    errorMsg,
    startSession,
    cleanup,
    sendText
  };
}
