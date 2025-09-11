import React from 'react';
import { Play, ExternalLink } from 'lucide-react';

interface VideoEmbedProps {
  title: string;
  description: string;
}

const VideoEmbed: React.FC<VideoEmbedProps> = ({ title, description }) => (
  <div className="relative mb-8">
    <div className="text-slate-600 cut-corners-lg bg-noise-dark border-2 border-slate-600 shadow-industrial">
      <div className="aspect-video bg-slate-800 flex items-center justify-center relative overflow-hidden">
        {/* Video placeholder */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800"></div>
        <div className="relative z-10 text-center">
          <div className="w-16 h-16 bg-cyan-400 bg-opacity-20 rounded-full flex items-center justify-center mb-4 mx-auto border-2 border-cyan-400 border-opacity-30">
            <Play className="w-8 h-8 text-cyan-400 ml-1" />
          </div>
          <h4 className="text-lg font-mono font-bold text-white mb-2">{title}</h4>
          <p className="text-slate-400 font-mono text-sm max-w-md mx-auto">{description}</p>
        </div>
        {/* Orbital particles effect */}
        <div className="absolute inset-0 opacity-20">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-cyan-400 rounded-full animate-pulse"
              style={{
                left: `${20 + i * 15}%`,
                top: `${30 + (i % 2) * 40}%`,
                animationDelay: `${i * 0.5}s`,
                animationDuration: '2s'
              }}
            />
          ))}
        </div>
      </div>
      <div className="p-4 border-t border-slate-600">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-slate-400 font-mono text-xs">VIDEO EMBED READY</span>
          </div>
          <button className="text-cyan-400 hover:text-cyan-300 transition-colors font-mono text-xs flex items-center gap-1">
            <ExternalLink className="w-3 h-3" />
            FULLSCREEN
          </button>
        </div>
      </div>
    </div>
  </div>
);

export default VideoEmbed;
