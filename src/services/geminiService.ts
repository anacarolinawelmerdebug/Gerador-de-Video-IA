import { AspectRatio, CameraMotion, EnhancedPromptResult, Scene, VideoStyle } from '../types';

export async function enhancePromptAPI(
  prompt: string,
  style: VideoStyle,
  cameraMotion: CameraMotion,
  duration: number
): Promise<EnhancedPromptResult> {
  const response = await fetch('/api/gemini/enhance-prompt', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, style, cameraMotion, duration }),
  });

  const json = await response.json();
  if (!json.success) {
    throw new Error(json.error || 'Erro ao comunicar com o servidor');
  }
  return json.data;
}

export async function generateScriptAPI(
  idea: string,
  sceneCount: number,
  targetDuration: number,
  style: VideoStyle
): Promise<{ title: string; synopsis: string; scenes: any[] }> {
  const response = await fetch('/api/gemini/generate-script', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idea, sceneCount, targetDuration, style }),
  });

  const json = await response.json();
  if (!json.success) {
    throw new Error(json.error || 'Erro ao gerar roteiro');
  }
  return json.data;
}

export async function generateKeyframeAPI(
  prompt: string,
  aspectRatio: AspectRatio
): Promise<string> {
  const response = await fetch('/api/gemini/generate-keyframe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, aspectRatio }),
  });

  const json = await response.json();
  if (!json.success) {
    throw new Error(json.error || 'Erro ao gerar imagem de cena');
  }
  return json.imageUrl;
}

export async function startVeoGenerationAPI(
  prompt: string,
  aspectRatio: '16:9' | '9:16',
  resolution: '720p' | '1080p',
  startingImage?: string
): Promise<string> {
  const response = await fetch('/api/generate-video', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, aspectRatio, resolution, startingImage }),
  });

  const json = await response.json();
  if (!json.success) {
    throw new Error(json.error || 'Erro ao iniciar geração de vídeo Veo');
  }
  return json.operationName;
}

export async function checkVeoStatusAPI(operationName: string): Promise<{ done: boolean; response?: any }> {
  const response = await fetch('/api/video-status', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ operationName }),
  });

  const json = await response.json();
  if (!json.success) {
    throw new Error(json.error || 'Erro ao consultar status');
  }
  return { done: json.done, response: json.response };
}

export async function downloadVeoVideoBlob(operationName: string): Promise<Blob> {
  const response = await fetch('/api/video-download', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ operationName }),
  });

  if (!response.ok) {
    throw new Error('Falha ao baixar vídeo compilado');
  }
  return await response.blob();
}
