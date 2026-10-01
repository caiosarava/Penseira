'use client';

import React from 'react';
import { X, Sparkles, Check, HelpCircle, Layers, RotateCcw, TrendingUp, Grid, Target } from 'lucide-react';
import { MENTAL_MODELS } from '@/data/mentalModels';
import { MentalModel } from '@/types/chat';

interface MentalModelSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectModel: (model: MentalModel) => void;
  selectedModelId?: string;
}

const getIcon = (name: string) => {
  switch (name) {
    case 'HelpCircle':
      return <HelpCircle className="w-5 h-5" />;
    case 'Layers':
      return <Layers className="w-5 h-5" />;
    case 'RotateCcw':
      return <RotateCcw className="w-5 h-5" />;
    case 'TrendingUp':
      return <TrendingUp className="w-5 h-5" />;
    case 'Grid':
      return <Grid className="w-5 h-5" />;
    case 'Target':
      return <Target className="w-5 h-5" />;
    default:
      return <Sparkles className="w-5 h-5" />;
  }
};

export const MentalModelSelectorModal: React.FC<MentalModelSelectorModalProps> = ({
  isOpen,
  onClose,
  onSelectModel,
  selectedModelId,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                Modelos Mentais de Reflexão
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Escolha uma lente conceitual para estruturar a conversa com o Penseira.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-3">
          {MENTAL_MODELS.map((model) => {
            const isSelected = model.id === selectedModelId || model.name === selectedModelId;
            return (
              <div
                key={model.id}
                onClick={() => {
                  onSelectModel(model);
                  onClose();
                }}
                className={`group cursor-pointer p-4 rounded-xl border transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'border-zinc-900 dark:border-zinc-100 bg-zinc-50 dark:bg-zinc-800/80 shadow-sm'
                    : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 bg-white dark:bg-zinc-900/50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 group-hover:scale-105 transition-transform">
                      {getIcon(model.iconName)}
                    </span>
                    {isSelected && (
                      <span className="p-1 rounded-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900">
                        <Check className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 mb-1">
                    {model.name}
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2">
                    {model.description}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-zinc-100 dark:border-zinc-800/60 flex items-center justify-between text-[11px] text-zinc-400 font-medium">
                  <span>{model.category}</span>
                  <span className="text-zinc-900 dark:text-zinc-100 font-semibold group-hover:underline">
                    Usar lente &rarr;
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
