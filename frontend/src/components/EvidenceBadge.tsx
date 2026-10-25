import React from 'react';
import type { EvidenceQuality } from '../types/api';
import { ShieldCheck, ShieldAlert, Shield, AlertTriangle } from 'lucide-react';

interface Props {
  quality: EvidenceQuality | string;
}

export const EvidenceBadge: React.FC<Props> = ({ quality }) => {
  const configs: Record<string, { label: string; badgeClass: string; icon: React.ReactNode }> = {
    strong: {
      label: 'Strong Evidence',
      badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      icon: <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />,
    },
    moderate: {
      label: 'Moderate Evidence',
      badgeClass: 'bg-sky-100 text-sky-800 border-sky-300',
      icon: <Shield className="w-3.5 h-3.5 text-sky-600" />,
    },
    weak: {
      label: 'Weak Evidence',
      badgeClass: 'bg-amber-100 text-amber-800 border-amber-300',
      icon: <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />,
    },
    insufficient: {
      label: 'Insufficient Data',
      badgeClass: 'bg-rose-100 text-rose-800 border-rose-300',
      icon: <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />,
    },
  };

  const c = configs[quality] || {
    label: quality,
    badgeClass: 'bg-gray-100 text-gray-800 border-gray-300',
    icon: null,
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium border ${c.badgeClass}`}
    >
      {c.icon}
      <span>{c.label}</span>
    </span>
  );
};
