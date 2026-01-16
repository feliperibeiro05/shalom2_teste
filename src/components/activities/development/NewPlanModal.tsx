import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Target, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '../../ui/Button';
import { useDevelopment } from '../../../contexts/DevelopmentContext';

interface NewPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewPlanModal: React.FC<NewPlanModalProps> = ({ isOpen, onClose }) => {
  const { generateAIPlan, loading } = useDevelopment();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    objective: '',
    currentLevel: '',
    timeAvailable: '1 hora por dia'
  });

  const handleSubmit = async () => {
    if (formData.objective && formData.currentLevel) {
      await generateAIPlan(formData.objective, formData.currentLevel, formData.timeAvailable);
      onClose();
      // Reset form
      setFormData({ objective: '', currentLevel: '', timeAvailable: '1 hora por dia' });
      setStep(1);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-gray-900 rounded-2xl border border-gray-800 w-full max-w-lg overflow-hidden shadow-2xl"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-gray-800/30">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600/20 rounded-lg">
              <Sparkles className="h-5 w-5 text-blue-500" />
            </div>
            <h2 className="text-lg font-semibold text-white">Criar Jornada com IA</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-5"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Qual é o seu objetivo principal?
                  </label>
                  <textarea
                    value={formData.objective}
                    onChange={(e) => setFormData(prev => ({ ...prev, objective: e.target.value }))}
                    placeholder="Ex: Quero aprender React para conseguir meu primeiro emprego como Junior, focando em frontend."
                    className="w-full px-4 py-3 bg-gray-800/50 rounded-xl border border-gray-700 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all resize-none"
                    rows={3}
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    O que você já sabe sobre isso?
                  </label>
                  <input
                    type="text"
                    value={formData.currentLevel}
                    onChange={(e) => setFormData(prev => ({ ...prev, currentLevel: e.target.value }))}
                    placeholder="Ex: Sei HTML e CSS básico, mas nunca toquei em JS."
                    className="w-full px-4 py-3 bg-gray-800/50 rounded-xl border border-gray-700 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  />
                </div>

                <Button 
                  onClick={() => setStep(2)} 
                  disabled={!formData.objective || !formData.currentLevel}
                  className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-base"
                >
                  Próximo <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6 text-center py-4"
              >
                <div className="flex flex-col items-center justify-center gap-4">
                  <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center relative">
                    <Target className="h-8 w-8 text-blue-500" />
                    {loading && (
                        <div className="absolute inset-0 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                    )}
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">
                      {loading ? "A Sophia está criando seu plano..." : "Tudo pronto!"}
                    </h3>
                    <p className="text-gray-400 text-sm max-w-xs mx-auto">
                      {loading 
                        ? "Estamos estruturando sua árvore de habilidades, definindo hábitos diários e criando marcos de evolução." 
                        : "Vamos gerar um plano totalmente personalizado para o seu perfil."}
                    </p>
                  </div>
                </div>

                {!loading && (
                  <div className="flex gap-3">
                    <Button variant="secondary" onClick={() => setStep(1)} className="flex-1 h-12">
                      Voltar
                    </Button>
                    <Button 
                      onClick={handleSubmit}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 h-12"
                    >
                      <Sparkles className="mr-2 h-4 w-4" /> Gerar Plano
                    </Button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};