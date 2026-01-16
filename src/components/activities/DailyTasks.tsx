import React, { useState } from 'react';
import { Clock, CheckCircle, AlertCircle, MoreVertical, Edit2, Trash2, Target, Repeat, ListTodo, CalendarPlus, ChevronLeft, ChevronRight, Zap, Lightbulb } from 'lucide-react';
import { Draggable } from '@hello-pangea/dnd';
import { motion, AnimatePresence } from 'framer-motion';
import { useActivities, Activity } from '../../contexts/ActivitiesContext';
import { Button } from '../ui/Button';
import { format, parseISO } from 'date-fns';

interface DailyTasksProps {
  viewMode: 'day' | 'week' | 'year';
  filterType: 'all' | 'pending' | 'completed' | 'late';
}

export const DailyTasks: React.FC<DailyTasksProps> = ({ viewMode, filterType }) => {
  const { activities, toggleActivityStatus, deleteActivity, deleteRoutine, loading } = useActivities();
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 7;

  const getFilteredActivities = () => {
    const today = new Date();
    const todayStr = format(today, 'yyyy-MM-dd');
    const startOfWeek = new Date(today);
    startOfWeek.setHours(0, 0, 0, 0);
    startOfWeek.setDate(today.getDate() - today.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    const startOfYear = new Date(today.getFullYear(), 0, 1);
    startOfYear.setHours(0, 0, 0, 0);
    const endOfYear = new Date(today.getFullYear(), 11, 31);
    endOfYear.setHours(23, 59, 59, 999);

    let filteredActivities = activities;

    switch (viewMode) {
      case 'day':
        filteredActivities = activities.filter(activity =>
          activity.date === todayStr
        );
        break;
      case 'week':
        filteredActivities = activities.filter(activity => {
          const activityDate = parseISO(activity.date);
          return activityDate >= startOfWeek && activityDate <= endOfWeek;
        });
        break;
      case 'year':
        filteredActivities = activities.filter(activity => {
          const activityDate = parseISO(activity.date);
          return activityDate >= startOfYear && activityDate <= endOfYear;
        });
        break;
    }

    switch (filterType) {
      case 'pending':
        filteredActivities = filteredActivities.filter(activity => 
          activity.status === 'pending'
        );
        break;
      case 'completed':
        filteredActivities = filteredActivities.filter(activity => 
          activity.status === 'completed'
        );
        break;
      case 'late':
        filteredActivities = filteredActivities.filter(activity => 
          activity.status === 'late'
        );
        break;
    }

    return filteredActivities.sort((a, b) => {
      const dateComparison = parseISO(a.date).getTime() - parseISO(b.date).getTime();
      if (dateComparison !== 0) return dateComparison;
      
      const timeA = a.time || '00:00';
      const timeB = b.time || '00:00';
      return timeA.localeCompare(timeB);
    });
  };

  const tasks = getFilteredActivities();
  const totalPages = Math.ceil(tasks.length / itemsPerPage);
  const paginatedTasks = tasks.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);

  const getStatusColor = (status: Activity['status']) => {
    switch (status) {
      case 'completed':
        return 'text-green-500';
      case 'late':
        return 'text-red-500';
      default:
        return 'text-yellow-500';
    }
  };

  const getPriorityColor = (priority: Activity['priority']) => {
    switch (priority) {
      case 'high':
        return 'border-red-500';
      case 'medium':
        return 'border-yellow-500';
      default:
        return 'border-blue-500';
    }
  };

  const getPriorityBgColor = (priority: Activity['priority']) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500';
      case 'medium':
        return 'bg-yellow-500';
      default:
        return 'bg-blue-500';
    }
  };

  const getTypeIcon = (type: Activity['type']) => {
    switch (type) {
      case 'goal':
        return <Target className="h-4 w-4 text-purple-500" />;
      case 'routine':
        return <Repeat className="h-4 w-4 text-blue-500" />;
      default:
        return <ListTodo className="h-4 w-4 text-green-500" />;
    }
  };
  
  const getEnergyLevel = (priority: Activity['priority']) => {
    switch (priority) {
      case 'high':
        return 'Energia alta';
      case 'medium':
        return 'Energia média';
      default:
        return 'Energia baixa';
    }
  };
  
  const getEnergyIconColor = (priority: Activity['priority']) => {
    switch (priority) {
      case 'high':
        return 'text-red-500';
      case 'medium':
        return 'text-yellow-500';
      default:
        return 'text-blue-500';
    }
  };

  if (tasks.length === 0) {
    return (
      <div className="text-center py-12 px-4">
        <CalendarPlus className="h-12 w-12 mx-auto mb-4 text-gray-400 opacity-50" />
        <h3 className="text-lg font-medium text-gray-300 mb-2">
          Nenhuma atividade encontrada
        </h3>
        <p className="text-gray-400 text-sm max-w-md mx-auto">
          {viewMode === 'day' 
            ? 'Adicione atividades para hoje para começar.'
            : viewMode === 'week'
            ? 'Nenhuma atividade planejada para esta semana.'
            : 'Nenhuma atividade planejada para este ano.'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        {paginatedTasks.map((task, index) => (
          <Draggable key={task.id} draggableId={task.id} index={index}>
            {(provided) => (
              <motion.div
                ref={provided.innerRef}
                {...provided.draggableProps as any}
                {...provided.dragHandleProps as any}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className={`
                  relative p-4 bg-gray-800/50 rounded-lg border-l-4 
                  ${getPriorityColor(task.priority)}
                  transition-all duration-200 hover:bg-gray-800
                  group
                `}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <button
                      onClick={() => toggleActivityStatus(task.id)}
                      className={`transition-colors flex-shrink-0 ${
                        task.status === 'completed'
                          ? 'text-green-500'
                          : 'text-gray-400 hover:text-green-500'
                      }`}
                      disabled={loading}
                    >
                      <CheckCircle className="h-6 w-6" />
                    </button>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium text-white">
                          {task.title}
                        </span>
                        {task.priority && (
                          <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${getPriorityBgColor(task.priority)}/50`}>
                            {task.priority}
                          </span>
                        )}
                      </div>
                      
                      {task.description && (
                        <p className="text-sm text-gray-400 mb-2">
                          {task.description}
                        </p>
                      )}
                      
                      <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-sm text-gray-400">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{task.time || 'Não especificado'}</span>
                        </div>
                        {task.estimatedDuration && (
                          <div className="flex items-center gap-1">
                            <Zap className="h-4 w-4" />
                            <span>{task.estimatedDuration} min</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Lightbulb className={`h-4 w-4 ${getEnergyIconColor(task.priority)}`} />
                          <span>{getEnergyLevel(task.priority)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="relative flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => setSelectedTaskId(selectedTaskId === task.id ? null : task.id)}
                      className="p-1 hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <MoreVertical className="h-4 w-4 text-gray-400" />
                    </button>

                    <AnimatePresence>
                      {selectedTaskId === task.id && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="absolute right-0 top-full mt-1 bg-gray-800 rounded-lg shadow-lg py-1 min-w-[120px] z-10"
                        >
                          <button
                            onClick={() => {
                              setSelectedTaskId(null);
                              alert('Funcionalidade de edição ainda não implementada.');
                            }}
                            className="w-full px-4 py-2 text-sm text-left flex items-center gap-2 hover:bg-gray-700 transition-colors"
                          >
                            <Edit2 className="h-4 w-4" />
                            Editar
                          </button>
                          {task.type === 'routine' && task.routineId ? (
                            <button
                              onClick={() => {
                                deleteRoutine(task.routineId!);
                                setSelectedTaskId(null);
                              }}
                              className="w-full px-4 py-2 text-sm text-left flex items-center gap-2 text-red-500 hover:bg-gray-700 transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                              Excluir Rotina
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                deleteActivity(task.id);
                                setSelectedTaskId(null);
                              }}
                              className="w-full px-4 py-2 text-sm text-left flex items-center gap-2 text-red-500 hover:bg-gray-700 transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                              Excluir Atividade
                            </button>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            )}
          </Draggable>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
            disabled={currentPage === 0}
            className="p-2 rounded-lg bg-gray-800 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          
          <span className="text-sm text-gray-400">
            Página {currentPage + 1} de {totalPages}
          </span>
          
          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
            disabled={currentPage === totalPages - 1}
            className="p-2 rounded-lg bg-gray-800 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  );
};