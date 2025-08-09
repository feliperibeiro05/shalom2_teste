import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { format, addDays, differenceInDays } from 'date-fns';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

// Tipos
export interface Milestone {
  id: string;
  plan_id: string;
  title: string;
  description: string;
  completed: boolean;
  dueDate?: string | null;
  isCustom?: boolean;
  completedDate?: string | null;
}

export interface Habit {
  id: string;
  plan_id: string;
  title: string;
  description: string;
  frequency: 'daily' | 'weekly';
  timeOfDay?: string | null;
  streak: number;
  lastCompleted?: string | null;
  isCustom?: boolean;
}

export interface Skill {
  id: string;
  plan_id: string;
  parent_id?: string | null;
  name: string;
  level: number;
  progress: number;
  children?: Skill[];
  isCustom?: boolean;
}

export interface DevelopmentPlan {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category: string;
  startDate: string;
  targetDate: string;
  progress: number;
  milestones: Milestone[];
  habits: Habit[];
  skillTree: Skill;
}

interface DevelopmentContextType {
  plans: DevelopmentPlan[];
  activePlanId: string | null;
  loading: boolean;
  error: string | null;
  addPlan: (title: string, category: string, targetDate: string) => Promise<void>;
  setActivePlan: (id: string) => void;
  toggleMilestone: (planId: string, milestoneId: string) => Promise<void>;
  updateHabitStreak: (planId: string, habitId: string, streak: number) => Promise<void>;
  updateSkillProgress: (planId: string, skillId: string, progress: number) => Promise<void>;
  addCustomMilestone: (planId: string, milestone: Omit<Milestone, 'id' | 'completed' | 'plan_id'>) => Promise<void>;
  addCustomHabit: (planId: string, habit: Omit<Habit, 'id' | 'streak' | 'plan_id'>) => Promise<void>;
  addCustomSkill: (planId: string, parentSkillId: string | null, skill: Omit<Skill, 'id' | 'level' | 'progress' | 'plan_id' | 'parent_id' | 'children'>) => Promise<void>;
  editMilestone: (planId: string, milestoneId: string, updates: Partial<Milestone>) => Promise<void>;
  editHabit: (planId: string, habitId: string, updates: Partial<Habit>) => Promise<void>;
  editSkill: (planId: string, skillId: string, updates: Partial<Skill>) => Promise<void>;
  deleteMilestone: (planId: string, milestoneId: string) => Promise<void>;
  deleteHabit: (planId: string, habitId: string) => Promise<void>;
  deleteSkill: (planId: string, skillId: string) => Promise<void>;
  deletePlan: (planId: string) => Promise<void>;
  getMilestonesForPlan: (planId: string) => Milestone[];
  getHabitsForPlan: (planId: string) => Habit[];
  getSkillsForPlan: (planId: string) => Skill | undefined;
  recalculatePlanProgress: (planId: string) => Promise<void>;
}

const DevelopmentContext = createContext<DevelopmentContextType | undefined>(undefined);

// Mapeador de Frontend (camelCase) para Backend (snake_case)
const mapToSupabase = (obj: any): Record<string, any> => {
    const newObj: Record<string, any> = {};
    for (const key in obj) {
        if (obj.hasOwnProperty(key) && obj[key] !== undefined) {
            const snakeCaseKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
            newObj[snakeCaseKey] = obj[key] === '' ? null : obj[key];
        }
    }
    return newObj;
};

// Mapeador de Backend (snake_case) para Frontend (camelCase)
const mapFromSupabase = (obj: Record<string, any>): Record<string, any> => {
    const newObj: Record<string, any> = {};
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            const camelCaseKey = key.replace(/(_\w)/g, (match) => match[1].toUpperCase());
            newObj[camelCaseKey] = obj[key];
        }
    }
    return newObj;
};

const createDevelopmentPlanData = (title: string, category: string, userId: string, targetDate: string) => {
    const commonMilestones = [
        { title: 'Dominar Fundamentos', description: 'Compreender os conceitos básicos e princípios fundamentais.', dueDate: format(addDays(new Date(), 30), 'yyyy-MM-dd') },
        { title: 'Projeto Prático', description: 'Aplicar conhecimentos em um projeto real para consolidar o aprendizado.', dueDate: format(addDays(new Date(), 90), 'yyyy-MM-dd') },
        { title: 'Especialização', description: 'Aprofundar conhecimentos em uma área específica de interesse.', dueDate: format(addDays(new Date(), 180), 'yyyy-MM-dd') }
    ];

    const commonHabits = [
        { title: 'Prática Diária', description: 'Dedicar pelo menos 30 minutos de estudo ou prática.', frequency: 'daily', timeOfDay: '19:00' },
        { title: 'Revisão Semanal', description: 'Revisar o progresso e planejar os próximos passos para a semana.', frequency: 'weekly', timeOfDay: '18:00' }
    ];
    
    const today = format(new Date(), 'yyyy-MM-dd');

    const planData = {
        id: uuidv4(),
        user_id: userId,
        title,
        description: `Plano de desenvolvimento em ${category}`,
        category,
        start_date: today,
        target_date: targetDate,
        progress: 0,
    };

    let milestonesToInsert = commonMilestones;
    let habitsToInsert = commonHabits;
    let rootSkillName = category;

    switch (category) {
        case 'programming':
            rootSkillName = 'Desenvolvimento Web';
            break;
        case 'languages':
            milestonesToInsert = [
                { title: 'Aprender Fundamentos', description: 'Dominar o vocabulário e a gramática básica.', dueDate: format(addDays(new Date(), 30), 'yyyy-MM-dd') },
                { title: 'Conversar por 10 minutos', description: 'Ser capaz de ter uma conversa simples por pelo menos 10 minutos.', dueDate: format(addDays(new Date(), 90), 'yyyy-MM-dd') },
                { title: 'Ler um livro no idioma', description: 'Ler um livro de nível iniciante ou intermediário.', dueDate: format(addDays(new Date(), 180), 'yyyy-MM-dd') }
            ];
            habitsToInsert = [
                { title: 'Estudar vocabulário', description: 'Usar flashcards ou um aplicativo para aprender 10 palavras novas por dia.', frequency: 'daily', timeOfDay: '18:00' },
                { title: 'Praticar com áudio', description: 'Ouvir podcasts ou músicas no idioma por 20 minutos.', frequency: 'daily', timeOfDay: '08:00' }
            ];
            rootSkillName = 'Fluência em Idiomas';
            break;
        case 'exercises':
            milestonesToInsert = [
                { title: 'Manter Consistência', description: 'Fazer exercícios 3 vezes por semana por 1 mês.', dueDate: format(addDays(new Date(), 30), 'yyyy-MM-dd') },
                { title: 'Atingir 10k Passos Diários', description: 'Alcançar a meta de 10.000 passos por dia em 7 dias seguidos.', dueDate: format(addDays(new Date(), 60), 'yyyy-MM-dd') },
                { title: 'Completar um desafio', description: 'Participar e concluir um desafio de 30 dias de exercícios.', dueDate: format(addDays(new Date(), 120), 'yyyy-MM-dd') }
            ];
            habitsToInsert = [
                { title: 'Caminhada matinal', description: 'Uma caminhada de 20 minutos para começar o dia.', frequency: 'daily', timeOfDay: '06:00' },
                { title: 'Sessão de Treino', description: 'Uma sessão de treino de 45 minutos.', frequency: 'weekly', timeOfDay: '18:30' }
            ];
            rootSkillName = 'Condicionamento Físico';
            break;
    }

    const skillsToInsert = [];
    const rootSkillId = uuidv4();
    skillsToInsert.push({ id: rootSkillId, name: rootSkillName, level: 1, progress: 0, parent_id: null, plan_id: planData.id, isCustom: false });
    
    if (category === 'programming') {
        const rootId = skillsToInsert[0].id;
        skillsToInsert.push(
            { id: uuidv4(), name: 'Frontend', level: 1, progress: 0, parent_id: rootId, plan_id: planData.id, isCustom: false },
            { id: uuidv4(), name: 'Backend', level: 1, progress: 0, parent_id: rootId, plan_id: planData.id, isCustom: false }
        );
    } else {
        skillsToInsert[0] = { ...skillsToInsert[0], id: uuidv4(), plan_id: planData.id, isCustom: false };
    }


    const mappedMilestones = milestonesToInsert.map(m => mapToSupabase({ ...m, plan_id: planData.id, completed: false, isCustom: false }));
    const mappedHabits = habitsToInsert.map(h => mapToSupabase({ ...h, plan_id: planData.id, streak: 0, isCustom: false }));

    return {
        plan: planData,
        milestones: mappedMilestones,
        habits: mappedHabits,
        skills: skillsToInsert
    };
};

export const DevelopmentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [plans, setPlans] = useState<DevelopmentPlan[]>([]);
  const [activePlanId, setActivePlanId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchDevelopmentData = useCallback(async () => {
    if (!user) {
      setPlans([]);
      setActivePlanId(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { data: plansData, error: plansError } = await supabase
        .from('development_plans')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });
      if (plansError) throw plansError;
      const fetchedPlans = plansData.map(p => mapFromSupabase(p));

      const planIds = fetchedPlans.map(p => p.id);
      
      const { data: milestonesData, error: milestonesError } = await supabase
        .from('milestones')
        .select('*')
        .in('plan_id', planIds);
      if (milestonesError) throw milestonesError;
      const fetchedMilestones = milestonesData.map(mapFromSupabase);

      const { data: habitsData, error: habitsError } = await supabase
        .from('habits')
        .select('*')
        .in('plan_id', planIds);
      if (habitsError) throw habitsError;
      const fetchedHabits = habitsData.map(mapFromSupabase);

      const { data: skillsData, error: skillsError } = await supabase
        .from('skills')
        .select('*')
        .in('plan_id', planIds);
      if (skillsError) throw skillsError;
      const fetchedSkills = skillsData.map(mapFromSupabase);

      const buildSkillTree = (skills: Skill[], parentId: string | null = null): Skill | undefined => {
        const rootSkill = skills.find(s => s.parent_id === parentId);
        if (!rootSkill) return undefined;

        const children = skills.filter(s => s.parent_id === rootSkill.id);
        return {
            ...rootSkill,
            children: children.map(child => buildSkillTree(skills, child.id)).filter(Boolean) as Skill[]
        };
      };
      
      const reconstructedPlans = fetchedPlans.map(plan => {
        const planMilestones = fetchedMilestones.filter(m => m.plan_id === plan.id) as Milestone[];
        const planHabits = fetchedHabits.filter(h => h.plan_id === plan.id) as Habit[];
        const planSkillsFlat = fetchedSkills.filter(s => s.plan_id === plan.id) as Skill[];
        const skillTree = buildSkillTree(planSkillsFlat, null);
        
        return {
          ...plan,
          milestones: planMilestones,
          habits: planHabits,
          skillTree: skillTree || { id: uuidv4(), name: plan.category, level: 1, progress: 0, children: [], plan_id: plan.id, parent_id: null } as Skill,
        };
      });

      setPlans(reconstructedPlans as DevelopmentPlan[]);
      
      const savedActiveId = localStorage.getItem('active_development_plan_id');
      if (savedActiveId && reconstructedPlans.some(p => p.id === savedActiveId)) {
        setActivePlanId(savedActiveId);
      } else if (reconstructedPlans.length > 0) {
        setActivePlanId(reconstructedPlans[0].id);
      } else {
        setActivePlanId(null);
      }

    } catch (err) {
      console.error('Error fetching development data:', err);
      setError('Erro ao carregar dados de desenvolvimento.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchDevelopmentData();
  }, [fetchDevelopmentData]);

  useEffect(() => {
    if (activePlanId) {
      localStorage.setItem('active_development_plan_id', activePlanId);
    } else {
      localStorage.removeItem('active_development_plan_id');
    }
  }, [activePlanId]);


  const addPlan = async (title: string, category: string, targetDate: string) => {
    if (!user) { setError('Usuário não autenticado.'); return; }
    
    setLoading(true);
    setError(null);
    try {
        const planDataToInsert = createDevelopmentPlanData(title, category, user.id, targetDate);
        
        const { data: insertedPlanData, error: planError } = await supabase
            .from('development_plans')
            .insert(planDataToInsert.plan)
            .select();
        if (planError) throw planError;
        const insertedPlan = mapFromSupabase(insertedPlanData![0]) as DevelopmentPlan;

        const mappedMilestones = planDataToInsert.milestones.map(m => mapToSupabase({ ...m, plan_id: insertedPlan.id }));
        const { error: milestonesError } = await supabase.from('milestones').insert(mappedMilestones);
        if (milestonesError) throw milestonesError;

        const mappedHabits = planDataToInsert.habits.map(h => mapToSupabase({ ...h, plan_id: insertedPlan.id }));
        const { error: habitsError } = await supabase.from('habits').insert(mappedHabits);
        if (habitsError) throw habitsError;

        const mappedSkills = planDataToInsert.skills.map(s => mapToSupabase(s));
        const { error: skillError } = await supabase.from('skills').insert(mappedSkills);
        if (skillError) throw skillError;

        await fetchDevelopmentData();
        setActivePlanId(insertedPlan.id);

    } catch (err) {
        setError('Erro ao adicionar plano.');
        console.error(err);
    } finally {
        setLoading(false);
    }
  };

  const recalculatePlanProgress = useCallback(async (planId: string) => {
    if (!user) return;
    try {
      const { data: milestonesData, error: milestonesError } = await supabase
        .from('milestones')
        .select('completed')
        .eq('plan_id', planId);
      if (milestonesError) throw milestonesError;

      const totalMilestones = milestonesData.length;
      const completedMilestones = milestonesData.filter(m => m.completed).length;
      const newProgress = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;

      const { error: updateError } = await supabase
        .from('development_plans')
        .update({ progress: newProgress })
        .eq('id', planId);
      if (updateError) throw updateError;
      
      setPlans(prev => prev.map(plan => 
        plan.id === planId ? { ...plan, progress: newProgress } : plan
      ));

    } catch (err) {
      console.error('Error recalculating plan progress:', err);
      setError('Erro ao recalcular progresso do plano.');
    }
  }, [user]);

  const setActivePlan = (id: string) => {
    setActivePlanId(id);
  };

  const toggleMilestone = async (planId: string, milestoneId: string) => {
    if (!user) { setError('Usuário não autenticado.'); return; }
    setLoading(true);
    setError(null);
    try {
      const { data: currentMilestone, error: fetchError } = await supabase
        .from('milestones')
        .select('completed')
        .eq('id', milestoneId)
        .single();
      
      if (fetchError) throw fetchError;

      const newCompletedState = !currentMilestone.completed;
      const newCompletedDate = newCompletedState ? format(new Date(), 'yyyy-MM-dd') : null;

      const { error: updateError } = await supabase
        .from('milestones')
        .update({ completed: newCompletedState, completed_date: newCompletedDate })
        .eq('id', milestoneId);
      
      if (updateError) throw updateError;
      
      await recalculatePlanProgress(planId);
      await fetchDevelopmentData();

    } catch (err) {
      setError('Erro ao atualizar marco.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateHabitStreak = async (planId: string, habitId: string, streak: number) => {
    if (!user) { setError('Usuário não autenticado.'); return; }
    setLoading(true);
    setError(null);
    try {
      const { error: updateError } = await supabase
        .from('habits')
        .update({ streak, last_completed: format(new Date(), 'yyyy-MM-dd') })
        .eq('id', habitId);
      
      if (updateError) throw updateError;
      await fetchDevelopmentData();
    } catch (err) {
      setError('Erro ao atualizar sequência.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const updateSkillProgress = async (planId: string, skillId: string, progress: number) => {
    if (!user) { setError('Usuário não autenticado.'); return; }
    setLoading(true);
    setError(null);
    try {
      const level = Math.floor(progress / 20) + 1;
      const { error: updateError } = await supabase
        .from('skills')
        .update({ progress, level })
        .eq('id', skillId);

      if (updateError) throw updateError;
      await fetchDevelopmentData();
    } catch (err) {
      setError('Erro ao atualizar progresso da habilidade.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const addCustomMilestone = async (planId: string, milestone: Omit<Milestone, 'id' | 'completed' | 'plan_id'>) => {
    if (!user) { setError('Usuário não autenticado.'); return; }
    setLoading(true);
    setError(null);
    try {
      const newMilestone = mapToSupabase({
        ...milestone,
        id: uuidv4(),
        completed: false,
        isCustom: true,
        plan_id: planId
      });
      const { error: insertError } = await supabase.from('milestones').insert(newMilestone);
      if (insertError) throw insertError;
      
      await recalculatePlanProgress(planId);
      await fetchDevelopmentData();
    } catch (err) {
      setError('Erro ao adicionar marco personalizado.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const addCustomHabit = async (planId: string, habit: Omit<Habit, 'id' | 'streak' | 'plan_id'>) => {
    if (!user) { setError('Usuário não autenticado.'); return; }
    setLoading(true);
    setError(null);
    try {
      const newHabit = mapToSupabase({
        ...habit,
        id: uuidv4(),
        streak: 0,
        isCustom: true,
        plan_id: planId,
        lastCompleted: null
      });
      const { error: insertError } = await supabase.from('habits').insert(newHabit);
      if (insertError) throw insertError;
      
      await fetchDevelopmentData();
    } catch (err) {
      setError('Erro ao adicionar hábito personalizado.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const addCustomSkill = async (planId: string, parentSkillId: string | null, skill: Omit<Skill, 'id' | 'level' | 'progress' | 'plan_id' | 'parent_id' | 'children'>) => {
    if (!user) { setError('Usuário não autenticado.'); return; }
    setLoading(true);
    setError(null);
    try {
      const newSkill = mapToSupabase({
        ...skill,
        id: uuidv4(),
        level: 1,
        progress: 0,
        isCustom: true,
        plan_id: planId,
        parent_id: parentSkillId
      });
      const { error: insertError } = await supabase.from('skills').insert(newSkill);
      if (insertError) throw insertError;
      
      await fetchDevelopmentData();
    } catch (err) {
      setError('Erro ao adicionar habilidade personalizada.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const editMilestone = async (planId: string, milestoneId: string, updates: Partial<Milestone>) => {
    if (!user) { setError('Usuário não autenticado.'); return; }
    setLoading(true);
    setError(null);
    try {
      const { error: updateError } = await supabase
        .from('milestones')
        .update(mapToSupabase(updates))
        .eq('id', milestoneId);
      
      if (updateError) throw updateError;
      await recalculatePlanProgress(planId);
      await fetchDevelopmentData();
    } catch (err) {
      setError('Erro ao editar marco.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const editHabit = async (planId: string, habitId: string, updates: Partial<Habit>) => {
    if (!user) { setError('Usuário não autenticado.'); return; }
    setLoading(true);
    setError(null);
    try {
      const { error: updateError } = await supabase
        .from('habits')
        .update(mapToSupabase(updates))
        .eq('id', habitId);
      
      if (updateError) throw updateError;
      await fetchDevelopmentData();
    } catch (err) {
      setError('Erro ao editar hábito.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const editSkill = async (planId: string, skillId: string, updates: Partial<Skill>) => {
    if (!user) { setError('Usuário não autenticado.'); return; }
    setLoading(true);
    setError(null);
    try {
      const { error: updateError } = await supabase
        .from('skills')
        .update(mapToSupabase(updates))
        .eq('id', skillId);
      
      if (updateError) throw updateError;
      await fetchDevelopmentData();
    } catch (err) {
      setError('Erro ao editar habilidade.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const deleteMilestone = async (planId: string, milestoneId: string) => {
    if (!user) { setError('Usuário não autenticado.'); return; }
    setLoading(true);
    setError(null);
    try {
      const { error: deleteError } = await supabase
        .from('milestones')
        .delete()
        .eq('id', milestoneId);
      
      if (deleteError) throw deleteError;
      await recalculatePlanProgress(planId);
      await fetchDevelopmentData();
    } catch (err) {
      setError('Erro ao excluir marco.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const deleteHabit = async (planId: string, habitId: string) => {
    if (!user) { setError('Usuário não autenticado.'); return; }
    setLoading(true);
    setError(null);
    try {
      const { error: deleteError } = await supabase
        .from('habits')
        .delete()
        .eq('id', habitId);
      
      if (deleteError) throw deleteError;
      await fetchDevelopmentData();
    } catch (err) {
      setError('Erro ao excluir hábito.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const deleteSkill = async (planId: string, skillId: string) => {
    if (!user) { setError('Usuário não autenticado.'); return; }
    setLoading(true);
    setError(null);
    try {
      const { error: deleteError } = await supabase
        .from('skills')
        .delete()
        .eq('id', skillId);
      
      if (deleteError) throw deleteError;
      await fetchDevelopmentData();
    } catch (err) {
      setError('Erro ao excluir habilidade.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const deletePlan = async (planId: string) => {
    if (!user) { setError('Usuário não autenticado.'); return; }
    if (!window.confirm('Tem certeza que deseja excluir esta jornada de desenvolvimento? Esta ação não pode ser desfeita.')) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { error: deleteError } = await supabase
        .from('development_plans')
        .delete()
        .eq('id', planId);
      
      if (deleteError) throw deleteError;
      
      if (activePlanId === planId) {
        setActivePlanId(null);
      }
      
      await fetchDevelopmentData();
    } catch (err) {
      setError('Erro ao excluir a jornada.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getMilestonesForPlan = useCallback((planId: string) => {
    const plan = plans.find(p => p.id === planId);
    return plan ? plan.milestones : [];
  }, [plans]);

  const getHabitsForPlan = useCallback((planId: string) => {
    const plan = plans.find(p => p.id === planId);
    return plan ? plan.habits : [];
  }, [plans]);

  const getSkillsForPlan = useCallback((planId: string) => {
    const plan = plans.find(p => p.id === planId);
    return plan ? plan.skillTree : undefined;
  }, [plans]);

  return (
    <DevelopmentContext.Provider value={{
      plans,
      activePlanId,
      loading,
      error,
      addPlan,
      setActivePlan,
      toggleMilestone,
      updateHabitStreak,
      updateSkillProgress,
      addCustomMilestone,
      addCustomHabit,
      addCustomSkill,
      editMilestone,
      editHabit,
      editSkill,
      deleteMilestone,
      deleteHabit,
      deleteSkill,
      deletePlan,
      getMilestonesForPlan,
      getHabitsForPlan,
      getSkillsForPlan,
    }}>
      {children}
    </DevelopmentContext.Provider>
  );
};

export const useDevelopment = () => {
  const context = useContext(DevelopmentContext);
  if (!context) {
    throw new Error('useDevelopment must be used within a DevelopmentProvider');
  }
  return context;
};