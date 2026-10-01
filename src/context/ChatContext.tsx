'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ChatSession, Message, UserProfile } from '@/types/chat';

interface ChatContextType {
  sessions: ChatSession[];
  activeSession: ChatSession | null;
  activeSessionId: string | null;
  userName: string;
  isGenerating: boolean;
  error: string | null;
  setUserName: (name: string) => void;
  createNewSession: (mentalModelId?: string) => string;
  switchSession: (id: string) => void;
  deleteSession: (id: string) => void;
  clearAllSessions: () => void;
  sendMessage: (content: string, mentalModelOverride?: string) => Promise<void>;
  setError: (err: string | null) => void;
}

const STORAGE_KEYS = {
  SESSIONS: 'penseira_sessions_v1',
  ACTIVE_ID: 'penseira_active_id_v1',
  USER_PROFILE: 'penseira_user_profile_v1',
};

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [userName, setUserNameState] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  // Load state from localStorage on mount
  useEffect(() => {
    try {
      const storedProfile = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
      if (storedProfile) {
        const parsedProfile: UserProfile = JSON.parse(storedProfile);
        if (parsedProfile.name) {
          setUserNameState(parsedProfile.name);
        }
      }

      const storedSessions = localStorage.getItem(STORAGE_KEYS.SESSIONS);
      let loadedSessions: ChatSession[] = [];
      if (storedSessions) {
        loadedSessions = JSON.parse(storedSessions);
        setSessions(loadedSessions);
      }

      const storedActiveId = localStorage.getItem(STORAGE_KEYS.ACTIVE_ID);
      if (storedActiveId && loadedSessions.some((s) => s.id === storedActiveId)) {
        setActiveSessionId(storedActiveId);
      } else if (loadedSessions.length > 0) {
        setActiveSessionId(loadedSessions[0].id);
      }
    } catch (e) {
      console.error('Error loading from localStorage:', e);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  // Save sessions to localStorage whenever they change
  useEffect(() => {
    if (!isInitialized) return;
    try {
      localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
    } catch (e) {
      console.error('Failed to save sessions:', e);
    }
  }, [sessions, isInitialized]);

  // Save activeSessionId to localStorage
  useEffect(() => {
    if (!isInitialized) return;
    try {
      if (activeSessionId) {
        localStorage.setItem(STORAGE_KEYS.ACTIVE_ID, activeSessionId);
      } else {
        localStorage.removeItem(STORAGE_KEYS.ACTIVE_ID);
      }
    } catch (e) {
      console.error('Failed to save active session ID:', e);
    }
  }, [activeSessionId, isInitialized]);

  const setUserName = (name: string) => {
    setUserNameState(name);
    try {
      const profile: UserProfile = { name, lastActive: Date.now() };
      localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
    } catch (e) {
      console.error('Failed to save user profile:', e);
    }
  };

  const createNewSession = useCallback((mentalModelId?: string): string => {
    const newId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newSession: ChatSession = {
      id: newId,
      title: 'Nova Reflexão',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: [],
      selectedMentalModel: mentalModelId,
    };

    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newId);
    setError(null);
    return newId;
  }, []);

  const switchSession = useCallback((id: string) => {
    setActiveSessionId(id);
    setError(null);
  }, []);

  const deleteSession = useCallback(
    (id: string) => {
      setSessions((prev) => {
        const filtered = prev.filter((s) => s.id !== id);
        if (activeSessionId === id) {
          const nextActive = filtered[0]?.id || null;
          setActiveSessionId(nextActive);
        }
        return filtered;
      });
    },
    [activeSessionId]
  );

  const clearAllSessions = useCallback(() => {
    setSessions([]);
    setActiveSessionId(null);
    try {
      localStorage.removeItem(STORAGE_KEYS.SESSIONS);
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_ID);
    } catch (e) {
      console.error('Failed to clear sessions:', e);
    }
  }, []);

  const activeSession = sessions.find((s) => s.id === activeSessionId) || null;

  const sendMessage = async (content: string, mentalModelOverride?: string) => {
    if (!content.trim() || isGenerating) return;

    setError(null);
    let currentSessionId = activeSessionId;
    let targetSession = activeSession;

    // If no active session, create one
    if (!currentSessionId || !targetSession) {
      currentSessionId = createNewSession(mentalModelOverride);
      targetSession = {
        id: currentSessionId,
        title: 'Nova Reflexão',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        messages: [],
        selectedMentalModel: mentalModelOverride,
      };
    }

    const selectedModel = mentalModelOverride || targetSession.selectedMentalModel;

    const userMsg: Message = {
      id: `msg_user_${Date.now()}`,
      role: 'user',
      content: content.trim(),
      timestamp: Date.now(),
    };

    const isFirstMessage = targetSession.messages.length === 0;
    const newTitle = isFirstMessage
      ? content.slice(0, 32) + (content.length > 32 ? '...' : '')
      : targetSession.title;

    // Append user message
    const updatedMessagesWithUser = [...targetSession.messages, userMsg];

    setSessions((prev) =>
      prev.map((s) =>
        s.id === currentSessionId
          ? {
              ...s,
              title: newTitle,
              updatedAt: Date.now(),
              selectedMentalModel: selectedModel,
              messages: updatedMessagesWithUser,
            }
          : s
      )
    );

    setIsGenerating(true);

    const assistantMsgId = `msg_ast_${Date.now()}`;
    const initialAssistantMsg: Message = {
      id: assistantMsgId,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
    };

    // Add empty assistant message placeholder
    setSessions((prev) =>
      prev.map((s) =>
        s.id === currentSessionId
          ? {
              ...s,
              messages: [...updatedMessagesWithUser, initialAssistantMsg],
            }
          : s
      )
    );

    try {
      // Get last few topics from past sessions for context summary
      const lastTopics = sessions
        .filter((s) => s.id !== currentSessionId && s.messages.length > 0)
        .slice(0, 3)
        .map((s) => s.title);

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessagesWithUser.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          userName,
          lastTopics,
          selectedMentalModel: selectedModel,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Erro do servidor (${response.status})`);
      }

      if (!response.body) {
        throw new Error('Nenhuma resposta recebida do servidor.');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        accumulatedContent += chunk;

        setSessions((prev) =>
          prev.map((s) => {
            if (s.id !== currentSessionId) return s;
            const updated = s.messages.map((m) =>
              m.id === assistantMsgId ? { ...m, content: accumulatedContent } : m
            );
            return { ...s, messages: updated, updatedAt: Date.now() };
          })
        );
      }
    } catch (err: any) {
      console.error('Error sending message:', err);
      const errorMessage = err?.message || 'Falha na comunicação com a inteligência artificial.';
      setError(errorMessage);

      // Remove assistant placeholder on failure if empty
      setSessions((prev) =>
        prev.map((s) => {
          if (s.id !== currentSessionId) return s;
          const filtered = s.messages.filter((m) => !(m.id === assistantMsgId && !m.content));
          return { ...s, messages: filtered };
        })
      );
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <ChatContext.Provider
      value={{
        sessions,
        activeSession,
        activeSessionId,
        userName,
        isGenerating,
        error,
        setUserName,
        createNewSession,
        switchSession,
        deleteSession,
        clearAllSessions,
        sendMessage,
        setError,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
