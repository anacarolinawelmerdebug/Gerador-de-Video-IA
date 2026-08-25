import React, { useState } from 'react';
import { X, Wand2, Sparkles, Film, ArrowRight, Loader2 } from 'lucide-react';
import { Scene, VideoProject, VideoStyle } from '../types';
import { generateScriptAPI } from '../services/geminiService';
import { StyleSelectorGrid } from './StyleSelectorGrid';

interface ScriptGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyScript: (title: string, synopsis: string, scenes: Scene[]) => void;
  currentStyle: VideoStyle;
}

export const ScriptGeneratorModal: React.FC<ScriptGeneratorModalProps> = ({
  isOpen,
  onClose,
  onApplyScript,
  currentStyle,
}) => {
  const [idea, setIdea] = useState<string>('Uma jornada épica de exploração submarina em busca de uma cidade perdida sob bioluminescência');
  const [sceneCount, setSceneCount] = useState<number>(3);
  const [targetDuration, setTargetDuration] = useState<number>(15);
  const [style, setStyle] = useState<VideoStyle>(currentStyle || 'cinematic');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!idea.trim()) return;
    setIsGenerating(true);
    setErrorMsg(null);
    try {
      const data = await generateScriptAPI(idea, sceneCount, targetDuration, style);
      if (data && data.scenes && data.scenes.length > 0) {
        const mappedScenes: Scene[] = data.scenes.map((s: any, idx: number) => ({
          id: 'scene_' + Date.now() + '_' + idx,
          title: s.title || `Cena ${idx + 1}`,
          duration: s.duration || Math.round(targetDuration / sceneCount),
          visualPrompt: s.visualPrompt || s.title,
          cameraMotion: s.cameraMotion || 'zoom_in',
          atmosphereEffect: s.atmosphereEffect || 'particles',
          transition: idx === 0 ? 'crossfade' : 'zoom_blur',
          subtitle: s.subtitle || '',
          narration: s.narration || '',
          moodColor: s.moodColor || '#0a192f',
        }));

        onApplyScript(data.title || 'Vídeo IA Gerado', data.synopsis || '', mappedScenes);
        onClose();
      } else {
        throw new Error('Nenhuma cena retornada pelo modelo');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Erro ao gerar roteiro cinematográfico');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Wand2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">
                Gerador Automático de Roteiro IA
              </h3>
              <p className="text-xs text-slate-400">
                O Gemini Flash estruturará a narrativa, cenas sequenciais, falas e direção de câmera.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5 flex flex-col gap-4 overflow-y-auto max-h-[calc(90vh-140px)] custom-scrollbar">
          {/* Idea text */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-300">
              Ideia Central do Vídeo
            </label>
            <textarea
              rows={3}
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-sky-500"
              placeholder="Ex: Comercial de um relógio inteligente no espaço, com astronautas e nebulosas brilhantes..."
            />
          </div>

          {/* Style Selector Grid with Visual Thumbnails */}
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <StyleSelectorGrid
              selectedStyle={style}
              onSelectStyle={setStyle}
              showCategoryFilters={true}
            />
          </div>

          {/* Grid Settings: Scene count & Duration */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Quantidade de Cenas
              </label>
              <select
                value={sceneCount}
                onChange={(e) => setSceneCount(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-lg p-2.5 outline-none focus:border-sky-500"
              >
                <option value={2}>2 Cenas (Rápido)</option>
                <option value={3}>3 Cenas (Padrão Narrativo)</option>
                <option value={4}>4 Cenas (Completo)</option>
                <option value={5}>5 Cenas (Mini-Curta)</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Duração Total Desejada
              </label>
              <select
                value={targetDuration}
                onChange={(e) => setTargetDuration(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-lg p-2.5 outline-none focus:border-sky-500"
              >
                <option value={10}>10 Segundos</option>
                <option value={15}>15 Segundos (Reels / Shorts)</option>
                <option value={20}>20 Segundos</option>
                <option value={30}>30 Segundos (Comercial)</option>
              </select>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
              {errorMsg}
            </div>
          )}

          {/* Action button */}
          <button
            id="generate-script-btn"
            onClick={handleGenerate}
            disabled={isGenerating || !idea.trim()}
            className="mt-2 w-full flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-500 to-sky-500 hover:from-indigo-400 hover:to-sky-400 shadow-lg shadow-indigo-500/25 active:scale-95 transition-all disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Criando Roteiro Cinemático com Gemini...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Gerar Cenas & Roteiro Completo</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
