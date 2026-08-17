import React, { useState } from 'react';
import { 
  Link, Image as ImageIcon, Sparkles, Sliders, Palette, Layout, 
  Save, Play, Code2, Trash2, Check, RefreshCw, FileVideo, HelpCircle, Clock
} from 'lucide-react';
import { VideoConfig, PlayerTheme, AspectRatio } from '../types';
import { PRESET_VIDEOS } from '../data/presetVideos';
import { getThemeClasses } from '../utils/urlParser';
import { secondsToTimecode, timecodeToSeconds } from '../utils/timecode';

interface AdminPanelProps {
  config: VideoConfig;
  onChangeConfig: (newConfig: VideoConfig) => void;
  onSaveToLibrary: (config: VideoConfig) => void;
  savedConfigs: VideoConfig[];
  onDeleteSavedConfig: (id: string) => void;
  onGoToPlayer: () => void;
  onGoToExport: () => void;
  showToast: (text: string, type?: 'success' | 'error' | 'info') => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  config,
  onChangeConfig,
  onSaveToLibrary,
  savedConfigs,
  onDeleteSavedConfig,
  onGoToPlayer,
  onGoToExport,
  showToast
}) => {
  const [formData, setFormData] = useState<VideoConfig>({ ...config });
  const theme = getThemeClasses(formData.accentTheme);

  const handleFieldChange = <K extends keyof VideoConfig>(field: K, value: VideoConfig[K]) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    onChangeConfig(updated);
  };

  const handleApplyPreset = (presetId: string) => {
    const preset = PRESET_VIDEOS.find((p) => p.id === presetId);
    if (!preset) return;

    const updated: VideoConfig = {
      ...formData,
      title: preset.title,
      description: preset.description,
      url: preset.url,
      posterUrl: preset.posterUrl
    };
    setFormData(updated);
    onChangeConfig(updated);
    showToast(`Exemplo "${preset.title}" carregado!`, 'success');
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.url.trim()) {
      showToast('Insira uma URL de vídeo válida!', 'error');
      return;
    }
    onSaveToLibrary(formData);
    showToast('Configuração de vídeo salva com sucesso!', 'success');
  };

  const themesList: { id: PlayerTheme; label: string; bg: string }[] = [
    { id: 'indigo', label: 'Índigo', bg: 'bg-indigo-600' },
    { id: 'emerald', label: 'Esmeralda', bg: 'bg-emerald-600' },
    { id: 'crimson', label: 'Carmim', bg: 'bg-rose-600' },
    { id: 'amber', label: 'Âmbar', bg: 'bg-amber-600' },
    { id: 'violet', label: 'Violeta', bg: 'bg-violet-600' },
    { id: 'cyan', label: 'Ciano', bg: 'bg-cyan-600' },
    { id: 'slate', label: 'Grafite', bg: 'bg-slate-700' }
  ];

  const aspectRatiosList: AspectRatio[] = ['16:9', '4:3', '1:1', '9:16'];

  return (
    <div className="w-full py-8 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header Admin Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 p-6 rounded-2xl border border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
              <span className="text-xs font-bold uppercase tracking-widest text-slate-500">
                ADMIN_CONFIGURATION
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight mt-1">
              Configuração do Player
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Gerencie a URL de origem, proporções, visual e parâmetros de exportação do player web.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onGoToPlayer}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-950 hover:bg-white transition shadow-lg shadow-white/5"
            >
              <Play className="w-4 h-4 fill-slate-950" />
              Testar Player
            </button>
            <button
              onClick={onGoToExport}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-500 transition shadow-lg shadow-indigo-600/20"
            >
              <Code2 className="w-4 h-4" />
              Exportar HTML
            </button>
          </div>
        </div>

        {/* PRESETS QUICK LOADER */}
        <div className="bg-slate-900/50 p-5 rounded-2xl border border-slate-800/80 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-semibold text-white">
              <FileVideo className="w-4 h-4 text-indigo-400" />
              <span>Vídeos de Exemplo Rápidos</span>
            </div>
            <span className="text-xs text-slate-400">Clique para carregar</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {PRESET_VIDEOS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => handleApplyPreset(preset.id)}
                className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-indigo-500/50 text-left transition group"
              >
                <img
                  src={preset.posterUrl}
                  alt={preset.title}
                  className="w-12 h-12 rounded-lg object-cover bg-slate-950 shrink-0"
                />
                <div className="overflow-hidden">
                  <span className="text-xs font-semibold text-slate-200 group-hover:text-white truncate block">
                    {preset.title}
                  </span>
                  <span className="text-[10px] text-slate-400 uppercase font-mono mt-0.5 block">
                    {preset.type.toUpperCase()}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* MAIN FORM */}
        <form onSubmit={handleSaveConfig} className="space-y-6">
          
          {/* SECTION 1: VIDEO SOURCE & METADATA */}
          <div className="bg-slate-900/70 p-6 rounded-2xl border border-slate-800 space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
              <Link className="w-5 h-5 text-indigo-400" />
              <h2 className="text-base font-bold text-white">1. Origem do Vídeo & Informações</h2>
            </div>

            <div className="space-y-4">
              {/* Video URL Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  URL do Vídeo (MP4, WebM, YouTube, Vimeo) <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type="url"
                    required
                    value={formData.url}
                    onChange={(e) => handleFieldChange('url', e.target.value)}
                    placeholder="Ex: https://commondatastorage.googleapis.com/.../BigBuckBunny.mp4"
                    className="w-full bg-slate-950 text-white placeholder-slate-500 text-sm rounded-xl px-4 py-3 pl-10 border border-slate-700/80 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-mono"
                  />
                  <Link className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                </div>
                <p className="text-[11px] text-slate-400 mt-1.5">
                  Suporta arquivos diretos (.mp4, .webm), links do YouTube (youtube.com/watch?v=...) ou Vimeo.
                </p>
              </div>

              {/* Poster Image URL */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  URL da Imagem da Capa (Poster)
                </label>
                <div className="relative">
                  <input
                    type="url"
                    value={formData.posterUrl}
                    onChange={(e) => handleFieldChange('posterUrl', e.target.value)}
                    placeholder="Ex: https://images.unsplash.com/photo-1534447677768..."
                    className="w-full bg-slate-950 text-white placeholder-slate-500 text-sm rounded-xl px-4 py-3 pl-10 border border-slate-700/80 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-mono"
                  />
                  <ImageIcon className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                </div>
              </div>

              {/* Title & Description Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Título do Vídeo
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleFieldChange('title', e.target.value)}
                    placeholder="Ex: Apresentação de Produto 2026"
                    className="w-full bg-slate-950 text-white placeholder-slate-500 text-sm rounded-xl px-4 py-3 border border-slate-700/80 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Descrição do Vídeo
                  </label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => handleFieldChange('description', e.target.value)}
                    placeholder="Ex: Vídeo explicativo sobre nossa nova plataforma."
                    className="w-full bg-slate-950 text-white placeholder-slate-500 text-sm rounded-xl px-4 py-3 border border-slate-700/80 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: PLAYER BEHAVIOR & CONTROLS */}
          <div className="bg-slate-900/70 p-6 rounded-2xl border border-slate-800 space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
              <Sliders className="w-5 h-5 text-indigo-400" />
              <h2 className="text-base font-bold text-white">2. Comportamento & Controles do Player</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              
              {/* Autoplay Toggle */}
              <label className="flex items-center justify-between p-4 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer hover:border-slate-700 transition">
                <div>
                  <span className="text-xs font-bold text-white block">Autoplay</span>
                  <span className="text-[10px] text-slate-400">Reproduzir ao carregar</span>
                </div>
                <input
                  type="checkbox"
                  checked={formData.autoplay}
                  onChange={(e) => handleFieldChange('autoplay', e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 bg-slate-900 border-slate-700"
                />
              </label>

              {/* Muted Toggle */}
              <label className="flex items-center justify-between p-4 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer hover:border-slate-700 transition">
                <div>
                  <span className="text-xs font-bold text-white block">Iniciar Mutado</span>
                  <span className="text-[10px] text-slate-400">Necessário p/ autoplay</span>
                </div>
                <input
                  type="checkbox"
                  checked={formData.muted}
                  onChange={(e) => handleFieldChange('muted', e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 bg-slate-900 border-slate-700"
                />
              </label>

              {/* Loop Toggle */}
              <label className="flex items-center justify-between p-4 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer hover:border-slate-700 transition">
                <div>
                  <span className="text-xs font-bold text-white block">Looping</span>
                  <span className="text-[10px] text-slate-400">Repetir automaticamente</span>
                </div>
                <input
                  type="checkbox"
                  checked={formData.loop}
                  onChange={(e) => handleFieldChange('loop', e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 bg-slate-900 border-slate-700"
                />
              </label>

              {/* Show Custom Controls Toggle */}
              <label className="flex items-center justify-between p-4 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer hover:border-slate-700 transition">
                <div>
                  <span className="text-xs font-bold text-white block">Barra de Controles</span>
                  <span className="text-[10px] text-slate-400">Exibir linha do tempo</span>
                </div>
                <input
                  type="checkbox"
                  checked={formData.showControls}
                  onChange={(e) => handleFieldChange('showControls', e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 bg-slate-900 border-slate-700"
                />
              </label>

            </div>
          </div>

          {/* SECTION 3: THEMES & DIMENSIONS */}
          <div className="bg-slate-900/70 p-6 rounded-2xl border border-slate-800 space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
              <Palette className="w-5 h-5 text-indigo-400" />
              <h2 className="text-base font-bold text-white">3. Estilo Visual & Dimensões</h2>
            </div>

            <div className="space-y-5">
              {/* Theme Picker */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Cor de Destaque do Player (Tema)
                </label>
                <div className="flex flex-wrap gap-2">
                  {themesList.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => handleFieldChange('accentTheme', t.id)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border transition ${
                        formData.accentTheme === t.id
                          ? 'bg-slate-800 border-white text-white font-bold'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <span className={`w-3.5 h-3.5 rounded-full ${t.bg}`}></span>
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Aspect Ratio & Max Width */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Proporção da Tela (Aspect Ratio)
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {aspectRatiosList.map((ratio) => (
                      <button
                        key={ratio}
                        type="button"
                        onClick={() => handleFieldChange('aspectRatio', ratio)}
                        className={`py-2 rounded-xl text-xs font-semibold border transition ${
                          formData.aspectRatio === ratio
                            ? `${theme.bg} text-white border-transparent`
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {ratio}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Largura Máxima (Max Width)
                  </label>
                  <select
                    value={formData.maxWidth}
                    onChange={(e) => handleFieldChange('maxWidth', e.target.value)}
                    className="w-full bg-slate-950 text-white text-sm rounded-xl px-4 py-3 border border-slate-700/80 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="100%">100% (Responsivo Total)</option>
                    <option value="960px">960px (Grande)</option>
                    <option value="800px">800px (Padrão)</option>
                    <option value="640px">640px (Médio)</option>
                    <option value="480px">480px (Compacto)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 4: CALL TO ACTION OVERLAY (CTA) */}
          <div className="bg-slate-900/70 p-6 rounded-2xl border border-slate-800 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <h2 className="text-base font-bold text-white">4. Botão de Ação / Overlay (CTA)</h2>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <span className="text-xs font-semibold text-slate-300">Ativar Botão CTA</span>
                <input
                  type="checkbox"
                  checked={formData.ctaEnabled}
                  onChange={(e) => handleFieldChange('ctaEnabled', e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 bg-slate-900 border-slate-700"
                />
              </label>
            </div>

            {formData.ctaEnabled && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Texto do Botão
                  </label>
                  <input
                    type="text"
                    value={formData.ctaText}
                    onChange={(e) => handleFieldChange('ctaText', e.target.value)}
                    placeholder="Ex: Saiba Mais, Comprar Agora, Cadastre-se"
                    className="w-full bg-slate-950 text-white text-sm rounded-xl px-4 py-3 border border-slate-700/80 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Link de Destino
                  </label>
                  <input
                    type="url"
                    value={formData.ctaUrl}
                    onChange={(e) => handleFieldChange('ctaUrl', e.target.value)}
                    placeholder="Ex: https://seusite.com/checkout"
                    className="w-full bg-slate-950 text-white text-sm rounded-xl px-4 py-3 border border-slate-700/80 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
              </div>
            )}
          </div>

          {/* SECTION 5: INTERACTIVE QUESTIONS & DECISION OVERLAYS (A, B, C, D) */}
          <div className="bg-slate-900/70 p-6 rounded-2xl border border-slate-800 space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-3 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-indigo-400" />
                <div>
                  <h2 className="text-base font-bold text-white">5. Perguntas & Decisões Interativas (Opções A, B, C e D)</h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Configure os pontos do vídeo (Time Code) onde o vídeo irá pausar e exibir as alternativas A, B, C e D sobre a tela.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  const currentQuestions = formData.interactiveQuestions || [];
                  const nextTimestamp = (currentQuestions.length + 1) * 5;
                  const newQ = {
                    id: `q_${Date.now()}`,
                    timestamp: nextTimestamp,
                    title: 'O que você prefere fazer agora?',
                    subtitle: 'Selecione uma das 4 opções para o vídeo continuar:',
                    options: [
                      { id: 'A' as const, label: 'Opção A: Limpar com água e sabão', feedbackText: 'Você escolheu a alternativa A!' },
                      { id: 'B' as const, label: 'Opção B: Expor o machucado ao sol', feedbackText: 'Você escolheu a alternativa B!' },
                      { id: 'C' as const, label: 'Opção C: Passar pano sujo', feedbackText: 'Você escolheu a alternativa C!' },
                      { id: 'D' as const, label: 'Opção D: Passar Manteiga', feedbackText: 'Você escolheu a alternativa D!' }
                    ] as [any, any, any, any]
                  };
                  const updated = [...currentQuestions, newQ];
                  handleFieldChange('interactiveQuestions', updated);
                  showToast(`Ponto interativo adicionado no time code ${secondsToTimecode(nextTimestamp)}!`, 'success');
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-500 transition shadow-lg shadow-indigo-600/20 shrink-0"
              >
                + Adicionar Ponto Interativo
              </button>
            </div>

            {(!formData.interactiveQuestions || formData.interactiveQuestions.length === 0) ? (
              <div className="text-center py-8 px-4 rounded-xl border border-dashed border-slate-800 bg-slate-950/40 text-slate-400 space-y-2">
                <HelpCircle className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-xs font-medium">Nenhuma pergunta interativa cadastrada para este vídeo.</p>
                <p className="text-[11px] text-slate-500">Clique no botão acima para criar o primeiro ponto de decisão A, B, C e D!</p>
              </div>
            ) : (
              <div className="space-y-6">
                {formData.interactiveQuestions.map((q, qIndex) => (
                  <div key={q.id} className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
                    
                    {/* Question Header & Time Code Controls */}
                    <div className="flex items-center justify-between flex-wrap gap-3 pb-3 border-b border-slate-800/80">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 font-mono font-bold text-xs flex items-center justify-center border border-indigo-500/30">
                          #{qIndex + 1}
                        </span>

                        <span className="text-xs font-bold text-slate-200">
                          Time Code da Pausa:
                        </span>

                        {/* Formatted Time Code Input (MM:SS) */}
                        <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-700 px-3 py-1.5 rounded-lg">
                          <Clock className="w-3.5 h-3.5 text-indigo-400" />
                          <input
                            type="text"
                            placeholder="00:05"
                            value={secondsToTimecode(q.timestamp)}
                            onChange={(e) => {
                              const sec = timecodeToSeconds(e.target.value);
                              const updated = [...(formData.interactiveQuestions || [])];
                              updated[qIndex] = { ...updated[qIndex], timestamp: sec };
                              handleFieldChange('interactiveQuestions', updated);
                            }}
                            className="w-16 bg-transparent text-xs font-mono font-bold text-indigo-300 focus:outline-none"
                          />
                          <span className="text-[10px] text-slate-400 font-mono uppercase">min:seg</span>
                        </div>

                        {/* Raw Seconds Input */}
                        <div className="flex items-center gap-1 bg-slate-900/60 border border-slate-800 px-2.5 py-1.5 rounded-lg text-slate-400 text-[11px]">
                          <span>(ou</span>
                          <input
                            type="number"
                            min={0}
                            step={1}
                            value={q.timestamp}
                            onChange={(e) => {
                              const val = Math.max(0, parseInt(e.target.value) || 0);
                              const updated = [...(formData.interactiveQuestions || [])];
                              updated[qIndex] = { ...updated[qIndex], timestamp: val };
                              handleFieldChange('interactiveQuestions', updated);
                            }}
                            className="w-12 bg-transparent text-xs font-mono font-bold text-slate-200 focus:outline-none text-center"
                          />
                          <span>seg)</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          const updated = (formData.interactiveQuestions || []).filter((_, i) => i !== qIndex);
                          handleFieldChange('interactiveQuestions', updated);
                          showToast('Ponto interativo removido', 'info');
                        }}
                        className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-900 rounded-lg transition ml-auto"
                        title="Remover Pergunta"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Question Title & Subtitle Inputs */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                          Pergunta / Título na Tela
                        </label>
                        <input
                          type="text"
                          value={q.title}
                          onChange={(e) => {
                            const updated = [...(formData.interactiveQuestions || [])];
                            updated[qIndex] = { ...updated[qIndex], title: e.target.value };
                            handleFieldChange('interactiveQuestions', updated);
                          }}
                          placeholder="Ex: O que você prefere fazer agora?"
                          className="w-full bg-slate-900 text-white text-xs rounded-lg px-3.5 py-2.5 border border-slate-800 focus:outline-none focus:border-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                          Subtítulo Instrucional (Opcional)
                        </label>
                        <input
                          type="text"
                          value={q.subtitle || ''}
                          onChange={(e) => {
                            const updated = [...(formData.interactiveQuestions || [])];
                            updated[qIndex] = { ...updated[qIndex], subtitle: e.target.value };
                            handleFieldChange('interactiveQuestions', updated);
                          }}
                          placeholder="Ex: Escolha uma das 4 opções para o vídeo continuar"
                          className="w-full bg-slate-900 text-white text-xs rounded-lg px-3.5 py-2.5 border border-slate-800 focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>

                    {/* 4 Options Grid (A, B, C, D) */}
                    <div>
                      <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                        <label className="block text-[11px] font-semibold text-indigo-300 uppercase tracking-wider">
                          4. Selecione a opção correta (A, B, C e D):
                        </label>
                        <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                          Marque qual das alternativas é a correta
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                        {q.options.map((opt, optIndex) => (
                          <div
                            key={opt.id}
                            className={`p-3.5 rounded-xl transition border space-y-2.5 ${
                              opt.isCorrect
                                ? 'bg-emerald-950/30 border-emerald-500/70 ring-1 ring-emerald-500/30'
                                : 'bg-slate-900 border-slate-800'
                            }`}
                          >
                            {/* Option Label Row & IsCorrect Radio */}
                            <div className="flex items-center gap-2">
                              <label className="flex items-center gap-1.5 cursor-pointer shrink-0">
                                <input
                                  type="radio"
                                  name={`correct_radio_${q.id}`}
                                  checked={!!opt.isCorrect}
                                  onChange={() => {
                                    const updatedQuestions = [...(formData.interactiveQuestions || [])];
                                    const newOptions = updatedQuestions[qIndex].options.map((o) => ({
                                      ...o,
                                      isCorrect: o.id === opt.id
                                    })) as [any, any, any, any];
                                    updatedQuestions[qIndex] = { ...updatedQuestions[qIndex], options: newOptions };
                                    handleFieldChange('interactiveQuestions', updatedQuestions);
                                  }}
                                  className="w-3.5 h-3.5 text-emerald-500 focus:ring-emerald-500 bg-slate-900 border-slate-700 cursor-pointer"
                                />
                                <span className={`w-7 h-7 rounded-lg font-mono font-bold text-xs flex items-center justify-center shrink-0 border transition ${
                                  opt.isCorrect
                                    ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-extrabold'
                                    : 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30'
                                }`}>
                                  {opt.id}
                                </span>
                              </label>

                              <input
                                type="text"
                                value={opt.label}
                                onChange={(e) => {
                                  const updatedQuestions = [...(formData.interactiveQuestions || [])];
                                  const newOptions = [...updatedQuestions[qIndex].options] as [any, any, any, any];
                                  newOptions[optIndex] = { ...newOptions[optIndex], label: e.target.value };
                                  updatedQuestions[qIndex] = { ...updatedQuestions[qIndex], options: newOptions };
                                  handleFieldChange('interactiveQuestions', updatedQuestions);
                                }}
                                placeholder={`Texto da Alternativa ${opt.id}`}
                                className="flex-1 bg-slate-950 text-white text-xs rounded-lg px-3 py-2 border border-slate-800 focus:outline-none focus:border-indigo-500 font-medium"
                              />

                              {opt.isCorrect && (
                                <span className="text-[9px] font-bold text-emerald-300 bg-emerald-500/20 px-1.5 py-0.5 rounded uppercase border border-emerald-500/30 shrink-0">
                                  Correta
                                </span>
                              )}
                            </div>

                            {/* Option Extra Controls (Jump To Time Code) */}
                            <div className="flex items-center justify-between gap-2 pt-1 text-[11px] text-slate-400 font-mono border-t border-slate-800/60">
                              <span className="shrink-0 text-slate-500">Pular vídeo para (Time Code):</span>
                              <div className="flex items-center gap-1.5">
                                <input
                                  type="text"
                                  placeholder="00:00"
                                  value={opt.jumpToTime !== undefined ? secondsToTimecode(opt.jumpToTime) : ''}
                                  onChange={(e) => {
                                    const updatedQuestions = [...(formData.interactiveQuestions || [])];
                                    const newOptions = [...updatedQuestions[qIndex].options] as [any, any, any, any];
                                    const valStr = e.target.value.trim();
                                    const val = valStr === '' ? undefined : timecodeToSeconds(valStr);
                                    newOptions[optIndex] = { ...newOptions[optIndex], jumpToTime: val };
                                    updatedQuestions[qIndex] = { ...updatedQuestions[qIndex], options: newOptions };
                                    handleFieldChange('interactiveQuestions', updatedQuestions);
                                  }}
                                  className="w-16 bg-slate-950 text-indigo-300 text-xs rounded px-2 py-1 border border-slate-800 focus:outline-none text-center"
                                />
                                {opt.jumpToTime !== undefined && (
                                  <span className="text-[10px] text-slate-500">({opt.jumpToTime}s)</span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SAVE BUTTON ROW */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <button
              type="submit"
              className={`w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold text-white ${theme.bg} hover:opacity-90 transition shadow-xl`}
            >
              <Save className="w-4 h-4" />
              Salvar Configuração de Vídeo
            </button>

            <span className="text-xs text-slate-400">
              As alterações são refletidas instantaneamente no Player e no Exportador HTML.
            </span>
          </div>

        </form>

        {/* SAVED LIBRARY LIST */}
        {savedConfigs.length > 0 && (
          <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <FileVideo className="w-4 h-4 text-indigo-400" />
              <span>Vídeos Salvos na Sua Biblioteca ({savedConfigs.length})</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {savedConfigs.map((saved) => (
                <div
                  key={saved.id}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition"
                >
                  <div
                    className="cursor-pointer overflow-hidden flex-1"
                    onClick={() => {
                      setFormData(saved);
                      onChangeConfig(saved);
                      showToast(`Carregado "${saved.title || 'Vídeo'}"`, 'info');
                    }}
                  >
                    <span className="text-xs font-semibold text-white block truncate">
                      {saved.title || 'Vídeo sem título'}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono truncate block mt-0.5">
                      {saved.url}
                    </span>
                  </div>

                  <button
                    onClick={() => onDeleteSavedConfig(saved.id)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-900 rounded-lg transition ml-2 shrink-0"
                    title="Excluir"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
