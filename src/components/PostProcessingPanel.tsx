import React, { useState } from 'react';
import {
  Sparkles,
  Sliders,
  Film,
  Camera,
  Layers,
  RotateCcw,
  Eye,
  EyeOff,
  Columns,
  Check,
  Zap,
  Palette,
  Sun,
  Activity,
  Maximize2,
  Tv,
} from 'lucide-react';
import { ColorGradingPreset, PostProcessingFilters, VideoProject } from '../types';
import {
  COLOR_GRADING_OPTIONS,
  DEFAULT_POST_PROCESSING,
  POST_PROCESSING_PRESETS,
  PostProcessingPreset,
} from '../data/filterPresets';

interface PostProcessingPanelProps {
  filters: PostProcessingFilters;
  onChangeFilters: (filters: PostProcessingFilters) => void;
  isSplitScreen: boolean;
  onToggleSplitScreen: () => void;
  splitPosition: number;
  onChangeSplitPosition: (pos: number) => void;
  onHoldCompareStart: () => void;
  onHoldCompareEnd: () => void;
  isHoldingCompare: boolean;
  theme?: 'dark' | 'light';
  onClose?: () => void;
}

export const PostProcessingPanel: React.FC<PostProcessingPanelProps> = ({
  filters,
  onChangeFilters,
  isSplitScreen,
  onToggleSplitScreen,
  splitPosition,
  onChangeSplitPosition,
  onHoldCompareStart,
  onHoldCompareEnd,
  isHoldingCompare,
  theme = 'dark',
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'presets' | 'lens' | 'film' | 'color'>('presets');

  const updateField = <K extends keyof PostProcessingFilters>(
    field: K,
    value: PostProcessingFilters[K]
  ) => {
    onChangeFilters({
      ...filters,
      [field]: value,
      enabled: true, // auto-enable when adjusting values
    });
  };

  const handleApplyPreset = (preset: PostProcessingPreset) => {
    onChangeFilters({
      ...preset.filters,
      enabled: preset.id !== 'clean_raw',
    });
  };

  const handleReset = () => {
    onChangeFilters(DEFAULT_POST_PROCESSING);
  };

  // Count active FX
  const activeCount = [
    filters.filmGrain > 0,
    filters.chromaticAberration > 0,
    filters.vignette > 0,
    filters.bloomGlow > 0,
    filters.colorGrading !== 'none',
    filters.scanlines > 0,
    filters.sharpen > 0,
  ].filter(Boolean).length;

  return (
    <div className="bg-slate-900/95 border border-slate-800 rounded-2xl p-4 lg:p-5 shadow-2xl backdrop-blur-md flex flex-col gap-4 text-slate-200 animate-in fade-in slide-in-from-top-2 duration-200">
      {/* Header Bar */}
      <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500/20 to-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-sm text-slate-100 tracking-tight">
                Filtros de Pós-Processamento IA
              </h3>
              {filters.enabled ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
                  {activeCount} Ativos
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-800 text-slate-400 border border-slate-700">
                  Desativado
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400">
              Pré-visualize granulação, aberração óptica e grading antes da exportação
            </p>
          </div>
        </div>

        {/* Action controls */}
        <div className="flex items-center gap-2">
          {/* Master Enable Toggle */}
          <button
            id="post-process-toggle-enable-btn"
            onClick={() => updateField('enabled', !filters.enabled)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              filters.enabled
                ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/25 hover:bg-sky-400'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
            }`}
            title={filters.enabled ? 'Desativar Todos os Efeitos' : 'Ativar Efeitos'}
          >
            {filters.enabled ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span>{filters.enabled ? 'FX Ligado' : 'FX Desligado'}</span>
          </button>

          {/* Reset button */}
          <button
            id="post-process-reset-btn"
            onClick={handleReset}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-transparent hover:border-slate-700 transition-all text-xs"
            title="Restaurar Configurações Padrão"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Comparison Utilities Bar (Split Screen & Hold to Compare) */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
            <Columns className="w-3.5 h-3.5 text-sky-400" />
            Comparação:
          </span>

          <button
            id="post-process-split-screen-btn"
            onClick={onToggleSplitScreen}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
              isSplitScreen
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
            }`}
            title="Dividir tela para comparar com o vídeo original"
          >
            <span>Dividir Tela (A/B)</span>
          </button>

          {isSplitScreen && (
            <div className="flex items-center gap-2 ml-2">
              <span className="text-[10px] text-slate-400">Divisão:</span>
              <input
                type="range"
                min="0.1"
                max="0.9"
                step="0.05"
                value={splitPosition}
                onChange={(e) => onChangeSplitPosition(parseFloat(e.target.value))}
                className="w-24 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
              />
              <span className="text-[10px] font-mono text-slate-300">
                {Math.round(splitPosition * 100)}%
              </span>
            </div>
          )}
        </div>

        {/* Hold to compare button */}
        <button
          id="post-process-hold-compare-btn"
          onMouseDown={onHoldCompareStart}
          onMouseUp={onHoldCompareEnd}
          onMouseLeave={onHoldCompareEnd}
          onTouchStart={onHoldCompareStart}
          onTouchEnd={onHoldCompareEnd}
          className={`px-3 py-1 rounded-lg text-xs font-medium transition-all select-none flex items-center gap-1.5 ${
            isHoldingCompare
              ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/30'
              : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
          }`}
          title="Mantenha pressionado para visualizar o vídeo sem nenhum filtro"
        >
          <Activity className="w-3.5 h-3.5 text-amber-400" />
          <span>{isHoldingCompare ? 'Mostrando Original' : 'Segure p/ Comparar'}</span>
        </button>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-950/60 border border-slate-800/80">
        <button
          id="tab-pp-presets"
          onClick={() => setActiveTab('presets')}
          className={`flex-1 py-1.5 px-2.5 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'presets'
              ? 'bg-sky-500 text-white shadow-md font-semibold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Presets Rápidos</span>
        </button>

        <button
          id="tab-pp-lens"
          onClick={() => setActiveTab('lens')}
          className={`flex-1 py-1.5 px-2.5 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'lens'
              ? 'bg-sky-500 text-white shadow-md font-semibold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Camera className="w-3.5 h-3.5" />
          <span>Óptica & Lente</span>
        </button>

        <button
          id="tab-pp-film"
          onClick={() => setActiveTab('film')}
          className={`flex-1 py-1.5 px-2.5 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'film'
              ? 'bg-sky-500 text-white shadow-md font-semibold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Film className="w-3.5 h-3.5" />
          <span>Grão & Textura</span>
        </button>

        <button
          id="tab-pp-color"
          onClick={() => setActiveTab('color')}
          className={`flex-1 py-1.5 px-2.5 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'color'
              ? 'bg-sky-500 text-white shadow-md font-semibold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Palette className="w-3.5 h-3.5" />
          <span>Color Grading & Luz</span>
        </button>
      </div>

      {/* Tab 1: Presets Rápidos */}
      {activeTab === 'presets' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-[300px] overflow-y-auto pr-1">
          {POST_PROCESSING_PRESETS.map((preset) => {
            const isMatch =
              filters.filmGrain === preset.filters.filmGrain &&
              filters.chromaticAberration === preset.filters.chromaticAberration &&
              filters.vignette === preset.filters.vignette &&
              filters.colorGrading === preset.filters.colorGrading;

            return (
              <button
                key={preset.id}
                id={`preset-btn-${preset.id}`}
                onClick={() => handleApplyPreset(preset)}
                className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all group relative overflow-hidden ${
                  isMatch
                    ? 'bg-sky-500/15 border-sky-500/50 shadow-lg shadow-sky-500/10'
                    : 'bg-slate-950/50 hover:bg-slate-800/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="font-semibold text-xs text-slate-100 group-hover:text-sky-300 transition-colors">
                      {preset.name}
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                      {preset.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                    {preset.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 mt-2 border-t border-slate-800/60 text-[10px] text-slate-500">
                  <span>
                    Grão: {preset.filters.filmGrain}% · Aberr.: {preset.filters.chromaticAberration}px
                  </span>
                  {isMatch && (
                    <span className="text-sky-400 font-bold flex items-center gap-0.5">
                      <Check className="w-3 h-3" /> Aplicado
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Tab 2: Óptica & Lente */}
      {activeTab === 'lens' && (
        <div className="flex flex-col gap-4 max-h-[300px] overflow-y-auto pr-1">
          {/* Aberração Cromática */}
          <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800/80 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center text-xs font-bold">
                  RGB
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-200">Aberração Cromática</span>
                  <span className="text-[10px] text-slate-400 block">
                    Deslocamento de dispersão periférica RGB (lentes anamórficas)
                  </span>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
                {filters.chromaticAberration} px
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="15"
              step="1"
              value={filters.chromaticAberration}
              onChange={(e) => updateField('chromaticAberration', parseInt(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>0 (Desativado)</span>
              <span>3-5px (Cinema)</span>
              <span>15px (Sci-Fi / Glitch)</span>
            </div>
          </div>

          {/* Vinheta Cinematográfica */}
          <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800/80 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs font-bold">
                  ⭕
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-200">Vinheta de Lente</span>
                  <span className="text-[10px] text-slate-400 block">
                    Escurecimento periférico para foco central
                  </span>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
                {filters.vignette}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={filters.vignette}
              onChange={(e) => updateField('vignette', parseInt(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
            />
            <div className="flex items-center justify-between gap-4 pt-1">
              <span className="text-[10px] text-slate-400">Suavidade da Borda (Feather):</span>
              <input
                type="range"
                min="20"
                max="100"
                step="5"
                value={filters.vignetteFeather}
                onChange={(e) => updateField('vignetteFeather', parseInt(e.target.value))}
                className="w-32 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
              />
              <span className="text-[10px] font-mono text-slate-300">
                {filters.vignetteFeather}%
              </span>
            </div>
          </div>

          {/* Difusão Black Pro-Mist / Bloom Glow */}
          <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800/80 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center text-xs font-bold">
                  ✨
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-200">
                    Difusão Black Pro-Mist / Halation
                  </span>
                  <span className="text-[10px] text-slate-400 block">
                    Brilho suave nas altas luzes e suavização de texturas digitais
                  </span>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
                {filters.bloomGlow}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={filters.bloomGlow}
              onChange={(e) => updateField('bloomGlow', parseInt(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
            />
          </div>
        </div>
      )}

      {/* Tab 3: Grão & Textura */}
      {activeTab === 'film' && (
        <div className="flex flex-col gap-4 max-h-[300px] overflow-y-auto pr-1">
          {/* Granulação de Filme */}
          <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800/80 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold">
                  <Film className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-200">Granulação de Filme IA</span>
                  <span className="text-[10px] text-slate-400 block">
                    Ruído orgânico animado estilo emulsão química de cinema
                  </span>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
                {filters.filmGrain}%
              </span>
            </div>

            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={filters.filmGrain}
              onChange={(e) => updateField('filmGrain', parseInt(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
            />

            {/* Grain Size Selector */}
            <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-800/60">
              <span className="text-[11px] text-slate-400">Tamanho da Emulsão:</span>
              <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg p-0.5">
                {[
                  { id: 'fine', label: 'Fino (35mm)' },
                  { id: 'medium', label: 'Médio (16mm)' },
                  { id: 'coarse', label: 'Grosso (8mm/VHS)' },
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => updateField('grainSize', s.id as any)}
                    className={`px-2.5 py-1 rounded text-[10px] font-medium transition-all ${
                      filters.grainSize === s.id
                        ? 'bg-sky-500 text-white font-bold'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Scanlines CRT / VHS */}
          <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800/80 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-xs font-bold">
                  <Tv className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-200">Scanlines Analógicas CRT</span>
                  <span className="text-[10px] text-slate-400 block">
                    Linhas de varredura estilo monitor analógico e fita magnética
                  </span>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
                {filters.scanlines}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={filters.scanlines}
              onChange={(e) => updateField('scanlines', parseInt(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
            />
          </div>

          {/* Sharpen / Micro-contraste */}
          <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800/80 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-xs font-bold">
                  ⚡
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-200">Nitidez & Micro-contraste IA</span>
                  <span className="text-[10px] text-slate-400 block">
                    Realce de arestas e texturas fotorrealistas
                  </span>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
                {filters.sharpen}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={filters.sharpen}
              onChange={(e) => updateField('sharpen', parseInt(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
            />
          </div>
        </div>
      )}

      {/* Tab 4: Color Grading & Luz */}
      {activeTab === 'color' && (
        <div className="flex flex-col gap-4 max-h-[300px] overflow-y-auto pr-1">
          {/* LUT Palette Selector */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-slate-200">Estilo Tonal & LUTs:</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {COLOR_GRADING_OPTIONS.map((lut) => {
                const isSelected = filters.colorGrading === lut.id;
                return (
                  <button
                    key={lut.id}
                    id={`lut-btn-${lut.id}`}
                    onClick={() => updateField('colorGrading', lut.id)}
                    className={`p-2.5 rounded-xl border text-left transition-all flex items-center gap-2.5 ${
                      isSelected
                        ? 'bg-sky-500/20 border-sky-500/60 shadow-md shadow-sky-500/15'
                        : 'bg-slate-950/50 hover:bg-slate-800/60 border-slate-800'
                    }`}
                  >
                    <div
                      className="w-3.5 h-3.5 rounded-full shrink-0 shadow"
                      style={{ backgroundColor: lut.color }}
                    />
                    <div className="truncate">
                      <span className="font-semibold text-xs text-slate-200 block truncate">
                        {lut.name}
                      </span>
                      <span className="text-[9px] text-slate-400 block truncate">{lut.desc}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Basic Controls: Contraste, Saturação, Brilho */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-xl bg-slate-950/50 border border-slate-800/80">
            {/* Contraste */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-300 font-medium">Contraste:</span>
                <span className="font-mono text-sky-400 font-bold">{filters.contrast}%</span>
              </div>
              <input
                type="range"
                min="70"
                max="140"
                step="5"
                value={filters.contrast}
                onChange={(e) => updateField('contrast', parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
              />
            </div>

            {/* Saturação */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-300 font-medium">Saturação:</span>
                <span className="font-mono text-sky-400 font-bold">{filters.saturation}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="180"
                step="5"
                value={filters.saturation}
                onChange={(e) => updateField('saturation', parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
              />
            </div>

            {/* Brilho */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-300 font-medium">Brilho:</span>
                <span className="font-mono text-sky-400 font-bold">{filters.brightness}%</span>
              </div>
              <input
                type="range"
                min="70"
                max="130"
                step="5"
                value={filters.brightness}
                onChange={(e) => updateField('brightness', parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
