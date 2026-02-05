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
    <header className="bg-slate-800 border-b border-slate-700 px-3 md:px-6 py-3 md:py-4">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 md:gap-0">
        <div className="flex items-center justify-between w-full md:w-auto gap-4">
          <div className="flex items-center gap-2 md:gap-4">
            <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">
              The System
            </h1>
            <span className="hidden md:inline text-sm text-slate-500 bg-slate-700/50 px-2 py-1 rounded">
              Master the Sequence
            </span>
          </div>

          {/* Action Buttons - visible on mobile in header row */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={toggleShoeImport}
              className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white transition-colors"
              title="Import Shoe Data"
            >
              <Upload size={20} />
            </button>
            <button
              onClick={newGame}
              className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white transition-colors"
              title="New Game"
            >
              <RotateCcw size={20} />
            </button>
            <button
              onClick={toggleSettings}
              className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white transition-colors"
              title="Settings"
            >
              <Settings size={20} />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4 md:gap-6 w-full md:w-auto">
          {/* Bankroll Display */}
          <div className="flex items-center justify-between md:justify-start gap-4 md:gap-8 bg-slate-900/50 rounded-lg px-3 md:px-6 py-2 md:py-3 flex-1 md:flex-initial">
            <div className="text-center">
              <div className="text-[10px] md:text-xs text-slate-400 uppercase tracking-wider">Bankroll</div>
              <div className="text-base md:text-xl font-semibold text-white">
                ${bankroll.toLocaleString()}
              </div>
            </div>
            <div className="h-6 md:h-8 w-px bg-slate-700" />
            <div className="text-center">
              <div className="text-[10px] md:text-xs text-slate-400 uppercase tracking-wider">P/L</div>
              <div className={`text-base md:text-xl font-semibold ${profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {profit >= 0 ? '+' : ''}{profit.toLocaleString()}
                <span className="hidden md:inline"> ({profitPercent}%)</span>
              </div>
            </div>
            <div className="h-6 md:h-8 w-px bg-slate-700" />
            <div className="text-center">
              <div className="text-[10px] md:text-xs text-slate-400 uppercase tracking-wider">Hands</div>
              <div className="text-base md:text-xl font-semibold text-white">
                {sessionStats.handsPlayed}
              </div>
            </div>
          </div>

          {/* Action Buttons - hidden on mobile, shown on desktop */}
          <div className="hidden md:flex items-center gap-2">
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
