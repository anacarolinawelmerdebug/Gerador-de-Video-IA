import { SoundtrackMood } from '../types';

class SoundSynthesizer {
  private ctx: AudioContext | null = null;
  private isPlaying = false;
  private activeNodes: (AudioNode | number)[] = [];
  private currentMood: SoundtrackMood = 'none';

  private initContext(): AudioContext {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioContextClass();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public getAudioContext(): AudioContext {
    return this.initContext();
  }

  public getAudioDestinationNode(): MediaStreamAudioDestinationNode | null {
    try {
      const ctx = this.initContext();
      return ctx.createMediaStreamDestination();
    } catch {
      return null;
    }
  }

  public playSoundtrack(mood: SoundtrackMood, destinationNode?: AudioNode) {
    this.stopSoundtrack();
    if (mood === 'none') return;

    this.currentMood = mood;
    this.isPlaying = true;
    const ctx = this.initContext();
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.35, ctx.currentTime);

    masterGain.connect(ctx.destination);
    if (destinationNode) {
      masterGain.connect(destinationNode);
    }
    this.activeNodes.push(masterGain);

    switch (mood) {
      case 'cyber_ambient':
        this.createCyberAmbient(ctx, masterGain);
        break;
      case 'cinematic_epic':
        this.createCinematicEpic(ctx, masterGain);
        break;
      case 'peaceful_nature':
        this.createNatureAmbient(ctx, masterGain);
        break;
      case 'retro_synth':
        this.createRetroSynth(ctx, masterGain);
        break;
      case 'lofi_chill':
        this.createLofiChill(ctx, masterGain);
        break;
      case 'tension_drone':
        this.createTensionDrone(ctx, masterGain);
        break;
    }
  }

  public stopSoundtrack() {
    this.isPlaying = false;
    for (const node of this.activeNodes) {
      if (typeof node === 'number') {
        clearInterval(node);
      } else if (node && typeof (node as any).stop === 'function') {
        try {
          (node as any).stop();
        } catch {}
      } else if (node && typeof (node as any).disconnect === 'function') {
        try {
          (node as any).disconnect();
        } catch {}
      }
    }
    this.activeNodes = [];
  }

  // Cyber ambient with modulated pad + sub bass
  private createCyberAmbient(ctx: AudioContext, destination: AudioNode) {
    const freqs = [65.41, 130.81, 196.0, 246.94]; // C2, C3, G3, B3
    freqs.forEach((f, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = idx % 2 === 0 ? 'sawtooth' : 'triangle';
      osc.frequency.setValueAtTime(f, ctx.currentTime);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(320 + idx * 80, ctx.currentTime);

      gain.gain.setValueAtTime(0.08, ctx.currentTime);

      // Slow LFO modulation
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.setValueAtTime(0.15 + idx * 0.05, ctx.currentTime);
      lfoGain.gain.setValueAtTime(150, ctx.currentTime);
      lfo.connect(filter.frequency);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(destination);

      osc.start();
      lfo.start();
      this.activeNodes.push(osc, lfo, gain, filter);
    });
  }

  // Cinematic epic pad with deep brass harmonics
  private createCinematicEpic(ctx: AudioContext, destination: AudioNode) {
    const rootNotes = [55.0, 110.0, 164.81, 220.0]; // A1, A2, E3, A3
    rootNotes.forEach((f, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(f, ctx.currentTime);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(400, ctx.currentTime);

      gain.gain.setValueAtTime(0.06, ctx.currentTime);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(destination);

      osc.start();
      this.activeNodes.push(osc, gain, filter);
    });

    // Slow cinematic pulse
    const interval = window.setInterval(() => {
      if (!this.isPlaying) return;
      try {
        const pulse = ctx.createOscillator();
        const pGain = ctx.createGain();
        pulse.type = 'sine';
        pulse.frequency.setValueAtTime(45, ctx.currentTime);
        pulse.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 1.2);

        pGain.gain.setValueAtTime(0.3, ctx.currentTime);
        pGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);

        pulse.connect(pGain);
        pGain.connect(destination);
        pulse.start();
        pulse.stop(ctx.currentTime + 1.3);
      } catch {}
    }, 2800);
    this.activeNodes.push(interval);
  }

  // Peaceful nature ambient
  private createNatureAmbient(ctx: AudioContext, destination: AudioNode) {
    const freqs = [174.61, 220.0, 261.63, 329.63]; // F3, A3, C4, E4
    freqs.forEach((f) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, ctx.currentTime);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      osc.connect(gain);
      gain.connect(destination);
      osc.start();
      this.activeNodes.push(osc, gain);
    });
  }

  // Retro synthwave
  private createRetroSynth(ctx: AudioContext, destination: AudioNode) {
    const bass = ctx.createOscillator();
    const bGain = ctx.createGain();
    bass.type = 'sawtooth';
    bass.frequency.setValueAtTime(65.41, ctx.currentTime);
    bGain.gain.setValueAtTime(0.1, ctx.currentTime);
    bass.connect(bGain);
    bGain.connect(destination);
    bass.start();
    this.activeNodes.push(bass, bGain);

    const chords = [130.81, 164.81, 196.0, 246.94];
    chords.forEach((f) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(f, ctx.currentTime);
      gain.gain.setValueAtTime(0.02, ctx.currentTime);
      osc.connect(gain);
      gain.connect(destination);
      osc.start();
      this.activeNodes.push(osc, gain);
    });
  }

  // Lo-Fi chill chords
  private createLofiChill(ctx: AudioContext, destination: AudioNode) {
    const lofiNotes = [146.83, 174.61, 220.0, 261.63]; // D3, F3, A3, C4
    lofiNotes.forEach((f) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, ctx.currentTime);
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(450, ctx.currentTime);

      gain.gain.setValueAtTime(0.07, ctx.currentTime);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(destination);
      osc.start();
      this.activeNodes.push(osc, gain, filter);
    });
  }

  // Tension drone
  private createTensionDrone(ctx: AudioContext, destination: AudioNode) {
    const drone = ctx.createOscillator();
    const gain = ctx.createGain();
    drone.type = 'sawtooth';
    drone.frequency.setValueAtTime(40, ctx.currentTime);
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    drone.connect(gain);
    gain.connect(destination);
    drone.start();
    this.activeNodes.push(drone, gain);
  }

  // Play transition swoosh / impact sound effect
  public playTransitionSFX(type: string = 'swoosh') {
    try {
      const ctx = this.initContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      if (type === 'impact') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(140, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 0.6);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
      } else {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(400, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.35);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      }

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.7);
    } catch {}
  }

  // Voiceover narration using Web Speech API
  public speakNarration(text: string, voiceGender: string = 'pt-BR-female') {
    if (!('speechSynthesis' in window) || !text) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      const voices = window.speechSynthesis.getVoices();

      // Find best matching voice
      const targetLang = voiceGender.startsWith('en') ? 'en' : 'pt';
      const matchingVoice = voices.find((v) => v.lang.toLowerCase().includes(targetLang));
      if (matchingVoice) {
        utterance.voice = matchingVoice;
      }
      utterance.rate = 1.0;
      utterance.pitch = voiceGender.includes('male') ? 0.9 : 1.1;

      window.speechSynthesis.speak(utterance);
    } catch {}
  }

  public stopNarration() {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }
}

export const soundSynth = new SoundSynthesizer();
