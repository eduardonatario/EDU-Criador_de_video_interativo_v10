import React, { useState } from 'react';
import { 
  Code2, Copy, Download, Play, Eye, FileCode, Check, ExternalLink, Sparkles 
} from 'lucide-react';
import { VideoConfig, ExportMode } from '../types';
import { generateExportCode } from '../utils/htmlGenerator';
import { getThemeClasses } from '../utils/urlParser';

interface HtmlExporterProps {
  config: VideoConfig;
  showToast: (text: string, type?: 'success' | 'error' | 'info') => void;
  onGoToPlayer: () => void;
}

export const HtmlExporter: React.FC<HtmlExporterProps> = ({
  config,
  showToast,
  onGoToPlayer
}) => {
  const [exportMode, setExportMode] = useState<ExportMode>('standalone');
  const [copied, setCopied] = useState<boolean>(false);
  const [showLivePreview, setShowLivePreview] = useState<boolean>(true);

  const theme = getThemeClasses(config.accentTheme);
  const generatedCode = generateExportCode(config, exportMode);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(generatedCode);
      setCopied(true);
      showToast('Código HTML copiado para a área de transferência!', 'success');
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      showToast('Falha ao copiar código.', 'error');
    }
  };

  const handleDownloadHtml = () => {
    const filename = `${config.title ? config.title.toLowerCase().replace(/[^a-z0-9]/g, '-') : 'video-player'}.html`;
    const blob = new Blob([generatedCode], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast(`Arquivo "${filename}" baixado com sucesso!`, 'success');
  };

  return (
    <div className="w-full py-8 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* ACTIONS & EXPORT HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90 p-6 rounded-2xl border border-slate-800 backdrop-blur-md shadow-xl">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse"></span>
              <span className="text-xs font-bold uppercase tracking-widest text-slate-400 font-mono">
                HTML_EXPORT_ENGINE
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-1">
              Exportar Player HTML
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Pronto para incorporar em qualquer site. Clique para copiar o código ou baixar o arquivo .HTML.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={handleCopyCode}
              className="flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-bold bg-slate-100 text-slate-950 hover:bg-white active:scale-95 transition shadow-lg shadow-white/10"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Código Copiado!' : 'Copiar Código'}</span>
            </button>

            <button
              onClick={handleDownloadHtml}
              className="flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-500 active:scale-95 transition shadow-lg shadow-indigo-600/20"
            >
              <Download className="w-4 h-4" />
              <span>Baixar .HTML</span>
            </button>
          </div>
        </div>

        {/* EXPORT MODE SELECTOR */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => setExportMode('standalone')}
            className={`p-5 rounded-2xl border text-left transition flex flex-col justify-between ${
              exportMode === 'standalone'
                ? `${theme.border} bg-slate-900 shadow-xl`
                : 'border-slate-800 bg-slate-900/40 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <FileCode className={`w-6 h-6 ${exportMode === 'standalone' ? theme.text : 'text-slate-400'}`} />
              <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                .HTML Completo
              </span>
            </div>
            <div>
              <span className="text-sm font-bold text-white block">Página HTML Autônoma</span>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Código HTML5 + CSS + JS 100% autossuficiente e estilizado. Pronto para salvar e rodar em qualquer lugar.
              </p>
            </div>
          </button>

          <button
            onClick={() => setExportMode('embed')}
            className={`p-5 rounded-2xl border text-left transition flex flex-col justify-between ${
              exportMode === 'embed'
                ? `${theme.border} bg-slate-900 shadow-xl`
                : 'border-slate-800 bg-slate-900/40 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <Code2 className={`w-6 h-6 ${exportMode === 'embed' ? theme.text : 'text-slate-400'}`} />
              <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                &lt;iframe&gt; Embed
              </span>
            </div>
            <div>
              <span className="text-sm font-bold text-white block">Código de Incorporação</span>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Snippet leve de embed responsivo ideal para colar em WordPress, Webflow, Notion ou blogs.
              </p>
            </div>
          </button>

          <button
            onClick={() => setExportMode('minimal')}
            className={`p-5 rounded-2xl border text-left transition flex flex-col justify-between ${
              exportMode === 'minimal'
                ? `${theme.border} bg-slate-900 shadow-xl`
                : 'border-slate-800 bg-slate-900/40 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <Play className={`w-6 h-6 ${exportMode === 'minimal' ? theme.text : 'text-slate-400'}`} />
              <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                &lt;video&gt; Tag
              </span>
            </div>
            <div>
              <span className="text-sm font-bold text-white block">Tag HTML5 Mínima</span>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Elemento de vídeo limpo sem folhas de estilo externas, perfeito para desenvolvedores.
              </p>
            </div>
          </button>
        </div>

        {/* CODE DISPLAY ACTION BAR (HIDDEN RAW TEXTFIELD) */}
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 overflow-hidden shadow-xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-sm font-bold text-white block">
                Código HTML do Player Pronto ({exportMode === 'standalone' ? 'HTML Completo' : exportMode === 'embed' ? 'Iframe Embed' : 'Tag Video'})
              </span>
              <p className="text-xs text-slate-400 mt-0.5">
                O código de exportação foi gerado com todas as interações e estilos.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              onClick={() => setShowLivePreview(!showLivePreview)}
              className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                showLivePreview ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30' : 'bg-slate-800 text-slate-300 border border-slate-700'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{showLivePreview ? 'Ocultar Teste Ao Vivo' : 'Testar HTML Ao Vivo'}</span>
            </button>

            <button
              onClick={handleCopyCode}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-950 hover:bg-white active:scale-95 transition shadow-md"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copiado!' : 'Copiar Código'}</span>
            </button>

            <button
              onClick={handleDownloadHtml}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-500 active:scale-95 transition shadow-md shadow-indigo-600/20"
            >
              <Download className="w-4 h-4" />
              <span>Baixar .HTML</span>
            </button>
          </div>
        </div>

        {/* LIVE SANDBOX IFRAME PREVIEW */}
        {showLivePreview && (
          <div className="bg-slate-900/70 p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>Pré-visualização do HTML Gerado (Sandbox Isolado)</span>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                Simulação de Execução Standalone
              </span>
            </div>

            <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950 p-2">
              <iframe
                title="Test HTML Output"
                srcDoc={generatedCode}
                className="w-full h-[450px] rounded-lg border-0 bg-slate-950"
                sandbox="allow-scripts allow-same-origin allow-popups"
              />
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
