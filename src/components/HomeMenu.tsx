import React from 'react';
import {
  Film,
  Sparkles,
  Wand2,
  Music,
  Mic,
  Image as ImageIcon,
  FolderOpen,
  Cloud,
  Layers,
  ArrowRight,
  Play,
  CheckCircle2,
  Video,
  Radio,
  Sliders,
  Download,
  Zap,
  Star,
  PlusCircle,
  Clock,
  ExternalLink,
  Compass,
  Heart,
  Eye,
  Plus,
} from 'lucide-react';
import { VideoProject, UserProfile, PresetTemplate, VideoStyle } from '../types';
import { PRESET_TEMPLATES } from '../data/presets';
import { STYLES_DATA } from '../data/stylesData';
import { INSPIRATION_ITEMS } from '../data/inspirationData';
import { StyleThumbnail } from './StyleThumbnail';

interface HomeMenuProps {
  currentProject: VideoProject;
  cloudProjects?: VideoProject[];
  user: UserProfile | null;
  theme: 'dark' | 'light';
  onNavigateToStudio: (tab?: 'prompt' | 'script' | 'music' | 'voice' | 'image_to_video') => void;
  onNavigateToGallery: () => void;
  onNavigateToInspiration: () => void;
  onOpenScriptGenerator: () => void;
  onOpenPresets: () => void;
  onOpenCloudProjects: () => void;
  onOpenExport: () => void;
  onSelectPreset: (preset: PresetTemplate) => void;
  onSelectStyle?: (style: VideoStyle) => void;
  onNewProject: () => void;
  onSignIn: () => void;
}

export const HomeMenu: React.FC<HomeMenuProps> = ({
  currentProject,
  cloudProjects = [],
  user,
  theme,
  onNavigateToStudio,
  onNavigateToGallery,
  onNavigateToInspiration,
  onOpenScriptGenerator,
  onOpenPresets,
  onOpenCloudProjects,
  onOpenExport,
  onSelectPreset,
  onSelectStyle,
  onNewProject,
  onSignIn,
}) => {
  const totalDuration = (currentProject?.scenes || []).reduce((acc, s) => acc + (s?.duration || 0), 0);
  const totalProjectsCount = Math.max(
    1,
    1 + (cloudProjects || []).filter((p) => p && p.id && currentProject && p.id !== currentProject.id).length
  );

  const features = [
    {
      id: 'prompt_studio',
      title: 'Prompt & Estilos Visuais',
      category: 'Geração Visual',
      description: 'Crie tomadas de alta fidelidade descrevendo o ambiente, iluminação cinematográfica, lente e movimentos de câmera.',
      icon: Sparkles,
      color: 'from-sky-500 to-blue-600',
      badge: 'Gemini Vision',
      badgeColor: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
      actionLabel: 'Abrir Criador de Prompt',
      onClick: () => onNavigateToStudio('prompt'),
    },
    {
      id: 'script_director',
      title: 'Diretor de Roteiros IA',
      category: 'Criação Completa',
      description: 'Gere automaticamente um roteiro cinematográfico de várias cenas, com takes, descrições visuais e legendas sincronizadas.',
      icon: Wand2,
      color: 'from-indigo-500 to-purple-600',
      badge: 'IA Autônoma',
      badgeColor: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
      actionLabel: 'Gerar Novo Roteiro',
      onClick: onOpenScriptGenerator,
    },
    {
      id: 'music_generator',
      title: 'Trilhas Sonoras IA',
      category: 'Áudio & Música',
      description: 'Componha trilhas originais épicas, synthwave, ambient ou orquestrais com Google Lyria 3 e visualizador de ondas.',
      icon: Music,
      color: 'from-rose-500 to-pink-600',
      badge: 'Google Lyria 3',
      badgeColor: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
      actionLabel: 'Compor Música',
      onClick: () => onNavigateToStudio('music'),
    },
    {
      id: 'voice_tts',
      title: 'Voz & Locução Neural',
      category: 'Narração & Voz',
      description: 'Sintetize vozes humanas profissionais em múltiplos idiomas com entonação dramática, comercial ou documental.',
      icon: Mic,
      color: 'from-violet-500 to-indigo-600',
      badge: 'Neural TTS',
      badgeColor: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
      actionLabel: 'Criar Locução',
      onClick: () => onNavigateToStudio('voice'),
    },
    {
      id: 'image_to_video',
      title: 'Foto para Vídeo Animado',
      category: 'Animação',
      description: 'Faça upload de fotos ou imagens estáticas e adicione animação de câmera, partículas dinâmicas e efeitos visuais.',
      icon: ImageIcon,
      color: 'from-emerald-500 to-teal-600',
      badge: 'Animação 2D/3D',
      badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      actionLabel: 'Animar Foto',
      onClick: () => onNavigateToStudio('image_to_video'),
    },
    {
      id: 'templates_presets',
      title: 'Galeria de Modelos',
      category: 'Templates Prontos',
      description: 'Explore modelos cinematográficos prontos: Trailers de Cinema, Comerciais, Cyberpunk, Natureza e Documentários.',
      icon: FolderOpen,
      color: 'from-amber-500 to-orange-600',
      badge: 'Pronto p/ Usar',
      badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      actionLabel: 'Ver Modelos',
      onClick: onOpenPresets,
    },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 lg:px-6 py-6 space-y-8 animate-in fade-in duration-200">
      {/* Hero Welcome Banner */}
      <section
        id="home-hero-banner"
        className={`relative overflow-hidden rounded-2xl border p-6 md:p-8 transition-all ${
          theme === 'light'
            ? 'bg-gradient-to-br from-indigo-50/80 via-white to-sky-50/80 border-indigo-100 shadow-sm'
            : 'bg-gradient-to-br from-slate-900/90 via-slate-950 to-indigo-950/40 border-slate-800 shadow-xl'
        }`}
      >
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Estúdio Completo de Produção de Vídeos com IA</span>
          </div>

          <h1 className={`text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight ${
            theme === 'light' ? 'text-slate-900' : 'text-white'
          }`}>
            Crie, Roteirize, Componha e Anime Vídeos Cinematográficos com IA
          </h1>

          <p className={`text-sm md:text-base leading-relaxed ${
            theme === 'light' ? 'text-slate-600' : 'text-slate-300'
          }`}>
            O <strong>CineAI</strong> reúne direção de roteiros, geração de imagens cena a cena, trilhas sonoras compostas com Google Lyria 3, vozes neurais e exportação de vídeo em uma única plataforma integrada.
          </p>

          {/* Main Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              id="hero-open-studio-btn"
              onClick={() => onNavigateToStudio('prompt')}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-sm shadow-lg shadow-sky-500/25 transition-all hover:scale-[1.02] active:scale-95"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Abrir Estúdio</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              id="hero-new-project-btn"
              onClick={onNewProject}
              className="flex items-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-sm font-bold shadow-md shadow-emerald-500/20 transition-all hover:scale-[1.02] active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Novo Projeto</span>
            </button>

            <button
              id="hero-gallery-btn"
              onClick={onNavigateToGallery}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-semibold transition-all ${
                theme === 'light'
                  ? 'bg-white hover:bg-slate-50 border-slate-300 text-slate-800 shadow-sm'
                  : 'bg-slate-900/90 hover:bg-slate-800 border-slate-700 text-slate-200'
              }`}
            >
              <FolderOpen className="w-4 h-4 text-sky-400" />
              <span>Minha Galeria ({totalProjectsCount})</span>
            </button>

            <button
              id="hero-inspiration-btn"
              onClick={onNavigateToInspiration}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-semibold transition-all ${
                theme === 'light'
                  ? 'bg-purple-50 hover:bg-purple-100 border-purple-200 text-purple-800 shadow-sm'
                  : 'bg-slate-900/90 hover:bg-slate-800 border-purple-500/30 text-purple-300'
              }`}
            >
              <Compass className="w-4 h-4 text-purple-400" />
              <span>Galeria de Inspiração</span>
            </button>

            {!user && (
              <button
                id="hero-signin-btn"
                onClick={onSignIn}
                className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white hover:bg-slate-100 text-slate-900 text-sm font-semibold border border-slate-200 shadow-sm transition-all"
              >
                <Cloud className="w-4 h-4 text-sky-500" />
                <span>Conectar Google</span>
              </button>
            )}
          </div>
        </div>

        {/* Decorative background visual glow */}
        <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-sky-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -right-8 -bottom-16 w-72 h-72 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
      </section>

      {/* Active Project Quick Card */}
      <section
        id="active-project-bar"
        className={`p-4 md:p-5 rounded-2xl border transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
          theme === 'light'
            ? 'bg-white border-slate-200 shadow-sm'
            : 'bg-slate-900/80 border-slate-800'
        }`}
      >
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 flex-shrink-0">
            <Film className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20">
                Projeto Ativo em Edição
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {currentProject.aspectRatio} • {totalDuration}s total
              </span>
            </div>
            <h3 className={`text-base font-bold truncate max-w-md ${
              theme === 'light' ? 'text-slate-900' : 'text-white'
            }`}>
              {currentProject.title}
            </h3>
            <p className="text-xs text-slate-400 truncate max-w-lg">
              {currentProject.scenes.length} {currentProject.scenes.length === 1 ? 'cena' : 'cenas'} • Estilo {currentProject.style} {currentProject.customAudioTitle ? `• Trilha: ${currentProject.customAudioTitle}` : ''}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto justify-end flex-wrap">
          <button
            onClick={onNavigateToGallery}
            className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-colors flex items-center gap-1.5 ${
              theme === 'light'
                ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700'
                : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
            }`}
          >
            <FolderOpen className="w-3.5 h-3.5 text-sky-400" />
            <span>Minha Galeria</span>
          </button>

          <button
            onClick={onNewProject}
            className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-colors flex items-center gap-1.5 ${
              theme === 'light'
                ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700'
                : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Novo Projeto</span>
          </button>

          <button
            onClick={() => onNavigateToStudio('prompt')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold shadow-md transition-all"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Continuar Editando</span>
          </button>
        </div>
      </section>

      {/* Grid of 6 Core Modules & Functionalities */}
      <section className="space-y-4">
        <div>
          <h2 className={`text-lg font-bold ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
            Funcionalidades e Ferramentas do Aplicativo
          </h2>
          <p className="text-xs text-slate-400">
            Selecione uma funcionalidade para iniciar o fluxo criativo ou explorar as ferramentas avançadas do estúdio.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feat) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.id}
                onClick={feat.onClick}
                className={`group p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between hover:shadow-lg ${
                  theme === 'light'
                    ? 'bg-white hover:bg-slate-50/80 border-slate-200 hover:border-slate-300'
                    : 'bg-slate-900/60 hover:bg-slate-900 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${feat.color} flex items-center justify-center text-white shadow-md`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${feat.badgeColor}`}>
                      {feat.badge}
                    </span>
                  </div>

                  <div>
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                      {feat.category}
                    </span>
                    <h3 className={`text-sm font-bold transition-colors ${
                      theme === 'light' ? 'text-slate-900 group-hover:text-sky-600' : 'text-slate-100 group-hover:text-sky-400'
                    }`}>
                      {feat.title}
                    </h3>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed">
                    {feat.description}
                  </p>
                </div>

                <div className="pt-4 mt-2 border-t border-slate-800/50 flex items-center justify-between">
                  <span className={`text-xs font-semibold transition-colors flex items-center gap-1 ${
                    theme === 'light' ? 'text-sky-600' : 'text-sky-400'
                  }`}>
                    {feat.actionLabel}
                  </span>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 group-hover:text-sky-400 transition-all" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Showcase: Visual Styles Gallery with Interactive Thumbnails */}
      <section className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <div>
            <h2 className={`text-lg font-bold ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
              Estilos Visuais & Estéticas de Vídeo
            </h2>
            <p className="text-xs text-slate-400">
              Escolha visualmente a assinatura cinematográfica, iluminação e lentes para sua produção.
            </p>
          </div>
          <button
            onClick={() => onNavigateToStudio('prompt')}
            className="text-xs font-semibold text-sky-400 hover:text-sky-300 flex items-center gap-1"
          >
            <span>Ver no Estúdio</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {STYLES_DATA.map((style) => {
            const isCurrent = currentProject.style === style.id;
            return (
              <div
                key={style.id}
                onClick={() => {
                  if (onSelectStyle) {
                    onSelectStyle(style.id);
                  }
                  onNavigateToStudio('prompt');
                }}
                className={`group rounded-2xl border transition-all cursor-pointer flex flex-col justify-between overflow-hidden relative hover:shadow-lg ${
                  isCurrent
                    ? 'bg-slate-900 border-sky-500 shadow-md ring-1 ring-sky-500/40'
                    : theme === 'light'
                    ? 'bg-white hover:bg-slate-50 border-slate-200'
                    : 'bg-slate-900/60 hover:bg-slate-900 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div className="relative">
                  <StyleThumbnail style={style} className="w-full h-32" isSelected={isCurrent} />
                  {isCurrent && (
                    <div className="absolute top-2.5 right-2.5 z-20 flex items-center gap-1 px-2.5 py-1 rounded-full bg-sky-500 text-white text-[10px] font-bold shadow-md">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Estilo Ativo</span>
                    </div>
                  )}
                </div>

                <div className="p-3.5 flex flex-col justify-between flex-1 gap-2">
                  <div>
                    <h4 className={`text-xs font-bold transition-colors ${
                      isCurrent
                        ? 'text-sky-400'
                        : theme === 'light'
                        ? 'text-slate-900 group-hover:text-sky-600'
                        : 'text-slate-100 group-hover:text-sky-400'
                    }`}>
                      {style.name}
                    </h4>
                    <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5">
                      {style.shortDesc}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-800/50 flex items-center justify-between text-[10px] text-slate-400">
                    <span className="font-mono truncate max-w-[140px]">{style.lensType}</span>
                    <span className="text-sky-400 font-semibold group-hover:translate-x-0.5 transition-transform">
                      Criar Vídeo →
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Showcase: Galeria de Inspiração da Comunidade */}
      <section className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h2 className={`text-lg font-bold ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                Galeria de Inspiração em Destaque
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                1-Click Remix
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Assista a criações cinematográficas completas com prompts, iluminação e trilha prontos para remixar.
            </p>
          </div>
          <button
            onClick={onNavigateToInspiration}
            className="text-xs font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1"
          >
            <span>Ver Galeria Completa ({INSPIRATION_ITEMS.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {INSPIRATION_ITEMS.slice(0, 3).map((item) => {
            const styleDetail = STYLES_DATA.find((s) => s.id === item.style);
            return (
              <div
                key={item.id}
                onClick={onNavigateToInspiration}
                className={`group rounded-2xl border transition-all cursor-pointer flex flex-col justify-between overflow-hidden relative hover:shadow-lg ${
                  theme === 'light'
                    ? 'bg-white hover:bg-slate-50 border-slate-200'
                    : 'bg-slate-900/60 hover:bg-slate-900 border-slate-800/80 hover:border-purple-500/40'
                }`}
              >
                <div className="relative">
                  {styleDetail && <StyleThumbnail style={styleDetail} className="w-full h-32" isSelected={false} />}
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1 z-10">
                    <span className="px-2 py-0.5 rounded-full bg-black/70 text-white text-[9px] font-bold font-mono">
                      {item.aspectRatio}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-black/70 text-purple-300 text-[9px] font-bold">
                      {item.scenes.length} takes • {item.duration}s
                    </span>
                  </div>
                </div>

                <div className="p-3.5 flex flex-col justify-between flex-1 gap-2">
                  <div>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                      <span>{item.creator}</span>
                      <span className="flex items-center gap-1 text-rose-400">
                        <Heart className="w-3 h-3 fill-current" />
                        <span>{item.likesCount}</span>
                      </span>
                    </div>
                    <h4 className={`text-xs font-bold transition-colors ${
                      theme === 'light' ? 'text-slate-900 group-hover:text-purple-600' : 'text-slate-100 group-hover:text-purple-400'
                    }`}>
                      {item.title}
                    </h4>
                    <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5">
                      {item.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-800/50 flex items-center justify-between text-[10px]">
                    <span className="text-purple-400 font-semibold flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      <span>Remixar no Estúdio</span>
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-1 group-hover:text-purple-400 transition-all" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Recommended Templates Carousel/Grid */}
      <section className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <div>
            <h2 className={`text-lg font-bold ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
              Modelos Rápidos Populares
            </h2>
            <p className="text-xs text-slate-400">
              Inicie com uma estrutura de takes, prompts visuais e trilha pré-configurados.
            </p>
          </div>
          <button
            onClick={onOpenPresets}
            className="text-xs font-semibold text-sky-400 hover:text-sky-300 flex items-center gap-1"
          >
            <span>Ver todos ({PRESET_TEMPLATES.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {PRESET_TEMPLATES.slice(0, 3).map((template) => {
            const totalSec = template.scenes.reduce((a, b) => a + b.duration, 0);
            return (
              <div
                key={template.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                  theme === 'light'
                    ? 'bg-white border-slate-200 shadow-sm hover:border-slate-300'
                    : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      {template.category}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      {template.aspectRatio} • {totalSec}s
                    </span>
                  </div>
                  <h4 className={`text-sm font-bold ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'}`}>
                    {template.name}
                  </h4>
                  <p className="text-xs text-slate-400 line-clamp-2 mt-1">
                    {template.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/40">
                  <span className="text-[11px] text-slate-500">
                    {template.scenes.length} tomadas cinematográficas
                  </span>
                  <button
                    onClick={() => {
                      onSelectPreset(template);
                      onNavigateToStudio('prompt');
                    }}
                    className="px-3 py-1.5 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/30 text-xs font-semibold transition-colors"
                  >
                    Usar Modelo
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Cloud Sync & Architecture Summary */}
      <section
        id="cloud-architecture-footer"
        className={`p-6 rounded-2xl border flex flex-col md:flex-row items-center justify-between gap-4 ${
          theme === 'light'
            ? 'bg-slate-100/70 border-slate-200 text-slate-700'
            : 'bg-slate-950 border-slate-800/90 text-slate-300'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 flex-shrink-0">
            <Cloud className="w-5 h-5" />
          </div>
          <div>
            <h4 className={`text-xs font-bold ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'}`}>
              Sincronização em Nuvem Firestore & Google Auth
            </h4>
            <p className="text-[11px] text-slate-400">
              {user
                ? `Conectado como ${user.email}. Seus projetos e criações estão salvos e sincronizados com segurança.`
                : 'Faça login com sua conta do Google para manter seus vídeos, trilhas e vozes salvos na nuvem.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {user ? (
            <button
              onClick={onOpenCloudProjects}
              className="px-3.5 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-semibold shadow-sm transition-colors"
            >
              Meus Projetos na Nuvem
            </button>
          ) : (
            <button
              onClick={onSignIn}
              className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-900 text-xs font-semibold shadow-sm border border-slate-200 transition-colors"
            >
              Fazer Login com Google
            </button>
          )}
        </div>
      </section>
    </div>
  );
};
