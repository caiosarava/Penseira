'use client';

import React from 'react';
import { Message } from '@/types/chat';
import { User, Sparkles, Copy, Check } from 'lucide-react';

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === 'user';
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Helper to format basic markdown elements (bold, italic, code, list items, paragraphs)
  const formatText = (content: string) => {
    if (!content) return null;

    const lines = content.split('\n');

    return lines.map((line, idx) => {
      // Headers
      if (line.startsWith('### ')) {
        return (
          <h3 key={idx} className="font-bold text-base mt-3 mb-1 text-zinc-900 dark:text-zinc-100">
            {line.replace('### ', '')}
          </h3>
        );
      }
      if (line.startsWith('## ')) {
        return (
          <h2 key={idx} className="font-bold text-lg mt-4 mb-2 text-zinc-900 dark:text-zinc-100 border-b border-zinc-200 dark:border-zinc-800 pb-1">
            {line.replace('## ', '')}
          </h2>
        );
      }
      if (line.startsWith('# ')) {
        return (
          <h1 key={idx} className="font-extrabold text-xl mt-4 mb-2 text-zinc-900 dark:text-zinc-100">
            {line.replace('# ', '')}
          </h1>
        );
      }

      // Bullet points
      if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        const text = line.trim().substring(2);
        return (
          <li key={idx} className="ml-4 list-disc my-1 text-zinc-800 dark:text-zinc-200">
            {parseInline(text)}
          </li>
        );
      }

      // Numbered points
      const numMatch = line.trim().match(/^(\d+)\.\s+(.*)/);
      if (numMatch) {
        return (
          <li key={idx} className="ml-4 list-decimal my-1 text-zinc-800 dark:text-zinc-200">
            {parseInline(numMatch[2])}
          </li>
        );
      }

      // Empty line
      if (!line.trim()) {
        return <div key={idx} className="h-2" />;
      }

      // Standard paragraph
      return (
        <p key={idx} className="my-1.5 leading-relaxed text-zinc-800 dark:text-zinc-200">
          {parseInline(line)}
        </p>
      );
    });
  };

  // Inline formatting helper for bold (**text**), inline code (`code`), italic (*text*)
  const parseInline = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*|`.*?`|\*.*?\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={i} className="font-semibold text-zinc-900 dark:text-zinc-50">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code
            key={i}
            className="px-1.5 py-0.5 rounded text-xs font-mono bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
          >
            {part.slice(1, -1)}
          </code>
        );
      }
      if (part.startsWith('*') && part.endsWith('*')) {
        return (
          <em key={i} className="italic">
            {part.slice(1, -1)}
          </em>
        );
      }
      return part;
    });
  };

  return (
    <div
      className={`py-4 px-4 sm:px-6 transition-colors ${
        isUser
          ? 'bg-transparent'
          : 'bg-zinc-100/60 dark:bg-zinc-900/60 border-y border-zinc-200/50 dark:border-zinc-800/50'
      }`}
    >
      <div className="max-w-3xl mx-auto flex gap-4">
        {/* Avatar */}
        <div className="shrink-0">
          {isUser ? (
            <div className="w-8 h-8 rounded-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 flex items-center justify-center font-bold text-xs shadow-sm">
              <User className="w-4 h-4" />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 flex items-center justify-center font-bold text-xs border border-zinc-300 dark:border-zinc-700 shadow-sm">
              <Sparkles className="w-4 h-4" />
            </div>
          )}
        </div>

        {/* Message Body */}
        <div className="flex-1 min-w-0 text-sm">
          <div className="flex items-center justify-between mb-1">
            <span className="font-semibold text-xs text-zinc-900 dark:text-zinc-100">
              {isUser ? 'Você' : 'Penseira'}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-zinc-400">
                {new Date(message.timestamp).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
              {!isUser && message.content && (
                <button
                  onClick={handleCopy}
                  className="p-1 rounded text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition"
                  title="Copiar mensagem"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              )}
            </div>
          </div>

          <div className="prose prose-zinc dark:prose-invert max-w-none break-words">
            {formatText(message.content)}
          </div>
        </div>
      </div>
    </div>
  );
};
