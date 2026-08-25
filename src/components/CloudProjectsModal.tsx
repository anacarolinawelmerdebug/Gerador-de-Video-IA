import React, { useState } from 'react';
import {
  Folder,
  Trash2,
  ExternalLink,
  Plus,
  Cloud,
  CheckCircle,
  Clock,
  Layers,
  X,
  Search,
  Copy,
  AlertCircle,
  Music,
} from 'lucide-react';
import { VideoProject, UserProfile } from '../types';

interface CloudProjectsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile | null;
  currentProject: VideoProject;
  cloudProjects: VideoProject[];
  isLoading: boolean;
  onSelectProject: (project: VideoProject) => void;
  onSaveCurrentProject: () => Promise<void>;
  onDeleteProject: (projectId: string) => Promise<void>;
  onNewProject: () => void;
  onSignIn: () => void;
}

export const CloudProjectsModal: React.FC<CloudProjectsModalProps> = ({
  isOpen,
  onClose,
  user,
  currentProject,
  cloudProjects,
  isLoading,
  onSelectProject,
  onSaveCurrentProject,
  onDeleteProject,
  onNewProject,
  onSignIn,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  if (!isOpen) return null;

  const filteredProjects = (cloudProjects || []).filter(
    (p) =>
      p &&
      ((p.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.style || '').toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSaveCurrent = async () => {
    try {
      setIsSaving(true);
      await onSaveCurrentProject();
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (projectId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Tem certeza que deseja excluir este projeto da nuvem?')) {
      try {
        setDeletingId(projectId);
        await onDeleteProject(projectId);
      } finally {
        setDeletingId(null);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
      <div
        id="cloud-projects-modal"
        className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                Projetos na Nuvem (Firebase)
              </h2>
              <p className="text-xs text-slate-400">
                {user ? `Armazenamento seguro para ${user.email}` : 'Faça login para salvar seus vídeos'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Auth Required State */}
        {!user ? (
          <div className="p-8 flex flex-col items-center justify-center text-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
              <Cloud className="w-7 h-7" />
            </div>
            <div className="max-w-md">
              <h3 className="text-sm font-bold text-slate-100 mb-1">
                Conecte sua conta do Google
              </h3>
              <p className="text-xs text-slate-400">
                Seus projetos, trilhas sonoras e vozes geradas serão sincronizados em tempo real no banco de dados Firestore.
              </p>
            </div>
            <button
              onClick={onSignIn}
              className="flex items-center gap-2.5 px-5 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-900 text-xs font-semibold shadow-md transition-transform active:scale-95"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.35 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span>Entrar com Google</span>
            </button>
          </div>
        ) : (
          <div className="flex flex-col flex-1 overflow-hidden">
            {/* Action Bar */}
            <div className="p-4 border-b border-slate-800 bg-slate-900/50 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Pesquisar projetos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-sky-500"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  id="save-current-to-cloud-btn"
                  onClick={handleSaveCurrent}
                  disabled={isSaving}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
                >
                  <Cloud className="w-3.5 h-3.5" />
                  <span>{isSaving ? 'Salvando...' : 'Salvar Atual'}</span>
                </button>

                <button
                  id="new-cloud-project-btn"
                  onClick={() => {
                    onNewProject();
                    onClose();
                  }}
                  className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors"
                >
                  <Plus className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Novo</span>
                </button>
              </div>
            </div>

            {/* Projects List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
              {isLoading ? (
                <div className="py-12 text-center text-xs text-slate-400">
                  <div className="w-6 h-6 border-2 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  <span>Carregando projetos do Firestore...</span>
                </div>
              ) : filteredProjects.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400">
                  {searchTerm ? (
                    'Nenhum projeto encontrado para esta busca.'
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <Folder className="w-8 h-8 text-slate-600" />
                      <span>Nenhum projeto salvo na nuvem ainda.</span>
                      <button
                        onClick={handleSaveCurrent}
                        className="text-sky-400 hover:underline font-semibold mt-1"
                      >
                        Salvar o projeto atual agora
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                filteredProjects.map((p) => {
                  const isCurrent = currentProject && p.id === currentProject.id;
                  const totalSec = (p.scenes || []).reduce((acc, s) => acc + (s?.duration || 0), 0);

                  return (
                    <div
                      key={p.id}
                      onClick={() => {
                        onSelectProject(p);
                        onClose();
                      }}
                      className={`group flex items-center justify-between p-3.5 rounded-xl border transition-all cursor-pointer ${
                        isCurrent
                          ? 'bg-sky-500/10 border-sky-500/40 text-slate-100'
                          : 'bg-slate-950/60 hover:bg-slate-950 border-slate-800/80 hover:border-slate-700 text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            isCurrent
                              ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                              : 'bg-slate-900 text-slate-400 border border-slate-800'
                          }`}
                        >
                          <Layers className="w-5 h-5" />
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-bold text-slate-100 truncate">
                              {p.title}
                            </h4>
                            {isCurrent && (
                              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-400 border border-sky-500/30">
                                Ativo
                              </span>
                            )}
                            <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                              {p.aspectRatio}
                            </span>
                          </div>

                          <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1">
                            <span className="flex items-center gap-1">
                              <Layers className="w-3 h-3 text-slate-500" />
                              {p.scenes.length} {p.scenes.length === 1 ? 'cena' : 'cenas'} ({totalSec}s)
                            </span>
                            <span>•</span>
                            <span className="capitalize">{p.style}</span>
                            {p.customAudioTitle && (
                              <>
                                <span>•</span>
                                <span className="flex items-center gap-1 text-rose-400 truncate max-w-[120px]">
                                  <Music className="w-3 h-3" />
                                  {p.customAudioTitle}
                                </span>
                              </>
                            )}
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-500" />
                              {new Date(p.updatedAt).toLocaleDateString('pt-BR', {
                                day: '2-digit',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 opacity-80 group-hover:opacity-100">
                        <button
                          onClick={(e) => handleDelete(p.id, e)}
                          disabled={deletingId === p.id}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                          title="Excluir projeto"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
