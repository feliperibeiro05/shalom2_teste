// src/components/journal/NewsStreamCard.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { JournalArticle } from '../../contexts/JournalContext'; 

interface NewsStreamCardProps {
  article: JournalArticle;
}

// Garanta que 'export const' esteja correto
export const NewsStreamCard: React.FC<NewsStreamCardProps> = ({ article }) => {
  return (
    <motion.a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      className="relative w-72 h-48 rounded-lg overflow-hidden flex-shrink-0 cursor-pointer shadow-lg"
      whileHover={{ scale: 1.05, zIndex: 10 }}
      transition={{ duration: 0.2 }}
    >
      <img
        src={article.image}
        alt={article.title}
        className="w-full h-full object-cover absolute inset-0"
        onError={(e) => { e.currentTarget.style.display = 'none'; }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 to-transparent flex flex-col justify-end p-4">
        <h3 className="text-lg font-bold text-white line-clamp-2">
          {article.title}
        </h3>
        <p className="text-xs text-gray-400 line-clamp-1 mt-1">
          Por {article.author}
        </p>
      </div>
    </motion.a>
  );
};