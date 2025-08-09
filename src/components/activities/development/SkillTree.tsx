import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ChevronRight, Plus, Pencil, Trash, Sparkles, Lightbulb } from 'lucide-react';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { useDevelopment, Skill } from '../../../contexts/DevelopmentContext';

interface SkillTreeProps {
  skill: Skill;
  planId: string;
}

export const SkillTree: React.FC<SkillTreeProps> = ({ skill, planId }) => {
  const { 
    updateSkillProgress, 
    addCustomSkill,
    editSkill,
    deleteSkill,
    loading,
  } = useDevelopment();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedParentId, setSelectedParentId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
  });
  
  // Exemplo de árvore de habilidades para mostrar quando não há dados
  const exampleSkillTree = {
    id: 'example-root',
    name: 'Desenvolvimento Web',
    level: 1,
    progress: 25,
    isCustom: false,
    children: [
      {
        id: 'example-child-1',
        name: 'Frontend',
        level: 2,
        progress: 50,
        isCustom: false,
        children: [
          {
            id: 'example-grandchild-1',
            name: 'HTML/CSS',
            level: 3,
            progress: 75,
            isCustom: false,
            children: []
          },
          {
            id: 'example-grandchild-2',
            name: 'JavaScript',
            level: 2,
            progress: 30,
            isCustom: false,
            children: []
          }
        ]
      },
      {
        id: 'example-child-2',
        name: 'Backend',
        level: 1,
        progress: 10,
        isCustom: false,
        children: []
      }
    ]
  };

  const handleAddSkill = async () => {
    if (formData.name) {
      await addCustomSkill(planId, selectedParentId, {
        name: formData.name,
      });
      setFormData({ name: '' });
      setShowAddForm(false);
      setSelectedParentId(null);
    }
  };

  const handleEdit = (skillToEdit: Skill) => {
    setEditingId(skillToEdit.id);
    setFormData({
      name: skillToEdit.name,
    });
  };

  const handleSaveEdit = async (skillId: string) => {
    await editSkill(planId, skillId, { name: formData.name });
    setEditingId(null);
    setFormData({ name: '' });
  };

  const renderSkill = (skillNode: Skill, depth: number = 0) => {
    const handleProgressUpdate = async (skillId: string, newProgress: number) => {
      await updateSkillProgress(planId, skillId, Math.min(Math.max(newProgress, 0), 100));
    };

    return (
      <div key={skillNode.id} className="space-y-4" style={{ marginLeft: `${depth * 2}rem` }}>
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-gray-800/50 rounded-lg p-4 border border-gray-700"
        >
          {editingId === skillNode.id ? (
            <div className="space-y-4">
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-700 rounded-lg border border-gray-600"
                placeholder="Nome da habilidade"
                disabled={loading}
              />
              <div className="flex justify-end gap-2">
                <Button
                  variant="secondary"
                  onClick={() => setEditingId(null)}
                  disabled={loading}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={() => handleSaveEdit(skillNode.id)}
                  disabled={loading}
                >
                  {loading ? 'Salvando...' : 'Salvar'}
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {depth > 0 && <ChevronRight className="h-4 w-4 text-gray-500" />}
                  <h4 className="font-medium text-white">{skillNode.name}</h4>
                </div>
                <div className="flex items-center gap-2">
                  {skillNode.isCustom && (
                    <>
                      <button
                        onClick={() => handleEdit(skillNode)}
                        className="p-1 hover:bg-gray-700 rounded-lg transition-colors"
                        disabled={loading}
                      >
                        <Pencil className="h-4 w-4 text-gray-400" />
                      </button>
                      <button
                        onClick={() => deleteSkill(planId, skillNode.id)}
                        className="p-1 hover:bg-gray-700 rounded-lg transition-colors"
                        disabled={loading}
                      >
                        <Trash className="h-4 w-4 text-red-400" />
                      </button>
                    </>
                  )}
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < skillNode.level
                            ? 'text-yellow-500 fill-yellow-500'
                            : 'text-gray-600'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="relative h-2 bg-gray-700 rounded-full overflow-hidden">
                  <motion.div
                    className="absolute top-0 left-0 h-full bg-blue-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${skillNode.progress}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Nível {skillNode.level}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleProgressUpdate(skillNode.id, (skillNode.progress || 0) - 10)}
                      className="px-2 py-1 text-sm bg-gray-700 rounded hover:bg-gray-600 transition-colors"
                      disabled={loading}
                    >
                      -10%
                    </button>
                    <span className="text-sm text-gray-400">{skillNode.progress || 0}%</span>
                    <button
                      onClick={() => handleProgressUpdate(skillNode.id, (skillNode.progress || 0) + 10)}
                      className="px-2 py-1 text-sm bg-gray-700 rounded hover:bg-gray-600 transition-colors"
                      disabled={loading}
                    >
                      +10%
                    </button>
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => {
                  setSelectedParentId(skillNode.id);
                  setShowAddForm(true);
                }}
                className="mt-4 w-full p-2 rounded-lg border border-dashed border-gray-700 hover:border-blue-500 hover:bg-gray-800/50 transition-colors flex items-center justify-center gap-2 text-gray-400 hover:text-blue-500"
                disabled={loading}
              >
                <Plus className="h-5 w-5" />
                Adicionar Sub-habilidade
              </button>
            </>
          )}
        </motion.div>
        
        {skillNode.children && skillNode.children.length > 0 && (
          <div className="space-y-4">
            {skillNode.children.map(child => renderSkill(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };
  
  const hasSkills = !!skill && !!skill.plan_id;
  
  return (
    <div className="space-y-6">
      <Card title="Árvore de Habilidades">
        {!hasSkills ? (
          <div className="space-y-6">
            <div className="p-6 bg-gradient-to-br from-purple-500/10 to-cyan-500/10 border border-purple-500/20 rounded-lg text-center">
              <Lightbulb className="h-12 w-12 text-purple-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Crie Sua Própria Árvore de Habilidades</h3>
              <p className="text-gray-400 mb-6 max-w-md mx-auto">
                Mapeie suas habilidades e acompanhe seu progresso em cada área de desenvolvimento.
              </p>
              <Button
                onClick={() => {
                  setSelectedParentId(null);
                  setShowAddForm(true);
                }}
                className="bg-gradient-to-r from-purple-600 to-cyan-600"
                disabled={loading}
              >
                <Plus className="h-4 w-4 mr-2" />
                {loading ? 'Carregando...' : 'Criar Minha Primeira Habilidade'}
              </Button>
            </div>

            <AnimatePresence>
              {showAddForm && selectedParentId === null && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="bg-gray-800/50 rounded-lg p-6 border border-gray-700"
                >
                  <h4 className="text-lg font-medium text-white mb-4">Nova Habilidade (Raiz)</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Nome da Habilidade
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-3 py-2 bg-gray-700 rounded-lg border border-gray-600 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        placeholder="Ex: Desenvolvimento Web"
                        disabled={loading}
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                      <Button
                        variant="secondary"
                        onClick={() => {
                          setShowAddForm(false);
                          setSelectedParentId(null);
                          setFormData({ name: '' });
                        }}
                        disabled={loading}
                      >
                        Cancelar
                      </Button>
                      <Button
                        onClick={handleAddSkill}
                        disabled={!formData.name || loading}
                        className="bg-gradient-to-r from-purple-600 to-cyan-600"
                      >
                        {loading ? 'Criando...' : 'Criar Habilidade'}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="border-t border-gray-700 pt-6">
              <h4 className="text-lg font-medium text-white mb-4 flex items-center">
                <Sparkles className="h-5 w-5 text-purple-500 mr-2" />
                Exemplo de Árvore de Habilidades
              </h4>
              <p className="text-gray-400 mb-6">
                Veja como você pode organizar suas habilidades em uma estrutura hierárquica para visualizar melhor seu desenvolvimento.
              </p>
              {renderSkill(exampleSkillTree as Skill)}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {renderSkill(skill)}
            {showAddForm && selectedParentId !== null && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 bg-gray-800/50 rounded-lg p-4 space-y-4"
              >
                <h4 className="text-lg font-medium text-white mb-4">Nova Sub-habilidade</h4>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-700 rounded-lg border border-gray-600 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="Nome da sub-habilidade"
                  disabled={loading}
                />
                <div className="flex justify-end gap-2">
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setShowAddForm(false);
                      setSelectedParentId(null);
                      setFormData({ name: '' });
                    }}
                    disabled={loading}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleAddSkill}
                    disabled={!formData.name || loading}
                    className="bg-gradient-to-r from-purple-600 to-cyan-600"
                  >
                    {loading ? 'Criando...' : 'Adicionar'}
                  </Button>
                </div>
              </motion.div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
};