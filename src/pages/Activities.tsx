import React, { useState } from 'react';
import { Calendar, Clock, Target, Filter, BarChart2, Bot, Plus, Trash2 } from 'lucide-react';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ActivityCalendar } from '../components/activities/ActivityCalendar';
import { DailyTasks } from '../components/activities/DailyTasks';
import { ProductivityChart } from '../components/activities/ProductivityChart';
import { GoalsProgress } from '../components/activities/GoalsProgress';
import { MotivationalQuote } from '../components/activities/MotivationalQuote';
import { AIAssistant } from '../components/activities/AIAssistant';
import { PriorityView } from '../components/activities/PriorityView';
import { DailyProgress } from '../components/activities/DailyProgress';
import { AddActivityModal } from '../components/activities/AddActivityModal';
import { SmartMode } from '../components/activities/SmartMode';
import { FocusMode } from '../components/activities/FocusMode';
// import { ProductivityInsights } from '../components/activities/ProductivityInsights'; // Comentado pois já foi substituído pelos charts
import { DevelopmentJourney } from '../components/activities/development/DevelopmentJourney';
import { useActivities } from '../contexts/ActivitiesContext';
import { CalendarSidebar } from '../components/activities/CalendarSidebar';
import { ActivitiesOnboarding } from '../components/activities/ActivitiesOnboarding'; // <--- NOVO IMPORT

type ViewMode = 'day' | 'week' | 'year';
type FilterType = 'all' | 'pending' | 'completed' | 'late';

export const Activities: React.FC = () => {
  const { clearAllData } = useActivities();
  const [viewMode, setViewMode] = useState<ViewMode>('day');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSmartModeActive, setSmartModeActive] = useState(false);

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    // Aqui você implementaria a lógica de persistência da reordenação se necessário
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="space-y-6 relative">
        
        {/* ONBOARDING: Aparece automaticamente na primeira visita */}
        <ActivitiesOnboarding />

        {/* Header com Quote Motivacional */}
        <div className="mb-8">
          <MotivationalQuote />
        </div>

        {/* Controles Principais */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
            <div className="flex bg-gray-800 rounded-lg p-1 w-full sm:w-auto justify-center">
              <Button
                size="sm"
                variant={viewMode === 'day' ? 'primary' : 'secondary'}
                onClick={() => setViewMode('day')}
                className="flex items-center gap-2 flex-1 sm:flex-none justify-center"
              >
                <Clock className="h-4 w-4" />
                Dia
              </Button>
              <Button
                size="sm"
                variant={viewMode === 'week' ? 'primary' : 'secondary'}
                onClick={() => setViewMode('week')}
                className="flex items-center gap-2 flex-1 sm:flex-none justify-center"
              >
                <Calendar className="h-4 w-4" />
                Semana
              </Button>
              <Button
                size="sm"
                variant={viewMode === 'year' ? 'primary' : 'secondary'}
                onClick={() => setViewMode('year')}
                className="flex items-center gap-2 flex-1 sm:flex-none justify-center"
              >
                <Target className="h-4 w-4" />
                Ano
              </Button>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as FilterType)}
                className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 w-full sm:w-auto"
              >
                <option value="all">Todas</option>
                <option value="pending">Pendentes</option>
                <option value="completed">Concluídas</option>
                <option value="late">Atrasadas</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <Button
              onClick={clearAllData}
              variant="secondary"
              className="flex items-center gap-2 text-red-400 hover:text-red-300"
            >
              <Trash2 className="h-4 w-4" />
              <span className="hidden sm:inline">Limpar Tudo</span>
            </Button>
            <Button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600"
            >
              <Plus className="h-4 w-4" />
              Nova Atividade
            </Button>
          </div>
        </div>

        {/* Barra de Progresso */}
        <Card className="mb-6">
          <DailyProgress />
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Coluna Principal */}
          <div className="lg:col-span-8 space-y-6">
            {/* Atividades do Dia */}
            <Droppable droppableId="daily-tasks">
              {(provided) => (
                <div ref={provided.innerRef} {...provided.droppableProps}>
                  <Card title="Atividades do Dia" className="mb-6">
                    <DailyTasks viewMode={viewMode} filterType={filterType} />
                  </Card>
                  {provided.placeholder}
                </div>
              )}
            </Droppable>

            {/* Calendário Semanal com Barra Lateral */}
            <Card title="Planejamento Semanal" className="mb-6">
              <div className="flex flex-col xl:flex-row gap-6 items-start">
                <div className="flex-1 min-w-0 w-full">
                  <ActivityCalendar />
                </div>
                <div className="xl:w-1/3 xl:max-w-xs w-full">
                  <CalendarSidebar />
                </div>
              </div>
            </Card>
          </div>

          {/* Coluna Lateral */}
          <div className="lg:col-span-4 space-y-6">
            {/* Assistente IA */}
            {showAIAssistant && (
              <Card title="Assistente IA" className="mb-6">
                <AIAssistant />
              </Card>
            )}

            {/* Progresso das Metas */}
            <Card title="Progresso das Metas" className="mb-6">
              <GoalsProgress />
            </Card>

            {/* Prioridades da Semana */}
            <Card title="Prioridades da Semana" className="mb-6">
              <PriorityView />
            </Card>

            {/* Modo Foco */}
            <FocusMode />
          </div>
        </div>

        {/* Análise de Produtividade - Expandido */}
        <Card title="Análise de Produtividade" className="w-full">
          <ProductivityChart />
        </Card>

        {/* Plano de Desenvolvimento - Expandido */}
        <div className="w-full">
          <DevelopmentJourney />
        </div>

        {/* Modais e Overlays */}
        <AddActivityModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
        />

        <SmartMode
          isActive={isSmartModeActive}
          onToggle={() => setSmartModeActive(!isSmartModeActive)}
        />
      </div>
    </DragDropContext>
  );
};