import {
  AspectRatio,
  AtmosphereEffect,
  CameraMotion,
  PostProcessingFilters,
  Scene,
  TransitionType,
  VideoProject,
} from '../types';
import { soundSynth } from './audioSynth';

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  color: string;
}

export class VideoRendererEngine {
  private particles: Particle[] = [];
  private imageCache: Map<string, HTMLImageElement> = new Map();
  private loadedImages: Set<string> = new Set();
  private noiseSeed = 0;
  private grainCanvas: HTMLCanvasElement | null = null;
  private grainCtx: CanvasRenderingContext2D | null = null;

  constructor() {
    this.initParticles(80);
  }

  private initParticles(count: number) {
    this.particles = [];
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random(),
        y: Math.random(),
        size: Math.random() * 4 + 1,
        speedX: (Math.random() - 0.5) * 0.002,
        speedY: (Math.random() - 0.5) * 0.003 - 0.001,
        opacity: Math.random() * 0.7 + 0.2,
        color: Math.random() > 0.4 ? '#ffffff' : '#ffd166',
      });
    }
  }

  public preloadImage(url?: string) {
    if (!url || this.imageCache.has(url)) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      this.loadedImages.add(url);
    };
    img.src = url;
    this.imageCache.set(url, img);
  }

  public preloadProjectImages(project: VideoProject) {
    project.scenes.forEach((scene) => {
      if (scene.imageUrl) {
        this.preloadImage(scene.imageUrl);
      }
    });
  }

  // Calculate dimensions based on aspect ratio
  public getResolutionDimensions(
    aspectRatio: AspectRatio,
    quality: '720p' | '1080p' = '720p'
  ): { width: number; height: number } {
    const is1080 = quality === '1080p';
    switch (aspectRatio) {
      case '16:9':
        return is1080 ? { width: 1920, height: 1080 } : { width: 1280, height: 720 };
      case '9:16':
        return is1080 ? { width: 1080, height: 1920 } : { width: 720, height: 1280 };
      case '1:1':
        return is1080 ? { width: 1080, height: 1080 } : { width: 720, height: 720 };
      case '4:3':
        return is1080 ? { width: 1440, height: 1080 } : { width: 960, height: 720 };
      default:
        return { width: 1280, height: 720 };
    }
  }

  // Draw complete scene frame at a specific scene progress (0.0 to 1.0)
  public renderFrame(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    scene: Scene,
    sceneProgress: number, // 0 to 1
    totalProgress: number, // 0 to 1
    nextScene?: Scene,
    transitionProgress: number = 0, // 0 to 1 during transition
    postProcessing?: PostProcessingFilters,
    splitScreenProgress?: number | null // e.g. 0.5 for split screen preview before/after
  ) {
    ctx.save();
    ctx.clearRect(0, 0, width, height);

    // If in transition and next scene exists, handle blend
    if (transitionProgress > 0 && nextScene) {
      this.renderSceneVisuals(ctx, width, height, scene, sceneProgress);
      this.applyTransition(ctx, width, height, scene.transition, transitionProgress, nextScene);
    } else {
      this.renderSceneVisuals(ctx, width, height, scene, sceneProgress);
    }

    // Atmospheric layer (particles, rain, dust, etc)
    this.renderAtmosphere(ctx, width, height, scene.atmosphereEffect, sceneProgress);

    // Subtitle & Overlay Titles
    this.renderSubtitles(ctx, width, height, scene, sceneProgress);

    // Apply Post-Processing AI Effects (Grain, Aberration, Vignette, Color Grading, Bloom)
    if (postProcessing && postProcessing.enabled) {
      this.applyPostProcessing(ctx, width, height, postProcessing, splitScreenProgress);
    } else {
      // Default subtle cinematic vignette when post-processing is off
      this.renderCinemaVignette(ctx, width, height);
    }

    ctx.restore();
  }

  private renderSceneVisuals(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    scene: Scene,
    progress: number
  ) {
    const cachedImg = scene.imageUrl ? this.imageCache.get(scene.imageUrl) : null;
    const isImgReady = cachedImg && cachedImg.complete && cachedImg.naturalWidth > 0;

    if (isImgReady) {
      // Draw image with camera motion transformation
      this.renderImageWithMotion(ctx, width, height, cachedImg, scene.cameraMotion, progress);
    } else {
      // Generative procedural cinematic background
      this.renderProceduralBackground(ctx, width, height, scene, progress);
    }
  }

  // Camera Motion Transformer
  private renderImageWithMotion(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    img: HTMLImageElement,
    motion: CameraMotion,
    progress: number
  ) {
    ctx.save();

    // Calculate source cover fitting with generous bleed for camera motions
    const bleed = 1.25; // 25% bleed for pan and zoom movements
    let scale = 1.0;
    let translateX = 0;
    let translateY = 0;
    let rotation = 0;

    switch (motion) {
      case 'zoom_in':
        scale = 1.0 + progress * 0.18;
        break;
      case 'zoom_out':
        scale = 1.18 - progress * 0.18;
        break;
      case 'pan_left':
        scale = 1.15;
        translateX = (0.5 - progress) * (width * 0.12);
        break;
      case 'pan_right':
        scale = 1.15;
        translateX = (progress - 0.5) * (width * 0.12);
        break;
      case 'tilt_up':
        scale = 1.15;
        translateY = (0.5 - progress) * (height * 0.1);
        break;
      case 'tilt_down':
        scale = 1.15;
        translateY = (progress - 0.5) * (height * 0.1);
        break;
      case 'drone_flythrough':
        scale = 1.0 + progress * 0.22;
        translateY = (progress - 0.5) * (height * 0.06);
        break;
      case 'orbit_360':
        scale = 1.12 + Math.sin(progress * Math.PI) * 0.05;
        rotation = (progress - 0.5) * 0.04;
        break;
      case 'slow_motion':
        scale = 1.05 + progress * 0.04;
        translateX = Math.sin(progress * Math.PI) * 15;
        break;
      case 'static':
      default:
        scale = 1.02;
        break;
    }

    // Center transform
    ctx.translate(width / 2 + translateX, height / 2 + translateY);
    ctx.rotate(rotation);
    ctx.scale(scale * bleed, scale * bleed);

    // Calculate draw dimensions preserving aspect ratio cover
    const imgRatio = img.naturalWidth / img.naturalHeight;
    const canvasRatio = width / height;
    let drawW = width;
    let drawH = height;

    if (imgRatio > canvasRatio) {
      drawH = height;
      drawW = height * imgRatio;
    } else {
      drawW = width;
      drawH = width / imgRatio;
    }

    ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
    ctx.restore();
  }

  // Generative procedural background if image is generating or missing
  private renderProceduralBackground(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    scene: Scene,
    progress: number
  ) {
    const baseColor = scene.moodColor || '#0f172a';

    // Base background gradient
    const grad = ctx.createRadialGradient(
      width / 2 + Math.sin(progress * Math.PI * 2) * 50,
      height * 0.4,
      50,
      width / 2,
      height / 2,
      Math.max(width, height)
    );
    grad.addColorStop(0, '#38bdf8');
    grad.addColorStop(0.3, baseColor);
    grad.addColorStop(1, '#020617');

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Celestial or ambient glowing sphere
    const sunGrad = ctx.createRadialGradient(
      width * 0.5 + (progress - 0.5) * 40,
      height * 0.35,
      10,
      width * 0.5,
      height * 0.35,
      height * 0.3
    );
    sunGrad.addColorStop(0, 'rgba(255, 235, 180, 0.8)');
    sunGrad.addColorStop(0.3, 'rgba(245, 158, 11, 0.4)');
    sunGrad.addColorStop(1, 'rgba(245, 158, 11, 0)');
    ctx.fillStyle = sunGrad;
    ctx.beginPath();
    ctx.arc(width * 0.5 + (progress - 0.5) * 40, height * 0.35, height * 0.3, 0, Math.PI * 2);
    ctx.fill();

    // Silhouette Mountain / Horizon layers with parallax
    this.renderHorizonSilhouettes(ctx, width, height, progress, baseColor);

    // Subtle Grid / Space Lines
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.07)';
    ctx.lineWidth = 1;
    for (let y = height * 0.6; y < height; y += (height - height * 0.6) / 8) {
      ctx.beginPath();
      ctx.moveTo(0, y + (progress * 10) % 20);
      ctx.lineTo(width, y + (progress * 10) % 20);
      ctx.stroke();
    }
    ctx.restore();
  }

  private renderHorizonSilhouettes(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    progress: number,
    _baseColor: string
  ) {
    // Distant mountain
    ctx.save();
    ctx.fillStyle = 'rgba(15, 23, 42, 0.6)';
    ctx.beginPath();
    ctx.moveTo(0, height);
    ctx.lineTo(0, height * 0.65);
    for (let x = 0; x <= width; x += 40) {
      const offset = (x / width) * 4 + progress * 0.2;
      const y = height * 0.65 - Math.sin(offset) * 40 - Math.cos(offset * 2) * 25;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(width, height);
    ctx.closePath();
    ctx.fill();

    // Near terrain
    ctx.fillStyle = 'rgba(2, 6, 23, 0.9)';
    ctx.beginPath();
    ctx.moveTo(0, height);
    ctx.lineTo(0, height * 0.78);
    for (let x = 0; x <= width; x += 30) {
      const offset = (x / width) * 6 + progress * 0.5;
      const y = height * 0.78 - Math.sin(offset) * 30;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(width, height);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // Atmospheric Effect Rendering
  private renderAtmosphere(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    effect: AtmosphereEffect,
    progress: number
  ) {
    if (effect === 'none') return;

    ctx.save();

    switch (effect) {
      case 'particles':
      case 'dust_motes':
        for (const p of this.particles) {
          const px = ((p.x + p.speedX * progress * 100) % 1) * width;
          const py = ((p.y + p.speedY * progress * 100) % 1 + 1) % 1 * height;
          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.opacity * (0.6 + Math.sin(progress * Math.PI * 4 + p.x * 10) * 0.4);
          ctx.beginPath();
          ctx.arc(px, py, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
        break;

      case 'rain':
        ctx.strokeStyle = 'rgba(180, 220, 255, 0.5)';
        ctx.lineWidth = 1.5;
        for (let i = 0; i < 70; i++) {
          const rx = ((i * 37 + progress * 800) % width);
          const ry = ((i * 91 + progress * 2000) % height);
          ctx.beginPath();
          ctx.moveTo(rx, ry);
          ctx.lineTo(rx - 15, ry + 35);
          ctx.stroke();
        }
        break;

      case 'lens_flare': {
        const flareX = width * (0.3 + progress * 0.4);
        const flareY = height * 0.35;
        // Horizontal streak
        const streakGrad = ctx.createLinearGradient(flareX - 300, flareY, flareX + 300, flareY);
        streakGrad.addColorStop(0, 'rgba(56, 189, 248, 0)');
        streakGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.8)');
        streakGrad.addColorStop(1, 'rgba(244, 114, 182, 0)');
        ctx.fillStyle = streakGrad;
        ctx.fillRect(flareX - 300, flareY - 3, 600, 6);

        // Halo rings
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(flareX, flareY, 60, 0, Math.PI * 2);
        ctx.stroke();
        break;
      }

      case 'cyber_grid': {
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.35)';
        ctx.lineWidth = 1.5;
        const horizon = height * 0.65;
        const vanishingX = width / 2;

        // Perspective lines
        for (let i = -10; i <= 10; i++) {
          ctx.beginPath();
          ctx.moveTo(vanishingX, horizon);
          ctx.lineTo(vanishingX + i * (width / 6), height);
          ctx.stroke();
        }

        // Horizontal moving lines
        for (let j = 0; j < 8; j++) {
          const depth = (j + (progress * 2) % 1) / 8;
          const lineY = horizon + Math.pow(depth, 2) * (height - horizon);
          ctx.beginPath();
          ctx.moveTo(0, lineY);
          ctx.lineTo(width, lineY);
          ctx.stroke();
        }
        break;
      }

      case 'bokeh':
        for (let k = 0; k < 15; k++) {
          const bx = ((k * 89 + progress * 40) % width);
          const by = ((k * 133 + progress * 20) % height);
          const bSize = 25 + (k % 5) * 12;
          ctx.fillStyle = k % 2 === 0 ? 'rgba(251, 146, 60, 0.18)' : 'rgba(168, 85, 247, 0.18)';
          ctx.beginPath();
          ctx.arc(bx, by, bSize, 0, Math.PI * 2);
          ctx.fill();
        }
        break;

      case 'film_grain': {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
        this.noiseSeed = (this.noiseSeed + 1) % 100;
        for (let g = 0; g < 150; g++) {
          const gx = Math.random() * width;
          const gy = Math.random() * height;
          ctx.fillRect(gx, gy, 2, 2);
        }
        break;
      }
    }

    ctx.restore();
  }

  // Transitions between scenes
  private applyTransition(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    type: TransitionType,
    tProgress: number,
    nextScene: Scene
  ) {
    ctx.save();
    switch (type) {
      case 'crossfade':
        ctx.globalAlpha = tProgress;
        this.renderSceneVisuals(ctx, width, height, nextScene, 0);
        break;

      case 'wipe_left': {
        const wipeX = width * (1 - tProgress);
        ctx.beginPath();
        ctx.rect(wipeX, 0, width - wipeX, height);
        ctx.clip();
        this.renderSceneVisuals(ctx, width, height, nextScene, 0);
        break;
      }

      case 'zoom_blur':
        ctx.globalAlpha = tProgress;
        ctx.translate(width / 2, height / 2);
        ctx.scale(1 + (1 - tProgress) * 0.4, 1 + (1 - tProgress) * 0.4);
        ctx.translate(-width / 2, -height / 2);
        this.renderSceneVisuals(ctx, width, height, nextScene, 0);
        break;

      case 'glitch':
        if (Math.random() > 0.4) {
          ctx.fillStyle = '#ff0055';
          ctx.fillRect(0, Math.random() * height, width, 15);
          ctx.fillStyle = '#00ffff';
          ctx.fillRect(0, Math.random() * height, width, 15);
        }
        ctx.globalAlpha = tProgress;
        this.renderSceneVisuals(ctx, width, height, nextScene, 0);
        break;

      case 'fade_black':
        if (tProgress < 0.5) {
          ctx.fillStyle = '#000000';
          ctx.globalAlpha = tProgress * 2;
          ctx.fillRect(0, 0, width, height);
        } else {
          this.renderSceneVisuals(ctx, width, height, nextScene, 0);
          ctx.fillStyle = '#000000';
          ctx.globalAlpha = (1 - tProgress) * 2;
          ctx.fillRect(0, 0, width, height);
        }
        break;
    }
    ctx.restore();
  }

  // Render Subtitles & On-screen titles
  private renderSubtitles(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    scene: Scene,
    progress: number
  ) {
    if (!scene.subtitle && !scene.title) return;

    ctx.save();

    // Scene Title (appears in first 35% of the scene)
    if (scene.title && progress < 0.35) {
      const titleOpacity = Math.sin((progress / 0.35) * Math.PI);
      ctx.globalAlpha = titleOpacity;
      ctx.font = `600 ${Math.max(18, Math.round(width * 0.022))}px 'Plus Jakarta Sans', sans-serif`;
      ctx.fillStyle = '#f8fafc';
      ctx.textAlign = 'left';
      ctx.shadowColor = 'rgba(0,0,0,0.8)';
      ctx.shadowBlur = 10;
      ctx.fillText(`SCENE // ${scene.title.toUpperCase()}`, width * 0.05, height * 0.12);
    }

    // Main Subtitle (bottom center banner)
    if (scene.subtitle) {
      // Fade in and out smoothly
      const subOpacity = Math.min(progress * 4, 1) * Math.min((1 - progress) * 4, 1);
      ctx.globalAlpha = subOpacity;

      const fontSize = Math.max(16, Math.round(width * 0.028));
      ctx.font = `700 ${fontSize}px 'Plus Jakarta Sans', system-ui, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const text = scene.subtitle;
      const textMetrics = ctx.measureText(text);
      const boxW = Math.min(width * 0.88, textMetrics.width + 48);
      const boxH = fontSize + 24;
      const boxX = width / 2 - boxW / 2;
      const boxY = height * 0.84 - boxH / 2;

      // Dark translucent pill backdrop
      ctx.fillStyle = 'rgba(5, 7, 15, 0.75)';
      ctx.beginPath();
      ctx.roundRect(boxX, boxY, boxW, boxH, 8);
      ctx.fill();

      // Neon accent bar on bottom of pill
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(boxX + 16, boxY + boxH - 3, boxW - 32, 2);

      // Text with drop shadow
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
      ctx.shadowBlur = 8;
      ctx.fillText(text, width / 2, height * 0.84);
    }

    ctx.restore();
  }

  // Apply full Post-Processing FX Pipeline
  private applyPostProcessing(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    filters: PostProcessingFilters,
    splitScreenProgress?: number | null
  ) {
    if (!filters.enabled) {
      this.renderCinemaVignette(ctx, width, height);
      return;
    }

    const isSplit = typeof splitScreenProgress === 'number' && splitScreenProgress > 0 && splitScreenProgress < 1;
    const splitX = isSplit ? width * splitScreenProgress! : width;

    ctx.save();

    if (isSplit) {
      // Clip rendering of effects only to the left (or right) split side
      ctx.beginPath();
      ctx.rect(0, 0, splitX, height);
      ctx.clip();
    }

    // 1. Color Grading & Tonal Adjustments
    this.applyColorGrading(ctx, width, height, filters);

    // 2. Bloom & Highlight Pro-Mist Diffusion
    if (filters.bloomGlow > 0) {
      this.applyBloomDiffusion(ctx, width, height, filters.bloomGlow);
    }

    // 3. Chromatic Aberration / RGB Lens Split
    if (filters.chromaticAberration > 0) {
      this.applyChromaticAberration(ctx, width, height, filters.chromaticAberration);
    }

    // 4. Retro Scanlines (CRT TV / VHS)
    if (filters.scanlines > 0) {
      this.applyScanlines(ctx, width, height, filters.scanlines);
    }

    // 5. Procedural Film Grain (Fine, Medium, Coarse)
    if (filters.filmGrain > 0) {
      this.applyFilmGrain(ctx, width, height, filters.filmGrain, filters.grainSize);
    }

    // 6. Sharpening & Micro-contrast Boost
    if (filters.sharpen > 0) {
      this.applySharpenMicroContrast(ctx, width, height, filters.sharpen);
    }

    // 7. Cinematic Custom Vignette
    if (filters.vignette > 0) {
      this.applyCustomVignette(ctx, width, height, filters.vignette, filters.vignetteFeather);
    }

    ctx.restore();

    // 8. If in Split-Screen mode, draw interactive dividing line & badges
    if (isSplit) {
      this.renderSplitScreenDivider(ctx, width, height, splitX);
    }
  }

  // 1. Color Grading & LUT emulation
  private applyColorGrading(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    filters: PostProcessingFilters
  ) {
    const { colorGrading, contrast, saturation, brightness } = filters;

    // Apply global tone adjustments if different from 100%
    ctx.save();

    // Emulate LUT Presets with layered color blends
    switch (colorGrading) {
      case 'teal_orange': {
        // Shadows: Teal
        ctx.globalCompositeOperation = 'soft-light';
        ctx.fillStyle = 'rgba(6, 78, 107, 0.45)';
        ctx.fillRect(0, 0, width, height);

        // Highlights: Warm Amber/Orange
        ctx.globalCompositeOperation = 'overlay';
        const warmGrad = ctx.createLinearGradient(0, 0, width, height);
        warmGrad.addColorStop(0, 'rgba(249, 115, 22, 0.15)');
        warmGrad.addColorStop(1, 'rgba(234, 88, 12, 0.22)');
        ctx.fillStyle = warmGrad;
        ctx.fillRect(0, 0, width, height);
        break;
      }

      case 'golden_hour': {
        ctx.globalCompositeOperation = 'soft-light';
        const goldGrad = ctx.createLinearGradient(0, 0, width, height);
        goldGrad.addColorStop(0, 'rgba(251, 191, 36, 0.35)');
        goldGrad.addColorStop(1, 'rgba(217, 119, 6, 0.45)');
        ctx.fillStyle = goldGrad;
        ctx.fillRect(0, 0, width, height);
        break;
      }

      case 'cyber_neon': {
        ctx.globalCompositeOperation = 'color-dodge';
        const neonGrad = ctx.createLinearGradient(0, 0, width, height);
        neonGrad.addColorStop(0, 'rgba(14, 165, 233, 0.25)'); // Cyan
        neonGrad.addColorStop(1, 'rgba(236, 72, 153, 0.3)'); // Magenta
        ctx.fillStyle = neonGrad;
        ctx.fillRect(0, 0, width, height);
        break;
      }

      case 'warm_vintage': {
        ctx.globalCompositeOperation = 'soft-light';
        ctx.fillStyle = 'rgba(180, 83, 9, 0.35)'; // Sepia warm
        ctx.fillRect(0, 0, width, height);
        break;
      }

      case 'bleach_bypass': {
        // High contrast + silver desaturation look
        ctx.globalCompositeOperation = 'luminosity';
        ctx.fillStyle = 'rgba(148, 163, 184, 0.35)';
        ctx.fillRect(0, 0, width, height);
        ctx.globalCompositeOperation = 'hard-light';
        ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
        ctx.fillRect(0, 0, width, height);
        break;
      }

      case 'noir_bw': {
        // High-contrast black and white
        ctx.globalCompositeOperation = 'color';
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);
        // Rich silver shadow push
        ctx.globalCompositeOperation = 'soft-light';
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.fillRect(0, 0, width, height);
        break;
      }

      case 'kodachrome': {
        ctx.globalCompositeOperation = 'soft-light';
        const kodaGrad = ctx.createLinearGradient(0, 0, width, height);
        kodaGrad.addColorStop(0, 'rgba(239, 68, 68, 0.25)'); // Rich red
        kodaGrad.addColorStop(0.6, 'rgba(245, 158, 11, 0.2)'); // Rich gold
        kodaGrad.addColorStop(1, 'rgba(59, 130, 246, 0.15)'); // Deep blue shadows
        ctx.fillStyle = kodaGrad;
        ctx.fillRect(0, 0, width, height);
        break;
      }

      case 'scifi_matrix': {
        ctx.globalCompositeOperation = 'soft-light';
        ctx.fillStyle = 'rgba(16, 185, 129, 0.35)'; // Emerald / Matrix green
        ctx.fillRect(0, 0, width, height);
        break;
      }

      default:
        break;
    }

    // Dynamic contrast / brightness overlay if altered
    if (contrast !== 100) {
      ctx.globalCompositeOperation = contrast > 100 ? 'overlay' : 'soft-light';
      const cAlpha = Math.abs(contrast - 100) / 200;
      ctx.fillStyle = contrast > 100 ? `rgba(0, 0, 0, ${cAlpha})` : `rgba(128, 128, 128, ${cAlpha})`;
      ctx.fillRect(0, 0, width, height);
    }

    ctx.restore();
  }

  // 2. Bloom & Halation Diffusion (Black Pro-Mist effect)
  private applyBloomDiffusion(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    intensity: number
  ) {
    ctx.save();
    const bloomAlpha = (intensity / 100) * 0.35;
    ctx.globalAlpha = bloomAlpha;
    ctx.globalCompositeOperation = 'screen';

    // Soft warm diffuse halo around canvas
    const bloomGrad = ctx.createRadialGradient(
      width / 2,
      height / 2,
      Math.min(width, height) * 0.15,
      width / 2,
      height / 2,
      Math.max(width, height) * 0.65
    );
    bloomGrad.addColorStop(0, 'rgba(255, 247, 237, 0.6)');
    bloomGrad.addColorStop(0.5, 'rgba(254, 215, 170, 0.3)');
    bloomGrad.addColorStop(1, 'rgba(251, 146, 60, 0)');

    ctx.fillStyle = bloomGrad;
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
  }

  // 3. Chromatic Aberration (RGB Color Channel Shift)
  private applyChromaticAberration(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    amount: number
  ) {
    ctx.save();
    const shift = Math.max(1, Math.round((amount / 15) * (width * 0.008)));
    const alpha = Math.min(0.65, (amount / 15) * 0.55);

    // Red fringe on left/outer edges
    ctx.globalCompositeOperation = 'screen';
    ctx.globalAlpha = alpha;

    ctx.fillStyle = '#ff0033';
    ctx.fillRect(shift, 0, width - shift, height);

    // Cyan/Blue fringe on right/outer edges
    ctx.fillStyle = '#00f0ff';
    ctx.fillRect(0, 0, width - shift, height);

    ctx.restore();
  }

  // 4. Procedural Animated Film Grain
  private applyFilmGrain(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    intensity: number,
    size: 'fine' | 'medium' | 'coarse'
  ) {
    ctx.save();

    // Adjust grain size
    let grainPixelSize = 1;
    let baseAlpha = (intensity / 100) * 0.12;
    let particleCount = Math.round((width * height) / 1200 * (intensity / 50));

    if (size === 'fine') {
      grainPixelSize = 1.5;
      baseAlpha = (intensity / 100) * 0.09;
      particleCount = Math.min(2500, Math.max(600, particleCount));
    } else if (size === 'medium') {
      grainPixelSize = 2.2;
      baseAlpha = (intensity / 100) * 0.13;
      particleCount = Math.min(2000, Math.max(400, Math.round(particleCount * 0.7)));
    } else {
      // Coarse 16mm grain
      grainPixelSize = 3.5;
      baseAlpha = (intensity / 100) * 0.18;
      particleCount = Math.min(1400, Math.max(300, Math.round(particleCount * 0.5)));
    }

    this.noiseSeed = (this.noiseSeed + 1) % 1000;

    // Draw distributed noise spots
    for (let i = 0; i < particleCount; i++) {
      const gx = Math.random() * width;
      const gy = Math.random() * height;
      const isLight = Math.random() > 0.45;
      const alphaVar = baseAlpha * (0.6 + Math.random() * 0.8);

      ctx.fillStyle = isLight
        ? `rgba(255, 255, 255, ${alphaVar})`
        : `rgba(15, 23, 42, ${alphaVar * 1.2})`;

      ctx.fillRect(gx, gy, grainPixelSize, grainPixelSize);
    }

    ctx.restore();
  }

  // 5. Retro Scanlines
  private applyScanlines(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    intensity: number
  ) {
    ctx.save();
    const lineAlpha = (intensity / 100) * 0.35;
    ctx.fillStyle = `rgba(0, 0, 0, ${lineAlpha})`;

    const step = 4;
    for (let y = 0; y < height; y += step) {
      ctx.fillRect(0, y, width, 1.5);
    }

    // Subtle phosphor glow
    if (intensity > 40) {
      ctx.globalCompositeOperation = 'screen';
      ctx.fillStyle = `rgba(56, 189, 248, ${(intensity / 100) * 0.05})`;
      ctx.fillRect(0, 0, width, height);
    }

    ctx.restore();
  }

  // 6. Sharpen & Micro-contrast
  private applySharpenMicroContrast(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    intensity: number
  ) {
    ctx.save();
    const sharpenAlpha = (intensity / 100) * 0.16;
    ctx.globalCompositeOperation = 'overlay';
    ctx.fillStyle = `rgba(255, 255, 255, ${sharpenAlpha})`;
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
  }

  // 7. Custom Vignette
  private applyCustomVignette(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    intensity: number,
    feather: number
  ) {
    ctx.save();
    const innerRatio = Math.max(0.2, 0.7 - (100 - feather) * 0.005);
    const outerRatio = Math.min(1.1, 0.85 + feather * 0.002);
    const maxAlpha = Math.min(0.95, (intensity / 100) * 0.9);

    const grad = ctx.createRadialGradient(
      width / 2,
      height / 2,
      Math.min(width, height) * innerRatio,
      width / 2,
      height / 2,
      Math.max(width, height) * outerRatio
    );
    grad.addColorStop(0, 'rgba(0, 0, 0, 0)');
    grad.addColorStop(0.7, `rgba(0, 0, 0, ${maxAlpha * 0.6})`);
    grad.addColorStop(1, `rgba(0, 0, 0, ${maxAlpha})`);

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
  }

  // 8. Split-Screen Divider and labels
  private renderSplitScreenDivider(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    splitX: number
  ) {
    ctx.save();

    // Divider vertical neon line
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2.5;
    ctx.shadowColor = '#0ea5e9';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.moveTo(splitX, 0);
    ctx.lineTo(splitX, height);
    ctx.stroke();

    // Center handle circle
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(splitX, height / 2, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#0ea5e9';
    ctx.beginPath();
    ctx.arc(splitX, height / 2, 5, 0, Math.PI * 2);
    ctx.fill();

    // Badges: "EFEITOS IA" (Left) and "ORIGINAL" (Right)
    const fontSize = Math.max(11, Math.round(width * 0.016));
    ctx.font = `700 ${fontSize}px 'Plus Jakarta Sans', sans-serif`;

    // Left badge (Effects)
    if (splitX > 90) {
      ctx.fillStyle = 'rgba(14, 165, 233, 0.85)';
      ctx.beginPath();
      ctx.roundRect(splitX - 100, 16, 90, 24, 6);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('COM EFEITOS', splitX - 55, 28);
    }

    // Right badge (Original)
    if (width - splitX > 90) {
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.beginPath();
      ctx.roundRect(splitX + 10, 16, 80, 24, 6);
      ctx.fill();
      ctx.fillStyle = '#94a3b8';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('ORIGINAL', splitX + 50, 28);
    }

    ctx.restore();
  }

  // Vignette & Cinematic Border (fallback)
  private renderCinemaVignette(ctx: CanvasRenderingContext2D, width: number, height: number) {
    ctx.save();
    const grad = ctx.createRadialGradient(
      width / 2,
      height / 2,
      Math.min(width, height) * 0.45,
      width / 2,
      height / 2,
      Math.max(width, height) * 0.72
    );
    grad.addColorStop(0, 'rgba(0, 0, 0, 0)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0.55)');

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
  }

  // Render a full video export directly into a downloadable Blob via MediaRecorder
  public async exportProjectAsVideo(
    project: VideoProject,
    onProgress: (percent: number, statusText: string) => void
  ): Promise<Blob> {
    const { width, height } = this.getResolutionDimensions(project.aspectRatio, project.resolution);
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;

    // Total duration
    const totalDuration = project.scenes.reduce((sum, s) => sum + s.duration, 0);
    const fps = project.fps || 30;
    const totalFrames = Math.max(1, Math.round(totalDuration * fps));

    // Prepare stream
    const canvasStream = canvas.captureStream(fps);
    const audioDestination = soundSynth.getAudioDestinationNode();

    let combinedStream: MediaStream = canvasStream;
    if (audioDestination && audioDestination.stream.getAudioTracks().length > 0) {
      combinedStream = new MediaStream([
        ...canvasStream.getVideoTracks(),
        ...audioDestination.stream.getAudioTracks(),
      ]);
    }

    // Pick supported MIME type
    const mimeTypes = [
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp8,opus',
      'video/webm',
      'video/mp4',
    ];
    let selectedMime = 'video/webm';
    for (const m of mimeTypes) {
      if (MediaRecorder.isTypeSupported(m)) {
        selectedMime = m;
        break;
      }
    }

    const mediaRecorder = new MediaRecorder(combinedStream, {
      mimeType: selectedMime,
      videoBitsPerSecond: 6000000, // 6 Mbps
    });

    const recordedChunks: Blob[] = [];
    mediaRecorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) {
        recordedChunks.push(e.data);
      }
    };

    // Preload all scene images
    onProgress(5, 'Carregando quadros e texturas da IA...');
    await Promise.all(
      project.scenes.map((s) => {
        if (!s.imageUrl) return Promise.resolve();
        return new Promise<void>((resolve) => {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => {
            this.imageCache.set(s.imageUrl!, img);
            resolve();
          };
          img.onerror = () => resolve();
          img.src = s.imageUrl!;
        });
      })
    );

    mediaRecorder.start();

    // Start background sound during export
    if (project.soundtrack !== 'none' && audioDestination) {
      soundSynth.playSoundtrack(project.soundtrack, audioDestination);
    }

    return new Promise((resolve, reject) => {
      let currentFrame = 0;
      const frameInterval = 1000 / fps;

      const renderNextFrame = () => {
        if (currentFrame >= totalFrames) {
          mediaRecorder.stop();
          soundSynth.stopSoundtrack();
          return;
        }

        const currentTime = (currentFrame / totalFrames) * totalDuration;
        const totalProgress = currentFrame / totalFrames;

        // Find active scene
        let accumulatedTime = 0;
        let activeSceneIndex = 0;
        let activeScene = project.scenes[0];
        let sceneLocalTime = 0;

        for (let i = 0; i < project.scenes.length; i++) {
          const s = project.scenes[i];
          if (currentTime >= accumulatedTime && currentTime < accumulatedTime + s.duration) {
            activeSceneIndex = i;
            activeScene = s;
            sceneLocalTime = currentTime - accumulatedTime;
            break;
          }
          accumulatedTime += s.duration;
        }

        // If at the end
        if (!activeScene) {
          activeSceneIndex = project.scenes.length - 1;
          activeScene = project.scenes[activeSceneIndex];
          sceneLocalTime = activeScene.duration;
        }

        const sceneProgress = Math.min(1, Math.max(0, sceneLocalTime / activeScene.duration));
        const transitionDuration = 0.6; // 0.6s transition
        const timeUntilNextScene = activeScene.duration - sceneLocalTime;

        let nextScene: Scene | undefined;
        let transitionProgress = 0;
        if (
          timeUntilNextScene <= transitionDuration &&
          activeSceneIndex < project.scenes.length - 1
        ) {
          nextScene = project.scenes[activeSceneIndex + 1];
          transitionProgress = 1 - timeUntilNextScene / transitionDuration;
        }

        // Render to canvas
        this.renderFrame(
          ctx,
          width,
          height,
          activeScene,
          sceneProgress,
          totalProgress,
          nextScene,
          transitionProgress,
          project.postProcessing
        );

        const progressPercent = Math.round(10 + (currentFrame / totalFrames) * 85);
        onProgress(
          progressPercent,
          `Renderizando quadro ${currentFrame + 1} de ${totalFrames} (${progressPercent}%)...`
        );

        currentFrame++;
        setTimeout(renderNextFrame, frameInterval / 2);
      };

      mediaRecorder.onstop = () => {
        onProgress(100, 'Finalizando compressão e salvando vídeo...');
        const blob = new Blob(recordedChunks, { type: selectedMime });
        resolve(blob);
      };

      mediaRecorder.onerror = (e) => {
        soundSynth.stopSoundtrack();
        reject(e);
      };

      renderNextFrame();
    });
  }
}

export const videoRenderer = new VideoRendererEngine();
