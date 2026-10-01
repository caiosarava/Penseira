'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '@/context/ChatContext';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { ChatMessage } from '@/components/ChatMessage';
import { ChatInput } from '@/components/ChatInput';
import { EmptyState } from '@/components/EmptyState';
import { MentalModelSelectorModal } from '@/components/MentalModelSelectorModal';
import { UserNameModal } from '@/components/UserNameModal';
import { AlertCircle, Sparkles, X } from 'lucide-react';

export default function Home() {
  const { activeSession, isGenerating, error, setError, sendMessage } = useChat();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMentalModelsOpen, setIsMentalModelsOpen] = useState(false);
  const [isNameModalOpen, setIsNameModalOpen] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const messages = activeSession?.messages || [];

  // Auto scroll to bottom when messages update
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isGenerating]);

  return (
    <div className="flex h-screen overflow-hidden bg-white dark:bg-zinc-950">
      {/* Sidebar navigation */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onOpenMentalModels={() => setIsMentalModelsOpen(true)}
      />

      {/* Main Content Workspace */}
      <div className="flex-1 flex flex-col h-full min-w-0 relative">
        {/* Top Header */}
        <Header
          onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
          onOpenNameModal={() => setIsNameModalOpen(true)}
          onOpenMentalModelsModal={() => setIsMentalModelsOpen(true)}
        />

        {/* Error Notification Banner */}
        {error && (
          <div className="mx-4 mt-3 p-3 bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl flex items-start justify-between gap-3 text-xs text-zinc-800 dark:text-zinc-200 shadow-sm animate-fade-in">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-zinc-900 dark:text-zinc-100 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Aviso: </span>
                <span>{error}</span>
              </div>
            </div>
            <button
              onClick={() => setError(null)}
              className="p-1 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Main Conversation or Empty State Area */}
        <div className="flex-1 overflow-y-auto flex flex-col">
          {messages.length === 0 ? (
            <EmptyState onOpenMentalModels={() => setIsMentalModelsOpen(true)} />
          ) : (
            <div className="flex-1 py-4">
              {messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}

              {/* Typing Streaming Indicator */}
              {isGenerating &&
                messages.length > 0 &&
                messages[messages.length - 1].role === 'user' && (
                  <div className="py-4 px-4 sm:px-6 bg-zinc-100/60 dark:bg-zinc-900/60 border-y border-zinc-200/50 dark:border-zinc-800/50">
                    <div className="max-w-3xl mx-auto flex gap-4 items-center">
                      <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 flex items-center justify-center font-bold text-xs border border-zinc-300 dark:border-zinc-700">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div className="flex items-center gap-1.5 py-2">
                        <span className="w-2 h-2 rounded-full bg-zinc-800 dark:bg-zinc-200 dot-pulse" />
                        <span className="w-2 h-2 rounded-full bg-zinc-800 dark:bg-zinc-200 dot-pulse" />
                        <span className="w-2 h-2 rounded-full bg-zinc-800 dark:bg-zinc-200 dot-pulse" />
                        <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium ml-2">
                          Penseira está refletindo...
                        </span>
                      </div>
                    </div>
                  </div>
                )}

              <div ref={chatBottomRef} />
            </div>
          )}
        </div>

        {/* Bottom Input Field */}
        <ChatInput onOpenMentalModels={() => setIsMentalModelsOpen(true)} />
      </div>

      {/* Modals */}
      <MentalModelSelectorModal
        isOpen={isMentalModelsOpen}
        onClose={() => setIsMentalModelsOpen(false)}
        selectedModelId={activeSession?.selectedMentalModel}
        onSelectModel={(model) => {
          sendMessage(
            `Gostaria de estruturar essa reflexão utilizando o modelo mental "${model.name}". ${model.promptSuggestion}`,
            model.name
          );
        }}
      />

      <UserNameModal
        isOpen={isNameModalOpen}
        onClose={() => setIsNameModalOpen(false)}
      />
    </div>
  );
}
