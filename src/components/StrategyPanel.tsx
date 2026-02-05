import { useEffect, useState } from 'react';
import { useGameStore } from '../store/gameStore';
import type { StrategyType } from '../engine/strategies';
import { STRATEGY_DESCRIPTIONS } from '../engine/strategies';

export function StrategyPanel() {
  const {
    strategyType,
    strategyState,
    betType,
    baseUnit,
    targetProfit,
    stopLoss,
    setStrategyType,
    setBetType,
    setBaseUnit,
    setTargetProfit,
    setStopLoss,
    initializeStrategy,
    resetStrategy
  } = useGameStore();

  // Local state for inputs to allow free typing
  const [localBaseUnit, setLocalBaseUnit] = useState(baseUnit.toString());
  const [localTarget, setLocalTarget] = useState(targetProfit.toString());
  const [localStopLoss, setLocalStopLoss] = useState(stopLoss.toString());

  // Sync local state when store changes (e.g., from settings modal)
  useEffect(() => {
    setLocalBaseUnit(baseUnit.toString());
    setLocalTarget(targetProfit.toString());
    setLocalStopLoss(stopLoss.toString());
  }, [baseUnit, targetProfit, stopLoss]);

  // Initialize strategy on mount
  useEffect(() => {
    initializeStrategy();
  }, [strategyType]);

  const applyValue = (setter: (val: number) => void, value: string, min: number = 1) => {
    const num = parseInt(value) || min;
    setter(Math.max(min, num));
    initializeStrategy();
  };

  const strategies = Object.entries(STRATEGY_DESCRIPTIONS) as [StrategyType, typeof STRATEGY_DESCRIPTIONS[StrategyType]][];

  const riskColors = {
    Low: 'bg-green-500/20 text-green-400 border-green-500/30',
    Medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    High: 'bg-red-500/20 text-red-400 border-red-500/30'
  };

  return (
    <div className="bg-slate-800 rounded-xl p-4 lg:p-5 space-y-4 lg:space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-base lg:text-lg font-semibold text-white">Strategy Settings</h2>
        <button
          onClick={resetStrategy}
          className="text-sm text-amber-400 hover:text-amber-300"
        >
          Reset
        </button>
      </div>

      {/* Bet Type Selection */}
      <div>
        <label className="block text-sm text-slate-400 mb-2">Bet On</label>
        <div className="grid grid-cols-3 gap-2">
          {(['player', 'banker', 'tie'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setBetType(type)}
              className={`px-2 py-2 lg:px-3 lg:py-3 rounded-lg font-medium transition-all text-sm lg:text-base ${
                betType === type
                  ? type === 'player'
                    ? 'bg-blue-600 text-white glow-player'
                    : type === 'banker'
                    ? 'bg-red-600 text-white glow-banker'
                    : 'bg-green-600 text-white glow-tie'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
              <div className="text-xs mt-1 opacity-75">
                {type === 'player' && '1:1'}
                {type === 'banker' && '0.95:1'}
                {type === 'tie' && '8:1'}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Strategy Selection */}
      <div>
        <label className="block text-sm text-slate-400 mb-2">Betting Strategy</label>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
          {strategies.map(([key, info]) => (
            <button
              key={key}
              onClick={() => setStrategyType(key)}
              className={`p-2 lg:p-3 rounded-lg text-left transition-all ${
                strategyType === key
                  ? 'bg-amber-600/30 border-2 border-amber-500'
                  : 'bg-slate-700 border-2 border-transparent hover:bg-slate-600'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-white text-xs lg:text-sm">{info.name}</span>
                <span className={`text-xs px-1.5 py-0.5 rounded border ${riskColors[info.risk]}`}>
                  {info.risk}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 line-clamp-1 lg:line-clamp-2 hidden lg:block">{info.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Betting Parameters */}
      <div className="grid grid-cols-3 gap-2 lg:gap-3">
        <div>
          <label className="block text-xs lg:text-sm text-slate-400 mb-1">Base Unit</label>
          <input
            type="text"
            inputMode="numeric"
            value={localBaseUnit}
            onChange={(e) => setLocalBaseUnit(e.target.value.replace(/[^0-9]/g, ''))}
            onBlur={() => applyValue(setBaseUnit, localBaseUnit)}
            onKeyDown={(e) => e.key === 'Enter' && applyValue(setBaseUnit, localBaseUnit)}
            className="w-full bg-slate-700 rounded-lg px-2 lg:px-3 py-2 text-white text-sm lg:text-base border border-slate-600 focus:border-amber-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-xs lg:text-sm text-slate-400 mb-1">Target</label>
          <input
            type="text"
            inputMode="numeric"
            value={localTarget}
            onChange={(e) => setLocalTarget(e.target.value.replace(/[^0-9]/g, ''))}
            onBlur={() => applyValue(setTargetProfit, localTarget)}
            onKeyDown={(e) => e.key === 'Enter' && applyValue(setTargetProfit, localTarget)}
            className="w-full bg-slate-700 rounded-lg px-2 lg:px-3 py-2 text-white text-sm lg:text-base border border-slate-600 focus:border-amber-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-xs lg:text-sm text-slate-400 mb-1">Stop Loss</label>
          <input
            type="text"
            inputMode="numeric"
            value={localStopLoss}
            onChange={(e) => setLocalStopLoss(e.target.value.replace(/[^0-9]/g, ''))}
            onBlur={() => applyValue(setStopLoss, localStopLoss)}
            onKeyDown={(e) => e.key === 'Enter' && applyValue(setStopLoss, localStopLoss)}
            className="w-full bg-slate-700 rounded-lg px-2 lg:px-3 py-2 text-white text-sm lg:text-base border border-slate-600 focus:border-amber-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Current Strategy State */}
      {strategyState && (
        <div className="bg-slate-900/50 rounded-lg p-3 lg:p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs lg:text-sm text-slate-400">Sequence</span>
            <span className="font-mono text-sm lg:text-base text-amber-400">
              {strategyState.sequence.join(' - ')}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs lg:text-sm text-slate-400">Next Bet</span>
            <span className="text-xl lg:text-2xl font-bold text-white">
              ${strategyState.currentBet.toLocaleString()}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2 lg:gap-3 pt-3 border-t border-slate-700">
            <div className="text-center">
              <div className="text-xs text-slate-500">Wins</div>
              <div className="text-lg lg:text-xl font-semibold text-green-400">{strategyState.wins}</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-slate-500">Losses</div>
              <div className="text-lg lg:text-xl font-semibold text-red-400">{strategyState.losses}</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-slate-500">Max Bet</div>
              <div className="text-lg lg:text-xl font-semibold text-slate-300">${strategyState.maxBet}</div>
            </div>
          </div>
          {!strategyState.isActive && (
            <div className="text-center py-2 bg-amber-500/20 rounded text-amber-400 text-sm">
              Strategy Complete - Reset to Continue
            </div>
          )}
        </div>
      )}
    </div>
  );
}
