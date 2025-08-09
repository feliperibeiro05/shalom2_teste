import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Repeat, Clock, Zap, Calendar, Plus, Pencil, Trash, Sparkles, Lightbulb } from 'lucide-react';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { useDevelopment, Habit } from '../../../contexts/DevelopmentContext';
import { format, parseISO, addDays } from 'date-fns';

interface HabitBuilderProps {
  habits: Habit[];
  planId: string;
}

export const HabitBuilder: React.FC<HabitBuilderProps> = ({ habits, planId }) => {
  const { updateHabitStreak, addCustomHabit, editHabit, deleteHabit, loading } = useDevelopment();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    frequency: 'daily' as 'daily' | 'weekly',
    timeOfDay: ''
  });

  const allHabits = habits;

  const handleStreak = async (habitId: string) => {
    if (loading) return;

    const habit = habits.find(h => h.id === habitId);
    if (!habit) return;
    
    const today = new Date();
    const todayStr = format(today, 'yyyy-MM-dd');
    
    if (habit.lastCompleted === todayStr) {
      return;
    }
    
    let newStreak = habit.streak + 1;
    
    if (habit.lastCompleted) {
      const lastCompletedDate = parseISO(habit.lastCompleted);
      const yesterday = addDays(today, -1);
      
      if (format(lastCompletedDate, 'yyyy-MM-dd') !== format(yesterday, 'yyyy-MM-dd')) {
        newStreak = 1;
      }
    }

    await updateHabitStreak(planId, habitId, newStreak);
  };
  
  const getVisualDayNumber = (streak: number) => {
    return streak === 0 ? 0 : (streak - 1) % 7 + 1;
  };
  
  const exampleHabits = [
    {
      title: 'Prática Diária',
      description: 'Dedique 30 minutos todos os dias para praticar e desenvolver suas habilidades',
      frequency: 'daily',
      timeOfDay: '08:00'
    },
    {
      title: 'Revisão Semanal',
      description: 'Reserve um tempo para revisar seu progresso e planejar a próxima semana',
      frequency: 'weekly',
      timeOfDay: '18:00'
    },
    {
      title: 'Leitura Técnica',
      description: 'Leia artigos, livros ou documentação relacionada à sua área de desenvolvimento',
      frequency: 'daily',
      timeOfDay: '20:00'
    }
  ];

  const handleAddHabit = async () => {
    if (formData.title && formData.description) {
      await addCustomHabit(planId, {
        title: formData.title,
        description: formData.description,
        frequency: formData.frequency,
        timeOfDay: formData.timeOfDay || null
      });
      setFormData({
        title: '',
        description: '',
        frequency: 'daily',
        timeOfDay: ''
      });
      setShowAddForm(false);
    }
  };

  const handleEdit = (habit: Habit) => {
    setEditingId(habit.id);
    setFormData({
      title: habit.title,
      description: habit.description,
      frequency: habit.frequency,
      timeOfDay: habit.timeOfDay || ''
    });
  };

  const handleSaveEdit = async (habitId: string) => {
    await editHabit(planId, habitId, {
      title: formData.title,
      description: formData.description,
      frequency: formData.frequency,
      timeOfDay: formData.timeOfDay || null
    });
    setEditingId(null);
    setFormData({
      title: '',
      description: '',
      frequency: 'daily',
      timeOfDay: ''
    });
  };

  return (
    <div className="space-y-6">
      <Card title="Construtor de Hábitos">
        {allHabits.length === 0 ? (
          <div className="space-y-6">
            <div className="p-6 bg-gradient-to-br from-green-500/10 to-blue-500/10 border border-green-500/20 rounded-lg text-center">
              <Sparkles className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Crie Seus Próprios Hábitos</h3>
              <p className="text-gray-400 mb-6 max-w-md mx-auto">
                Defina hábitos personalizados para desenvolver consistência e alcançar seus objetivos mais rapidamente.
              </p>
              <Button
                onClick={() => setShowAddForm(true)}
                className="bg-gradient-to-r from-green-600 to-blue-600"
                disabled={loading}
              >
                <Plus className="h-4 w-4 mr-2" />
                Criar Meu Primeiro Hábito
              </Button>
            </div>

            <AnimatePresence>
              {showAddForm && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="bg-gray-800/50 rounded-lg p-6 border border-gray-700"
                >
                  <h4 className="text-lg font-medium text-white mb-4">Novo Hábito</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Título
                      </label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        className="w-full px-3 py-2 bg-gray-700 rounded-lg border border-gray-600 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        placeholder="Ex: Prática diária de código"
                        disabled={loading}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Descrição
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        className="w-full px-3 py-2 bg-gray-700 rounded-lg border border-gray-600 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        rows={3}
                        placeholder="Descreva o hábito que você quer desenvolver"
                        disabled={loading}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          Frequência
                        </label>
                        <select
                          value={formData.frequency}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            frequency: e.target.value as 'daily' | 'weekly'
                          }))}
                          className="w-full px-3 py-2 bg-gray-700 rounded-lg border border-gray-600 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                          disabled={loading}
                        >
                          <option value="daily">Diário</option>
                          <option value="weekly">Semanal</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          Horário
                        </label>
                        <input
                          type="time"
                          value={formData.timeOfDay}
                          onChange={(e) => setFormData(prev => ({ ...prev, timeOfDay: e.target.value }))}
                          className="w-full px-3 py-2 bg-gray-700 rounded-lg border border-gray-600 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                          disabled={loading}
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                      <Button
                        variant="secondary"
                        onClick={() => setShowAddForm(false)}
                        disabled={loading}
                      >
                        Cancelar
                      </Button>
                      <Button
                        onClick={handleAddHabit}
                        disabled={!formData.title || !formData.description || loading}
                        className="bg-gradient-to-r from-green-600 to-blue-600"
                      >
                        {loading ? 'Criando...' : 'Criar Hábito'}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="border-t border-gray-700 pt-6">
              <h4 className="text-lg font-medium text-white mb-4 flex items-center">
                <Lightbulb className="h-5 w-5 text-gray-500 mr-2" />
                Exemplos de Hábitos
              </h4>
              <div className="space-y-4">
                {exampleHabits.map((example, index) => (
                  <div key={index} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h5 className="font-medium text-white mb-1">{example.title}</h5>
                        <p className="text-sm text-gray-400">{example.description}</p>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Repeat className="h-4 w-4 text-blue-500" />
                        <span className="text-gray-400">
                          {example.frequency === 'daily' ? 'Diário' : 'Semanal'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Clock className="h-4 w-4" />
                      <span>{example.timeOfDay}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {allHabits.map((habit, index) => (
              <motion.div
                key={habit.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-800/50 rounded-lg p-4 border border-gray-700"
              >
                {editingId === habit.id ? (
                  <div className="space-y-4">
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-3 py-2 bg-gray-700 rounded-lg border border-gray-600"
                      placeholder="Título do hábito"
                      disabled={loading}
                    />
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full px-3 py-2 bg-gray-700 rounded-lg border border-gray-600"
                      placeholder="Descrição"
                      rows={3}
                      disabled={loading}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <select
                          value={formData.frequency}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            frequency: e.target.value as 'daily' | 'weekly'
                          }))}
                          className="w-full px-3 py-2 bg-gray-700 rounded-lg border border-gray-600 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                          disabled={loading}
                        >
                          <option value="daily">Diário</option>
                          <option value="weekly">Semanal</option>
                        </select>
                      </div>
                      <div>
                        <input
                          type="time"
                          value={formData.timeOfDay}
                          onChange={(e) => setFormData(prev => ({ ...prev, timeOfDay: e.target.value }))}
                          className="w-full px-3 py-2 bg-gray-700 rounded-lg border border-gray-600 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                          disabled={loading}
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="secondary"
                        onClick={() => setEditingId(null)}
                        disabled={loading}
                      >
                        Cancelar
                      </Button>
                      <Button
                        onClick={() => handleSaveEdit(habit.id)}
                        disabled={loading}
                      >
                        {loading ? 'Salvando...' : 'Salvar'}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-medium text-white mb-1">{habit.title}</h4>
                        <p className="text-sm text-gray-400">{habit.description}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {habit.isCustom && (
                          <>
                            <button
                              onClick={() => handleEdit(habit)}
                              className="p-1 hover:bg-gray-700 rounded-lg transition-colors"
                              disabled={loading}
                            >
                              <Pencil className="h-4 w-4 text-gray-400" />
                            </button>
                            <button
                              onClick={() => deleteHabit(planId, habit.id)}
                              className="p-1 hover:bg-gray-700 rounded-lg transition-colors"
                              disabled={loading}
                            >
                              <Trash className="h-4 w-4 text-red-400" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-400">{habit.timeOfDay || 'Não especificado'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Zap className="h-4 w-4 text-yellow-500" />
                        <span className="text-gray-400">
                          {habit.streak} dias seguidos
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4" />
                        <span className="text-gray-400">
                          {habit.lastCompleted ? format(parseISO(habit.lastCompleted), 'dd/MM/yyyy') : 'Não iniciado'}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4">
                      <div className="flex gap-1">
                        {[...Array(7)].map((_, i) => {
                          const today = new Date();
                          const todayFormatted = format(today, 'yyyy-MM-dd');
                          
                          const lastCompletedDate = habit.lastCompleted ? parseISO(habit.lastCompleted) : null;
                          const isTodayCompleted = lastCompletedDate && format(lastCompletedDate, 'yyyy-MM-dd') === todayFormatted;
                          
                          const streakDay = i + 1;
                          const isCompletedVisual = habit.streak >= streakDay;
                          const isClickableDay = isTodayCompleted ? false : habit.streak === i;

                          return (
                            <button
                              key={i}
                              onClick={() => isClickableDay && handleStreak(habit.id)}
                              disabled={!isClickableDay || loading}
                              className={`
                                w-8 h-8 rounded-lg flex items-center justify-center text-sm
                                transition-colors
                                ${isCompletedVisual
                                  ? 'bg-green-500/20 text-green-500'
                                  : isClickableDay
                                    ? 'bg-blue-500/20 text-blue-500 hover:bg-blue-500/30'
                                    : 'bg-gray-700 text-gray-300 cursor-not-allowed'
                                }
                              `}
                            >
                              {streakDay}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}
              </motion.div>
            ))}

            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={() => setShowAddForm(true)}
              className="w-full p-4 rounded-lg border border-dashed border-gray-700 hover:border-green-500 hover:bg-gray-800/50 transition-colors flex items-center justify-center gap-2 text-gray-400 hover:text-green-500"
              disabled={loading}
            >
              <Plus className="h-5 w-5" />
              Adicionar Novo Hábito
            </motion.button>

            <AnimatePresence>
              {showAddForm && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="bg-gray-800/50 rounded-lg p-6 border border-gray-700"
                >
                  <h4 className="text-lg font-medium text-white mb-4">Novo Hábito</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Título
                      </label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        className="w-full px-3 py-2 bg-gray-700 rounded-lg border border-gray-600 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        placeholder="Ex: Prática diária de código"
                        disabled={loading}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Descrição
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        className="w-full px-3 py-2 bg-gray-700 rounded-lg border border-gray-600 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        rows={3}
                        placeholder="Descreva o hábito que você quer desenvolver"
                        disabled={loading}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          Frequência
                        </label>
                        <select
                          value={formData.frequency}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            frequency: e.target.value as 'daily' | 'weekly'
                          }))}
                          className="w-full px-3 py-2 bg-gray-700 rounded-lg border border-gray-600 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                          disabled={loading}
                        >
                          <option value="daily">Diário</option>
                          <option value="weekly">Semanal</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          Horário
                        </label>
                        <input
                          type="time"
                          value={formData.timeOfDay}
                          onChange={(e) => setFormData(prev => ({ ...prev, timeOfDay: e.target.value }))}
                          className="w-full px-3 py-2 bg-gray-700 rounded-lg border border-gray-600 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                          disabled={loading}
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                      <Button
                        variant="secondary"
                        onClick={() => setShowAddForm(false)}
                        disabled={loading}
                      >
                        Cancelar
                      </Button>
                      <Button
                        onClick={handleAddHabit}
                        disabled={!formData.title || !formData.description || loading}
                        className="bg-gradient-to-r from-green-600 to-blue-600"
                      >
                        {loading ? 'Criando...' : 'Criar Hábito'}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </Card>
    </div>
  );
};