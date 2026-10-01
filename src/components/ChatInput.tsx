'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, ArrowUp } from 'lucide-react';
import { useChat } from '@/context/ChatContext';

interface ChatInputProps {
  onOpenMentalModels: () => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onOpenMentalModels }) => {
  const { sendMessage, isGenerating, activeSession } = useChat();
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto resize textarea height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [text]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!text.trim() || isGenerating) return;

    const messageText = text;
    setText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    await sendMessage(messageText);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-950/90 backdrop-blur sticky bottom-0 z-20">
      <div className="max-w-3xl mx-auto">
        <form
          onSubmit={handleSubmit}
          className="relative bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-2xl p-2 shadow-sm focus-within:ring-2 focus-within:ring-zinc-900 dark:focus-within:ring-zinc-100 transition-all"
        >
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Qual problema ou dúvida gostaria de explorar hoje?"
            rows={1}
            disabled={isGenerating}
            className="w-full px-3 py-1.5 text-sm bg-transparent text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none resize-none min-h-[42px] max-h-[180px]"
          />

          <div className="flex items-center justify-between pt-1 border-t border-zinc-200/60 dark:border-zinc-800/60 px-2 mt-1">
            <button
              type="button"
              onClick={onOpenMentalModels}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200/60 dark:hover:bg-zinc-800 transition"
              title="Escolher Modelo Mental"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>
                {activeSession?.selectedMentalModel
                  ? `Modelo: ${activeSession.selectedMentalModel}`
                  : 'Modelo Mental'}
              </span>
            </button>

            <button
              type="submit"
              disabled={!text.trim() || isGenerating}
              className={`p-2 rounded-xl transition font-medium flex items-center justify-center ${
                text.trim() && !isGenerating
                  ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:scale-105'
                  : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed'
              }`}
            >
              {isGenerating ? (
                <div className="w-4 h-4 border-2 border-zinc-400 border-t-zinc-900 dark:border-t-zinc-100 rounded-full animate-spin" />
              ) : (
                <ArrowUp className="w-4 h-4 stroke-[2.5]" />
              )}
            </button>
          </div>
        </form>

        <p className="text-[11px] text-center text-zinc-400 dark:text-zinc-500 mt-2">
          Penseira é o seu co-thinker de reflexão. Pressione Enter para enviar, Shift + Enter para quebra de linha.
        </p>
      </div>
    </div>
  );
};
