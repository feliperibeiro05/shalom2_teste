import React from 'react';
import { Target, TrendingUp, Award, CheckCircle2 } from 'lucide-react';
import { useActivities } from '../../contexts/ActivitiesContext';
import { motion } from 'framer-motion';
import { format, parseISO } from 'date-fns'; // Importe format e parseISO

export const GoalsProgress: React.FC = () => {
  const { activities } = useActivities();
  
  const goals = activities.filter(activity => activity.type === 'goal');

  const getIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Award className="h-5 w-5 text-red-500" />;
      case 'medium':
        return <TrendingUp className="h-5 w-5 text-yellow-500" />;
      default:
        return <Target className="h-5 w-5 text-blue-500" />;
    }
  };

  const calculateProgress = (goal: typeof activities[0]) => {
    const start = parseISO(goal.date).getTime(); // Usar parseISO
    const end = goal.endDate ? parseISO(goal.endDate).getTime() : start; // Usar parseISO
    const now = new Date().getTime();
    
    if (now >= end) return 100;
    if (now < start) return 0;

    const totalDuration = end - start;
    const elapsedDuration = now - start;
    
    return Math.min(Math.max(Math.round((elapsedDuration / totalDuration) * 100), 0), 100);
  };

  return (
    <div className="space-y-6">
      {goals.length === 0 ? (
        <div className="text-center text-gray-400 py-8">
          <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Nenhuma meta definida ainda.</p>
          <p className="text-sm">Adicione metas para acompanhar seu progresso.</p>
        </div>
      ) : (
        goals.map((goal) => {
          const progress = calculateProgress(goal);
          
          return (
            <motion.div
              key={goal.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getIcon(goal.priority)}
                  <div>
                    <h4 className="font-medium text-white">
                      {goal.title}
                    </h4>
                    <p className="text-sm text-gray-400">
                      {goal.description}
                    </p>
                  </div>
                </div>
                {goal.status === 'completed' && (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                )}
              </div>

              <div className="relative">
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                  />
                </div>
                <span className="absolute right-0 top-4 text-sm text-gray-400">
                  {progress}%
                </span>
              </div>

              <div className="flex justify-between text-sm text-gray-400">
                {/* CORRIGIDO: Usar format(parseISO()) para exibir as datas */}
                <span>Início: {format(parseISO(goal.date), 'dd/MM/yyyy')}</span>
                {goal.endDate && (
                  <span>Fim: {format(parseISO(goal.endDate), 'dd/MM/yyyy')}</span>
                )}
              </div>
            </motion.div>
          );
        })
      )}
    </div>
  );
};