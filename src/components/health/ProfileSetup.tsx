// src/components/health/ProfileSetup.tsx
import React, { useState, useEffect } from 'react'; // <--- Adicionado useEffect
import { motion } from 'framer-motion';
import { useHealth } from '../../contexts/HealthContext';
import { Button } from '../ui/Button';
// Componentes de UI (mantidos como placeholders ou seus componentes reais)
import { Label } from '../ui/Label'; // <--- Agora importado corretamente
import { Input } from '../ui/Input'; // <--- Agora importado corretamente
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/Select'; // <--- Agora importado corretamente
import { Card } from '../ui/Card'; // <--- Agora importado corretamente
// ============================================================================
import { HeartPulse } from 'lucide-react';

interface ProfileSetupProps {
  onProfileSaved?: () => void; // Callback para fechar o modal
  isModal?: boolean; // Para ajustar o layout quando for um modal
}

export const ProfileSetup: React.FC<ProfileSetupProps> = ({ onProfileSaved, isModal = false }) => {
  const { userProfile, updateUserProfile } = useHealth();

  const [weightKg, setWeightKg] = useState('');
  const [heightCm, setHeightCm] = useState('');
  const [ageYears, setAgeYears] = useState('');
  const [gender, setGender] = useState('');
  const [activityLevel, setActivityLevel] = useState('');
  const [goal, setGoal] = useState('');
  const [restrictions, setRestrictions] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Efeito para preencher os campos com os dados do perfil existente
  useEffect(() => {
    if (userProfile) {
      setWeightKg(userProfile.weightKg?.toString() || '');
      setHeightCm(userProfile.heightCm?.toString() || '');
      setAgeYears(userProfile.ageYears?.toString() || '');
      setGender(userProfile.gender || '');
      setActivityLevel(userProfile.activityLevel || '');
      setGoal(userProfile.goal || '');
      setRestrictions(userProfile.restrictions.join(', ') || '');
    }
  }, [userProfile]); // Executa quando userProfile muda

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!weightKg || !heightCm || !ageYears || !gender || !activityLevel || !goal) {
      setError('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    const updatedProfile = {
      weightKg: Number(weightKg),
      heightCm: Number(heightCm),
      ageYears: Number(ageYears),
      gender: gender as 'male' | 'female' | 'other',
      activityLevel: activityLevel as 'sedentary' | 'moderate' | 'active',
      goal: goal as 'lose_weight' | 'maintain' | 'gain_muscle' | 'improve_health',
      restrictions: restrictions.split(',').map(s => s.trim()).filter(Boolean),
      hasCompletedOnboarding: true, // Garante que o onboarding está sempre completo após o salvamento
    };

    updateUserProfile(updatedProfile);
    if (onProfileSaved) {
      onProfileSaved(); // Fecha o modal se o callback for fornecido
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`max-w-3xl mx-auto p-8 rounded-3xl space-y-8 ${isModal ? 'bg-transparent shadow-none' : 'bg-black/30 shadow-xl'}`} // Estilos ajustados para modal
    >
      {!isModal && ( // Título e descrição apenas no onboarding inicial
        <div className="text-center space-y-4">
          <HeartPulse className="h-16 w-16 text-blue-400 mx-auto" />
          <h1 className="text-4xl font-bold text-white">Bem-vindo à sua jornada de Saúde!</h1>
          <p className="text-gray-400 text-lg">
            Para personalizar suas metas e recomendações, por favor, preencha algumas informações sobre você.
          </p>
        </div>
      )}

      <Card className={`p-8 bg-gray-800/60 border border-gray-700 rounded-2xl shadow-lg space-y-6 ${isModal ? 'bg-gray-900/90' : ''}`}> {/* Estilos ajustados para modal */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Campos do Formulário (mantidos iguais, mas agora preenchidos por useEffect) */}
            <div>
              <Label htmlFor="weight" className="text-gray-300">Peso (kg)</Label>
              <Input
                id="weight"
                type="number"
                value={weightKg}
                onChange={(e: any) => setWeightKg(e.target.value)}
                placeholder="Ex: 75"
              />
            </div>
            <div>
              <Label htmlFor="height" className="text-gray-300">Altura (cm)</Label>
              <Input
                id="height"
                type="number"
                value={heightCm}
                onChange={(e: any) => setHeightCm(e.target.value)}
                placeholder="Ex: 170"
              />
            </div>
            <div>
              <Label htmlFor="age" className="text-gray-300">Idade</Label>
              <Input
                id="age"
                type="number"
                value={ageYears}
                onChange={(e: any) => setAgeYears(e.target.value)}
                placeholder="Ex: 30"
              />
            </div>
            <div>
              <Label htmlFor="gender" className="text-gray-300">Sexo</Label>
              <Select onValueChange={(value: string) => setGender(value)} value={gender}>
                <SelectTrigger className="w-full bg-gray-700/50 border-gray-600 text-white mt-1">
                  <SelectValue placeholder="Selecione seu sexo" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700 text-white">
                  <SelectItem value="male">Masculino</SelectItem>
                  <SelectItem value="female">Feminino</SelectItem>
                  <SelectItem value="other">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="activityLevel" className="text-gray-300">Nível de Atividade</Label>
              <Select onValueChange={(value: string) => setActivityLevel(value)} value={activityLevel}>
                <SelectTrigger className="w-full bg-gray-700/50 border-gray-600 text-white mt-1">
                  <SelectValue placeholder="Selecione seu nível" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700 text-white">
                  <SelectItem value="sedentary">Sedentário</SelectItem>
                  <SelectItem value="moderate">Moderado</SelectItem>
                  <SelectItem value="active">Ativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="goal" className="text-gray-300">Objetivo</Label>
              <Select onValueChange={(value: string) => setGoal(value)} value={goal}>
                <SelectTrigger className="w-full bg-gray-700/50 border-gray-600 text-white mt-1">
                  <SelectValue placeholder="Selecione seu objetivo" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700 text-white">
                  <SelectItem value="lose_weight">Emagrecer</SelectItem>
                  <SelectItem value="maintain">Manter Peso</SelectItem>
                  <SelectItem value="gain_muscle">Ganhar Massa Muscular</SelectItem>
                  <SelectItem value="improve_health">Melhorar a Saúde Geral</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label htmlFor="restrictions" className="text-gray-300">Restrições/Condições (separadas por vírgula)</Label>
            <Input
              id="restrictions"
              type="text"
              value={restrictions}
              onChange={(e: any) => setRestrictions(e.target.value)}
              placeholder="Ex: diabetes, vegetariano, lactose"
            />
          </div>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors">
            Salvar Perfil {isModal && 'e Fechar'}
          </Button>
        </form>
      </Card>
    </motion.div>
  );
};