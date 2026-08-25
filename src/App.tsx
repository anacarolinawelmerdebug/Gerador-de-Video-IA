import React, { useState, useEffect } from 'react';
import {
  Wand2,
  Layers,
  Image as ImageIcon,
  Sparkles,
  Film,
  FolderOpen,
  Plus,
  Play,
  RotateCcw,
  Sliders,
  CheckCircle2,
  Music,
  Mic,
  Cloud,
} from 'lucide-react';
import { Header } from './components/Header';
import { VideoPlayer } from './components/VideoPlayer';
import { PromptDirector } from './components/PromptDirector';
import { ScriptStudio } from './components/ScriptStudio';
import { ImageToVideo } from './components/ImageToVideo';
import { MusicGenerator } from './components/MusicGenerator';
import { VoiceGenerator } from './components/VoiceGenerator';
import { PresetsModal } from './components/PresetsModal';
import { ScriptGeneratorModal } from './components/ScriptGeneratorModal';
import { ExportModal } from './components/ExportModal';
import { CloudProjectsModal } from './components/CloudProjectsModal';
import { HomeMenu } from './components/HomeMenu';
import { MyGallery } from './components/MyGallery';
import { InspirationGallery } from './components/InspirationGallery';
import { NewProjectModal } from './components/NewProjectModal';
import {
  CameraMotion,
  PresetTemplate,
  Scene,
  VideoProject,
  VideoStyle,
  UserProfile,
  NavigationView,
  InspirationItem,
} from './types';
import { PRESET_TEMPLATES } from './data/presets';
import { generateKeyframeAPI } from './services/geminiService';
import {
  signInWithGoogle,
  logoutUser,
  subscribeToAuthChanges,
  saveProjectToFirestore,
  loadUserProjectsFromFirestore,
  deleteProjectFromFirestore,
} from './services/firebase';

const STORAGE_KEY = 'cineai_current_project';
const THEME_KEY = 'cineai_current_theme';

const DEFAULT_PROJECT: VideoProject = {
  id: 'proj_default',
  title: 'Metrópole Cyberpunk 2099',
  description: 'Viagem cinematográfica pela megalópole futurista sob chuva de neon.',
  aspectRatio: '16:9',
  style: 'cyberpunk',
  fps: 30,
  resolution: '1080p',
  soundtrack: 'cyber_ambient',
  enableVoiceover: true,
  voiceGender: 'pt-BR-female',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  scenes: [
    {
      id: 'sc_1',
      title: 'Avenida Neon Noturna',
      duration: 4,
      visualPrompt: 'Visão aérea cinematográfica de uma megalópole cyberpunk com arranha-céus colossais, chuva fina e reflexos neon no asfalto molhado.',
      cameraMotion: 'drone_flythrough',
      atmosphereEffect: 'rain',
      transition: 'crossfade',
      subtitle: 'BEM-VINDO AO ANO 2099',
      narration: 'No coração da nova era, a luz neon guia os passos da humanidade.',
      moodColor: '#0b112c',
    },
    {
      id: 'sc_2',
      title: 'Nave em Dobra',
      duration: 4,
      visualPrompt: 'Close-up dinâmico de uma nave de alta tecnologia decolando entre prédios espelhados, propulsores de plasma brilhante e faíscas elétricas.',
      cameraMotion: 'pan_right',
      atmosphereEffect: 'cyber_grid',
      transition: 'zoom_blur',
      subtitle: 'PROPULSORES EM POTÊNCIA MÁXIMA',
      narration: 'Propulsão quântica ativada para o horizonte.',
      moodColor: '#2b0938',
    },
    {
      id: 'sc_3',
      title: 'O Portal Cósmico',
      duration: 4,
      visualPrompt: 'Horizonte cósmico com um portal de dobra espacial abrindo no topo de uma torre colossal, partículas de luz dourada e distorção quântica.',
      cameraMotion: 'zoom_in',
      atmosphereEffect: 'particles',
      transition: 'fade_black',
      subtitle: 'RUMO AO DESCONHECIDO',
      narration: 'O futuro é uma jornada contínua.',
      moodColor: '#042940',
    },
  ],
};

export default function App() {
  const [project, setProject] = useState<VideoProject>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {}
    return DEFAULT_PROJECT;
  });

  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [currentView, setCurrentView] = useState<NavigationView>('home');

  const [user, setUser] = useState<UserProfile | null>(null);
  const [cloudProjects, setCloudProjects] = useState<VideoProject[]>([]);
  const [isCloudModalOpen, setIsCloudModalOpen] = useState<boolean>(false);
  const [isNewProjectOpen, setIsNewProjectOpen] = useState<boolean>(false);
  const [isLoadingCloud, setIsLoadingCloud] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  const [activeTab, setActiveTab] = useState<'prompt' | 'script' | 'music' | 'voice' | 'image_to_video'>('prompt');
  const [activeSceneIndex, setActiveSceneIndex] = useState<number>(0);
  const [isPresetsOpen, setIsPresetsOpen] = useState<boolean>(false);
  const [isScriptGenOpen, setIsScriptGenOpen] = useState<boolean>(false);
  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Show Toast
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges(async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        fetchCloudProjects(currentUser.uid);
      } else {
        setCloudProjects([]);
      }
    });

    return () => unsubscribe();
  }, []);

  // Fetch Cloud Projects
  const fetchCloudProjects = async (uid: string) => {
    setIsLoadingCloud(true);
    try {
      const list = await loadUserProjectsFromFirestore(uid);
      setCloudProjects(list);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingCloud(false);
    }
  };

  // Auto-save project changes to LocalStorage and Firebase (if logged in)
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(project));
    } catch {}

    // Auto-save to cloud if user is logged in
    if (user?.uid) {
      const timer = setTimeout(async () => {
        try {
          setIsSyncing(true);
          await saveProjectToFirestore(user.uid, project);
          // Refresh list quietly
          const list = await loadUserProjectsFromFirestore(user.uid);
          setCloudProjects(list);
        } catch (e) {
          console.error('Erro na auto-sincronização com Firebase:', e);
        } finally {
          setIsSyncing(false);
        }
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [project, user?.uid]);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    showToast(`Tema alterado para ${nextTheme === 'light' ? 'Modo Claro' : 'Sophisticated Dark'}`);
  };

  // Google Sign-in Handler
  const handleSignIn = async () => {
    try {
      showToast('Conectando com o Google...');
      const profile = await signInWithGoogle();
      if (profile) {
        showToast(`Bem-vindo, ${profile.displayName || profile.email}!`);
        // Save current project immediately to user's Firestore
        await saveProjectToFirestore(profile.uid, project);
        fetchCloudProjects(profile.uid);
      }
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Erro ao autenticar com o Google');
    }
  };

  // Google Sign-out Handler
  const handleSignOut = async () => {
    try {
      await logoutUser();
      setUser(null);
      setCloudProjects([]);
      showToast('Sessão encerrada com sucesso');
    } catch (err: any) {
      console.error(err);
      showToast('Erro ao encerrar sessão');
    }
  };

  // Manual Save to Cloud
  const handleSaveCurrentProjectToCloud = async () => {
    if (!user) {
      handleSignIn();
      return;
    }
    try {
      setIsSyncing(true);
      await saveProjectToFirestore(user.uid, project);
      await fetchCloudProjects(user.uid);
      showToast('Projeto sincronizado no Firestore com sucesso!');
    } catch (err: any) {
      console.error(err);
      showToast('Erro ao salvar projeto na nuvem');
    } finally {
      setIsSyncing(false);
    }
  };

  // Load project from cloud / gallery
  const handleSelectProject = (selectedProject: VideoProject) => {
    setProject(selectedProject);
    setActiveSceneIndex(0);
    showToast(`Projeto "${selectedProject.title}" carregado!`);
  };

  const handleSelectCloudProject = (selectedProject: VideoProject) => {
    handleSelectProject(selectedProject);
    setIsCloudModalOpen(false);
  };

  // Delete project from cloud
  const handleDeleteCloudProject = async (projectId: string) => {
    if (!user) return;
    try {
      await deleteProjectFromFirestore(user.uid, projectId);
      setCloudProjects((prev) => prev.filter((p) => p.id !== projectId));
      showToast('Projeto removido do Firestore');
    } catch (err) {
      console.error(err);
      showToast('Erro ao remover projeto da nuvem');
    }
  };

  // Duplicate a project
  const handleDuplicateProject = (proj: VideoProject) => {
    const duplicated: VideoProject = {
      ...proj,
      id: 'proj_' + Date.now(),
      title: `${proj.title} (Cópia)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      scenes: proj.scenes.map((s, idx) => ({
        ...s,
        id: 'sc_' + Date.now() + '_' + idx,
      })),
    };
    setProject(duplicated);
    setActiveSceneIndex(0);
    setCurrentView('studio');
    showToast(`Cópia criada: "${duplicated.title}"!`);

    if (user?.uid) {
      saveProjectToFirestore(user.uid, duplicated).then(() => {
        fetchCloudProjects(user.uid);
      });
    }
  };

  // Create project from NewProjectModal
  const handleCreateProjectFromModal = (
    newProj: VideoProject,
    startMode: 'scratch' | 'ai_script' | 'from_template' | 'realistic'
  ) => {
    setProject(newProj);
    setActiveSceneIndex(0);
    setIsNewProjectOpen(false);

    if (startMode === 'ai_script') {
      setCurrentView('studio');
      setIsScriptGenOpen(true);
    } else if (startMode === 'from_template') {
      setIsPresetsOpen(true);
      setCurrentView('studio');
    } else {
      setCurrentView('studio');
      setActiveTab('prompt');
    }

    showToast(`Novo projeto "${newProj.title}" iniciado!`);

    if (user?.uid) {
      saveProjectToFirestore(user.uid, newProj).then(() => {
        fetchCloudProjects(user.uid);
      });
    }
  };

  // Remix an Inspiration Item into active project
  const handleRemixInspiration = (item: InspirationItem) => {
    const remixedProject: VideoProject = {
      id: 'proj_' + Date.now(),
      title: `Remix: ${item.title}`,
      description: item.description,
      aspectRatio: item.aspectRatio,
      style: item.style,
      fps: 30,
      resolution: '1080p',
      soundtrack: item.soundtrack || 'cinematic_epic',
      enableVoiceover: true,
      voiceGender: 'pt-BR-female',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      scenes: item.scenes.map((s, idx) => ({
        id: 'sc_' + Date.now() + '_' + idx,
        title: s.title,
        duration: s.duration,
        visualPrompt: s.visualPrompt,
        cameraMotion: s.cameraMotion,
        atmosphereEffect: s.atmosphereEffect || 'particles',
        transition: s.transition || 'crossfade',
        narration: s.narration || '',
        subtitle: s.subtitle || '',
        imageUrl: s.imageUrl,
        moodColor: '#0b112c',
      })),
    };

    setProject(remixedProject);
    setActiveSceneIndex(0);
    setCurrentView('studio');
    setActiveTab('prompt');
    showToast(`Inspiração "${item.title}" carregada no Estúdio!`);

    if (user?.uid) {
      saveProjectToFirestore(user.uid, remixedProject).then(() => {
        fetchCloudProjects(user.uid);
      });
    }
  };

  // New Blank Project
  const handleNewProject = () => {
    setIsNewProjectOpen(true);
  };

  // Update Project state
  const handleUpdateProject = (updated: Partial<VideoProject>) => {
    setProject((prev) => ({
      ...prev,
      ...updated,
      updatedAt: new Date().toISOString(),
    }));
  };

  // Update single scene in project
  const handleUpdateScene = (sceneId: string, updated: Partial<Scene>) => {
    setProject((prev) => ({
      ...prev,
      scenes: prev.scenes.map((s) => (s.id === sceneId ? { ...s, ...updated } : s)),
      updatedAt: new Date().toISOString(),
    }));
  };

  // Apply single prompt to active or all scenes
  const handleApplyPromptToScenes = (
    prompt: string,
    style: VideoStyle,
    motion: CameraMotion
  ) => {
    setProject((prev) => {
      const newScenes = prev.scenes.map((s, idx) => {
        if (idx === activeSceneIndex) {
          return {
            ...s,
            visualPrompt: prompt,
            cameraMotion: motion,
          };
        }
        return s;
      });
      return {
        ...prev,
        style,
        scenes: newScenes,
      };
    });
    showToast('Prompt aplicado com sucesso à cena!');
  };

  // Generate Image / Keyframe for scene via Gemini Imagen
  const handleGenerateSceneImage = async (sceneIndex: number) => {
    const targetScene = project.scenes[sceneIndex];
    if (!targetScene) return;

    setIsGeneratingImage(true);
    showToast(`Gerando quadro visual com IA para "${targetScene.title}"...`);
    try {
      const url = await generateKeyframeAPI(
        targetScene.visualPrompt || project.title,
        project.aspectRatio
      );
      setProject((prev) => {
        const updated = prev.scenes.map((s, idx) =>
          idx === sceneIndex ? { ...s, imageUrl: url } : s
        );
        return { ...prev, scenes: updated };
      });
      showToast('Quadro gerado com sucesso!');
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Erro ao gerar quadro com IA');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  // Select Preset Template
  const handleSelectPreset = (preset: PresetTemplate) => {
    const newScenes: Scene[] = preset.scenes.map((s, idx) => ({
      ...s,
      id: 'sc_' + Date.now() + '_' + idx,
    }));

    setProject({
      id: 'proj_' + Date.now(),
      title: preset.name,
      description: preset.description,
      aspectRatio: preset.aspectRatio,
      style: preset.style,
      fps: 30,
      resolution: '1080p',
      soundtrack: preset.soundtrack,
      enableVoiceover: true,
      voiceGender: 'pt-BR-female',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      scenes: newScenes,
    });
    setActiveSceneIndex(0);
    showToast(`Modelo "${preset.name}" carregado!`);
  };

  // Apply AI Generated Script
  const handleApplyScript = (title: string, description: string, scenes: Scene[]) => {
    setProject((prev) => ({
      ...prev,
      title,
      description,
      scenes,
    }));
    setActiveSceneIndex(0);
    setActiveTab('script');
    showToast('Roteiro completo gerado pelo Gemini com sucesso!');
  };

  // Add generated scene from Image-to-Video
  const handleAddGeneratedScene = (newScene: Scene) => {
    setProject((prev) => ({
      ...prev,
      scenes: [...prev.scenes, newScene],
    }));
    setActiveSceneIndex(project.scenes.length);
    showToast('Take de foto animada adicionado ao projeto!');
  };

  // Navigate to Studio with specific active tab
  const handleNavigateToStudio = (tab?: 'prompt' | 'script' | 'music' | 'voice' | 'image_to_video') => {
    if (tab) {
      setActiveTab(tab);
    }
    setCurrentView('studio');
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors ${
      theme === 'light'
        ? 'bg-slate-50 text-slate-900 selection:bg-indigo-500 selection:text-white'
        : 'bg-slate-950 text-slate-100 selection:bg-sky-500 selection:text-white'
    }`}>
      {/* Studio Top Navigation */}
      <Header
        project={project}
        onUpdateProject={handleUpdateProject}
        onOpenPresets={() => setIsPresetsOpen(true)}
        onOpenExport={() => setIsExportOpen(true)}
        onOpenScriptGenerator={() => setIsScriptGenOpen(true)}
        onOpenCloudProjects={() => setIsCloudModalOpen(true)}
        onOpenNewProject={() => setIsNewProjectOpen(true)}
        isExporting={false}
        theme={theme}
        onToggleTheme={toggleTheme}
        user={user}
        onSignIn={handleSignIn}
        onSignOut={handleSignOut}
        isSyncing={isSyncing}
        currentView={currentView}
        onSelectView={setCurrentView}
      />

      {/* Main View: Início / Minha Galeria / Galeria de Inspiração / Estúdio */}
      {currentView === 'home' && (
        <main className="flex-1">
          <HomeMenu
            currentProject={project}
            cloudProjects={cloudProjects}
            user={user}
            theme={theme}
            onNavigateToStudio={handleNavigateToStudio}
            onNavigateToGallery={() => setCurrentView('my_gallery')}
            onNavigateToInspiration={() => setCurrentView('inspiration')}
            onOpenScriptGenerator={() => setIsScriptGenOpen(true)}
            onOpenPresets={() => setIsPresetsOpen(true)}
            onOpenCloudProjects={() => setIsCloudModalOpen(true)}
            onOpenExport={() => setIsExportOpen(true)}
            onSelectPreset={handleSelectPreset}
            onSelectStyle={(style) => handleUpdateProject({ style })}
            onNewProject={handleNewProject}
            onSignIn={handleSignIn}
          />
        </main>
      )}

      {currentView === 'my_gallery' && (
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-6 animate-in fade-in duration-200">
          <MyGallery
            currentProject={project}
            cloudProjects={cloudProjects}
            onSelectProject={(proj) => {
              handleSelectProject(proj);
            }}
            onNewProject={() => setIsNewProjectOpen(true)}
            onDuplicateProject={handleDuplicateProject}
            onDeleteProject={handleDeleteCloudProject}
            onOpenExport={() => setIsExportOpen(true)}
            onNavigateToStudio={(tab) => handleNavigateToStudio(tab)}
            onNavigateToInspiration={() => setCurrentView('inspiration')}
            user={user}
            onSignIn={handleSignIn}
            theme={theme}
          />
        </main>
      )}

      {currentView === 'inspiration' && (
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-6 animate-in fade-in duration-200">
          <InspirationGallery
            onRemixInspiration={handleRemixInspiration}
            onNavigateToStudio={(tab) => handleNavigateToStudio(tab)}
            theme={theme}
          />
        </main>
      )}

      {currentView === 'studio' && (
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-in fade-in duration-200">
        {/* Left Column: Live Canvas Video Player & Timeline (5 cols on lg) */}
        <div className="lg:col-span-5 flex flex-col gap-4 sticky lg:top-20">
          <VideoPlayer
            project={project}
            activeSceneIndex={activeSceneIndex}
            onSelectScene={setActiveSceneIndex}
            onGenerateSceneImage={handleGenerateSceneImage}
            isGeneratingImage={isGeneratingImage}
            onUpdateProject={handleUpdateProject}
            theme={theme}
          />
        </div>

        {/* Right Column: Creative Tools & Studio Editors (7 cols on lg) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          {/* Workspace Mode Tabs */}
          <div className={`flex items-center gap-1 p-1 rounded-xl shadow-sm border overflow-x-auto ${
            theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-900/90 border-slate-800'
          }`}>
            <button
              id="tab-prompt-btn"
              onClick={() => setActiveTab('prompt')}
              className={`flex-1 min-w-[110px] flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'prompt'
                  ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20'
                  : theme === 'light'
                  ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Wand2 className="w-3.5 h-3.5" />
              <span>Prompt & Estilo</span>
            </button>

            <button
              id="tab-script-btn"
              onClick={() => setActiveTab('script')}
              className={`flex-1 min-w-[100px] flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'script'
                  ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20'
                  : theme === 'light'
                  ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Cenas ({project.scenes.length})</span>
            </button>

            {/* Music Generator Tab */}
            <button
              id="tab-music-btn"
              onClick={() => setActiveTab('music')}
              className={`flex-1 min-w-[110px] flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'music'
                  ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                  : theme === 'light'
                  ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Music className="w-3.5 h-3.5" />
              <span>Música IA</span>
              {project.customAudioUrl && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" title="Trilha personalizada ativa" />
              )}
            </button>

            {/* Voice & TTS Generator Tab */}
            <button
              id="tab-voice-btn"
              onClick={() => setActiveTab('voice')}
              className={`flex-1 min-w-[110px] flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'voice'
                  ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/20'
                  : theme === 'light'
                  ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Mic className="w-3.5 h-3.5" />
              <span>Voz & Locução</span>
            </button>

            <button
              id="tab-image-video-btn"
              onClick={() => setActiveTab('image_to_video')}
              className={`flex-1 min-w-[110px] flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'image_to_video'
                  ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20'
                  : theme === 'light'
                  ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Foto p/ Vídeo</span>
            </button>
          </div>

          {/* Active Tab Panel */}
          {activeTab === 'prompt' && (
            <PromptDirector
              project={project}
              onUpdateProject={handleUpdateProject}
              onApplyPromptToScenes={handleApplyPromptToScenes}
            />
          )}

          {activeTab === 'script' && (
            <ScriptStudio
              project={project}
              activeSceneIndex={activeSceneIndex}
              onSelectScene={setActiveSceneIndex}
              onUpdateScenes={(scenes) => handleUpdateProject({ scenes })}
              onGenerateSceneImage={handleGenerateSceneImage}
              isGeneratingImage={isGeneratingImage}
            />
          )}

          {activeTab === 'music' && (
            <MusicGenerator
              project={project}
              onUpdateProject={handleUpdateProject}
              onShowToast={showToast}
            />
          )}

          {activeTab === 'voice' && (
            <VoiceGenerator
              project={project}
              onUpdateProject={handleUpdateProject}
              onUpdateScene={handleUpdateScene}
              onShowToast={showToast}
            />
          )}

          {activeTab === 'image_to_video' && (
            <ImageToVideo
              onAddGeneratedScene={handleAddGeneratedScene}
              aspectRatio={project.aspectRatio}
            />
          )}
        </div>
      </main>
      )}

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900/95 border border-sky-500/40 text-slate-100 text-xs px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 animate-in slide-in-from-bottom-2 duration-150 backdrop-blur-md">
          <CheckCircle2 className="w-4 h-4 text-sky-400 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Cloud Projects Modal */}
      <CloudProjectsModal
        isOpen={isCloudModalOpen}
        onClose={() => setIsCloudModalOpen(false)}
        user={user}
        currentProject={project}
        cloudProjects={cloudProjects}
        isLoading={isLoadingCloud}
        onSelectProject={handleSelectCloudProject}
        onSaveCurrentProject={handleSaveCurrentProjectToCloud}
        onDeleteProject={handleDeleteCloudProject}
        onNewProject={handleNewProject}
        onSignIn={handleSignIn}
      />

      {/* New Project Creator Modal */}
      <NewProjectModal
        isOpen={isNewProjectOpen}
        onClose={() => setIsNewProjectOpen(false)}
        onCreateProject={handleCreateProjectFromModal}
        currentStyle={project.style}
        currentAspectRatio={project.aspectRatio}
        theme={theme}
      />

      {/* Modals */}
      <PresetsModal
        isOpen={isPresetsOpen}
        onClose={() => setIsPresetsOpen(false)}
        onSelectPreset={handleSelectPreset}
      />

      <ScriptGeneratorModal
        isOpen={isScriptGenOpen}
        onClose={() => setIsScriptGenOpen(false)}
        onApplyScript={handleApplyScript}
        currentStyle={project.style}
      />

      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        project={project}
        onUpdateProject={handleUpdateProject}
      />
    </div>
  );
}

