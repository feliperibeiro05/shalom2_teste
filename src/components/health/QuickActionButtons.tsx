// src/components/health/QuickActionButtons.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { Droplet, Dumbbell, Moon, UtensilsCrossed } from 'lucide-react'; 
import { Button } from '../ui/Button';
import { useHealth } from '../../contexts/HealthContext';
import { Card } from '../ui/Card';

interface QuickActionButtonsProps {
  onActionComplete?: () => void; 
}

export const QuickActionButtons: React.FC<QuickActionButtonsProps> = ({ onActionComplete }) => {
  const { updateMetricValue, metrics } = useHealth();

  const handleQuickAction = (metricId: string, valueToAdd: number) => {
    const currentMetric = metrics.find(m => m.id === metricId);
    if (currentMetric) {
      updateMetricValue(metricId, currentMetric.value + valueToAdd);
      if (onActionComplete) onActionComplete();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card title="Ações Rápidas" className="p-4 bg-gray-800/60 border border-gray-700 rounded-2xl"> {/* Reduzido p-6 para p-4 */}
        <div className="grid grid-cols-2 gap-2"> {/* Reduzido gap-4 para gap-2 */}
          <Button 
            variant="secondary" 
            className="flex flex-col h-20 p-2 justify-center items-center text-xs bg-gray-700/50 hover:bg-gray-700 border-gray-600 text-gray-300 hover:text-white transition-all duration-200" // Reduzido h-24 para h-20 e text-sm para text-xs
            onClick={() => handleQuickAction('water', 0.25)} 
          >
            <Droplet className="h-5 w-5 mb-1 text-blue-400" /> {/* Reduzido h-6 w-6 para h-5 w-5 e mb-2 para mb-1 */}
            Água
          </Button>

          <Button 
            variant="secondary" 
            className="flex flex-col h-20 p-2 justify-center items-center text-xs bg-gray-700/50 hover:bg-gray-700 border-gray-600 text-gray-300 hover:text-white transition-all duration-200"
            onClick={() => handleQuickAction('exercise', 15)} 
          >
            <Dumbbell className="h-5 w-5 mb-1 text-green-400" />
            Treino
          </Button>
          
          <Button 
            variant="secondary" 
            className="flex flex-col h-20 p-2 justify-center items-center text-xs bg-gray-700/50 hover:bg-gray-700 border-gray-600 text-gray-300 hover:text-white transition-all duration-200"
            onClick={() => handleQuickAction('sleep', 0.5)} // Ajuste para 0.5h
          >
            <Moon className="h-5 w-5 mb-1 text-yellow-400" />
            Sono
          </Button>

          <Button 
            variant="secondary" 
            className="flex flex-col h-20 p-2 justify-center items-center text-xs bg-gray-700/50 hover:bg-gray-700 border-gray-600 text-gray-300 hover:text-white transition-all duration-200"
            onClick={() => handleQuickAction('calories', 100)} // Ajuste para 100 kcal
          >
            <UtensilsCrossed className="h-5 w-5 mb-1 text-orange-400" />
            Refeição
          </Button>
        </div>
      </Card>
    </motion.div>
  );
};