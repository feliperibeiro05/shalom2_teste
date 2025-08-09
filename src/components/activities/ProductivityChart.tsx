import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { motion } from 'framer-motion';
import { Brain, TrendingUp, Clock, Target, List, Coffee, Sun, ChevronLeft, ChevronRight, CheckCircle, Moon } from 'lucide-react';
import { useActivities } from '../../contexts/ActivitiesContext';

interface Insight {
  icon: React.ElementType;
  title: string;
  value: string;
  description: string;
  trend: 'positive' | 'negative' | 'info' | 'neutral';
}

interface ProductivityTip {
  icon: React.ElementType;
  title: string;
  description: string;
}

export const ProductivityChart: React.FC = () => {
  const { activities } = useActivities();
  const [currentTipIndex, setCurrentTipIndex] = React.useState(0);

  const productivityTips: ProductivityTip[] = [
    {
      icon: Brain,
      title: "Técnica Pomodoro",
      description: "Use intervalos de 25 minutos de foco total, seguidos por 5 minutos de descanso para maximizar sua produtividade."
    },
    {
      icon: Clock,
      title: "Horário Mais Produtivo",
      description: "Identifique seu período mais produtivo do dia e programe as tarefas mais importantes para esse momento."
    },
    {
      icon: Target,
      title: "Regra dos 2 Minutos",
      description: "Se uma tarefa leva menos de 2 minutos, faça-a imediatamente em vez de adicioná-la à sua lista."
    },
    {
      icon: List,
      title: "Método Eisenhower",
      description: "Organize suas tarefas por importância e urgência para priorizar melhor seu tempo."
    },
    {
      icon: Coffee,
      title: "Pausas Estratégicas",
      description: "Faça pausas curtas e regulares para manter seu cérebro energizado e evitar fadiga mental."
    },
    {
      icon: Sun,
      title: "Rotina Matinal",
      description: "Estabeleça uma rotina matinal sólida para começar o dia com mais foco e energia."
    },
    {
      icon: Brain,
      title: "Single-tasking",
      description: "Foque em uma tarefa por vez em vez de multitarefa para melhorar a qualidade e eficiência."
    }
  ];

  const data = useMemo(() => {
    const today = new Date();
    const data = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayActivities = activities.filter(a => a.date === dateStr);
      const completed = dayActivities.filter(a => a.status === 'completed').length;
      const pending = dayActivities.filter(a => a.status === 'pending').length;
      const late = dayActivities.filter(a => a.status === 'late').length;

      data.push({
        day: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][date.getDay()],
        concluídas: completed,
        pendentes: pending,
        atrasadas: late,
        total: completed + pending + late,
      });
    }

    return data;
  }, [activities]);

  const insights: Insight[] = useMemo(() => {
    const totalActivitiesCount = activities.length;
    const completedActivitiesCount = activities.filter(a => a.status === 'completed').length;
    const completionRate = totalActivitiesCount > 0 ? (completedActivitiesCount / totalActivitiesCount) * 100 : 0;
    
    const completedActivitiesWithTime = activities.filter(a => a.status === 'completed' && a.time !== null && a.time !== undefined);
    const timeMap = new Map<number, number>();
    completedActivitiesWithTime.forEach(activity => {
        const hour = parseInt(activity.time!.split(':')[0]);
        timeMap.set(hour, (timeMap.get(hour) || 0) + 1);
    });

    let mostProductiveHour = 0;
    let maxCompletions = 0;
    if (timeMap.size > 0) {
        timeMap.forEach((completions, hour) => {
            if (completions > maxCompletions) {
                maxCompletions = completions;
                mostProductiveHour = hour;
            }
        });
    }

    let currentStreak = 0;
    const todayStr = new Date().toISOString().split('T')[0];
    const todaysCompletedActivities = activities.filter(a => a.date === todayStr && a.status === 'completed');
    currentStreak = todaysCompletedActivities.length;

    const categoryStats = new Map<string, { total: number; completed: number }>();
    activities.forEach(activity => {
      const stats = categoryStats.get(activity.category) || { total: 0, completed: 0 };
      stats.total++;
      if (activity.status === 'completed') stats.completed++;
      categoryStats.set(activity.category, stats);
    });

    let bestCategory = '';
    let bestRate = 0;
    categoryStats.forEach((stats, category) => {
      const rate = stats.completed / stats.total;
      if (stats.total > 0 && rate > bestRate) {
        bestRate = rate;
        bestCategory = category;
      }
    });

    const averageCompletionRate = data.reduce((sum, dayData) => {
        const totalDayActivities = dayData.concluídas + dayData.pendentes + dayData.atrasadas;
        return sum + (totalDayActivities > 0 ? dayData.concluídas / totalDayActivities : 0);
    }, 0) / data.length * 100 || 0;
    
    let leastProductiveHour = -1;
    let minCompletions = Infinity;
    if (timeMap.size > 0) {
      timeMap.forEach((completions, hour) => {
        if (completions < minCompletions) {
          minCompletions = completions;
          leastProductiveHour = hour;
        }
      });
    }

    // Define o insight para a sexta caixa (Horário Menos Produtivo ou Dica alternativa)
    const sixthInsight: Insight = 
        (leastProductiveHour === mostProductiveHour && mostProductiveHour !== -1) ? // Se são iguais E é um horário válido
        {
            icon: Brain, // Ícone alternativo
            title: 'Foco e Consistência',
            value: 'Dica Extra',
            description: 'Para otimizar seu dia, experimente a técnica Pomodoro. 25 min de foco total!',
            trend: 'info'
        } :
        {
            icon: Moon,
            title: 'Horário Menos Produtivo',
            value: leastProductiveHour > -1 ? `${leastProductiveHour}:00h` : 'N/A',
            description: leastProductiveHour > -1 ? `Você tende a ser menos produtivo às ${leastProductiveHour}:00h` : 'Sem dados de hora.',
            trend: 'neutral'
        };


    return [
      {
        icon: Clock,
        title: 'Horário Mais Produtivo',
        value: `${mostProductiveHour}:00h`,
        description: `Você é mais produtivo às ${mostProductiveHour}:00h`,
        trend: 'info'
      },
      {
        icon: TrendingUp,
        title: 'Sequência Atual',
        value: `${currentStreak} atividades`,
        description: `${currentStreak} atividades completadas hoje`,
        trend: 'positive'
      },
      {
        icon: Target,
        title: 'Categoria Destaque',
        value: bestCategory || 'N/A',
        description: `Melhor desempenho em ${bestCategory}`,
        trend: 'info'
      },
      {
        icon: Brain,
        title: 'Dica Personalizada',
        value: 'Ação',
        description: `Programe suas tarefas mais importantes para ${mostProductiveHour}:00h`,
        trend: 'info'
      },
      {
        icon: CheckCircle,
        title: 'Taxa de Conclusão (7 dias)',
        value: `${averageCompletionRate.toFixed(0)}%`,
        description: `Você completa em média ${averageCompletionRate.toFixed(0)}% das suas atividades.`,
        trend: averageCompletionRate >= 70 ? 'positive' : averageCompletionRate < 40 ? 'negative' : 'neutral'
      },
      sixthInsight, // A sexta caixa agora é o insight condicional
    ];
  }, [activities, data]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || payload.length === 0) return null;

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800 border border-gray-700 rounded-lg p-4 shadow-lg z-50"
      >
        <p className="font-medium text-gray-300 mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color || entry.payload?.color }}
            />
            <span className="text-gray-400">{entry.name}:</span>
            <span className="text-white font-medium">{entry.value}</span>
          </div>
        ))}
      </motion.div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <defs>
              <linearGradient id="colorConcluidas" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorPendentes" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorAtrasadas" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#EF4444" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
              </linearGradient>
            </defs>

            <XAxis
              dataKey="day"
              stroke="#9CA3AF"
              tick={{ fill: '#9CA3AF' }}
            />
            <YAxis
              stroke="#9CA3AF"
              tick={{ fill: '#9CA3AF' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />

            <Area
              type="monotone"
              dataKey="concluídas"
              stackId="1"
              stroke="#10B981"
              fill="url(#colorConcluidas)"
              name="Concluídas"
            />
            <Area
              type="monotone"
              dataKey="pendentes"
              stackId="1"
              stroke="#3B82F6"
              fill="url(#colorPendentes)"
              name="Pendentes"
            />
            <Area
              type="monotone"
              dataKey="atrasadas"
              stackId="1"
              stroke="#EF4444"
              fill="url(#colorAtrasadas)"
              name="Atrasadas"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {insights.map((insight, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gray-800/50 rounded-lg p-4 border border-gray-700"
          >
            <div className="flex items-center justify-between mb-2">
              {React.createElement(insight.icon, { className: "h-4 w-4 text-blue-500" })}
              <h4 className="text-sm font-medium text-gray-400">{insight.title}</h4>
              <TrendingUp className={`h-4 w-4 ${
                insight.trend === 'positive' ? 'text-green-500' :
                insight.trend === 'negative' ? 'text-red-500' :
                insight.trend === 'info' ? 'text-blue-500' : 'text-yellow-500'
              }`} />
            </div>
            <p className="text-2xl font-bold text-white mb-1">{insight.value}</p>
            <p className="text-sm text-gray-400">{insight.description}</p>
          </motion.div>
        ))}
      </div>

      <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-white">Dicas de Produtividade</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentTipIndex(prev => (prev === 0 ? productivityTips.length - 1 : prev - 1))}
              className="p-1 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ChevronLeft className="h-5 w-5 text-gray-400" />
            </button>
            <button
              onClick={() => setCurrentTipIndex(prev => (prev === productivityTips.length - 1 ? 0 : prev + 1))}
              className="p-1 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </button>
          </div>
        </div>

        <div className="relative overflow-hidden">
          <motion.div
            key={currentTipIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex items-start gap-4"
          >
            {productivityTips.at(currentTipIndex)?.icon && React.createElement(productivityTips.at(currentTipIndex)!.icon, {
              className: "h-8 w-8 text-blue-500 flex-shrink-0"
            })}
            <div>
              <h4 className="text-lg font-medium text-white mb-2">
                {productivityTips.at(currentTipIndex)?.title}
              </h4>
              <p className="text-gray-400">
                {productivityTips.at(currentTipIndex)?.description}
              </p>
            </div>
          </motion.div>

          <div className="flex justify-center mt-4 gap-2">
            {productivityTips.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentTipIndex(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentTipIndex ? 'bg-blue-500' : 'bg-gray-600'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};