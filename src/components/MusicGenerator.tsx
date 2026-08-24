import React, { useState, useEffect, useRef } from 'react';
import {
  Music,
  Sparkles,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  Download,
  Check,
  CheckCircle2,
  Layers,
  Wand2,
  Sliders,
  Disc3,
  Clock,
  Radio,
  Share2,
  Trash2,
  FileAudio,
  Headphones,
} from 'lucide-react';
import { GeneratedMusicTrack, Scene, VideoProject } from '../types';
import { generateMusicAPI, suggestMusicPromptsAPI, MusicSuggestion } from '../services/geminiService';

interface MusicGeneratorProps {
  project: VideoProject;
  onUpdateProject: (updated: Partial<VideoProject>) => void;
  onShowToast: (msg: string) => void;
}

const MUSIC_GENRE_PRESETS = [
  {
    name: 'Orquestral Épico',
    genre: 'Cinematic Orchestral',
    tempo: '110 bpm',
    desc: 'Cordas intensas, trompas triunfantes e percussão de cinema',
    icon: '🎻',
  },
  {
    name: 'Cyberpunk Synth',
    genre: 'Cyberpunk Dark Synth',
    tempo: '128 bpm',
    desc: 'Sintetizadores analógicos futuristas e baixo pulsante',
    icon: '⚡',
  },
  {
    name: 'Lo-Fi Chill',
    genre: 'Lo-Fi Chill Hop',
    tempo: '80 bpm',
    desc: 'Piano nostálgico, batida suave e texturas quentes',
    icon: '☕',
  },
  {
    name: 'Suspense & Drone',
    genre: 'Cinematic Dark Ambient',
    tempo: '70 bpm',
    desc: 'Ambiência profunda, tensão crescente e texturas cósmicas',
    icon: '🌌',
  },
  {
    name: 'Eletrônica EDM',
    genre: 'High-Energy Electronic',
    tempo: '135 bpm',
    desc: 'Drops dinâmicos, arpeggios brilhantes e ritmo acelerado',
    icon: '🎛️',
  },
  {
    name: 'Acústico & Piano',
    genre: 'Acoustic Piano & Strings',
    tempo: '90 bpm',
    desc: 'Melodia expressiva ao piano com arranjo sutil e emotivo',
    icon: '🎹',
  },
];

export const MusicGenerator: React.FC<MusicGeneratorProps> = ({
  project,
  onUpdateProject,
  onShowToast,
}) => {
  const [prompt, setPrompt] = useState<string>('Trilha cinematográfica com instrumentos orquestrais, atmosfera profunda e clímax dinâmico');
  const [model, setModel] = useState<'lyria-3-clip-preview' | 'lyria-3-pro-preview'>('lyria-3-clip-preview');
  const [duration, setDuration] = useState<number>(30);
  const [selectedGenre, setSelectedGenre] = useState<string>('Cinematic Orchestral');
  const [tempo, setTempo] = useState<string>('110 bpm');
  const [instrumental, setInstrumental] = useState<boolean>(true);
  const [useReferenceScene, setUseReferenceScene] = useState<boolean>(true);

  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isSuggesting, setIsSuggesting] = useState<boolean>(false);
  const [suggestions, setSuggestions] = useState<MusicSuggestion[]>([]);

  // Generated tracks history
  const [tracks, setTracks] = useState<GeneratedMusicTrack[]>(() => {
    try {
      const saved = localStorage.getItem('cineai_music_tracks');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  const [currentTrack, setCurrentTrack] = useState<GeneratedMusicTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [trackDuration, setTrackDuration] = useState<number>(30);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Save tracks to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('cineai_music_tracks', JSON.stringify(tracks));
    } catch {}
  }, [tracks]);

  // Handle Audio events
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onLoadedMeta = () => setTrackDuration(audio.duration || duration);
    const onEnded = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMeta);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMeta);
      audio.removeEventListener('ended', onEnded);
    };
  }, [currentTrack, duration]);

  // Real-time canvas visualizer
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let phase = 0;
    const renderWave = () => {
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      const barCount = 48;
      const barWidth = width / barCount - 2;

      for (let i = 0; i < barCount; i++) {
        const progress = i / barCount;
        const isCurrent = currentTime / (trackDuration || 1) >= progress;

        let barHeight = 6;
        if (isPlaying) {
          const wave1 = Math.sin(phase + i * 0.35) * 0.5 + 0.5;
          const wave2 = Math.cos(phase * 1.5 + i * 0.2) * 0.5 + 0.5;
          barHeight = Math.max(6, (wave1 * 0.6 + wave2 * 0.4) * (height * 0.75));
        } else {
          barHeight = Math.sin(i * 0.2) * (height * 0.3) + height * 0.35;
        }

        const x = i * (barWidth + 2);
        const y = (height - barHeight) / 2;

        if (isCurrent) {
          ctx.fillStyle = '#38bdf8'; // Sky 400
          ctx.shadowColor = 'rgba(56, 189, 248, 0.5)';
          ctx.shadowBlur = 6;
        } else {
          ctx.fillStyle = '#334155'; // Slate 700
          ctx.shadowBlur = 0;
        }

        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, 2);
        ctx.fill();
      }

      if (isPlaying) {
        phase += 0.08;
      }
      animFrameRef.current = requestAnimationFrame(renderWave);
    };

    renderWave();

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying, currentTime, trackDuration]);

  // Toggle Play / Pause
  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  // Generate Music with Lyria
  const handleGenerateMusic = async () => {
    setIsGenerating(true);
    onShowToast(`Gerando trilha com Google ${model === 'lyria-3-pro-preview' ? 'Lyria 3 Pro' : 'Lyria 3 Clip'}...`);

    // Get active scene image as reference if enabled
    let referenceImage: string | undefined = undefined;
    if (useReferenceScene && project.scenes.length > 0) {
      const firstWithImage = project.scenes.find((s) => s.imageUrl);
      if (firstWithImage?.imageUrl) {
        referenceImage = firstWithImage.imageUrl;
      }
    }

    try {
      const res = await generateMusicAPI({
        prompt,
        model,
        duration,
        genre: selectedGenre,
        tempo,
        instrumental,
        referenceImage,
      });

      const newTrack: GeneratedMusicTrack = {
        id: 'track_' + Date.now(),
        title: res.title,
        prompt: res.prompt,
        genre: res.genre,
        tempo: res.tempo,
        duration: res.duration,
        audioUrl: res.audioUrl,
        mimeType: res.mimeType,
        lyrics: res.lyrics,
        model: res.model,
        createdAt: new Date().toISOString(),
      };

      setTracks((prev) => [newTrack, ...prev]);
      setCurrentTrack(newTrack);
      onShowToast('Música gerada com sucesso pelo Lyria!');

      if (audioRef.current) {
        audioRef.current.src = newTrack.audioUrl;
        audioRef.current.play().catch(() => {});
        setIsPlaying(true);
      }
    } catch (err: any) {
      console.error(err);
      onShowToast(err.message || 'Erro ao gerar música com Lyria');
    } finally {
      setIsGenerating(false);
    }
  };

  // Suggest Music from Video project
  const handleSuggestPrompts = async () => {
    setIsSuggesting(true);
    try {
      const list = await suggestMusicPromptsAPI(project.title, project.scenes, project.style);
      setSuggestions(list);
      onShowToast('Sugestões musicais personalizadas para seu vídeo geradas!');
    } catch (err: any) {
      onShowToast(err.message || 'Erro ao sugerir estilos');
    } finally {
      setIsSuggesting(false);
    }
  };

  // Apply track to current Video Project
  const handleApplyToProject = (track: GeneratedMusicTrack) => {
    onUpdateProject({
      customAudioUrl: track.audioUrl,
      customAudioTitle: track.title,
      soundtrack: 'none', // Use custom track instead of synth mood
    });
    onShowToast(`"${track.title}" aplicada como trilha oficial do vídeo!`);
  };

  // Remove custom audio from project
  const handleRemoveFromProject = () => {
    onUpdateProject({
      customAudioUrl: undefined,
      customAudioTitle: undefined,
      soundtrack: 'cinematic_epic',
    });
    onShowToast('Trilha personalizada removida. Restaurada trilha padrão.');
  };

  // Select existing track from history
  const handleSelectTrack = (track: GeneratedMusicTrack) => {
    setCurrentTrack(track);
    if (audioRef.current) {
      audioRef.current.src = track.audioUrl;
      audioRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  // Download track
  const handleDownloadTrack = (track: GeneratedMusicTrack) => {
    const a = document.createElement('a');
    a.href = track.audioUrl;
    a.download = `${track.title.replace(/[^a-zA-Z0-9_-]/g, '_')}.wav`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    onShowToast('Download do arquivo de áudio WAV iniciado!');
  };

  const isCurrentTrackApplied = currentTrack && project.customAudioUrl === currentTrack.audioUrl;

  return (
    <div className="flex flex-col gap-5 bg-slate-900/90 border border-slate-800 rounded-2xl p-4 lg:p-6 shadow-xl backdrop-blur-md">
      {/* Hidden native audio element */}
      <audio ref={audioRef} preload="auto" />

      {/* Header Banner with Lyria Branding */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-rose-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-rose-500/20 text-white font-bold">
            <Music className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-100">Gerador de Música IA</h2>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                Google Lyria 3
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Componha trilhas sonoras originais, instrumentais dinâmicos e ritmos cinematográficos com IA
            </p>
          </div>
        </div>

        {/* AI Suggestion Button */}
        <button
          id="btn-suggest-music"
          onClick={handleSuggestPrompts}
          disabled={isSuggesting}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 transition-all active:scale-95 disabled:opacity-50"
        >
          <Sparkles className="w-3.5 h-3.5 text-rose-400 animate-spin" />
          <span>{isSuggesting ? 'Analisando cenas...' : 'Sugerir pelo Vídeo'}</span>
        </button>
      </div>

      {/* AI Suggestions if available */}
      {suggestions.length > 0 && (
        <div className="bg-slate-950/60 border border-rose-500/20 rounded-xl p-3.5 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Sugestões do Diretor Musical IA para este Roteiro
            </span>
            <button
              onClick={() => setSuggestions([])}
              className="text-[11px] text-slate-400 hover:text-slate-200"
            >
              Fechar
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {suggestions.map((sug, idx) => (
              <div
                key={idx}
                onClick={() => {
                  setPrompt(sug.prompt);
                  setSelectedGenre(sug.genre);
                  setTempo(sug.tempo);
                  setDuration(sug.recommendedDuration || 30);
                  onShowToast(`Estilo "${sug.title}" aplicado ao gerador!`);
                }}
                className="cursor-pointer p-2.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-rose-500/40 transition-all flex flex-col gap-1 text-left"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-200">{sug.title}</span>
                  <span className="text-[10px] text-rose-400 font-mono">{sug.tempo}</span>
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-2">{sug.prompt}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Model Selection & Parameters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Lyria Model Option */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Disc3 className="w-3.5 h-3.5 text-rose-400" />
            Modelo Lyria
          </label>
          <div className="grid grid-cols-2 gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              id="model-lyria-clip-btn"
              onClick={() => setModel('lyria-3-clip-preview')}
              className={`py-1.5 px-2 rounded-lg text-xs font-medium transition-all text-center ${
                model === 'lyria-3-clip-preview'
                  ? 'bg-rose-500 text-white font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Lyria Clip (30s)
            </button>
            <button
              id="model-lyria-pro-btn"
              onClick={() => setModel('lyria-3-pro-preview')}
              className={`py-1.5 px-2 rounded-lg text-xs font-medium transition-all text-center ${
                model === 'lyria-3-pro-preview'
                  ? 'bg-rose-500 text-white font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Lyria Pro (Full)
            </button>
          </div>
        </div>

        {/* Duration */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-sky-400" />
            Duração ({duration}s)
          </label>
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            {[10, 15, 20, 30].map((sec) => (
              <button
                key={sec}
                onClick={() => setDuration(sec)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  duration === sec
                    ? 'bg-sky-500 text-white font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {sec}s
              </button>
            ))}
          </div>
        </div>

        {/* Tempo & Type */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-amber-400" />
            Estrutura
          </label>
          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setInstrumental(!instrumental)}
              className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-medium transition-all ${
                instrumental
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
              }`}
            >
              {instrumental ? 'Instrumental' : 'Com Letra / Vocal'}
            </button>
          </div>
        </div>
      </div>

      {/* Genre Preset Pills */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold text-slate-300">Estilos & Gêneros Musicais</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {MUSIC_GENRE_PRESETS.map((preset) => {
            const isSelected = selectedGenre === preset.genre;
            return (
              <button
                key={preset.name}
                onClick={() => {
                  setSelectedGenre(preset.genre);
                  setTempo(preset.tempo);
                  setPrompt(`Trilha ${preset.name.toLowerCase()} com ${preset.desc.toLowerCase()}`);
                }}
                className={`p-2.5 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                  isSelected
                    ? 'bg-rose-500/20 border-rose-500/60 shadow-md shadow-rose-500/10'
                    : 'bg-slate-950/70 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-base">{preset.icon}</span>
                  <span className="text-[10px] font-mono text-slate-400">{preset.tempo}</span>
                </div>
                <span className="text-xs font-semibold text-slate-200 truncate">{preset.name}</span>
                <span className="text-[10px] text-slate-400 line-clamp-1">{preset.desc}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Musical Prompt Textarea */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
          <span>Prompt da Música</span>
          <span className="text-[10px] text-slate-400">Descreva instrumentos, humor e ritmo</span>
        </label>
        <textarea
          id="music-prompt-input"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={3}
          className="w-full bg-slate-950 border border-slate-800 focus:border-rose-500 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 outline-none transition-all resize-none shadow-inner"
          placeholder="Ex: Trilha sonora cinematográfica orquestral, crescendo heróico de trompas e violinos staccato, bateria de ação em 120bpm..."
        />
      </div>

      {/* Reference Scene Frame checkbox */}
      <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs">
        <div className="flex items-center gap-2.5">
          <Layers className="w-4 h-4 text-sky-400" />
          <span className="text-slate-300 font-medium">Inspirar música visualmente nos quadros de cena</span>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={useReferenceScene}
            onChange={(e) => setUseReferenceScene(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-rose-500"></div>
        </label>
      </div>

      {/* Generate Music Action Button */}
      <button
        id="btn-generate-music"
        onClick={handleGenerateMusic}
        disabled={isGenerating || !prompt.trim()}
        className="w-full py-3.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-rose-500 via-pink-600 to-indigo-600 hover:from-rose-400 hover:to-indigo-500 shadow-lg shadow-rose-500/25 active:scale-[0.99] transition-all flex items-center justify-center gap-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isGenerating ? (
          <>
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <span>Gerando Áudio com Google Lyria...</span>
          </>
        ) : (
          <>
            <Music className="w-4 h-4" />
            <span>Gerar Trilha com Lyria 3</span>
          </>
        )}
      </button>

      {/* Active Track Audio Player Card */}
      {currentTrack && (
        <div className="flex flex-col gap-3 p-4 rounded-xl bg-slate-950 border border-slate-800/90 shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/30">
                <FileAudio className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-100">{currentTrack.title}</h4>
                <div className="flex items-center gap-2 text-[10px] text-slate-400">
                  <span className="px-1.5 py-0.5 rounded bg-slate-800 font-mono text-slate-300">{currentTrack.tempo}</span>
                  <span>•</span>
                  <span>{currentTrack.model}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              {isCurrentTrackApplied ? (
                <button
                  onClick={handleRemoveFromProject}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-emerald-300 bg-emerald-500/20 border border-emerald-500/40"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Trilha do Projeto Ativa</span>
                </button>
              ) : (
                <button
                  onClick={() => handleApplyToProject(currentTrack)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-rose-500 hover:bg-rose-400 shadow-sm transition-all"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Aplicar ao Vídeo</span>
                </button>
              )}

              <button
                onClick={() => handleDownloadTrack(currentTrack)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 bg-slate-900 hover:bg-slate-800 border border-slate-800"
                title="Baixar áudio WAV"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Interactive Waveform Canvas */}
          <div className="relative bg-slate-900/60 rounded-xl p-3 border border-slate-800/80 flex flex-col gap-2">
            <canvas ref={canvasRef} width={500} height={48} className="w-full h-12 rounded" />

            {/* Player Controls Bar */}
            <div className="flex items-center justify-between pt-1 text-xs">
              <div className="flex items-center gap-3">
                <button
                  onClick={togglePlay}
                  className="h-8 w-8 rounded-full bg-rose-500 hover:bg-rose-400 text-white flex items-center justify-center shadow-md transition-all active:scale-95"
                >
                  {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white ml-0.5" />}
                </button>
                <span className="font-mono text-slate-300 text-xs">
                  {Math.floor(currentTime)}s / {Math.floor(trackDuration)}s
                </span>
              </div>

              {currentTrack.lyrics && (
                <span className="text-[11px] text-slate-400 italic truncate max-w-[240px]">
                  {currentTrack.lyrics}
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Generated Tracks Library */}
      {tracks.length > 0 && (
        <div className="flex flex-col gap-2.5 pt-2 border-t border-slate-800/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Headphones className="w-3.5 h-3.5 text-rose-400" />
              Biblioteca de Trilhas Geradas ({tracks.length})
            </span>
            <button
              onClick={() => {
                setTracks([]);
                localStorage.removeItem('cineai_music_tracks');
              }}
              className="text-[10px] text-slate-500 hover:text-rose-400 flex items-center gap-1"
            >
              <Trash2 className="w-3 h-3" />
              <span>Limpar</span>
            </button>
          </div>

          <div className="grid grid-cols-1 gap-2 max-h-56 overflow-y-auto pr-1">
            {tracks.map((t) => {
              const isSelected = currentTrack?.id === t.id;
              const isApplied = project.customAudioUrl === t.audioUrl;
              return (
                <div
                  key={t.id}
                  className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                    isSelected
                      ? 'bg-rose-500/10 border-rose-500/40'
                      : 'bg-slate-950/70 border-slate-800/80 hover:bg-slate-900'
                  }`}
                >
                  <div
                    onClick={() => handleSelectTrack(t)}
                    className="flex items-center gap-2.5 cursor-pointer flex-1 min-w-0"
                  >
                    <div className="h-7 w-7 rounded bg-slate-900 flex items-center justify-center text-slate-300 flex-shrink-0">
                      {isSelected && isPlaying ? (
                        <Pause className="w-3.5 h-3.5 text-rose-400" />
                      ) : (
                        <Play className="w-3.5 h-3.5 text-slate-400" />
                      )}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-medium text-slate-200 truncate">{t.title}</span>
                      <span className="text-[10px] text-slate-400">{t.genre} • {t.duration}s</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {isApplied ? (
                      <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                        Ativa
                      </span>
                    ) : (
                      <button
                        onClick={() => handleApplyToProject(t)}
                        className="text-[10px] text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-2 py-1 rounded"
                      >
                        Usar no Vídeo
                      </button>
                    )}
                    <button
                      onClick={() => handleDownloadTrack(t)}
                      className="p-1 text-slate-400 hover:text-slate-200"
                      title="Baixar"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
