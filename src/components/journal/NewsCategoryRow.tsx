// src/components/journal/NewsCategoryRow.tsx
import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { JournalArticle } from '../../contexts/JournalContext'; 
import { NewsStreamCard } from './NewsStreamCard'; 
import { Button } from '../ui/Button'; 

interface NewsCategoryRowProps {
  title: string;
  articles: JournalArticle[];
  onViewAll: (category: string) => void;
}

export const NewsCategoryRow: React.FC<NewsCategoryRowProps> = ({ title, articles, onViewAll }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScrollPosition = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      const scrollThreshold = 50; // Aumentado o limiar para uma experiência mais suave
      setCanScrollLeft(scrollLeft > scrollThreshold);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - scrollThreshold);
    }
  };

  useEffect(() => {
    checkScrollPosition();
    const currentRef = scrollRef.current;
    if (currentRef) {
      currentRef.addEventListener('scroll', checkScrollPosition);
      window.addEventListener('resize', checkScrollPosition); 
      const resizeObserver = new ResizeObserver(checkScrollPosition);
      resizeObserver.observe(currentRef);

      return () => {
        currentRef.removeEventListener('scroll', checkScrollPosition);
        window.removeEventListener('resize', checkScrollPosition);
        resizeObserver.disconnect();
      };
    }
  }, [articles]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -350 : 350;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (articles.length === 0) {
    return null; 
  }

  const categorySlug = title.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">{title}</h2>
        <Button 
          variant="secondary" 
          size="sm" 
          onClick={() => onViewAll(categorySlug)}
        >
          Ver todos <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>

      <div className="relative">
        <div 
          ref={scrollRef} 
          className="flex overflow-x-auto gap-4 pb-4 custom-scrollbar px-6 -mx-6" // <-- AQUI ESTÃO AS PRINCIPAIS MUDANÇAS
        > 
          {articles.map(article => (
            <NewsStreamCard key={article.id} article={article} />
          ))}
        </div>

        <AnimatePresence>
          {canScrollLeft && (
            <motion.button
              key="scroll-left-btn" 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              onClick={() => scroll('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 p-2 rounded-full bg-gray-800/70 backdrop-blur-sm text-white hover:bg-gray-700 transition-colors z-10" 
            >
              <ChevronLeft className="h-6 w-6" />
            </motion.button>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {canScrollRight && (
            <motion.button
              key="scroll-right-btn" 
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
              onClick={() => scroll('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 p-2 rounded-full bg-gray-800/70 backdrop-blur-sm text-white hover:bg-gray-700 transition-colors z-10" 
            >
              <ChevronRight className="h-6 w-6" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};