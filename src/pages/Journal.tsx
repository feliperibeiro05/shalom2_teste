import React from 'react';
import { motion } from 'framer-motion';
import { Newspaper, Star } from 'lucide-react';
import { useJournal } from '../contexts/JournalContext';

// Define o layout do card de notícia em destaque na barra lateral
const FeaturedArticleCard: React.FC<{ article: any }> = ({ article }) => {
  return (
    <div className="flex items-center gap-4 bg-gray-800/50 p-3 rounded-lg cursor-pointer hover:bg-gray-700/50 transition-colors">
      <div className="flex-shrink-0 w-12 h-12 rounded-full overflow-hidden">
        <img
          src={article.image}
          alt={article.title}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="flex flex-col">
        <h3 className="text-sm font-semibold text-white mb-1 line-clamp-1">
          {article.title}
        </h3>
        <p className="text-xs text-gray-400 line-clamp-2">
          {article.summary}
        </p>
      </div>
    </div>
  );
};

// Define o layout do card de notícia na grade principal
const ArticleGridCard: React.FC<{ article: any }> = ({ article }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-gray-800/50 rounded-xl overflow-hidden cursor-pointer hover:bg-gray-700/50 transition-colors"
    >
      <div className="relative w-full h-40">
        <img
          src={article.image}
          alt={article.title}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-4">
        <h3 className="text-lg font-medium text-white mb-2">
          {article.title}
        </h3>
        <p className="text-gray-400 text-sm line-clamp-2">
          {article.summary}
        </p>
      </div>
    </motion.div>
  );
};

export const Journal: React.FC = () => {
  const { articles, loading, error } = useJournal();

  const featuredArticles = articles.filter(article => article.isFeatured);
  const mainArticles = articles.filter(article => !article.isFeatured);

  return (
    <div className="p-8 bg-black/30 rounded-3xl">
      {/* Header com o título "Jornal" */}
      <h1 className="text-3xl font-bold text-white mb-8">Jornal</h1>

      {/* Layout de duas colunas */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {/* Coluna da Barra Lateral - Notícias em Destaque */}
        <div className="md:col-span-1 space-y-6">
          <div className="flex items-center gap-2 text-white">
            <Star className="w-5 h-5 text-yellow-400" />
            <h2 className="text-xl font-semibold">Notícias em Destaque</h2>
          </div>
          <div className="space-y-4">
            {featuredArticles.map((article) => (
              <FeaturedArticleCard key={article.id} article={article} />
            ))}
          </div>
        </div>

        {/* Coluna Principal - Grade de Artigos */}
        <div className="md:col-span-2 lg:col-span-3">
          {loading && (
            <div className="flex justify-center items-center h-full text-white">
              <span className="animate-spin h-8 w-8 rounded-full border-4 border-t-blue-500"></span>
              <p className="ml-4">Carregando...</p>
            </div>
          )}
          {error && <p className="text-center text-red-500">{error}</p>}
          {!loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mainArticles.map((article) => (
                <ArticleGridCard key={article.id} article={article} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};