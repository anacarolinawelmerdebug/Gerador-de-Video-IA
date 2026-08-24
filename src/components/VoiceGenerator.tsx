import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  Sparkles,
  Play,
  Pause,
  Volume2,
  Download,
  Check,
  CheckCircle2,
  Layers,
  Wand2,
  Sliders,
  UserCheck,
  Globe,
  Radio,
  FileAudio,
  Trash2,
  FastForward,
  Headphones,
  RotateCcw,
} from 'lucide-react';
import { GeneratedVoiceTrack, Scene, VideoProject } from '../types';
import { generateVoiceAPI, enhanceVoiceScriptAPI } from '../services/geminiService';
import { soundSynth } from '../utils/audioSynth';

interface VoiceGeneratorProps {
  project: VideoProject;
  onUpdateProject: (updated: Partial<VideoProject>) => void;
  onUpdateScene: (sceneId: string, updated: Partial<Scene>) => void;
  onShowToast: (msg: string) => void;
}

const VOICE_PERSONAS = [
  {
    name: 'Lucas',
    gender: 'pt-BR-male',
    voiceName: 'Fenrir',
    label: 'Locutor de Cinema & Trailer',
    desc: 'Voz grave, dinâmica e impactante para narrações cinematográficas',
    avatar: '🎙️',
  },
  {
    name: 'Clara',
    gender: 'pt-BR-female',
    voiceName: 'Aoede',
    label: 'Documentário & História',
    desc: 'Voz límpida, empática e envolvente para narrativas épicas',
    avatar: '🌸',
  },
  {
    name: 'Sofia',
    gender: 'pt-BR-female',
    voiceName: 'Zephyr',
    label: 'Assistente IA & Futurista',
    desc: 'Voz moderna, articulada e tecnológica com tom sci-fi',
    avatar: '🤖',
  },
  {
    name: 'Gabriel',
    gender: 'pt-BR-male',
    voiceName: 'Puck',
    label: 'Comercial & Entusiasta',
    desc: 'Voz persuasiva, brilhante e rápida para vídeos publicitários',
    avatar: '⚡',
  },
  {
    name: 'Helena',
    gender: 'pt-BR-female',
    voiceName: 'Kore',
    label: 'Calma & Meditativa',
    desc: 'Voz suave, pausada e reconfortante para momentos de introspecção',
    avatar: '🌿',
  },
  {
    name: 'Arthur',
    gender: 'pt-BR-male',
    voiceName: 'Charon',
    label: 'Narrador Sombrio & Suspense',
    desc: 'Voz profunda, misteriosa e sussurrada para suspense',
    avatar: '🌑',
  },
];

export const VoiceGenerator: React.FC<VoiceGeneratorProps> = ({
  project,
  onUpdateProject,
  onUpdateScene,
  onShowToast,
}) => {
  const [selectedPersona, setSelectedPersona] = useState(VOICE_PERSONAS[0]);
  const [text, setText] = useState<string>(
    project.scenes[0]?.narration ||
      'No limiar entre a imaginação e a realidade, cada horizonte se desdobra em infinitas possibilidades visuais.'
  );
  const [language, setLanguage] = useState<string>('pt-BR');
  const [speed, setSpeed] = useState<number>(1.0);
  const [pitch, setPitch] = useState<number>(1.0);
  const [emotion, setEmotion] = useState<string>('cinematic');
  const [targetSceneId, setTargetSceneId] = useState<string>(project.scenes[0]?.id || '');

  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isPolishing, setIsPolishing] = useState<boolean>(false);
  const [isBatchGenerating, setIsBatchGenerating] = useState<boolean>(false);

  // History of generated voices
  const [voiceHistory, setVoiceHistory] = useState<GeneratedVoiceTrack[]>(() => {
    try {
      const saved = localStorage.getItem('cineai_voice_history');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  const [currentVoice, setCurrentVoice] = useState<GeneratedVoiceTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Persist history
  useEffect(() => {
    try {
      localStorage.setItem('cineai_voice_history', JSON.stringify(voiceHistory));
    } catch {}
  }, [voiceHistory]);

  // Audio lifecycle
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onEnded = () => setIsPlaying(false);
    audio.addEventListener('ended', onEnded);
    return () => {
      audio.removeEventListener('ended', onEnded);
    };
  }, [currentVoice]);

  // Play audio toggle
  const togglePlay = () => {
    if (currentVoice?.audioUrl && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play().catch(() => {});
        setIsPlaying(true);
      }
    } else {
      // Fallback speech synthesis preview
      if (isPlaying) {
        soundSynth.stopNarration();
        setIsPlaying(false);
      } else {
        soundSynth.speakNarration(text, selectedPersona.gender);
        setIsPlaying(true);
      }
    }
  };

  // Generate Voice with Gemini TTS
  const handleGenerateVoice = async () => {
    if (!text.trim()) return;
    setIsGenerating(true);
    onShowToast(`Gerando locução com a voz ${selectedPersona.name} (${selectedPersona.voiceName})...`);

    try {
      const res = await generateVoiceAPI({
        text,
        voiceName: selectedPersona.voiceName,
        language,
        speed,
        pitch,
        emotion,
      });

      const newTrack: GeneratedVoiceTrack = {
        id: 'voice_' + Date.now(),
        text: res.text,
        voiceName: `${selectedPersona.name} (${selectedPersona.label})`,
        language: res.language,
        speed: res.speed,
        pitch: res.pitch,
        emotion: res.emotion,
        audioUrl: res.audioUrl || '',
        source: res.source,
        createdAt: new Date().toISOString(),
      };

      setVoiceHistory((prev) => [newTrack, ...prev]);
      setCurrentVoice(newTrack);

      if (newTrack.audioUrl && audioRef.current) {
        audioRef.current.src = newTrack.audioUrl;
        audioRef.current.play().catch(() => {});
        setIsPlaying(true);
      } else {
        soundSynth.speakNarration(text, selectedPersona.gender);
        setIsPlaying(true);
      }

      onShowToast('Voz gerada com sucesso!');
    } catch (err: any) {
      console.error(err);
      onShowToast(err.message || 'Erro ao gerar voz');
    } finally {
      setIsGenerating(false);
    }
  };

  // AI Script Polish & Voiceover Director
  const handlePolishScript = async () => {
    setIsPolishing(true);
    onShowToast('Aprimorando texto com entonação de locução cinematográfica...');

    try {
      const enhanced = await enhanceVoiceScriptAPI(project.scenes, text, selectedPersona.label);
      if (enhanced.sceneNarrations && enhanced.sceneNarrations.length > 0) {
        const fullScript = enhanced.sceneNarrations.map((sn) => sn.narrationText).join(' ');
        setText(fullScript);
        onShowToast(`Roteiro aprimorado: ${enhanced.narrationTitle}!`);
      }
    } catch (err: any) {
      onShowToast(err.message || 'Erro ao aprimorar roteiro');
    } finally {
      setIsPolishing(false);
    }
  };

  // Auto batch generate voiceovers for all scenes in project
  const handleBatchGenerateAllScenes = async () => {
    if (project.scenes.length === 0) return;
    setIsBatchGenerating(true);
    onShowToast(`Gerando áudios de locução para todas as ${project.scenes.length} cenas...`);

    try {
      for (let i = 0; i < project.scenes.length; i++) {
        const scene = project.scenes[i];
        const sceneText = scene.narration || `${scene.title}. ${scene.visualPrompt.slice(0, 60)}`;

        const res = await generateVoiceAPI({
          text: sceneText,
          voiceName: selectedPersona.voiceName,
          language,
          speed,
          pitch,
          emotion,
        });

        if (res.audioUrl) {
          onUpdateScene(scene.id, {
            narration: sceneText,
            voiceAudioUrl: res.audioUrl,
          });
        }
      }

      onUpdateProject({ enableVoiceover: true });
      onShowToast('Todas as cenas receberam suas faixas de voz sincronizadas!');
    } catch (err: any) {
      onShowToast('Erro ao sincronizar cenas: ' + err.message);
    } finally {
      setIsBatchGenerating(false);
    }
  };

  // Apply to target scene
  const handleApplyToScene = () => {
    if (!targetSceneId) return;
    const targetScene = project.scenes.find((s) => s.id === targetSceneId);
    if (!targetScene) return;

    onUpdateScene(targetSceneId, {
      narration: text,
      voiceAudioUrl: currentVoice?.audioUrl || undefined,
    });
    onUpdateProject({ enableVoiceover: true });
    onShowToast(`Locução vinculada à cena "${targetScene.title}"!`);
  };

  // Download voice WAV
  const handleDownloadVoice = (track: GeneratedVoiceTrack) => {
    if (!track.audioUrl) return;
    const a = document.createElement('a');
    a.href = track.audioUrl;
    a.download = `Locucao_${track.voiceName.split(' ')[0]}_${Date.now()}.wav`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    onShowToast('Download do arquivo de voz WAV concluído!');
  };

  return (
    <div className="flex flex-col gap-5 bg-slate-900/90 border border-slate-800 rounded-2xl p-4 lg:p-6 shadow-xl backdrop-blur-md">
      {/* Native hidden audio player */}
      <audio ref={audioRef} preload="auto" />

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-sky-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white font-bold">
            <Mic className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-100">Gerador de Voz & Locução IA</h2>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Gemini Neural TTS
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Sintetize vozes humanas e dublagens profissionais com controle de tom, cadência e emoção
            </p>
          </div>
        </div>

        {/* Global Video Voiceover Toggle */}
        <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
          <span className="text-xs text-slate-300 font-medium px-2">Voz no Vídeo</span>
          <button
            id="toggle-project-voiceover"
            onClick={() => onUpdateProject({ enableVoiceover: !project.enableVoiceover })}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              project.enableVoiceover
                ? 'bg-indigo-500 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {project.enableVoiceover ? 'Ativada' : 'Muda'}
          </button>
        </div>
      </div>

      {/* Voice Personas Grid */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold text-slate-300">Selecione o Locutor / Voz</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {VOICE_PERSONAS.map((persona) => {
            const isSelected = selectedPersona.name === persona.name;
            return (
              <div
                key={persona.name}
                onClick={() => {
                  setSelectedPersona(persona);
                  onUpdateProject({ voiceGender: persona.gender as any });
                }}
                className={`cursor-pointer p-3 rounded-xl border flex items-center gap-3 transition-all ${
                  isSelected
                    ? 'bg-indigo-500/20 border-indigo-500/60 shadow-lg shadow-indigo-500/10'
                    : 'bg-slate-950/70 border-slate-800/80 hover:bg-slate-900 hover:border-slate-700'
                }`}
              >
                <div className="text-2xl h-10 w-10 rounded-xl bg-slate-900 flex items-center justify-center border border-slate-800 flex-shrink-0">
                  {persona.avatar}
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-100">{persona.name}</span>
                    <span className="text-[10px] text-indigo-400 font-mono">({persona.voiceName})</span>
                  </div>
                  <span className="text-[11px] font-medium text-slate-300 truncate">{persona.label}</span>
                  <span className="text-[10px] text-slate-500 line-clamp-1">{persona.desc}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Parameters: Language, Tone, Speed, Pitch */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/90">
        {/* Language */}
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
            <Globe className="w-3 h-3 text-sky-400" />
            Idioma
          </label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 py-1.5 px-2 outline-none focus:border-indigo-500"
          >
            <option value="pt-BR">Português (Brasil)</option>
            <option value="en-US">English (US)</option>
            <option value="es-ES">Español (Latam)</option>
          </select>
        </div>

        {/* Emotion / Tone */}
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" />
            Entonação
          </label>
          <select
            value={emotion}
            onChange={(e) => setEmotion(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 py-1.5 px-2 outline-none focus:border-indigo-500"
          >
            <option value="cinematic">Cinematográfica</option>
            <option value="dramatic">Dramática</option>
            <option value="enthusiastic">Entusiasmada</option>
            <option value="calm">Serena & Calma</option>
            <option value="mysterious">Misteriosa</option>
          </select>
        </div>

        {/* Speed */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between text-[11px] font-medium text-slate-400">
            <span className="flex items-center gap-1">
              <FastForward className="w-3 h-3 text-emerald-400" />
              Velocidade
            </span>
            <span className="font-mono text-slate-300">{speed}x</span>
          </div>
          <input
            type="range"
            min="0.75"
            max="1.3"
            step="0.05"
            value={speed}
            onChange={(e) => setSpeed(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 mt-2"
          />
        </div>

        {/* Pitch */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between text-[11px] font-medium text-slate-400">
            <span className="flex items-center gap-1">
              <Sliders className="w-3 h-3 text-indigo-400" />
              Timbre
            </span>
            <span className="font-mono text-slate-300">{pitch}x</span>
          </div>
          <input
            type="range"
            min="0.8"
            max="1.2"
            step="0.05"
            value={pitch}
            onChange={(e) => setPitch(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 mt-2"
          />
        </div>
      </div>

      {/* Script Input & Director Actions */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-300">Texto da Locução</label>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePolishScript}
              disabled={isPolishing}
              className="flex items-center gap-1 text-[11px] text-indigo-300 hover:text-indigo-200 bg-indigo-500/10 hover:bg-indigo-500/20 px-2 py-1 rounded border border-indigo-500/30 transition-all"
            >
              <Wand2 className="w-3 h-3 text-indigo-400" />
              <span>{isPolishing ? 'Lapidando...' : 'Polir Roteiro com IA'}</span>
            </button>
            <button
              onClick={() => {
                const combined = project.scenes.map((s, idx) => `Cena ${idx + 1}: ${s.narration || s.title}`).join(' ');
                setText(combined);
              }}
              className="text-[11px] text-slate-400 hover:text-slate-200 bg-slate-800/60 px-2 py-1 rounded transition-all"
            >
              Copiar das Cenas
            </button>
          </div>
        </div>

        <textarea
          id="voice-text-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={3}
          className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 outline-none transition-all resize-none shadow-inner"
          placeholder="Digite o texto que será narrado..."
        />
        <div className="flex items-center justify-between text-[10px] text-slate-500 px-1">
          <span>{text.length} caracteres</span>
          <span>Tempo estimado: ~{Math.ceil(text.split(' ').length / 2.5)} segundos</span>
        </div>
      </div>

      {/* Target Scene Selection & Link Actions */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-xl bg-slate-950/80 border border-slate-800">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-sky-400" />
          <span className="text-xs text-slate-300 font-medium">Vincular à Cena:</span>
          <select
            value={targetSceneId}
            onChange={(e) => {
              setTargetSceneId(e.target.value);
              const scene = project.scenes.find((s) => s.id === e.target.value);
              if (scene?.narration) setText(scene.narration);
            }}
            className="bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 py-1 px-2.5 outline-none focus:border-sky-500"
          >
            {project.scenes.map((scene, idx) => (
              <option key={scene.id} value={scene.id}>
                Cena {idx + 1}: {scene.title} ({scene.duration}s)
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleApplyToScene}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-sky-300 bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 transition-all"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Aplicar a Esta Cena</span>
          </button>
        </div>
      </div>

      {/* Main Generation & Batch Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Single Voice Generation Button */}
        <button
          id="btn-generate-voice"
          onClick={handleGenerateVoice}
          disabled={isGenerating || !text.trim()}
          className="py-3.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-indigo-500 to-sky-500 hover:from-indigo-400 hover:to-sky-400 shadow-lg shadow-indigo-500/25 active:scale-[0.99] transition-all flex items-center justify-center gap-2.5 disabled:opacity-50"
        >
          {isGenerating ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Gerando com Neural TTS...</span>
            </>
          ) : (
            <>
              <Mic className="w-4 h-4" />
              <span>Gerar Voz de {selectedPersona.name}</span>
            </>
          )}
        </button>

        {/* Auto Batch Dubbing for All Scenes */}
        <button
          id="btn-batch-dubbing"
          onClick={handleBatchGenerateAllScenes}
          disabled={isBatchGenerating || project.scenes.length === 0}
          className="py-3.5 rounded-xl font-bold text-xs sm:text-sm text-indigo-200 bg-slate-950 hover:bg-slate-900 border border-indigo-500/40 hover:border-indigo-500/70 shadow-md active:scale-[0.99] transition-all flex items-center justify-center gap-2.5 disabled:opacity-50"
        >
          {isBatchGenerating ? (
            <>
              <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
              <span>Dublando todas as cenas...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>Dublar Todas as Cenas ({project.scenes.length})</span>
            </>
          )}
        </button>
      </div>

      {/* Active Voice Player Preview */}
      <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950 border border-slate-800 shadow-inner">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={togglePlay}
            className="h-9 w-9 rounded-full bg-indigo-500 hover:bg-indigo-400 text-white flex items-center justify-center shadow-md transition-all active:scale-95 flex-shrink-0"
          >
            {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white ml-0.5" />}
          </button>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-bold text-slate-200 truncate">
              {currentVoice ? currentVoice.voiceName : `Prévia (${selectedPersona.name})`}
            </span>
            <span className="text-[11px] text-slate-400 truncate max-w-sm">
              "{text.slice(0, 50)}..."
            </span>
          </div>
        </div>

        {currentVoice?.audioUrl && (
          <button
            onClick={() => handleDownloadVoice(currentVoice)}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-100 bg-slate-900 hover:bg-slate-800 border border-slate-800"
            title="Baixar áudio WAV"
          >
            <Download className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* History */}
      {voiceHistory.length > 0 && (
        <div className="flex flex-col gap-2 pt-2 border-t border-slate-800/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Headphones className="w-3.5 h-3.5 text-indigo-400" />
              Histórico de Vozes Geradas ({voiceHistory.length})
            </span>
            <button
              onClick={() => {
                setVoiceHistory([]);
                localStorage.removeItem('cineai_voice_history');
              }}
              className="text-[10px] text-slate-500 hover:text-rose-400 flex items-center gap-1"
            >
              <Trash2 className="w-3 h-3" />
              <span>Limpar</span>
            </button>
          </div>

          <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto pr-1">
            {voiceHistory.map((v) => (
              <div
                key={v.id}
                className="p-2.5 rounded-xl border bg-slate-950/70 border-slate-800/80 hover:bg-slate-900 flex items-center justify-between gap-3 text-xs"
              >
                <div
                  onClick={() => {
                    setCurrentVoice(v);
                    setText(v.text);
                    if (v.audioUrl && audioRef.current) {
                      audioRef.current.src = v.audioUrl;
                      audioRef.current.play().catch(() => {});
                      setIsPlaying(true);
                    } else {
                      soundSynth.speakNarration(v.text, selectedPersona.gender);
                      setIsPlaying(true);
                    }
                  }}
                  className="flex items-center gap-2 cursor-pointer flex-1 min-w-0"
                >
                  <div className="h-6 w-6 rounded bg-slate-900 flex items-center justify-center text-slate-300 flex-shrink-0">
                    <Play className="w-3 h-3 text-indigo-400" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-medium text-slate-200 truncate">{v.voiceName}</span>
                    <span className="text-[10px] text-slate-400 truncate">"{v.text.slice(0, 45)}..."</span>
                  </div>
                </div>

                {v.audioUrl && (
                  <button
                    onClick={() => handleDownloadVoice(v)}
                    className="p-1 text-slate-400 hover:text-slate-200"
                    title="Baixar WAV"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
