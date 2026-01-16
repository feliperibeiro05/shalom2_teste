// src/contexts/HealthContext.tsx
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid'; 

// --- Interfaces de Dados ---

export interface UserProfile {
  weightKg: number | null;
  heightCm: number | null;
  ageYears: number | null;
  gender: 'male' | 'female' | 'other' | null;
  activityLevel: 'sedentary' | 'moderate' | 'active' | null;
  goal: 'lose_weight' | 'maintain' | 'gain_muscle' | 'improve_health' | null;
  restrictions: string[]; 
  hasCompletedOnboarding: boolean; 
}

export interface HealthMetric {
  id: string; // Ex: 'water', 'sleep', 'exercise', 'calories', 'protein'
  name: string;
  value: number; 
  goal: number;   
  unit: string;   
  lastUpdated: string; 
  weight: number; 
}

export interface Recommendation {
  id: string;
  message: string;
  type: 'alert' | 'tip' | 'goal_achieved' | 'evolution'; 
  icon: string; 
  priority: number; 
}

// --- Context Type ---
interface HealthContextType {
  userProfile: UserProfile | null;
  metrics: HealthMetric[];
  recommendations: Recommendation[];
  healthScore: number;
  loading: boolean;
  error: string | null;
  
  updateUserProfile: (profile: Partial<UserProfile>) => void;
  updateMetricValue: (metricId: string, newValue: number) => void;
  getHealthScore: () => number;
  getDynamicGoals: () => Record<string, number>; 
  fetchHealthData: () => Promise<void>; 
}

const HealthContext = createContext<HealthContextType | undefined>(undefined);

// --- Funções Auxiliares de Cálculo (Regras 2 e 3) ---

const calculateDynamicGoals = (profile: UserProfile): Record<string, number> => {
  const goals: Record<string, number> = {};

  if (!profile.weightKg || !profile.activityLevel || !profile.goal || !profile.heightCm || !profile.ageYears || !profile.gender) {
    return { water: 0, sleep: 7, exercise: 0, calories: 0, protein: 0 };
  }

  goals.water = Math.round((profile.weightKg * 35) / 1000 * 2) / 2;
  goals.sleep = profile.ageYears < 18 ? 8 : (profile.ageYears > 65 ? 6.5 : 7);

  let exerciseGoal = 0;
  switch (profile.activityLevel) {
    case 'sedentary': exerciseGoal = 20; break; 
    case 'moderate': exerciseGoal = 30; break;
    case 'active': exerciseGoal = 45; break;
  }
  if (profile.goal === 'gain_muscle' && exerciseGoal < 45) exerciseGoal = 45;
  goals.exercise = exerciseGoal;

  let tmb = 0;
  if (profile.gender === 'male') {
    tmb = (10 * profile.weightKg) + (6.25 * profile.heightCm) - (5 * profile.ageYears) + 5;
  } else if (profile.gender === 'female') {
    tmb = (10 * profile.weightKg) + (6.25 * profile.heightCm) - (5 * profile.ageYears) - 161;
  } else {
     tmb = profile.weightKg * 22; 
  }
  
  let activityFactor = 1.2; 
  if (profile.activityLevel === 'moderate') activityFactor = 1.55;
  if (profile.activityLevel === 'active') activityFactor = 1.725;
  
  goals.calories = Math.round(tmb * activityFactor);

  let proteinMultiplier = 1.2;
  if (profile.goal === 'lose_weight') {
    goals.calories = Math.max(1200, goals.calories - 500); 
    proteinMultiplier = 1.8; 
  } else if (profile.goal === 'gain_muscle') {
    goals.calories += 300; 
    proteinMultiplier = 2.2;
  } 
  goals.protein = Math.round(profile.weightKg * proteinMultiplier);
  
  return goals;
};

const calculateDynamicWeights = (profile: UserProfile): Record<string, number> => {
  const baseWeights: Record<string, number> = { 
    mood: 0.1, 
    energy: 0.1, 
    sleep: 0.25, 
    water: 0.1, 
    exercise: 0.2, 
    calories: 0.15, 
    protein: 0.1, 
  };

  const dynamicWeights = { ...baseWeights };

  if (profile.weightKg && profile.heightCm) {
    const bmi = profile.weightKg / ((profile.heightCm / 100) * (profile.heightCm / 100));
    if (bmi > 30 || profile.goal === 'lose_weight') { 
      dynamicWeights.exercise = 0.35;
      dynamicWeights.calories = 0.25; 
      dynamicWeights.protein = 0.1;
      dynamicWeights.sleep = 0.1; 
    }
  }
  
  if (profile.restrictions.includes('insonia')) { 
    dynamicWeights.sleep = 0.40;
    dynamicWeights.mood = 0.05; 
  }

  if (profile.activityLevel === 'active' && (profile.goal === 'gain_muscle' || profile.goal === 'maintain')) {
    dynamicWeights.water = 0.20; 
    dynamicWeights.exercise = 0.25; 
    dynamicWeights.protein = 0.15;
  }

  const sum = Object.values(dynamicWeights).reduce((a, b) => a + b, 0);
  for (const key in dynamicWeights) {
      dynamicWeights[key] = dynamicWeights[key] / sum; 
  }
  
  return dynamicWeights;
};

const generateRecommendations = (userProfile: UserProfile, metrics: HealthMetric[], healthScore: number): Recommendation[] => {
    if (!userProfile.hasCompletedOnboarding || metrics.length === 0) return [];
    
    const newRecommendations: Recommendation[] = [];
    const dynamicGoals = calculateDynamicGoals(userProfile);
    
    const scoredMetrics = metrics.filter(m => dynamicGoals[m.id] > 0);

    scoredMetrics.forEach(metric => {
        const goal = dynamicGoals[metric.id];

        // Alerta de Baixo Progresso
        if (metric.value < goal * 0.5) {
            newRecommendations.push({
                id: `alert-${metric.id}`,
                message: `ALERTA! Seu progresso em ${metric.name} está em apenas ${Math.round((metric.value / goal) * 100)}%. Meta: ${goal}${metric.unit}.`,
                type: 'alert',
                icon: metric.id === 'water' ? 'Droplet' : metric.id === 'sleep' ? 'Moon' : 'AlertTriangle',
                priority: 1,
            });
        }
        
        // Dica de Quase Lá
        else if (metric.value < goal * 0.95 && metric.value >= goal * 0.5) {
            newRecommendations.push({
                id: `tip-${metric.id}`,
                message: `Você está quase lá em ${metric.name}! Faltam apenas ${Math.round(goal - metric.value)}${metric.unit} para a meta.`,
                type: 'tip',
                icon: metric.id === 'water' ? 'Droplet' : 'Target',
                priority: 2,
            });
        }
        
        // Conquista
        else if (metric.value >= goal) {
            newRecommendations.push({
                id: `goal-${metric.id}`,
                message: `Parabéns! Você atingiu sua meta de ${metric.name} de ${goal}${metric.unit}. Continue o ótimo trabalho!`,
                type: 'goal_achieved',
                icon: 'CheckCircle',
                priority: 3,
            });
        }

        // Regra de Nutrição Específica (Regra 4 - Exemplo)
        if (metric.id === 'protein' && userProfile.goal === 'gain_muscle' && metric.value < goal) {
            newRecommendations.push({
                id: 'tip-protein-gain',
                message: `Com base no seu objetivo de ganho de massa, foque em ${goal}g de proteína. Reforce sua próxima refeição.`,
                type: 'tip',
                icon: 'Salad',
                priority: 2,
            });
        }
        
        // Regra de Sono Específica (Regra 4 - Exemplo)
        if (metric.id === 'sleep' && metric.value < goal) {
            newRecommendations.push({
                id: 'alert-sleep-time',
                message: `Você dormiu ${metric.value}h. Priorize deitar 30min mais cedo hoje para atingir a meta.`,
                type: 'alert',
                icon: 'Moon',
                priority: 1,
            });
        }
    });
    
    // Regra de Score Global 
    if (healthScore < 50) {
        newRecommendations.push({
            id: 'alert-global-score',
            message: `Seu Score de Saúde (${healthScore}%) precisa de atenção. Revise suas métricas de prioridade alta.`,
            type: 'alert',
            icon: 'AlertOctagon',
            priority: 1,
        });
    }

    const uniqueRecommendations = Array.from(new Map(newRecommendations.map(item => [item.message, item])).values());
    return uniqueRecommendations.sort((a, b) => a.priority - b.priority);
};


// --- HealthProvider Component ---
export const HealthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(() => {
    const storedProfile = localStorage.getItem('healthUserProfile');
    return storedProfile ? JSON.parse(storedProfile) : null;
  });

  const [metrics, setMetrics] = useState<HealthMetric[]>(() => {
    const storedMetrics = localStorage.getItem('healthMetrics');
    if (storedMetrics) return JSON.parse(storedMetrics);
    return [
      { id: 'mood', name: 'Humor', value: 7, goal: 8, unit: '/10', lastUpdated: new Date().toISOString(), weight: 0.1 },
      { id: 'energy', name: 'Energia', value: 6, goal: 7, unit: '/10', lastUpdated: new Date().toISOString(), weight: 0.1 },
      { id: 'sleep', name: 'Sono', value: 7, goal: 7, unit: 'horas', lastUpdated: new Date().toISOString(), weight: 0.25 },
      { id: 'water', name: 'Água', value: 1.5, goal: 2.5, unit: 'L', lastUpdated: new Date().toISOString(), weight: 0.1 },
      { id: 'exercise', name: 'Exercício', value: 0, goal: 30, unit: 'min', lastUpdated: new Date().toISOString(), weight: 0.2 },
      { id: 'calories', name: 'Calorias', value: 0, goal: 2000, unit: 'kcal', lastUpdated: new Date().toISOString(), weight: 0.15 },
      { id: 'protein', name: 'Proteína', value: 0, goal: 100, unit: 'g', lastUpdated: new Date().toISOString(), weight: 0.1 },
    ];
  });

  const [healthScore, setHealthScore] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- Funções de Atualização de Estado ---

  const updateUserProfile = useCallback((profileUpdates: Partial<UserProfile>) => {
    setUserProfile(prevProfile => {
      const updated = { ...prevProfile, ...profileUpdates } as UserProfile;
      localStorage.setItem('healthUserProfile', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const updateMetricValue = useCallback((metricId: string, newValue: number) => {
    setMetrics(prevMetrics => {
      const updatedMetrics = prevMetrics.map(metric =>
        metric.id === metricId ? { ...metric, value: newValue, lastUpdated: new Date().toISOString() } : metric
      );
      localStorage.setItem('healthMetrics', JSON.stringify(updatedMetrics));
      return updatedMetrics;
    });
  }, []);

  const getDynamicGoals = useCallback(() => {
    if (!userProfile || !userProfile.hasCompletedOnboarding) return calculateDynamicGoals({} as UserProfile);
    return calculateDynamicGoals(userProfile);
  }, [userProfile]);


  // Lógica de Cálculo e Re-cálculo
  const getHealthScore = useCallback(() => {
    if (!userProfile || !userProfile.hasCompletedOnboarding || metrics.length === 0) return 0;

    const dynamicWeights = calculateDynamicWeights(userProfile);
    let totalWeightedScore = 0;
    let totalWeightSum = 0;
    const goals = getDynamicGoals(); // Obter as metas mais recentes

    metrics.forEach(metric => {
      const weight = dynamicWeights[metric.id] || metric.weight;
      if (weight === 0) return;

      let metricScore = 0; 
      const goal = goals[metric.id];

      if (goal > 0) {
        if (metric.id === 'calories' && userProfile.goal === 'lose_weight') {
          metricScore = Math.max(0, 100 - ((metric.value - goal) / goal) * 100);
          metricScore = Math.min(100, metricScore);
        } else if (metric.id === 'calories' && userProfile.goal === 'gain_muscle') {
          metricScore = Math.min(100, Math.max(0, (metric.value / goal) * 100));
        } else {
          // Métricas: mais perto da meta é melhor (Sono, Água, Exercício, Proteína)
          metricScore = Math.min(metric.value / goal, 1) * 100;
        }
      } else { 
        metricScore = (metric.value / 10) * 100; // Métrica simples 1-10
      }
      
      totalWeightedScore += metricScore * weight;
      totalWeightSum += weight;
    });

    return totalWeightSum > 0 ? Math.round(totalWeightedScore / totalWeightSum) : 0;
  }, [metrics, userProfile, getDynamicGoals]);

  // Efeito: Recalcula tudo quando métricas ou perfil mudam
  useEffect(() => {
    setHealthScore(getHealthScore());

    if (userProfile && userProfile.hasCompletedOnboarding) {
        const newGoals = getDynamicGoals();
        setMetrics(prevMetrics => {
            const updated = prevMetrics.map(metric => {
                if (newGoals.hasOwnProperty(metric.id)) { 
                    return { ...metric, goal: newGoals[metric.id as keyof typeof newGoals] };
                }
                return metric;
            });
            localStorage.setItem('healthMetrics', JSON.stringify(updated));
            return updated;
        });
    }

  }, [metrics, userProfile, getHealthScore, getDynamicGoals]);

  // Efeito: Geração de Recomendações
  const recommendationsState = React.useMemo(() => generateRecommendations(userProfile || {} as UserProfile, metrics, healthScore), [userProfile, metrics, healthScore]);


  return (
    <HealthContext.Provider value={{
      userProfile,
      metrics,
      recommendations: recommendationsState,
      healthScore,
      loading,
      error,
      updateUserProfile,
      updateMetricValue,
      getHealthScore,
      getDynamicGoals,
      fetchHealthData: async () => {}, // Simplificado
    }}>
      {children}
    </HealthContext.Provider>
  );
};

export const useHealth = () => {
  const context = useContext(HealthContext);
  if (context === undefined) {
    throw new Error('useHealth must be used within a HealthProvider');
  }
  return context;
};