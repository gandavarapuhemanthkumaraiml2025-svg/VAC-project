import React from 'react';
import type { AdvisoryResponse } from '../types/api';
import { DecisionBadge } from './DecisionBadge';
import { EvidenceBadge } from './EvidenceBadge';
import {
  AlertTriangle,
  Info,
  CheckCircle2,
  BookOpen,
  Calendar,
  CloudSun,
  ShieldCheck,
  ArrowRightCircle,
  HelpCircle
} from 'lucide-react';

interface Props {
  result: AdvisoryResponse;
  onViewSource?: (sourceId: string) => void;
}

export const AdvisoryResultCard: React.FC<Props> = ({ result, onViewSource }) => {
  const getDecisionBorder = () => {
    switch (result.decision) {
      case 'WATER_NOW':
        return 'border-l-4 border-l-teal-600 bg-teal-50/20';
      case 'CHECK_SOIL':
        return 'border-l-4 border-l-amber-500 bg-amber-50/20';
      case 'WAIT':
        return 'border-l-4 border-l-emerald-600 bg-emerald-50/20';
      default:
        return 'border-l-4 border-l-stone-400 bg-stone-50';
    }
  };

  return (
    <div className={`card p-6 rounded-2xl shadow-md border border-stone-200 transition-all ${getDecisionBorder()}`}>
      {/* Top Header: Decision & Evidence Quality */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-stone-200">
        <div className="flex items-center gap-3">
          <DecisionBadge decision={result.decision} size="lg" />
          <EvidenceBadge quality={result.evidence_quality} />
        </div>
        <div className="flex items-center gap-2 text-xs text-stone-500">
          <Calendar className="w-3.5 h-3.5" />
          <span>{new Date(result.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          {result.is_demo_data && (
            <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded text-[10px] font-semibold">
              Demo Weather
            </span>
          )}
        </div>
      </div>

      {/* Main Recommendation Callout */}
      <div className="my-5">
        <h3 className="text-xl font-bold text-stone-900 tracking-tight leading-snug">
          {result.recommendation}
        </h3>
        <p className="mt-2 text-stone-700 text-sm leading-relaxed">
          {result.explanation}
        </p>
      </div>

      {/* Warnings & Data Quality Alerts */}
      {result.data_quality_warnings && result.data_quality_warnings.length > 0 && (
        <div className="mb-4 p-3.5 bg-amber-50/80 border border-amber-200/90 rounded-xl">
          <div className="flex items-center gap-2 text-amber-900 text-xs font-semibold mb-1">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Data Reliability & Timing Notices</span>
          </div>
          <ul className="list-disc list-inside text-xs text-amber-800 space-y-0.5 pl-1">
            {result.data_quality_warnings.map((warn, i) => (
              <li key={i}>{warn}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Missing Inputs notice */}
      {result.missing_inputs && result.missing_inputs.length > 0 && (
        <div className="mb-4 p-3 bg-stone-100/90 border border-stone-200 rounded-xl flex items-start gap-2.5">
          <HelpCircle className="w-4 h-4 text-stone-500 shrink-0 mt-0.5" />
          <div className="text-xs text-stone-600">
            <span className="font-semibold text-stone-700">Inputs omitted: </span>
            {result.missing_inputs.join(', ')}. Advisory synthesized using conservative default baselines.
          </div>
        </div>
      )}

      {/* Suggested Next Action */}
      {result.suggested_next_action && (
        <div className="mb-5 p-3.5 bg-teal-50/60 border border-teal-200/80 rounded-xl flex items-start gap-3">
          <ArrowRightCircle className="w-5 h-5 text-teal-700 shrink-0 mt-0.5" />
          <div>
            <div className="text-xs font-bold text-teal-900 uppercase tracking-wider">
              Recommended Next Action
            </div>
            <p className="text-xs text-teal-800 mt-0.5 font-medium leading-relaxed">
              {result.suggested_next_action}
            </p>
          </div>
        </div>
      )}

      {/* Rules & Source Grounding Breakdown */}
      <div className="pt-4 border-t border-stone-200/80 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <div>
          <div className="flex items-center gap-1.5 text-stone-700 font-semibold mb-2">
            <ShieldCheck className="w-4 h-4 text-teal-700" />
            <span>Rules Triggered ({result.rule_ids?.length || 0})</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {result.rule_ids && result.rule_ids.length > 0 ? (
              result.rule_ids.map((rId) => (
                <span
                  key={rId}
                  className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg font-mono text-[11px] border border-stone-300/80 transition"
                >
                  {rId}
                </span>
              ))
            ) : (
              <span className="text-stone-400 italic">Default fallback evaluation</span>
            )}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-1.5 text-stone-700 font-semibold mb-2">
            <BookOpen className="w-4 h-4 text-emerald-700" />
            <span>Horticultural Citations</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {result.source_ids && result.source_ids.length > 0 ? (
              result.source_ids.map((sId) => (
                <button
                  key={sId}
                  onClick={() => onViewSource && onViewSource(sId)}
                  className="px-2 py-1 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 rounded-md text-[11px] font-medium border border-emerald-200 flex items-center gap-1 transition"
                  title="Click to view source reference"
                >
                  <span>{sId}</span>
                </button>
              ))
            ) : (
              <span className="text-stone-400 italic">Domain general guidelines</span>
            )}
          </div>
        </div>
      </div>

      {/* Inputs Evaluated Footer */}
      {result.inputs_considered && (
        <div className="mt-4 pt-3 border-t border-stone-100 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-stone-500">
          <span>Plant: <strong className="text-stone-700">{result.inputs_considered.plant_id}</strong></span>
          <span>Stage: <strong className="text-stone-700">{result.inputs_considered.growth_stage}</strong></span>
          <span>Soil: <strong className="text-stone-700">{result.inputs_considered.soil_type}</strong></span>
          <span>Pot: <strong className="text-stone-700">{result.inputs_considered.pot_size} ({result.inputs_considered.has_drainage ? 'with drainage' : 'no drainage'})</strong></span>
          {result.inputs_considered.temperature_c !== null && (
            <span>Temp: <strong className="text-stone-700">{result.inputs_considered.temperature_c}°C</strong></span>
          )}
        </div>
      )}
    </div>
  );
};
