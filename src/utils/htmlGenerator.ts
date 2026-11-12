import { VideoConfig, ExportMode } from '../types';
import { parseVideoUrl, getThemeClasses } from './urlParser';

export function generateExportCode(config: VideoConfig, mode: ExportMode): string {
  const parsed = parseVideoUrl(config.url);
  const theme = getThemeClasses(config.accentTheme);

  if (mode === 'embed') {
    return generateIframeEmbed(config);
  }

  if (mode === 'minimal') {
    return generateMinimalHtml(config, parsed);
  }

  return generateStandalonePage(config, parsed, theme);
}

function generateIframeEmbed(config: VideoConfig): string {
  const parsed = parseVideoUrl(config.url);
  const isYouTubeOrVimeo = parsed.type === 'youtube' || parsed.type === 'vimeo';

  if (isYouTubeOrVimeo) {
    let src = parsed.embedUrl;
    if (config.autoplay) src += (src.includes('?') ? '&' : '?') + 'autoplay=1';
    if (config.muted) src += (src.includes('?') ? '&' : '?') + 'mute=1';
    if (config.loop) src += (src.includes('?') ? '&' : '?') + 'loop=1';

    return `<!-- Player Embed Code -->
<div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; max-width: ${config.maxWidth || '100%'}; margin: 0 auto; border-radius: 12px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.3);">
  <iframe 
    src="${src}" 
    title="${escapeHtml(config.title || 'Vídeo')}" 
    frameborder="0" 
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
    allowfullscreen
    style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none;">
  </iframe>
</div>`;
  }

  const theme = getThemeClasses(config.accentTheme);
  const fullHtml = generateStandalonePage(config, parsed, theme);
  const safeSrcDoc = fullHtml.replace(/"/g, '&quot;');

  return `<!-- Embed iFrame Isolado de Vídeo Interativo (100% Transparente) -->
<div style="position: relative; width: 100%; max-width: ${config.maxWidth || '860px'}; margin: 0 auto; aspect-ratio: 16/9; overflow: hidden; border-radius: 16px; background: transparent !important;">
  <iframe 
    srcdoc="${safeSrcDoc}" 
    title="${escapeHtml(config.title || 'Player de Vídeo Interativo')}" 
    frameborder="0" 
    allow="autoplay; fullscreen; picture-in-picture" 
    allowtransparency="true"
    allowfullscreen
    style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none; background: transparent !important;">
  </iframe>
</div>`;
}

function generateMinimalHtml(config: VideoConfig, parsed: ReturnType<typeof parseVideoUrl>): string {
  if (parsed.type === 'youtube' || parsed.type === 'vimeo') {
    return `<iframe src="${parsed.embedUrl}" width="100%" height="450" frameborder="0" allowfullscreen></iframe>`;
  }

  return `<video width="100%" controls ${config.posterUrl ? `poster="${config.posterUrl}"` : ''} ${config.autoplay ? 'autoplay' : ''} ${config.muted ? 'muted' : ''} ${config.loop ? 'loop' : ''}>
  <source src="${config.url}" type="video/mp4">
  Seu navegador não suporta vídeos HTML5.
</video>`;
}

function generateStandalonePage(
  config: VideoConfig,
  parsed: ReturnType<typeof parseVideoUrl>,
  theme: ReturnType<typeof getThemeClasses>
): string {
  const isEmbedType = parsed.type === 'youtube' || parsed.type === 'vimeo';
  const questionsJson = JSON.stringify(config.interactiveQuestions || []);

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(config.title || 'Player de Vídeo Interativo')}</title>
  <style>
    :root {
      --primary-color: ${theme.hex};
      --bg-dark: #0f172a;
      --card-bg: #1e293b;
      --text-main: #f8fafc;
      --text-muted: #94a3b8;
    }

    html, body {
      margin: 0 !important;
      padding: 0 !important;
      background: transparent !important;
      background-color: transparent !important;
      color: var(--text-main);
      width: 100%;
    }

    body.ivp-standalone-page {
      min-height: auto;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 0 !important;
      margin: 0 !important;
      background: transparent !important;
      background-color: transparent !important;
    }

    .ivp-player-root {
      width: 100%;
      max-width: ${config.maxWidth || '860px'};
      margin: 0 auto !important;
      padding: 0 !important;
      background: transparent !important;
      background-color: transparent !important;
      border: none !important;
      box-shadow: none !important;
      display: block;
      clear: both;
      box-sizing: border-box;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      text-align: left;
    }

    .ivp-player-root * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    .ivp-player-root .ivp-container {
      width: 100%;
      max-width: ${config.maxWidth || '860px'};
      margin: 0 auto;
      background: transparent !important;
      background-color: transparent !important;
    }

    .ivp-player-root .ivp-video-card {
      background: transparent !important;
      background-color: transparent !important;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: none !important;
      border: none !important;
    }

    .ivp-player-root .ivp-video-header {
      padding: 16px 20px;
      background: transparent !important;
    }

    .ivp-player-root .ivp-video-title {
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--text-main);
      margin-bottom: 6px;
    }

    .ivp-player-root .ivp-video-description {
      font-size: 0.9rem;
      color: var(--text-muted);
      line-height: 1.4;
    }

    .ivp-player-root .ivp-player-wrapper {
      position: relative;
      width: 100%;
      background: transparent !important;
      background-color: transparent !important;
      aspect-ratio: ${config.aspectRatio ? config.aspectRatio.replace(':', '/') : '16/9'};
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      border: none !important;
      box-shadow: none !important;
    }

    .ivp-player-root video {
      width: 100%;
      height: 100%;
      object-fit: contain;
      display: block;
      background: transparent !important;
      background-color: transparent !important;
      border: none !important;
      outline: none !important;
    }

    .ivp-player-root iframe {
      width: 100%;
      height: 100%;
      border: none;
    }

    /* Interactive Overlay Modal */
    .ivp-player-root .ivp-interactive-overlay {
      position: absolute;
      inset: 0;
      background: rgba(15, 23, 42, 0.92);
      backdrop-filter: blur(8px);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 24px;
      z-index: 100;
      text-align: center;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.3s ease;
    }

    .ivp-player-root .ivp-interactive-overlay.ivp-active {
      opacity: 1;
      pointer-events: auto;
    }

    .ivp-player-root .ivp-interactive-badge {
      background: rgba(79, 70, 229, 0.2);
      color: #818cf8;
      border: 1px solid rgba(99, 102, 241, 0.4);
      padding: 4px 14px;
      border-radius: 20px;
      font-size: 0.75rem;
      font-family: monospace;
      font-weight: 600;
      margin-bottom: 12px;
    }

    .ivp-player-root .ivp-interactive-title {
      font-size: 1.25rem;
      font-weight: 700;
      color: #ffffff;
      margin-bottom: 6px;
      line-height: 1.3;
    }

    .ivp-player-root .ivp-interactive-subtitle {
      font-size: 0.85rem;
      color: #cbd5e1;
      margin-bottom: 20px;
    }

    .ivp-player-root .ivp-options-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 12px;
      width: 100%;
      max-width: 600px;
    }

    .ivp-player-root .ivp-option-btn {
      background: #1e293b;
      border: 1px solid #334155;
      color: #f8fafc;
      padding: 14px;
      border-radius: 12px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 12px;
      text-align: left;
      transition: background 0.2s, border-color 0.2s, transform 0.1s;
    }

    .ivp-player-root .ivp-option-btn:hover {
      background: #334155;
      border-color: var(--primary-color);
      transform: translateY(-2px);
    }

    .ivp-player-root .ivp-option-key {
      width: 28px;
      height: 28px;
      border-radius: 6px;
      background: rgba(99, 102, 241, 0.25);
      color: #818cf8;
      border: 1px solid rgba(99, 102, 241, 0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-family: monospace;
      font-size: 0.85rem;
      flex-shrink: 0;
    }

    .ivp-player-root .ivp-option-text {
      font-size: 0.85rem;
      font-weight: 600;
      line-height: 1.3;
    }

    /* Custom Player Overlay Controls */
    .ivp-player-root .ivp-controls-overlay {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      background: linear-gradient(to top, rgba(0,0,0,0.85), transparent);
      padding: 20px 16px 12px 16px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      opacity: 0;
      transition: opacity 0.25s ease;
      z-index: 20;
    }

    .ivp-player-root .ivp-player-wrapper:hover .ivp-controls-overlay,
    .ivp-player-root .ivp-controls-overlay.ivp-active {
      opacity: 1;
    }

    .ivp-player-root .ivp-progress-bar-container {
      width: 100%;
      height: 6px;
      background: rgba(255, 255, 255, 0.25);
      border-radius: 3px;
      cursor: pointer;
      position: relative;
    }

    .ivp-player-root .ivp-progress-bar-fill {
      height: 100%;
      background: var(--primary-color);
      border-radius: 3px;
      width: 0%;
      position: relative;
    }

    .ivp-player-root .ivp-controls-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      color: white;
    }

    .ivp-player-root .ivp-controls-left, .ivp-player-root .ivp-controls-right {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .ivp-player-root .ivp-btn-icon {
      background: none;
      border: none;
      color: white;
      cursor: pointer;
      padding: 6px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.2s, transform 0.1s;
    }

    .ivp-player-root .ivp-btn-icon:hover {
      background: rgba(255, 255, 255, 0.2);
      transform: scale(1.08);
    }

    .ivp-player-root .ivp-time-display {
      font-size: 0.85rem;
      font-family: monospace;
      color: #e2e8f0;
    }

    .ivp-player-root .ivp-cta-banner {
      position: absolute;
      top: 16px;
      right: 16px;
      background: var(--primary-color);
      color: white;
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 0.85rem;
      font-weight: 600;
      text-decoration: none;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      transition: transform 0.2s;
      z-index: 20;
    }

    .ivp-player-root .ivp-cta-banner:hover {
      transform: scale(1.05);
    }

    .ivp-player-root .ivp-big-play-btn {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 72px;
      height: 72px;
      border-radius: 50%;
      background: var(--primary-color);
      color: white;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 10px 30px rgba(0,0,0,0.5);
      transition: transform 0.2s, background 0.2s;
      z-index: 30;
    }

    .ivp-player-root .ivp-big-play-btn:hover {
      transform: translate(-50%, -50%) scale(1.1);
    }

    .ivp-player-root .ivp-footer {
      text-align: center;
      margin-top: 16px;
      font-size: 0.8rem;
      color: var(--text-muted);
    }
  </style>
</head>
<body class="ivp-standalone-page" style="background: transparent !important; background-color: transparent !important; margin: 0; padding: 0;">

  <div class="ivp-player-root" style="background: transparent !important; background-color: transparent !important; border: none; box-shadow: none;">
    <div class="ivp-container" style="background: transparent !important; background-color: transparent !important;">
      <div class="ivp-video-card" style="background: transparent !important; background-color: transparent !important; border: none; box-shadow: none;">
        ${config.title || config.description ? `
        <div class="ivp-video-header" style="background: transparent !important;">
          ${config.title ? `<h1 class="ivp-video-title">${escapeHtml(config.title)}</h1>` : ''}
          ${config.description ? `<p class="ivp-video-description">${escapeHtml(config.description)}</p>` : ''}
        </div>` : ''}

      <div class="ivp-player-wrapper" id="ivp-playerWrapper" style="background: transparent !important; background-color: transparent !important; border: none; box-shadow: none;">
        ${isEmbedType ? `
          <iframe 
            src="${parsed.embedUrl}${parsed.embedUrl.includes('?') ? '&' : '?'}autoplay=${config.autoplay ? 1 : 0}" 
            allow="autoplay; fullscreen" 
            allowfullscreen>
          </iframe>
        ` : `
          <video 
            id="ivp-mainVideo" 
            src="${config.url}"
            ${config.posterUrl ? `poster="${config.posterUrl}"` : ''} 
            ${config.autoplay ? 'autoplay' : ''} 
            ${config.muted ? 'muted' : ''} 
            ${config.loop ? 'loop' : ''}
            playsinline
            webkit-playsinline
            preload="auto">
            <source src="${config.url}" type="video/mp4">
            Seu navegador não suporta a exibição de vídeo HTML5.
          </video>

          <!-- Interactive Question Overlay -->
          <div class="ivp-interactive-overlay" id="ivp-interactiveOverlay">
            <span class="ivp-interactive-badge">DECISÃO INTERATIVA</span>
            <h2 class="ivp-interactive-title" id="ivp-interactiveTitle">Qual a melhor escolha?</h2>
            <p class="ivp-interactive-subtitle" id="ivp-interactiveSubtitle">Escolha uma opção A, B, C ou D para continuar:</p>
            <div class="ivp-options-grid" id="ivp-optionsGrid"></div>
          </div>

          <button class="ivp-big-play-btn" id="ivp-bigPlayBtn" aria-label="Iniciar Vídeo">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </button>

          ${config.ctaEnabled && config.ctaText ? `
            <a href="${config.ctaUrl || '#'}" target="_blank" class="ivp-cta-banner">
              ${escapeHtml(config.ctaText)} →
            </a>
          ` : ''}

          <div class="ivp-controls-overlay" id="ivp-controlsOverlay">
            <div class="ivp-progress-bar-container" id="ivp-progressContainer">
              <div class="ivp-progress-bar-fill" id="ivp-progressFill"></div>
            </div>

            <div class="ivp-controls-row">
              <div class="ivp-controls-left">
                <button class="ivp-btn-icon" id="ivp-playToggleBtn" title="Play/Pause">
                  <svg id="ivp-playIcon" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                  <svg id="ivp-pauseIcon" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style="display:none;">
                    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                  </svg>
                </button>

                <button class="ivp-btn-icon" id="ivp-muteToggleBtn" title="Mute/Unmute">
                  <svg id="ivp-volumeHighIcon" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
                  </svg>
                </button>

                <span class="ivp-time-display"><span id="ivp-currentTime">00:00</span> / <span id="ivp-durationTime">00:00</span></span>
              </div>

              <div class="ivp-controls-right">
                <button class="ivp-btn-icon" id="ivp-fullscreenBtn" title="Tela Cheia">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        `}
      </div>
    </div>

    <div class="ivp-footer">
      Powered by Interactive StreamPlayer Web System
    </div>
  </div>

  ${!isEmbedType ? `
  <script>
    (function() {
      const video = document.getElementById('ivp-mainVideo');
      const bigPlayBtn = document.getElementById('ivp-bigPlayBtn');
      const playToggleBtn = document.getElementById('ivp-playToggleBtn');
      const playIcon = document.getElementById('ivp-playIcon');
      const pauseIcon = document.getElementById('ivp-pauseIcon');
      const progressContainer = document.getElementById('ivp-progressContainer');
      const progressFill = document.getElementById('ivp-progressFill');
      const currentTimeEl = document.getElementById('ivp-currentTime');
      const durationTimeEl = document.getElementById('ivp-durationTime');
      const fullscreenBtn = document.getElementById('ivp-fullscreenBtn');
      const muteToggleBtn = document.getElementById('ivp-muteToggleBtn');
      const playerWrapper = document.getElementById('ivp-playerWrapper');

      const interactiveOverlay = document.getElementById('ivp-interactiveOverlay');
      const interactiveTitle = document.getElementById('ivp-interactiveTitle');
      const interactiveSubtitle = document.getElementById('ivp-interactiveSubtitle');
      const optionsGrid = document.getElementById('ivp-optionsGrid');

      const questions = ${questionsJson};
      const answeredIds = new Set();
      let activeQ = null;
      let nextPauseTarget = 0;

      if (!video) return;

      function formatTime(sec) {
        if (isNaN(sec)) return "00:00";
        const m = Math.floor(sec / 60);
        const s = Math.floor(sec % 60);
        return (m < 10 ? "0" + m : m) + ":" + (s < 10 ? "0" + s : s);
      }

      function togglePlay() {
        if (activeQ) return;
        if (video.paused) {
          const promise = video.play();
          if (promise !== undefined) {
            promise.then(function() {
              if (bigPlayBtn) bigPlayBtn.style.display = 'none';
              if (playIcon) playIcon.style.display = 'none';
              if (pauseIcon) pauseIcon.style.display = 'inline';
            }).catch(function(err) {
              console.warn("Reprodução direta bloqueada pelo navegador, tentando no modo mudo:", err);
              video.muted = true;
              video.play().then(function() {
                if (bigPlayBtn) bigPlayBtn.style.display = 'none';
                if (playIcon) playIcon.style.display = 'none';
                if (pauseIcon) pauseIcon.style.display = 'inline';
              }).catch(function(e) {
                console.error("Erro na inicialização do vídeo:", e);
              });
            });
          }
        } else {
          video.pause();
        }
      }

      function showQuestion(q) {
        activeQ = q;
        interactiveTitle.textContent = q.title;
        interactiveSubtitle.textContent = q.subtitle || 'Escolha uma opção A, B, C ou D para continuar:';
        optionsGrid.innerHTML = '';

        (q.options || []).forEach(opt => {
          const btn = document.createElement('button');
          btn.className = 'ivp-option-btn';
          btn.type = 'button';
          btn.innerHTML = '<span class="ivp-option-key">' + opt.id + '</span><span class="ivp-option-text">' + opt.label + '</span>';
          btn.addEventListener('click', function() {
            answeredIds.add(q.id);
            interactiveOverlay.classList.remove('ivp-active');
            activeQ = null;
            const resumeTime = (opt.jumpToTime !== undefined && opt.jumpToTime >= 0) ? opt.jumpToTime : video.currentTime;
            video.currentTime = resumeTime;
            if (opt.displayDuration && opt.displayDuration > 0) {
              nextPauseTarget = resumeTime + opt.displayDuration;
            } else {
              nextPauseTarget = 0;
            }
            video.play();
          });
          optionsGrid.appendChild(btn);
        });

        interactiveOverlay.classList.add('ivp-active');
      }

      video.addEventListener('play', function() {
        if (!activeQ) {
          bigPlayBtn.style.display = 'none';
          playIcon.style.display = 'none';
          pauseIcon.style.display = 'inline';
        }
      });

      video.addEventListener('pause', function() {
        if (!activeQ) {
          bigPlayBtn.style.display = 'flex';
          playIcon.style.display = 'inline';
          pauseIcon.style.display = 'none';
        }
      });

      video.addEventListener('timeupdate', function() {
        const cur = video.currentTime;
        if (video.duration) {
          const percent = (cur / video.duration) * 100;
          progressFill.style.width = percent + '%';
          currentTimeEl.textContent = formatTime(cur);
        }

        // Check if next option-specific pause target is reached
        if (nextPauseTarget > 0 && cur >= nextPauseTarget && !activeQ) {
          video.pause();
          nextPauseTarget = 0;
          if (questions.length > 0) {
            showQuestion(questions[0]);
          }
          return;
        }

        // Check interactive breakpoint
        for (let i = 0; i < questions.length; i++) {
          const q = questions[i];
          if (!answeredIds.has(q.id) && cur >= q.timestamp && cur < q.timestamp + 1.2 && !activeQ) {
            video.pause();
            showQuestion(q);
            break;
          }
        }
      });

      video.addEventListener('loadedmetadata', function() {
        durationTimeEl.textContent = formatTime(video.duration);
      });

      video.addEventListener('click', togglePlay);
      bigPlayBtn.addEventListener('click', togglePlay);
      playToggleBtn.addEventListener('click', togglePlay);

      progressContainer.addEventListener('click', function(e) {
        const rect = progressContainer.getBoundingClientRect();
        const pos = (e.clientX - rect.left) / rect.width;
        video.currentTime = pos * video.duration;
      });

      muteToggleBtn.addEventListener('click', function() {
        video.muted = !video.muted;
        muteToggleBtn.style.opacity = video.muted ? '0.5' : '1';
      });

      fullscreenBtn.addEventListener('click', function() {
        if (document.fullscreenElement) {
          document.exitFullscreen();
        } else {
          playerWrapper.requestFullscreen().catch(err => {
            console.error('Fullscreen error:', err);
          });
        }
      });
    })();
  </script>
  ` : ''}

</body>
</html>`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
