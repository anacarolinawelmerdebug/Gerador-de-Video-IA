import React, { useState } from 'react';
import {
  Film,
  Sparkles,
  Plus,
  Play,
  Copy,
  Trash2,
  Download,
  Cloud,
  Layers,
  Clock,
  Search,
  Filter,
  ArrowRight,
  CheckCircle2,
  Calendar,
  Eye,
  SlidersHorizontal,
  FolderPlus,
  Compass,
} from 'lucide-react';
import { AspectRatio, VideoProject, VideoStyle, UserProfile } from '../types';
import { STYLES_DATA } from '../data/stylesData';
import { StyleThumbnail } from './StyleThumbnail';
import { VideoPlayer } from './VideoPlayer';

interface MyGalleryProps {
  currentProject: VideoProject;
  cloudProjects?: VideoProject[];
  user: UserProfile | null;
  theme: 'dark' | 'light';
  onSelectProject: (project: VideoProject) => void;
  onDuplicateProject: (project: VideoProject) => void;
  onDeleteProject: (projectId: string) => void;
  onNewProject: () => void;
  onOpenExport: (project: VideoProject) => void;
  onSaveToCloud?: (project: VideoProject) => void;
  onNavigateToStudio: (tab?: 'prompt' | 'script' | 'music' | 'voice' | 'image_to_video') => void;
  onNavigateToInspiration: () => void;
  onSignIn: () => void;
}

export const MyGallery: React.FC<MyGalleryProps> = ({
  currentProject,
  cloudProjects = [],
  user,
  theme,
  onSelectProject,
  onDuplicateProject,
  onDeleteProject,
  onNewProject,
  onOpenExport,
  onSaveToCloud,
  onNavigateToStudio,
  onNavigateToInspiration,
  onSignIn,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStyle, setFilterStyle] = useState<string>('all');
  const [filterRatio, setFilterRatio] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'duration' | 'title'>('recent');
  const [previewProject, setPreviewProject] = useState<VideoProject | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Combine current local project and cloud projects, ensuring unique IDs and guarding against undefined
  const allProjectsMap = new Map<string, VideoProject>();
  if (currentProject && currentProject.id) {
    allProjectsMap.set(currentProject.id, currentProject);
  }
  (cloudProjects || []).forEach((p) => {
    if (p && p.id && !allProjectsMap.has(p.id)) {
      allProjectsMap.set(p.id, p);
    }
  });

  const allProjects = Array.from(allProjectsMap.values());

  // Filter & Search
  const filteredProjects = allProjects.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStyle = filterStyle === 'all' || p.style === filterStyle;
    const matchesRatio = filterRatio === 'all' || p.aspectRatio === filterRatio;

    return matchesSearch && matchesStyle && matchesRatio;
  });

  // Sort
  const sortedProjects = [...filteredProjects].sort((a, b) => {
    if (sortBy === 'recent') {
      return new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime();
    }
    if (sortBy === 'duration') {
      const durA = a.scenes.reduce((acc, s) => acc + s.duration, 0);
      const durB = b.scenes.reduce((acc, s) => acc + s.duration, 0);
      return durB - durA;
    }
    if (sortBy === 'title') {
      return a.title.localeCompare(b.title);
    }
    return 0;
  });

  // Stats calculation
  const totalTakes = allProjects.reduce((acc, p) => acc + p.scenes.length, 0);
  const totalSeconds = allProjects.reduce(
    (acc, p) => acc + p.scenes.reduce((sAcc, s) => sAcc + s.duration, 0),
    0
  );

  return (
    <div className="w-full max-w-7xl mx-auto px-4 lg:px-6 py-6 space-y-6 animate-in fade-in duration-200">
      {/* Header Banner & Stats */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className={`text-2xl font-extrabold tracking-tight ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
              Minha Galeria de Projetos
            </h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20">
              {allProjects.length} {allProjects.length === 1 ? 'vídeo' : 'vídeos'}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Gerencie, visualize, duplique, sincronize na nuvem e exporte todas as suas produções em um só lugar.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={onNavigateToInspiration}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
              theme === 'light'
                ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700'
                : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300'
            }`}
          >
            <Compass className="w-4 h-4 text-purple-400" />
            <span>Galeria de Inspiração</span>
          </button>

          <button
            id="gallery-new-project-btn"
            onClick={onNewProject}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold shadow-md shadow-sky-500/20 transition-all hover:scale-105 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Projeto</span>
          </button>
        </div>
      </div>

      {/* Quick Production Stats Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className={`p-4 rounded-2xl border ${
          theme === 'light' ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900/60 border-slate-800'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Projetos Totais</span>
            <Film className="w-4 h-4 text-sky-400" />
          </div>
          <p className={`text-xl font-bold mt-1 ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
            {allProjects.length}
          </p>
        </div>

        <div className={`p-4 rounded-2xl border ${
          theme === 'light' ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900/60 border-slate-800'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Takes de Câmera</span>
            <Layers className="w-4 h-4 text-indigo-400" />
          </div>
          <p className={`text-xl font-bold mt-1 ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
            {totalTakes}
          </p>
        </div>

        <div className={`p-4 rounded-2xl border ${
          theme === 'light' ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900/60 border-slate-800'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Tempo Produzido</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <p className={`text-xl font-bold mt-1 ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
            {totalSeconds}s
          </p>
        </div>

        <div className={`p-4 rounded-2xl border ${
          theme === 'light' ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900/60 border-slate-800'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Sincronização Nuvem</span>
            <Cloud className={`w-4 h-4 ${user ? 'text-emerald-400' : 'text-slate-500'}`} />
          </div>
          <p className={`text-xs font-bold mt-1 truncate ${user ? 'text-emerald-400' : 'text-slate-400'}`}>
            {user ? 'Firestore Ativo' : 'Apenas Local'}
          </p>
        </div>
      </div>

      {/* Cloud Authentication Banner if not signed in */}
      {!user && (
        <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-3 ${
          theme === 'light'
            ? 'bg-sky-50/70 border-sky-200 text-sky-900'
            : 'bg-slate-900/80 border-sky-500/20 text-slate-200'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold">Faça login com Google para salvar seus projetos na nuvem</p>
              <p className="text-[11px] text-slate-400">Acesse seus vídeos e roteiros de qualquer navegador ou dispositivo.</p>
            </div>
          </div>
          <button
            onClick={onSignIn}
            className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-900 text-xs font-bold shadow-sm transition-all border border-slate-200 flex items-center gap-2"
          >
            <span>Conectar Google</span>
          </button>
        </div>
      )}

      {/* Search & Filters Bar */}
      <div className={`p-3 rounded-2xl border flex flex-col md:flex-row items-center justify-between gap-3 ${
        theme === 'light' ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900/70 border-slate-800'
      }`}>
        {/* Search input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por título ou descrição..."
            className="w-full bg-slate-950/60 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
          />
        </div>

        {/* Filter controls */}
        <div className="flex items-center gap-2 flex-wrap w-full md:w-auto justify-start md:justify-end">
          {/* Style filter */}
          <select
            value={filterStyle}
            onChange={(e) => setFilterStyle(e.target.value)}
            className="bg-slate-950/60 border border-slate-800 text-slate-300 text-xs rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-sky-500"
          >
            <option value="all">Todos os Estilos ({STYLES_DATA.length})</option>
            {STYLES_DATA.map((st) => (
              <option key={st.id} value={st.id}>
                {st.name}
              </option>
            ))}
          </select>

          {/* Aspect ratio filter */}
          <select
            value={filterRatio}
            onChange={(e) => setFilterRatio(e.target.value)}
            className="bg-slate-950/60 border border-slate-800 text-slate-300 text-xs rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-sky-500"
          >
            <option value="all">Todas as Proporções</option>
            <option value="16:9">16:9 Widescreen</option>
            <option value="9:16">9:16 Vertical</option>
            <option value="1:1">1:1 Quadrado</option>
            <option value="4:3">4:3 Clássico</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-slate-950/60 border border-slate-800 text-slate-300 text-xs rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-sky-500"
          >
            <option value="recent">Mais Recentes</option>
            <option value="duration">Maior Duração</option>
            <option value="title">Ordem Alfabética</option>
          </select>
        </div>
      </div>

      {/* Projects Grid */}
      {sortedProjects.length === 0 ? (
        <div className={`text-center py-16 px-4 rounded-2xl border ${
          theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-900/40 border-slate-800'
        }`}>
          <div className="w-14 h-14 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center mx-auto mb-3">
            <Film className="w-7 h-7" />
          </div>
          <h3 className={`text-base font-bold ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
            Nenhum projeto encontrado
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-4">
            {searchQuery || filterStyle !== 'all' || filterRatio !== 'all'
              ? 'Tente ajustar os filtros ou termo de busca.'
              : 'Você ainda não possui projetos salvos. Crie seu primeiro vídeo agora!'}
          </p>
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={onNewProject}
              className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Criar Primeiro Projeto</span>
            </button>
            <button
              onClick={onNavigateToInspiration}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all flex items-center gap-1.5"
            >
              <Compass className="w-3.5 h-3.5 text-purple-400" />
              <span>Explorar Inspirações</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {sortedProjects.map((p) => {
            const isCurrentActive = currentProject.id === p.id;
            const totalDur = p.scenes.reduce((acc, s) => acc + s.duration, 0);
            const styleDetail = STYLES_DATA.find((s) => s.id === p.style);

            return (
              <div
                key={p.id}
                className={`group rounded-2xl border transition-all flex flex-col justify-between overflow-hidden relative hover:shadow-xl ${
                  isCurrentActive
                    ? 'bg-slate-900 border-sky-500 ring-1 ring-sky-500/40 shadow-lg'
                    : theme === 'light'
                    ? 'bg-white hover:bg-slate-50/80 border-slate-200 hover:border-slate-300'
                    : 'bg-slate-900/60 hover:bg-slate-900 border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Visual Thumbnail Card Header */}
                <div className="relative">
                  {styleDetail ? (
                    <StyleThumbnail style={styleDetail} className="w-full h-36" isSelected={isCurrentActive} />
                  ) : (
                    <div className="w-full h-36 bg-slate-950 flex items-center justify-center">
                      <Film className="w-8 h-8 text-slate-700" />
                    </div>
                  )}

                  {/* Top Badges */}
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 z-10">
                    <span className="px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-mono font-bold border border-white/10">
                      {p.aspectRatio}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-sky-400 text-[10px] font-bold border border-sky-500/20">
                      {p.scenes.length} {p.scenes.length === 1 ? 'take' : 'takes'} • {totalDur}s
                    </span>
                  </div>

                  {isCurrentActive && (
                    <div className="absolute top-2.5 right-2.5 z-10 flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-sky-500 text-white text-[10px] font-bold shadow-md">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Em Edição</span>
                    </div>
                  )}

                  {/* Play Button Overlay */}
                  <button
                    onClick={() => setPreviewProject(p)}
                    className="absolute inset-0 m-auto w-12 h-12 rounded-full bg-sky-500/90 hover:bg-sky-400 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-xl hover:scale-110 z-20"
                    title="Assistir Vídeo"
                  >
                    <Play className="w-5 h-5 fill-current ml-0.5" />
                  </button>
                </div>

                {/* Card Content Body */}
                <div className="p-4 flex flex-col justify-between flex-1 gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400">
                        {styleDetail?.badge || p.style}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(p.updatedAt).toLocaleDateString('pt-BR')}
                      </span>
                    </div>

                    <h3 className={`text-sm font-bold truncate ${
                      theme === 'light' ? 'text-slate-900' : 'text-white'
                    }`}>
                      {p.title || 'Sem título'}
                    </h3>

                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {p.description || 'Projeto cinematográfico com takes gerados por IA.'}
                    </p>
                  </div>

                  {/* Card Action Buttons Toolbar */}
                  <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between gap-1">
                    <div className="flex items-center gap-1">
                      {/* Play Preview */}
                      <button
                        onClick={() => setPreviewProject(p)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-sky-400 hover:bg-sky-500/10 transition-colors"
                        title="Visualizar Vídeo"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {/* Duplicate */}
                      <button
                        onClick={() => onDuplicateProject(p)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 transition-colors"
                        title="Duplicar Projeto"
                      >
                        <Copy className="w-4 h-4" />
                      </button>

                      {/* Export Modal */}
                      <button
                        onClick={() => onOpenExport(p)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                        title="Exportar Vídeo"
                      >
                        <Download className="w-4 h-4" />
                      </button>

                      {/* Delete */}
                      {deleteConfirmId === p.id ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              onDeleteProject(p.id);
                              setDeleteConfirmId(null);
                            }}
                            className="px-2 py-1 rounded-lg bg-rose-500 text-white text-[10px] font-bold"
                          >
                            Confirmar
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(null)}
                            className="p-1 text-slate-400 text-[10px]"
                          >
                            Cancelar
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirmId(p.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                          title="Excluir Projeto"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {/* Open in Studio Button */}
                    <button
                      onClick={() => {
                        onSelectProject(p);
                        onNavigateToStudio();
                      }}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-sky-500/10 hover:bg-sky-500 text-sky-400 hover:text-white text-xs font-bold border border-sky-500/20 hover:border-sky-500 transition-all"
                    >
                      <span>Abrir</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Interactive Video Player Modal for Gallery Preview */}
      {previewProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] shadow-2xl overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
                  <Play className="w-3.5 h-3.5 fill-current" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100">{previewProject.title}</h3>
                  <span className="text-[11px] text-slate-400">
                    {previewProject.aspectRatio} • {previewProject.scenes.length} takes • Estilo {previewProject.style}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    onSelectProject(previewProject);
                    setPreviewProject(null);
                    onNavigateToStudio();
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold shadow-sm"
                >
                  <Film className="w-3.5 h-3.5" />
                  <span>Editar no Estúdio</span>
                </button>
                <button
                  onClick={() => setPreviewProject(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal Player Body */}
            <div className="p-5 overflow-y-auto max-h-[calc(90vh-100px)] flex flex-col items-center">
              <div className="w-full max-w-2xl">
                <VideoPlayer
                  project={previewProject}
                  activeSceneIndex={0}
                  onSelectScene={() => {}}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
