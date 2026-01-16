import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, ArrowRight, Calendar, Target, Zap, Layout } from 'lucide-react';
import { Button } from '../ui/Button'; // <--- CORRIGIDO: Apenas um "../"

export const ActivitiesOnboarding: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    // Verifica se o usuário já viu o onboarding
    const hasSeenOnboarding = localStorage.getItem('shalom_activities_onboarding_v1');
    if (!hasSeenOnboarding) {
      setIsOpen(true);
    }
  }, []);

  const handleComplete = () => {
    localStorage.setItem('shalom_activities_onboarding_v1', 'true');
    setIsOpen(false);
  };

  const steps = [
    {
      icon: Layout,
      title: "Bem-vindo ao seu Hub de Atividades",
      description: "Aqui é onde você organiza seu dia e evolui seus objetivos. Vamos fazer um tour rápido pelas principais funcionalidades.",
      color: "text-blue-400",
      bg: "bg-blue-500/10"
    },
    {
      icon: Calendar,
      title: "Gestão de Tempo",
      description: "No topo, você tem acesso ao Calendário e às Tarefas Diárias. Use para organizar o que precisa ser feito hoje e não perder prazos.",
      color: "text-green-400",
      bg: "bg-green-500/10"
    },
    {
      icon: Target,
      title: "Jornada de Desenvolvimento",
      description: "Mais abaixo está o seu RPG pessoal. Crie um 'Plano de Desenvolvimento', defina hábitos e ganhe XP para subir de nível nas suas habilidades.",
      color: "text-purple-400",
      bg: "bg-purple-500/10"
    },
    {
      icon: Zap,
      title: "Modo Foco",
      description: "Precisa de concentração total? Ative o Modo Foco na barra lateral para usar Pomodoro e sons ambientes.",
      color: "text-yellow-400",
      bg: "bg-yellow-500/10"
    }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative"
      >
        {/* Botão de Pular discreto */}
        <button 
          onClick={handleComplete}
          className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Conteúdo Dinâmico */}
        <div className="p-8 pt-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col items-center text-center"
            >
              <div className={`w-20 h-20 rounded-full flex items-center justify-center ${steps[currentStep].bg} mb-6`}>
                {React.createElement(steps[currentStep].icon, { 
                  className: `h-10 w-10 ${steps[currentStep].color}` 
                })}
              </div>
              
              <h2 className="text-2xl font-bold text-white mb-3">
                {steps[currentStep].title}
              </h2>
              <p className="text-gray-400 leading-relaxed mb-4">
                {steps[currentStep].description}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Rodapé com Navegação */}
        <div className="p-6 bg-gray-800/50 border-t border-gray-800 flex items-center justify-between">
          {/* Indicadores de Passo */}
          <div className="flex gap-1.5">
            {steps.map((_, index) => (
              <div 
                key={index}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  index === currentStep ? 'w-6 bg-blue-500' : 'w-1.5 bg-gray-600'
                }`}
              />
            ))}
          </div>

          <Button
            onClick={() => {
              if (currentStep < steps.length - 1) {
                setCurrentStep(curr => curr + 1);
              } else {
                handleComplete();
              }
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6"
          >
            {currentStep < steps.length - 1 ? (
              <>Próximo <ArrowRight className="ml-2 h-4 w-4" /></>
            ) : (
              <>Começar <Check className="ml-2 h-4 w-4" /></>
            )}
          </Button>
        </div>
      </motion.div>
    </div>
  );
};