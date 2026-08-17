export type PlayerTheme = 'indigo' | 'emerald' | 'crimson' | 'amber' | 'violet' | 'cyan' | 'slate';

export type AspectRatio = '16:9' | '4:3' | '1:1' | '9:16';

export type ExportMode = 'standalone' | 'embed' | 'minimal';

export type OptionKey = 'A' | 'B' | 'C' | 'D';

export interface InteractiveOption {
  id: OptionKey;
  label: string;
  isCorrect?: boolean;
  feedbackText?: string;
  jumpToTime?: number; // Optional timestamp in seconds to jump to when selected
  displayDuration?: number; // Optional duration in seconds to play before pausing again
}

export interface InteractiveQuestion {
  id: string;
  timestamp: number; // Time in seconds when the video pauses for user input
  title: string;
  subtitle?: string;
  options: [InteractiveOption, InteractiveOption, InteractiveOption, InteractiveOption];
}

export interface VideoConfig {
  id: string;
  title: string;
  description: string;
  url: string;
  posterUrl: string;
  autoplay: boolean;
  muted: boolean;
  loop: boolean;
  showControls: boolean;
  accentTheme: PlayerTheme;
  aspectRatio: AspectRatio;
  maxWidth: string; // e.g. "800px", "100%"
  ctaEnabled: boolean;
  ctaText: string;
  ctaUrl: string;
  ctaTimeSeconds: number; // when to show CTA, 0 for always or end
  interactiveQuestions?: InteractiveQuestion[];
}

export interface PresetVideo {
  id: string;
  title: string;
  description: string;
  url: string;
  posterUrl: string;
  type: 'mp4' | 'youtube' | 'vimeo';
  defaultQuestions?: InteractiveQuestion[];
}

