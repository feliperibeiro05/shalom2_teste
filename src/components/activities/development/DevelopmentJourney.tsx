import React, { useState } from 'react';
import { Brain, Target, Sparkles, Trophy, Calendar, Clock, Zap, Flag, Plus, Trash2 } from 'lucide-react';
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
// IMPORTAR O NOVO MODAL
import { ConfirmModal } from '../../ui/ConfirmModal';

export const DevelopmentJourney: React.FC = () => {
  const {
    plans,
    activePlanId,
    setActivePlan,
    deletePlan,
    loading,
    error,
    getMilestonesForPlan,
    getHabitsForPlan,
    getSkillsForPlan,
  } = useDevelopment();
  const { activities } = useActivities();

  const [activeTab, setActiveTab] = useState<'overview' | 'milestones' | 'habits' | 'skills'>('overview');
  const [showNewPlanModal, setShowNewPlanModal] = useState(false);
  
  // Estado para controlar o modal de exclusão
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const activePlan = plans.find(plan => plan.id === activePlanId);
  const milestones = activePlan ? getMilestonesForPlan(activePlan.id) : [];
  const habits = activePlan ? getHabitsForPlan(activePlan.id) : [];
  const skillTree = activePlan ? getSkillsForPlan(activePlan.id) : undefined;

  const stats = React.useMemo(() => {
    if (!activePlan || !habits || !milestones) return null;

    const dailyPracticeTime = habits.reduce((total, habit) => {
      if (habit.lastCompleted === format(new Date(), 'yyyy-MM-dd')) {
        return total + 15;
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

  const confirmDelete = async () => {
    if (activePlanId) {
      await deletePlan(activePlanId);
      setShowDeleteConfirm(false);
    }
  };

  if (loading && plans.length === 0) {
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
          Crie um plano personalizado para acompanhar seu progresso, desenvolver hábitos consistentes e mapear suas habilidades.
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

      {/* MODAL DE CONFIRMAÇÃO DE EXCLUSÃO */}
      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={confirmDelete}
        title="Excluir Jornada?"
        description="Tem certeza que deseja excluir esta jornada? Todo o seu progresso, XP, hábitos e histórico desta jornada serão perdidos permanentemente."
        confirmText="Sim, excluir jornada"
        cancelText="Cancelar"
        isDestructive={true}
      />

      {activePlan && stats && (
        <>
          {/* Header */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Brain className="h-8 w-8 text-blue-500" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Jornada de Desenvolvimento</h2>
                <p className="text-gray-400 text-sm">Transforme seus objetivos em realidade</p>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              {plans.length > 0 && (
                <div className="flex items-center gap-2 flex-1 md:flex-none">
                    <div className="relative flex-1 md:w-64">
                        <select
                        value={activePlanId || ''}
                        onChange={(e) => setActivePlan(e.target.value)}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white appearance-none focus:border-blue-500 focus:outline-none cursor-pointer"
                        >
                        {plans.map(plan => (
                            <option key={plan.id} value={plan.id}>
                            {plan.title}
                            </option>
                        ))}
                        </select>
                    </div>
                    
                    {/* Botão de Lixeira ativa o Modal */}
                    <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors border border-gray-700 hover:border-red-500/30"
                        title="Excluir Jornada Atual"
                    >
                        <Trash2 className="h-5 w-5" />
                    </button>
                </div>
              )}
              <Button
                onClick={() => setShowNewPlanModal(true)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 whitespace-nowrap"
              >
                <Plus className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Nova Jornada</span>
                <span className="sm:hidden">Nova</span>
              </Button>
            </div>
          </div>

          {/* Tabs de Navegação */}
          <div className="flex gap-2 border-b border-gray-700 overflow-x-auto pb-1">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === 'overview'
                  ? 'text-blue-500 border-b-2 border-blue-500'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              Visão Geral
            </button>
            <button
              onClick={() => setActiveTab('milestones')}
              className={`px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === 'milestones'
                  ? 'text-blue-500 border-b-2 border-blue-500'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              Marcos
            </button>
            <button
              onClick={() => setActiveTab('habits')}
              className={`px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === 'habits'
                  ? 'text-blue-500 border-b-2 border-blue-500'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              Hábitos
            </button>
            <button
              onClick={() => setActiveTab('skills')}
              className={`px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === 'skills'
                  ? 'text-blue-500 border-b-2 border-blue-500'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              Árvore de Habilidades
            </button>
          </div>

          {/* Conteúdo Principal */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Coluna Principal */}
            <div className="lg:col-span-8">
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <Card className="relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4">
                      {activePlan.targetDate && (
                          <div className="flex items-center gap-2 text-sm text-gray-400 bg-gray-800/80 px-3 py-1 rounded-full">
                              <Calendar className="h-4 w-4" />
                              <span>Meta: {format(new Date(activePlan.targetDate), 'dd/MM/yyyy')}</span>
                          </div>
                      )}
                    </div>
                    
                    <div className="pt-8 pb-6 px-6">
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

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-gray-800/50 border-t border-gray-700">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-white mb-1">
                          {milestones.filter(m => m.completed).length}
                          <span className="text-gray-400 text-sm">/{milestones.length}</span>
                        </div>
                        <span className="text-xs text-gray-400 uppercase tracking-wide">Marcos</span>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-white mb-1">
                          {stats.currentStreak}
                          <span className="text-sm text-yellow-500 ml-1">🔥</span>
                        </div>
                        <span className="text-xs text-gray-400 uppercase tracking-wide">Sequência</span>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-white mb-1">
                          {skillTree?.level || 1}
                        </div>
                        <span className="text-xs text-gray-400 uppercase tracking-wide">Nível Atual</span>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-white mb-1">
                          {stats.daysRemaining}
                        </div>
                        <span className="text-xs text-gray-400 uppercase tracking-wide">Dias Restantes</span>
                      </div>
                    </div>
                  </Card>

                  {/* Resto do conteúdo (igual ao original) */}
                  <Card title="Próximos Passos Recomendados">
                    <div className="space-y-4">
                      {stats.nextSteps.length > 0 ? (
                        stats.nextSteps.map(milestone => (
                          <div key={milestone.id} className="flex items-start gap-4 p-4 bg-gray-800/50 rounded-lg border border-gray-700/50">
                            <div className="p-2 bg-blue-500/10 rounded-lg flex-shrink-0">
                              <Target className="h-5 w-5 text-blue-500" />
                            </div>
                            <div>
                              <h4 className="font-medium text-white mb-1">{milestone.title}</h4>
                              <p className="text-sm text-gray-400">{milestone.description}</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-gray-400 bg-gray-800/30 rounded-lg border border-dashed border-gray-700">
                          <Target className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p>Você completou todos os passos pendentes!</p>
                          <Button variant="link" onClick={() => setActiveTab('milestones')} className="text-blue-400">
                             Adicionar novos marcos
                          </Button>
                        </div>
                      )}
                    </div>
                  </Card>
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

            <div className="lg:col-span-4 space-y-6">
              {/* Progresso Diário */}
              <Card title="Hoje">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-500/20 rounded-lg">
                          <Clock className="h-4 w-4 text-blue-500" />
                      </div>
                      <div>
                          <p className="text-xs text-gray-400">Tempo de Prática</p>
                          <span className="text-lg font-bold text-white">{stats.dailyPracticeTime} min</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-yellow-500/20 rounded-lg">
                            <Zap className="h-4 w-4 text-yellow-500" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-400">Hábitos Feitos</p>
                            <span className="text-lg font-bold text-white">{stats.completedHabitsToday}</span>
                        </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Caminho de Progresso */}
              <ProgressPath progress={activePlan.progress} />
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
          <div className="max-w-xs mx-auto">
            <select
                value={activePlanId || ''}
                onChange={(e) => setActivePlan(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white mb-4 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
                <option value="">Selecione um plano...</option>
                {plans.map(plan => (
                <option key={plan.id} value={plan.id}>
                    {plan.title}
                </option>
                ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
};