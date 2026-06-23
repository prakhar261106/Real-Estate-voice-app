export class AudioBufferQueue {
  private audioCtx: AudioContext;
  private isPlaying: boolean = false;
  private currentSourceNodes: AudioBufferSourceNode[] = [];
  private nextPlayTime: number = 0;
  private onStateChange: (state: 'LISTENING' | 'SPEAKING') => void;
  // Jitter buffer settings
  private jitterBuffer: Float32Array[] = [];
  private readonly BUFFER_THRESHOLD = 3;

  constructor(audioCtx: AudioContext, onStateChange: (state: 'LISTENING' | 'SPEAKING') => void) {
    this.audioCtx = audioCtx;
    this.onStateChange = onStateChange;
  }

  public enqueueAndPlay(base64Audio: string) {
    const arrayBuffer = this.base64ToArrayBuffer(base64Audio);
    const float32Array = this.pcm16BitToFloat32(arrayBuffer);
    
    // Add to jitter buffer
    this.jitterBuffer.push(float32Array);

    if (!this.isPlaying) {
      if (this.jitterBuffer.length >= this.BUFFER_THRESHOLD) {
        this.isPlaying = true;
        if (this.audioCtx.state === "suspended") {
          this.audioCtx.resume();
        }
        this.nextPlayTime = this.audioCtx.currentTime + 0.1; // Initial safety buffer
        this.scheduleBuffer();
      }
    } else {
      this.scheduleBuffer();
    }
  }

  private scheduleBuffer() {
    while (this.jitterBuffer.length > 0) {
      const float32Array = this.jitterBuffer.shift()!;
      
      // Explicitly create buffer with 24000 sample rate
      const audioBuffer = this.audioCtx.createBuffer(1, float32Array.length, 24000);
      audioBuffer.getChannelData(0).set(float32Array);

      const source = this.audioCtx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(this.audioCtx.destination);

      // Check if the buffer ran dry and the context time overtook our scheduled time
      if (this.audioCtx.currentTime >= this.nextPlayTime) {
          console.warn('[AudioQueue] Buffer underrun detected. Resyncing play time.');
          // Add a 100ms safety buffer to allow chunks to build up again
          this.nextPlayTime = this.audioCtx.currentTime + 0.1; 
      }

      source.start(this.nextPlayTime);
      this.nextPlayTime += audioBuffer.duration;

      this.currentSourceNodes.push(source);

      source.onended = () => {
        const idx = this.currentSourceNodes.indexOf(source);
        if (idx > -1) {
          this.currentSourceNodes.splice(idx, 1);
        }
        
        // If we've finished playing everything scheduled, return to listening state
        if (this.currentSourceNodes.length === 0 && this.audioCtx.currentTime >= this.nextPlayTime && this.jitterBuffer.length === 0) {
          this.isPlaying = false;
          this.onStateChange('LISTENING');
        }
      };
    }
  }

  public stopAll() {
    this.currentSourceNodes.forEach(node => {
      try { node.stop(); } catch (e) {}
    });
    this.currentSourceNodes = [];
    this.jitterBuffer = [];
    this.isPlaying = false;
    this.nextPlayTime = 0;
    this.onStateChange('LISTENING');
  }

  public isCurrentlyPlaying() {
    return this.isPlaying;
  }

  private base64ToArrayBuffer(base64: string) {
    const binaryString = window.atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }

  private pcm16BitToFloat32(buffer: ArrayBuffer) {
    const int16Array = new Int16Array(buffer);
    const float32Array = new Float32Array(int16Array.length);
    for (let i = 0; i < int16Array.length; i++) {
      float32Array[i] = int16Array[i] / 32768.0;
    }
    return float32Array;
  }
}
