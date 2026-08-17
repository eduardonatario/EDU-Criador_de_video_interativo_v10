export interface ParsedVideoUrl {
  type: 'mp4' | 'youtube' | 'vimeo' | 'iframe' | 'unknown';
  embedUrl: string;
  youtubeId?: string;
  vimeoId?: string;
}

export function parseVideoUrl(url: string): ParsedVideoUrl {
  if (!url) {
    return { type: 'unknown', embedUrl: '' };
  }

  const cleanUrl = url.trim();

  // YouTube detection
  const ytMatch = cleanUrl.match(
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i
  );
  if (ytMatch && ytMatch[1]) {
    const videoId = ytMatch[1];
    return {
      type: 'youtube',
      youtubeId: videoId,
      embedUrl: `https://www.youtube.com/embed/${videoId}?rel=0`
    };
  }

  // Vimeo detection
  const vimeoMatch = cleanUrl.match(/(?:vimeo\.com\/)(\d+)/i);
  if (vimeoMatch && vimeoMatch[1]) {
    const videoId = vimeoMatch[1];
    return {
      type: 'vimeo',
      vimeoId: videoId,
      embedUrl: `https://player.vimeo.com/video/${videoId}`
    };
  }

  // Direct MP4 / WebM / OGG or standard video file extension
  if (/\.(mp4|webm|ogg|m3u8|mov|mkv)(\?.*)?$/i.test(cleanUrl) || cleanUrl.includes('gtv-videos-bucket')) {
    return {
      type: 'mp4',
      embedUrl: cleanUrl
    };
  }

  // Generic direct URL or iframe src
  return {
    type: 'mp4', // Default to standard HTML5 video tag attempt
    embedUrl: cleanUrl
  };
}

export function getThemeClasses(theme: string) {
  switch (theme) {
    case 'emerald':
      return {
        bg: 'bg-emerald-600',
        text: 'text-emerald-500',
        border: 'border-emerald-500',
        hoverBg: 'hover:bg-emerald-700',
        gradient: 'from-emerald-500 to-teal-600',
        ring: 'focus:ring-emerald-500',
        hex: '#10b981'
      };
    case 'crimson':
      return {
        bg: 'bg-rose-600',
        text: 'text-rose-500',
        border: 'border-rose-500',
        hoverBg: 'hover:bg-rose-700',
        gradient: 'from-rose-500 to-red-600',
        ring: 'focus:ring-rose-500',
        hex: '#f43f5e'
      };
    case 'amber':
      return {
        bg: 'bg-amber-600',
        text: 'text-amber-500',
        border: 'border-amber-500',
        hoverBg: 'hover:bg-amber-700',
        gradient: 'from-amber-500 to-orange-600',
        ring: 'focus:ring-amber-500',
        hex: '#f59e0b'
      };
    case 'violet':
      return {
        bg: 'bg-violet-600',
        text: 'text-violet-500',
        border: 'border-violet-500',
        hoverBg: 'hover:bg-violet-700',
        gradient: 'from-violet-500 to-purple-600',
        ring: 'focus:ring-violet-500',
        hex: '#8b5cf6'
      };
    case 'cyan':
      return {
        bg: 'bg-cyan-600',
        text: 'text-cyan-500',
        border: 'border-cyan-500',
        hoverBg: 'hover:bg-cyan-700',
        gradient: 'from-cyan-500 to-blue-600',
        ring: 'focus:ring-cyan-500',
        hex: '#06b6d4'
      };
    case 'slate':
      return {
        bg: 'bg-slate-700',
        text: 'text-slate-400',
        border: 'border-slate-600',
        hoverBg: 'hover:bg-slate-800',
        gradient: 'from-slate-600 to-slate-800',
        ring: 'focus:ring-slate-500',
        hex: '#64748b'
      };
    case 'indigo':
    default:
      return {
        bg: 'bg-indigo-600',
        text: 'text-indigo-500',
        border: 'border-indigo-500',
        hoverBg: 'hover:bg-indigo-700',
        gradient: 'from-indigo-500 to-blue-600',
        ring: 'focus:ring-indigo-500',
        hex: '#6366f1'
      };
  }
}
