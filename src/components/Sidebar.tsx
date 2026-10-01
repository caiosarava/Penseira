'use client';

import React from 'react';
import {
  Plus,
  MessageSquare,
  Trash2,
  X,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import { useChat } from '@/context/ChatContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenMentalModels: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, onOpenMentalModels }) => {
  const {
    sessions,
    activeSessionId,
    switchSession,
    deleteSession,
    createNewSession,
    clearAllSessions,
  } = useChat();

  const handleSelectSession = (id: string) => {
    switchSession(id);
    if (window.innerWidth < 768) {
      onClose();
    }
  };

  const handleNewSession = () => {
    createNewSession();
    if (window.innerWidth < 768) {
      onClose();
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed md:static top-0 left-0 bottom-0 z-50 w-72 bg-zinc-50 dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800 flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-base text-zinc-900 dark:text-zinc-100">
            <div className="w-6 h-6 rounded bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 flex items-center justify-center font-bold text-xs">
              P
            </div>
            <span>Penseira</span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 md:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Primary Action Button */}
        <div className="p-3">
          <button
            onClick={handleNewSession}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 font-medium text-sm transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Reflexão</span>
          </button>
        </div>

        {/* Mental Models Quick Access */}
        <div className="px-3 py-2">
          <button
            onClick={() => {
              onOpenMentalModels();
              if (window.innerWidth < 768) onClose();
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg text-zinc-700 dark:text-zinc-300 bg-zinc-200/60 dark:bg-zinc-900/60 hover:bg-zinc-200 dark:hover:bg-zinc-900 transition"
          >
            <Sparkles className="w-4 h-4 text-zinc-900 dark:text-zinc-100" />
            <span>Modelos Mentais</span>
          </button>
        </div>

        {/* Chat History List */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
          <div className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider px-2 mb-1">
            Histórico
          </div>

          {sessions.length === 0 ? (
            <div className="text-xs text-zinc-400 dark:text-zinc-600 px-2 py-4 text-center">
              Nenhuma conversa armazenada.
            </div>
          ) : (
            sessions.map((session) => {
              const isActive = session.id === activeSessionId;
              return (
                <div
                  key={session.id}
                  className={`group relative flex items-center rounded-lg transition text-xs font-medium ${
                    isActive
                      ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100'
                      : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-zinc-200'
                  }`}
                >
                  <button
                    onClick={() => handleSelectSession(session.id)}
                    className="flex-1 flex items-center gap-2 p-2.5 text-left truncate min-w-0"
                  >
                    <MessageSquare className="w-3.5 h-3.5 shrink-0 opacity-70" />
                    <span className="truncate">{session.title}</span>
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteSession(session.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1.5 mr-1 text-zinc-400 hover:text-red-500 dark:hover:text-red-400 transition"
                    title="Excluir reflexão"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Actions */}
        {sessions.length > 0 && (
          <div className="p-3 border-t border-zinc-200 dark:border-zinc-800">
            <button
              onClick={() => {
                if (confirm('Deseja realmente limpar todo o histórico local?')) {
                  clearAllSessions();
                }
              }}
              className="w-full flex items-center justify-center gap-2 py-2 text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Limpar Histórico</span>
            </button>
          </div>
        )}
      </aside>
    </>
  );
};
