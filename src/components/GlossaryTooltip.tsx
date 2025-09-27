import React from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { GlossaryTerm } from '@/types/notes';
import { cn } from '@/lib/utils';

interface GlossaryTooltipProps {
  term: GlossaryTerm;
  children: React.ReactNode;
  className?: string;
}

export function GlossaryTooltip({ term, children, className }: GlossaryTooltipProps) {
  return (
    <TooltipProvider>
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          <span className={cn("glossary-term", className)}>
            {children}
          </span>
        </TooltipTrigger>
        <TooltipContent 
          className="max-w-xs p-3 bg-popover border border-border shadow-lg"
          sideOffset={4}
        >
          <div className="space-y-2">
            <div className="font-semibold text-sm text-primary">
              {term.text}
            </div>
            <div className="text-sm text-popover-foreground">
              {term.definition}
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}