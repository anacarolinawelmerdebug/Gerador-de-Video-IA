import React from 'react';
import {
  Film,
  Sparkles,
  Download,
  FolderOpen,
  Wand2,
  Tv,
  Layers,
  Sun,
  Moon,
  Music,
  Mic,
} from 'lucide-react';
import { AspectRatio, VideoProject } from '../types';

interface HeaderProps {
  project: VideoProject;
  onUpdateProject: (updated: Partial<VideoProject>) => void;
  onOpenPresets: () => void;
  onOpenExport: () => void;
  onOpenScriptGenerator: () => void;
  isExporting: boolean;
  theme?: 'dark' | 'light';
  onToggleTheme?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  project,
  onUpdateProject,
  onOpenPresets,
  onOpenExport,
  onOpenScriptGenerator,
  isExporting,
  theme = 'dark',
  onToggleTheme,
}) => {
  const totalDuration = project.scenes.reduce((acc, s) => acc + s.duration, 0);

  return (
    <header className={`border-b transition-colors sticky top-0 z-40 px-4 lg:px-6 py-3 ${
      theme === 'light'
        ? 'bg-white/90 border-slate-200 text-slate-900 backdrop-blur-md shadow-sm'
        : 'bg-slate-950/80 border-slate-800 text-slate-100 backdrop-blur-md'
    }`}>
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Brand & Project Name */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/20 text-white font-bold">
              <Film className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`font-bold text-sm tracking-tight ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'}`}>
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
                className={`text-xs bg-transparent outline-none transition-colors border-b border-transparent focus:border-sky-500 max-w-[200px] truncate ${
                  theme === 'light'
                    ? 'text-slate-600 hover:text-slate-900 focus:text-slate-900'
                    : 'text-slate-400 hover:text-slate-200 focus:text-white'
                }`}
                placeholder="Título do Projeto..."
              />
            </div>
          </div>

          {/* Quick Metrics on mobile */}
          <div className="flex items-center gap-2 md:hidden">
            <span className={`text-xs px-2 py-1 rounded border font-mono ${
              theme === 'light' ? 'bg-slate-100 border-slate-300 text-slate-700' : 'bg-slate-900 border-slate-800 text-slate-300'
            }`}>
              {totalDuration}s
            </span>
          </div>
        </div>

        {/* Center Controls: Aspect Ratio & Duration */}
        <div className={`flex items-center gap-2 rounded-xl p-1 shadow-inner border ${
          theme === 'light' ? 'bg-slate-100 border-slate-200' : 'bg-slate-900/90 border-slate-800/80'
        }`}>
          <div className="flex items-center gap-1">
            {(['16:9', '9:16', '1:1', '4:3'] as AspectRatio[]).map((ratio) => (
              <button
                key={ratio}
                id={`ratio-btn-${ratio.replace(':', '-')}`}
                onClick={() => onUpdateProject({ aspectRatio: ratio })}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                  project.aspectRatio === ratio
                    ? 'bg-sky-500 text-white shadow-sm font-semibold'
                    : theme === 'light'
                    ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
                title={`Proporção ${ratio}`}
              >
                {ratio === '16:9' ? '16:9 (Cinema)' : ratio === '9:16' ? '9:16 (Reels)' : ratio}
              </button>
            ))}
          </div>

          <div className={`h-4 w-px mx-1 hidden sm:block ${theme === 'light' ? 'bg-slate-300' : 'bg-slate-800'}`} />

          <div className={`hidden sm:flex items-center gap-2 px-2 text-xs font-medium ${
            theme === 'light' ? 'text-slate-600' : 'text-slate-400'
          }`}>
            <Layers className="w-3.5 h-3.5 text-sky-500" />
            <span>{project.scenes.length} {project.scenes.length === 1 ? 'cena' : 'cenas'}</span>
            <span className="text-slate-400">•</span>
            <span className="font-mono">{totalDuration}s total</span>
          </div>
        </div>

        {/* Right Actions: Theme Toggle, Templates, AI Auto Script, Export */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          {onToggleTheme && (
            <button
              id="theme-toggle-btn"
              onClick={onToggleTheme}
              className={`p-2 rounded-lg text-xs font-medium border transition-colors ${
                theme === 'light'
                  ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800'
                  : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-amber-400'
              }`}
              title={`Alternar para ${theme === 'light' ? 'Sophisticated Dark' : 'Light Mode'}`}
            >
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>
          )}

          <button
            id="open-templates-btn"
            onClick={onOpenPresets}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              theme === 'light'
                ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800'
                : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300 hover:border-slate-700'
            }`}
          >
            <FolderOpen className="w-3.5 h-3.5 text-amber-500" />
            <span className="hidden sm:inline">Modelos</span>
          </button>

          <button
            id="open-script-gen-btn"
            onClick={onOpenScriptGenerator}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              theme === 'light'
                ? 'bg-indigo-50 hover:bg-indigo-100 border-indigo-200 text-indigo-700'
                : 'bg-slate-900 hover:bg-slate-800 border-indigo-500/30 text-slate-200 hover:border-indigo-500/60'
            }`}
          >
            <Wand2 className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
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
