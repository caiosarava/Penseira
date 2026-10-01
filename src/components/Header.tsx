'use client';

import React from 'react';
import { Menu, Plus, User, Sparkles } from 'lucide-react';
import { useChat } from '@/context/ChatContext';

interface HeaderProps {
  onToggleSidebar: () => void;
  onOpenNameModal: () => void;
  onOpenMentalModelsModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  onOpenNameModal,
  onOpenMentalModelsModal,
}) => {
  const { activeSession, createNewSession, userName } = useChat();

  return (
    <header className="h-14 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur sticky top-0 z-30 px-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 transition text-zinc-700 dark:text-zinc-300 md:hidden"
          title="Abrir Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 font-bold text-lg text-zinc-900 dark:text-zinc-100 tracking-tight">
          <div className="w-7 h-7 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 flex items-center justify-center font-black text-sm">
            P
          </div>
          <span className="hidden sm:inline">Penseira</span>
        </div>

        {activeSession && (
          <div className="hidden md:flex items-center gap-2 pl-3 border-l border-zinc-200 dark:border-zinc-800 text-xs text-zinc-500 dark:text-zinc-400 max-w-xs truncate">
            <span className="truncate font-medium">{activeSession.title}</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        {activeSession?.selectedMentalModel && (
          <button
            onClick={onOpenMentalModelsModal}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="capitalize">{activeSession.selectedMentalModel}</span>
          </button>
        )}

        <button
          onClick={onOpenNameModal}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-xs text-zinc-700 dark:text-zinc-300 font-medium transition"
          title="Definir seu nome"
        >
          <User className="w-3.5 h-3.5" />
          <span>{userName || 'Seu Nome'}</span>
        </button>

        <button
          onClick={() => createNewSession()}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 text-xs font-semibold transition"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Nova Reflexão</span>
        </button>
      </div>
    </header>
  );
};
