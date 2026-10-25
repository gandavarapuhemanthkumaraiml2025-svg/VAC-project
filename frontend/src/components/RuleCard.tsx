import React from 'react';
import { DecisionBadge } from './DecisionBadge';
import { ShieldCheck, BookOpen, AlertCircle } from 'lucide-react';

interface Props {
  rule: {
    id: string;
    name: string;
    description: string;
    priority: number;
    decision: 'WATER_NOW' | 'CHECK_SOIL' | 'WAIT';
    evidence_quality: string;
    conditions: string[];
    recommendation_template: string;
    explanation_template: string;
    source_ids: string[];
    is_active: boolean;
  };
}

export const RuleCard: React.FC<Props> = ({ rule }) => {
  return (
    <div className="card p-5 border border-stone-200/90 rounded-2xl shadow-sm hover:shadow transition">
      <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
              {rule.id}
            </span>
            <h3 className="font-bold text-stone-900 text-sm">{rule.name}</h3>
          </div>
          <p className="text-xs text-stone-500 mt-1">{rule.description}</p>
        </div>
        <div className="flex items-center gap-2">
          <DecisionBadge decision={rule.decision} size="sm" />
          <span className="text-[11px] font-mono text-stone-500 bg-stone-100 px-2 py-0.5 rounded">
            P{rule.priority}
          </span>
        </div>
      </div>

      <div className="bg-stone-50 rounded-xl p-3 border border-stone-100 my-3">
        <div className="text-[11px] font-semibold text-stone-600 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
          <span>Rule Conditions</span>
        </div>
        <ul className="space-y-1 text-xs text-stone-700">
          {rule.conditions.map((cond, idx) => (
            <li key={idx} className="flex items-start gap-1.5">
              <span className="text-teal-600 font-bold">&bull;</span>
              <span>{cond}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="text-xs text-stone-600 mb-3 space-y-1">
        <p>
          <strong className="text-stone-800">Recommendation:</strong> {rule.recommendation_template}
        </p>
        <p className="text-stone-500 italic">
          <strong className="text-stone-700 not-italic">Logic:</strong> {rule.explanation_template}
        </p>
      </div>

      <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
        <div className="flex items-center gap-1.5">
          <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
          <span>Sources:</span>
          {rule.source_ids.map((s) => (
            <span key={s} className="bg-emerald-50 text-emerald-800 px-1.5 py-0.2 rounded text-[11px] font-mono">
              {s}
            </span>
          ))}
        </div>
        <span className="text-[11px] capitalize text-stone-500">
          Quality: {rule.evidence_quality}
        </span>
      </div>
    </div>
  );
};
