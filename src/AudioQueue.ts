export class AudioBufferQueue {
  private context: AudioContext;
  private nextPlayTime: number = 0;
  private bufferQueue: AudioBuffer[] = [];
  private isPlaying: boolean = false;
  private onStateChange: (state: 'LISTENING' | 'SPEAKING') => void;

  constructor(audioCtx: AudioContext, onStateChange: (state: 'LISTENING' | 'SPEAKING') => void) {
    this.context = audioCtx;
    this.onStateChange = onStateChange;
  }

  public enqueueAndPlay(base64Audio: string) {
    // 1. Convert Base64 to Int16 PCM
    const binaryString = window.atob(base64Audio);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) { 
        bytes[i] = binaryString.charCodeAt(i); 
    }
    const int16Data = new Int16Array(bytes.buffer);

    // 2. Convert Int16 to Float32 for Web Audio API
    const float32Data = new Float32Array(int16Data.length);
    for (let i = 0; i < int16Data.length; i++) {
        float32Data[i] = int16Data[i] / 32768.0;
    }

    // 3. Create AudioBuffer
    const audioBuffer = this.context.createBuffer(1, float32Data.length, 24000);
    audioBuffer.getChannelData(0).set(float32Data);
    
    this.bufferQueue.push(audioBuffer);

    // 4. Require at least 4 chunks (Jitter Buffer) before starting playback
    if (!this.isPlaying && this.bufferQueue.length >= 4) {
        this.isPlaying = true;
        if (this.context.state === "suspended") {
            this.context.resume();
        }
        this.nextPlayTime = this.context.currentTime + 0.1; // 100ms safety gap
        this.playNext();
    }
  }

  private playNext() {
    if (this.bufferQueue.length === 0) {
        this.isPlaying = false;
        this.onStateChange('LISTENING');
        return;
    }

    // Resynchronize if buffer underran
    if (this.context.currentTime > this.nextPlayTime) {
        this.nextPlayTime = this.context.currentTime + 0.05;
    }

    const buffer = this.bufferQueue.shift()!;
    const source = this.context.createBufferSource();
    source.buffer = buffer;
    source.connect(this.context.destination);
    
    source.start(this.nextPlayTime);
    this.nextPlayTime += buffer.duration;

    // Schedule next chunk exactly when this one ends
    source.onended = () => {
        this.playNext();
    };
  }

  public stopAll() {
    this.bufferQueue = [];
    this.isPlaying = false;
    this.nextPlayTime = 0;
    this.onStateChange('LISTENING');
  }

  public isCurrentlyPlaying() {
    return this.isPlaying;
  }
}
