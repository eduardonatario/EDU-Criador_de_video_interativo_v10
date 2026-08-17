import React from 'react';
import { Play, Settings, Code2, Video, Sparkles } from 'lucide-react';
import { VideoConfig } from '../types';
import { getThemeClasses } from '../utils/urlParser';

export type ActiveTab = 'player' | 'admin' | 'export';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  config: VideoConfig;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, config }) => {
  const theme = getThemeClasses(config.accentTheme);

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex items-center justify-between h-full">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('player')}>
            <div className={`w-8 h-8 rounded-lg ${theme.bg} flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white`}>
              <Video className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-white tracking-tight">STREAM<span className="text-indigo-400 font-semibold">PLAYER</span></span>
                <span className="text-[10px] font-mono font-semibold uppercase tracking-widest bg-slate-800 text-indigo-400 border border-slate-700/80 px-2 py-0.5 rounded">
                  PRO
                </span>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <nav className="flex items-center gap-1 sm:gap-2 bg-slate-950/80 p-1.5 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('player')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'player'
                  ? `${theme.bg} text-white shadow-md font-semibold`
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Play className="w-3.5 h-3.5" />
              <span>Player</span>
            </button>

            <button
              onClick={() => setActiveTab('admin')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'admin'
                  ? `${theme.bg} text-white shadow-md font-semibold`
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Painel Admin</span>
            </button>

            <button
              onClick={() => setActiveTab('export')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'export'
                  ? `${theme.bg} text-white shadow-md font-semibold`
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Exportar</span> HTML
            </button>
          </nav>

          {/* Quick Info Badge */}
          <div className="hidden lg:flex items-center gap-2 text-xs text-slate-400 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-mono text-[11px] text-slate-300 truncate max-w-[160px]" title={config.title || config.url}>
              {config.title || 'ONLINE'}
            </span>
          </div>

        </div>
      </div>
    </header>
  );
};
