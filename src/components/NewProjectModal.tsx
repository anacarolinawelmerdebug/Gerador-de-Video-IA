import React, { useState } from 'react';
import {
  X,
  Plus,
  Wand2,
  Image as ImageIcon,
  Palette,
  Film,
  Sparkles,
  Layers,
  Music,
  ArrowRight,
  CheckCircle2,
  Tv,
  Smartphone,
  Square,
  Monitor,
} from 'lucide-react';
import { AspectRatio, CameraMotion, Scene, SoundtrackMood, VideoProject, VideoStyle } from '../types';
import { STYLES_DATA } from '../data/stylesData';
import { StyleThumbnail } from './StyleThumbnail';

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateProject: (project: VideoProject, startTab?: 'prompt' | 'script' | 'music' | 'voice' | 'image_to_video') => void;
  onOpenScriptGen?: () => void;
  onOpenPresets?: () => void;
}

type StartMode = 'blank' | 'style' | 'ai_script' | 'image_to_video' | 'preset';

export const NewProjectModal: React.FC<NewProjectModalProps> = ({
  isOpen,
  onClose,
  onCreateProject,
  onOpenScriptGen,
  onOpenPresets,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
  const [selectedStyle, setSelectedStyle] = useState<VideoStyle>('photorealistic');
  const [soundtrack, setSoundtrack] = useState<SoundtrackMood>('cinematic_epic');
  const [startMode, setStartMode] = useState<StartMode>('blank');

  if (!isOpen) return null;

  const handleCreate = () => {
    const projTitle = title.trim() || `Novo Projeto - ${selectedStyle.toUpperCase()}`;
    const defaultScene: Scene = {
      id: 'sc_' + Date.now() + '_1',
      title: 'Take 1 - Abertura',
      duration: 4,
      visualPrompt: `Cena cinematográfica no estilo ${selectedStyle} com iluminação detalhada, enquadramento dinâmico e atmosfera imersiva.`,
      cameraMotion: 'pan_left',
      atmosphereEffect: selectedStyle === 'cyberpunk' ? 'rain' : selectedStyle === 'photorealistic' ? 'bokeh' : 'particles',
      transition: 'crossfade',
      subtitle: projTitle.toUpperCase(),
      narration: 'Abertura da narrativa visual.',
      moodColor: '#0b112c',
    };

    const newProject: VideoProject = {
      id: 'proj_' + Date.now(),
      title: projTitle,
      description: description.trim() || `Projeto de vídeo criado no estilo ${selectedStyle}.`,
      aspectRatio,
      style: selectedStyle,
      fps: 30,
      resolution: '1080p',
      soundtrack,
      enableVoiceover: true,
      voiceGender: 'pt-BR-female',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      scenes: [defaultScene],
    };

    if (startMode === 'ai_script' && onOpenScriptGen) {
      onCreateProject(newProject, 'script');
      onClose();
      setTimeout(() => onOpenScriptGen(), 100);
      return;
    }

    if (startMode === 'image_to_video') {
      onCreateProject(newProject, 'image_to_video');
      onClose();
      return;
    }

    if (startMode === 'preset' && onOpenPresets) {
      onClose();
      setTimeout(() => onOpenPresets(), 100);
      return;
    }

    onCreateProject(newProject, 'prompt');
    onClose();
  };

  const ratioOptions: { id: AspectRatio; name: string; desc: string; icon: any }[] = [
    { id: '16:9', name: '16:9 Widescreen', desc: 'YouTube, Cinema & TV', icon: Monitor },
    { id: '9:16', name: '9:16 Vertical', desc: 'TikTok, Reels & Shorts', icon: Smartphone },
    { id: '1:1', name: '1:1 Quadrado', desc: 'Feed Instagram & Social', icon: Square },
    { id: '4:3', name: '4:3 Vintage', desc: 'Clássico & Retro VHS', icon: Tv },
  ];

  const modeOptions: { id: StartMode; title: string; desc: string; icon: any; color: string }[] = [
    {
      id: 'blank',
      title: 'Estúdio Livre',
      desc: 'Comece com uma tela em branco e controle total de takes.',
      icon: Film,
      color: 'from-sky-500 to-blue-600',
    },
    {
      id: 'style',
      title: 'Por Estilo Visual',
      desc: 'Escolha uma assinatura estética e iluminação física.',
      icon: Palette,
      color: 'from-purple-500 to-indigo-600',
    },
    {
      id: 'ai_script',
      title: 'Roteirista IA (Gemini)',
      desc: 'Digite uma ideia e crie múltiplas cenas automaticamente.',
      icon: Wand2,
      color: 'from-pink-500 to-rose-600',
    },
    {
      id: 'image_to_video',
      title: 'Foto para Vídeo',
      desc: 'Suba uma imagem para dar vida com movimento de câmera.',
      icon: ImageIcon,
      color: 'from-emerald-500 to-teal-600',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center text-white shadow-md">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100">Criar Novo Projeto de Vídeo</h3>
              <p className="text-[11px] text-slate-400">Configure proporção, estilo visual e modo de criação inicial</p>
            </div>
          </div>
          <button
            id="close-new-project-modal"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5 flex flex-col gap-5 overflow-y-auto max-h-[calc(90vh-140px)] custom-scrollbar">
          {/* Project Title & Description */}
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Título do Projeto
              </label>
              <input
                id="new-project-title-input"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: O Segredo da Floresta Encantada, Comercial Luxo 2026..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Descrição ou Conceito (Opcional)
              </label>
              <input
                id="new-project-desc-input"
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ex: Trailer épico cinematográfico focado em iluminação realista..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
              />
            </div>
          </div>

          {/* Starting Mode Choice */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-slate-300">
              Ponto de Partida
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              {modeOptions.map((mode) => {
                const Icon = mode.icon;
                const isSelected = startMode === mode.id;
                return (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => setStartMode(mode.id)}
                    className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between gap-1.5 relative ${
                      isSelected
                        ? 'bg-sky-500/15 border-sky-500 shadow-md shadow-sky-500/10 text-white'
                        : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className={`w-7 h-7 rounded-lg bg-gradient-to-tr ${mode.color} flex items-center justify-center text-white shadow-sm`}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-sky-400" />}
                    </div>
                    <div>
                      <span className={`text-xs font-bold block ${isSelected ? 'text-slate-100' : 'text-slate-300'}`}>
                        {mode.title}
                      </span>
                      <span className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                        {mode.desc}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Aspect Ratio Selection */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-slate-300">
              Formato / Proporção de Tela
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {ratioOptions.map((ratio) => {
                const Icon = ratio.icon;
                const isSelected = aspectRatio === ratio.id;
                return (
                  <button
                    key={ratio.id}
                    type="button"
                    onClick={() => setAspectRatio(ratio.id)}
                    className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                      isSelected
                        ? 'bg-sky-500/15 border-sky-500 text-white font-bold'
                        : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 text-slate-400'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isSelected ? 'text-sky-400' : 'text-slate-500'}`} />
                    <span className="text-xs font-semibold">{ratio.name}</span>
                    <span className="text-[9px] text-slate-500">{ratio.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Visual Style Selection */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300">
                Estilo Visual Inicial (10 Opções)
              </label>
              <span className="text-[10px] text-slate-500">
                Pode ser refinado a qualquer momento no Estúdio
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-56 overflow-y-auto custom-scrollbar p-1">
              {STYLES_DATA.map((st) => {
                const isSelected = selectedStyle === st.id;
                return (
                  <div
                    key={st.id}
                    onClick={() => setSelectedStyle(st.id)}
                    className={`rounded-xl border p-2 cursor-pointer transition-all flex flex-col gap-1.5 overflow-hidden ${
                      isSelected
                        ? 'bg-sky-500/15 border-sky-500 ring-1 ring-sky-500/40 text-white'
                        : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 text-slate-400'
                    }`}
                  >
                    <StyleThumbnail style={st} className="w-full h-16 rounded-lg" isSelected={isSelected} />
                    <div className="flex items-center justify-between pt-0.5">
                      <span className={`text-[11px] font-bold truncate ${isSelected ? 'text-sky-400' : 'text-slate-300'}`}>
                        {st.name}
                      </span>
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-sky-400 flex-shrink-0" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-between bg-slate-950/80">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            Cancelar
          </button>

          <button
            id="confirm-create-project-btn"
            type="button"
            onClick={handleCreate}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white text-xs font-bold shadow-lg shadow-sky-500/20 active:scale-95 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Criar Projeto e Abrir Estúdio</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
