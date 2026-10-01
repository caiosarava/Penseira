import type { Metadata } from 'next';
import './globals.css';
import { ChatProvider } from '@/context/ChatContext';

export const metadata: Metadata = {
  title: 'Penseira - Seu Co-thinker de Reflexão',
  description: 'Coloque o chapéu de pensar e entenda melhor seus problemas com modelos mentais e inteligência artificial.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className="h-full antialiased">
      <body className="h-full bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans flex flex-col">
        <ChatProvider>{children}</ChatProvider>
      </body>
    </html>
  );
}
