import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  SkipBack,
  SkipForward,
  Sparkles,
  Gauge,
  Music,
  Camera,
} from 'lucide-react';
import { Scene, VideoProject } from '../types';
import { videoRenderer } from '../utils/videoRenderer';
import { soundSynth } from '../utils/audioSynth';

interface VideoPlayerProps {
  project: VideoProject;
  activeSceneIndex: number;
  onSelectScene: (index: number) => void;
  onGenerateSceneImage?: (sceneIndex: number) => void;
  isGeneratingImage?: boolean;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  project,
  activeSceneIndex,
  onSelectScene,
  onGenerateSceneImage,
  isGeneratingImage = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const animationFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const lastSpokenSceneRef = useRef<number>(-1);

  // Total project duration
  const totalDuration = Math.max(
    1,
    project.scenes.reduce((sum, s) => sum + s.duration, 0)
  );

  // Preload project images whenever scenes change
  useEffect(() => {
    videoRenderer.preloadProjectImages(project);
  }, [project]);

  // Find active scene & local progress based on currentTime
  const getSceneAtTime = useCallback(
    (time: number) => {
      let accum = 0;
      for (let i = 0; i < project.scenes.length; i++) {
        const scene = project.scenes[i];
        if (time >= accum && time < accum + scene.duration) {
          return {
            index: i,
            scene,
            localTime: time - accum,
            sceneProgress: (time - accum) / scene.duration,
            accumStart: accum,
          };
        }
        accum += scene.duration;
      }
      const lastIndex = project.scenes.length - 1;
      const lastScene = project.scenes[lastIndex];
      return {
        index: lastIndex,
        scene: lastScene,
        localTime: lastScene ? lastScene.duration : 0,
        sceneProgress: 1,
        accumStart: accum - (lastScene ? lastScene.duration : 0),
      };
    },
    [project.scenes]
  );

  // Render loop
  const renderCurrentState = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = videoRenderer.getResolutionDimensions(
      project.aspectRatio,
      '720p'
    );
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }

    const { index, scene, sceneProgress, localTime } = getSceneAtTime(currentTime);

    if (!scene) return;

    // Check transition
    const transitionDuration = 0.5;
    const timeRemaining = scene.duration - localTime;
    let nextScene: Scene | undefined;
    let transitionProgress = 0;

    if (timeRemaining <= transitionDuration && index < project.scenes.length - 1) {
      nextScene = project.scenes[index + 1];
      transitionProgress = 1 - timeRemaining / transitionDuration;
    }

    videoRenderer.renderFrame(
      ctx,
      width,
      height,
      scene,
      sceneProgress,
      currentTime / totalDuration,
      nextScene,
      transitionProgress
    );
  }, [currentTime, getSceneAtTime, project.aspectRatio, project.scenes, totalDuration]);

  // Main animation tick
  useEffect(() => {
    if (!isPlaying) {
      renderCurrentState();
      return;
    }

    // Start background soundtrack if not muted
    if (!isMuted && project.soundtrack !== 'none') {
      soundSynth.playSoundtrack(project.soundtrack);
    }

    lastTimeRef.current = performance.now();

    const loop = (now: number) => {
      const delta = (now - lastTimeRef.current) / 1000;
      lastTimeRef.current = now;

      setCurrentTime((prev) => {
        let nextTime = prev + delta * playbackSpeed;
        if (nextTime >= totalDuration) {
          // Loop back to start
          nextTime = 0;
          lastSpokenSceneRef.current = -1;
        }

        // Check if scene changed for narration
        const currentSceneInfo = getSceneAtTime(nextTime);
        if (
          project.enableVoiceover &&
          !isMuted &&
          currentSceneInfo.index !== lastSpokenSceneRef.current
        ) {
          lastSpokenSceneRef.current = currentSceneInfo.index;
          if (currentSceneInfo.scene?.narration) {
            soundSynth.speakNarration(
              currentSceneInfo.scene.narration,
              project.voiceGender
            );
          }
        }

        return nextTime;
      });

      animationFrameRef.current = requestAnimationFrame(loop);
    };

    animationFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      soundSynth.stopSoundtrack();
      soundSynth.stopNarration();
    };
  }, [isPlaying, playbackSpeed, totalDuration, isMuted, project.soundtrack, project.enableVoiceover, project.voiceGender, getSceneAtTime, renderCurrentState]);

  // Sync canvas render when currentTime or scenes change while paused
  useEffect(() => {
    renderCurrentState();
  }, [currentTime, renderCurrentState]);

  // Play / Pause Toggle
  const togglePlay = () => {
    if (!isPlaying && currentTime >= totalDuration - 0.1) {
      setCurrentTime(0);
      lastSpokenSceneRef.current = -1;
    }
    setIsPlaying(!isPlaying);
  };

  // Jump to specific scene
  const handleJumpToScene = (sceneIndex: number) => {
    let accum = 0;
    for (let i = 0; i < sceneIndex; i++) {
      accum += project.scenes[i].duration;
    }
    setCurrentTime(accum);
    onSelectScene(sceneIndex);
    lastSpokenSceneRef.current = sceneIndex - 1;
  };

  // Scrubber drag / click
  const handleTimelineScrub = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    const newProgress = clickX / rect.width;
    const newTime = newProgress * totalDuration;
    setCurrentTime(newTime);

    const { index } = getSceneAtTime(newTime);
    onSelectScene(index);
  };

  // Toggle Fullscreen
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const currentSceneInfo = getSceneAtTime(currentTime);

  // Aspect ratio container styles
  const getAspectRatioClasses = () => {
    switch (project.aspectRatio) {
      case '16:9':
        return 'aspect-video max-h-[500px]';
      case '9:16':
        return 'aspect-[9/16] max-h-[540px] max-w-[320px]';
      case '1:1':
        return 'aspect-square max-h-[460px] max-w-[460px]';
      case '4:3':
        return 'aspect-[4/3] max-h-[480px] max-w-[640px]';
      default:
        return 'aspect-video max-h-[500px]';
    }
  };

  return (
    <div
      ref={containerRef}
      className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-4 lg:p-5 flex flex-col gap-4 shadow-xl backdrop-blur-sm relative overflow-hidden"
    >
      {/* Top Player Bar: Scene Info & Visual Tag */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-200">
            Cena {currentSceneInfo.index + 1} de {project.scenes.length}:
          </span>
          <span className="text-sky-400 font-medium truncate max-w-[220px]">
            {currentSceneInfo.scene?.title || 'Take'}
          </span>
          <span className="px-2 py-0.5 rounded-full text-[10px] uppercase font-bold bg-slate-800 text-slate-400 border border-slate-700">
            {currentSceneInfo.scene?.cameraMotion.replace('_', ' ')}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {onGenerateSceneImage && (
            <button
              id="generate-current-frame-btn"
              onClick={() => onGenerateSceneImage(currentSceneInfo.index)}
              disabled={isGeneratingImage}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-all disabled:opacity-50"
              title="Gerar visual de cena com IA"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isGeneratingImage ? 'animate-spin' : ''}`} />
              <span>{currentSceneInfo.scene?.imageUrl ? 'Regerar Visual' : 'Gerar Quadro IA'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Video Canvas Stage */}
      <div className="flex items-center justify-center bg-slate-950/90 rounded-xl overflow-hidden border border-slate-800/60 p-2 min-h-[300px] relative group">
        <div
          className={`w-full flex items-center justify-center relative mx-auto transition-all ${getAspectRatioClasses()}`}
        >
          <canvas
            ref={canvasRef}
            className="w-full h-full object-contain rounded-lg shadow-2xl bg-black"
          />

          {/* Big Play overlay when paused */}
          {!isPlaying && (
            <button
              id="canvas-play-overlay-btn"
              onClick={togglePlay}
              className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-sky-500/90 hover:bg-sky-400 text-white flex items-center justify-center shadow-2xl shadow-sky-500/40 transform hover:scale-110 active:scale-95 transition-all group-hover:opacity-100 opacity-90 backdrop-blur-sm"
              title="Reproduzir Vídeo"
            >
              <Play className="w-8 h-8 fill-current translate-x-0.5" />
            </button>
          )}
        </div>
      </div>

      {/* Interactive Timeline & Scrubber with Scene Markers */}
      <div className="flex flex-col gap-1.5">
        <div
          id="timeline-scrubber"
          onClick={handleTimelineScrub}
          className="h-7 w-full bg-slate-950/80 border border-slate-800 rounded-lg relative cursor-pointer overflow-hidden flex items-center p-1 group select-none"
        >
          {/* Scene Blocks / Markers */}
          {project.scenes.map((scene, idx) => {
            let start = 0;
            for (let i = 0; i < idx; i++) {
              start += project.scenes[i].duration;
            }
            const widthPct = (scene.duration / totalDuration) * 100;
            const leftPct = (start / totalDuration) * 100;
            const isActive = currentSceneInfo.index === idx;

            return (
              <div
                key={scene.id}
                style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
                className={`absolute top-0 bottom-0 border-r border-slate-800/80 transition-colors flex items-center justify-between px-1.5 ${
                  isActive ? 'bg-sky-500/15' : 'hover:bg-slate-800/30'
                }`}
              >
                <span className="text-[10px] font-mono text-slate-400 truncate opacity-80 pointer-events-none">
                  C{idx + 1}: {scene.duration}s
                </span>
              </div>
            );
          })}

          {/* Progress fill */}
          <div
            style={{ width: `${(currentTime / totalDuration) * 100}%` }}
            className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-sky-500/40 to-sky-400/60 pointer-events-none transition-all duration-75"
          />

          {/* Playhead Needle */}
          <div
            style={{ left: `${(currentTime / totalDuration) * 100}%` }}
            className="absolute top-0 bottom-0 w-1 bg-sky-400 shadow-lg shadow-sky-400/80 pointer-events-none -translate-x-1/2 z-10"
          >
            <div className="w-2.5 h-2.5 bg-white rounded-full -translate-x-[3px] -translate-y-1 shadow-md" />
          </div>
        </div>

        {/* Timecode labels */}
        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 px-1">
          <span>{currentTime.toFixed(1)}s</span>
          <span>{totalDuration.toFixed(1)}s</span>
        </div>
      </div>

      {/* Playback Controls Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-slate-800/60">
        {/* Left: Play/Pause/Replay/Step */}
        <div className="flex items-center gap-1.5">
          <button
            id="player-play-btn"
            onClick={togglePlay}
            className="p-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-white shadow-md shadow-sky-500/20 active:scale-95 transition-all"
            title={isPlaying ? 'Pausar' : 'Reproduzir'}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
          </button>

          <button
            id="player-restart-btn"
            onClick={() => {
              setCurrentTime(0);
              lastSpokenSceneRef.current = -1;
            }}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            title="Voltar ao Início"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            id="player-prev-scene-btn"
            onClick={() => handleJumpToScene(Math.max(0, currentSceneInfo.index - 1))}
            disabled={currentSceneInfo.index === 0}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 disabled:opacity-30 transition-colors"
            title="Cena Anterior"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          <button
            id="player-next-scene-btn"
            onClick={() =>
              handleJumpToScene(Math.min(project.scenes.length - 1, currentSceneInfo.index + 1))
            }
            disabled={currentSceneInfo.index >= project.scenes.length - 1}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 disabled:opacity-30 transition-colors"
            title="Próxima Cena"
          >
            <SkipForward className="w-4 h-4" />
          </button>
        </div>

        {/* Center: Audio soundtrack toggle & Narration indicator */}
        <div className="flex items-center gap-2 bg-slate-950/60 border border-slate-800/80 px-2.5 py-1 rounded-lg">
          <button
            id="player-mute-btn"
            onClick={() => setIsMuted(!isMuted)}
            className="text-slate-400 hover:text-slate-200 transition-colors"
            title={isMuted ? 'Desmutar Áudio' : 'Mutar Áudio'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          <span className="text-[11px] text-slate-300 font-medium flex items-center gap-1.5">
            <Music className="w-3 h-3 text-sky-400" />
            <span className="capitalize">{project.soundtrack.replace('_', ' ')}</span>
          </span>
        </div>

        {/* Right: Speed & Fullscreen */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-1 bg-slate-950/60 border border-slate-800/80 rounded-lg p-0.5 text-xs">
            {[0.5, 1, 1.5, 2].map((speed) => (
              <button
                key={speed}
                onClick={() => setPlaybackSpeed(speed)}
                className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium transition-all ${
                  playbackSpeed === speed
                    ? 'bg-sky-500 text-white font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {speed}x
              </button>
            ))}
          </div>

          <button
            id="player-fullscreen-btn"
            onClick={toggleFullscreen}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            title="Tela Cheia"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};
