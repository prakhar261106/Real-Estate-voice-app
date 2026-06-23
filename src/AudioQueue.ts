export class AudioBufferQueue {
  private audioCtx: AudioContext;
  private queue: Float32Array[] = [];
  private isPlaying: boolean = false;
  private currentSourceNodes: AudioBufferSourceNode[] = [];
  private nextStartTime: number = 0;
  private onStateChange: (state: 'LISTENING' | 'SPEAKING') => void;

  constructor(audioCtx: AudioContext, onStateChange: (state: 'LISTENING' | 'SPEAKING') => void) {
    this.audioCtx = audioCtx;
    this.onStateChange = onStateChange;
  }

  public enqueueAndPlay(base64Audio: string) {
    const arrayBuffer = this.base64ToArrayBuffer(base64Audio);
    const float32Array = this.pcm16BitToFloat32(arrayBuffer);
    this.queue.push(float32Array);

    if (!this.isPlaying) {
      this.isPlaying = true;
      if (this.audioCtx.state === "suspended") {
        this.audioCtx.resume();
      }
      this.playNext();
    }
  }

  private playNext() {
    if (this.queue.length === 0) {
      this.isPlaying = false;
      this.onStateChange('LISTENING');
      return;
    }

    const chunk = this.queue.shift()!;
    const audioBuffer = this.audioCtx.createBuffer(1, chunk.length, 24000);
    audioBuffer.getChannelData(0).set(chunk);

    const source = this.audioCtx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(this.audioCtx.destination);

    const currentTime = this.audioCtx.currentTime;
    if (this.nextStartTime < currentTime) {
      this.nextStartTime = currentTime;
    }

    source.start(this.nextStartTime);
    this.nextStartTime += audioBuffer.duration;

    this.currentSourceNodes.push(source);

    source.onended = () => {
      const idx = this.currentSourceNodes.indexOf(source);
      if (idx > -1) {
        this.currentSourceNodes.splice(idx, 1);
      }
      this.playNext();
    };
  }

  public stopAll() {
    this.currentSourceNodes.forEach(node => {
      try { node.stop(); } catch (e) {}
    });
    this.currentSourceNodes = [];
    this.queue = [];
    this.isPlaying = false;
    this.nextStartTime = 0;
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
