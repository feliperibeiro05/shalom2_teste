import React, { useMemo, useState } from 'react';
import { Card } from '../ui/Card';
import { useActivities } from '../../contexts/ActivitiesContext';
import { useEmotional } from '../../contexts/EmotionalContext';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
// IMPORTANTE: Adicionado 'motion' e removidos ícones não utilizados diretamente no JSX
import { Bell, CheckCircle, CalendarCheck, Zap, TrendingDown, Lightbulb, Smile, X, History, Flag } from 'lucide-react';
import { motion } from 'framer-motion'; // Adicionada esta importação

export const CalendarSidebar: React.FC = () => {
  const { activities, getActivitiesByDate, getPriorityActivities } = useActivities();
  const { getWellbeingScore } = useEmotional();

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const currentHour = today.getHours();

  const todaysActivities = getActivitiesByDate(todayStr);
  const completedToday = todaysActivities.filter(a => a.status === 'completed').length;
  const totalToday = todaysActivities.length;
  const pendingToday = totalToday - completedToday;

  const wellbeingScore = getWellbeingScore();

  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());

  const handleDismissAlert = (id: string) => {
    setDismissedAlerts(prev => new Set(prev).add(id));
  };

  const dynamicAlerts = useMemo(() => {
    const alerts = [];

    // --- 1. Alerta: Resumo do Dia ---
    if (totalToday > 0) {
      alerts.push({
        id: 'summary-today',
        icon: CalendarCheck,
        title: 'Resumo do Dia',
        message: `Você tem <strong>${pendingToday}</strong> tarefas pendentes de <strong>${totalToday}</strong> para hoje. ${completedToday > 0 ? `(${completedToday} concluída${completedToday > 1 ? 's' : ''})` : ''}`,
        color: 'bg-green-500/10 border-green-500/20 text-green-500'
      });
    } else {
        alerts.push({
            id: 'no-activities-today',
            icon: Lightbulb,
            title: 'Planejamento',
            message: 'Nenhuma atividade registrada para hoje. Que tal adicionar uma para começar?',
            color: 'bg-gray-700/50 border-gray-600 text-gray-400'
        });
    }

    // --- 2. Alerta: Todas Concluídas no Dia ---
    if (totalToday > 0 && pendingToday === 0 && completedToday > 0) {
      alerts.push({
        id: 'all-completed-today',
        icon: CheckCircle,
        title: 'Parabéns!',
        message: `Você concluiu todas as suas <strong>${totalToday}</strong> atividades de hoje! Mandou muito bem!`,
        color: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-500'
      });
    }
    // --- 3. Alerta: Excelente Progresso (Cenário Positivo de Fim de Dia) ---
    else if (currentHour >= 17 && totalToday > 0 && (completedToday / totalToday >= 0.7)) {
        alerts.push({
            id: 'good-progress-end-day',
            icon: Smile,
            title: 'Excelente Progresso!',
            message: `Parabéns! Você está arrasando com suas atividades hoje. Continue assim para fechar o dia com chave de ouro.`,
            color: 'bg-green-500/10 border-green-500/20 text-green-500'
        });
    }
    // --- 4. Alerta: Risco de Dia Incompleto ---
    else if (currentHour >= 17 && totalToday > 0 && (completedToday / totalToday < 0.5)) {
      const smallestPendingTask = todaysActivities
        .filter(a => a.status === 'pending')
        .sort((a, b) => (a.title?.length || 0) - (b.title?.length || 0))[0];

      alerts.push({
        id: 'incomplete-day-risk',
        icon: TrendingDown,
        title: 'Risco de Dia Incompleto',
        message: smallestPendingTask
          ? `Sem alarde, mas a sua produtividade está abaixo da média. Quer uma dica? Finalize: <strong>${smallestPendingTask.title}</strong>. Isso costuma virar o jogo!`
          : `Sem alarde, mas sua produtividade está abaixo da média. Finalize a menor tarefa da lista. Isso costuma virar o jogo!`,
        color: 'bg-red-500/10 border-red-500/20 text-red-500'
      });
    }
    
    // --- 5. Alerta: Prioridades da Semana ---
    const currentWeekPriorities = getPriorityActivities();
    const pendingPriorities = currentWeekPriorities.filter(p => p.status === 'pending').length;

    if (pendingPriorities > 0) {
      alerts.push({
        id: 'weekly-priorities',
        icon: Flag,
        title: 'Prioridades da Semana',
        message: `Você tem <strong>${pendingPriorities}</strong> prioridade${pendingPriorities > 1 ? 's' : ''} para esta semana. Não se esqueça delas!`,
        color: 'bg-purple-500/10 border-purple-500/20 text-purple-500'
      });
    }

    // --- 6. Alerta: Previsão Produtiva / Lembrete de Tarefa ---
    if (wellbeingScore >= 70 && pendingToday > 0) {
      const longStandingTask = activities
        .filter(a => a.status === 'pending' && new Date(a.date) < today)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];

      alerts.push({
        id: 'productive-forecast',
        icon: Zap,
        title: 'Previsão Produtiva',
        message: longStandingTask 
          ? `A energia do seu dia está em alta! Aproveite para dar um check naquela tarefa: <strong>${longStandingTask.title}</strong> que vem se arrastando.`
          : `Sua energia está ótima! O dia está a seu favor para avançar em qualquer tarefa pendente.`,
        color: 'bg-purple-500/10 border-purple-500/20 text-purple-500'
      });
    }

    // --- 7. Alerta: Tarefas Atrasadas de Outros Dias ---
    const previousDaysPending = activities.filter(a =>
      a.status === 'pending' && new Date(a.date) < today && a.type !== 'routine'
    );
    if (previousDaysPending.length > 0) {
      alerts.push({
        id: 'past-due-activities',
        icon: History,
        title: 'Tarefas Atrasadas',
        message: `Você tem <strong>${previousDaysPending.length}</strong> atividade${previousDaysPending.length > 1 ? 's' : ''} pendente${previousDaysPending.length > 1 ? 's' : ''} de dias anteriores. Que tal dar uma olhada?`,
        color: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500'
      });
    }

    // --- 8. Alerta: Próximas Atividades ---
    const upcomingActivities = activities
      .filter(activity => {
        const activityDate = new Date(activity.date);
        const sevenDaysFromNow = new Date();
        sevenDaysFromNow.setDate(today.getDate() + 7);
        return activityDate > today && activityDate <= sevenDaysFromNow && activity.status === 'pending';
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 3);

    if (upcomingActivities.length > 0) {
      alerts.push({
        id: 'upcoming-activities',
        icon: Bell,
        title: 'Próximas Atividades',
        message: upcomingActivities.map(act => 
            `<strong>${act.title}</strong> (${format(new Date(act.date), 'dd/MM', { locale: ptBR })})`
        ).join(', '),
        color: 'bg-blue-500/10 border-blue-500/20 text-blue-500'
      });
    }
    
    // --- 9. Alerta: Dica Geral (fallback se ainda não houver 3 alertas preenchidos) ---
    if (alerts.length < 3) {
      alerts.push({
        id: 'general-tip',
        icon: Lightbulb,
        title: 'Dica de Produtividade',
        message: 'Organize suas tarefas no início do dia para ter mais clareza e foco.',
        color: 'bg-gray-800/50 border-gray-700 text-gray-400'
      });
    }

    return alerts.filter(alert => !dismissedAlerts.has(alert.id)).slice(0, 3);
  }, [activities, wellbeingScore, totalToday, completedToday, pendingToday, currentHour, dismissedAlerts, getPriorityActivities]);

  return (
    <Card title="Alertas do Calendário">
      <div className="space-y-4">
        {dynamicAlerts.map((alert, index) => (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`p-4 rounded-lg relative ${alert.color}`}
          >
            <div className="flex items-center gap-2 mb-2">
              {React.createElement(alert.icon, { className: "h-5 w-5" })}
              <span className="font-medium">{alert.title}</span>
            </div>
            <p className="text-sm text-gray-300">
              <span dangerouslySetInnerHTML={{ __html: alert.message }}></span>
            </p>
            <button
              onClick={() => handleDismissAlert(alert.id)}
              className="absolute top-2 right-2 text-gray-500 hover:text-white transition-colors"
              title="Dispensar alerta"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        ))}
      </div>
    </Card>
  );
};