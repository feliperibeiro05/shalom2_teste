// src/components/ui/DatePicker.tsx

import * as React from "react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale" // Importa o locale pt-BR
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "../../lib/utils" // Certifique-se que o caminho para utils.ts está correto
import { Button } from "./button" // Caminho para o seu componente Button do shadcn/ui
import { Calendar } from "./calendar" // Caminho para o seu componente Calendar do shadcn/ui
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./popover" // Caminho para o seu componente Popover do shadcn/ui

interface DatePickerProps {
  selected: Date | undefined;
  onChange: (date: Date | undefined) => void;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
}

export function DatePicker({ 
  selected, 
  onChange, 
  className, 
  placeholder = "Selecione uma data",
  disabled = false,
}: DatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal bg-gray-800 border-gray-600 text-white hover:bg-gray-700",
            !selected && "text-gray-400",
            className
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {selected ? format(selected, "PPP", { locale: ptBR }) : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 bg-gray-900 border-gray-700 text-white" align="start">
        <Calendar
          mode="single"
          selected={selected}
          onSelect={onChange}
          initialFocus
          locale={ptBR} // Define o locale para o calendário
          disabled={disabled}
        />
      </PopoverContent>
    </Popover>
  )
}