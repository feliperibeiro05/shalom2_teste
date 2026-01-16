import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { v4 as uuidv4 } from 'uuid';
import { format, addDays, startOfDay, parseISO } from 'date-fns';

export interface Activity {
  id: string;
  user_id: string;
  title: string;
  description?: string | null;
  date: string;
  time?: string | null;
  type: 'goal' | 'daily' | 'routine' | 'priority';
  status: 'pending' | 'completed' | 'late';
  priority: 'high' | 'medium' | 'low';
  category: string;
  frequency?: 'daily' | 'weekly' | 'monthly' | null;
  endDate?: string | null;
  order?: number | null;
  weekDays?: string[] | null;
  isRoutine?: boolean | null;
  notes?: string | null;
  tags?: string[] | null;
  estimatedDuration?: number | null;
  actualDuration?: number | null;
  completedAt?: string | null;
  createdAt?: string | null;
  routineId?: string | null;
}

interface ActivitiesContextType {
  activities: Activity[];
  loading: boolean;
  error: string | null;
  addActivity: (activity: Omit<Activity, 'id' | 'user_id' | 'status' | 'createdAt' | 'isRoutine' | 'routineId'> & { type: Activity['type'] }) => Promise<void>;
  toggleActivityStatus: (id: string) => Promise<void>;
  deleteActivity: (id: string) => Promise<void>;
  updateActivity: (id: string, activity: Partial<Activity>) => Promise<void>;
  getDailyActivities: () => Activity[];
  getGoals: () => Activity[];
  getPriorityActivities: () => Activity[];
  getActivitiesByDate: (date: string) => Activity[];
  getCompletionRate: () => { completed: number; total: number };
  getProductivityData: () => any[];
  exportData: () => Promise<string>;
  importData: (data: string) => Promise<void>;
  clearAllData: () => Promise<void>;
  deleteRoutine: (routineId: string) => Promise<void>;
}

const ActivitiesContext = createContext<ActivitiesContextType | undefined>(undefined);

export const ActivitiesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const mapActivityToSupabase = (activity: Partial<Activity>): Record<string, any> => {
    const supabaseActivity: Record<string, any> = { ...activity };
    
    if (activity.description === '') supabaseActivity.description = null;
    if (activity.time === '') supabaseActivity.time = null;
    if (activity.frequency !== undefined && activity.frequency === '') supabaseActivity.frequency = null;
    if (activity.notes === '') supabaseActivity.notes = null;
    if (activity.tags === undefined || activity.tags === null || (Array.isArray(activity.tags) && activity.tags.length === 0)) supabaseActivity.tags = null;


    if (activity.endDate !== undefined) {
      supabaseActivity.end_date = activity.endDate === '' ? null : activity.endDate;
      delete supabaseActivity.endDate;
    }
    if (activity.completedAt !== undefined) {
      supabaseActivity.completed_at = activity.completedAt === '' ? null : activity.completedAt;
      delete supabaseActivity.completedAt;
    }

    if (activity.weekDays !== undefined) {
      supabaseActivity.week_days = activity.weekDays;
      delete supabaseActivity.weekDays;
    }
    if (activity.isRoutine !== undefined) {
      supabaseActivity.is_routine = activity.isRoutine;
      delete supabaseActivity.isRoutine;
    }
    if (activity.estimatedDuration !== undefined) {
      supabaseActivity.estimated_duration = activity.estimatedDuration;
      delete supabaseActivity.estimatedDuration;
    }
    if (activity.actualDuration !== undefined) {
      supabaseActivity.actual_duration = activity.actualDuration;
      delete supabaseActivity.actualDuration;
    }
    if (activity.createdAt !== undefined) {
      supabaseActivity.created_at = activity.createdAt;
      delete supabaseActivity.createdAt;
    }

    if (activity.routineId !== undefined) {
      supabaseActivity.routine_id = activity.routineId;
      delete supabaseActivity.routineId;
    }
    
    if (supabaseActivity.id === null) delete supabaseActivity.id; 

    return supabaseActivity;
  };

  const mapActivityFromSupabase = (supabaseActivity: Record<string, any>): Activity => {
    const activity: Activity = {
      id: supabaseActivity.id,
      user_id: supabaseActivity.user_id,
      title: supabaseActivity.title,
      description: supabaseActivity.description || null,
      date: supabaseActivity.date,
      time: supabaseActivity.time || null,
      type: supabaseActivity.type as Activity['type'],
      status: supabaseActivity.status as Activity['status'],
      priority: supabaseActivity.priority as Activity['priority'],
      category: supabaseActivity.category,
      frequency: supabaseActivity.frequency || null,
      notes: supabaseActivity.notes || null,
      tags: supabaseActivity.tags || null,
      order: supabaseActivity.order || null,
    };

    if (supabaseActivity.end_date !== undefined && supabaseActivity.end_date !== null) {
      activity.endDate = supabaseActivity.end_date;
    } else { activity.endDate = null; }
    
    if (supabaseActivity.week_days !== undefined && supabaseActivity.week_days !== null) {
      activity.weekDays = supabaseActivity.week_days;
    } else { activity.weekDays = null; }
    
    if (supabaseActivity.is_routine !== undefined && supabaseActivity.is_routine !== null) {
      activity.isRoutine = supabaseActivity.is_routine;
    } else { activity.isRoutine = null; }
    
    if (supabaseActivity.estimated_duration !== undefined && supabaseActivity.estimated_duration !== null) {
      activity.estimatedDuration = supabaseActivity.estimated_duration;
    } else { activity.estimatedDuration = null; }
    
    if (supabaseActivity.actual_duration !== undefined && supabaseActivity.actual_duration !== null) {
      activity.actualDuration = supabaseActivity.actual_duration;
    } else { activity.actualDuration = null; }
    
    if (supabaseActivity.completed_at !== undefined && supabaseActivity.completed_at !== null) {
      activity.completedAt = supabaseActivity.completed_at;
    } else { activity.completedAt = null; }
    
    if (supabaseActivity.created_at !== undefined && supabaseActivity.created_at !== null) {
      activity.createdAt = supabaseActivity.created_at;
    } else { activity.createdAt = null; }
    
    if (supabaseActivity.routine_id !== undefined && supabaseActivity.routine_id !== null) {
      activity.routineId = supabaseActivity.routine_id;
    } else { activity.routineId = null; }

    return activity;
  };

  const fetchActivities = useCallback(async () => {
    if (!user) {
      setActivities([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setActivities(data.map(mapActivityFromSupabase) as Activity[]);
    }
     catch (err) {
      console.error('Error fetching activities:', err);
      setError('Erro ao carregar atividades.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  const addActivity = useCallback(async (activityData: Omit<Activity, 'id' | 'user_id' | 'status' | 'createdAt' | 'isRoutine' | 'routineId'> & { type: Activity['type'] }) => {
    if (!user) {
      setError('Usuário não autenticado.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const activitiesToInsert = [];

      let newRoutineId: string | null = null;
      let isRoutineFlag: boolean = activityData.type === 'routine';

      let routineEndDate: Date | null = null;
      if (activityData.endDate) {
          routineEndDate = startOfDay(parseISO(activityData.endDate));
      } else if (isRoutineFlag) {
          const startDate = startOfDay(parseISO(activityData.date));
          routineEndDate = addDays(startDate, 90);
      }
      if (routineEndDate) routineEndDate.setHours(23, 59, 59, 999);

      const initialDate = startOfDay(parseISO(activityData.date));

      if (isRoutineFlag && activityData.weekDays && activityData.weekDays.length > 0) {
        newRoutineId = uuidv4();
        
        let d = initialDate;
        
        while (d <= routineEndDate!) {
          const dayOfWeek = d.getDay();
          const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

          if (activityData.weekDays?.includes(dayNames[dayOfWeek])) {
            activitiesToInsert.push(mapActivityToSupabase({
              ...activityData,
              user_id: user.id,
              status: 'pending',
              isRoutine: true,
              routineId: newRoutineId,
              date: format(d, 'yyyy-MM-dd'),
              order: activities.length,
              endDate: activityData.endDate || null
            }));
          }
          d = addDays(d, 1);
        }
      } else {
        activitiesToInsert.push(mapActivityToSupabase({
          ...activityData,
          user_id: user.id,
          status: 'pending',
          isRoutine: false,
          routineId: null,
          order: activities.length,
          endDate: activityData.endDate || null
        }));
      }

      const { error: insertError } = await supabase
        .from('activities')
        .insert(activitiesToInsert as Record<string, any>[]);

      if (insertError) throw insertError;

      fetchActivities();
    } catch (err) {
      console.error('Error adding activity:', err);
      setError('Erro ao adicionar atividade.');
    } finally {
      setLoading(false);
    }
  }, [user, activities.length, fetchActivities]);

  const toggleActivityStatus = useCallback(async (id: string) => {
    if (!user) {
      setError('Usuário não autenticado.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const activityToUpdate = activities.find(activity => activity.id === id);
      if (!activityToUpdate) throw new Error('Atividade não encontrada.');

      const newStatus = activityToUpdate.status === 'completed' ? 'pending' : 'completed';
      const completedAt = newStatus === 'completed' ? new Date().toISOString() : null;

      const { error: updateError } = await supabase
        .from('activities')
        .update(mapActivityToSupabase({ status: newStatus, completedAt: completedAt || undefined }))
        .eq('id', id)
        .eq('user_id', user.id);

      if (updateError) throw updateError;
      fetchActivities();
    } catch (err) {
      console.error('Error toggling activity status:', err);
      setError('Erro ao atualizar status da atividade.');
    } finally {
      setLoading(false);
    }
  }, [activities, user, fetchActivities]);

  const deleteActivity = useCallback(async (id: string) => {
    if (!user) {
      setError('Usuário não autenticado.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { error: deleteError } = await supabase
        .from('activities')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (deleteError) throw deleteError;
      fetchActivities();
    } catch (err) {
      console.error('Error deleting activity:', err);
      setError('Erro ao excluir atividade.');
    } finally {
      setLoading(false);
    }
  }, [user, fetchActivities]);

  const deleteRoutine = useCallback(async (routineId: string) => {
    if (!user) {
      setError('Usuário não autenticado.');
      return;
    }
    if (!window.confirm('Tem certeza que deseja excluir TODAS as instâncias desta rotina? Esta ação não pode ser desfeita.')) {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const { error: deleteError } = await supabase
        .from('activities')
        .delete()
        .eq('routine_id', routineId)
        .eq('user_id', user.id);

      if (deleteError) throw deleteError;
      fetchActivities();
    } catch (err) {
      console.error('Error deleting routine:', err);
      setError('Erro ao excluir a rotina.');
    } finally {
      setLoading(false);
    }
  }, [user, fetchActivities]);

  const updateActivity = useCallback(async (id: string, updates: Partial<Activity>) => {
    if (!user) {
      setError('Usuário não autenticado.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { error: updateError } = await supabase
        .from('activities')
        .update(mapActivityToSupabase(updates))
        .eq('id', id)
        .eq('user_id', user.id);

      if (updateError) throw updateError;
      fetchActivities();
    } catch (err) {
      console.error('Error updating activity:', err);
      setError('Erro ao atualizar atividade.');
    } finally {
      setLoading(false);
    }
  }, [user, fetchActivities]);

  const getDailyActivities = useCallback(() => {
    const today = startOfDay(new Date());
    const todayStr = format(today, 'yyyy-MM-dd');
    const dayOfWeek = today.getDay();
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

    return activities
      .filter(activity => {
        const activityDate = startOfDay(parseISO(activity.date));
        return (
          (activity.type === 'daily' && format(activityDate, 'yyyy-MM-dd') === todayStr) ||
          (activity.type === 'routine' && activity.isRoutine && format(activityDate, 'yyyy-MM-dd') === todayStr && activity.weekDays?.includes(dayNames[dayOfWeek]))
        );
      })
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [activities]);

  const getGoals = useCallback(() => {
    return activities
      .filter(activity => activity.type === 'goal')
      .sort((a, b) => {
        if (a.priority === 'high') return -1;
        if (b.priority === 'high') return 1;
        if (a.priority === 'medium' && b.priority === 'low') return -1;
        if (a.priority === 'low' && b.priority === 'medium') return 1;
        return 0;
      });
  }, [activities]);

  const getPriorityActivities = useCallback(() => {
    const today = startOfDay(new Date());
    const startOfWeek = startOfDay(addDays(today, -today.getDay()));
    const endOfWeek = startOfDay(addDays(startOfWeek, 6));
    endOfWeek.setHours(23,59,59,999);

    return activities
      .filter(activity => {
        const activityDate = startOfDay(parseISO(activity.date));
        return activity.type === 'priority' &&
               activityDate >= startOfWeek &&
               activityDate <= endOfWeek;
      })
      .sort((a, b) => {
        if (a.priority === 'high') return -1;
        if (b.priority === 'high') return 1;
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      });
  }, [activities]);

  const getActivitiesByDate = useCallback((date: string) => {
    const selectedDate = startOfDay(parseISO(date));
    const dayOfWeek = selectedDate.getDay();
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

    return activities.filter(activity => {
      const activityDate = startOfDay(parseISO(activity.date));
      
      return (
        (activity.type === 'daily' && format(activityDate, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')) ||
        (activity.type === 'priority' && format(activityDate, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')) ||
        (activity.type === 'goal' && format(activityDate, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')) ||
        (activity.type === 'routine' && activity.isRoutine && format(activityDate, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd') && activity.weekDays?.includes(dayNames[dayOfWeek]))
      );
    });
  }, [activities]);

  const getCompletionRate = useCallback(() => {
    const dailyActivities = getDailyActivities();
    const completed = dailyActivities.filter(activity => activity.status === 'completed').length;
    return {
      completed,
      total: dailyActivities.length
    };
  }, [getDailyActivities]);

  const getProductivityData = useCallback(() => {
    const today = new Date();
    const data = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = format(startOfDay(date), 'yyyy-MM-dd');

      const dayActivities = activities.filter(a => a.date === dateStr);
      const completed = dayActivities.filter(a => a.status === 'completed').length;
      const pending = dayActivities.filter(a => a.status === 'pending').length;
      const late = dayActivities.filter(a => a.status === 'late').length;

      data.push({
        day: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][date.getDay()],
        concluídas: completed,
        pendentes: pending,
        atrasadas: late
      });
    }

    return data;
  }, [activities]);

  const exportData = useCallback(async () => {
    if (!user) {
        setError('Usuário não autenticado.');
        return '';
    }
    setLoading(true);
    setError(null);
    try {
        const { data, error: fetchError } = await supabase
            .from('activities')
            .select('*')
            .eq('user_id', user.id);

        if (fetchError) throw fetchError;

        const exportContent = {
            activities: data,
            exportDate: new Date().toISOString()
        };
        return JSON.stringify(exportContent, null, 2);
    } catch (err) {
        console.error('Error exporting data:', err);
        setError('Erro ao exportar dados.');
        return '';
    } finally {
        setLoading(false);
    }
  }, [user]);

  const importData = useCallback(async (data: string) => {
    if (!user) {
        setError('Usuário não autenticado.');
        return;
    }
    setLoading(true);
    setError(null);
    try {
        const parsed = JSON.parse(data);
        if (!parsed.activities || !Array.isArray(parsed.activities)) {
            throw new Error('Formato de importação inválido: missing activities array.');
        }

        const activitiesToImport = parsed.activities.map((act: Partial<Activity>) => {
            const mappedActivity = mapActivityToSupabase({
                ...act,
                user_id: user.id,
                id: undefined,
                createdAt: act.createdAt || new Date().toISOString()
            });
            delete mappedActivity.id;
            return mappedActivity;
        });

        const { error: insertError } = await supabase
            .from('activities')
            .insert(activitiesToImport);

        if (insertError) throw insertError;
        fetchActivities();
    } catch (err) {
        console.error('Error importing data:', err);
        setError('Erro ao importar dados.');
    } finally {
        setLoading(false);
    }
  }, [user, fetchActivities]);

  const clearAllData = useCallback(async () => {
    if (!user) {
        setError('Usuário não autenticado.');
        return;
    }
    

    setLoading(true);
    

    setLoading(true);
    setError(null);
    try {
        const { error: deleteError } = await supabase
            .from('activities')
            .delete()
            .eq('user_id', user.id);

        if (deleteError) throw deleteError;
        setActivities([]);
    } catch (err) {
        console.error('Error clearing all data:', err);
        setError('Erro ao limpar todas as atividades.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  return (
    <ActivitiesContext.Provider value={{
      activities,
      loading,
      error,
      addActivity,
      toggleActivityStatus,
      deleteActivity,
      updateActivity,
      getDailyActivities,
      getGoals,
      getPriorityActivities,
      getActivitiesByDate,
      getCompletionRate,
      getProductivityData,
      exportData,
      importData,
      clearAllData,
      deleteRoutine
    }}>
      {children}
    </ActivitiesContext.Provider>
  );
};

export const useActivities = () => {
  const context = useContext(ActivitiesContext);
  if (!context) {
    throw new Error('useActivities must be used within an ActivitiesProvider');
  }
  return context;
};