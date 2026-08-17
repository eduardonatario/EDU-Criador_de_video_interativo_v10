import React, { useState, useRef, useEffect } from 'react';
import { 
  Play, Pause, Volume2, VolumeX, Maximize, RotateCcw, 
  Settings, ExternalLink, Sparkles, PictureInPicture2, Gauge, HelpCircle, CheckCircle2, RefreshCw
} from 'lucide-react';
import { VideoConfig, InteractiveQuestion, InteractiveOption } from '../types';
import { parseVideoUrl, getThemeClasses } from '../utils/urlParser';
import { InteractiveOverlay } from './InteractiveOverlay';

interface VideoPlayerProps {
  config: VideoConfig;
  onOpenAdmin: () => void;
  onOpenExport: () => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ config, onOpenAdmin, onOpenExport }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(config.muted);
  const [volume, setVolume] = useState<number>(1);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [hasStarted, setHasStarted] = useState<boolean>(false);
  const [isEnded, setIsEnded] = useState<boolean>(false);
  const [hasVideoError, setHasVideoError] = useState<boolean>(false);

  // Interactive questions state
  const [activeQuestion, setActiveQuestion] = useState<InteractiveQuestion | null>(null);
  const [answeredQuestionIds, setAnsweredQuestionIds] = useState<Set<string>>(new Set());
  const [userChoices, setUserChoices] = useState<Array<{ questionId: string; questionTitle: string; selectedOption: InteractiveOption }>>([]);

  const parsed = parseVideoUrl(config.url);
  const theme = getThemeClasses(config.accentTheme);

  // Sync config options when config changes
  useEffect(() => {
    setIsMuted(config.muted);
    setHasStarted(false);
    setIsPlaying(false);
    setIsEnded(false);
    setHasVideoError(false);
    setCurrentTime(0);
    setActiveQuestion(null);
    setAnsweredQuestionIds(new Set());
    setUserChoices([]);
    if (videoRef.current) {
      videoRef.current.load();
    }
  }, [config.url, config.muted, config.autoplay, config.interactiveQuestions]);

  const formatTime = (timeInSeconds: number) => {
    if (isNaN(timeInSeconds)) return '00:00';
    const mins = Math.floor(timeInSeconds / 60);
    const secs = Math.floor(timeInSeconds % 60);
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (activeQuestion) return; // Wait for user to select an option

    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play().catch(err => console.warn('Autoplay prevented:', err));
      setHasStarted(true);
      setIsEnded(false);
    }
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const time = videoRef.current.currentTime;
    setCurrentTime(time);

    // Check for interactive question breakpoints
    const questions = config.interactiveQuestions || [];
    for (const q of questions) {
      if (
        !answeredQuestionIds.has(q.id) &&
        time >= q.timestamp &&
        time < q.timestamp + 1.2 &&
        !activeQuestion
      ) {
        videoRef.current.pause();
        setIsPlaying(false);
        setActiveQuestion(q);
        break;
      }
    }
  };

  const handleSelectOption = (option: InteractiveOption) => {
    if (!activeQuestion) return;

    // Record answer
    setAnsweredQuestionIds((prev) => new Set(prev).add(activeQuestion.id));
    setUserChoices((prev) => [
      ...prev.filter((c) => c.questionId !== activeQuestion.id),
      { questionId: activeQuestion.id, questionTitle: activeQuestion.title, selectedOption: option }
    ]);

    setActiveQuestion(null);

    if (videoRef.current) {
      if (option.jumpToTime !== undefined && option.jumpToTime >= 0) {
        videoRef.current.currentTime = option.jumpToTime;
        setCurrentTime(option.jumpToTime);
      }
      videoRef.current.play().then(() => setIsPlaying(true)).catch(console.error);
    }
  };

  const handleResetInteractivity = () => {
    setAnsweredQuestionIds(new Set());
    setUserChoices([]);
    setActiveQuestion(null);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().then(() => setIsPlaying(true)).catch(console.error);
    }
  };

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    setDuration(videoRef.current.duration);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return;
    const seekTime = parseFloat(e.target.value);
    videoRef.current.currentTime = seekTime;
    setCurrentTime(seekTime);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return;
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    videoRef.current.volume = newVol;
    setIsMuted(newVol === 0);
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    const newMute = !isMuted;
    setIsMuted(newMute);
    videoRef.current.muted = newMute;
  };

  const changeSpeed = (speed: number) => {
    if (!videoRef.current) return;
    videoRef.current.playbackRate = speed;
    setPlaybackSpeed(speed);
    setShowSpeedMenu(false);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(err => console.error(err));
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(err => console.error(err));
      setIsFullscreen(false);
    }
  };

  const togglePip = async () => {
    if (!videoRef.current) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else if (document.pictureInPictureEnabled) {
        await videoRef.current.requestPictureInPicture();
      }
    } catch (err) {
      console.warn('PiP not available', err);
    }
  };

  const handleVideoEnded = () => {
    setIsPlaying(false);
    setIsEnded(true);
  };

  // Determine aspect ratio class
  const getAspectRatioClass = () => {
    switch (config.aspectRatio) {
      case '4:3':
        return 'aspect-[4/3]';
      case '1:1':
        return 'aspect-square';
      case '9:16':
        return 'aspect-[9/16] max-h-[650px] mx-auto';
      case '16:9':
      default:
        return 'aspect-video';
    }
  };

  const isYouTubeOrVimeo = parsed.type === 'youtube' || parsed.type === 'vimeo';
  const questionsList = config.interactiveQuestions || [];

  return (
    <div className="w-full py-8 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header Metadata Info */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/50 p-5 rounded-2xl border border-slate-800 backdrop-blur-md">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[10px] font-mono font-bold tracking-widest text-slate-400 uppercase">
                INTERACTIVE_VIDEO_SYSTEM
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {config.title || 'Vídeo Sem Título'}
            </h1>
            {config.description && (
              <p className="text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
                {config.description}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            <button
              onClick={onOpenAdmin}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white transition border border-slate-700"
            >
              <Settings className="w-3.5 h-3.5" />
              Editar Vídeo / Questões
            </button>
            <button
              onClick={onOpenExport}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-500 transition shadow-lg shadow-indigo-600/20"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Exportar HTML
            </button>
          </div>
        </div>

        {/* MAIN PLAYER STAGE */}
        <div
          style={{ maxWidth: config.maxWidth || '100%' }}
          className="mx-auto transition-all duration-300"
        >
          <div
            ref={containerRef}
            className={`relative rounded-2xl overflow-hidden bg-black shadow-2xl border border-slate-800 group ${getAspectRatioClass()}`}
          >
            {/* INTERACTIVE QUESTION OVERLAY */}
            {activeQuestion && (
              <InteractiveOverlay
                question={activeQuestion}
                onSelectOption={handleSelectOption}
                accentThemeHex={theme.hex}
              />
            )}

            {/* If Youtube or Vimeo embed */}
            {isYouTubeOrVimeo ? (
              <iframe
                src={`${parsed.embedUrl}${parsed.embedUrl.includes('?') ? '&' : '?'}autoplay=${config.autoplay ? 1 : 0}&muted=${config.muted ? 1 : 0}`}
                title={config.title || 'Vídeo Embed'}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              /* Standard HTML5 Video Player */
              <>
                <video
                  ref={videoRef}
                  src={config.url}
                  poster={config.posterUrl}
                  autoPlay={config.autoplay}
                  muted={config.muted}
                  loop={config.loop}
                  playsInline
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={handleLoadedMetadata}
                  onPlay={() => {
                    if (!activeQuestion) {
                      setIsPlaying(true);
                      setHasStarted(true);
                    }
                  }}
                  onPause={() => setIsPlaying(false)}
                  onEnded={handleVideoEnded}
                  onError={() => setHasVideoError(true)}
                  onClick={togglePlay}
                  className="w-full h-full object-contain cursor-pointer"
                />

                {hasVideoError && (
                  <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md z-30 flex flex-col items-center justify-center p-6 text-center space-y-4">
                    <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center">
                      <Settings className="w-6 h-6" />
                    </div>
                    <div className="space-y-1 max-w-sm">
                      <h3 className="text-base font-bold text-white">Não foi possível carregar o vídeo</h3>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        A URL do vídeo não está acessível ou possui formato/CORS incompatível. Verifique as configurações.
                      </p>
                    </div>
                    <button
                      onClick={onOpenAdmin}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition shadow-lg cursor-pointer"
                    >
                      Alterar Fonte do Vídeo
                    </button>
                  </div>
                )}

                {/* Big Center Play / Replay Overlay Button when paused or not started */}
                {(!isPlaying || isEnded) && !activeQuestion && (
                  <div
                    onClick={togglePlay}
                    className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px] flex flex-col items-center justify-center cursor-pointer transition-opacity z-10"
                  >
                    <button
                      className="w-20 h-20 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full flex items-center justify-center hover:scale-105 hover:bg-white/20 transition-all shadow-2xl"
                      aria-label="Play Video"
                    >
                      {isEnded ? (
                        <RotateCcw className="w-8 h-8 text-white ml-0.5" />
                      ) : (
                        <Play className="w-9 h-9 text-white ml-1 fill-white" />
                      )}
                    </button>
                    <span className="text-xs font-mono font-semibold tracking-wider text-slate-300 uppercase mt-4 drop-shadow-md">
                      {isEnded ? 'REPLAY_VIDEO' : 'INICIAR_VÍDEO_INTERATIVO'}
                    </span>
                  </div>
                )}

                {/* CTA Overlay Banner if Enabled */}
                {config.ctaEnabled && config.ctaText && !activeQuestion && (
                  <div className="absolute top-4 right-4 z-20">
                    <a
                      href={config.ctaUrl || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center gap-2 ${theme.bg} text-white px-4 py-2 rounded-full text-xs font-bold shadow-lg hover:scale-105 transition-transform`}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      {config.ctaText}
                    </a>
                  </div>
                )}

                {/* Custom Control Overlay Bar */}
                {config.showControls && !activeQuestion && (
                  <div
                    className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-950/95 via-slate-950/70 to-transparent p-4 sm:p-5 flex flex-col gap-2 transition-opacity duration-300 z-20 ${
                      isPlaying ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'
                    }`}
                  >
                    {/* Time Progress Scrubber with Interactive Question Markers */}
                    <div className="relative flex items-center gap-3">
                      <input
                        type="range"
                        min={0}
                        max={duration || 100}
                        value={currentTime}
                        onChange={handleSeek}
                        className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500 hover:h-2.5 transition-all"
                        style={{
                          background: `linear-gradient(to right, ${theme.hex} 0%, ${theme.hex} ${
                            (currentTime / (duration || 1)) * 100
                          }%, #334155 ${(currentTime / (duration || 1)) * 100}%, #334155 100%)`
                        }}
                      />

                      {/* Question Markers on Progress Bar */}
                      {questionsList.map((q) => {
                        if (!duration) return null;
                        const leftPct = (q.timestamp / duration) * 100;
                        const isAnswered = answeredQuestionIds.has(q.id);
                        return (
                          <div
                            key={q.id}
                            className={`absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-slate-950 z-10 transition-transform hover:scale-150 cursor-pointer ${
                              isAnswered ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'
                            }`}
                            style={{ left: `${Math.min(Math.max(leftPct, 1), 99)}%` }}
                            title={`Decisão em ${q.timestamp}s: ${q.title}`}
                          />
                        );
                      })}
                    </div>

                    {/* Controls Bar Row */}
                    <div className="flex items-center justify-between text-white text-xs sm:text-sm pt-1">
                      {/* Left Controls */}
                      <div className="flex items-center gap-3">
                        <button
                          onClick={togglePlay}
                          className="p-1.5 hover:bg-white/10 rounded-lg transition"
                          title={isPlaying ? 'Pausar' : 'Reproduzir'}
                        >
                          {isPlaying ? (
                            <Pause className="w-5 h-5 fill-white" />
                          ) : (
                            <Play className="w-5 h-5 fill-white" />
                          )}
                        </button>

                        <div className="flex items-center gap-1.5 group/vol">
                          <button
                            onClick={toggleMute}
                            className="p-1.5 hover:bg-white/10 rounded-lg transition"
                            title={isMuted ? 'Ativar som' : 'Mutar'}
                          >
                            {isMuted || volume === 0 ? (
                              <VolumeX className="w-5 h-5 text-rose-400" />
                            ) : (
                              <Volume2 className="w-5 h-5 text-slate-200" />
                            )}
                          </button>
                          
                          <input
                            type="range"
                            min={0}
                            max={1}
                            step={0.05}
                            value={isMuted ? 0 : volume}
                            onChange={handleVolumeChange}
                            className="w-16 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-400 hidden sm:block"
                          />
                        </div>

                        <span className="font-mono text-xs text-slate-300">
                          {formatTime(currentTime)} / {formatTime(duration)}
                        </span>
                      </div>

                      {/* Right Controls */}
                      <div className="flex items-center gap-2">
                        {/* Playback Speed Selector */}
                        <div className="relative">
                          <button
                            onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                            className="flex items-center gap-1 px-2 py-1 rounded-md hover:bg-white/10 text-xs font-mono font-medium transition"
                            title="Velocidade de reprodução"
                          >
                            <Gauge className="w-4 h-4 text-slate-300" />
                            <span>{playbackSpeed}x</span>
                          </button>

                          {showSpeedMenu && (
                            <div className="absolute bottom-full right-0 mb-2 bg-slate-900 border border-slate-700 rounded-xl py-1.5 w-24 shadow-2xl z-30 flex flex-col text-xs font-mono">
                              {[0.5, 0.75, 1, 1.25, 1.5, 2].map((s) => (
                                <button
                                  key={s}
                                  onClick={() => changeSpeed(s)}
                                  className={`px-3 py-1 text-left hover:bg-slate-800 transition ${
                                    playbackSpeed === s ? `${theme.text} font-bold` : 'text-slate-300'
                                  }`}
                                >
                                  {s}x
                                </button>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* PiP Button */}
                        <button
                          onClick={togglePip}
                          className="p-1.5 hover:bg-white/10 rounded-lg transition text-slate-300 hidden sm:block"
                          title="Picture in Picture"
                        >
                          <PictureInPicture2 className="w-4 h-4" />
                        </button>

                        {/* Fullscreen Button */}
                        <button
                          onClick={toggleFullscreen}
                          className="p-1.5 hover:bg-white/10 rounded-lg transition text-slate-300"
                          title="Tela Cheia"
                        >
                          <Maximize className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* USER CHOICE LOGS & INTERACTIVE PROGRESS SUMMARY */}
        {questionsList.length > 0 && (
          <div className="bg-slate-900/60 rounded-2xl p-5 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white">
                  Decisões Interativas do Vídeo ({answeredQuestionIds.size}/{questionsList.length} respondidas)
                </h3>
              </div>

              {userChoices.length > 0 && (
                <button
                  onClick={handleResetInteractivity}
                  className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-semibold bg-indigo-500/10 hover:bg-indigo-500/20 px-3 py-1 rounded-lg border border-indigo-500/20 transition"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Reiniciar Teste Interativo</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {questionsList.map((q) => {
                const choice = userChoices.find((c) => c.questionId === q.id);
                return (
                  <div
                    key={q.id}
                    className={`p-3.5 rounded-xl border flex items-start gap-3 transition ${
                      choice
                        ? 'bg-slate-950 border-emerald-500/40 text-slate-200'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400'
                    }`}
                  >
                    <div
                      className={`px-2 py-1 rounded-md flex items-center justify-center font-mono font-bold text-xs shrink-0 mt-0.5 ${
                        choice ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-300 border border-slate-700'
                      }`}
                    >
                      {formatTime(q.timestamp)}
                    </div>

                    <div className="flex-1 overflow-hidden">
                      <span className="text-xs font-semibold text-slate-200 block truncate">
                        {q.title}
                      </span>
                      {choice ? (
                        <div className="flex items-center gap-1.5 mt-1 text-xs text-emerald-400 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                          <span>Opção {choice.selectedOption.id}: "{choice.selectedOption.label}"</span>
                        </div>
                      ) : (
                        <span className="text-[11px] text-amber-400/80 font-mono mt-0.5 block">
                          Aguardando o vídeo chegar em {formatTime(q.timestamp)}...
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Video Features Highlights below stage */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-800/60 text-xs text-slate-400 space-y-1">
            <span className="font-semibold text-slate-200 block">Formato & Interatividade</span>
            <p>{parsed.type.toUpperCase()} • {questionsList.length} pontos de pausa com escolhas A, B, C, D</p>
          </div>

          <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-800/60 text-xs text-slate-400 space-y-1">
            <span className="font-semibold text-slate-200 block">Tema & Proporção</span>
            <p>Tema: <span className="capitalize">{config.accentTheme}</span> | Aspecto: {config.aspectRatio}</p>
          </div>

          <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-800/60 text-xs text-slate-400 space-y-1">
            <span className="font-semibold text-slate-200 block">Status da Sessão</span>
            <p>{answeredQuestionIds.size === questionsList.length && questionsList.length > 0 ? 'Todas as perguntas respondidas' : 'Pronto para pausar e exibir escolhas A, B, C, D'}</p>
          </div>
        </div>

      </div>
    </div>
  );
};

