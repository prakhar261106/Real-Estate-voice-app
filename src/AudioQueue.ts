export class AudioBufferQueue {
  private audioCtx: AudioContext;
  private isPlaying: boolean = false;
  private currentSourceNodes: AudioBufferSourceNode[] = [];
  private nextPlayTime: number = 0;
  private onStateChange: (state: 'LISTENING' | 'SPEAKING') => void;

  constructor(audioCtx: AudioContext, onStateChange: (state: 'LISTENING' | 'SPEAKING') => void) {
    this.audioCtx = audioCtx;
    this.onStateChange = onStateChange;
  }

  public enqueueAndPlay(base64Audio: string) {
    if (!this.isPlaying) {
      this.isPlaying = true;
      if (this.audioCtx.state === "suspended") {
        this.audioCtx.resume();
      }
      this.nextPlayTime = this.audioCtx.currentTime;
    }

    const arrayBuffer = this.base64ToArrayBuffer(base64Audio);
    const float32Array = this.pcm16BitToFloat32(arrayBuffer);

    // Explicitly create buffer with 24000 sample rate
    const audioBuffer = this.audioCtx.createBuffer(1, float32Array.length, 24000);
    audioBuffer.getChannelData(0).set(float32Array);

    const source = this.audioCtx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(this.audioCtx.destination);

    const playTime = Math.max(this.audioCtx.currentTime, this.nextPlayTime);
    source.start(playTime);
    this.nextPlayTime = playTime + audioBuffer.duration;

    this.currentSourceNodes.push(source);

    source.onended = () => {
      const idx = this.currentSourceNodes.indexOf(source);
      if (idx > -1) {
        this.currentSourceNodes.splice(idx, 1);
      }
      
      // If we've finished playing everything scheduled, return to listening state
      if (this.currentSourceNodes.length === 0 && this.audioCtx.currentTime >= this.nextPlayTime) {
        this.isPlaying = false;
        this.onStateChange('LISTENING');
      }
    };
  }

  public stopAll() {
    this.currentSourceNodes.forEach(node => {
      try { node.stop(); } catch (e) {}
    });
    this.currentSourceNodes = [];
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
