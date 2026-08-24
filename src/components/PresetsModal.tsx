import React from 'react';
import { X, Sparkles, Film, ArrowRight, Play } from 'lucide-react';
import { PresetTemplate, VideoProject } from '../types';
import { PRESET_TEMPLATES } from '../data/presets';

interface PresetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPreset: (preset: PresetTemplate) => void;
}

export const PresetsModal: React.FC<PresetsModalProps> = ({
  isOpen,
  onClose,
  onSelectPreset,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">
                Modelos e Presets Prontos de Vídeo
              </h3>
              <p className="text-xs text-slate-400">
                Selecione uma estrutura completa de cenas, iluminação cinematográfica e sonorização.
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

        {/* Presets Grid */}
        <div className="p-5 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-4">
          {PRESET_TEMPLATES.map((preset) => {
            const totalSec = preset.scenes.reduce((acc, s) => acc + s.duration, 0);

            return (
              <div
                key={preset.id}
                className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 flex flex-col justify-between gap-3 hover:border-sky-500/50 hover:bg-slate-950 transition-all group shadow-sm"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20">
                      {preset.badge}
                    </span>
                    <span className="text-xs font-mono text-slate-400">
                      {preset.scenes.length} cenas • {totalSec}s
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-100 group-hover:text-sky-400 transition-colors">
                    {preset.name}
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                    {preset.description}
                  </p>
                </div>

                {/* Scene breakdown preview */}
                <div className="flex flex-col gap-1 bg-slate-900/80 p-2.5 rounded-lg border border-slate-800/80 text-[11px] text-slate-300">
                  <span className="text-[10px] text-slate-500 font-semibold uppercase">
                    Cenas inclusas:
                  </span>
                  {preset.scenes.map((s, i) => (
                    <div key={i} className="flex items-center justify-between text-slate-300">
                      <span className="truncate max-w-[200px]">• {s.title}</span>
                      <span className="text-[10px] font-mono text-slate-500">{s.duration}s</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => {
                    onSelectPreset(preset);
                    onClose();
                  }}
                  className="w-full mt-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold text-white bg-slate-800 group-hover:bg-sky-500 group-hover:shadow-md group-hover:shadow-sky-500/20 active:scale-95 transition-all"
                >
                  <span>Carregar Este Modelo</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
