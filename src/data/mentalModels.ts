import { MentalModel } from '@/types/chat';

export const MENTAL_MODELS: MentalModel[] = [
  {
    id: '5-whys',
    name: 'Os 5 Porquês',
    description: 'Pergunta "Por quê?" repetidamente para encontrar a causa raiz de um problema.',
    category: 'Análise de Causa',
    iconName: 'HelpCircle',
    promptSuggestion: 'Gostaria de aplicar a técnica dos 5 Porquês para investigar a causa raiz do meu problema.',
  },
  {
    id: 'first-principles',
    name: 'Princípios Fundamentais',
    description: 'Desconstrói o problema até suas verdades irredutíveis e reconstrói a solução do zero.',
    category: 'Inovação & Desconstrução',
    iconName: 'Layers',
    promptSuggestion: 'Vamos desconstruir esse problema em seus Princípios Fundamentais mais básicos.',
  },
  {
    id: 'inversion',
    name: 'Inversão',
    description: 'Em vez de pensar em como vencer, pensa em como evitar o fracasso catastrófico.',
    category: 'Gestão de Risco',
    iconName: 'RotateCcw',
    promptSuggestion: 'Como posso usar o pensamento de Inversão para descobrir o que PODE dar errado aqui?',
  },
  {
    id: 'second-order-thinking',
    name: 'Pensamento de 2ª Ordem',
    description: 'Avalia não apenas o efeito imediato, mas as consequências das consequências no longo prazo.',
    category: 'Estratégia',
    iconName: 'TrendingUp',
    promptSuggestion: 'Quais são as consequências de segunda e terceira ordem dessa decisão no futuro?',
  },
  {
    id: 'eisenhower-matrix',
    name: 'Matriz de Eisenhower',
    description: 'Prioriza ações com base em Urgência vs. Importância para evitar apagamento de incêndios.',
    category: 'Priorização',
    iconName: 'Grid',
    promptSuggestion: 'Ajude-me a classificar os aspectos desse problema entre urgente e importante.',
  },
  {
    id: 'root-cause',
    name: 'Análise de Causa Raiz',
    description: 'Diferencia os sintomas superficiais dos fatores estruturais por trás do desafio.',
    category: 'Análise de Causa',
    iconName: 'Target',
    promptSuggestion: 'Quero separar os sintomas visíveis das causas estruturais reais deste desafio.',
  },
];
