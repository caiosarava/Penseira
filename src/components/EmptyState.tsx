'use client';

import React from 'react';
import { Sparkles, HelpCircle, ArrowRight, Brain, Target, Layers } from 'lucide-react';
import { useChat } from '@/context/ChatContext';
import { MENTAL_MODELS } from '@/data/mentalModels';

interface EmptyStateProps {
  onOpenMentalModels: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ onOpenMentalModels }) => {
  const { userName, sendMessage, activeSession } = useChat();

  const starterQuestions = [
    'Estou tendo dificuldades para definir a prioridade das minhas tarefas esta semana.',
    'Quero tomar uma decisão importante de carreira, mas não sei por onde começar.',
    'Preciso entender a causa raiz de um problema recorrente no meu trabalho/projeto.',
    'Como posso avaliar os riscos de lançar um novo produto ou projeto agora?',
  ];

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 max-w-3xl mx-auto w-full my-auto text-center space-y-8 animate-fade-in">
      {/* Hero Icon */}
      <div className="relative">
        <div className="w-16 h-16 rounded-2xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 flex items-center justify-center font-black text-2xl shadow-xl">
          P
        </div>
        <div className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border-2 border-white dark:border-zinc-950">
          <Sparkles className="w-4 h-4" />
        </div>
      </div>

      {/* Greeting Header */}
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">
          {userName ? `Olá, ${userName}!` : 'Olá! Eu sou o Penseira.'}
        </h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 max-w-lg mx-auto leading-relaxed">
          Coloque seu <strong className="text-zinc-900 dark:text-zinc-100 font-semibold">chapéu de pensar</strong>. Sou seu parceiro de reflexão (co-thinker) para te ajudar a estruturar e desatar nós de problemas complexos.
        </p>
      </div>

      {/* Mental Model Pickers */}
      <div className="w-full space-y-3">
        <div className="flex items-center justify-between text-xs font-semibold text-zinc-500 dark:text-zinc-400 px-1">
          <span>Escolha uma abordagem mental para guiar:</span>
          <button
            onClick={onOpenMentalModels}
            className="text-zinc-900 dark:text-zinc-100 hover:underline flex items-center gap-1 font-bold"
          >
            <span>Ver todos</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {MENTAL_MODELS.slice(0, 3).map((model) => (
            <button
              key={model.id}
              onClick={() => sendMessage(model.promptSuggestion, model.name)}
              className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 bg-white dark:bg-zinc-900/60 text-left transition group shadow-sm flex flex-col justify-between"
            >
              <div>
                <span className="inline-block p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 mb-2 group-hover:scale-105 transition-transform">
                  <Brain className="w-4 h-4" />
                </span>
                <h3 className="font-bold text-xs text-zinc-900 dark:text-zinc-100 mb-1">
                  {model.name}
                </h3>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-2">
                  {model.description}
                </p>
              </div>
              <div className="mt-3 text-[10px] font-semibold text-zinc-900 dark:text-zinc-100 group-hover:underline">
                Aplicar técnica &rarr;
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Suggested Starter Questions */}
      <div className="w-full space-y-2">
        <span className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block text-left px-1">
          Ou comece direto com um dilema:
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {starterQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => sendMessage(q)}
              className="p-3 text-left rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900/80 text-xs text-zinc-700 dark:text-zinc-300 font-medium transition"
            >
              "{q}"
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
