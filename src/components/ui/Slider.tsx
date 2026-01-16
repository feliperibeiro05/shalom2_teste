// src/components/ui/Slider.tsx
import React, { FC, HTMLAttributes, ReactNode, Ref, forwardRef } from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { cn } from "../../lib/utils"; // Supondo que você tenha uma utilidade para concatenar classes

// A interface do Slider foi ajustada para ser um tipo mais genérico e compatível
interface SliderProps extends SliderPrimitive.SliderProps {
  className?: string;
  children?: ReactNode;
  trackClassName?: string;
  rangeClassName?: string;
  thumbClassName?: string;
  min?: number;
  max?: number;
  step?: number;
}

const Slider = forwardRef<Ref<HTMLSpanElement>, SliderProps>(
  ({ className, trackClassName, rangeClassName, thumbClassName, children, ...props }, ref) => (
    <SliderPrimitive.Root
      ref={ref as Ref<HTMLSpanElement>}
      className={cn(
        "relative flex w-full touch-none select-none items-center",
        className
      )}
      {...props}
    >
      <SliderPrimitive.Track
        className={cn(
          "relative h-2 w-full grow overflow-hidden rounded-full bg-gray-700",
          trackClassName
        )}
      >
        <SliderPrimitive.Range
          className={cn("absolute h-full bg-blue-500", rangeClassName)}
        />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb
        className={cn(
          "block h-5 w-5 rounded-full border-2 border-blue-500 bg-white ring-offset-gray-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          thumbClassName
        )}
      />
    </SliderPrimitive.Root>
  )
);
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };