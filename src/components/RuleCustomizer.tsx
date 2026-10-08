import React from 'react';
import { LudoCustomRules, LudoEntryRoll } from '../types/game';
import { audio } from '../utils/audio';
import { Sliders, Zap, Shield, Flame, Check } from 'lucide-react';

interface RuleCustomizerProps {
  rules: LudoCustomRules;
  onChange: (updated: LudoCustomRules) => void;
  disabled?: boolean;
}

export const RuleCustomizer: React.FC<RuleCustomizerProps> = ({
  rules,
  onChange,
  disabled = false,
}) => {
  const update = (patch: Partial<LudoCustomRules>) => {
    if (disabled) return;
    audio.playClick();
    onChange({ ...rules, ...patch });
  };

  const applyPreset = (preset: 'classic_1' | 'traditional_6' | 'blitz_fast') => {
    if (disabled) return;
    audio.playClick();
    if (preset === 'classic_1') {
      onChange({
        entryRoll: '1',
        oneRequiredToEnter: true,
        extraTurnOnOne: true,
        extraTurnOnSix: false,
        extraTurnOnCapture: true,
        safeZones: true,
        blockades: true,
        captureRequiredToEnterHome: false,
        exactRollToEnterHome: true,
        piecesToWin: 4,
      });
    } else if (preset === 'traditional_6') {
      onChange({
        entryRoll: '6',
        oneRequiredToEnter: false,
        extraTurnOnOne: false,
        extraTurnOnSix: true,
        extraTurnOnCapture: true,
        safeZones: true,
        blockades: true,
        captureRequiredToEnterHome: false,
        exactRollToEnterHome: true,
        piecesToWin: 4,
      });
    } else if (preset === 'blitz_fast') {
      onChange({
        entryRoll: '1_or_6',
        oneRequiredToEnter: false,
        extraTurnOnOne: true,
        extraTurnOnSix: true,
        extraTurnOnCapture: true,
        safeZones: true,
        blockades: false,
        captureRequiredToEnterHome: false,
        exactRollToEnterHome: false,
        piecesToWin: 1,
      });
    }
  };

  const currentEntry = rules.entryRoll || (rules.oneRequiredToEnter ? '1' : '1');

  return (
    <div className="space-y-4 bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs">
      {/* Header and Quick Presets */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-1.5 font-bold text-white text-xs">
          <Sliders className="w-4 h-4 text-amber-400" />
          <span>DEFINE CUSTOM RULES</span>
        </div>

        {!disabled && (
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-slate-500 mr-1">Presets:</span>
            <button
              type="button"
              onClick={() => applyPreset('classic_1')}
              className="px-2 py-0.5 rounded text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
            >
              Classic 1
            </button>
            <button
              type="button"
              onClick={() => applyPreset('traditional_6')}
              className="px-2 py-0.5 rounded text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
            >
              Classic 6
            </button>
            <button
              type="button"
              onClick={() => applyPreset('blitz_fast')}
              className="px-2 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 cursor-pointer"
            >
              Blitz (1 Piece)
            </button>
          </div>
        )}
      </div>

      {/* 1. Base Entry Requirement */}
      <div>
        <label className="text-[11px] font-semibold text-slate-300 block mb-1.5">
          Roll Needed to Bring Piece Out of Base
        </label>
        <div className="grid grid-cols-3 gap-1.5">
          {[
            { id: '1' as LudoEntryRoll, label: '1 Only (Default)' },
            { id: '6' as LudoEntryRoll, label: '6 Only' },
            { id: '1_or_6' as LudoEntryRoll, label: 'Either 1 or 6' },
          ].map(opt => (
            <button
              key={opt.id}
              type="button"
              disabled={disabled}
              onClick={() => update({ entryRoll: opt.id, oneRequiredToEnter: opt.id === '1' })}
              className={`py-1.5 px-2 rounded-xl text-[11px] font-semibold border transition-all cursor-pointer ${
                currentEntry === opt.id
                  ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-sm'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Extra Turn Rules */}
      <div className="space-y-2 pt-1 border-t border-slate-900">
        <label className="text-[11px] font-semibold text-slate-300 block">
          Extra Turn Conditions
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <label className="flex items-center justify-between p-2 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer">
            <span className="text-slate-300">Extra on 1</span>
            <input
              type="checkbox"
              disabled={disabled}
              checked={rules.extraTurnOnOne}
              onChange={e => update({ extraTurnOnOne: e.target.checked })}
              className="w-3.5 h-3.5 accent-amber-500 rounded"
            />
          </label>

          <label className="flex items-center justify-between p-2 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer">
            <span className="text-slate-300">Extra on 6</span>
            <input
              type="checkbox"
              disabled={disabled}
              checked={rules.extraTurnOnSix}
              onChange={e => update({ extraTurnOnSix: e.target.checked })}
              className="w-3.5 h-3.5 accent-amber-500 rounded"
            />
          </label>

          <label className="flex items-center justify-between p-2 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer">
            <span className="text-slate-300">Extra on Capture</span>
            <input
              type="checkbox"
              disabled={disabled}
              checked={rules.extraTurnOnCapture}
              onChange={e => update({ extraTurnOnCapture: e.target.checked })}
              className="w-3.5 h-3.5 accent-amber-500 rounded"
            />
          </label>
        </div>
      </div>

      {/* 3. Defense & Safe Zones */}
      <div className="space-y-2 pt-1 border-t border-slate-900">
        <label className="text-[11px] font-semibold text-slate-300 block">
          Defense & Obstacles
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <label className="flex items-center justify-between p-2 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer">
            <span className="text-slate-300">Safe Zones (Stars)</span>
            <input
              type="checkbox"
              disabled={disabled}
              checked={rules.safeZones}
              onChange={e => update({ safeZones: e.target.checked })}
              className="w-3.5 h-3.5 accent-amber-500 rounded"
            />
          </label>

          <label className="flex items-center justify-between p-2 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer">
            <span className="text-slate-300">Blockades (2 pieces block)</span>
            <input
              type="checkbox"
              disabled={disabled}
              checked={rules.blockades}
              onChange={e => update({ blockades: e.target.checked })}
              className="w-3.5 h-3.5 accent-amber-500 rounded"
            />
          </label>
        </div>
      </div>

      {/* 4. Home & Victory Conditions */}
      <div className="space-y-2 pt-1 border-t border-slate-900">
        <label className="text-[11px] font-semibold text-slate-300 block">
          Home Entry & Victory Condition
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <label className="flex items-center justify-between p-2 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer">
            <span className="text-slate-300">Capture Mandate (Need 1 kill for Home)</span>
            <input
              type="checkbox"
              disabled={disabled}
              checked={rules.captureRequiredToEnterHome}
              onChange={e => update({ captureRequiredToEnterHome: e.target.checked })}
              className="w-3.5 h-3.5 accent-amber-500 rounded"
            />
          </label>

          <label className="flex items-center justify-between p-2 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer">
            <span className="text-slate-300">Exact Roll to Enter Finish</span>
            <input
              type="checkbox"
              disabled={disabled}
              checked={rules.exactRollToEnterHome}
              onChange={e => update({ exactRollToEnterHome: e.target.checked })}
              className="w-3.5 h-3.5 accent-amber-500 rounded"
            />
          </label>
        </div>

        {/* Pieces needed to win */}
        <div className="pt-1">
          <div className="flex justify-between text-[11px] text-slate-400 mb-1">
            <span>Pieces Needed to Win Match:</span>
            <span className="font-bold text-amber-400">
              {rules.piecesToWin === 1 ? '1 Piece (Blitz Match)' : `${rules.piecesToWin || 4} Pieces`}
            </span>
          </div>
          <div className="grid grid-cols-4 gap-1.5">
            {[1, 2, 3, 4].map(count => (
              <button
                key={count}
                type="button"
                disabled={disabled}
                onClick={() => update({ piecesToWin: count })}
                className={`py-1 rounded-lg text-[11px] font-bold border transition-all cursor-pointer ${
                  (rules.piecesToWin || 4) === count
                    ? 'bg-amber-500 text-slate-950 border-amber-500'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                {count === 1 ? '1 (Blitz)' : count === 4 ? '4 (Full)' : `${count}`}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
