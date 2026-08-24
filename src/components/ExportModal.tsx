import React, { useState } from 'react';
import {
  X,
  Download,
  Film,
  Sparkles,
  Music,
  CheckCircle2,
  Tv,
  Gauge,
  Volume2,
  Loader2,
  Share2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { SoundtrackMood, VideoProject } from '../types';
import { videoRenderer } from '../utils/videoRenderer';
import { startVeoGenerationAPI, checkVeoStatusAPI, downloadVeoVideoBlob } from '../services/geminiService';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: VideoProject;
  onUpdateProject: (updated: Partial<VideoProject>) => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  project,
  onUpdateProject,
}) => {
  const [resolution, setResolution] = useState<'720p' | '1080p'>(project.resolution || '1080p');
  const [fps, setFps] = useState<number>(project.fps || 30);
  const [soundtrack, setSoundtrack] = useState<SoundtrackMood>(project.soundtrack || 'cinematic_epic');
  const [enableVoice, setEnableVoice] = useState<boolean>(project.enableVoiceover ?? true);
  const [voiceGender, setVoiceGender] = useState<'pt-BR-female' | 'pt-BR-male' | 'en-US'>(
    project.voiceGender || 'pt-BR-female'
  );

  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportProgress, setExportProgress] = useState<number>(0);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Veo status state
  const [isVeoActive, setIsVeoActive] = useState<boolean>(false);
  const [veoStatusText, setVeoStatusText] = useState<string>('');

  if (!isOpen) return null;

  const totalDuration = project.scenes.reduce((acc, s) => acc + s.duration, 0);

  // Start High Quality Canvas MediaRecorder Render
  const handleStartExport = async () => {
    setIsExporting(true);
    setExportProgress(0);
    setDownloadUrl(null);
    setErrorMsg(null);
    setStatusMessage('Iniciando motor de renderização...');

    const updatedProject: VideoProject = {
      ...project,
      resolution,
      fps,
      soundtrack,
      enableVoiceover: enableVoice,
      voiceGender,
    };
    onUpdateProject(updatedProject);

    try {
      const videoBlob = await videoRenderer.exportProjectAsVideo(
        updatedProject,
        (percent, status) => {
          setExportProgress(percent);
          setStatusMessage(status);
        }
      );

      const url = URL.createObjectURL(videoBlob);
      setDownloadUrl(url);
      setStatusMessage('Vídeo renderizado com sucesso!');

      // Trigger celebratory confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {}
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Erro durante a exportação do vídeo');
    } finally {
      setIsExporting(false);
    }
  };

  // Direct download trigger
  const handleDownloadFile = () => {
    if (!downloadUrl) return;
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = `${project.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_cineai.webm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Google Veo Cloud Generation trigger
  const handleStartVeoCloud = async () => {
    setIsVeoActive(true);
    setErrorMsg(null);
    setVeoStatusText('Enviando prompt e parâmetros ao modelo Veo...');

    try {
      const combinedPrompt = `${project.title}: ${project.scenes.map((s) => s.visualPrompt).join('. ')}`;
      const opName = await startVeoGenerationAPI(
        combinedPrompt,
        project.aspectRatio === '9:16' ? '9:16' : '16:9',
        resolution === '1080p' ? '1080p' : '720p',
        project.scenes[0]?.imageUrl
      );

      setVeoStatusText('Vídeo Veo em processamento na nuvem (isso pode levar alguns minutos)...');

      // Poll status
      const interval = setInterval(async () => {
        try {
          const status = await checkVeoStatusAPI(opName);
          if (status.done) {
            clearInterval(interval);
            setVeoStatusText('Vídeo Veo concluído! Baixando arquivo...');
            const blob = await downloadVeoVideoBlob(opName);
            const url = URL.createObjectURL(blob);
            setDownloadUrl(url);
            setIsVeoActive(false);
            setVeoStatusText('Vídeo Veo pronto para download!');
            confetti({ particleCount: 100, spread: 80 });
          }
        } catch (e) {
          clearInterval(interval);
          setIsVeoActive(false);
          setErrorMsg('Aviso: Geração com Veo requer credenciais da API ou tempo adicional.');
        }
      }, 5000);
    } catch (err: any) {
      setIsVeoActive(false);
      setErrorMsg(err.message || 'Erro ao conectar ao modelo Veo');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">Exportar Vídeo Final</h3>
              <p className="text-xs text-slate-400">
                Renderize em alta qualidade com áudio sincronizado e efeitos.
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

        {/* Modal Body */}
        <div className="p-5 flex flex-col gap-4 max-h-[75vh] overflow-y-auto">
          {/* Settings Grid: Resolution, FPS */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                <Tv className="w-3.5 h-3.5 text-sky-400" />
                Resolução
              </label>
              <select
                value={resolution}
                onChange={(e) => setResolution(e.target.value as any)}
                disabled={isExporting}
                className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-lg p-2.5 outline-none focus:border-sky-500"
              >
                <option value="1080p">1080p Full HD (Recomendado)</option>
                <option value="720p">720p HD (Rápido)</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                <Gauge className="w-3.5 h-3.5 text-indigo-400" />
                Taxa de Quadros (FPS)
              </label>
              <select
                value={fps}
                onChange={(e) => setFps(Number(e.target.value))}
                disabled={isExporting}
                className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-lg p-2.5 outline-none focus:border-sky-500"
              >
                <option value={30}>30 FPS (Padrão Web)</option>
                <option value={60}>60 FPS (Ultra Fluido)</option>
                <option value={24}>24 FPS (Cinemático Clássico)</option>
              </select>
            </div>
          </div>

          {/* Soundtrack selector */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
              <Music className="w-3.5 h-3.5 text-amber-400" />
              Trilha Sonora Adaptativa
            </label>
            <select
              value={soundtrack}
              onChange={(e) => setSoundtrack(e.target.value as SoundtrackMood)}
              disabled={isExporting}
              className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-lg p-2.5 outline-none focus:border-sky-500 capitalize"
            >
              <option value="cinematic_epic">Cinematográfica Épica (Swells & Sub Bass)</option>
              <option value="cyber_ambient">Cyber Ambient Neo-Tokyo</option>
              <option value="peaceful_nature">Santuário da Natureza</option>
              <option value="retro_synth">Retro Synthwave 80s</option>
              <option value="lofi_chill">Lo-Fi Chill Beats</option>
              <option value="tension_drone">Suspense & Drone Pesado</option>
              <option value="none">Sem Trilha Sonora</option>
            </select>
          </div>

          {/* Voiceover configuration */}
          <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-sky-400" />
                <span className="text-xs font-semibold text-slate-200">
                  Narração por Voz IA
                </span>
              </div>
              <input
                type="checkbox"
                checked={enableVoice}
                onChange={(e) => setEnableVoice(e.target.checked)}
                className="w-4 h-4 accent-sky-500 cursor-pointer"
              />
            </div>

            {enableVoice && (
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setVoiceGender('pt-BR-female')}
                  className={`p-2 rounded-lg border transition-all text-left ${
                    voiceGender === 'pt-BR-female'
                      ? 'bg-sky-500/20 border-sky-500 text-sky-200'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  Voz Português Feminina
                </button>
                <button
                  type="button"
                  onClick={() => setVoiceGender('pt-BR-male')}
                  className={`p-2 rounded-lg border transition-all text-left ${
                    voiceGender === 'pt-BR-male'
                      ? 'bg-sky-500/20 border-sky-500 text-sky-200'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  Voz Português Masculina
                </button>
              </div>
            )}
          </div>

          {/* Progress Bar during export */}
          {isExporting && (
            <div className="bg-slate-950 p-4 rounded-xl border border-sky-500/30 flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-sky-400 font-semibold flex items-center gap-1.5">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  {statusMessage}
                </span>
                <span className="font-mono text-slate-200 font-bold">{exportProgress}%</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  style={{ width: `${exportProgress}%` }}
                  className="h-full bg-gradient-to-r from-sky-500 to-indigo-500 transition-all duration-150"
                />
              </div>
            </div>
          )}

          {veoStatusText && (
            <div className="p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400 animate-spin" />
              <span>{veoStatusText}</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
              {errorMsg}
            </div>
          )}

          {/* Ready to download card */}
          {downloadUrl && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <div>
                  <span className="text-xs font-bold text-emerald-200 block">
                    Vídeo Pronto para Download!
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Formato WebM de Alta Definição ({resolution}, {fps} FPS)
                  </span>
                </div>
              </div>

              <button
                id="download-video-btn"
                onClick={handleDownloadFile}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 active:scale-95 transition-all shadow-md shadow-emerald-600/20"
              >
                <Download className="w-4 h-4" />
                <span>Baixar Arquivo</span>
              </button>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col gap-2 pt-2">
            <button
              id="start-export-btn"
              onClick={handleStartExport}
              disabled={isExporting}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 shadow-lg shadow-sky-500/25 active:scale-95 transition-all disabled:opacity-50"
            >
              {isExporting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Renderizando Vídeo...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Renderizar e Exportar Vídeo do Projeto ({totalDuration}s)</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
