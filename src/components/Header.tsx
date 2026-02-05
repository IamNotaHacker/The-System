import { Settings, RotateCcw, Upload } from 'lucide-react';
import { useGameStore } from '../store/gameStore';

export function Header() {
  const {
    bankroll,
    initialBankroll,
    sessionStats,
    toggleSettings,
    toggleShoeImport,
    newGame
  } = useGameStore();

  const profit = bankroll - initialBankroll;
  const profitPercent = ((profit / initialBankroll) * 100).toFixed(1);

  return (
    <header className="bg-slate-800 border-b border-slate-700 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">
            The System
          </h1>
          <span className="text-sm text-slate-500 bg-slate-700/50 px-2 py-1 rounded">
            Master the Sequence
          </span>
        </div>

        <div className="flex items-center gap-6">
          {/* Bankroll Display */}
          <div className="flex items-center gap-8 bg-slate-900/50 rounded-lg px-6 py-3">
            <div className="text-center">
              <div className="text-xs text-slate-400 uppercase tracking-wider">Bankroll</div>
              <div className="text-xl font-semibold text-white">
                ${bankroll.toLocaleString()}
              </div>
            </div>
            <div className="h-8 w-px bg-slate-700" />
            <div className="text-center">
              <div className="text-xs text-slate-400 uppercase tracking-wider">Profit/Loss</div>
              <div className={`text-xl font-semibold ${profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {profit >= 0 ? '+' : ''}{profit.toLocaleString()} ({profitPercent}%)
              </div>
            </div>
            <div className="h-8 w-px bg-slate-700" />
            <div className="text-center">
              <div className="text-xs text-slate-400 uppercase tracking-wider">Hands</div>
              <div className="text-xl font-semibold text-white">
                {sessionStats.handsPlayed}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleShoeImport}
              className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white transition-colors"
              title="Import Shoe Data"
            >
              <Upload size={22} />
            </button>
            <button
              onClick={newGame}
              className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white transition-colors"
              title="New Game"
            >
              <RotateCcw size={22} />
            </button>
            <button
              onClick={toggleSettings}
              className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white transition-colors"
              title="Settings"
            >
              <Settings size={22} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
