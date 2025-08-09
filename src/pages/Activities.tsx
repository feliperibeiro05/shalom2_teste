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
import { ProductivityInsights } from '../components/activities/ProductivityInsights'; // Ainda importado, mas será removido
import { DevelopmentJourney } from '../components/activities/development/DevelopmentJourney';
import { useActivities } from '../contexts/ActivitiesContext';
import { CalendarSidebar } from '../components/activities/CalendarSidebar';

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
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="space-y-6">
        {/* Header com Quote Motivacional */}
        <div className="mb-8">
          <MotivationalQuote />
        </div>

        {/* Controles Principais */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="flex bg-gray-800 rounded-lg p-1">
              <Button
                size="sm"
                variant={viewMode === 'day' ? 'primary' : 'secondary'}
                onClick={() => setViewMode('day')}
                className="flex items-center gap-2"
              >
                <Clock className="h-4 w-4" />
                Dia
              </Button>
              <Button
                size="sm"
                variant={viewMode === 'week' ? 'primary' : 'secondary'}
                onClick={() => setViewMode('week')}
                className="flex items-center gap-2"
              >
                <Calendar className="h-4 w-4" />
                Semana
              </Button>
              <Button
                size="sm"
                variant={viewMode === 'year' ? 'primary' : 'secondary'}
                onClick={() => setViewMode('year')}
                className="flex items-center gap-2"
              >
                <Target className="h-4 w-4" />
                Ano
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as FilterType)}
                className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm"
              >
                <option value="all">Todas</option>
                <option value="pending">Pendentes</option>
                <option value="completed">Concluídas</option>
                <option value="late">Atrasadas</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={clearAllData}
              variant="secondary"
              className="flex items-center gap-2 text-red-400 hover:text-red-300"
            >
              <Trash2 className="h-4 w-4" />
              Limpar Tudo
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

        <div className="grid grid-cols-12 gap-6">
          {/* Coluna Principal */}
          <div className="col-span-8 space-y-6">
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
              <div className="flex flex-col lg:flex-row gap-6 items-start">
                <div className="flex-1 min-w-0">
                  <ActivityCalendar />
                </div>
                <div className="lg:w-1/3 lg:max-w-xs w-full">
                  <CalendarSidebar />
                </div>
              </div>
            </Card>
          </div>

          {/* Coluna Lateral */}
          <div className="col-span-4 space-y-6">
            {/* Assistente IA (já removido o botão, manter aqui se quiser reinserir o Card) */}
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

            {/* REMOVIDO: Insights de Produtividade, pois já temos as caixas */}
            {/* <ProductivityInsights /> */}
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