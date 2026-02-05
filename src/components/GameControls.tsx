import { useEffect, useRef } from 'react';
import { Play, Pause, SkipForward, SkipBack, RotateCcw, FastForward } from 'lucide-react';
import { useGameStore } from '../store/gameStore';

export function GameControls() {
  const {
    isAutoPlaying,
    autoPlaySpeed,
    currentPosition,
    shoeResults,
    strategyState,
    playNextHand,
    stepBack,
    startAutoPlay,
    stopAutoPlay,
    setAutoPlaySpeed,
    resetSession
  } = useGameStore();

  const intervalRef = useRef<number | null>(null);

  // Auto-play logic
  useEffect(() => {
    if (isAutoPlaying) {
      intervalRef.current = window.setInterval(() => {
        playNextHand();
      }, autoPlaySpeed);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isAutoPlaying, autoPlaySpeed, playNextHand]);

  const isAtEnd = currentPosition >= shoeResults.length;
  const isAtStart = currentPosition === 0;
  const strategyInactive = !strategyState?.isActive;

  return (
    <div className="bg-slate-800 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white">Game Controls</h2>
        <div className="text-sm text-slate-400">
          Hand {currentPosition} of {shoeResults.length}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-amber-600 transition-all duration-300"
            style={{ width: `${(currentPosition / Math.max(shoeResults.length, 1)) * 100}%` }}
          />
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={resetSession}
          className="p-3 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white transition-colors"
          title="Reset Session"
        >
          <RotateCcw size={20} />
        </button>

        <button
          onClick={stepBack}
          disabled={isAtStart || isAutoPlaying}
          className="p-3 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Step Back"
        >
          <SkipBack size={20} />
        </button>

        {isAutoPlaying ? (
          <button
            onClick={stopAutoPlay}
            className="p-4 rounded-full bg-amber-600 hover:bg-amber-500 text-white transition-colors"
            title="Pause"
          >
            <Pause size={24} />
          </button>
        ) : (
          <button
            onClick={startAutoPlay}
            disabled={isAtEnd || strategyInactive}
            className="p-4 rounded-full bg-amber-600 hover:bg-amber-500 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Auto Play"
          >
            <Play size={24} />
          </button>
        )}

        <button
          onClick={playNextHand}
          disabled={isAtEnd || strategyInactive || isAutoPlaying}
          className="p-3 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Step Forward"
        >
          <SkipForward size={20} />
        </button>

        {/* Speed Control */}
        <div className="flex items-center gap-2 ml-4 pl-4 border-l border-slate-700">
          <FastForward size={16} className="text-slate-400" />
          <select
            value={autoPlaySpeed}
            onChange={(e) => setAutoPlaySpeed(parseInt(e.target.value))}
            className="bg-slate-700 rounded px-3 py-2 text-sm text-white border border-slate-600 focus:border-amber-500 focus:outline-none"
          >
            <option value={1000}>Slow (1s)</option>
            <option value={500}>Normal (0.5s)</option>
            <option value={200}>Fast (0.2s)</option>
            <option value={50}>Turbo (0.05s)</option>
          </select>
        </div>
      </div>

      {/* Status Messages */}
      {isAtEnd && (
        <div className="mt-4 text-center py-2 bg-slate-700 rounded text-slate-300 text-sm">
          End of shoe reached - Load new shoe or generate random
        </div>
      )}
      {strategyInactive && !isAtEnd && (
        <div className="mt-4 text-center py-2 bg-amber-500/20 rounded text-amber-400 text-sm">
          Strategy target/limit reached - Reset strategy to continue
        </div>
      )}
    </div>
  );
}
