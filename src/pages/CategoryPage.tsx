// src/pages/CategoryPage.tsx
import React, { useEffect } from 'react'; 
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Sparkles, AlertTriangle } from 'lucide-react';
import { useJournal } from '../contexts/JournalContext';
import { ArticleGridCard } from './Journal'; // Reutilizamos o card de grid existente do Journal.tsx
import { Button } from '../components/ui/Button';

export const CategoryPage: React.FC = () => {
  const { categoryName } = useParams<{ categoryName: string }>();
  const navigate = useNavigate();
  // Agora usamos a função fetchArticles do contexto para buscar a categoria específica
  const { articles, loading, error, fetchArticles } = useJournal(); 

  // Normaliza o nome da categoria para exibição (ex: "tecnologia" -> "Tecnologia")
  const displayCategoryName = categoryName ? categoryName.replace(/-/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : 'Categoria Desconhecida';

  useEffect(() => {
    if (categoryName) {
      // Quando a página da categoria é montada ou o categoryName muda,
      // pedimos ao contexto para buscar artigos SOMENTE para esta categoria
      // e com um tamanho de página maior (ex: 50 ou 100). Usei 50 aqui.
      fetchArticles(categoryName, 50); 
    }
    // IMPORTANTE: Se você quisesse que a página principal do Journal mantivesse seus artigos
    // em cache *separadamente* dos artigos de categoria, a lógica no JournalContext
    // precisaria ser mais complexa (ex: ter dois estados de artigos: um para geral, outro para categoria).
    // Por enquanto, o JournalContext armazena os artigos que foram *últimos* solicitados.
  }, [categoryName, fetchArticles]);


  const handleBack = () => {
    navigate(-1); // Volta para a página anterior
  };

  if (loading) {
    return (
      <div className="p-8 bg-black/30 rounded-3xl text-center min-h-[500px] flex items-center justify-center flex-col">
        <span className="animate-spin h-12 w-12 rounded-full border-t-2 border-b-2 border-blue-500 mx-auto"></span>
        <p className="text-gray-400 mt-4">Carregando artigos de "{displayCategoryName}"...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 bg-black/30 rounded-3xl text-center min-h-[500px] flex items-center justify-center flex-col">
        <AlertTriangle className="h-16 w-16 text-red-500 mb-4" />
        <p className="text-red-500 text-lg">Erro ao carregar artigos: {error}</p>
        <Button onClick={() => fetchArticles(categoryName, 50)} className="mt-4">Tentar Novamente</Button>
      </div>
    );
  }

  return (
    <div className="p-8 bg-black/30 rounded-3xl space-y-8">
      <Button onClick={handleBack} variant="secondary" className="mb-6 flex items-center gap-2">
        <ArrowLeft className="h-5 w-5" /> Voltar
      </Button>

      <h1 className="text-4xl font-bold text-white mb-8">
        Notícias de <span className="text-blue-400">{displayCategoryName}</span>
      </h1>

      {articles.length === 0 ? ( // Agora usamos 'articles' diretamente do contexto
        <div className="text-center py-12">
          <Sparkles className="h-20 w-20 text-gray-500/50 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white">Nenhum artigo encontrado para "{displayCategoryName}"</h2>
          <p className="text-gray-400 mt-2">Tente outra categoria ou recarregue a página.</p>
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          transition={{ staggerChildren: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          {articles.map(article => (
            <ArticleGridCard key={article.id} article={article} />
          ))}
        </motion.div>
      )}
    </div>
  );
};