import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { format, addDays } from 'date-fns';
import { useAuth } from './AuthContext';

export interface JournalArticle {
  id: string;
  title: string;
  summary: string;
  author: string;
  image: string;
  isFeatured: boolean;
  content?: string;
}

interface JournalContextType {
  articles: JournalArticle[];
  loading: boolean;
  error: string | null;
  fetchArticles: () => void;
}

const JournalContext = createContext<JournalContextType | undefined>(undefined);

// Lista completa de artigos para preencher o layout da imagem
const SAMPLE_ARTICLES: Omit<JournalArticle, 'id'>[] = [
  // Artigos em Destaque (Barra Lateral)
  {
    title: 'Pressupostos Sem Destaque',
    summary: 'Aprenda a fazer um orçamento, economizar de forma inteligente e investir seu dinheiro para alcançar a liberdade financeira.',
    author: 'Bestiçaria Pelo Destaque',
    image: 'https://images.unsplash.com/photo-1543269865-c3359d95fe36?q=80&w=2070',
    isFeatured: true,
  },
  {
    title: 'Bestiçaria Pelo Destaque',
    summary: 'Em um mundo de constante distração, a capacidade de focar é uma habilidade cada vez mais rara.',
    author: 'Fernanda Martins',
    image: 'https://images.unsplash.com/photo-1582213782172-ac32b254a613?q=80&w=2070',
    isFeatured: true,
  },
  {
    title: 'Como a Compostagem de Comodidade',
    summary: 'O autoconhecimento é o pilar de qualquer jornada de desenvolvimento pessoal. O autor argumenta que, sem entender nossas próprias motivações e fraquezas.',
    author: 'Henrique Borges',
    image: 'https://images.unsplash.com/photo-1549497042-7db219277d33?q=80&w=2070',
    isFeatured: true,
  },
  {
    title: 'Weitre ade puisida',
    summary: 'O trabalho remoto trouxe flexibilidade, mas também novos desafios. O autor discute o impacto na socialização, na cultura da empresa e na saúde mental dos funcionários.',
    author: 'Júlio Medeiros',
    image: 'https://images.unsplash.com/photo-1542435503-455b341f23c9?q=80&w=2070',
    isFeatured: true,
  },
  
  // Artigos Principais (Grade)
  {
    title: 'Descubra o Poder da Manhã',
    summary: 'Adote uma rotina matinal que estimule a mente, aumente sua produtividade e prepare você para um dia de sucesso.',
    author: 'Autor',
    image: 'https://images.unsplash.com/photo-1600880292203-757bb62b2baf?q=80&w=1770',
    isFeatured: false,
  },
  {
    title: 'Mindfulness para Reduzir o Estresse',
    summary: 'Aprenda técnicas de atenção plena para combater a ansiedade e cultivar a serenidade em sua vida diária.',
    author: 'Autor',
    image: 'https://images.unsplash.com/photo-1549497042-7db219277d33?q=80&w=2070',
    isFeatured: false,
  },
  {
    title: 'Mindfulness para o Sucesso',
    summary: 'Tenha uma vida mais leve e serena, aprenda como o minimalismo e hábitos simples podem levar para a felicidade plena.',
    author: 'Autor',
    image: 'https://images.unsplash.com/photo-1549497042-7db219277d33?q=80&w=2070',
    isFeatured: false,
  },
  {
    title: 'Hábitos Essenciais para o Sucesso',
    summary: 'Nesse artigo, descubra como a sua casa de campo, costelas e costalessete dulre para profundade.',
    author: 'Autor',
    image: 'https://images.unsplash.com/photo-1549497042-7db219277d33?q=80&w=2070',
    isFeatured: false,
  },
  {
    title: 'Ceppinita de Onittara',
    summary: 'Teore em oninita',
    author: 'Autor',
    image: 'https://images.unsplash.com/photo-1543269865-c3359d95fe36?q=80&w=2070',
    isFeatured: false,
  },
  {
    title: 'Aflolciar para o Sucesso',
    summary: 'Descubra como os circuitos cerebrais de recompensa podem ser hackeados para facilitar a criação de novos hábitos.',
    author: 'Autor',
    image: 'https://images.unsplash.com/photo-1543269865-c3359d95fe36?q=80&w=2070',
    isFeatured: false,
  },
  {
    title: 'Copa e Reputena',
    summary: 'Aprenda a fazer um orçamento, economizar de forma inteligente e investir seu dinheiro para alcançar a liberdade financeira.',
    author: 'Autor',
    image: 'https://images.unsplash.com/photo-1543269865-c3359d95fe36?q=80&w=2070',
    isFeatured: false,
  },
  {
    title: 'Weitre ade puisida',
    summary: 'Em um mundo de constante distração, a capacidade de focar é uma habilidade cada vez mais rara.',
    author: 'Autor',
    image: 'https://images.unsplash.com/photo-1543269865-c3359d95fe36?q=80&w=2070',
    isFeatured: false,
  },
];

export const JournalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [articles, setArticles] = useState<JournalArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const fetchArticles = useCallback(() => {
    try {
      setLoading(true);
      setError(null);
      const fetchedArticles = SAMPLE_ARTICLES.map(article => ({ ...article, id: uuidv4() }));
      setArticles(fetchedArticles as JournalArticle[]);
    } catch (err) {
      setError('Erro ao carregar artigos.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  return (
    <JournalContext.Provider value={{
      articles,
      loading,
      error,
      fetchArticles,
    }}>
      {children}
    </JournalContext.Provider>
  );
};

export const useJournal = () => {
  const context = useContext(JournalContext);
  if (!context) {
    throw new Error('useJournal must be used within a JournalProvider');
  }
  return context;
};