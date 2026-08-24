import React from 'react';
import {
  Film,
  Sparkles,
  Download,
  FolderOpen,
  Wand2,
  Tv,
  Layers,
} from 'lucide-react';
import { AspectRatio, VideoProject } from '../types';

interface HeaderProps {
  project: VideoProject;
  onUpdateProject: (updated: Partial<VideoProject>) => void;
  onOpenPresets: () => void;
  onOpenExport: () => void;
  onOpenScriptGenerator: () => void;
  isExporting: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  project,
  onUpdateProject,
  onOpenPresets,
  onOpenExport,
  onOpenScriptGenerator,
  isExporting,
}) => {
  const totalDuration = project.scenes.reduce((acc, s) => acc + s.duration, 0);

  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40 px-4 lg:px-6 py-3">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Brand & Project Name */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/20 text-white font-bold">
              <Film className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-slate-100 tracking-tight">
                  CineAI
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20">
                  Video Studio
                </span>
              </div>
              <input
                id="project-title-input"
                type="text"
                value={project.title}
                onChange={(e) => onUpdateProject({ title: e.target.value })}
                className="text-xs text-slate-400 hover:text-slate-200 focus:text-white bg-transparent outline-none transition-colors border-b border-transparent focus:border-sky-500 max-w-[200px] truncate"
                placeholder="Título do Projeto..."
              />
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-2 md:hidden">
            <span className="text-xs px-2 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300 font-mono">
              {totalDuration}s
            </span>
          </div>
        </div>

        {/* Center Controls: Aspect Ratio & Duration */}
        <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-800/80 rounded-xl p-1 shadow-inner">
          <div className="flex items-center gap-1">
            {(['16:9', '9:16', '1:1', '4:3'] as AspectRatio[]).map((ratio) => (
              <button
                key={ratio}
                id={`ratio-btn-${ratio.replace(':', '-')}`}
                onClick={() => onUpdateProject({ aspectRatio: ratio })}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                  project.aspectRatio === ratio
                    ? 'bg-sky-500 text-white shadow-sm font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
                title={`Proporção ${ratio}`}
              >
                {ratio === '16:9' ? '16:9 (Cinema)' : ratio === '9:16' ? '9:16 (Reels)' : ratio}
              </button>
            ))}
          </div>

          <div className="h-4 w-px bg-slate-800 mx-1 hidden sm:block" />

          <div className="hidden sm:flex items-center gap-2 px-2 text-xs text-slate-400 font-medium">
            <Layers className="w-3.5 h-3.5 text-sky-400" />
            <span>{project.scenes.length} {project.scenes.length === 1 ? 'cena' : 'cenas'}</span>
            <span className="text-slate-600">•</span>
            <span className="font-mono text-slate-300">{totalDuration}s total</span>
          </div>
        </div>

        {/* Right Actions: Templates, AI Auto Script, Export */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <button
            id="open-templates-btn"
            onClick={onOpenPresets}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 transition-colors"
          >
            <FolderOpen className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Modelos</span>
          </button>

          <button
            id="open-script-gen-btn"
            onClick={onOpenScriptGenerator}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-200 bg-slate-900 hover:bg-slate-800 border border-indigo-500/30 hover:border-indigo-500/60 transition-colors"
          >
            <Wand2 className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
            <span>Roteiro IA</span>
          </button>

          <button
            id="open-export-btn"
            onClick={onOpenExport}
            disabled={isExporting}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 shadow-md shadow-sky-500/20 active:scale-95 transition-all disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar Vídeo</span>
          </button>
        </div>
      </div>
    </header>
  );
};
