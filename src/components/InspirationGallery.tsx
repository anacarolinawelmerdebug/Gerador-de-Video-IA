import React, { useState } from 'react';
import {
  Compass,
  Sparkles,
  Play,
  Copy,
  Layers,
  Clock,
  Heart,
  Eye,
  Search,
  CheckCircle2,
  ArrowRight,
  Filter,
  Wand2,
  Film,
  Music,
  Share2,
} from 'lucide-react';
import { AspectRatio, InspirationItem, Scene, VideoProject, VideoStyle } from '../types';
import { INSPIRATION_ITEMS } from '../data/inspirationData';
import { STYLES_DATA } from '../data/stylesData';
import { StyleThumbnail } from './StyleThumbnail';
import { VideoPlayer } from './VideoPlayer';

interface InspirationGalleryProps {
  theme: 'dark' | 'light';
  onRemixInspiration: (item: InspirationItem) => void;
  onNavigateToStudio: () => void;
  onShowToast: (msg: string) => void;
  onNewProject: () => void;
}

export const InspirationGallery: React.FC<InspirationGalleryProps> = ({
  theme,
  onRemixInspiration,
  onNavigateToStudio,
  onShowToast,
  onNewProject,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStyle, setSelectedStyle] = useState<string>('all');
  const [selectedRatio, setSelectedRatio] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [inspectingItem, setInspectingItem] = useState<InspirationItem | null>(null);
  const [likes, setLikes] = useState<Record<string, boolean>>({});

  const categories = [
    { id: 'all', label: 'Todos os Gêneros' },
    { id: 'scifi', label: 'Sci-Fi & Cyberpunk' },
    { id: 'animation', label: 'Animação & Ghibli' },
    { id: 'commercial', label: 'Comerciais de Luxo' },
    { id: 'nature', label: 'Natureza & Wildlife' },
    { id: 'retro', label: 'Retrô 80s & VHS 90s' },
    { id: 'cinema', label: 'Alta Fantasia & Cinema' },
  ];

  // Filter inspiration items
  const filteredItems = INSPIRATION_ITEMS.filter((item) => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesStyle = selectedStyle === 'all' || item.style === selectedStyle;
    const matchesRatio = selectedRatio === 'all' || item.aspectRatio === selectedRatio;
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesStyle && matchesRatio && matchesSearch;
  });

  const toggleLike = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setLikes((prev) => {
      const next = !prev[id];
      if (next) {
        onShowToast('Adicionado aos favoritos de inspiração!');
      }
      return { ...prev, [id]: next };
    });
  };

  const copyPrompts = (item: InspirationItem, e: React.MouseEvent) => {
    e.stopPropagation();
    const promptText = item.scenes
      .map((s, idx) => `Take ${idx + 1} (${s.title}):\n"${s.visualPrompt}"\nCâmera: ${s.cameraMotion} | Efeito: ${s.atmosphereEffect}`)
      .join('\n\n');

    navigator.clipboard.writeText(promptText);
    onShowToast(`Prompts do vídeo "${item.title}" copiados para a área de transferência!`);
  };

  // Convert inspiration item to temporary VideoProject for the live VideoPlayer
  const buildProjectFromInspiration = (item: InspirationItem): VideoProject => ({
    id: 'insp_prev_' + item.id,
    title: item.title,
    description: item.description,
    aspectRatio: item.aspectRatio,
    style: item.style,
    fps: 30,
    resolution: '1080p',
    soundtrack: item.soundtrack,
    enableVoiceover: true,
    voiceGender: 'pt-BR-female',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    scenes: item.scenes.map((s, idx) => ({
      ...s,
      id: `sc_insp_${idx}`,
    })),
  });

  return (
    <div className="w-full max-w-7xl mx-auto px-4 lg:px-6 py-6 space-y-6 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-purple-500 to-indigo-600 flex items-center justify-center text-white shadow-md">
              <Compass className="w-4 h-4" />
            </div>
            <h1 className={`text-2xl font-extrabold tracking-tight ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
              Galeria de Inspiração & Comunidade
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Descubra criações cinematográficas, explore fórmulas de prompts visuais e faça <strong>Remix em 1-Clique</strong> para o seu Estúdio.
          </p>
        </div>

        <button
          onClick={onNewProject}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold shadow-md shadow-sky-500/20 transition-all hover:scale-105 active:scale-95"
        >
          <Sparkles className="w-4 h-4" />
          <span>Criar do Zero</span>
        </button>
      </div>

      {/* Category Pills Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                isSelected
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/20'
                  : theme === 'light'
                  ? 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                  : 'bg-slate-900/80 hover:bg-slate-800 text-slate-400 border border-slate-800'
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Search & Filters Toolbar */}
      <div className={`p-3 rounded-2xl border flex flex-col md:flex-row items-center justify-between gap-3 ${
        theme === 'light' ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900/70 border-slate-800'
      }`}>
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por tags (Cyberpunk, Ghibli, 8K, Reels)..."
            className="w-full bg-slate-950/60 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap w-full md:w-auto justify-start md:justify-end">
          {/* Style Filter */}
          <select
            value={selectedStyle}
            onChange={(e) => setSelectedStyle(e.target.value)}
            className="bg-slate-950/60 border border-slate-800 text-slate-300 text-xs rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-purple-500"
          >
            <option value="all">Todos os Estilos Visuais</option>
            {STYLES_DATA.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>

          {/* Aspect Ratio Filter */}
          <select
            value={selectedRatio}
            onChange={(e) => setSelectedRatio(e.target.value)}
            className="bg-slate-950/60 border border-slate-800 text-slate-300 text-xs rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-purple-500"
          >
            <option value="all">Todas as Proporções</option>
            <option value="16:9">16:9 Widescreen</option>
            <option value="9:16">9:16 Vertical (Reels/TikTok)</option>
            <option value="1:1">1:1 Quadrado (Feed)</option>
            <option value="4:3">4:3 Vintage</option>
          </select>
        </div>
      </div>

      {/* Grid of Inspiration Showcases */}
      {filteredItems.length === 0 ? (
        <div className={`text-center py-16 px-4 rounded-2xl border ${
          theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-900/40 border-slate-800'
        }`}>
          <Compass className="w-10 h-10 text-slate-500 mx-auto mb-3 animate-pulse" />
          <h3 className={`text-base font-bold ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
            Nenhuma inspiração encontrada
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-4">
            Tente selecionar outra categoria ou limpar a busca para ver todas as produções disponíveis.
          </p>
          <button
            onClick={() => {
              setSelectedCategory('all');
              setSelectedStyle('all');
              setSelectedRatio('all');
              setSearchQuery('');
            }}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md transition-all"
          >
            Ver Todas as Inspirações
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => {
            const styleDetail = STYLES_DATA.find((s) => s.id === item.style);
            const isLiked = likes[item.id];
            const currentLikes = item.likesCount + (isLiked ? 1 : 0);

            return (
              <div
                key={item.id}
                onClick={() => setInspectingItem(item)}
                className={`group rounded-2xl border transition-all flex flex-col justify-between overflow-hidden cursor-pointer hover:shadow-2xl ${
                  theme === 'light'
                    ? 'bg-white hover:bg-slate-50 border-slate-200 hover:border-slate-300'
                    : 'bg-slate-900/70 hover:bg-slate-900 border-slate-800 hover:border-purple-500/40'
                }`}
              >
                {/* Thumbnail and Visual Stage */}
                <div className="relative overflow-hidden">
                  {styleDetail ? (
                    <StyleThumbnail style={styleDetail} className="w-full h-40" isSelected={false} />
                  ) : (
                    <div className="w-full h-40 bg-slate-950 flex items-center justify-center">
                      <Film className="w-8 h-8 text-slate-700" />
                    </div>
                  )}

                  {/* Top Overlay Badges */}
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 z-10">
                    <span className="px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-md text-white text-[10px] font-mono font-bold border border-white/10">
                      {item.aspectRatio}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-md text-purple-300 text-[10px] font-bold border border-purple-500/20">
                      {item.scenes.length} takes • {item.duration}s
                    </span>
                  </div>

                  {/* Favorite Like Button */}
                  <button
                    onClick={(e) => toggleLike(item.id, e)}
                    className={`absolute top-2.5 right-2.5 z-10 p-1.5 rounded-full backdrop-blur-md transition-all ${
                      isLiked
                        ? 'bg-rose-500 text-white'
                        : 'bg-black/60 text-white/80 hover:text-white hover:bg-black/80'
                    }`}
                  >
                    <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-current' : ''}`} />
                  </button>

                  {/* Center Play Button Overlay on Hover */}
                  <div className="absolute inset-0 m-auto w-12 h-12 rounded-full bg-purple-600/90 group-hover:scale-110 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-xl z-20">
                    <Play className="w-5 h-5 fill-current ml-0.5" />
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-4 flex flex-col justify-between flex-1 gap-3">
                  <div className="space-y-1.5">
                    {/* Creator Info */}
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span className="font-semibold text-slate-300 truncate max-w-[170px]">
                        {item.creator}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="flex items-center gap-1">
                          <Heart className="w-3 h-3 text-rose-400" />
                          <span>{currentLikes}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3 text-sky-400" />
                          <span>{item.viewsCount}</span>
                        </span>
                      </div>
                    </div>

                    <h3 className={`text-sm font-bold truncate ${
                      theme === 'light' ? 'text-slate-900 group-hover:text-purple-600' : 'text-white group-hover:text-purple-400'
                    }`}>
                      {item.title}
                    </h3>

                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1 pt-1">
                      {item.tags.slice(0, 3).map((tag, idx) => (
                        <span
                          key={idx}
                          className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions Bottom Bar */}
                  <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between gap-2">
                    <button
                      onClick={(e) => copyPrompts(item, e)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors flex items-center gap-1 text-[11px]"
                      title="Copiar Prompts"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Copiar Prompts</span>
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemixInspiration(item);
                        onNavigateToStudio();
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md shadow-purple-600/20 transition-all hover:scale-105"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Remixar no Estúdio</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Interactive Inspiration Inspector & Live Preview Modal */}
      {inspectingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] shadow-2xl overflow-hidden flex flex-col">
            {/* Modal Top Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/80">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-500 to-indigo-600 flex items-center justify-center text-white shadow-md">
                  <Compass className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100">{inspectingItem.title}</h3>
                  <span className="text-[11px] text-slate-400">
                    Criado por {inspectingItem.creator} • Estilo {inspectingItem.style} • {inspectingItem.aspectRatio}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    onRemixInspiration(inspectingItem);
                    setInspectingItem(null);
                    onNavigateToStudio();
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md shadow-purple-500/25"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Usar e Remixar no Estúdio</span>
                </button>

                <button
                  onClick={() => setInspectingItem(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal Body: Player + Scene Prompt Blueprint breakdown */}
            <div className="p-5 overflow-y-auto max-h-[calc(90vh-120px)] space-y-6 custom-scrollbar">
              {/* Live Video Player Preview */}
              <div className="flex justify-center">
                <div className="w-full max-w-xl">
                  <VideoPlayer
                    project={buildProjectFromInspiration(inspectingItem)}
                    activeSceneIndex={0}
                    onSelectScene={() => {}}
                  />
                </div>
              </div>

              {/* Scene by Scene Blueprint Recipes */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5" />
                    <span>Roteiro & Receita de Prompts Visuais ({inspectingItem.scenes.length} Takes)</span>
                  </h4>
                  <button
                    onClick={(e) => copyPrompts(inspectingItem, e)}
                    className="text-xs font-semibold text-sky-400 hover:text-sky-300 flex items-center gap-1"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar Todos</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {inspectingItem.scenes.map((scene, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2 flex flex-col justify-between"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20">
                            Take {idx + 1} • {scene.duration}s
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">
                            {scene.cameraMotion}
                          </span>
                        </div>
                        <h5 className="text-xs font-bold text-slate-200">{scene.title}</h5>
                        <p className="text-[11px] text-slate-400 leading-relaxed italic">
                          "{scene.visualPrompt}"
                        </p>
                      </div>

                      {scene.narration && (
                        <div className="pt-2 border-t border-slate-900 text-[10px] text-slate-400">
                          <strong className="text-slate-300">Locução:</strong> {scene.narration}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
