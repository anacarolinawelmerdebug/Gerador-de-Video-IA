import React, { useState } from 'react';
import {
  Palette,
  CheckCircle2,
  Sparkles,
  Layers,
  Camera,
  Sun,
  Maximize2,
  Eye,
  Info,
  LayoutGrid,
  List,
} from 'lucide-react';
import { VideoStyle } from '../types';
import { STYLES_DATA, StyleDetail } from '../data/stylesData';
import { StyleThumbnail } from './StyleThumbnail';

interface StyleSelectorGridProps {
  selectedStyle: VideoStyle;
  onSelectStyle: (style: VideoStyle) => void;
  className?: string;
  showCategoryFilters?: boolean;
}

export const StyleSelectorGrid: React.FC<StyleSelectorGridProps> = ({
  selectedStyle,
  onSelectStyle,
  className = '',
  showCategoryFilters = true,
}) => {
  const [viewMode, setViewMode] = useState<'visual_cards' | 'compact'>('visual_cards');
  const [filterCategory, setFilterCategory] = useState<'all' | 'cinema' | 'animation' | 'retro_scifi'>('all');
  const [previewingStyle, setPreviewingStyle] = useState<StyleDetail | null>(null);

  const filteredStyles = STYLES_DATA.filter((style) => {
    if (filterCategory === 'all') return true;
    if (filterCategory === 'cinema') {
      return ['photorealistic', 'cinematic', 'documentary', 'minimal_motion'].includes(style.id);
    }
    if (filterCategory === 'animation') {
      return ['anime', '3d_animation', 'fantasy'].includes(style.id);
    }
    if (filterCategory === 'retro_scifi') {
      return ['cyberpunk', 'synthwave', 'vintage_vhs'].includes(style.id);
    }
    return true;
  });

  const currentSelectedDetail = STYLES_DATA.find((s) => s.id === selectedStyle) || STYLES_DATA[0];

  return (
    <div className={`flex flex-col gap-3.5 ${className}`}>
      {/* Controls Bar: Label, Filter, & View Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <Palette className="w-4 h-4 text-sky-400" />
          <span className="text-xs font-bold text-slate-200">
            Estilo Visual & Estética do Vídeo
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 font-medium">
            10 Estilos com Preview
          </span>
        </div>

        {/* View Mode & Filter Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {showCategoryFilters && (
            <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800 text-[11px]">
              <button
                type="button"
                onClick={() => setFilterCategory('all')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                  filterCategory === 'all'
                    ? 'bg-sky-500 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Todos
              </button>
              <button
                type="button"
                onClick={() => setFilterCategory('cinema')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                  filterCategory === 'cinema'
                    ? 'bg-sky-500 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Cinema
              </button>
              <button
                type="button"
                onClick={() => setFilterCategory('animation')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                  filterCategory === 'animation'
                    ? 'bg-sky-500 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Animação
              </button>
              <button
                type="button"
                onClick={() => setFilterCategory('retro_scifi')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                  filterCategory === 'retro_scifi'
                    ? 'bg-sky-500 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Retro / Sci-Fi
              </button>
            </div>
          )}

          {/* Toggle between Visual Cards Grid vs Compact List */}
          <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => setViewMode('visual_cards')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'visual_cards'
                  ? 'bg-sky-500 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Grade com Pré-visualizações Visuais (Thumbnails)"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('compact')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'compact'
                  ? 'bg-sky-500 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Visualização Compacta"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Visual Cards Grid Mode with Thumbnails */}
      {viewMode === 'visual_cards' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 animate-in fade-in duration-200">
          {filteredStyles.map((style) => {
            const isSelected = selectedStyle === style.id;
            return (
              <div
                key={style.id}
                id={`style-card-${style.id}`}
                onClick={() => onSelectStyle(style.id)}
                className={`group rounded-2xl border transition-all cursor-pointer flex flex-col justify-between overflow-hidden relative ${
                  isSelected
                    ? 'bg-slate-900 border-sky-500 shadow-lg shadow-sky-500/15 ring-1 ring-sky-500/50'
                    : 'bg-slate-950/70 hover:bg-slate-900/80 border-slate-800/90 hover:border-slate-700'
                }`}
              >
                {/* Visual Thumbnail Preview */}
                <div className="relative">
                  <StyleThumbnail style={style} isSelected={isSelected} className="w-full h-32" />
                  
                  {/* Selected Tick Indicator */}
                  {isSelected && (
                    <div className="absolute top-2.5 right-2.5 z-20 flex items-center gap-1 px-2.5 py-1 rounded-full bg-sky-500 text-white text-[10px] font-bold shadow-md animate-in zoom-in-50 duration-150">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Selecionado</span>
                    </div>
                  )}

                  {/* Quick Info Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPreviewingStyle(style);
                    }}
                    className="absolute top-2.5 right-2.5 z-10 p-1.5 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md text-slate-300 hover:text-white border border-white/20 transition-all opacity-0 group-hover:opacity-100"
                    title="Ver detalhes e prompt de exemplo"
                  >
                    <Info className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Content Details */}
                <div className="p-3.5 flex flex-col gap-2 flex-1 justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className={`text-xs font-bold transition-colors ${
                        isSelected ? 'text-sky-300' : 'text-slate-100 group-hover:text-sky-400'
                      }`}>
                        {style.name}
                      </h4>
                    </div>

                    <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                      {style.shortDesc}
                    </p>
                  </div>

                  {/* Lighting & Tags Badges */}
                  <div className="space-y-2 pt-2 border-t border-slate-800/60">
                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                      <span className="flex items-center gap-1 truncate max-w-[150px]">
                        <Camera className="w-3 h-3 text-sky-400 flex-shrink-0" />
                        <span className="truncate">{style.lensType}</span>
                      </span>
                      <span className="flex items-center gap-1 text-amber-400/90 truncate max-w-[120px]">
                        <Sun className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">{style.lightingType.split('&')[0]}</span>
                      </span>
                    </div>

                    {/* Tag Pills */}
                    <div className="flex items-center gap-1 flex-wrap">
                      {style.tags.slice(0, 2).map((tag, i) => (
                        <span
                          key={i}
                          className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800/80 text-slate-300 border border-slate-700/60"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Compact Mode */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 animate-in fade-in duration-200">
          {filteredStyles.map((style) => {
            const isSelected = selectedStyle === style.id;
            return (
              <button
                key={style.id}
                type="button"
                id={`style-btn-${style.id}`}
                onClick={() => onSelectStyle(style.id)}
                className={`p-3 rounded-xl text-left border transition-all flex items-center gap-3 relative overflow-hidden ${
                  isSelected
                    ? 'bg-sky-500/15 border-sky-500 text-white shadow-md shadow-sky-500/10'
                    : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                {/* Mini Thumbnail */}
                <div className="w-14 h-12 flex-shrink-0 rounded-lg overflow-hidden border border-slate-700/60">
                  <StyleThumbnail style={style} className="w-full h-full" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-bold text-slate-200 truncate">{style.name}</span>
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-sky-400 flex-shrink-0" />}
                  </div>
                  <span className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{style.shortDesc}</span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Selected Style Active Info Bar */}
      <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg overflow-hidden border border-sky-500/30 flex-shrink-0">
            <StyleThumbnail style={currentSelectedDetail} className="w-full h-full" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold text-sky-400">Estilo Ativo:</span>
              <span className="text-xs font-bold text-slate-100">{currentSelectedDetail.name}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-300 font-mono">
                {currentSelectedDetail.badge}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 line-clamp-1">
              {currentSelectedDetail.detailedDesc}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            type="button"
            onClick={() => setPreviewingStyle(currentSelectedDetail)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
          >
            <Eye className="w-3.5 h-3.5 text-sky-400" />
            <span>Ver Ficha Técnica</span>
          </button>
        </div>
      </div>

      {/* Style Technical Specs & Prompt Guide Modal */}
      {previewingStyle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-150">
            {/* Modal Header Thumbnail Banner */}
            <div className="relative h-44 w-full">
              <StyleThumbnail style={previewingStyle} className="w-full h-full rounded-none" />
              <button
                type="button"
                onClick={() => setPreviewingStyle(null)}
                className="absolute top-3 right-3 z-30 px-2.5 py-1 rounded-full bg-black/70 hover:bg-black text-white text-xs font-bold border border-white/20"
              >
                ✕ Fechar
              </button>
              <div className="absolute bottom-3 left-4 z-20">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-500 text-white shadow-sm mb-1 inline-block">
                  {previewingStyle.badge}
                </span>
                <h3 className="text-lg font-extrabold text-white drop-shadow-md">
                  {previewingStyle.name}
                </h3>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 text-xs text-slate-300">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Descrição & Estética
                </span>
                <p className="leading-relaxed text-slate-200">
                  {previewingStyle.detailedDesc}
                </p>
              </div>

              {/* Technical Optics Grid */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-sky-400 font-semibold block mb-0.5">Lente e Sensor:</span>
                  <span className="text-slate-200 font-mono text-[11px]">{previewingStyle.lensType}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-amber-400 font-semibold block mb-0.5">Iluminação:</span>
                  <span className="text-slate-200 text-[11px]">{previewingStyle.lightingType}</span>
                </div>
              </div>

              {/* Color Palette Chips */}
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                  Paleta de Cores Dominante
                </span>
                <div className="flex items-center gap-2">
                  {previewingStyle.colorPalette.map((col, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 bg-slate-950 px-2 py-1 rounded-lg border border-slate-800">
                      <span className="w-3.5 h-3.5 rounded-full shadow-xs" style={{ backgroundColor: col }} />
                      <span className="font-mono text-[10px] text-slate-400">{col}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Prompt Suggestion for this Style */}
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Exemplo de Prompt Recomendado
                </span>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 font-mono text-[11px] leading-relaxed">
                  "{previewingStyle.samplePrompt}"
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setPreviewingStyle(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
                >
                  Fechar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onSelectStyle(previewingStyle.id);
                    setPreviewingStyle(null);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-sky-500 hover:bg-sky-400 text-white shadow-md transition-colors"
                >
                  Aplicar Este Estilo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
