// Pure TypeScript/JS WAV audio encoder for browser microphone recording

export function bufferToWav(buffer: AudioBuffer): Blob {
  const numOfChan = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const format = 1; // Raw PCM
  const bitDepth = 16;
  
  let result;
  if (numOfChan === 2) {
    result = interleave(buffer.getChannelData(0), buffer.getChannelData(1));
  } else {
    result = buffer.getChannelData(0);
  }
  
  const bufferLength = result.length;
  const arrayBuffer = new ArrayBuffer(44 + bufferLength * 2);
  const view = new DataView(arrayBuffer);
  
  /* RIFF identifier */
  writeString(view, 0, 'RIFF');
  /* file length */
  view.setUint32(4, 36 + bufferLength * 2, true);
  /* RIFF type */
  writeString(view, 8, 'WAVE');
  /* format chunk identifier */
  writeString(view, 12, 'fmt ');
  /* format chunk length */
  view.setUint32(16, 16, true);
  /* sample format (raw PCM) */
  view.setUint16(20, format, true);
  /* channel count */
  view.setUint16(22, numOfChan, true);
  /* sample rate */
  view.setUint32(24, sampleRate, true);
  /* byte rate (sample rate * block align) */
  view.setUint32(28, sampleRate * numOfChan * (bitDepth / 8), true);
  /* block align (channel count * bytes per sample) */
  view.setUint16(32, numOfChan * (bitDepth / 8), true);
  /* bits per sample */
  view.setUint16(34, bitDepth, true);
  /* data chunk identifier */
  writeString(view, 36, 'data');
  /* data chunk length */
  view.setUint32(40, bufferLength * 2, true);
  
  // Write PCM samples
  floatTo16BitPCM(view, 44, result);
  
  return new Blob([arrayBuffer], { type: 'audio/wav' });
}

function interleave(inputL: Float32Array, inputR: Float32Array): Float32Array {
  const length = inputL.length + inputR.length;
  const result = new Float32Array(length);
  
  let index = 0;
  let inputIndex = 0;
  
  while (index < length) {
    result[index++] = inputL[inputIndex];
    result[index++] = inputR[inputIndex];
    inputIndex++;
  }
  return result;
}

function floatTo16BitPCM(output: DataView, offset: number, input: Float32Array) {
  for (let i = 0; i < input.length; i++, offset += 2) {
    let s = Math.max(-1, Math.min(1, input[i]));
    output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
  }
}

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

export class AudioRecorder {
  private audioContext: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private processor: ScriptProcessorNode | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private leftChannel: Float32Array[] = [];
  private recordingLength = 0;
  private sampleRate = 44100;
  private isRecording = false;

  async start() {
    this.leftChannel = [];
    this.recordingLength = 0;
    this.isRecording = true;

    this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    
    // Create AudioContext
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    this.audioContext = new AudioContextClass();
    this.sampleRate = this.audioContext.sampleRate;
    
    // Create Nodes
    this.source = this.audioContext.createMediaStreamSource(this.mediaStream);
    
    // buffer size 2048, 1 input channel, 1 output channel
    this.processor = this.audioContext.createScriptProcessor(2048, 1, 1);
    
    this.processor.onaudioprocess = (e) => {
      if (!this.isRecording) return;
      const left = e.inputBuffer.getChannelData(0);
      this.leftChannel.push(new Float32Array(left));
      this.recordingLength += 2048;
    };
    
    this.source.connect(this.processor);
    this.processor.connect(this.audioContext.destination);
  }

  async stop(): Promise<Blob> {
    this.isRecording = false;

    // Disconnect nodes
    if (this.processor) {
      this.processor.disconnect();
    }
    if (this.source) {
      this.source.disconnect();
    }
    
    // Stop tracks
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
    }

    // Close AudioContext
    if (this.audioContext) {
      await this.audioContext.close();
    }

    // Flatten left channel buffer
    const mergedBuffer = new Float32Array(this.recordingLength);
    let offset = 0;
    for (let i = 0; i < this.leftChannel.length; i++) {
      const buffer = this.leftChannel[i];
      mergedBuffer.set(buffer, offset);
      offset += buffer.length;
    }

    // Create AudioBuffer
    // We create a dummy audio context to allocate AudioBuffer in non-main threads or just do it
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new AudioContextClass();
    const audioBuffer = ctx.createBuffer(1, mergedBuffer.length, this.sampleRate);
    audioBuffer.copyToChannel(mergedBuffer, 0);
    await ctx.close();

    // Encode to WAV
    return bufferToWav(audioBuffer);
  }
}
