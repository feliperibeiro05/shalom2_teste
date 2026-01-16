// src/components/health/ChatRecommendationCard.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Lightbulb, CheckCircle, Trophy, Sparkles, AlertOctagon } from 'lucide-react';
import { Recommendation } from '../../contexts/HealthContext';

interface ChatRecommendationCardProps {
  recommendation: Recommendation;
}

// Mapeamento de ícones (pode ser expandido conforme necessário)
const iconMap: Record<string, React.ElementType> = {
  alert: AlertTriangle,
  tip: Lightbulb,
  goal_achieved: CheckCircle,
  evolution: Trophy,
  Droplet: Lightbulb, // Estes parecem ser placeholders, melhor usar o tipo se possível
  Moon: Sparkles,
  AlertOctagon: AlertOctagon,
  CheckCircle: CheckCircle,
  Salad: Lightbulb,
  Target: Sparkles,
  // Adicione mais ícones conforme necessário
};

export const ChatRecommendationCard: React.FC<ChatRecommendationCardProps> = ({ recommendation }) => {
  const IconComponent = iconMap[recommendation.icon] || Lightbulb; 
  
  let bgColorClass = 'bg-blue-500/20'; 
  let iconColorClass = 'text-blue-300';

  if (recommendation.type === 'alert') {
    bgColorClass = 'bg-red-500/20';
    iconColorClass = 'text-red-300';
  } else if (recommendation.type === 'goal_achieved') {
    bgColorClass = 'bg-green-500/20';
    iconColorClass = 'text-green-300';
  } else if (recommendation.type === 'evolution') {
    bgColorClass = 'bg-purple-500/20';
    iconColorClass = 'text-purple-300';
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="col-span-1"
    >
      <div className={`p-3 rounded-lg shadow-sm relative ${bgColorClass} flex items-start space-x-2`}> {/* Reduzido p-4 para p-3 e space-x-3 para space-x-2 */}
        {/* Ícone menor */}
        <div className={`flex-shrink-0 p-1 rounded-full ${bgColorClass} ${iconColorClass}`}> {/* Reduzido p-2 para p-1 */}
          <IconComponent className="h-4 w-4" /> {/* Reduzido h-5 w-5 para h-4 w-4 */}
        </div>
        
        {/* Conteúdo da Mensagem */}
        <div className="flex-grow">
          <p className="text-xs font-medium text-white mb-0.5"> {/* Reduzido text-sm para text-xs e mb-1 para mb-0.5 */}
            {recommendation.type === 'alert' && 'Alerta de Saúde'}
            {recommendation.type === 'tip' && 'Dica Rápida'}
            {recommendation.type === 'goal_achieved' && 'Conquista!'}
            {recommendation.type === 'evolution' && 'Evolução'}
          </p>
          <p className="text-xs text-gray-200 leading-tight">{recommendation.message}</p> {/* Reduzido text-sm para text-xs e leading-snug para leading-tight */}
        </div>
      </div>
    </motion.div>
  );
};