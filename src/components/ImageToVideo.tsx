import React, { useState, useRef } from 'react';
import {
  Upload,
  Sparkles,
  Camera,
  Layers,
  Play,
  CloudRain,
  Image as ImageIcon,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import { AtmosphereEffect, CameraMotion, Scene } from '../types';
import { generateKeyframeAPI } from '../services/geminiService';

interface ImageToVideoProps {
  onAddGeneratedScene: (scene: Scene) => void;
  aspectRatio: '16:9' | '9:16' | '1:1' | '4:3';
}

export const ImageToVideo: React.FC<ImageToVideoProps> = ({
  onAddGeneratedScene,
  aspectRatio,
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [promptText, setPromptText] = useState<string>('Castelo antigo no topo da montanha com nuvens mágicas');
  const [cameraMotion, setCameraMotion] = useState<CameraMotion>('drone_flythrough');
  const [atmosphere, setAtmosphere] = useState<AtmosphereEffect>('particles');
  const [subtitle, setSubtitle] = useState<string>('VIVA A EXPERIÊNCIA');
  const [narration, setNarration] = useState<string>('Uma visão inesquecível ganha vida diante dos seus olhos.');
  const [duration, setDuration] = useState<number>(4);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // File upload handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setSelectedImage(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  // Generate Image with Gemini Imagen
  const handleGenerateImage = async () => {
    if (!promptText.trim()) return;
    setIsGenerating(true);
    setErrorMsg(null);
    try {
      const url = await generateKeyframeAPI(promptText, aspectRatio);
      setSelectedImage(url);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Erro ao gerar imagem com IA');
    } finally {
      setIsGenerating(false);
    }
  };

  // Send to Project
  const handleCreateVideoTake = () => {
    if (!selectedImage) return;
    const scene: Scene = {
      id: 'scene_img_' + Date.now(),
      title: 'Take Foto Animada',
      duration,
      visualPrompt: promptText,
      imageUrl: selectedImage,
      cameraMotion,
      atmosphereEffect: atmosphere,
      transition: 'crossfade',
      subtitle,
      narration,
      moodColor: '#0b132b',
    };
    onAddGeneratedScene(scene);
  };

  return (
    <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 lg:p-6 flex flex-col gap-6 shadow-xl backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
            <ImageIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              Foto para Vídeo (Image-to-Video Animation)
            </h2>
            <p className="text-xs text-slate-400">
              Transforme qualquer imagem estática em um vídeo cinematográfico dinâmico com movimentos de câmera 3D.
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: Upload/Generate left, Controls right */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: Image Selection */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300">1. Selecione ou Gere a Imagem</span>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1"
            >
              <Upload className="w-3 h-3" />
              <span>Carregar Foto</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />
          </div>

          {/* Image Preview Box */}
          <div className="h-64 rounded-xl bg-slate-950/80 border-2 border-dashed border-slate-800 flex flex-col items-center justify-center relative overflow-hidden group">
            {selectedImage ? (
              <>
                <img
                  src={selectedImage}
                  alt="Preview"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-lg bg-slate-900/90 text-white text-xs font-medium border border-slate-700 hover:bg-slate-800"
                  >
                    Trocar Foto
                  </button>
                  <button
                    onClick={() => setSelectedImage(null)}
                    className="px-3 py-1.5 rounded-lg bg-rose-500/80 text-white text-xs font-medium hover:bg-rose-600"
                  >
                    Remover
                  </button>
                </div>
              </>
            ) : (
              <div className="p-6 text-center flex flex-col items-center gap-2 text-slate-500">
                <ImageIcon className="w-10 h-10 text-slate-600" />
                <p className="text-xs">
                  Arraste uma foto aqui ou gere uma arte cinematográfica com a IA abaixo
                </p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
                >
                  Selecionar Arquivo
                </button>
              </div>
            )}
          </div>

          {/* AI Image Generator Prompt */}
          <div className="flex flex-col gap-2 bg-slate-950/50 p-3 rounded-xl border border-slate-800/80">
            <span className="text-xs font-medium text-slate-300 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Ou gere uma arte inicial com IA
            </span>
            <div className="flex gap-2">
              <input
                type="text"
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                placeholder="Ex: Templo futurista em Marte sob o pôr do sol..."
                className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
              />
              <button
                id="generate-image-btn"
                onClick={handleGenerateImage}
                disabled={isGenerating || !promptText.trim()}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-amber-500 hover:bg-amber-400 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-1.5"
              >
                <Sparkles className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
                <span>{isGenerating ? 'Gerando...' : 'Gerar'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right: Animation Dynamics & Text */}
        <div className="flex flex-col gap-4">
          <span className="text-xs font-semibold text-slate-300">2. Configure o Movimento do Vídeo</span>

          {/* Camera Motion */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
              <Camera className="w-3 h-3 text-indigo-400" />
              Movimento de Câmera 3D
            </label>
            <select
              value={cameraMotion}
              onChange={(e) => setCameraMotion(e.target.value as CameraMotion)}
              className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-lg p-2 outline-none focus:border-sky-500"
            >
              <option value="drone_flythrough">Drone Flythrough (Avanço & Altitude)</option>
              <option value="zoom_in">Zoom In Dinâmico (Ken Burns)</option>
              <option value="zoom_out">Zoom Out Revelação</option>
              <option value="pan_right">Panorâmica Direita</option>
              <option value="pan_left">Panorâmica Esquerda</option>
              <option value="orbit_360">Órbita 360° Circular</option>
              <option value="tilt_up">Tilt Up Ascendente</option>
              <option value="slow_motion">Super Câmera Lenta Flutuante</option>
            </select>
          </div>

          {/* Atmosphere Effect */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
              <CloudRain className="w-3 h-3 text-cyan-400" />
              Efeito Atmosférico & Partículas
            </label>
            <select
              value={atmosphere}
              onChange={(e) => setAtmosphere(e.target.value as AtmosphereEffect)}
              className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-lg p-2 outline-none focus:border-sky-500"
            >
              <option value="particles">Partículas de Luz Douradas</option>
              <option value="rain">Chuva Cinemática Realista</option>
              <option value="dust_motes">Poeira Solar (Sunbeams)</option>
              <option value="lens_flare">Lens Flare Anamórfico</option>
              <option value="cyber_grid">Grade Cibernética 3D</option>
              <option value="bokeh">Bokeh Suave Desfocado</option>
              <option value="none">Nenhum</option>
            </select>
          </div>

          {/* Subtitle */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-medium text-slate-400">
              Legenda do Take
            </label>
            <input
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-lg p-2 outline-none focus:border-sky-500"
              placeholder="Ex: NOVO HORIZONTE..."
            />
          </div>

          {/* Duration Slider */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>Duração do Take</span>
              <span className="font-mono text-sky-400 font-bold">{duration} segundos</span>
            </div>
            <input
              type="range"
              min={2}
              max={10}
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="w-full accent-sky-500"
            />
          </div>

          {/* Submit Action */}
          <button
            id="create-image-video-btn"
            onClick={handleCreateVideoTake}
            disabled={!selectedImage}
            className="mt-2 flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 shadow-lg shadow-purple-500/25 active:scale-95 transition-all disabled:opacity-50"
          >
            <span>Adicionar Take Animado ao Projeto</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
          {errorMsg}
        </div>
      )}
    </div>
  );
};
