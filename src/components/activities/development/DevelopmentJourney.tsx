import React, { useState } from 'react';
import { Brain, Target, Sparkles, BookOpen, Trophy, BarChart2, Calendar, Clock, Zap, Flag, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { ProgressPath } from './ProgressPath';
import { MilestoneTracker } from './MilestoneTracker';
import { HabitBuilder } from './HabitBuilder';
import { SkillTree } from './SkillTree';
import { NewPlanModal } from './NewPlanModal';
import { useDevelopment } from '../../../contexts/DevelopmentContext';
import { useActivities } from '../../../contexts/ActivitiesContext';
import { format, differenceInDays } from 'date-fns';

export const DevelopmentJourney: React.FC = () => {
  const {
    plans,
    activePlanId,
    setActivePlan,
    loading,
    error,
    getMilestonesForPlan,
    getHabitsForPlan,
    getSkillsForPlan,
  } = useDevelopment();
  const { activities } = useActivities();

  const [activeTab, setActiveTab] = useState<'overview' | 'milestones' | 'habits' | 'skills'>('overview');
  const [showNewPlanModal, setShowNewPlanModal] = useState(false);

  const activePlan = plans.find(plan => plan.id === activePlanId);
  const milestones = activePlan ? getMilestonesForPlan(activePlan.id) : [];
  const habits = activePlan ? getHabitsForPlan(activePlan.id) : [];
  const skillTree = activePlan ? getSkillsForPlan(activePlan.id) : undefined;


  const stats = React.useMemo(() => {
    if (!activePlan || !habits || !milestones) return null; // Retorna null se não houver plano ativo ou dados

    const dailyPracticeTime = habits.reduce((total, habit) => {
      if (habit.lastCompleted === format(new Date(), 'yyyy-MM-dd')) {
        return total + 45;
      }
      return total;
    }, 0);

    const completedHabitsToday = habits.filter(habit =>
      habit.lastCompleted === format(new Date(), 'yyyy-MM-dd')
    ).length;

    const currentStreak = Math.max(...habits.map(h => h.streak), 0);

    const daysRemaining = activePlan.targetDate
      ? differenceInDays(new Date(activePlan.targetDate), new Date())
      : -1;

    const nextSteps = milestones
      .filter(m => !m.completed)
      .sort((a, b) => (a.dueDate || '').localeCompare(b.dueDate || ''))
      .slice(0, 3);

    const recentAchievements = milestones
      .filter(m => m.completed)
      .sort((a, b) => new Date(b.completedDate || '').getTime() - new Date(a.completedDate || '').getTime())
      .slice(0, 2);

    return {
      dailyPracticeTime,
      completedHabitsToday,
      currentStreak,
      daysRemaining: daysRemaining > 0 ? daysRemaining : 0,
      nextSteps,
      recentAchievements
    };
  }, [activePlan, habits, milestones, activities]);


  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
        <p className="text-gray-400 mt-4">Carregando jornada...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 bg-red-500/10 border border-red-500/20 rounded-lg p-8">
        <p className="text-red-500">Erro ao carregar jornada: {error}</p>
        <p className="text-gray-400 text-sm mt-2">Por favor, tente recarregar a página.</p>
      </div>
    );
  }

  if (!activePlan && plans.length === 0) {
    return (
      <div className="text-center py-12 bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl border border-gray-700 p-8">
        <Brain className="h-20 w-20 text-blue-500/50 mx-auto mb-6" />
        <h3 className="text-2xl font-bold text-white mb-4">
          Comece sua jornada de desenvolvimento
        </h3>
        <p className="text-gray-400 mb-8 max-w-lg mx-auto">
          Crie um plano personalizado para acompanhar seu progresso, desenvolver hábitos consistentes e mapear suas habilidades em qualquer área de interesse.
        </p>
        <Button
          onClick={() => setShowNewPlanModal(true)}
          className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-3 text-lg"
        >
          <Sparkles className="h-5 w-5 mr-2" />
          Criar Meu Primeiro Plano
        </Button>

        <NewPlanModal
          isOpen={showNewPlanModal}
          onClose={() => setShowNewPlanModal(false)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AnimatePresence mode="wait">
        {showNewPlanModal && (
          <NewPlanModal
            isOpen={showNewPlanModal}
            onClose={() => setShowNewPlanModal(false)}
          />
        )}
      </AnimatePresence>

      {activePlan && stats && (
        <>
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Brain className="h-8 w-8 text-blue-500" />
              <div>
                <h2 className="text-2xl font-bold text-white">Jornada de Desenvolvimento</h2>
                <p className="text-gray-400">Transforme seus objetivos em realidade</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {plans.length > 0 && (
                <select
                  value={activePlanId || ''}
                  onChange={(e) => setActivePlan(e.target.value)}
                  className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
                >
                  {plans.map(plan => (
                    <option key={plan.id} value={plan.id}>
                      {plan.title}
                    </option>
                  ))}
                </select>
              )}
              <Button
                onClick={() => setShowNewPlanModal(true)}
                className="bg-gradient-to-r from-blue-600 to-purple-600"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nova Jornada
              </Button>
            </div>
          </div>

          {/* Tabs de Navegação */}
          <div className="flex gap-2 border-b border-gray-700">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'overview'
                  ? 'text-blue-500 border-b-2 border-blue-500'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              Visão Geral
            </button>
            <button
              onClick={() => setActiveTab('milestones')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'milestones'
                  ? 'text-blue-500 border-b-2 border-blue-500'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              Marcos
            </button>
            <button
              onClick={() => setActiveTab('habits')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'habits'
                  ? 'text-blue-500 border-b-2 border-blue-500'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              Hábitos
            </button>
            <button
              onClick={() => setActiveTab('skills')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'skills'
                  ? 'text-blue-500 border-b-2 border-blue-500'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              Árvore de Habilidades
            </button>
          </div>

          {/* Conteúdo Principal */}
          <div className="grid grid-cols-12 gap-6">
            {/* Coluna Principal */}
            <div className="col-span-8">
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <Card className="relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4">
                      {activePlan.targetDate && (
                          <div className="flex items-center gap-2 text-sm text-gray-400">
                              <Calendar className="h-4 w-4" />
                              <span>Meta: {format(new Date(activePlan.targetDate), 'dd/MM/yyyy')}</span>
                          </div>
                      )}
                    </div>
                    
                    <div className="pt-12 pb-6 px-6">
                      <h3 className="text-2xl font-bold text-white mb-2">
                        {activePlan.title}
                      </h3>
                      <p className="text-gray-400 mb-6">
                        {activePlan.description}
                      </p>

                      <div className="relative h-4 bg-gray-700 rounded-full overflow-hidden mb-4">
                        <motion.div
                          className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${activePlan.progress}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                        />
                      </div>

                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Progresso Geral</span>
                        <span className="text-white font-medium">{activePlan.progress}%</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-4 p-6 bg-gray-800/50">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-white mb-1">
                          {milestones.filter(m => m.completed).length}
                          <span className="text-gray-400">/{milestones.length}</span>
                        </div>
                        <span className="text-sm text-gray-400">Marcos Alcançados</span>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-white mb-1">
                          {stats.currentStreak}
                        </div>
                        <span className="text-sm text-gray-400">Maior Sequência</span>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-white mb-1">
                          {skillTree?.level || 1}
                        </div>
                        <span className="text-sm text-gray-400">Nível Atual</span>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-white mb-1">
                          {stats.daysRemaining > 0 ? stats.daysRemaining : 0}
                        </div>
                        <span className="text-sm text-gray-400">Dias Restantes</span>
                      </div>
                    </div>
                  </Card>

                  <Card title="Próximos Passos Recomendados">
                    <div className="space-y-4">
                      {stats.nextSteps.length > 0 ? (
                        stats.nextSteps.map(milestone => (
                          <div key={milestone.id} className="flex items-start gap-4 p-4 bg-gray-800/50 rounded-lg">
                            <div className="p-2 bg-blue-500/10 rounded-lg">
                              <Target className="h-5 w-5 text-blue-500" />
                            </div>
                            <div>
                              <h4 className="font-medium text-white mb-1">{milestone.title}</h4>
                              <p className="text-sm text-gray-400">{milestone.description}</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-4 text-gray-400">
                          <Target className="h-8 w-8 mx-auto mb-2" />
                          <p>Nenhum passo pendente. Adicione um para continuar!</p>
                        </div>
                      )}
                    </div>
                  </Card>

                  {stats.recentAchievements.length > 0 && (
                    <Card title="Conquistas Recentes">
                      <div className="space-y-4">
                        {stats.recentAchievements.map(milestone => (
                          <div key={milestone.id} className="flex items-center gap-4 p-4 bg-gray-800/50 rounded-lg">
                            <Trophy className="h-6 w-6 text-yellow-500" />
                            <div>
                              <h4 className="font-medium text-white">{milestone.title}</h4>
                              <p className="text-sm text-gray-400">{milestone.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </Card>
                  )}
                </div>
              )}

              {activeTab === 'milestones' && (
                <MilestoneTracker
                  milestones={milestones}
                  planId={activePlan.id}
                />
              )}

              {activeTab === 'habits' && (
                <HabitBuilder
                  habits={habits}
                  planId={activePlan.id}
                />
              )}

              {activeTab === 'skills' && skillTree && (
                <SkillTree
                  skill={skillTree}
                  planId={activePlan.id}
                />
              )}
            </div>

            <div className="col-span-4 space-y-6">
              {/* Progresso Diário */}
              <Card title="Progresso Diário">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-blue-500" />
                      <span className="text-sm text-gray-400">Tempo de Prática Hoje</span>
                    </div>
                    <span className="text-lg font-bold text-white">{stats.dailyPracticeTime} min</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm text-gray-400">Atividades Concluídas</span>
                    </div>
                    <span className="text-lg font-bold text-white">{stats.completedHabitsToday}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Flag className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-gray-400">Sequência Atual</span>
                    </div>
                    <span className="text-lg font-bold text-white">{stats.currentStreak} dias</span>
                  </div>
                </div>
              </Card>

              {/* Caminho de Progresso */}
              <ProgressPath progress={activePlan.progress} />

              {/* Dicas Personalizadas */}
              <Card title="Dicas Personalizadas">
                <div className="space-y-4">
                  <div className="p-4 bg-gray-800/50 rounded-lg">
                    <h4 className="font-medium text-white mb-2">Consistência é Chave</h4>
                    <p className="text-sm text-gray-400">
                      Mantenha uma rotina regular de prática em {activePlan.category}. Pequenos progressos diários levam a grandes resultados.
                    </p>
                  </div>

                  <div className="p-4 bg-gray-800/50 rounded-lg">
                    <h4 className="font-medium text-white mb-2">Método de Aprendizado</h4>
                    <p className="text-sm text-gray-400">
                      Alterne entre teoria e prática. Dedique tempo para entender os fundamentos e depois aplique em projetos reais.
                    </p>
                  </div>

                  <div className="p-4 bg-gray-800/50 rounded-lg">
                    <h4 className="font-medium text-white mb-2">Próximo Foco</h4>
                    <p className="text-sm text-gray-400">
                      Concentre-se em {
                        milestones.find(m => !m.completed)?.title || 'consolidar seus conhecimentos atuais'
                      }.
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </>
      )}

      {!activePlan && plans.length > 0 && (
        <div className="text-center py-12 bg-gray-800/50 rounded-xl border border-gray-700 p-8">
          <h3 className="text-2xl font-bold text-white mb-4">
            Escolha sua Jornada
          </h3>
          <p className="text-gray-400 mb-8 max-w-lg mx-auto">
            Você já tem planos de desenvolvimento criados. Selecione um para continuar sua jornada.
          </p>
          <select
            value={activePlanId || ''}
            onChange={(e) => setActivePlan(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
          >
            <option value="">Selecione um plano...</option>
            {plans.map(plan => (
              <option key={plan.id} value={plan.id}>
                {plan.title}
              </option>
            ))}
          </select>
        </div>
      )}

      <NewPlanModal
        isOpen={showNewPlanModal}
        onClose={() => setShowNewPlanModal(false)}
      />
    </div>
  );
};