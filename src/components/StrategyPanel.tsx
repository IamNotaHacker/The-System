import { useEffect } from 'react';
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

  // Initialize strategy on mount or when settings change
  useEffect(() => {
    initializeStrategy();
  }, [strategyType, baseUnit, targetProfit, stopLoss]);

  const strategies = Object.entries(STRATEGY_DESCRIPTIONS) as [StrategyType, typeof STRATEGY_DESCRIPTIONS[StrategyType]][];

  const riskColors = {
    Low: 'bg-green-500/20 text-green-400 border-green-500/30',
    Medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    High: 'bg-red-500/20 text-red-400 border-red-500/30'
  };

  return (
    <div className="bg-slate-800 rounded-xl p-5 space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Strategy Settings</h2>
        <button
          onClick={resetStrategy}
          className="text-sm text-amber-400 hover:text-amber-300"
        >
          Reset Strategy
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
              className={`px-3 py-3 rounded-lg font-medium transition-all ${
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
        <div className="grid grid-cols-2 gap-2">
          {strategies.map(([key, info]) => (
            <button
              key={key}
              onClick={() => setStrategyType(key)}
              className={`p-3 rounded-lg text-left transition-all ${
                strategyType === key
                  ? 'bg-amber-600/30 border-2 border-amber-500'
                  : 'bg-slate-700 border-2 border-transparent hover:bg-slate-600'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-white text-sm">{info.name}</span>
                <span className={`text-xs px-2 py-0.5 rounded border ${riskColors[info.risk]}`}>
                  {info.risk}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 line-clamp-2">{info.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Betting Parameters */}
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-sm text-slate-400 mb-1">Base Unit ($)</label>
          <input
            type="number"
            value={baseUnit}
            onChange={(e) => setBaseUnit(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-full bg-slate-700 rounded-lg px-3 py-2 text-white border border-slate-600 focus:border-amber-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm text-slate-400 mb-1">Target ($)</label>
          <input
            type="number"
            value={targetProfit}
            onChange={(e) => setTargetProfit(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-full bg-slate-700 rounded-lg px-3 py-2 text-white border border-slate-600 focus:border-amber-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm text-slate-400 mb-1">Stop Loss ($)</label>
          <input
            type="number"
            value={stopLoss}
            onChange={(e) => setStopLoss(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-full bg-slate-700 rounded-lg px-3 py-2 text-white border border-slate-600 focus:border-amber-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Current Strategy State */}
      {strategyState && (
        <div className="bg-slate-900/50 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-400">Sequence</span>
            <span className="font-mono text-amber-400">
              {strategyState.sequence.join(' - ')}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-400">Next Bet</span>
            <span className="text-2xl font-bold text-white">
              ${strategyState.currentBet.toLocaleString()}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-3 pt-3 border-t border-slate-700">
            <div className="text-center">
              <div className="text-xs text-slate-500">Wins</div>
              <div className="text-xl font-semibold text-green-400">{strategyState.wins}</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-slate-500">Losses</div>
              <div className="text-xl font-semibold text-red-400">{strategyState.losses}</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-slate-500">Max Bet</div>
              <div className="text-xl font-semibold text-slate-300">${strategyState.maxBet}</div>
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
