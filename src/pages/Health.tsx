// src/pages/Health.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  HeartPulse, Brain, AlertTriangle,
  Droplet, Moon, Dumbbell, Salad, Zap, Settings, Smile, User, UtensilsCrossed,
  FileText, CalendarCheck, Pill, Thermometer, TrendingUp, BellRing,
  ChevronRight, Stethoscope, Handshake, Syringe, Bed, Footprints, Scale, Flame,
  PlusCircle, X, Download, Clock, MapPin, Briefcase, Paperclip
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Imports de contextos e componentes específicos do seu projeto (mantidos como relativos)
import { useHealth } from '../contexts/HealthContext';
import { ProfileSetup } from '../components/health/ProfileSetup';
import { HealthMetricCard } from '../components/health/HealthMetricCard';
import { ChatRecommendationCard } from '../components/health/ChatRecommendationCard';
import { QuickActionButtons } from '../components/health/QuickActionButtons';

// --- Imports dos componentes Shadcn UI (agora usando aliases @/) ---
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { DatePicker } from '@/components/ui/DatePicker'; // Assumindo que seu DatePicker está aqui
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';

// --- Import do utilitário cn (também com alias) ---
import { cn } from '@/lib/utils'; // Certifique-se de ter 'clsx' e 'tailwind-merge' instalados

// Tipagem para dados de saúde
interface HealthData {
  id: string;
  category: string;
  metric: string;
  value: string;
  unit?: string;
  date: Date;
  notes?: string;
  status?: 'healthy' | 'warning' | 'critical';
}

export function Health() {
  const { healthData, addHealthData, deleteHealthData, updateHealthData } = useHealth();
  const [isSetupComplete, setIsSetupComplete] = useState<boolean>(true); // Alterado para true para teste, ajuste conforme sua lógica real
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedCategory, setSelectedCategory] = useState<string>('Geral');
  const [metric, setMetric] = useState<string>('');
  const [value, setValue] = useState<string>('');
  const [unit, setUnit] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [currentEditId, setCurrentEditId] = useState<string | null>(null);

  // Exemplo de categorias e ícones
  const categories = [
    { name: 'Geral', icon: <HeartPulse className="h-4 w-4" /> },
    { name: 'Bem-estar', icon: <Smile className="h-4 w-4" /> },
    { name: 'Mente', icon: <Brain className="h-4 w-4" /> },
    { name: 'Dieta', icon: <Salad className="h-4 w-4" /> },
    { name: 'Exercício', icon: <Dumbbell className="h-4 w-4" /> },
    { name: 'Sono', icon: <Moon className="h-4 w-4" /> },
    { name: 'Hidratação', icon: <Droplet className="h-4 w-4" /> },
    { name: 'Medicamentos', icon: <Pill className="h-4 w-4" /> },
    { name: 'Sintomas', icon: <AlertTriangle className="h-4 w-4" /> },
    { name: 'Energia', icon: <Zap className="h-4 w-4" /> },
    { name: 'Outros', icon: <Settings className="h-4 w-4" /> },
  ];

  useEffect(() => {
    // Aqui você pode adicionar lógica para verificar se o setup foi concluído
    // Ex: Carregar dados do localStorage ou de um backend
    const setupStatus = localStorage.getItem('healthSetupComplete');
    if (setupStatus === 'true') {
      setIsSetupComplete(true);
    }
  }, []);

  const handleSaveHealthData = () => {
    if (!selectedDate || !metric || !value) {
      alert('Por favor, preencha a data, métrica e valor.');
      return;
    }

    const newData: HealthData = {
      id: isEditing && currentEditId ? currentEditId : String(Date.now()),
      category: selectedCategory,
      metric,
      value,
      unit,
      date: selectedDate,
      notes,
    };

    if (isEditing) {
      updateHealthData(newData);
    } else {
      addHealthData(newData);
    }

    // Limpar formulário e fechar dialog
    resetForm();
    setIsDialogOpen(false);
  };

  const handleEdit = (data: HealthData) => {
    setIsEditing(true);
    setCurrentEditId(data.id);
    setSelectedDate(data.date);
    setSelectedCategory(data.category);
    setMetric(data.metric);
    setValue(data.value);
    setUnit(data.unit || '');
    setNotes(data.notes || '');
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja deletar este registro de saúde?')) {
      deleteHealthData(id);
    }
  };

  const resetForm = () => {
    setSelectedDate(new Date());
    setSelectedCategory('Geral');
    setMetric('');
    setValue('');
    setUnit('');
    setNotes('');
    setIsEditing(false);
    setCurrentEditId(null);
  };

  // Filtrar dados por data selecionada (opcional, pode ser expandido para filtros de categoria/mês)
  const filteredData = healthData.filter(data =>
    selectedDate ? format(data.date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd') : true
  );

  if (!isSetupComplete) {
    return <ProfileSetup onSetupComplete={() => setIsSetupComplete(true)} />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto px-4 py-8 bg-gray-50 dark:bg-gray-900 min-h-screen"
    >
      <header className="flex flex-col md:flex-row justify-between items-center mb-8">
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-gray-50 mb-4 md:mb-0">
          <HeartPulse className="inline-block mr-3 text-red-600 dark:text-red-400" size={36} />
          Meu Bem-Estar
        </h1>
        <div className="flex items-center space-x-4">
          <DatePicker
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
          />
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm} className="bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-500 dark:hover:bg-blue-600 transition duration-300">
                <PlusCircle className="mr-2 h-4 w-4" /> Novo Registro
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-50">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold">{isEditing ? 'Editar Registro' : 'Novo Registro de Saúde'}</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="category" className="text-right">
                    Categoria
                  </Label>
                  <select
                    id="category"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="col-span-3 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-50"
                  >
                    {categories.map(cat => (
                      <option key={cat.name} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="metric" className="text-right">
                    Métrica
                  </Label>
                  <Input
                    id="metric"
                    value={metric}
                    onChange={(e) => setMetric(e.target.value)}
                    className="col-span-3 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-50"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="value" className="text-right">
                    Valor
                  </Label>
                  <Input
                    id="value"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    className="col-span-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-50"
                  />
                  <Input
                    id="unit"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    placeholder="Unidade (kg, °C, etc.)"
                    className="col-span-1 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-50"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="date" className="text-right">
                    Data
                  </Label>
                  <DatePicker
                    selectedDate={selectedDate}
                    onSelectDate={setSelectedDate}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="notes" className="text-right">
                    Notas
                  </Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="col-span-3 resize-none border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-50"
                    placeholder="Adicione notas relevantes aqui..."
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" onClick={handleSaveHealthData} className="bg-green-600 hover:bg-green-700 text-white dark:bg-green-500 dark:hover:bg-green-600 transition duration-300">
                  {isEditing ? 'Salvar Alterações' : 'Adicionar Registro'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <QuickActionButtons onAddRecord={() => { resetForm(); setIsDialogOpen(true); }} />

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <HealthMetricCard
          title="Frequência Cardíaca"
          value="72 bpm"
          trend="up"
          description="Média de hoje"
          icon={<HeartPulse className="h-6 w-6 text-red-500 dark:text-red-400" />}
        />
        <HealthMetricCard
          title="Qualidade do Sono"
          value="7.5h"
          trend="stable"
          description="Ontem à noite"
          icon={<Moon className="h-6 w-6 text-indigo-500 dark:text-indigo-400" />}
        />
        <HealthMetricCard
          title="Humor"
          value="Ótimo"
          trend="up"
          description="Relato mais recente"
          icon={<Smile className="h-6 w-6 text-yellow-500 dark:text-yellow-400" />}
        />
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-50 mb-4">Recomendações Personalizadas</h2>
        <ChatRecommendationCard />
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-50 mb-4">
          Meus Registros ({selectedDate ? format(selectedDate, 'dd MMMM, yyyy', { locale: ptBR }) : 'Todos os Dias'})
        </h2>
        {filteredData.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-400 text-center py-8">
            Nenhum registro de saúde para esta data. Que tal adicionar um novo?
          </p>
        ) : (
          <div className="space-y-4">
            {filteredData.map((data) => (
              <Card key={data.id} className="p-4 flex items-center justify-between bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex-1">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {format(data.date, 'dd/MM/yyyy')} - {data.category}
                  </p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-gray-50">
                    {data.metric}: {data.value} {data.unit}
                  </p>
                  {data.notes && (
                    <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                      Notas: {data.notes}
                    </p>
                  )}
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(data)}
                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
                  >
                    Editar
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(data.id)}
                    className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200"
                  >
                    Excluir
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>
    </motion.div>
  );
}