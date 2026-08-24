import React, { useState } from 'react';
import {
  Sparkles,
  Wand2,
  Video,
  Camera,
  Layers,
  Clock,
  Compass,
  Palette,
  Lightbulb,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import { CameraMotion, EnhancedPromptResult, VideoProject, VideoStyle } from '../types';
import { enhancePromptAPI } from '../services/geminiService';

interface PromptDirectorProps {
  project: VideoProject;
  onUpdateProject: (updated: Partial<VideoProject>) => void;
  onApplyPromptToScenes: (prompt: string, style: VideoStyle, motion: CameraMotion) => void;
}

const STYLE_OPTIONS: { id: VideoStyle; name: string; desc: string; icon: string }[] = [
  { id: 'cinematic', name: 'Cinematográfico 4K', desc: 'Iluminação de cinema, profundidade de campo rasa', icon: '🎬' },
  { id: 'cyberpunk', name: 'Cyberpunk Neon', desc: 'Metrópole noturna, hologramas e chuva magenta', icon: '🏙️' },
  { id: 'anime', name: 'Anime Ghibli', desc: 'Arte pintada à mão, cores vívidas e fantasia', icon: '🌸' },
  { id: '3d_animation', name: 'Render 3D Pixar', desc: 'Texturas luxuosas, luz volumétrica suave', icon: '✨' },
  { id: 'documentary', name: 'Documentário NatGeo', desc: 'Realismo hiper-detalhado de natureza', icon: '🌿' },
  { id: 'vintage_vhs', name: 'Vintage VHS 90s', desc: 'Estética analógica com fita retrô e ruído', icon: '📼' },
  { id: 'synthwave', name: 'Synthwave 80s', desc: 'Grades neon roxas e sol dourado no horizonte', icon: '🌅' },
  { id: 'fantasy', name: 'Fantasia Mística', desc: 'Castelos flutuantes, magia e runas brilhantes', icon: '🔮' },
  { id: 'minimal_motion', name: 'Motion Design', desc: 'Minimalismo elegante para marcas e produtos', icon: '📐' },
];

const CAMERA_MOTIONS: { id: CameraMotion; label: string; desc: string }[] = [
  { id: 'drone_flythrough', label: 'Drone Flythrough', desc: 'Voo dinâmico imersivo' },
  { id: 'zoom_in', label: 'Zoom In Épico', desc: 'Aproximação Ken Burns' },
  { id: 'zoom_out', label: 'Zoom Out Revelação', desc: 'Afastamento dramático' },
  { id: 'pan_right', label: 'Panorâmica Direita', desc: 'Deslocamento horizontal suave' },
  { id: 'pan_left', label: 'Panorâmica Esquerda', desc: 'Deslocamento horizontal clássico' },
  { id: 'orbit_360', label: 'Órbita 360°', desc: 'Giro circular ao redor do sujeito' },
  { id: 'tilt_up', label: 'Tilt Up Ascendente', desc: 'Movimento vertical para o céu' },
  { id: 'slow_motion', label: 'Super Câmera Lenta', desc: 'Fluidez cinematográfica 60fps' },
];

const PROMPT_SUGGESTIONS = [
  'Drone sobrevoando metrópole futurista com luzes neon e chuva à noite',
  'Cachoeira paradisíaca cercada por floresta tropical densa e arco-íris natural',
  'Close-up de astronauta observando a Terra do cockpit de uma estação espacial',
  'Carro elétrico hipermoderno acelerando em uma autoestrada espelhada ao pôr do sol',
  'Criatura mística luminosa voando sobre um lago encantado sob a aurora boreal',
];

export const PromptDirector: React.FC<PromptDirectorProps> = ({
  project,
  onUpdateProject,
  onApplyPromptToScenes,
}) => {
  const [promptText, setPromptText] = useState<string>(
    project.scenes[0]?.visualPrompt || 'Metrópole futurista iluminada por neon e chuva'
  );
  const [selectedStyle, setSelectedStyle] = useState<VideoStyle>(project.style || 'cinematic');
  const [selectedMotion, setSelectedMotion] = useState<CameraMotion>(
    project.scenes[0]?.cameraMotion || 'drone_flythrough'
  );
  const [isEnhancing, setIsEnhancing] = useState<boolean>(false);
  const [enhancedData, setEnhancedData] = useState<EnhancedPromptResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // AI Prompt Enhancer
  const handleEnhancePrompt = async () => {
    if (!promptText.trim()) return;
    setIsEnhancing(true);
    setErrorMsg(null);
    try {
      const data = await enhancePromptAPI(
        promptText,
        selectedStyle,
        selectedMotion,
        project.scenes[0]?.duration || 5
      );
      setEnhancedData(data);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Não foi possível aprimorar o prompt no momento.');
    } finally {
      setIsEnhancing(false);
    }
  };

  // Apply to active project scenes
  const handleApplyToProject = () => {
    const finalPrompt = enhancedData?.enhancedPrompt || promptText;
    onUpdateProject({ style: selectedStyle });
    onApplyPromptToScenes(finalPrompt, selectedStyle, selectedMotion);
  };

  return (
    <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 lg:p-6 flex flex-col gap-6 shadow-xl backdrop-blur-sm">
      {/* Title & Badge */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400">
            <Wand2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              Diretor de Prompt & Estilos IA
            </h2>
            <p className="text-xs text-slate-400">
              Descreva sua visão e use o modelo Gemini para gerar um prompt cinematográfico profissional.
            </p>
          </div>
        </div>
      </div>

      {/* Main Text-to-Video Input */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
          <span>Prompt do Vídeo</span>
          <span className="text-[11px] text-slate-500">Descreva sujeito, ambiente e ação</span>
        </label>
        <div className="relative">
          <textarea
            id="video-prompt-textarea"
            rows={3}
            value={promptText}
            onChange={(e) => setPromptText(e.target.value)}
            className="w-full rounded-xl bg-slate-950/80 border border-slate-800 p-3.5 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all resize-none shadow-inner"
            placeholder="Ex: Drone sobrevoando montanhas nevadas com reflexo dourado do sol poente e névoa volumétrica..."
          />

          <div className="flex justify-between items-center mt-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] text-slate-500 flex items-center gap-1">
                <Lightbulb className="w-3 h-3 text-amber-400" />
                Inspirações:
              </span>
              {PROMPT_SUGGESTIONS.slice(0, 2).map((sug, i) => (
                <button
                  key={i}
                  onClick={() => setPromptText(sug)}
                  className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors truncate max-w-[200px]"
                  title={sug}
                >
                  {sug}
                </button>
              ))}
            </div>

            <button
              id="enhance-prompt-btn"
              onClick={handleEnhancePrompt}
              disabled={isEnhancing || !promptText.trim()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-indigo-500 to-sky-500 hover:from-indigo-400 hover:to-sky-400 shadow-md shadow-indigo-500/20 active:scale-95 transition-all disabled:opacity-50"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isEnhancing ? 'animate-spin' : ''}`} />
              <span>{isEnhancing ? 'Otimizando...' : 'Aprimorar com IA'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced AI Prompt Card (when generated) */}
      {enhancedData && (
        <div className="bg-gradient-to-br from-indigo-950/40 via-slate-900/60 to-sky-950/40 border border-sky-500/30 rounded-xl p-4 flex flex-col gap-3 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 text-[10px] font-bold uppercase tracking-wider border border-sky-500/30">
                Diretor IA Gemini
              </span>
              <span className="text-xs text-slate-300 font-medium">Prompt Otimizado</span>
            </div>
            <button
              onClick={() => setEnhancedData(null)}
              className="text-xs text-slate-500 hover:text-slate-300"
            >
              Fechar
            </button>
          </div>

          <p className="text-xs text-slate-200 leading-relaxed font-sans bg-slate-950/40 p-2.5 rounded-lg border border-slate-800">
            {enhancedData.enhancedPrompt}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
            <div className="bg-slate-950/50 p-2 rounded-lg border border-slate-800/80">
              <span className="text-sky-400 font-semibold block mb-0.5">Câmera & Lentes:</span>
              <span className="text-slate-300">{enhancedData.cameraDirection}</span>
            </div>
            <div className="bg-slate-950/50 p-2 rounded-lg border border-slate-800/80">
              <span className="text-amber-400 font-semibold block mb-0.5">Luz & Atmosfera:</span>
              <span className="text-slate-300">{enhancedData.lightingAndColor}</span>
            </div>
          </div>

          {/* Visual Tags */}
          {enhancedData.visualTags && (
            <div className="flex items-center gap-1.5 flex-wrap">
              {enhancedData.visualTags.map((tag, idx) => (
                <span
                  key={idx}
                  className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {errorMsg && (
        <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
          {errorMsg}
        </div>
      )}

      {/* Visual Styles Selector */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
          <Palette className="w-3.5 h-3.5 text-sky-400" />
          <span>Estilo Visual & Estética</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {STYLE_OPTIONS.map((style) => {
            const isSelected = selectedStyle === style.id;
            return (
              <button
                key={style.id}
                id={`style-btn-${style.id}`}
                onClick={() => {
                  setSelectedStyle(style.id);
                  onUpdateProject({ style: style.id });
                }}
                className={`p-3 rounded-xl text-left border transition-all flex flex-col gap-1 relative overflow-hidden ${
                  isSelected
                    ? 'bg-sky-500/15 border-sky-500 text-white shadow-md shadow-sky-500/10'
                    : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-base">{style.icon}</span>
                  {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" />}
                </div>
                <span className="text-xs font-bold text-slate-200 mt-1">{style.name}</span>
                <span className="text-[10px] text-slate-500 line-clamp-1">{style.desc}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Camera Motion Selector */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
          <Camera className="w-3.5 h-3.5 text-indigo-400" />
          <span>Movimento de Câmera (Camera Motion)</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {CAMERA_MOTIONS.map((motion) => {
            const isSelected = selectedMotion === motion.id;
            return (
              <button
                key={motion.id}
                id={`motion-btn-${motion.id}`}
                onClick={() => setSelectedMotion(motion.id)}
                className={`p-2.5 rounded-xl text-left border transition-all flex flex-col gap-0.5 ${
                  isSelected
                    ? 'bg-indigo-500/20 border-indigo-500 text-white shadow-sm'
                    : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <span className="text-xs font-semibold text-slate-200">{motion.label}</span>
                <span className="text-[10px] text-slate-500 truncate">{motion.desc}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Action: Apply to Project Scenes */}
      <div className="flex justify-end pt-2 border-t border-slate-800/80">
        <button
          id="apply-prompt-director-btn"
          onClick={handleApplyToProject}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 shadow-lg shadow-sky-500/25 active:scale-95 transition-all"
        >
          <span>Atualizar Cena com este Prompt</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
