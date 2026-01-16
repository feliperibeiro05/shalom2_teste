import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ChevronRight, Plus, Pencil, Trash, Trophy } from 'lucide-react';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { useDevelopment, Skill } from '../../../contexts/DevelopmentContext';

interface SkillTreeProps {
  skill: Skill;
  planId: string;
}

export const SkillTree: React.FC<SkillTreeProps> = ({ skill, planId }) => {
  const { addCustomSkill, editSkill, deleteSkill, loading } = useDevelopment();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedParentId, setSelectedParentId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '' });

  const handleAddSkill = async () => {
    if (formData.name) {
      await addCustomSkill(planId, selectedParentId, { name: formData.name });
      setFormData({ name: '' });
      setShowAddForm(false);
      setSelectedParentId(null);
    }
  };

  const handleEdit = (skillToEdit: Skill) => {
    setEditingId(skillToEdit.id);
    setFormData({ name: skillToEdit.name });
  };

  const handleSaveEdit = async (skillId: string) => {
    await editSkill(planId, skillId, { name: formData.name });
    setEditingId(null);
    setFormData({ name: '' });
  };

  const renderSkill = (skillNode: Skill, depth: number = 0) => {
    const progressPercent = skillNode.nextLevelXp > 0 
        ? Math.min((skillNode.currentXp / skillNode.nextLevelXp) * 100, 100) 
        : 0;

    return (
      <div key={skillNode.id} className="space-y-4" style={{ marginLeft: `${depth * 1.5}rem` }}>
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className={`
            relative p-4 rounded-xl border transition-all
            ${depth === 0 ? 'bg-blue-900/20 border-blue-500/50' : 'bg-gray-800/50 border-gray-700'}
          `}
        >
          {editingId === skillNode.id ? (
            <div className="flex gap-2">
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ name: e.target.value })}
                className="flex-1 px-3 py-1 bg-gray-700 rounded text-white border border-gray-600 focus:border-blue-500 focus:outline-none"
                autoFocus
              />
              <Button size="sm" onClick={() => handleSaveEdit(skillNode.id)}>OK</Button>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  {depth > 0 ? (
                    <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center text-xs text-gray-400 font-bold">
                        {skillNode.level}
                    </div>
                  ) : (
                    <Trophy className="h-6 w-6 text-yellow-500" />
                  )}
                  
                  <div>
                    <h4 className="font-bold text-white text-lg flex items-center gap-2">
                        {skillNode.name}
                        {depth === 0 && <span className="text-xs bg-yellow-500/20 text-yellow-500 px-2 py-0.5 rounded-full">Principal</span>}
                    </h4>
                    <p className="text-xs text-gray-400">
                        Nível {skillNode.level} • {skillNode.currentXp}/{skillNode.nextLevelXp} XP
                    </p>
                  </div>
                </div>

                <div className="flex gap-1">
                    <button onClick={() => { setSelectedParentId(skillNode.id); setShowAddForm(true); }} className="p-2 hover:bg-white/10 rounded-full transition-colors" title="Adicionar sub-habilidade">
                        <Plus className="h-4 w-4 text-blue-400" />
                    </button>
                    {skillNode.isCustom && (
                        <button onClick={() => deleteSkill(planId, skillNode.id)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                            <Trash className="h-4 w-4 text-red-400" />
                        </button>
                    )}
                </div>
              </div>

              <div className="relative h-3 bg-gray-900 rounded-full overflow-hidden shadow-inner border border-gray-800">
                <motion.div
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-600 to-cyan-400 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </div>
              
              <div className="flex justify-between mt-1 text-[10px] text-gray-500 font-mono">
                  <span>{skillNode.currentXp} XP</span>
                  <span>{skillNode.nextLevelXp} XP (Próx)</span>
              </div>
            </>
          )}
        </motion.div>

        {skillNode.children && skillNode.children.length > 0 && (
          <div className="border-l-2 border-gray-800 ml-4 pl-4 pt-2">
            {skillNode.children.map(child => renderSkill(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  const hasSkills = !!skill && !!skill.plan_id;

  return (
    <div className="space-y-6">
      <Card title="Árvore de Habilidades (Progresso)">
        {!hasSkills ? (
            <div className="text-center p-8">
                <p className="text-gray-400">Nenhuma habilidade encontrada.</p>
                <Button onClick={() => handleAddSkill()} className="mt-4">Criar Raiz</Button>
            </div>
        ) : (
            <>
                {renderSkill(skill)}
                
                <AnimatePresence>
                    {showAddForm && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                            <div className="bg-gray-800 p-6 rounded-xl w-full max-w-sm border border-gray-700">
                                <h3 className="text-lg font-bold text-white mb-4">
                                    Nova {selectedParentId ? 'Sub-habilidade' : 'Habilidade'}
                                </h3>
                                <input
                                    type="text"
                                    placeholder="Nome (ex: React, Design...)"
                                    className="w-full px-4 py-2 bg-gray-700 rounded-lg text-white mb-4 border border-gray-600 focus:border-blue-500 outline-none"
                                    value={formData.name}
                                    onChange={e => setFormData({ name: e.target.value })}
                                />
                                <div className="flex justify-end gap-2">
                                    <Button variant="secondary" onClick={() => setShowAddForm(false)}>Cancelar</Button>
                                    <Button onClick={handleAddSkill}>Criar</Button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </>
        )}
      </Card>
    </div>
  );
};