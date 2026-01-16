// src/components/health/RecommendationCard.tsx
import React from 'react';
import { motion } from 'framer-motion';
import * as LucideIcons from 'lucide-react'; // Importa todos os ícones da Lucide

import { Recommendation } from '../../contexts/HealthContext';
import { Card } from '../ui/Card';

interface RecommendationCardProps {
  recommendation: Recommendation;
}

// Mapeia o nome do ícone (string) para o componente de ícone Lucide
const IconMap: Record<string, React.ElementType> = {
  Droplet: LucideIcons.Droplet,
  Moon: LucideIcons.Moon,
  Dumbbell: LucideIcons.Dumbbell,
  Salad: LucideIcons.Salad,
  Flame: LucideIcons.Flame, // Caso use para calorias
  Smile: LucideIcons.Smile, // Para humor
  Zap: LucideIcons.Zap,     // Para energia
  // Adicione outros ícones conforme necessário
};

export const RecommendationCard: React.FC<RecommendationCardProps> = ({ recommendation }) => {
  // Define cores e ícones baseados no tipo da recomendação
  let cardClassName = "bg-gray-800/60 border";
  let textColor = "text-gray-300";
  let iconColor = "text-blue-400";
  let IconComponent = IconMap[recommendation.icon] || LucideIcons.Info; // Fallback para Info

  switch (recommendation.type) {
    case 'alert':
      cardClassName = "bg-red-900/40 border-red-700";
      textColor = "text-red-200";
      iconColor = "text-red-400";
      break;
    case 'tip':
      cardClassName = "bg-yellow-900/40 border-yellow-700";
      textColor = "text-yellow-200";
      iconColor = "text-yellow-400";
      break;
    case 'goal_achieved':
      cardClassName = "bg-green-900/40 border-green-700";
      textColor = "text-green-200";
      iconColor = "text-green-400";
      break;
    default:
      // Default já está definido no início
      break;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={`${cardClassName} p-5 rounded-xl shadow-md flex items-start space-x-4`}>
        <div className={`flex-shrink-0 p-2 rounded-full ${iconColor} bg-white/10`}>
          {IconComponent && <IconComponent className="h-6 w-6" />}
        </div>
        <div>
          <p className={`text-sm font-medium ${textColor}`}>
            {recommendation.message}
          </p>
        </div>
      </Card>
    </motion.div>
  );
};