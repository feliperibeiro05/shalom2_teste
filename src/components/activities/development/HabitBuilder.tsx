import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Repeat, Clock, Zap, Calendar, Plus, Pencil, Trash, Sparkles, Link } from 'lucide-react';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { useDevelopment, Habit } from '../../../contexts/DevelopmentContext';
import { format, parseISO } from 'date-fns';

interface HabitBuilderProps {
  habits: Habit[];
  planId: string;
}

export const HabitBuilder: React.FC<HabitBuilderProps> = ({ habits, planId }) => {
  const { completeHabit, addCustomHabit, editHabit, deleteHabit, loading, getFlatSkills } = useDevelopment();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    frequency: 'daily' as 'daily' | 'weekly',
    timeOfDay: '',
    linkedSkillId: ''
  });

  const availableSkills = getFlatSkills ? getFlatSkills(planId) : [];

  const handleStreak = async (habitId: string) => {
    if (loading) return;
    await completeHabit(planId, habitId);
  };

  const handleAddHabit = async () => {
    if (formData.title) {
      await addCustomHabit(planId, {
        title: formData.title,
        description: formData.description,
        frequency: formData.frequency,
        timeOfDay: formData.timeOfDay || null,
        linkedSkillId: formData.linkedSkillId || null,
        xpReward: 10
      });
      resetForm();
    }
  };

  const handleEdit = (habit: Habit) => {
    setEditingId(habit.id);
    setFormData({
      title: habit.title,
      description: habit.description,
      frequency: habit.frequency,
      timeOfDay: habit.timeOfDay || '',
      linkedSkillId: habit.linkedSkillId || ''
    });
  };

  const handleSaveEdit = async (habitId: string) => {
    await editHabit(planId, habitId, {
      title: formData.title,
      description: formData.description,
      frequency: formData.frequency,
      timeOfDay: formData.timeOfDay || null,
      linkedSkillId: formData.linkedSkillId || null
    });
    setEditingId(null);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
        title: '',
        description: '',
        frequency: 'daily',
        timeOfDay: '',
        linkedSkillId: ''
    });
    setShowAddForm(false);
  };

  return (
    <div className="space-y-6">
      <Card title="Construtor de Hábitos (Gerador de XP)">
        {habits.length === 0 ? (
          <div className="space-y-6">
            <div className="p-6 bg-gradient-to-br from-green-500/10 to-blue-500/10 border border-green-500/20 rounded-lg text-center">
              <Sparkles className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Comece sua Rotina de Evolução</h3>
              <p className="text-gray-400 mb-6 max-w-md mx-auto">
                Crie hábitos e vincule-os às suas habilidades. Ao completar um hábito, você ganha XP e sobe de nível!
              </p>
              <Button onClick={() => setShowAddForm(true)} className="bg-gradient-to-r from-green-600 to-blue-600">
                <Plus className="h-4 w-4 mr-2" />
                Criar Hábito
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {habits.map((habit) => {
                const linkedSkill = availableSkills.find(s => s.id === habit.linkedSkillId);
                return (
                  <motion.div
                    key={habit.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gray-800/50 rounded-lg p-4 border border-gray-700"
                  >
                    {editingId === habit.id ? (
                        <div className="space-y-4">
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                className="w-full px-3 py-2 bg-gray-700 rounded-lg text-white border border-gray-600 focus:border-blue-500 focus:outline-none"
                                placeholder="Título"
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <select
                                    value={formData.linkedSkillId}
                                    onChange={(e) => setFormData(prev => ({ ...prev, linkedSkillId: e.target.value }))}
                                    className="w-full px-3 py-2 bg-gray-700 rounded-lg text-white border border-gray-600 focus:border-blue-500 focus:outline-none"
                                >
                                    <option value="">Sem vínculo (Sem XP)</option>
                                    {availableSkills.map(skill => (
                                        <option key={skill.id} value={skill.id}>{skill.name} (Nv. {skill.level})</option>
                                    ))}
                                </select>
                                <input
                                    type="time"
                                    value={formData.timeOfDay}
                                    onChange={(e) => setFormData(prev => ({ ...prev, timeOfDay: e.target.value }))}
                                    className="w-full px-3 py-2 bg-gray-700 rounded-lg text-white border border-gray-600 focus:border-blue-500 focus:outline-none"
                                />
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button variant="secondary" onClick={() => setEditingId(null)}>Cancelar</Button>
                                <Button onClick={() => handleSaveEdit(habit.id)}>Salvar</Button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <h4 className="font-medium text-white mb-1">{habit.title}</h4>
                                    <p className="text-sm text-gray-400">{habit.description}</p>
                                    {linkedSkill && (
                                        <div className="flex items-center gap-1 mt-1 text-xs text-blue-400">
                                            <Link className="h-3 w-3" />
                                            <span>Gera XP para: {linkedSkill.name}</span>
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => handleEdit(habit)} className="p-1 hover:bg-gray-700 rounded"><Pencil className="h-4 w-4 text-gray-400" /></button>
                                    <button onClick={() => deleteHabit(planId, habit.id)} className="p-1 hover:bg-gray-700 rounded"><Trash className="h-4 w-4 text-red-400" /></button>
                                </div>
                            </div>

                            <div className="flex items-center justify-between mt-4">
                                <div className="flex items-center gap-2 text-sm text-yellow-500">
                                    <Zap className="h-4 w-4" />
                                    <span>{habit.streak} dias seguidos</span>
                                </div>
                                <Button 
                                    onClick={() => handleStreak(habit.id)}
                                    disabled={habit.lastCompleted === format(new Date(), 'yyyy-MM-dd') || loading}
                                    className={`
                                        ${habit.lastCompleted === format(new Date(), 'yyyy-MM-dd') 
                                            ? 'bg-green-600/50 cursor-not-allowed' 
                                            : 'bg-blue-600 hover:bg-blue-700'}
                                    `}
                                >
                                    {habit.lastCompleted === format(new Date(), 'yyyy-MM-dd') ? 'Completado Hoje' : '+10 XP & Check'}
                                </Button>
                            </div>
                        </>
                    )}
                  </motion.div>
                );
            })}
          </div>
        )}

        <AnimatePresence>
            {showAddForm || (habits.length > 0 && !showAddForm) ? (
                 <div className="mt-4">
                    {showAddForm ? (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
                            <h4 className="text-lg font-medium text-white mb-4">Novo Hábito</h4>
                            <div className="space-y-4">
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                    className="w-full px-3 py-2 bg-gray-700 rounded-lg text-white border border-gray-600 focus:border-blue-500 focus:outline-none"
                                    placeholder="Título (ex: Ler 10 páginas)"
                                />
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs text-gray-400 mb-1 block">Vincular a Habilidade (Ganhar XP)</label>
                                        <select
                                            value={formData.linkedSkillId}
                                            onChange={(e) => setFormData(prev => ({ ...prev, linkedSkillId: e.target.value }))}
                                            className="w-full px-3 py-2 bg-gray-700 rounded-lg text-white border border-gray-600 focus:border-blue-500 focus:outline-none"
                                        >
                                            <option value="">Selecione uma habilidade...</option>
                                            {availableSkills.map(skill => (
                                                <option key={skill.id} value={skill.id}>{skill.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-400 mb-1 block">Frequência</label>
                                        <select
                                            value={formData.frequency}
                                            onChange={(e) => setFormData(prev => ({ ...prev, frequency: e.target.value as any }))}
                                            className="w-full px-3 py-2 bg-gray-700 rounded-lg text-white border border-gray-600 focus:border-blue-500 focus:outline-none"
                                        >
                                            <option value="daily">Diário</option>
                                            <option value="weekly">Semanal</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="flex justify-end gap-2">
                                    <Button variant="secondary" onClick={resetForm}>Cancelar</Button>
                                    <Button onClick={handleAddHabit}>Criar</Button>
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <Button onClick={() => setShowAddForm(true)} className="w-full border-dashed border-gray-700 bg-transparent hover:bg-gray-800 text-gray-400">
                            <Plus className="h-4 w-4 mr-2" /> Adicionar Outro Hábito
                        </Button>
                    )}
                 </div>
            ) : null}
        </AnimatePresence>
      </Card>
    </div>
  );
};