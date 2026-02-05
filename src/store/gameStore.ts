import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { HandResult, GameResult, BetType } from '../engine/baccarat';
import { generateRandomShoe, parseShoeData, calculatePayout } from '../engine/baccarat';
import type { StrategyState, StrategyType } from '../engine/strategies';
import { BettingStrategy, createStrategy } from '../engine/strategies';

export interface SessionStats {
  handsPlayed: number;
  bankerWins: number;
  playerWins: number;
  ties: number;
  currentStreak: { type: HandResult | null; count: number };
  longestBankerStreak: number;
  longestPlayerStreak: number;
  betHistory: Array<{
    hand: number;
    result: HandResult;
    betType: BetType;
    betAmount: number;
    payout: number;
    balance: number;
  }>;
}

export interface GameState {
  // Shoe data
  shoeResults: HandResult[];
  currentPosition: number;
  shoeHistory: HandResult[];

  // Current game
  currentResult: GameResult | null;
  isPlaying: boolean;
  autoPlaySpeed: number;
  isAutoPlaying: boolean;

  // Betting
  betType: BetType;
  strategy: BettingStrategy | null;
  strategyType: StrategyType;
  strategyState: StrategyState | null;

  // Bankroll
  bankroll: number;
  initialBankroll: number;
  baseUnit: number;
  targetProfit: number;
  stopLoss: number;

  // Session stats
  sessionStats: SessionStats;

  // UI State
  showSettings: boolean;
  showShoeImport: boolean;

  // Actions
  setShoeResults: (results: HandResult[]) => void;
  importShoeData: (data: string) => void;
  generateNewShoe: (hands?: number) => void;

  setBetType: (type: BetType) => void;
  setStrategyType: (type: StrategyType) => void;
  setBaseUnit: (unit: number) => void;
  setTargetProfit: (target: number) => void;
  setStopLoss: (loss: number) => void;
  setBankroll: (amount: number) => void;

  initializeStrategy: (labouchereSequence?: number[]) => void;
  resetStrategy: () => void;

  playNextHand: () => void;
  stepBack: () => void;
  startAutoPlay: () => void;
  stopAutoPlay: () => void;
  setAutoPlaySpeed: (speed: number) => void;

  resetSession: () => void;
  newGame: () => void;

  toggleSettings: () => void;
  toggleShoeImport: () => void;
}

const initialSessionStats: SessionStats = {
  handsPlayed: 0,
  bankerWins: 0,
  playerWins: 0,
  ties: 0,
  currentStreak: { type: null, count: 0 },
  longestBankerStreak: 0,
  longestPlayerStreak: 0,
  betHistory: []
};

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      // Initial state
      shoeResults: [],
      currentPosition: 0,
      shoeHistory: [],
      currentResult: null,
      isPlaying: false,
      autoPlaySpeed: 500,
      isAutoPlaying: false,

      betType: 'player',
      strategy: null,
      strategyType: 'labouchere',
      strategyState: null,

      bankroll: 6000,
      initialBankroll: 6000,
      baseUnit: 25,
      targetProfit: 1500,
      stopLoss: 1000,

      sessionStats: { ...initialSessionStats },

      showSettings: false,
      showShoeImport: false,

      // Actions
      setShoeResults: (results) => set({ shoeResults: results, currentPosition: 0 }),

      importShoeData: (data) => {
        const results = parseShoeData(data);
        set({ shoeResults: results, currentPosition: 0 });
      },

      generateNewShoe: (hands = 80) => {
        const results = generateRandomShoe(hands);
        set({ shoeResults: results, currentPosition: 0 });
      },

      setBetType: (type) => set({ betType: type }),
      setStrategyType: (type) => set({ strategyType: type }),
      setBaseUnit: (unit) => set({ baseUnit: unit }),
      setTargetProfit: (target) => set({ targetProfit: target }),
      setStopLoss: (loss) => set({ stopLoss: loss }),
      setBankroll: (amount) => set({ bankroll: amount, initialBankroll: amount }),

      initializeStrategy: (labouchereSequence) => {
        const { strategyType, baseUnit, targetProfit, stopLoss } = get();
        const strategy = createStrategy(strategyType, baseUnit, targetProfit, stopLoss, labouchereSequence);
        set({ strategy, strategyState: strategy.getState() });
      },

      resetStrategy: () => {
        const { strategy } = get();
        if (strategy) {
          strategy.reset();
          set({ strategyState: strategy.getState() });
        }
      },

      playNextHand: () => {
        const { shoeResults, currentPosition, strategy, betType, bankroll, sessionStats } = get();

        if (currentPosition >= shoeResults.length) {
          get().stopAutoPlay();
          return;
        }

        if (!strategy || !strategy.isActive) {
          get().stopAutoPlay();
          return;
        }

        const result = shoeResults[currentPosition];
        const betAmount = strategy.getNextBet();

        // Check if we can afford the bet
        if (betAmount > bankroll) {
          strategy.isActive = false;
          set({ strategyState: strategy.getState() });
          get().stopAutoPlay();
          return;
        }

        // Calculate payout
        const payout = calculatePayout(betType, betAmount, result);
        const won = payout > 0;

        // Process the result with the strategy
        strategy.processResult({
          won,
          amount: betAmount,
          payout: won ? payout : (payout === 0 ? 0 : -betAmount)
        });

        // Update bankroll
        const newBankroll = bankroll + payout;

        // Update session stats
        const newStats = { ...sessionStats };
        newStats.handsPlayed++;

        if (result === 'banker') {
          newStats.bankerWins++;
        } else if (result === 'player') {
          newStats.playerWins++;
        } else {
          newStats.ties++;
        }

        // Update streak
        if (result === newStats.currentStreak.type) {
          newStats.currentStreak.count++;
        } else {
          newStats.currentStreak = { type: result, count: 1 };
        }

        if (result === 'banker') {
          newStats.longestBankerStreak = Math.max(newStats.longestBankerStreak, newStats.currentStreak.count);
        } else if (result === 'player') {
          newStats.longestPlayerStreak = Math.max(newStats.longestPlayerStreak, newStats.currentStreak.count);
        }

        // Add to bet history
        newStats.betHistory.push({
          hand: currentPosition + 1,
          result,
          betType,
          betAmount,
          payout,
          balance: newBankroll
        });

        // Update shoe history
        const newHistory = [...get().shoeHistory, result];

        set({
          currentPosition: currentPosition + 1,
          bankroll: newBankroll,
          sessionStats: newStats,
          strategyState: strategy.getState(),
          shoeHistory: newHistory,
          isPlaying: true
        });

        // Check if strategy is still active
        if (!strategy.isActive || newBankroll <= 0) {
          get().stopAutoPlay();
        }
      },

      stepBack: () => {
        const { currentPosition, sessionStats, shoeHistory, strategy, betType } = get();

        if (currentPosition <= 0 || sessionStats.betHistory.length === 0) return;

        const lastBet = sessionStats.betHistory[sessionStats.betHistory.length - 1];

        // Restore bankroll
        const restoredBankroll = lastBet.balance - lastBet.payout;

        // Remove last bet from history
        const newBetHistory = sessionStats.betHistory.slice(0, -1);

        // Recalculate stats
        const newStats = {
          ...sessionStats,
          handsPlayed: sessionStats.handsPlayed - 1,
          bankerWins: sessionStats.bankerWins - (lastBet.result === 'banker' ? 1 : 0),
          playerWins: sessionStats.playerWins - (lastBet.result === 'player' ? 1 : 0),
          ties: sessionStats.ties - (lastBet.result === 'tie' ? 1 : 0),
          betHistory: newBetHistory,
          currentStreak: { type: null, count: 0 } // Reset streak (simplified)
        };

        // Reset and replay strategy to restore state
        if (strategy) {
          strategy.reset();
          for (const bet of newBetHistory) {
            const payout = calculatePayout(betType, bet.betAmount, bet.result);
            strategy.processResult({
              won: payout > 0,
              amount: bet.betAmount,
              payout: payout > 0 ? payout : (payout === 0 ? 0 : -bet.betAmount)
            });
          }
        }

        set({
          currentPosition: currentPosition - 1,
          bankroll: restoredBankroll,
          sessionStats: newStats,
          shoeHistory: shoeHistory.slice(0, -1),
          strategyState: strategy?.getState() || null
        });
      },

      startAutoPlay: () => {
        set({ isAutoPlaying: true });
      },

      stopAutoPlay: () => {
        set({ isAutoPlaying: false });
      },

      setAutoPlaySpeed: (speed) => set({ autoPlaySpeed: speed }),

      resetSession: () => {
        const { strategy, initialBankroll } = get();
        if (strategy) {
          strategy.reset();
        }
        set({
          currentPosition: 0,
          bankroll: initialBankroll,
          sessionStats: { ...initialSessionStats },
          strategyState: strategy?.getState() || null,
          shoeHistory: [],
          isPlaying: false,
          isAutoPlaying: false
        });
      },

      newGame: () => {
        const { strategy, initialBankroll } = get();
        if (strategy) {
          strategy.reset();
        }
        set({
          shoeResults: generateRandomShoe(80),
          currentPosition: 0,
          bankroll: initialBankroll,
          sessionStats: { ...initialSessionStats },
          strategyState: strategy?.getState() || null,
          shoeHistory: [],
          isPlaying: false,
          isAutoPlaying: false
        });
      },

      toggleSettings: () => set((state) => ({ showSettings: !state.showSettings })),
      toggleShoeImport: () => set((state) => ({ showShoeImport: !state.showShoeImport }))
    }),
    {
      name: 'baccarat-pro-storage',
      partialize: (state) => ({
        betType: state.betType,
        strategyType: state.strategyType,
        baseUnit: state.baseUnit,
        targetProfit: state.targetProfit,
        stopLoss: state.stopLoss,
        initialBankroll: state.initialBankroll,
        autoPlaySpeed: state.autoPlaySpeed
      })
    }
  )
);
