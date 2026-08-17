import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HelpCircle, CheckCircle2, XCircle, ArrowRight, Sparkles, CornerDownRight } from 'lucide-react';
import { InteractiveQuestion, InteractiveOption, OptionKey } from '../types';

interface InteractiveOverlayProps {
  question: InteractiveQuestion;
  onSelectOption: (option: InteractiveOption) => void;
  accentThemeHex?: string;
}

export const InteractiveOverlay: React.FC<InteractiveOverlayProps> = ({
  question,
  onSelectOption,
  accentThemeHex = '#4f46e5'
}) => {
  const [selectedKey, setSelectedKey] = useState<OptionKey | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleOptionClick = (option: InteractiveOption) => {
    if (isSubmitting) return;
    setSelectedKey(option.id);
    setIsSubmitting(true);

    // Brief delay to let the user see their selection feedback, then notify parent to continue video
    setTimeout(() => {
      onSelectOption(option);
    }, 700);
  };

  const optionBadgeColors: Record<OptionKey, { bg: string; text: string; border: string }> = {
    A: { bg: 'bg-indigo-500/20', text: 'text-indigo-400', border: 'border-indigo-500/40' },
    B: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/40' },
    C: { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/40' },
    D: { bg: 'bg-violet-500/20', text: 'text-violet-400', border: 'border-violet-500/40' }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="absolute inset-0 z-30 bg-slate-950/85 backdrop-blur-md p-4 sm:p-6 md:p-8 flex flex-col justify-center items-center overflow-y-auto"
      >
        <div className="w-full max-w-2xl mx-auto space-y-4 text-center">
          
          {/* Header Tag */}
          <motion.div
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-700/80 text-xs font-mono text-indigo-400 font-semibold shadow-lg"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" style={{ animationDuration: '3s' }} />
            <span>INTERATIVIDADE • Escolha para continuar ({question.timestamp}s)</span>
          </motion.div>

          {/* Question Title & Subtitle */}
          <motion.div
            initial={{ y: -5, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="space-y-1.5"
          >
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white tracking-tight leading-snug drop-shadow-md">
              {question.title}
            </h2>
            {question.subtitle && (
              <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto">
                {question.subtitle}
              </p>
            )}
          </motion.div>

          {/* 4 Options Grid (A, B, C, D) */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3.5 pt-2 text-left w-full"
          >
            {question.options.map((option) => {
              const colors = optionBadgeColors[option.id];
              const isSelected = selectedKey === option.id;

              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => handleOptionClick(option)}
                  disabled={isSubmitting}
                  className={`relative flex items-start gap-3 p-3.5 sm:p-4 rounded-xl border text-left transition-all duration-200 group ${
                    isSelected
                      ? 'bg-indigo-600 border-indigo-400 text-white shadow-xl scale-[1.02] ring-2 ring-indigo-400/50'
                      : 'bg-slate-900/90 hover:bg-slate-800 border-slate-700/80 hover:border-slate-500 text-slate-200 hover:text-white shadow-md hover:scale-[1.01]'
                  }`}
                >
                  {/* Option Badge A/B/C/D */}
                  <span
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center font-mono font-bold text-xs sm:text-sm shrink-0 border transition ${
                      isSelected
                        ? 'bg-white text-indigo-950 border-white'
                        : `${colors.bg} ${colors.text} ${colors.border}`
                    }`}
                  >
                    {option.id}
                  </span>

                  {/* Option Text */}
                  <div className="flex-1 pr-2">
                    <span className="text-xs sm:text-sm font-semibold block leading-tight">
                      {option.label}
                    </span>

                    {/* Feedback preview if selected */}
                    {isSelected && option.feedbackText && (
                      <span className="text-[11px] font-mono mt-1 text-indigo-100 flex items-center gap-1">
                        <CornerDownRight className="w-3 h-3 shrink-0" />
                        {option.feedbackText}
                      </span>
                    )}

                    {/* Jump time indicator if set */}
                    {option.jumpToTime !== undefined && !isSelected && (
                      <span className="text-[10px] font-mono text-slate-400 block mt-1">
                        ↳ Pula para {option.jumpToTime}s
                      </span>
                    )}
                  </div>

                  {/* Right Arrow / Selection Indicator */}
                  <div className="shrink-0 pt-0.5 opacity-60 group-hover:opacity-100 transition">
                    <ArrowRight className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                  </div>
                </button>
              );
            })}
          </motion.div>

          <p className="text-[11px] text-slate-400 pt-1 font-mono">
            💡 Selecione uma opção acima para destravar a continuação do vídeo.
          </p>

        </div>
      </motion.div>
    </AnimatePresence>
  );
};
