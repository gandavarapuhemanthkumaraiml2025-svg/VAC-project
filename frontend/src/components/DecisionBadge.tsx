import React from 'react';
import type { DecisionLabel } from '../types/api';
import { Droplets, HelpCircle, PauseCircle } from 'lucide-react';

interface Props {
  decision: DecisionLabel;
  size?: 'sm' | 'md' | 'lg';
}

export const DecisionBadge: React.FC<Props> = ({ decision, size = 'md' }) => {
  const configs: Record<
    DecisionLabel,
    { label: string; bg: string; text: string; icon: React.ReactNode; border: string }
  > = {
    WATER_NOW: {
      label: 'WATER NOW',
      bg: 'bg-teal-700 text-white',
      text: 'text-white',
      border: 'border-teal-800',
      icon: <Droplets className="w-3.5 h-3.5 animate-pulse" />,
    },
    CHECK_SOIL: {
      label: 'CHECK SOIL',
      bg: 'bg-amber-600 text-white',
      text: 'text-white',
      border: 'border-amber-700',
      icon: <HelpCircle className="w-3.5 h-3.5" />,
    },
    WAIT: {
      label: 'WAIT / DEFER',
      bg: 'bg-emerald-800 text-white',
      text: 'text-white',
      border: 'border-emerald-900',
      icon: <PauseCircle className="w-3.5 h-3.5" />,
    },
  };

  const c = configs[decision] || {
    label: decision,
    bg: 'bg-stone-500 text-white',
    text: 'text-white',
    border: 'border-stone-600',
    icon: null,
  };

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs font-bold px-3 py-1 gap-1.5',
    lg: 'text-sm font-extrabold px-4 py-1.5 gap-2 shadow-sm',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border ${c.bg} ${c.border} ${sizeClasses[size]}`}
    >
      {c.icon}
      <span>{c.label}</span>
    </span>
  );
};
