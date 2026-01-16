// src/components/health/HealthMetricCard.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { HealthMetric } from '../../contexts/HealthContext';
import { Card } from '../ui/Card'; // Reutilize o Card, se ele for um wrapper genérico
import { Button } from '../ui/Button';
import { Plus, Minus } from 'lucide-react';

interface HealthMetricCardProps {
  metric: HealthMetric;
  onValueChange: (metricId: string, newValue: number) => void;
  IconComponent: React.ElementType;
}

export const HealthMetricCard: React.FC<HealthMetricCardProps> = ({ metric, onValueChange, IconComponent }) => {
  const progress = Math.min(100, Math.round((metric.value / metric.goal) * 100));

  const handleIncrement = () => {
    let incrementValue = 1; 
    if (metric.id === 'water') incrementValue = 0.25; // 250ml
    if (metric.id === 'exercise') incrementValue = 15; // 15min
    if (metric.id === 'calories' || metric.id === 'protein') incrementValue = 50; // 50 kcal/g
    if (metric.id === 'sleep') incrementValue = 0.5; // 30min
    
    onValueChange(metric.id, metric.value + incrementValue);
  };

  const handleDecrement = () => {
    let decrementValue = 1; 
    if (metric.id === 'water') decrementValue = 0.25;
    if (metric.id === 'exercise') decrementValue = 15;
    if (metric.id === 'calories' || metric.id === 'protein') decrementValue = 50;
    if (metric.id === 'sleep') decrementValue = 0.5;

    onValueChange(metric.id, Math.max(0, metric.value - decrementValue)); 
  };

  const getProgressColorClass = (progress: number) => {
    if (progress >= 100) return 'bg-green-500';
    if (progress >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="col-span-1" // Manter o col-span para o grid pai
    >
      {/* Usando uma div simples em vez de Card se o Card adicionar muito padding */}
      <div className="bg-gray-800/60 border border-gray-700 rounded-lg p-3 flex flex-col h-full relative overflow-hidden group">
        
        {/* Topo do Card: Ícone e Nome */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className={`p-1 rounded-full bg-blue-500/10 text-blue-300`}>
              <IconComponent className="h-4 w-4" />
            </div>
            <h3 className="text-md font-semibold text-white">{metric.name}</h3>
          </div>
          {/* Valor atual e Meta (pequenos) */}
          <p className="text-xs text-gray-400">
            <span className="font-bold text-white">{metric.value}{metric.unit}</span> / {metric.goal}{metric.unit}
          </p>
        </div>

        {/* Barra de Progresso Animada - mais fina */}
        <div className="w-full bg-gray-700 rounded-full h-1.5 mb-2">
          <motion.div
            className={`h-1.5 rounded-full ${getProgressColorClass(progress)}`}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          ></motion.div>
        </div>
        
        {/* Botões de Interação Rápida - menores e alinhados à direita */}
        <div className="flex justify-end gap-1">
          <Button 
            onClick={handleDecrement} 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6 text-gray-400 hover:bg-gray-700 hover:text-white"
          >
            <Minus className="h-3 w-3" />
          </Button>
          <Button 
            onClick={handleIncrement} 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6 text-gray-400 hover:bg-gray-700 hover:text-white"
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
};