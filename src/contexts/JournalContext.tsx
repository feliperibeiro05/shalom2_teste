// src/contexts/JournalContext.tsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid'; // Mantenha a geração de IDs únicos

export interface JournalArticle {
  id: string;
  title: string;
  summary: string;
  author: string;
  image: string;
  isFeatured: boolean; // Pode ser útil para a página principal, mas não para CategoryPage
  url: string;
}

interface JournalContextType {
  articles: JournalArticle[];
  loading: boolean;
  error: string | null;
  // Agora fetchArticles pode aceitar uma categoria e um tamanho de página
  fetchArticles: (category?: string, customPageSize?: number) => Promise<void>;
}

const JournalContext = createContext<JournalContextType | undefined>(undefined);

// Função para gerar uma imagem de fallback com base no título da notícia
const generateFallbackImage = (title: string): string => {
  // Usando um serviço de placeholder mais genérico ou a sua lógica Picsum
  return `https://via.placeholder.com/600x400?text=${encodeURIComponent(title.split(' ').slice(0, 2).join(' '))}`;
  // Ou o seu original:
  // return `https://picsum.photos/seed/${encodeURIComponent(title)}/600/400`;
};

export const JournalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [articles, setArticles] = useState<JournalArticle[]>([]);
  const [loading, setLoading] = useState(false); // Mudado para false para evitar spinner inicial desnecessário
  const [error, setError] = useState<string | null>(null);

  const NEWS_API_KEY = import.meta.env.VITE_NEWS_API_KEY; 
  // Alterado para a rota 'everything' que permite busca por palavra-chave mais robusta
  const BASE_NEWS_API_URL = 'https://newsapi.org/v2/everything'; 

  const fetchArticles = useCallback(async (category?: string, customPageSize: number = 20) => {
    setLoading(true);
    setError(null);
    
    try {
      if (!NEWS_API_KEY) {
        throw new Error("Chave da NewsAPI não configurada. Verifique `VITE_NEWS_API_KEY` em seu .env.");
      }

      // Constrói a URL dinamicamente com base na categoria e tamanho da página
      let url = `${BASE_NEWS_API_URL}?apiKey=${NEWS_API_KEY}&language=pt&sortBy=relevancy`; // Use 'relevancy' para 'everything'

      if (category) {
        url += `&q=${encodeURIComponent(category)}`; // Adiciona a categoria à query
        console.log(`JournalContext: Buscando artigos para a categoria: "${category}" com pageSize: ${customPageSize}`);
      } else {
        // Busca ampla para a página principal se nenhuma categoria for fornecida
        url += `&q=${encodeURIComponent('tecnologia OR saúde OR finanças OR ciência OR negócios OR entretenimento OR lifestyle')}`;
        console.log(`JournalContext: Buscando artigos gerais com pageSize: ${customPageSize}`);
      }
      
      url += `&pageSize=${customPageSize}`; // Adiciona o tamanho da página

      const response = await fetch(url);
      const data = await response.json();

      if (data.status === 'error') {
        throw new Error(`Erro da NewsAPI: ${data.message || 'Detalhes desconhecidos.'}`);
      }

      if (!response.ok) {
        throw new Error(`Erro HTTP ao buscar notícias: ${response.status} - ${response.statusText}`);
      }

      if (data.articles && data.articles.length > 0) {
        const processedArticles: JournalArticle[] = data.articles
          .filter((apiArticle: any) => apiArticle.title && apiArticle.url) // Garante que artigos têm título e URL
          .map((apiArticle: any, index: number) => {
            const imageUrl = (apiArticle.urlToImage && typeof apiArticle.urlToImage === 'string' && apiArticle.urlToImage.startsWith('http')) 
                             ? apiArticle.urlToImage 
                             : generateFallbackImage(apiArticle.title);

            return {
              id: uuidv4(), // Mantendo seu uuidv4
              title: apiArticle.title || 'Título Indisponível',
              summary: apiArticle.description || apiArticle.content?.substring(0, 150) || 'Nenhuma descrição disponível.',
              author: apiArticle.author || apiArticle.source?.name || 'Autor Desconhecido',
              image: imageUrl,
              isFeatured: false, // isFeatured será gerenciado pelo Journal.tsx (página principal)
              url: apiArticle.url || '#',
            };
          });
        setArticles(processedArticles);
        console.log(`JournalContext: Artigos carregados: ${processedArticles.length}`);
      } else {
        setArticles([]);
        setError('Nenhum artigo encontrado. Tente ajustar os parâmetros da API.');
      }
    } catch (err: any) {
      console.error("Erro ao buscar artigos da NewsAPI:", err);
      setError(`Não foi possível carregar as notícias: ${err.message}.`);
      setArticles([]); 
    } finally {
      setLoading(false);
    }
  }, [NEWS_API_KEY]); // Dependências do useCallback

  useEffect(() => {
    // Carrega artigos gerais apenas uma vez na montagem inicial do provedor, se não houver artigos
    if (articles.length === 0 && !loading && NEWS_API_KEY) {
      fetchArticles(); // Chama sem categoria para a lista geral (padrão pageSize: 20)
    }
  }, [fetchArticles, articles.length, loading, NEWS_API_KEY]);

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