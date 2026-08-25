import React from 'react';
import { StyleDetail } from '../data/stylesData';

interface StyleThumbnailProps {
  style: StyleDetail;
  className?: string;
  isSelected?: boolean;
}

export const StyleThumbnail: React.FC<StyleThumbnailProps> = ({
  style,
  className = 'w-full h-28',
  isSelected = false,
}) => {
  const { id } = style;

  return (
    <div
      className={`relative overflow-hidden rounded-xl bg-slate-950 flex items-center justify-center select-none ${className}`}
    >
      {/* Dynamic Visual SVGs based on style type */}
      {id === 'photorealistic' && (
        <svg
          viewBox="0 0 320 180"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        >
          <defs>
            <linearGradient id="photo-bg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#18181b" />
              <stop offset="50%" stopColor="#27272a" />
              <stop offset="100%" stopColor="#09090b" />
            </linearGradient>
            <radialGradient id="lens-reflect" cx="35%" cy="30%" r="65%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
              <stop offset="35%" stopColor="#818cf8" stopOpacity="0.4" />
              <stop offset="70%" stopColor="#06b6d4" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0.9" />
            </radialGradient>
            <radialGradient id="glass-glare" cx="25%" cy="20%" r="40%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
              <stop offset="50%" stopColor="#bae6fd" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="metal-ring" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#71717a" />
              <stop offset="25%" stopColor="#27272a" />
              <stop offset="50%" stopColor="#a1a1aa" />
              <stop offset="75%" stopColor="#3f3f46" />
              <stop offset="100%" stopColor="#18181b" />
            </linearGradient>
          </defs>
          <rect width="320" height="180" fill="url(#photo-bg)" />

          {/* Golden hour warm background bokeh soft balls */}
          <circle cx="270" cy="50" r="35" fill="#f59e0b" opacity="0.22" filter="blur(1px)" />
          <circle cx="230" cy="110" r="22" fill="#fb923c" opacity="0.18" />
          <circle cx="50" cy="130" r="28" fill="#38bdf8" opacity="0.15" />
          <circle cx="80" cy="40" r="18" fill="#e0f2fe" opacity="0.2" />

          {/* Full-frame camera lens master prime optic */}
          {/* Outer Lens Housing Ring */}
          <circle cx="160" cy="90" r="76" fill="none" stroke="url(#metal-ring)" strokeWidth="6" opacity="0.9" />
          <circle cx="160" cy="90" r="71" fill="#09090b" stroke="#3f3f46" strokeWidth="1.5" />

          {/* Aperture ring notches & text */}
          <circle cx="160" cy="90" r="62" fill="url(#lens-reflect)" />

          {/* Multi-blade Iris Aperture Blades */}
          <polygon points="160,50 185,75 160,78" fill="#18181b" stroke="#27272a" strokeWidth="0.8" opacity="0.85" />
          <polygon points="185,75 188,105 168,95" fill="#18181b" stroke="#27272a" strokeWidth="0.8" opacity="0.85" />
          <polygon points="188,105 160,130 152,108" fill="#18181b" stroke="#27272a" strokeWidth="0.8" opacity="0.85" />
          <polygon points="160,130 135,105 152,98" fill="#18181b" stroke="#27272a" strokeWidth="0.8" opacity="0.85" />
          <polygon points="135,105 132,75 155,85" fill="#18181b" stroke="#27272a" strokeWidth="0.8" opacity="0.85" />
          <polygon points="132,75 160,50 162,72" fill="#18181b" stroke="#27272a" strokeWidth="0.8" opacity="0.85" />

          {/* Inner Optics Glass Core Reflection */}
          <circle cx="160" cy="90" r="28" fill="#0369a1" opacity="0.35" />
          <ellipse cx="148" cy="78" rx="22" ry="12" fill="url(#glass-glare)" transform="rotate(-25 148 78)" />
          <ellipse cx="174" cy="106" rx="14" ry="7" fill="#38bdf8" opacity="0.4" transform="rotate(35 174 106)" />

          {/* Photographic Sensor Grid Focus Markers */}
          <path d="M 125 65 L 120 65 L 120 70" fill="none" stroke="#38bdf8" strokeWidth="1.5" opacity="0.9" />
          <path d="M 195 65 L 200 65 L 200 70" fill="none" stroke="#38bdf8" strokeWidth="1.5" opacity="0.9" />
          <path d="M 125 115 L 120 115 L 120 110" fill="none" stroke="#38bdf8" strokeWidth="1.5" opacity="0.9" />
          <path d="M 195 115 L 200 115 L 200 110" fill="none" stroke="#38bdf8" strokeWidth="1.5" opacity="0.9" />

          {/* Center Micro Crosshair */}
          <line x1="156" y1="90" x2="164" y2="90" stroke="#38bdf8" strokeWidth="1.2" opacity="0.8" />
          <line x1="160" y1="86" x2="160" y2="94" stroke="#38bdf8" strokeWidth="1.2" opacity="0.8" />

          {/* Professional 8K RAW UI Markers */}
          <text x="14" y="24" fill="#a1a1aa" fontSize="8" fontFamily="monospace" fontWeight="bold">RAW • 8K UHD</text>
          <text x="14" y="166" fill="#38bdf8" fontSize="8" fontFamily="monospace">f/1.2 • ISO 100</text>
          <text x="250" y="166" fill="#a1a1aa" fontSize="8" fontFamily="monospace">1/1000s</text>
          <circle cx="295" cy="22" r="3.5" fill="#ef4444" />
        </svg>
      )}

      {id === 'cinematic' && (
        <svg
          viewBox="0 0 320 180"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        >
          <defs>
            <linearGradient id="cine-bg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#051923" />
              <stop offset="50%" stopColor="#003554" />
              <stop offset="100%" stopColor="#d97706" stopOpacity="0.8" />
            </linearGradient>
            <radialGradient id="cine-flare" cx="70%" cy="30%" r="50%">
              <stop offset="0%" stopColor="#fef08a" stopOpacity="0.9" />
              <stop offset="40%" stopColor="#f59e0b" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#051923" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="320" height="180" fill="url(#cine-bg)" />
          {/* Anamorphic Blue Streak / Lens Flare */}
          <ellipse cx="220" cy="50" rx="140" ry="12" fill="#38bdf8" opacity="0.45" />
          <circle cx="220" cy="50" r="40" fill="url(#cine-flare)" />
          {/* Mountain Silhouette in Sunset */}
          <path d="M0 180 L80 90 L160 140 L240 80 L320 180 Z" fill="#031926" opacity="0.9" />
          <path d="M40 180 L120 120 L200 150 L280 100 L320 180 Z" fill="#010c14" opacity="0.95" />
          {/* Bokeh Circles */}
          <circle cx="40" cy="40" r="14" fill="#f59e0b" opacity="0.25" />
          <circle cx="90" cy="70" r="8" fill="#38bdf8" opacity="0.3" />
          <circle cx="180" cy="30" r="10" fill="#fef08a" opacity="0.2" />
          {/* Cinema Letterbox Bars hint */}
          <rect x="0" y="0" width="320" height="14" fill="#000" opacity="0.7" />
          <rect x="0" y="166" width="320" height="14" fill="#000" opacity="0.7" />
        </svg>
      )}

      {id === 'cyberpunk' && (
        <svg
          viewBox="0 0 320 180"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        >
          <defs>
            <linearGradient id="cyber-sky" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#1e0b36" />
              <stop offset="60%" stopColor="#0d0221" />
              <stop offset="100%" stopColor="#050510" />
            </linearGradient>
            <linearGradient id="neon-cyan" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>
          </defs>
          <rect width="320" height="180" fill="url(#cyber-sky)" />
          {/* City Skyline */}
          <rect x="20" y="50" width="45" height="130" fill="#120e2e" />
          <rect x="75" y="30" width="50" height="150" fill="#1a1442" />
          <rect x="135" y="70" width="35" height="110" fill="#0e0a24" />
          <rect x="180" y="20" width="60" height="160" fill="#1f184d" />
          <rect x="250" y="55" width="45" height="125" fill="#120e2e" />
          {/* Neon Lines & Billboards */}
          <rect x="85" y="45" width="30" height="10" rx="2" fill="#ec4899" opacity="0.85" />
          <line x1="80" y1="20" x2="80" y2="180" stroke="#06b6d4" strokeWidth="2" opacity="0.7" />
          <line x1="230" y1="10" x2="230" y2="180" stroke="#ec4899" strokeWidth="2" opacity="0.8" />
          <circle cx="205" cy="40" r="12" fill="none" stroke="#06b6d4" strokeWidth="2" opacity="0.9" />
          {/* Rain streaks */}
          <line x1="40" y1="10" x2="30" y2="60" stroke="#38bdf8" strokeWidth="1" opacity="0.4" strokeDasharray="6 4" />
          <line x1="120" y1="30" x2="110" y2="90" stroke="#f472b6" strokeWidth="1" opacity="0.4" strokeDasharray="6 4" />
          <line x1="220" y1="15" x2="210" y2="85" stroke="#38bdf8" strokeWidth="1" opacity="0.4" strokeDasharray="6 4" />
          <line x1="290" y1="40" x2="280" y2="110" stroke="#c084fc" strokeWidth="1" opacity="0.4" strokeDasharray="6 4" />
          {/* Wet asphalt ground reflection */}
          <rect x="0" y="145" width="320" height="35" fill="#080614" />
          <ellipse cx="100" cy="160" rx="40" ry="4" fill="#ec4899" opacity="0.5" />
          <ellipse cx="210" cy="165" rx="50" ry="5" fill="#06b6d4" opacity="0.5" />
        </svg>
      )}

      {id === 'anime' && (
        <svg
          viewBox="0 0 320 180"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        >
          <defs>
            <linearGradient id="anime-sky" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#0284c7" />
              <stop offset="60%" stopColor="#7dd3fc" />
              <stop offset="100%" stopColor="#fef08a" />
            </linearGradient>
          </defs>
          <rect width="320" height="180" fill="url(#anime-sky)" />
          {/* Fluffy Ghibli Clouds */}
          <circle cx="70" cy="50" r="28" fill="#ffffff" opacity="0.95" />
          <circle cx="100" cy="45" r="35" fill="#ffffff" opacity="0.95" />
          <circle cx="130" cy="55" r="25" fill="#ffffff" opacity="0.95" />
          <circle cx="230" cy="40" r="30" fill="#ffffff" opacity="0.9" />
          <circle cx="265" cy="45" r="38" fill="#ffffff" opacity="0.9" />
          <circle cx="295" cy="55" r="25" fill="#ffffff" opacity="0.9" />
          {/* Lush Green Hills */}
          <path d="M-20 180 Q80 90 180 140 T340 120 L340 180 Z" fill="#16a34a" />
          <path d="M60 180 Q160 110 260 130 T360 180 Z" fill="#22c55e" />
          <path d="M-10 180 Q90 130 190 160 T350 180 Z" fill="#15803d" />
          {/* Wind particles & Cherry petals */}
          <circle cx="160" cy="75" r="3" fill="#fda4af" opacity="0.9" />
          <circle cx="190" cy="65" r="2.5" fill="#fda4af" opacity="0.8" />
          <circle cx="220" cy="80" r="3" fill="#f43f5e" opacity="0.85" />
          <circle cx="130" cy="90" r="2" fill="#fda4af" opacity="0.75" />
        </svg>
      )}

      {id === '3d_animation' && (
        <svg
          viewBox="0 0 320 180"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        >
          <defs>
            <linearGradient id="threed-bg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1e1b4b" />
              <stop offset="50%" stopColor="#312e81" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>
            <radialGradient id="sphere-glow" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#a5b4fc" />
              <stop offset="40%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#312e81" />
            </radialGradient>
            <radialGradient id="sphere-amber" cx="30%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#fde68a" />
              <stop offset="50%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#78350f" />
            </radialGradient>
          </defs>
          <rect width="320" height="180" fill="url(#threed-bg)" />
          {/* 3D Floor plane with grid */}
          <path d="M0 130 L320 130 L320 180 L0 180 Z" fill="#1e1e38" />
          {/* Large Shaded 3D Sphere */}
          <ellipse cx="140" cy="148" rx="42" ry="10" fill="#0a0a1a" opacity="0.6" />
          <circle cx="140" cy="95" r="45" fill="url(#sphere-glow)" />
          {/* Smaller Accent Sphere */}
          <ellipse cx="225" cy="144" rx="22" ry="6" fill="#0a0a1a" opacity="0.5" />
          <circle cx="225" cy="115" r="24" fill="url(#sphere-amber)" />
          {/* Glowing ring */}
          <ellipse cx="80" cy="65" rx="30" ry="12" fill="none" stroke="#38bdf8" strokeWidth="3" opacity="0.75" />
          <circle cx="80" cy="65" r="14" fill="#38bdf8" opacity="0.4" />
        </svg>
      )}

      {id === 'documentary' && (
        <svg
          viewBox="0 0 320 180"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        >
          <defs>
            <linearGradient id="doc-sunset" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#78350f" />
              <stop offset="40%" stopColor="#b45309" />
              <stop offset="70%" stopColor="#d97706" />
              <stop offset="100%" stopColor="#fef08a" />
            </linearGradient>
          </defs>
          <rect width="320" height="180" fill="url(#doc-sunset)" />
          {/* Giant Golden Sun */}
          <circle cx="160" cy="110" r="45" fill="#fffbeb" opacity="0.9" />
          {/* Savanna Horizon & Acacia Trees */}
          <rect x="0" y="140" width="320" height="40" fill="#1c1917" />
          {/* Acacia Tree Silhouette Left */}
          <path d="M50 140 L50 95 L30 85 L15 75 M50 95 L65 82 L80 75 M50 105 L40 92" stroke="#1c1917" strokeWidth="4" strokeLinecap="round" />
          <ellipse cx="30" cy="72" rx="25" ry="8" fill="#1c1917" />
          <ellipse cx="65" cy="70" rx="30" ry="9" fill="#1c1917" />
          {/* Acacia Tree Right */}
          <path d="M260 140 L260 100 L245 88 M260 100 L275 88" stroke="#1c1917" strokeWidth="3" strokeLinecap="round" />
          <ellipse cx="255" cy="82" rx="28" ry="7" fill="#1c1917" />
          {/* Birds in flight */}
          <path d="M120 45 Q125 40 130 45 Q135 40 140 45" stroke="#451a03" strokeWidth="2" fill="none" />
          <path d="M145 35 Q149 31 153 35 Q157 31 161 35" stroke="#451a03" strokeWidth="1.5" fill="none" />
        </svg>
      )}

      {id === 'vintage_vhs' && (
        <svg
          viewBox="0 0 320 180"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        >
          <defs>
            <linearGradient id="vhs-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#450a0a" />
              <stop offset="50%" stopColor="#78350f" />
              <stop offset="100%" stopColor="#1e1b4b" />
            </linearGradient>
            <pattern id="vhs-scanlines" width="100" height="4" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="100" y2="0" stroke="#000000" strokeWidth="1" opacity="0.4" />
            </pattern>
          </defs>
          <rect width="320" height="180" fill="url(#vhs-grad)" />
          {/* Chromatic aberration bands */}
          <rect x="0" y="40" width="320" height="8" fill="#06b6d4" opacity="0.3" />
          <rect x="0" y="44" width="320" height="8" fill="#f43f5e" opacity="0.3" />
          {/* Retro Sun & Palm Silhouette */}
          <circle cx="160" cy="90" r="40" fill="#f97316" />
          <path d="M160 140 L160 85 M160 85 Q130 75 110 85 M160 85 Q140 60 135 45 M160 85 Q175 60 185 45 M160 85 Q190 75 210 85" stroke="#18181b" strokeWidth="4" fill="none" />
          {/* Scanlines overlay */}
          <rect width="320" height="180" fill="url(#vhs-scanlines)" />
          {/* VHS Timestamp text */}
          <text x="18" y="30" fill="#22c55e" fontSize="11" fontFamily="monospace" fontWeight="bold">
            PLAY ▶ 00:04:22
          </text>
          <text x="18" y="165" fill="#facc15" fontSize="10" fontFamily="monospace" fontWeight="bold">
            SP - 1994.08.24
          </text>
        </svg>
      )}

      {id === 'synthwave' && (
        <svg
          viewBox="0 0 320 180"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        >
          <defs>
            <linearGradient id="synth-sky" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#1e0538" />
              <stop offset="50%" stopColor="#4a044e" />
              <stop offset="100%" stopColor="#831843" />
            </linearGradient>
            <linearGradient id="synth-sun" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="50%" stopColor="#f97316" />
              <stop offset="100%" stopColor="#ec4899" />
            </linearGradient>
          </defs>
          <rect width="320" height="180" fill="url(#synth-sky)" />
          {/* Segmented Neon Sun */}
          <g>
            <circle cx="160" cy="85" r="44" fill="url(#synth-sun)" />
            {/* Horizontal Sun Slices */}
            <rect x="110" y="70" width="100" height="2" fill="#4a044e" />
            <rect x="110" y="76" width="100" height="3" fill="#4a044e" />
            <rect x="110" y="84" width="100" height="4" fill="#4a044e" />
            <rect x="110" y="93" width="100" height="5" fill="#4a044e" />
            <rect x="110" y="103" width="100" height="6" fill="#4a044e" />
          </g>
          {/* Synth Mountains */}
          <path d="M0 120 L50 85 L100 120 L160 75 L220 120 L270 90 L320 120 L320 180 L0 180 Z" fill="#0f051d" />
          {/* Neon Perspective Wireframe Grid */}
          <path d="M0 120 L320 120 M0 128 L320 128 M0 140 L320 140 M0 156 L320 156 M0 178 L320 178" stroke="#d946ef" strokeWidth="1.2" opacity="0.8" />
          <path d="M160 120 L0 180 M160 120 L40 180 M160 120 L80 180 M160 120 L120 180 M160 120 L160 180 M160 120 L200 180 M160 120 L240 180 M160 120 L280 180 M160 120 L320 180" stroke="#06b6d4" strokeWidth="1.2" opacity="0.8" />
        </svg>
      )}

      {id === 'fantasy' && (
        <svg
          viewBox="0 0 320 180"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        >
          <defs>
            <linearGradient id="fantasy-sky" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0f172a" />
              <stop offset="50%" stopColor="#311042" />
              <stop offset="100%" stopColor="#1e1b4b" />
            </linearGradient>
            <radialGradient id="magic-moon" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#e0e7ff" />
              <stop offset="70%" stopColor="#818cf8" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#311042" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="320" height="180" fill="url(#fantasy-sky)" />
          {/* Glowing Arcane Moon */}
          <circle cx="230" cy="50" r="35" fill="url(#magic-moon)" />
          {/* Floating Mystic Castle Island */}
          <g>
            {/* Island bottom jagged rock */}
            <path d="M80 100 L180 100 L140 150 L110 135 Z" fill="#1e1b4b" />
            {/* Island grassy top */}
            <ellipse cx="130" cy="100" rx="55" ry="12" fill="#312e81" />
            {/* Castle Spires */}
            <rect x="110" y="70" width="16" height="30" fill="#4338ca" />
            <polygon points="118,50 106,70 130,70" fill="#6366f1" />
            <rect x="135" y="65" width="20" height="35" fill="#3730a3" />
            <polygon points="145,40 130,65 160,65" fill="#818cf8" />
          </g>
          {/* Magic motes & Runes */}
          <circle cx="85" cy="70" r="2.5" fill="#38bdf8" opacity="0.9" />
          <circle cx="175" cy="65" r="3" fill="#c084fc" opacity="0.9" />
          <circle cx="145" cy="120" r="2" fill="#a5f3fc" opacity="0.8" />
          <circle cx="60" cy="115" r="2.5" fill="#e0e7ff" opacity="0.7" />
          {/* Magic Beam */}
          <line x1="145" y1="40" x2="230" y2="50" stroke="#a5b4fc" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
        </svg>
      )}

      {id === 'minimal_motion' && (
        <svg
          viewBox="0 0 320 180"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        >
          <defs>
            <linearGradient id="motion-bg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0f172a" />
              <stop offset="100%" stopColor="#1e293b" />
            </linearGradient>
            <linearGradient id="pill-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#6366f1" />
            </linearGradient>
          </defs>
          <rect width="320" height="180" fill="url(#motion-bg)" />
          {/* Subtle Isometric Grid & Floating Shapes */}
          <circle cx="80" cy="90" r="35" fill="none" stroke="#334155" strokeWidth="2" strokeDasharray="4 4" />
          <circle cx="80" cy="90" r="20" fill="#0284c7" opacity="0.35" />
          {/* Floating Pill Graphic */}
          <rect x="130" y="65" width="110" height="36" rx="18" fill="url(#pill-grad)" opacity="0.9" />
          {/* Dynamic Motion Lines */}
          <line x1="140" y1="120" x2="260" y2="120" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" />
          <line x1="160" y1="132" x2="240" y2="132" stroke="#64748b" strokeWidth="2" strokeLinecap="round" />
          <circle cx="275" cy="120" r="5" fill="#38bdf8" />
        </svg>
      )}

      {/* Style Badge Overlay at Top Left */}
      <div className="absolute top-2 left-2 z-10">
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white border border-white/20 shadow-sm">
          {style.badge}
        </span>
      </div>

      {/* Lens & Lighting Tag overlay at Bottom */}
      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-2 z-10 flex items-center justify-between">
        <span className="text-[10px] text-slate-200 font-mono truncate max-w-[170px]">
          {style.lensType}
        </span>
        <div className="flex items-center gap-1">
          {style.colorPalette.slice(0, 3).map((color, i) => (
            <span
              key={i}
              className="w-2.5 h-2.5 rounded-full border border-black/40 shadow-xs"
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>
      </div>

      {/* Active Selection Glow Ring */}
      {isSelected && (
        <div className="absolute inset-0 border-2 border-sky-400 rounded-xl z-20 pointer-events-none shadow-[inset_0_0_12px_rgba(56,189,248,0.4)]" />
      )}
    </div>
  );
};
