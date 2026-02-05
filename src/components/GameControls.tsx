import { useEffect, useRef, useCallback } from 'react';
import { Play, Pause, SkipForward, SkipBack, RotateCcw, FastForward } from 'lucide-react';
import { useGameStore } from '../store/gameStore';

export function GameControls() {
  const isAutoPlaying = useGameStore((state) => state.isAutoPlaying);
  const autoPlaySpeed = useGameStore((state) => state.autoPlaySpeed);
  const currentPosition = useGameStore((state) => state.currentPosition);
  const shoeResults = useGameStore((state) => state.shoeResults);
  const strategyState = useGameStore((state) => state.strategyState);
  const playNextHand = useGameStore((state) => state.playNextHand);
  const stepBack = useGameStore((state) => state.stepBack);
  const startAutoPlay = useGameStore((state) => state.startAutoPlay);
  const stopAutoPlay = useGameStore((state) => state.stopAutoPlay);
  const setAutoPlaySpeed = useGameStore((state) => state.setAutoPlaySpeed);
  const resetSession = useGameStore((state) => state.resetSession);

  const intervalRef = useRef<number | null>(null);
  const isAutoPlayingRef = useRef(isAutoPlaying);

  // Keep ref in sync
  useEffect(() => {
    isAutoPlayingRef.current = isAutoPlaying;
  }, [isAutoPlaying]);

  // Stable callback for auto-play
  const handleAutoPlay = useCallback(() => {
    if (isAutoPlayingRef.current) {
      playNextHand();
    }
  }, [playNextHand]);

  // Auto-play logic with stable interval
  useEffect(() => {
    if (isAutoPlaying) {
      // Clear any existing interval first
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      intervalRef.current = window.setInterval(handleAutoPlay, autoPlaySpeed);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isAutoPlaying, autoPlaySpeed, handleAutoPlay]);

  const isAtEnd = currentPosition >= shoeResults.length;
  const isAtStart = currentPosition === 0;
  const strategyInactive = !strategyState?.isActive;

  return (
    <div className="bg-slate-800 rounded-xl p-4 lg:p-6">
      <div className="flex items-center justify-between mb-3 lg:mb-4">
        <h2 className="text-base lg:text-lg font-semibold text-white">Game Controls</h2>
        <div className="text-xs lg:text-sm text-slate-400">
          Hand {currentPosition} of {shoeResults.length}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4 lg:mb-6">
        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-amber-600 transition-all duration-300"
            style={{ width: `${(currentPosition / Math.max(shoeResults.length, 1)) * 100}%` }}
          />
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-2 lg:gap-4">
        <button
          onClick={resetSession}
          className="p-2 lg:p-3 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white transition-colors"
          title="Reset Session"
        >
          <RotateCcw size={18} className="lg:w-5 lg:h-5" />
        </button>

        <button
          onClick={stepBack}
          disabled={isAtStart || isAutoPlaying}
          className="p-2 lg:p-3 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Step Back"
        >
          <SkipBack size={18} className="lg:w-5 lg:h-5" />
        </button>

        {isAutoPlaying ? (
          <button
            onClick={stopAutoPlay}
            className="p-3 lg:p-4 rounded-full bg-amber-600 hover:bg-amber-500 text-white transition-colors"
            title="Pause"
          >
            <Pause size={20} className="lg:w-6 lg:h-6" />
          </button>
        ) : (
          <button
            onClick={startAutoPlay}
            disabled={isAtEnd || strategyInactive}
            className="p-3 lg:p-4 rounded-full bg-amber-600 hover:bg-amber-500 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Auto Play"
          >
            <Play size={20} className="lg:w-6 lg:h-6" />
          </button>
        )}

        <button
          onClick={playNextHand}
          disabled={isAtEnd || strategyInactive || isAutoPlaying}
          className="p-2 lg:p-3 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Step Forward"
        >
          <SkipForward size={18} className="lg:w-5 lg:h-5" />
        </button>

        {/* Speed Control */}
        <div className="flex items-center gap-2 ml-2 lg:ml-4 pl-2 lg:pl-4 border-l border-slate-700">
          <FastForward size={14} className="text-slate-400 lg:w-4 lg:h-4" />
          <select
            value={autoPlaySpeed}
            onChange={(e) => setAutoPlaySpeed(parseInt(e.target.value))}
            className="bg-slate-700 rounded px-2 lg:px-3 py-1.5 lg:py-2 text-xs lg:text-sm text-white border border-slate-600 focus:border-amber-500 focus:outline-none"
          >
            <option value={1000}>Slow</option>
            <option value={500}>Normal</option>
            <option value={200}>Fast</option>
            <option value={50}>Turbo</option>
          </select>
        </div>
      </div>

      {/* Status Messages */}
      {isAtEnd && (
        <div className="mt-3 lg:mt-4 text-center py-2 bg-slate-700 rounded text-slate-300 text-xs lg:text-sm">
          End of shoe - Load new shoe or generate random
        </div>
      )}
      {strategyInactive && !isAtEnd && (
        <div className="mt-3 lg:mt-4 text-center py-2 bg-amber-500/20 rounded text-amber-400 text-xs lg:text-sm">
          Strategy limit reached - Reset to continue
        </div>
      )}
    </div>
  );
}
