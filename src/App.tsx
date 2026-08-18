import React, { useState, useRef, useEffect } from 'react';
import { Settings, Play, Pause, RotateCcw, CheckCircle, XCircle, Video, Clock, HelpCircle, Eye, Download, Copy, Check, Code2, Sun, Moon } from 'lucide-react';
import { secondsToTimecode, timecodeToSeconds } from './utils/timecode';
import { parseVideoUrl } from './utils/urlParser';

export default function App() {
  // Interface Theme mode state: 'dark' | 'light'
  const [themeMode, setThemeMode] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('interactive_theme_mode') as 'dark' | 'light') || 'dark';
  });

  useEffect(() => {
    localStorage.setItem('interactive_theme_mode', themeMode);
  }, [themeMode]);

  const toggleTheme = () => {
    setThemeMode((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const isDark = themeMode === 'dark';

  // Mode selection: 'config' | 'preview'
  const [activeMode, setActiveMode] = useState<'config' | 'preview'>('config');

  // Configuration state
  const [videoUrl, setVideoUrl] = useState<string>(() => {
    return localStorage.getItem('interactive_video_url') || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
  });
  
  const [timecodeStr, setTimecodeStr] = useState<string>(() => {
    return localStorage.getItem('interactive_timecode') || '00:10';
  });

  const [optionA, setOptionA] = useState<string>(() => {
    const val = localStorage.getItem('interactive_opt_a');
    return (val && val !== 'Opção A - Continuar reprodução') ? val : 'Opção A: Limpar com água e sabão';
  });
  const [optionB, setOptionB] = useState<string>(() => {
    const val = localStorage.getItem('interactive_opt_b');
    return (val && val !== 'Opção B - Seguir por este caminho') ? val : 'Opção B: Expor o machucado ao sol';
  });
  const [optionC, setOptionC] = useState<string>(() => {
    const val = localStorage.getItem('interactive_opt_c');
    return (val && val !== 'Opção C - Explorar alternativa') ? val : 'Opção C: Passar pano sujo';
  });
  const [optionD, setOptionD] = useState<string>(() => {
    const val = localStorage.getItem('interactive_opt_d');
    return (val && val !== 'Opção D - Avançar conteúdo') ? val : 'Opção D: Passar Manteiga';
  });

  // Correct option state: 'A' | 'B' | 'C' | 'D'
  const [correctOption, setCorrectOption] = useState<'A' | 'B' | 'C' | 'D'>(() => {
    return (localStorage.getItem('interactive_correct_opt') as 'A' | 'B' | 'C' | 'D') || 'A';
  });

  // Options Resume Timecode (when video resumes playback)
  const [optAResume, setOptAResume] = useState<string>(() => localStorage.getItem('interactive_opt_a_resume') || '00:15');
  const [optBResume, setOptBResume] = useState<string>(() => localStorage.getItem('interactive_opt_b_resume') || '00:23');
  const [optCResume, setOptCResume] = useState<string>(() => localStorage.getItem('interactive_opt_c_resume') || '00:30');
  const [optDResume, setOptDResume] = useState<string>(() => localStorage.getItem('interactive_opt_d_resume') || '00:45');

  // Options Display Duration in seconds (how long video plays before pausing again)
  const [optADuration, setOptADuration] = useState<number>(() => {
    const val = localStorage.getItem('interactive_opt_a_duration');
    return val !== null ? parseInt(val, 10) : 10;
  });
  const [optBDuration, setOptBDuration] = useState<number>(() => {
    const val = localStorage.getItem('interactive_opt_b_duration');
    return val !== null ? parseInt(val, 10) : 12;
  });
  const [optCDuration, setOptCDuration] = useState<number>(() => {
    const val = localStorage.getItem('interactive_opt_c_duration');
    return val !== null ? parseInt(val, 10) : 10;
  });
  const [optDDuration, setOptDDuration] = useState<number>(() => {
    const val = localStorage.getItem('interactive_opt_d_duration');
    return val !== null ? parseInt(val, 10) : 15;
  });

  // Target pause seconds in player (starts with targetSeconds, updates when options are selected)
  const targetSeconds = timecodeToSeconds(timecodeStr);
  const [currentPauseTargetSeconds, setCurrentPauseTargetSeconds] = useState<number>(() => targetSeconds);
  const currentPauseTargetRef = useRef<number>(targetSeconds);

  // Helper to sync ref and state for current pause target
  const updatePauseTarget = (sec: number) => {
    currentPauseTargetRef.current = sec;
    setCurrentPauseTargetSeconds(sec);
  };

  // Preview / Video player state
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [showOverlay, setShowOverlay] = useState<boolean>(false);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [feedbackResult, setFeedbackResult] = useState<{ key: 'A' | 'B' | 'C' | 'D'; isCorrect: boolean } | null>(null);
  const [copiedHtml, setCopiedHtml] = useState<boolean>(false);
  const [hasAnsweredCorrectly, setHasAnsweredCorrectly] = useState<boolean>(false);
  const [isVideoFinished, setIsVideoFinished] = useState<boolean>(false);
  const [hasVideoError, setHasVideoError] = useState<boolean>(false);

  useEffect(() => {
    setHasVideoError(false);
  }, [videoUrl]);

  const videoRef = useRef<HTMLVideoElement>(null);

  // Generate Standalone HTML Code
  const generateStandaloneHtml = () => {
    const safeVideoUrl = videoUrl.replace(/"/g, '&quot;');
    const safeA = optionA.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    const safeB = optionB.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    const safeC = optionC.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    const safeD = optionD.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

    const optAResumeSec = timecodeToSeconds(optAResume);
    const optBResumeSec = timecodeToSeconds(optBResume);
    const optCResumeSec = timecodeToSeconds(optCResume);
    const optDResumeSec = timecodeToSeconds(optDResume);

    return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Vídeo Interativo</title>
  <style>
    html, body {
      margin: 0;
      padding: 0;
      background-color: #020617;
      color: #f8fafc;
    }
    body.ivp-standalone-page {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      padding: 16px;
    }
    .ivp-embed-wrapper {
      width: 100%;
      max-width: 900px;
      margin: 0 auto;
      display: block;
      clear: both;
      position: relative;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      box-sizing: border-box;
      text-align: left;
    }
    .ivp-embed-wrapper * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    .ivp-embed-wrapper .ivp-video-container {
      position: relative;
      width: 100%;
      max-width: 900px;
      margin: 0 auto;
      aspect-ratio: 16 / 9;
      background-color: #000;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
      border: 1px solid #1e293b;
    }
    .ivp-embed-wrapper video {
      width: 100%;
      height: 100%;
      object-fit: contain;
      cursor: pointer;
      transition: filter 0.3s ease;
      display: block;
    }
    .ivp-embed-wrapper video.ivp-paused-blur {
      filter: blur(2px);
    }
    .ivp-embed-wrapper .ivp-overlay {
      position: absolute;
      inset: 0;
      background-color: rgba(0, 0, 0, 0.25);
      backdrop-filter: blur(4px);
      -webkit-backdrop-filter: blur(4px);
      z-index: 30;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .ivp-embed-wrapper .ivp-overlay.ivp-hidden {
      display: none !important;
    }
    .ivp-embed-wrapper .ivp-feedback-box {
      width: 100%;
      max-width: 550px;
      margin-bottom: 14px;
      padding: 12px 16px;
      border-radius: 12px;
      font-size: 13px;
      font-weight: 600;
      text-align: center;
    }
    .ivp-embed-wrapper .ivp-feedback-box.ivp-correct {
      background-color: rgba(16, 185, 129, 0.25);
      border: 1px solid #10b981;
      color: #34d399;
    }
    .ivp-embed-wrapper .ivp-feedback-box.ivp-incorrect {
      background-color: rgba(239, 68, 68, 0.25);
      border: 1px solid #ef4444;
      color: #f87171;
    }
    .ivp-embed-wrapper .ivp-options-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 14px;
      width: 100%;
      max-width: 550px;
    }
    .ivp-embed-wrapper .ivp-btn-option {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px;
      border-radius: 12px;
      background-color: rgba(15, 23, 42, 0.85);
      border: 1px solid rgba(255, 255, 255, 0.2);
      color: #ffffff;
      font-size: 14px;
      font-weight: 600;
      text-align: left;
      cursor: pointer;
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      transition: all 0.2s ease;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3);
    }
    .ivp-embed-wrapper .ivp-btn-option:hover {
      background-color: #4f46e5;
      border-color: #6366f1;
    }
    .ivp-embed-wrapper .ivp-btn-option:active {
      transform: scale(0.96);
    }
    .ivp-embed-wrapper .ivp-btn-option.ivp-is-correct {
      background-color: rgba(16, 185, 129, 0.4) !important;
      border-color: #10b981 !important;
    }
    .ivp-embed-wrapper .ivp-btn-option.ivp-is-incorrect {
      background-color: rgba(239, 68, 68, 0.4) !important;
      border-color: #ef4444 !important;
    }
    .ivp-embed-wrapper .ivp-badge-key {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      background-color: rgba(99, 102, 241, 0.3);
      color: #c7d2fe;
      font-family: monospace;
      font-weight: bold;
      font-size: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1px solid rgba(129, 140, 248, 0.4);
      flex-shrink: 0;
    }
    .ivp-embed-wrapper .ivp-btn-option:hover .ivp-badge-key {
      background-color: #ffffff;
      color: #4f46e5;
    }
    .ivp-embed-wrapper .ivp-play-overlay {
      position: absolute;
      inset: 0;
      background: rgba(0,0,0,0.4);
      backdrop-filter: blur(1px);
      -webkit-backdrop-filter: blur(1px);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      z-index: 20;
    }
    .ivp-embed-wrapper .ivp-play-overlay.ivp-hidden {
      display: none !important;
    }
    .ivp-embed-wrapper .ivp-play-btn {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background-color: #ffffff;
      border: none;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
      transition: transform 0.2s ease;
    }
    .ivp-embed-wrapper .ivp-play-btn:hover {
      transform: scale(1.1);
    }
    .ivp-embed-wrapper .ivp-play-btn svg {
      width: 36px;
      height: 36px;
      fill: #020617;
      margin-left: 4px;
    }
  </style>
</head>
<body class="ivp-standalone-page">

  <div class="ivp-embed-wrapper" id="ivpPlayerRoot">
    <div class="ivp-video-container">
      <video id="ivp-interactiveVideo" src="${safeVideoUrl}" playsinline webkit-playsinline preload="auto">
        <source src="${safeVideoUrl}" type="video/mp4">
      </video>

      <div id="ivp-playOverlay" class="ivp-play-overlay">
        <button class="ivp-play-btn" aria-label="Iniciar Vídeo">
          <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
        </button>
      </div>

      <div id="ivp-pauseOverlay" class="ivp-overlay ivp-hidden">
        <div id="ivp-feedbackBox" class="ivp-feedback-box" style="display: none;"></div>
        <div class="ivp-options-grid">
          <button id="ivp-btnOptA" class="ivp-btn-option" onclick="selectOption('A')">
            <span class="ivp-badge-key">A</span>
            <span>${safeA}</span>
          </button>
          <button id="ivp-btnOptB" class="ivp-btn-option" onclick="selectOption('B')">
            <span class="ivp-badge-key">B</span>
            <span>${safeB}</span>
          </button>
          <button id="ivp-btnOptC" class="ivp-btn-option" onclick="selectOption('C')">
            <span class="ivp-badge-key">C</span>
            <span>${safeC}</span>
          </button>
          <button id="ivp-btnOptD" class="ivp-btn-option" onclick="selectOption('D')">
            <span class="ivp-badge-key">D</span>
            <span>${safeD}</span>
          </button>
        </div>
      </div>

      <div id="ivp-finishOverlay" class="ivp-overlay ivp-hidden">
        <div style="background-color: #ffffff; border: 1px solid rgba(16, 185, 129, 0.4); padding: 28px 24px; border-radius: 16px; text-align: center; max-width: 420px; width: 100%; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.35);">
          <div style="width: 52px; height: 52px; border-radius: 50%; background-color: rgba(16, 185, 129, 0.15); border: 1px solid #10b981; color: #059669; display: flex; align-items: center; justify-content: center; margin: 0 auto 12px auto; font-size: 26px; font-weight: bold;">✓</div>
          <h3 style="font-size: 18px; font-weight: 700; color: #0f172a; margin-bottom: 6px;">Parabéns!</h3>
          <p style="font-size: 13px; color: #475569; margin-bottom: 18px; line-height: 1.4;">Você acertou a questão</p>
          <button onclick="restartVideo()" style="width: 100%; padding: 12px 16px; border-radius: 12px; background-color: #4f46e5; color: #ffffff; font-size: 13px; font-weight: 700; border: none; cursor: pointer; transition: background 0.2s;">Responder novamente</button>
        </div>
      </div>
    </div>
  </div>

  <script>
    const video = document.getElementById('ivp-interactiveVideo');
    const playOverlay = document.getElementById('ivp-playOverlay');
    const pauseOverlay = document.getElementById('ivp-pauseOverlay');
    const finishOverlay = document.getElementById('ivp-finishOverlay');
    const feedbackBox = document.getElementById('ivp-feedbackBox');
    const initialTargetTime = ${targetSeconds};
    const correctOptionKey = "${correctOption}";

    const optionsData = {
      A: { resume: ${optAResumeSec}, duration: ${optADuration} },
      B: { resume: ${optBResumeSec}, duration: ${optBDuration} },
      C: { resume: ${optCResumeSec}, duration: ${optCDuration} },
      D: { resume: ${optDResumeSec}, duration: ${optDDuration} }
    };

    let currentPauseTarget = initialTargetTime;
    let hasAnsweredCorrectly = false;
    let isVideoFinished = false;

    function formatTime(sec) {
      if (isNaN(sec) || sec < 0) return '00:00';
      const m = Math.floor(sec / 60);
      const s = Math.floor(sec % 60);
      return (m < 10 ? '0' + m : m) + ':' + (s < 10 ? '0' + s : s);
    }

    function safePlayVideo() {
      if (!video) return;
      const promise = video.play();
      if (promise !== undefined) {
        promise.then(() => {
          if (playOverlay) playOverlay.classList.add('ivp-hidden');
        }).catch(err => {
          console.warn('Reprodução direta bloqueada pelo navegador, tentando no modo mudo:', err);
          video.muted = true;
          video.play().then(() => {
            if (playOverlay) playOverlay.classList.add('ivp-hidden');
          }).catch(e => {
            console.error('Falha na inicialização do vídeo:', e);
          });
        });
      } else {
        if (playOverlay) playOverlay.classList.add('ivp-hidden');
      }
    }

    function restartVideo() {
      hasAnsweredCorrectly = false;
      isVideoFinished = false;
      currentPauseTarget = initialTargetTime;
      if (finishOverlay) finishOverlay.classList.add('ivp-hidden');
      if (pauseOverlay) pauseOverlay.classList.add('ivp-hidden');
      video.classList.remove('ivp-paused-blur');
      video.currentTime = 0;
      video.pause();
      if (playOverlay) playOverlay.classList.remove('ivp-hidden');
    }

    if (playOverlay) {
      playOverlay.addEventListener('click', safePlayVideo);
    }

    video.addEventListener('click', () => {
      if (isVideoFinished) return;
      if (video.paused && pauseOverlay.classList.contains('ivp-hidden')) {
        safePlayVideo();
      } else if (!video.paused) {
        video.pause();
      }
    });

    video.addEventListener('play', () => {
      if (playOverlay) playOverlay.classList.add('ivp-hidden');
    });

    video.addEventListener('pause', () => {
      if (!isVideoFinished && pauseOverlay.classList.contains('ivp-hidden')) {
        if (playOverlay) playOverlay.classList.remove('ivp-hidden');
      }
    });

    video.addEventListener('timeupdate', () => {
      if (!isVideoFinished && currentPauseTarget > 0 && video.currentTime >= currentPauseTarget) {
        video.pause();
        video.classList.add('ivp-paused-blur');
        
        if (hasAnsweredCorrectly) {
          isVideoFinished = true;
          pauseOverlay.classList.add('ivp-hidden');
          if (finishOverlay) finishOverlay.classList.remove('ivp-hidden');
        } else {
          pauseOverlay.classList.remove('ivp-hidden');
        }
      }
    });

    video.addEventListener('ended', () => {
      if (hasAnsweredCorrectly) {
        isVideoFinished = true;
        pauseOverlay.classList.add('ivp-hidden');
        if (finishOverlay) finishOverlay.classList.remove('ivp-hidden');
      } else {
        pauseOverlay.classList.remove('ivp-hidden');
        video.classList.add('ivp-paused-blur');
      }
    });

    function selectOption(choiceKey) {
      const isCorrect = (choiceKey === correctOptionKey);
      const selectedBtn = document.getElementById('ivp-btnOpt' + choiceKey);
      const opt = optionsData[choiceKey];
      
      hasAnsweredCorrectly = isCorrect;
      if (!isCorrect) {
        isVideoFinished = false;
      }

      if (selectedBtn) {
        selectedBtn.classList.add(isCorrect ? 'ivp-is-correct' : 'ivp-is-incorrect');
      }

      setTimeout(() => {
        if (selectedBtn) selectedBtn.classList.remove('ivp-is-correct', 'ivp-is-incorrect');
        pauseOverlay.classList.add('ivp-hidden');
        video.classList.remove('ivp-paused-blur');
        playOverlay.classList.add('ivp-hidden');

        if (opt && opt.resume >= 0) {
          video.currentTime = opt.resume;
          if (opt.duration > 0) {
            currentPauseTarget = opt.resume + opt.duration;
          } else {
            currentPauseTarget = 0;
          }
        }
        safePlayVideo();
      }, 500);
    }
  </script>
</body>
</html>`;
  };

  const copyToClipboard = async (text: string): Promise<boolean> => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch (err) {
      console.warn('Clipboard API error, attempting fallback copy method:', err);
    }

    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      return successful;
    } catch (err) {
      console.error('Fallback copy method failed:', err);
      return false;
    }
  };

  const handleCopyHtml = async () => {
    const htmlCode = generateStandaloneHtml();
    const success = await copyToClipboard(htmlCode);
    if (success) {
      setCopiedHtml(true);
      setTimeout(() => setCopiedHtml(false), 2000);
    }
  };

  const handleDownloadHtml = () => {
    const htmlCode = generateStandaloneHtml();
    const blob = new Blob([htmlCode], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'video-interativo.html';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem('interactive_video_url', videoUrl);
    localStorage.setItem('interactive_timecode', timecodeStr);
    localStorage.setItem('interactive_opt_a', optionA);
    localStorage.setItem('interactive_opt_b', optionB);
    localStorage.setItem('interactive_opt_c', optionC);
    localStorage.setItem('interactive_opt_d', optionD);
    localStorage.setItem('interactive_opt_a_resume', optAResume);
    localStorage.setItem('interactive_opt_b_resume', optBResume);
    localStorage.setItem('interactive_opt_c_resume', optCResume);
    localStorage.setItem('interactive_opt_d_resume', optDResume);
    localStorage.setItem('interactive_opt_a_duration', optADuration.toString());
    localStorage.setItem('interactive_opt_b_duration', optBDuration.toString());
    localStorage.setItem('interactive_opt_c_duration', optCDuration.toString());
    localStorage.setItem('interactive_opt_d_duration', optDDuration.toString());
    localStorage.setItem('interactive_correct_opt', correctOption);
  }, [videoUrl, timecodeStr, optionA, optionB, optionC, optionD, optAResume, optBResume, optCResume, optDResume, optADuration, optBDuration, optCDuration, optDDuration, correctOption]);

  // Reset playback state when switching modes
  const handleSwitchMode = (mode: 'config' | 'preview') => {
    setActiveMode(mode);
    setShowOverlay(false);
    setSelectedChoice(null);
    setFeedbackResult(null);
    setIsPlaying(false);
    setHasAnsweredCorrectly(false);
    setIsVideoFinished(false);
    const initialTarget = timecodeToSeconds(timecodeStr);
    updatePauseTarget(initialTarget);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.pause();
    }
  };

  const togglePlay = () => {
    if (!videoRef.current || showOverlay || isVideoFinished) return;
    if (videoRef.current.paused) {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(console.error);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const current = videoRef.current.currentTime;
    const target = currentPauseTargetRef.current;

    // Trigger overlay or finish pause when video reaches current target
    if (!showOverlay && !isVideoFinished && target > 0 && current >= target) {
      videoRef.current.pause();
      setIsPlaying(false);
      
      if (hasAnsweredCorrectly) {
        // Ao acertar a questão, pausar e finalizar sem reexibir o menu de opções
        setIsVideoFinished(true);
        setShowOverlay(false);
      } else {
        // Ao errar a questão, após exibir o trecho, volta para o menu de opções
        setShowOverlay(true);
      }
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    if (hasAnsweredCorrectly) {
      setIsVideoFinished(true);
      setShowOverlay(false);
    } else {
      // Se o vídeo terminar após escolher uma opção errada, volta para o menu de opções
      setShowOverlay(true);
    }
  };

  // When user selects Option A, B, C or D in Preview Mode
  const handleSelectOption = (optionKey: 'A' | 'B' | 'C' | 'D', optionText: string) => {
    const isCorrect = optionKey === correctOption;
    setSelectedChoice(`${optionKey}: ${optionText}`);
    setFeedbackResult({ key: optionKey, isCorrect });
    setHasAnsweredCorrectly(isCorrect);
    if (!isCorrect) {
      setIsVideoFinished(false);
    }

    // Determine resume timecode and duration for selected option
    let resumeStr = optAResume;
    let durationSec = optADuration;
    if (optionKey === 'B') { resumeStr = optBResume; durationSec = optBDuration; }
    else if (optionKey === 'C') { resumeStr = optCResume; durationSec = optCDuration; }
    else if (optionKey === 'D') { resumeStr = optDResume; durationSec = optDDuration; }

    const resumeSeconds = timecodeToSeconds(resumeStr);
    const nextPauseSeconds = durationSec > 0 ? resumeSeconds + durationSec : 0;

    setTimeout(() => {
      setFeedbackResult(null);
      setShowOverlay(false);

      if (videoRef.current) {
        // Atualiza a referência de pausa do player ANTES de buscar o novo tempo no vídeo
        updatePauseTarget(nextPauseSeconds);
        if (resumeSeconds >= 0) {
          videoRef.current.currentTime = resumeSeconds;
        }
        videoRef.current.play().then(() => setIsPlaying(true)).catch(console.error);
      }
    }, 1500);
  };

  const handleRestartPreview = () => {
    setShowOverlay(false);
    setSelectedChoice(null);
    setFeedbackResult(null);
    setIsPlaying(false);
    setHasAnsweredCorrectly(false);
    setIsVideoFinished(false);
    const initialTarget = timecodeToSeconds(timecodeStr);
    updatePauseTarget(initialTarget);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.pause();
    }
  };

  const parsed = parseVideoUrl(videoUrl);
  const isYouTubeOrVimeo = parsed.type === 'youtube' || parsed.type === 'vimeo';

  return (
    <div className={`min-h-screen flex flex-col font-sans antialiased transition-colors duration-200 ${
      isDark ? 'bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white' : 'bg-slate-100 text-slate-900 selection:bg-indigo-600 selection:text-white'
    }`}>
      
      {/* Top Header */}
      <header className={`h-16 border-b backdrop-blur-md sticky top-0 z-40 transition-colors ${
        isDark ? 'border-slate-800 bg-slate-900/80' : 'border-slate-200 bg-white/90 shadow-sm'
      }`}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/30 text-white">
              <Video className="w-4 h-4" />
            </div>
            <span className={`font-bold text-base sm:text-lg tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Criador de vídeo interativo
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Mode Switcher Tabs */}
            <div className={`flex items-center p-1 rounded-xl border transition-colors ${
              isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-200/80 border-slate-300'
            }`}>
              <button
                onClick={() => handleSwitchMode('config')}
                className={`flex items-center gap-2 px-3 sm:px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  activeMode === 'config'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Settings className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">Modo Configuração</span>
                <span className="xs:hidden">Configuração</span>
              </button>

              <button
                onClick={() => handleSwitchMode('preview')}
                className={`flex items-center gap-2 px-3 sm:px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  activeMode === 'preview'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span className="hidden xs:inline">Modo Preview</span>
                <span className="xs:hidden">Preview</span>
              </button>
            </div>

            {/* Light / Dark Mode Toggle Button */}
            <button
              onClick={toggleTheme}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer active:scale-95 ${
                isDark
                  ? 'bg-slate-950 hover:bg-slate-800 text-amber-300 border-slate-800 shadow-sm'
                  : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-300 shadow-sm'
              }`}
              title={isDark ? 'Alternar para Interface Clara' : 'Alternar para Interface Escura'}
              aria-label="Alternar modo claro e escuro"
            >
              {isDark ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span className="hidden sm:inline">Modo Claro</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-indigo-600" />
                  <span className="hidden sm:inline">Modo Escuro</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-6">
        
        {/* ==================== 1. MODO CONFIGURAÇÃO ==================== */}
        {activeMode === 'config' && (
          <div className={`rounded-2xl border p-6 sm:p-8 space-y-6 backdrop-blur-md transition-colors ${
            isDark ? 'bg-slate-900/80 border-slate-800 shadow-2xl' : 'bg-white border-slate-200/90 shadow-xl'
          }`}>
            <div className={`flex items-center justify-between border-b pb-4 ${
              isDark ? 'border-slate-800' : 'border-slate-200'
            }`}>
              <div className="flex items-center gap-2.5">
                <Settings className="w-5 h-5 text-indigo-500" />
                <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Configuração do Vídeo Interativo
                </h2>
              </div>
              <span className={`text-xs font-mono font-medium px-3 py-1 rounded-lg border ${
                isDark ? 'text-slate-400 bg-slate-950 border-slate-800' : 'text-slate-600 bg-slate-100 border-slate-200'
              }`}>
                timecode: {secondsToTimecode(targetSeconds)} ({targetSeconds}s)
              </span>
            </div>

            {/* Input 1: URL do Vídeo */}
            <div className="space-y-2">
              <label className={`block text-xs font-bold uppercase tracking-wider ${
                isDark ? 'text-slate-300' : 'text-slate-700'
              }`}>
                1. URL do Vídeo (MP4)
              </label>
              <input
                type="url"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="Ex: https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
                className={`w-full text-xs font-mono rounded-xl px-4 py-3 border focus:outline-none transition-colors ${
                  isDark
                    ? 'bg-slate-950 text-white border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'
                    : 'bg-slate-50 text-slate-900 border-slate-300 focus:border-indigo-600 focus:bg-white focus:ring-1 focus:ring-indigo-600'
                }`}
              />
            </div>

            {/* Input 2: Time Code da Pausa */}
            <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl border transition-colors ${
              isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="space-y-1.5">
                <label className={`flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider ${
                  isDark ? 'text-indigo-300' : 'text-indigo-700'
                }`}>
                  <Clock className="w-3.5 h-3.5" />
                  <span>2. Time code de pausa para pergunta (MM:SS)</span>
                </label>
                <input
                  type="text"
                  value={timecodeStr}
                  onChange={(e) => setTimecodeStr(e.target.value)}
                  placeholder="Ex: 00:10"
                  className={`w-full font-mono font-bold text-sm rounded-lg px-3.5 py-2.5 border focus:outline-none transition-colors ${
                    isDark
                      ? 'bg-slate-900 text-indigo-300 border-slate-700 focus:border-indigo-500'
                      : 'bg-white text-indigo-800 border-slate-300 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600'
                  }`}
                />
              </div>

              <div className="space-y-1.5">
                <label className={`block text-xs font-bold uppercase tracking-wider ${
                  isDark ? 'text-slate-400' : 'text-slate-600'
                }`}>
                  Ou digite diretamente em Segundos:
                </label>
                <input
                  type="number"
                  min={0}
                  value={targetSeconds}
                  onChange={(e) => setTimecodeStr(secondsToTimecode(Math.max(0, parseInt(e.target.value) || 0)))}
                  className={`w-full font-mono text-sm rounded-lg px-3.5 py-2.5 border focus:outline-none transition-colors ${
                    isDark
                      ? 'bg-slate-900 text-slate-200 border-slate-800 focus:border-indigo-500'
                      : 'bg-white text-slate-800 border-slate-300 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600'
                  }`}
                />
              </div>
            </div>

            {/* Input 3: Configuração das Opções (Texto, Retomada e Duração) */}
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <label className={`block text-xs font-bold uppercase tracking-wider ${
                  isDark ? 'text-slate-300' : 'text-slate-700'
                }`}>
                  3. Opções de Escolha (A, B, C e D) &amp; Fluxo de Reprodução:
                </label>
                <span className="text-[11px] font-medium text-emerald-500 bg-emerald-500/10 px-2.5 py-0.5 rounded-lg border border-emerald-500/20 flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Opção correta: <strong className={`font-mono font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{correctOption}</strong></span>
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Opção A */}
                <div
                  className={`p-3.5 rounded-xl border transition-all space-y-3 ${
                    correctOption === 'A'
                      ? isDark
                        ? 'bg-emerald-950/30 border-emerald-500/80 ring-1 ring-emerald-500/30'
                        : 'bg-emerald-50/90 border-emerald-500/80 ring-1 ring-emerald-500/20'
                      : isDark
                        ? 'bg-slate-950 border-slate-800'
                        : 'bg-slate-50 border-slate-200/90'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <label className="flex items-center gap-2 cursor-pointer shrink-0">
                      <input
                        type="radio"
                        name="correctOptionRadio"
                        checked={correctOption === 'A'}
                        onChange={() => setCorrectOption('A')}
                        className={`w-4 h-4 text-emerald-500 focus:ring-emerald-500 cursor-pointer ${
                          isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-300'
                        }`}
                      />
                      <span
                        className={`w-7 h-7 rounded-lg font-mono font-bold text-xs flex items-center justify-center shrink-0 border transition ${
                          correctOption === 'A'
                            ? 'bg-emerald-500 text-white border-emerald-400 font-extrabold shadow-sm'
                            : isDark
                              ? 'bg-indigo-600/20 text-indigo-400 border-indigo-500/30'
                              : 'bg-indigo-100 text-indigo-700 border-indigo-200'
                        }`}
                      >
                        A
                      </span>
                    </label>
                    <input
                      type="text"
                      value={optionA}
                      onChange={(e) => setOptionA(e.target.value)}
                      placeholder="Texto da Opção A"
                      className={`w-full text-xs font-medium px-3 py-1.5 rounded-lg border focus:outline-none transition-colors ${
                        isDark
                          ? 'bg-slate-900 text-white border-slate-800 focus:border-indigo-500'
                          : 'bg-white text-slate-900 border-slate-300 focus:border-indigo-600'
                      }`}
                    />
                    {correctOption === 'A' && (
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/20 px-2 py-0.5 rounded-md border border-emerald-500/30 uppercase tracking-wider shrink-0">
                        Correta
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2.5 pt-1 text-xs">
                    <div className="space-y-1">
                      <label className={`block text-[11px] font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        1º: Retomar aos (Timecode)
                      </label>
                      <input
                        type="text"
                        value={optAResume}
                        onChange={(e) => setOptAResume(e.target.value)}
                        placeholder="00:15"
                        className={`w-full font-mono font-bold text-xs rounded-lg px-2.5 py-1.5 border focus:outline-none transition-colors ${
                          isDark
                            ? 'bg-slate-900 text-indigo-300 border-slate-800 focus:border-indigo-500'
                            : 'bg-white text-indigo-800 border-slate-300 focus:border-indigo-600'
                        }`}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className={`block text-[11px] font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        2º: Exibir por (Segundos)
                      </label>
                      <input
                        type="number"
                        min={1}
                        value={optADuration}
                        onChange={(e) => setOptADuration(Math.max(1, parseInt(e.target.value) || 1))}
                        className={`w-full font-mono font-bold text-xs rounded-lg px-2.5 py-1.5 border focus:outline-none transition-colors ${
                          isDark
                            ? 'bg-slate-900 text-slate-200 border-slate-800 focus:border-indigo-500'
                            : 'bg-white text-slate-800 border-slate-300 focus:border-indigo-600'
                        }`}
                      />
                    </div>
                  </div>

                  <div className={`text-[10px] font-mono px-2.5 py-1 rounded-md border flex items-center justify-between ${
                    isDark
                      ? 'text-indigo-300/80 bg-slate-900/80 border-slate-800'
                      : 'text-indigo-900 bg-indigo-50/90 border-indigo-100 font-medium'
                  }`}>
                    <span>Fluxo da Opção A:</span>
                    <span className={`font-bold ${isDark ? 'text-indigo-200' : 'text-indigo-700'}`}>
                      {optAResume} ({timecodeToSeconds(optAResume)}s) + {optADuration}s → Pausa em {secondsToTimecode(timecodeToSeconds(optAResume) + optADuration)}
                    </span>
                  </div>
                </div>

                {/* Opção B */}
                <div
                  className={`p-3.5 rounded-xl border transition-all space-y-3 ${
                    correctOption === 'B'
                      ? isDark
                        ? 'bg-emerald-950/30 border-emerald-500/80 ring-1 ring-emerald-500/30'
                        : 'bg-emerald-50/90 border-emerald-500/80 ring-1 ring-emerald-500/20'
                      : isDark
                        ? 'bg-slate-950 border-slate-800'
                        : 'bg-slate-50 border-slate-200/90'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <label className="flex items-center gap-2 cursor-pointer shrink-0">
                      <input
                        type="radio"
                        name="correctOptionRadio"
                        checked={correctOption === 'B'}
                        onChange={() => setCorrectOption('B')}
                        className={`w-4 h-4 text-emerald-500 focus:ring-emerald-500 cursor-pointer ${
                          isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-300'
                        }`}
                      />
                      <span
                        className={`w-7 h-7 rounded-lg font-mono font-bold text-xs flex items-center justify-center shrink-0 border transition ${
                          correctOption === 'B'
                            ? 'bg-emerald-500 text-white border-emerald-400 font-extrabold shadow-sm'
                            : isDark
                              ? 'bg-indigo-600/20 text-indigo-400 border-indigo-500/30'
                              : 'bg-indigo-100 text-indigo-700 border-indigo-200'
                        }`}
                      >
                        B
                      </span>
                    </label>
                    <input
                      type="text"
                      value={optionB}
                      onChange={(e) => setOptionB(e.target.value)}
                      placeholder="Texto da Opção B"
                      className={`w-full text-xs font-medium px-3 py-1.5 rounded-lg border focus:outline-none transition-colors ${
                        isDark
                          ? 'bg-slate-900 text-white border-slate-800 focus:border-indigo-500'
                          : 'bg-white text-slate-900 border-slate-300 focus:border-indigo-600'
                      }`}
                    />
                    {correctOption === 'B' && (
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/20 px-2 py-0.5 rounded-md border border-emerald-500/30 uppercase tracking-wider shrink-0">
                        Correta
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2.5 pt-1 text-xs">
                    <div className="space-y-1">
                      <label className={`block text-[11px] font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        1º: Retomar aos (Timecode)
                      </label>
                      <input
                        type="text"
                        value={optBResume}
                        onChange={(e) => setOptBResume(e.target.value)}
                        placeholder="00:23"
                        className={`w-full font-mono font-bold text-xs rounded-lg px-2.5 py-1.5 border focus:outline-none transition-colors ${
                          isDark
                            ? 'bg-slate-900 text-indigo-300 border-slate-800 focus:border-indigo-500'
                            : 'bg-white text-indigo-800 border-slate-300 focus:border-indigo-600'
                        }`}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className={`block text-[11px] font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        2º: Exibir por (Segundos)
                      </label>
                      <input
                        type="number"
                        min={1}
                        value={optBDuration}
                        onChange={(e) => setOptBDuration(Math.max(1, parseInt(e.target.value) || 1))}
                        className={`w-full font-mono font-bold text-xs rounded-lg px-2.5 py-1.5 border focus:outline-none transition-colors ${
                          isDark
                            ? 'bg-slate-900 text-slate-200 border-slate-800 focus:border-indigo-500'
                            : 'bg-white text-slate-800 border-slate-300 focus:border-indigo-600'
                        }`}
                      />
                    </div>
                  </div>

                  <div className={`text-[10px] font-mono px-2.5 py-1 rounded-md border flex items-center justify-between ${
                    isDark
                      ? 'text-indigo-300/80 bg-slate-900/80 border-slate-800'
                      : 'text-indigo-900 bg-indigo-50/90 border-indigo-100 font-medium'
                  }`}>
                    <span>Fluxo da Opção B:</span>
                    <span className={`font-bold ${isDark ? 'text-indigo-200' : 'text-indigo-700'}`}>
                      {optBResume} ({timecodeToSeconds(optBResume)}s) + {optBDuration}s → Pausa em {secondsToTimecode(timecodeToSeconds(optBResume) + optBDuration)}
                    </span>
                  </div>
                </div>

                {/* Opção C */}
                <div
                  className={`p-3.5 rounded-xl border transition-all space-y-3 ${
                    correctOption === 'C'
                      ? isDark
                        ? 'bg-emerald-950/30 border-emerald-500/80 ring-1 ring-emerald-500/30'
                        : 'bg-emerald-50/90 border-emerald-500/80 ring-1 ring-emerald-500/20'
                      : isDark
                        ? 'bg-slate-950 border-slate-800'
                        : 'bg-slate-50 border-slate-200/90'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <label className="flex items-center gap-2 cursor-pointer shrink-0">
                      <input
                        type="radio"
                        name="correctOptionRadio"
                        checked={correctOption === 'C'}
                        onChange={() => setCorrectOption('C')}
                        className={`w-4 h-4 text-emerald-500 focus:ring-emerald-500 cursor-pointer ${
                          isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-300'
                        }`}
                      />
                      <span
                        className={`w-7 h-7 rounded-lg font-mono font-bold text-xs flex items-center justify-center shrink-0 border transition ${
                          correctOption === 'C'
                            ? 'bg-emerald-500 text-white border-emerald-400 font-extrabold shadow-sm'
                            : isDark
                              ? 'bg-indigo-600/20 text-indigo-400 border-indigo-500/30'
                              : 'bg-indigo-100 text-indigo-700 border-indigo-200'
                        }`}
                      >
                        C
                      </span>
                    </label>
                    <input
                      type="text"
                      value={optionC}
                      onChange={(e) => setOptionC(e.target.value)}
                      placeholder="Texto da Opção C"
                      className={`w-full text-xs font-medium px-3 py-1.5 rounded-lg border focus:outline-none transition-colors ${
                        isDark
                          ? 'bg-slate-900 text-white border-slate-800 focus:border-indigo-500'
                          : 'bg-white text-slate-900 border-slate-300 focus:border-indigo-600'
                      }`}
                    />
                    {correctOption === 'C' && (
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/20 px-2 py-0.5 rounded-md border border-emerald-500/30 uppercase tracking-wider shrink-0">
                        Correta
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2.5 pt-1 text-xs">
                    <div className="space-y-1">
                      <label className={`block text-[11px] font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        1º: Retomar aos (Timecode)
                      </label>
                      <input
                        type="text"
                        value={optCResume}
                        onChange={(e) => setOptCResume(e.target.value)}
                        placeholder="00:30"
                        className={`w-full font-mono font-bold text-xs rounded-lg px-2.5 py-1.5 border focus:outline-none transition-colors ${
                          isDark
                            ? 'bg-slate-900 text-indigo-300 border-slate-800 focus:border-indigo-500'
                            : 'bg-white text-indigo-800 border-slate-300 focus:border-indigo-600'
                        }`}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className={`block text-[11px] font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        2º: Exibir por (Segundos)
                      </label>
                      <input
                        type="number"
                        min={1}
                        value={optCDuration}
                        onChange={(e) => setOptCDuration(Math.max(1, parseInt(e.target.value) || 1))}
                        className={`w-full font-mono font-bold text-xs rounded-lg px-2.5 py-1.5 border focus:outline-none transition-colors ${
                          isDark
                            ? 'bg-slate-900 text-slate-200 border-slate-800 focus:border-indigo-500'
                            : 'bg-white text-slate-800 border-slate-300 focus:border-indigo-600'
                        }`}
                      />
                    </div>
                  </div>

                  <div className={`text-[10px] font-mono px-2.5 py-1 rounded-md border flex items-center justify-between ${
                    isDark
                      ? 'text-indigo-300/80 bg-slate-900/80 border-slate-800'
                      : 'text-indigo-900 bg-indigo-50/90 border-indigo-100 font-medium'
                  }`}>
                    <span>Fluxo da Opção C:</span>
                    <span className={`font-bold ${isDark ? 'text-indigo-200' : 'text-indigo-700'}`}>
                      {optCResume} ({timecodeToSeconds(optCResume)}s) + {optCDuration}s → Pausa em {secondsToTimecode(timecodeToSeconds(optCResume) + optCDuration)}
                    </span>
                  </div>
                </div>

                {/* Opção D */}
                <div
                  className={`p-3.5 rounded-xl border transition-all space-y-3 ${
                    correctOption === 'D'
                      ? isDark
                        ? 'bg-emerald-950/30 border-emerald-500/80 ring-1 ring-emerald-500/30'
                        : 'bg-emerald-50/90 border-emerald-500/80 ring-1 ring-emerald-500/20'
                      : isDark
                        ? 'bg-slate-950 border-slate-800'
                        : 'bg-slate-50 border-slate-200/90'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <label className="flex items-center gap-2 cursor-pointer shrink-0">
                      <input
                        type="radio"
                        name="correctOptionRadio"
                        checked={correctOption === 'D'}
                        onChange={() => setCorrectOption('D')}
                        className={`w-4 h-4 text-emerald-500 focus:ring-emerald-500 cursor-pointer ${
                          isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-300'
                        }`}
                      />
                      <span
                        className={`w-7 h-7 rounded-lg font-mono font-bold text-xs flex items-center justify-center shrink-0 border transition ${
                          correctOption === 'D'
                            ? 'bg-emerald-500 text-white border-emerald-400 font-extrabold shadow-sm'
                            : isDark
                              ? 'bg-indigo-600/20 text-indigo-400 border-indigo-500/30'
                              : 'bg-indigo-100 text-indigo-700 border-indigo-200'
                        }`}
                      >
                        D
                      </span>
                    </label>
                    <input
                      type="text"
                      value={optionD}
                      onChange={(e) => setOptionD(e.target.value)}
                      placeholder="Texto da Opção D"
                      className={`w-full text-xs font-medium px-3 py-1.5 rounded-lg border focus:outline-none transition-colors ${
                        isDark
                          ? 'bg-slate-900 text-white border-slate-800 focus:border-indigo-500'
                          : 'bg-white text-slate-900 border-slate-300 focus:border-indigo-600'
                      }`}
                    />
                    {correctOption === 'D' && (
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/20 px-2 py-0.5 rounded-md border border-emerald-500/30 uppercase tracking-wider shrink-0">
                        Correta
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2.5 pt-1 text-xs">
                    <div className="space-y-1">
                      <label className={`block text-[11px] font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        1º: Retomar aos (Timecode)
                      </label>
                      <input
                        type="text"
                        value={optDResume}
                        onChange={(e) => setOptDResume(e.target.value)}
                        placeholder="00:45"
                        className={`w-full font-mono font-bold text-xs rounded-lg px-2.5 py-1.5 border focus:outline-none transition-colors ${
                          isDark
                            ? 'bg-slate-900 text-indigo-300 border-slate-800 focus:border-indigo-500'
                            : 'bg-white text-indigo-800 border-slate-300 focus:border-indigo-600'
                        }`}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className={`block text-[11px] font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        2º: Exibir por (Segundos)
                      </label>
                      <input
                        type="number"
                        min={1}
                        value={optDDuration}
                        onChange={(e) => setOptDDuration(Math.max(1, parseInt(e.target.value) || 1))}
                        className={`w-full font-mono font-bold text-xs rounded-lg px-2.5 py-1.5 border focus:outline-none transition-colors ${
                          isDark
                            ? 'bg-slate-900 text-slate-200 border-slate-800 focus:border-indigo-500'
                            : 'bg-white text-slate-800 border-slate-300 focus:border-indigo-600'
                        }`}
                      />
                    </div>
                  </div>

                  <div className={`text-[10px] font-mono px-2.5 py-1 rounded-md border flex items-center justify-between ${
                    isDark
                      ? 'text-indigo-300/80 bg-slate-900/80 border-slate-800'
                      : 'text-indigo-900 bg-indigo-50/90 border-indigo-100 font-medium'
                  }`}>
                    <span>Fluxo da Opção D:</span>
                    <span className={`font-bold ${isDark ? 'text-indigo-200' : 'text-indigo-700'}`}>
                      {optDResume} ({timecodeToSeconds(optDResume)}s) + {optDDuration}s → Pausa em {secondsToTimecode(timecodeToSeconds(optDResume) + optDDuration)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons Row */}
            <div className="pt-3 flex flex-wrap items-center justify-end gap-3">
              <button
                onClick={handleDownloadHtml}
                className="flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-500 active:scale-95 transition shadow-lg shadow-blue-600/20 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Baixar Arquivo HTML (.html)</span>
              </button>

              <button
                onClick={handleCopyHtml}
                className="flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-500 active:scale-95 transition shadow-lg shadow-blue-600/20 cursor-pointer"
              >
                {copiedHtml ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                <span>{copiedHtml ? 'Código Copiado!' : 'Copiar Código HTML'}</span>
              </button>

              <button
                onClick={() => handleSwitchMode('preview')}
                className="flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-500 active:scale-95 transition shadow-lg shadow-blue-600/20 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Testar no Modo Preview</span>
              </button>
            </div>
          </div>
        )}

        {/* ==================== 2. MODO PREVIEW ==================== */}
        {activeMode === 'preview' && (
          <div className="space-y-4">
            
            {/* Player Stage Container */}
            <div className="relative rounded-2xl overflow-hidden bg-black border border-slate-800 shadow-2xl aspect-video w-full group">
              
              {/* OVERLAY SOBRE A TELA QUANDO CHEGA NO TIMECODE */}
              {showOverlay && (
                <div className="absolute inset-0 backdrop-blur-[2px] bg-black/15 z-30 flex flex-col items-center justify-center p-4 sm:p-6 text-center animate-fade-in">
                  <div className="max-w-lg w-full space-y-4">
                    
                    {/* Alternativas A, B, C e D diretamente sobre o vídeo */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      
                      {/* Opção A */}
                      <button
                        onClick={() => handleSelectOption('A', optionA)}
                        disabled={!!feedbackResult}
                        className={`flex items-center gap-3 p-4 rounded-xl text-left transition-all duration-200 border shadow-2xl backdrop-blur-md group/opt active:scale-95 cursor-pointer ${
                          feedbackResult?.key === 'A'
                            ? feedbackResult.isCorrect
                              ? 'bg-emerald-600 border-emerald-400 text-white ring-2 ring-emerald-400/50'
                              : 'bg-rose-600 border-rose-400 text-white ring-2 ring-rose-400/50'
                            : 'bg-slate-900/80 hover:bg-indigo-600 border-white/20 text-white'
                        }`}
                      >
                        <span className={`w-8 h-8 rounded-lg font-mono font-bold text-sm flex items-center justify-center shrink-0 border transition ${
                          feedbackResult?.key === 'A'
                            ? 'bg-white text-slate-950 border-white'
                            : 'bg-indigo-500/30 text-indigo-200 border-indigo-400/40 group-hover/opt:bg-white group-hover/opt:text-indigo-600'
                        }`}>
                          A
                        </span>
                        <span className="text-xs sm:text-sm font-semibold text-white leading-tight flex-1">
                          {optionA}
                        </span>
                      </button>

                      {/* Opção B */}
                      <button
                        onClick={() => handleSelectOption('B', optionB)}
                        disabled={!!feedbackResult}
                        className={`flex items-center gap-3 p-4 rounded-xl text-left transition-all duration-200 border shadow-2xl backdrop-blur-md group/opt active:scale-95 cursor-pointer ${
                          feedbackResult?.key === 'B'
                            ? feedbackResult.isCorrect
                              ? 'bg-emerald-600 border-emerald-400 text-white ring-2 ring-emerald-400/50'
                              : 'bg-rose-600 border-rose-400 text-white ring-2 ring-rose-400/50'
                            : 'bg-slate-900/80 hover:bg-indigo-600 border-white/20 text-white'
                        }`}
                      >
                        <span className={`w-8 h-8 rounded-lg font-mono font-bold text-sm flex items-center justify-center shrink-0 border transition ${
                          feedbackResult?.key === 'B'
                            ? 'bg-white text-slate-950 border-white'
                            : 'bg-indigo-500/30 text-indigo-200 border-indigo-400/40 group-hover/opt:bg-white group-hover/opt:text-indigo-600'
                        }`}>
                          B
                        </span>
                        <span className="text-xs sm:text-sm font-semibold text-white leading-tight flex-1">
                          {optionB}
                        </span>
                      </button>

                      {/* Opção C */}
                      <button
                        onClick={() => handleSelectOption('C', optionC)}
                        disabled={!!feedbackResult}
                        className={`flex items-center gap-3 p-4 rounded-xl text-left transition-all duration-200 border shadow-2xl backdrop-blur-md group/opt active:scale-95 cursor-pointer ${
                          feedbackResult?.key === 'C'
                            ? feedbackResult.isCorrect
                              ? 'bg-emerald-600 border-emerald-400 text-white ring-2 ring-emerald-400/50'
                              : 'bg-rose-600 border-rose-400 text-white ring-2 ring-rose-400/50'
                            : 'bg-slate-900/80 hover:bg-indigo-600 border-white/20 text-white'
                        }`}
                      >
                        <span className={`w-8 h-8 rounded-lg font-mono font-bold text-sm flex items-center justify-center shrink-0 border transition ${
                          feedbackResult?.key === 'C'
                            ? 'bg-white text-slate-950 border-white'
                            : 'bg-indigo-500/30 text-indigo-200 border-indigo-400/40 group-hover/opt:bg-white group-hover/opt:text-indigo-600'
                        }`}>
                          C
                        </span>
                        <span className="text-xs sm:text-sm font-semibold text-white leading-tight flex-1">
                          {optionC}
                        </span>
                      </button>

                      {/* Opção D */}
                      <button
                        onClick={() => handleSelectOption('D', optionD)}
                        disabled={!!feedbackResult}
                        className={`flex items-center gap-3 p-4 rounded-xl text-left transition-all duration-200 border shadow-2xl backdrop-blur-md group/opt active:scale-95 cursor-pointer ${
                          feedbackResult?.key === 'D'
                            ? feedbackResult.isCorrect
                              ? 'bg-emerald-600 border-emerald-400 text-white ring-2 ring-emerald-400/50'
                              : 'bg-rose-600 border-rose-400 text-white ring-2 ring-rose-400/50'
                            : 'bg-slate-900/80 hover:bg-indigo-600 border-white/20 text-white'
                        }`}
                      >
                        <span className={`w-8 h-8 rounded-lg font-mono font-bold text-sm flex items-center justify-center shrink-0 border transition ${
                          feedbackResult?.key === 'D'
                            ? 'bg-white text-slate-950 border-white'
                            : 'bg-indigo-500/30 text-indigo-200 border-indigo-400/40 group-hover/opt:bg-white group-hover/opt:text-indigo-600'
                        }`}>
                          D
                        </span>
                        <span className="text-xs sm:text-sm font-semibold text-white leading-tight flex-1">
                          {optionD}
                        </span>
                      </button>

                    </div>
                  </div>
                </div>
              )}

              {/* OVERLAY DE VÍDEO CONCLUÍDO APÓS RESPOSTA CORRETA */}
              {isVideoFinished && (
                <div className="absolute inset-0 backdrop-blur-[3px] bg-slate-950/80 z-30 flex flex-col items-center justify-center p-6 text-center animate-fade-in">
                  <div className={`border border-emerald-500/50 p-6 sm:p-8 rounded-2xl shadow-2xl max-w-md w-full space-y-4 ${
                    isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'
                  }`}>
                    <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-500 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
                      <CheckCircle className="w-8 h-8" />
                    </div>
                    <div className="space-y-1.5">
                      <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Parabéns!</h3>
                      <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                        Você acertou a questão
                      </p>
                    </div>
                    <button
                      onClick={handleRestartPreview}
                      className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition shadow-lg shadow-indigo-600/30 cursor-pointer active:scale-95"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Responder novamente</span>
                    </button>
                  </div>
                </div>
              )}

              {/* YouTube / Vimeo or Standard HTML5 Video */}
              {isYouTubeOrVimeo ? (
                <iframe
                  src={parsed.embedUrl}
                  title="Vídeo Preview"
                  className={`w-full h-full border-0 transition-all duration-300 ${
                    showOverlay || isVideoFinished ? 'filter blur-[2px]' : ''
                  }`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <>
                  <video
                    ref={videoRef}
                    src={videoUrl}
                    playsInline
                    onTimeUpdate={handleTimeUpdate}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    onEnded={handleEnded}
                    onError={() => setHasVideoError(true)}
                    className={`w-full h-full object-contain cursor-pointer transition-all duration-300 ${
                      showOverlay || isVideoFinished ? 'filter blur-[2px] scale-[1.005]' : ''
                    }`}
                    onClick={togglePlay}
                  >
                    Seu navegador não suporta este vídeo.
                  </video>

                  {/* Fallback Overlay when video fails to load media */}
                  {hasVideoError && (
                    <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md z-30 flex flex-col items-center justify-center p-6 text-center space-y-4">
                      <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center">
                        <XCircle className="w-6 h-6" />
                      </div>
                      <div className="space-y-1 max-w-sm">
                        <h3 className="text-base font-bold text-white">Não foi possível carregar o vídeo</h3>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          A URL inserida não está acessível ou possui restrições do navegador. Selecione uma opção abaixo:
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2 justify-center pt-1">
                        <button
                          onClick={() => {
                            const sample = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
                            setVideoUrl(sample);
                            localStorage.setItem('interactive_video_url', sample);
                            setHasVideoError(false);
                          }}
                          className="px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition shadow-md cursor-pointer"
                        >
                          Vídeo MP4 (Big Buck Bunny)
                        </button>
                        <button
                          onClick={() => {
                            const ytSample = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
                            setVideoUrl(ytSample);
                            localStorage.setItem('interactive_video_url', ytSample);
                            setHasVideoError(false);
                          }}
                          className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition cursor-pointer"
                        >
                          Vídeo YouTube
                        </button>
                        <button
                          onClick={() => handleSwitchMode('config')}
                          className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition cursor-pointer"
                        >
                          Editar URL
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Play Center Overlay Button */}
                  {!isPlaying && !showOverlay && !isVideoFinished && (
                    <div 
                      onClick={togglePlay}
                      className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[1px] cursor-pointer transition z-20"
                    >
                      <button
                        className="w-20 h-20 rounded-full bg-white text-slate-950 flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition transform"
                        aria-label="Iniciar Vídeo"
                      >
                        <Play className="w-10 h-10 fill-slate-950 ml-1" />
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Preview Status & Controls Bar */}
            <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xl transition-colors ${
              isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
            }`}>
              
              <div className="flex items-center gap-3 text-xs flex-wrap">
                <span className={`font-mono px-3 py-1.5 rounded-lg border ${
                  isDark ? 'text-slate-400 bg-slate-950 border-slate-800' : 'text-slate-700 bg-slate-100 border-slate-200'
                }`}>
                  Entrada do menu com perguntas em: <strong className="text-indigo-500">{timecodeStr}</strong> ({targetSeconds}s)
                </span>

                {selectedChoice && (
                  <span className="flex items-center gap-1.5 text-emerald-500 font-semibold bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Selecionado: {selectedChoice}</span>
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleRestartPreview}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition border cursor-pointer ${
                    isDark
                      ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                  }`}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reiniciar Teste</span>
                </button>

                <button
                  onClick={() => handleSwitchMode('config')}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition shadow-md shadow-indigo-600/20 cursor-pointer"
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>Editar Configuração</span>
                </button>
              </div>

            </div>

          </div>
        )}

      </main>

      {/* Footer */}
      <footer className={`h-10 border-t flex items-center justify-between px-4 sm:px-8 text-[11px] uppercase font-mono shrink-0 transition-colors ${
        isDark ? 'border-slate-800 bg-slate-900 text-slate-500' : 'border-slate-200 bg-white text-slate-500'
      }`}>
        <div>SISTEMA DE VÍDEO INTERATIVO</div>
        <div>MODO: {activeMode.toUpperCase()} | TEMA: {themeMode.toUpperCase()}</div>
      </footer>
    </div>
  );
}
