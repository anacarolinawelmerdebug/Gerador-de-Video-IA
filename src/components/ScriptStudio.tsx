import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  Copy,
  Sparkles,
  Volume2,
  Layers,
  Clock,
  Camera,
  CloudRain,
  Sliders,
  MoveUp,
  MoveDown,
  Wand2,
  Image as ImageIcon,
  Check,
} from 'lucide-react';
import { AtmosphereEffect, CameraMotion, Scene, TransitionType, VideoProject } from '../types';
import { soundSynth } from '../utils/audioSynth';

interface ScriptStudioProps {
  project: VideoProject;
  activeSceneIndex: number;
  onSelectScene: (index: number) => void;
  onUpdateScenes: (scenes: Scene[]) => void;
  onGenerateSceneImage: (sceneIndex: number) => void;
  isGeneratingImage: boolean;
}

const ATMOSPHERE_OPTIONS: { id: AtmosphereEffect; label: string }[] = [
  { id: 'particles', label: 'Partículas de Luz' },
  { id: 'rain', label: 'Chuva Cinemática' },
  { id: 'dust_motes', label: 'Poeira Dourada (Sunbeams)' },
  { id: 'lens_flare', label: 'Lens Flare Anamórfico' },
  { id: 'cyber_grid', label: 'Grade Cibernética 3D' },
  { id: 'bokeh', label: 'Bokeh & Luz Desfocada' },
  { id: 'film_grain', label: 'Granulação de Filme' },
  { id: 'none', label: 'Nenhum' },
];

const TRANSITION_OPTIONS: { id: TransitionType; label: string }[] = [
  { id: 'crossfade', label: 'Cross Dissolve' },
  { id: 'wipe_left', label: 'Wipe Direcional' },
  { id: 'zoom_blur', label: 'Zoom Blur Impact' },
  { id: 'glitch', label: 'Glitch Digital' },
  { id: 'fade_black', label: 'Fade para Preto' },
];

export const ScriptStudio: React.FC<ScriptStudioProps> = ({
  project,
  activeSceneIndex,
  onSelectScene,
  onUpdateScenes,
  onGenerateSceneImage,
  isGeneratingImage,
}) => {
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);

  // Add new scene
  const handleAddScene = () => {
    const newScene: Scene = {
      id: 'scene_' + Date.now(),
      title: `Take ${project.scenes.length + 1}`,
      duration: 4,
      visualPrompt: 'Nova cena visual com iluminação dramática e riqueza de detalhes 4K',
      cameraMotion: 'zoom_in',
      atmosphereEffect: 'particles',
      transition: 'crossfade',
      subtitle: 'NOVA REVELAÇÃO',
      narration: 'E a jornada continua em direção ao desconhecido.',
      moodColor: '#0f172a',
    };
    const updated = [...project.scenes, newScene];
    onUpdateScenes(updated);
    onSelectScene(updated.length - 1);
  };

  // Duplicate scene
  const handleDuplicateScene = (index: number) => {
    const target = project.scenes[index];
    const duplicated: Scene = {
      ...target,
      id: 'scene_' + Date.now(),
      title: `${target.title} (Cópia)`,
    };
    const updated = [...project.scenes];
    updated.splice(index + 1, 0, duplicated);
    onUpdateScenes(updated);
    onSelectScene(index + 1);
  };

  // Delete scene
  const handleDeleteScene = (index: number) => {
    if (project.scenes.length <= 1) return;
    const updated = project.scenes.filter((_, i) => i !== index);
    onUpdateScenes(updated);
    onSelectScene(Math.max(0, index - 1));
  };

  // Move scene up / down
  const handleMoveScene = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= project.scenes.length) return;
    const updated = [...project.scenes];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);
    onUpdateScenes(updated);
    onSelectScene(targetIndex);
  };

  // Update specific scene
  const handleUpdateScene = (index: number, fields: Partial<Scene>) => {
    const updated = project.scenes.map((s, i) => (i === index ? { ...s, ...fields } : s));
    onUpdateScenes(updated);
  };

  // Test voice narration
  const handleTestVoice = (scene: Scene) => {
    if (!scene.narration) return;
    setPlayingVoiceId(scene.id);
    soundSynth.speakNarration(scene.narration, project.voiceGender);
    setTimeout(() => {
      setPlayingVoiceId(null);
    }, 4000);
  };

  const activeScene = project.scenes[activeSceneIndex] || project.scenes[0];

  return (
    <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 lg:p-6 flex flex-col gap-6 shadow-xl backdrop-blur-sm">
      {/* Studio Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Layers className="w-5 h-5 text-sky-400" />
            <span>Estúdio de Cenas & Roteiro Multitakes</span>
          </h2>
          <p className="text-xs text-slate-400">
            Organize os takes do vídeo, ajuste iluminação, animações e narração por cena.
          </p>
        </div>

        <button
          id="add-scene-btn"
          onClick={handleAddScene}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-sky-500 hover:bg-sky-400 active:scale-95 transition-all shadow-md shadow-sky-500/20"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Adicionar Cena</span>
        </button>
      </div>

      {/* Scene Strip / Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
        {project.scenes.map((scene, idx) => {
          const isSelected = activeSceneIndex === idx;
          return (
            <div
              key={scene.id}
              onClick={() => onSelectScene(idx)}
              className={`flex-shrink-0 cursor-pointer rounded-xl border p-2.5 transition-all w-48 flex flex-col gap-1.5 relative ${
                isSelected
                  ? 'bg-sky-500/15 border-sky-500 shadow-md shadow-sky-500/10'
                  : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 text-slate-400'
              }`}
            >
              {/* Scene mini header */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200 truncate">
                  {idx + 1}. {scene.title}
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                  {scene.duration}s
                </span>
              </div>

              {/* Scene thumbnail preview */}
              <div className="h-16 w-full rounded-lg bg-slate-900 overflow-hidden border border-slate-800 flex items-center justify-center relative">
                {scene.imageUrl ? (
                  <img
                    src={scene.imageUrl}
                    alt={scene.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-[10px] text-slate-500 flex flex-col items-center gap-1">
                    <ImageIcon className="w-4 h-4 text-slate-600" />
                    <span>Quadro IA</span>
                  </div>
                )}
                <div className="absolute bottom-1 right-1 px-1 py-0.5 rounded text-[8px] uppercase font-bold bg-black/70 text-sky-400">
                  {scene.cameraMotion.replace('_', ' ')}
                </div>
              </div>

              <p className="text-[10px] text-slate-400 line-clamp-1 italic">
                "{scene.subtitle || scene.visualPrompt}"
              </p>
            </div>
          );
        })}
      </div>

      {/* Active Scene Detailed Editor */}
      {activeScene && (
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4 lg:p-5 flex flex-col gap-4">
          {/* Card Header with Scene Navigation & Actions */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="h-6 w-6 rounded-full bg-sky-500/20 text-sky-400 font-mono text-xs flex items-center justify-center font-bold">
                {activeSceneIndex + 1}
              </span>
              <input
                type="text"
                value={activeScene.title}
                onChange={(e) => handleUpdateScene(activeSceneIndex, { title: e.target.value })}
                className="bg-transparent border-b border-transparent focus:border-sky-500 text-sm font-bold text-white outline-none"
              />
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handleMoveScene(activeSceneIndex, 'up')}
                disabled={activeSceneIndex === 0}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 disabled:opacity-30 transition-colors"
                title="Mover cena para a esquerda"
              >
                <MoveUp className="w-3.5 h-3.5 -rotate-90" />
              </button>

              <button
                onClick={() => handleMoveScene(activeSceneIndex, 'down')}
                disabled={activeSceneIndex >= project.scenes.length - 1}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 disabled:opacity-30 transition-colors"
                title="Mover cena para a direita"
              >
                <MoveDown className="w-3.5 h-3.5 -rotate-90" />
              </button>

              <button
                onClick={() => handleDuplicateScene(activeSceneIndex)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                title="Duplicar Cena"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => handleDeleteScene(activeSceneIndex)}
                disabled={project.scenes.length <= 1}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 disabled:opacity-30 transition-colors"
                title="Excluir Cena"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Visual Prompt & AI Generate Frame */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300">
                Prompt Visual do Take (Visual Prompt)
              </label>
              <button
                onClick={() => onGenerateSceneImage(activeSceneIndex)}
                disabled={isGeneratingImage}
                className="flex items-center gap-1 text-xs font-medium text-amber-400 hover:text-amber-300 transition-colors disabled:opacity-50"
              >
                <Sparkles className={`w-3.5 h-3.5 ${isGeneratingImage ? 'animate-spin' : ''}`} />
                <span>{activeScene.imageUrl ? 'Gerar Nova Variação' : 'Criar Imagem com IA'}</span>
              </button>
            </div>
            <textarea
              rows={2}
              value={activeScene.visualPrompt}
              onChange={(e) =>
                handleUpdateScene(activeSceneIndex, { visualPrompt: e.target.value })
              }
              className="w-full rounded-lg bg-slate-900 border border-slate-800 p-2.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
              placeholder="Descreva detalhadamente a composição visual e elementos do take..."
            />
          </div>

          {/* Parameters Grid: Duration, Motion, Atmosphere, Transition */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {/* Duration */}
            <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800">
              <label className="text-[11px] font-semibold text-slate-400 flex items-center justify-between mb-1.5">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-sky-400" />
                  Duração
                </span>
                <span className="font-mono text-sky-400 font-bold">{activeScene.duration}s</span>
              </label>
              <input
                type="range"
                min={2}
                max={12}
                step={1}
                value={activeScene.duration}
                onChange={(e) =>
                  handleUpdateScene(activeSceneIndex, { duration: Number(e.target.value) })
                }
                className="w-full accent-sky-500"
              />
            </div>

            {/* Camera Motion */}
            <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800">
              <label className="text-[11px] font-semibold text-slate-400 flex items-center gap-1 mb-1.5">
                <Camera className="w-3 h-3 text-indigo-400" />
                Câmera
              </label>
              <select
                value={activeScene.cameraMotion}
                onChange={(e) =>
                  handleUpdateScene(activeSceneIndex, {
                    cameraMotion: e.target.value as CameraMotion,
                  })
                }
                className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-md p-1.5 outline-none focus:border-sky-500"
              >
                <option value="drone_flythrough">Drone Flythrough</option>
                <option value="zoom_in">Zoom In Épico</option>
                <option value="zoom_out">Zoom Out Revelação</option>
                <option value="pan_right">Panorâmica Direita</option>
                <option value="pan_left">Panorâmica Esquerda</option>
                <option value="orbit_360">Órbita 360°</option>
                <option value="tilt_up">Tilt Up</option>
                <option value="tilt_down">Tilt Down</option>
                <option value="slow_motion">Super Slow-Mo</option>
                <option value="static">Câmera Estática</option>
              </select>
            </div>

            {/* Atmosphere */}
            <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800">
              <label className="text-[11px] font-semibold text-slate-400 flex items-center gap-1 mb-1.5">
                <CloudRain className="w-3 h-3 text-cyan-400" />
                Efeito Visual
              </label>
              <select
                value={activeScene.atmosphereEffect}
                onChange={(e) =>
                  handleUpdateScene(activeSceneIndex, {
                    atmosphereEffect: e.target.value as AtmosphereEffect,
                  })
                }
                className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-md p-1.5 outline-none focus:border-sky-500"
              >
                {ATMOSPHERE_OPTIONS.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Transition */}
            <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800">
              <label className="text-[11px] font-semibold text-slate-400 flex items-center gap-1 mb-1.5">
                <Sliders className="w-3 h-3 text-purple-400" />
                Transição
              </label>
              <select
                value={activeScene.transition}
                onChange={(e) =>
                  handleUpdateScene(activeSceneIndex, {
                    transition: e.target.value as TransitionType,
                  })
                }
                className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-md p-1.5 outline-none focus:border-sky-500"
              >
                {TRANSITION_OPTIONS.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Subtitle & Narration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Subtitle */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Legenda de Impacto (Texto sobreposto no vídeo)
              </label>
              <input
                type="text"
                value={activeScene.subtitle || ''}
                onChange={(e) =>
                  handleUpdateScene(activeSceneIndex, { subtitle: e.target.value })
                }
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-sky-500"
                placeholder="Ex: UMA NOVA ERA SE INICIA..."
              />
            </div>

            {/* Narration */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300">
                  Roteiro de Narração (Voz IA)
                </label>
                {activeScene.narration && (
                  <button
                    onClick={() => handleTestVoice(activeScene)}
                    className="text-[11px] text-sky-400 hover:text-sky-300 flex items-center gap-1"
                  >
                    <Volume2 className="w-3 h-3" />
                    <span>Ouvir Voz</span>
                  </button>
                )}
              </div>
              <input
                type="text"
                value={activeScene.narration || ''}
                onChange={(e) =>
                  handleUpdateScene(activeSceneIndex, { narration: e.target.value })
                }
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-sky-500"
                placeholder="Texto que será falado pela voz sintética durante este take..."
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
