// src/pages/Journal.tsx
import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Newspaper, Star, Brain, Sparkles, Flame, LayoutGrid } from 'lucide-react';
import { useNavigate } from 'react-router-dom'; // Importe useNavigate
import { useJournal, JournalArticle } from '../contexts/JournalContext';
import { NewsCategoryRow } from '../components/journal/NewsCategoryRow'; 
// Não precisamos do NewsStreamCard aqui diretamente no Journal.tsx se ele só for usado no NewsCategoryRow.
// import { NewsStreamCard } from '../components/journal/NewsStreamCard'; 
import { Button } from '../components/ui/Button'; 

// Card para a seção de "Notícias em Destaque" (barra lateral)
const FeaturedArticleCard: React.FC<{ article: JournalArticle }> = ({ article }) => {
  return (
    <motion.a 
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="flex items-start gap-4 p-3 rounded-lg cursor-pointer hover:bg-gray-700/50 transition-colors"
    >
      {article.image && (
        <div className="flex-shrink-0 w-12 h-12 rounded-full overflow-hidden">
          <img
            src={article.image}
            alt={article.title}
            className="w-full h-full object-cover"
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
        </div>
      )}
      <div className="flex flex-col flex-grow">
        <h3 className="text-sm font-semibold text-white mb-1">
          {article.title}
        </h3>
        <p className="text-xs text-gray-400 line-clamp-2">
          {article.summary}
        </p>
      </div>
    </motion.a>
  );
};

// Card para a grade principal de artigos
// AGORA EXPORTAMOS ESTE COMPONENTE para que CategoryPage possa reutilizá-lo
export const ArticleGridCard: React.FC<{ article: JournalArticle }> = ({ article }) => {
  return (
    <motion.a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-gray-800/50 rounded-xl overflow-hidden cursor-pointer hover:bg-gray-700/50 transition-colors relative block"
    >
      <div className="relative w-full h-48">
        {article.image ? (
          <>
            <img
              src={article.image}
              alt={article.title}
              className="w-full h-full object-cover absolute inset-0"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 to-transparent flex flex-col justify-end p-4">
              <h3 className="text-lg font-medium text-white mb-1 line-clamp-2">
                {article.title}
              </h3>
              <p className="text-gray-400 text-sm line-clamp-2">
                {article.summary}
              </p>
            </div>
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center p-4 text-center">
            <div className="flex flex-col items-center">
              <Newspaper className="h-16 w-16 text-gray-500 opacity-30 mb-2" />
              <h3 className="text-lg font-medium text-white mb-1">
                {article.title}
              </h3>
              <p className="text-gray-400 text-sm line-clamp-2">
                {article.summary}
              </p>
            </div>
          </div>
        )}
      </div>
    </motion.a>
  );
};

// Componente para o banner de destaque principal
const FeaturedNewsBanner: React.FC<{ article: JournalArticle }> = ({ article }) => {
  return (
    <motion.a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative w-full h-96 rounded-3xl overflow-hidden shadow-2xl block mb-12 cursor-pointer"
    >
      <img
        src={article.image}
        alt={article.title}
        className="w-full h-full object-cover absolute inset-0"
        onError={(e) => { e.currentTarget.style.display = 'none'; }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 to-transparent flex flex-col justify-end p-12">
        <span className="text-sm font-medium text-purple-400 mb-2">Notícia em Destaque</span>
        <h2 className="text-4xl font-bold text-white mb-2 line-clamp-2">
          {article.title}
        </h2>
        <p className="text-gray-300 text-lg line-clamp-2 max-w-2xl">
          {article.summary}
        </p>
      </div>
    </motion.a>
  );
};


export const Journal: React.FC = () => {
  const { articles, loading, error, fetchArticles } = useJournal();
  const navigate = useNavigate(); // Inicialize o hook useNavigate AQUI

  console.log("JournalPage: Total de artigos recebidos do contexto:", articles.length);

  const numFeaturedSidebar = 4; 
  const numMainGrid = 9; 

  const featuredSidebarArticles = articles.slice(0, numFeaturedSidebar);
  const remainingArticlesAfterSidebar = articles.slice(numFeaturedSidebar);
  const mainGridArticles = remainingArticlesAfterSidebar.slice(0, numMainGrid);

  const categories = ['Tecnologia', 'Saúde', 'Finanças', 'Lifestyle', 'Ciência', 'Negócios', 'Entretenimento'];

  const categorizedArticles = categories.reduce((acc, category) => {
    const filtered = articles.filter(a => 
      a.title.toLowerCase().includes(category.toLowerCase()) || 
      a.summary.toLowerCase().includes(category.toLowerCase())
    );
    acc[category] = filtered.length > 0 ? filtered.slice(0, 10) : articles.slice(0, 5); 
    return acc;
  }, {} as Record<string, JournalArticle[]>);

  const topFeaturedBannerArticle = articles[0] || null;

  useEffect(() => {
    if (articles.length === 0 && !loading && !error) {
      fetchArticles();
    }
  }, [articles.length, loading, error, fetchArticles]);

  // Função para navegar para a página de categoria
  const handleViewAllCategory = (categorySlug: string) => {
    navigate(`/dashboard/journal/category/${categorySlug}`);
  };


  if (loading) {
    return (
      <div className="p-8 bg-black/30 rounded-3xl text-center min-h-[500px] flex items-center justify-center">
        <span className="animate-spin h-12 w-12 rounded-full border-t-2 border-b-2 border-blue-500 mx-auto"></span>
        <p className="text-gray-400 mt-4 ml-4">Conectando ao universo de notícias...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 bg-black/30 rounded-3xl text-center min-h-[500px] flex items-center justify-center">
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-8">
          <p className="text-red-500 text-lg">Erro ao carregar notícias: {error}</p>
          <Button onClick={fetchArticles} className="mt-4">Tentar Novamente</Button>
        </div>
      </div>
    );
  }
  
  if (articles.length === 0) {
    return (
      <div className="p-8 bg-black/30 rounded-3xl text-center min-h-[500px] flex items-center justify-center">
        <Sparkles className="h-20 w-20 text-gray-500/50 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white">Nenhuma notícia disponível</h2>
        <p className="text-gray-400 mt-2">Parece que não encontramos nenhuma notícia no momento. Tente ajustar os parâmetros da API.</p>
        <Button onClick={fetchArticles} className="mt-4">Recarregar Notícias</Button>
      </div>
    );
  }


  return (
    <div className="p-8 bg-black/30 rounded-3xl space-y-12">
      <h1 className="text-3xl font-bold text-white">Jornal</h1>

      {topFeaturedBannerArticle && <FeaturedNewsBanner article={topFeaturedBannerArticle} />}

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
        <div className="md:col-span-1 space-y-6">
          <div className="flex items-center gap-2 text-white">
            <Star className="w-5 h-5 text-yellow-400" />
            <h2 className="text-xl font-semibold">Notícias em Destaque</h2>
          </div>
          <div className="space-y-4">
            {featuredSidebarArticles.length > 0 ? (
              featuredSidebarArticles.map((article) => (
                <FeaturedArticleCard key={article.id} article={article} />
              ))
            ) : (
              <p className="text-gray-400 p-3">Nenhuma notícia em destaque no momento.</p>
            )}
          </div>
        </div>

        <div className="md:col-span-2 lg:col-span-3">
          <div className="flex items-center gap-2 text-white mb-6">
            <LayoutGrid className="w-6 h-6 text-indigo-400" />
            <h2 className="text-2xl font-bold">Notícias Mais Recentes</h2>
          </div>
          {console.log("JournalPage: Artigos em destaque (fatiados):", featuredSidebarArticles.length)}
          {console.log("JournalPage: Artigos na grade principal (fatiados):", mainGridArticles.length)}

          {mainGridArticles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mainGridArticles.map((article) => (
                <ArticleGridCard key={article.id} article={article} />
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-400 py-12">Nenhum artigo disponível na grade principal.</p>
          )}
        </div>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 mt-12">
        <div className="flex items-center gap-4 text-white">
          <Brain className="h-8 w-8 text-blue-400" />
          <h1 className="text-3xl font-bold">Explorar por Tópicos</h1>
        </div>
        {categories.map(category => (
          <NewsCategoryRow
            key={category}
            title={category}
            articles={categorizedArticles[category] || []}
            onViewAll={handleViewAllCategory} 
          />
        ))}
      </motion.div>
    </div>
  );
};