export type AspectRatio = '16:9' | '9:16' | '1:1' | '4:3';

export type VideoStyle =
  | 'photorealistic'
  | 'cinematic'
  | 'cyberpunk'
  | 'anime'
  | '3d_animation'
  | 'documentary'
  | 'vintage_vhs'
  | 'synthwave'
  | 'fantasy'
  | 'minimal_motion';

export type CameraMotion =
  | 'pan_left'
  | 'pan_right'
  | 'zoom_in'
  | 'zoom_out'
  | 'drone_flythrough'
  | 'orbit_360'
  | 'tilt_up'
  | 'tilt_down'
  | 'slow_motion'
  | 'static';

export type AtmosphereEffect =
  | 'particles'
  | 'rain'
  | 'dust_motes'
  | 'lens_flare'
  | 'cyber_grid'
  | 'film_grain'
  | 'bokeh'
  | 'fog'
  | 'none';

export type TransitionType = 'crossfade' | 'wipe_left' | 'zoom_blur' | 'glitch' | 'fade_black';

export type SoundtrackMood =
  | 'cinematic_epic'
  | 'cyber_ambient'
  | 'peaceful_nature'
  | 'retro_synth'
  | 'lofi_chill'
  | 'tension_drone'
  | 'none';

export interface Scene {
  id: string;
  title: string;
  duration: number; // in seconds (e.g. 3, 4, 5)
  visualPrompt: string;
  imageUrl?: string;
  cameraMotion: CameraMotion;
  atmosphereEffect: AtmosphereEffect;
  transition: TransitionType;
  narration?: string;
  subtitle?: string;
  moodColor?: string;
  cameraSpeed?: number; // 0.5 to 2.0
  voiceAudioUrl?: string; // Custom generated TTS audio for this specific scene
}

export interface GeneratedMusicTrack {
  id: string;
  title: string;
  prompt: string;
  genre: string;
  tempo: string;
  duration: number;
  audioUrl: string;
  mimeType: string;
  lyrics?: string;
  model: 'lyria-3-clip-preview' | 'lyria-3-pro-preview' | string;
  createdAt: string;
  isApplied?: boolean;
}

export interface GeneratedVoiceTrack {
  id: string;
  text: string;
  voiceName: string;
  language: string;
  speed: number;
  pitch: number;
  emotion: string;
  audioUrl: string;
  source: string;
  createdAt: string;
  targetSceneIndex?: number;
}

export type ColorGradingPreset =
  | 'none'
  | 'teal_orange'
  | 'warm_vintage'
  | 'cyber_neon'
  | 'bleach_bypass'
  | 'noir_bw'
  | 'golden_hour'
  | 'kodachrome'
  | 'scifi_matrix';

export interface PostProcessingFilters {
  enabled: boolean;
  filmGrain: number; // 0 to 100
  grainSize: 'fine' | 'medium' | 'coarse';
  chromaticAberration: number; // 0 to 15 (px RGB offset)
  vignette: number; // 0 to 100
  vignetteFeather: number; // 20 to 100
  bloomGlow: number; // 0 to 100 (Black Pro-Mist / Halation diffusion)
  contrast: number; // 70 to 140 (default 100)
  saturation: number; // 0 to 180 (default 100)
  brightness: number; // 70 to 130 (default 100)
  colorGrading: ColorGradingPreset;
  scanlines: number; // 0 to 100 (CRT retro scanlines)
  sharpen: number; // 0 to 100 (AI detail boost)
  lensDistortion: number; // 0 to 50 (anamorphic lens curvature)
}

export interface VideoProject {
  id: string;
  title: string;
  description: string;
  aspectRatio: AspectRatio;
  style: VideoStyle;
  fps: number; // 24, 30, 60
  resolution: '720p' | '1080p';
  soundtrack: SoundtrackMood;
  customAudioUrl?: string; // Custom Lyria generated music track
  customAudioTitle?: string;
  enableVoiceover: boolean;
  voiceGender: 'pt-BR-female' | 'pt-BR-male' | 'en-US';
  scenes: Scene[];
  createdAt: string;
  updatedAt: string;
  veoOperationName?: string;
  isVeoRendered?: boolean;
  renderedVideoUrl?: string;
  postProcessing?: PostProcessingFilters;
}

export interface EnhancedPromptResult {
  enhancedPrompt: string;
  cameraDirection: string;
  lightingAndColor: string;
  soundAtmosphere: string;
  suggestedMusicTempo: string;
  visualTags: string[];
}

export interface PresetTemplate {
  id: string;
  name: string;
  description: string;
  badge: string;
  category: 'cinema' | 'commercial' | 'social' | 'animation';
  style: VideoStyle;
  aspectRatio: AspectRatio;
  soundtrack: SoundtrackMood;
  scenes: Omit<Scene, 'id'>[];
}

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  createdAt?: string;
  lastLoginAt?: string;
}

export type NavigationView = 'home' | 'studio' | 'my_gallery' | 'inspiration';

export interface InspirationItem {
  id: string;
  title: string;
  creator: string;
  avatarUrl?: string;
  category: 'cinema' | 'commercial' | 'social' | 'animation' | 'scifi' | 'nature' | 'retro';
  style: VideoStyle;
  aspectRatio: AspectRatio;
  duration: number;
  description: string;
  tags: string[];
  likesCount: number;
  viewsCount: number;
  featured?: boolean;
  soundtrack: SoundtrackMood;
  scenes: Omit<Scene, 'id'>[];
  coverImageUrl?: string;
  colorPalette?: string[];
}

