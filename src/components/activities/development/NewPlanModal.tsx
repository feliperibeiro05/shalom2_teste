import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Brain, Book, Code, Dumbbell, 
  Users, Briefcase, MessageSquare, Wallet, Sparkles, Calendar
} from 'lucide-react';
import { Button } from '../../ui/Button';
import { useDevelopment } from '../../../contexts/DevelopmentContext';
import { format, addDays } from 'date-fns'; // Importar format e addDays

// Interface para o estado do formulário
interface NewPlanFormData {
  title: string;
  category: string;
  targetDate: string; // Adicionado: Data da Meta
}

interface NewPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewPlanModal: React.FC<NewPlanModalProps> = ({ isOpen, onClose }) => {
  const { addPlan, loading } = useDevelopment();
  const [formData, setFormData] = useState<NewPlanFormData>({
    title: '',
    category: '',
    targetDate: format(addDays(new Date(), 180), 'yyyy-MM-dd') // Padrão: 6 meses a partir de hoje
  });
  const [step, setStep] = useState(1);

  const categories = [
    { id: 'programming', icon: Code, label: 'Programação', description: 'Desenvolvimento de software, linguagens de programação e tecnologias' },
    { id: 'languages', icon: Book, label: 'Idiomas', description: 'Aprendizado de novos idiomas e habilidades linguísticas' },
    { id: 'exercises', icon: Dumbbell, label: 'Exercícios', description: 'Condicionamento físico, esportes e atividades físicas' },
    { id: 'emotional', icon: Brain, label: 'Emocional', description: 'Inteligência emocional, mindfulness e bem-estar mental' },
    { id: 'networking', icon: Users, label: 'Networking', description: 'Construção de relacionamentos profissionais e conexões' },
    { id: 'business', icon: Briefcase, label: 'Negócios', description: 'Empreendedorismo, gestão e estratégias de negócios' },
    { id: 'communication', icon: MessageSquare, label: 'Comunicação', description: 'Oratória, escrita e habilidades de apresentação' },
    { id: 'finances', icon: Wallet, label: 'Finanças', description: 'Educação financeira, investimentos e gestão de recursos' }
  ];

  const handleSubmit = async () => {
    if (formData.title && formData.category && formData.targetDate) {
      await addPlan(formData.title, formData.category, formData.targetDate);
      onClose();
      setFormData({
        title: '',
        category: '',
        targetDate: format(addDays(new Date(), 180), 'yyyy-MM-dd')
      });
      setStep(1);
    }
  };

  const handleCategorySelect = (id: string) => {
    setFormData(prev => ({ ...prev, category: id }));
    setStep(2);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-gray-800 rounded-xl p-6 w-full max-w-md relative max-h-[90vh] overflow-hidden flex flex-col"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mb-6 text-center">
          <Sparkles className="h-10 w-10 text-blue-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Crie Sua Jornada</h2>
          <p className="text-gray-400">
            Defina um plano personalizado para acompanhar seu desenvolvimento
          </p>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6 flex-1 overflow-y-auto pr-2"
            >
              <h3 className="text-lg font-medium text-white mb-4">Escolha uma área de desenvolvimento:</h3>
              <div className="grid grid-cols-2 gap-4">
                {categories.map(({ id, icon: Icon, label, description }) => (
                  <button
                    key={id}
                    onClick={() => handleCategorySelect(id)}
                    className={`
                      p-4 rounded-lg border flex flex-col items-center gap-2 text-left
                      ${formData.category === id
                        ? 'bg-blue-500/20 border-blue-500'
                        : 'border-gray-700 hover:border-gray-600'}
                      transition-colors
                    `}
                  >
                    <Icon className="h-8 w-8 text-blue-500 mb-1" />
                    <span className="text-sm font-medium text-white">
                      {label}
                    </span>
                    <p className="text-xs text-gray-400">{description}</p>
                  </button>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Dê um nome para seu plano de desenvolvimento
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Ex: Aprender React do Zero"
                  className="w-full px-4 py-3 bg-gray-700 rounded-lg border border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  required
                />
                <p className="text-sm text-gray-400 mt-2">
                  Escolha um nome que represente seu objetivo principal nesta jornada
                </p>
              </div>

              {/* Campo para Data da Meta */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Data da Meta
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="date"
                    value={formData.targetDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, targetDate: e.target.value }))}
                    className="w-full pl-10 pr-4 py-3 bg-gray-700 rounded-lg border border-gray-600 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    min={format(new Date(), 'yyyy-MM-dd')}
                    required
                  />
                </div>
                <p className="text-sm text-gray-400 mt-2">
                  Data limite para alcançar seu plano.
                </p>
              </div>

              <div className="flex justify-between gap-4">
                <Button
                  variant="secondary"
                  onClick={() => setStep(1)}
                >
                  Voltar
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={!formData.title || !formData.category || !formData.targetDate || loading}
                  className="bg-gradient-to-r from-blue-600 to-purple-600"
                >
                  {loading ? 'Criando...' : 'Criar Plano'}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};