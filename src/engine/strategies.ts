// Betting Strategies for Baccarat

export interface BetResult {
  won: boolean;
  amount: number;
  payout: number;
}

export interface StrategyState {
  name: string;
  sequence: number[];
  baseUnit: number;
  currentBet: number;
  totalWagered: number;
  totalWon: number;
  netProfit: number;
  wins: number;
  losses: number;
  pushes: number;
  maxBet: number;
  targetProfit: number;
  stopLoss: number;
  isActive: boolean;
}

// Base Strategy class
export abstract class BettingStrategy {
  name: string;
  baseUnit: number;
  sequence: number[];
  totalWagered: number = 0;
  totalWon: number = 0;
  wins: number = 0;
  losses: number = 0;
  pushes: number = 0;
  maxBetReached: number = 0;
  targetProfit: number;
  stopLoss: number;
  isActive: boolean = true;

  constructor(baseUnit: number = 25, targetProfit: number = 100, stopLoss: number = 500) {
    this.name = 'Base Strategy';
    this.baseUnit = baseUnit;
    this.sequence = [baseUnit];
    this.targetProfit = targetProfit;
    this.stopLoss = stopLoss;
  }

  abstract getNextBet(): number;
  abstract processResult(result: BetResult): void;
  abstract reset(): void;

  get netProfit(): number {
    return this.totalWon - this.totalWagered;
  }

  get currentBet(): number {
    return this.getNextBet();
  }

  getState(): StrategyState {
    return {
      name: this.name,
      sequence: [...this.sequence],
      baseUnit: this.baseUnit,
      currentBet: this.getNextBet(),
      totalWagered: this.totalWagered,
      totalWon: this.totalWon,
      netProfit: this.netProfit,
      wins: this.wins,
      losses: this.losses,
      pushes: this.pushes,
      maxBet: this.maxBetReached,
      targetProfit: this.targetProfit,
      stopLoss: this.stopLoss,
      isActive: this.isActive
    };
  }

  checkLimits(): boolean {
    if (this.netProfit >= this.targetProfit) {
      this.isActive = false;
      return false;
    }
    if (this.netProfit <= -this.stopLoss) {
      this.isActive = false;
      return false;
    }
    return true;
  }
}

// Labouchere (Cancellation) Strategy
export class LabouchereStrategy extends BettingStrategy {
  originalSequence: number[];

  constructor(
    sequence: number[] = [25, 50, 100],
    targetProfit: number = 1500,
    stopLoss: number = 1000
  ) {
    super(sequence[0], targetProfit, stopLoss);
    this.name = 'Labouchere';
    this.sequence = [...sequence];
    this.originalSequence = [...sequence];
    this.baseUnit = Math.min(...sequence);
  }

  getNextBet(): number {
    if (this.sequence.length === 0) {
      return this.baseUnit;
    }
    if (this.sequence.length === 1) {
      return this.sequence[0];
    }
    const bet = this.sequence[0] + this.sequence[this.sequence.length - 1];
    this.maxBetReached = Math.max(this.maxBetReached, bet);
    return bet;
  }

  processResult(result: BetResult): void {
    this.totalWagered += result.amount;

    if (result.won) {
      this.wins++;
      this.totalWon += result.amount + result.payout;
      // Remove first and last numbers
      if (this.sequence.length >= 2) {
        this.sequence.shift();
        this.sequence.pop();
      } else if (this.sequence.length === 1) {
        this.sequence = [];
      }
      // If sequence is empty, cycle completed - reset
      if (this.sequence.length === 0) {
        this.sequence = [...this.originalSequence];
      }
    } else if (result.payout === 0) {
      // Push (tie when betting player/banker)
      this.pushes++;
      this.totalWon += result.amount; // Get bet back
    } else {
      this.losses++;
      // Add the lost amount to the end of the sequence
      this.sequence.push(result.amount);
    }

    this.checkLimits();
  }

  reset(): void {
    this.sequence = [...this.originalSequence];
    this.totalWagered = 0;
    this.totalWon = 0;
    this.wins = 0;
    this.losses = 0;
    this.pushes = 0;
    this.maxBetReached = 0;
    this.isActive = true;
  }
}

// Martingale Strategy
export class MartingaleStrategy extends BettingStrategy {
  currentMultiplier: number = 1;
  maxMultiplier: number;

  constructor(baseUnit: number = 25, maxMultiplier: number = 64, targetProfit: number = 100, stopLoss: number = 500) {
    super(baseUnit, targetProfit, stopLoss);
    this.name = 'Martingale';
    this.maxMultiplier = maxMultiplier;
  }

  getNextBet(): number {
    const bet = this.baseUnit * this.currentMultiplier;
    this.maxBetReached = Math.max(this.maxBetReached, bet);
    return bet;
  }

  processResult(result: BetResult): void {
    this.totalWagered += result.amount;

    if (result.won) {
      this.wins++;
      this.totalWon += result.amount + result.payout;
      this.currentMultiplier = 1; // Reset on win
    } else if (result.payout === 0) {
      this.pushes++;
      this.totalWon += result.amount;
    } else {
      this.losses++;
      // Double the bet, but cap at max multiplier
      this.currentMultiplier = Math.min(this.currentMultiplier * 2, this.maxMultiplier);
    }

    this.sequence = [this.getNextBet()];
    this.checkLimits();
  }

  reset(): void {
    this.currentMultiplier = 1;
    this.sequence = [this.baseUnit];
    this.totalWagered = 0;
    this.totalWon = 0;
    this.wins = 0;
    this.losses = 0;
    this.pushes = 0;
    this.maxBetReached = 0;
    this.isActive = true;
  }
}

// Fibonacci Strategy
export class FibonacciStrategy extends BettingStrategy {
  fibSequence: number[] = [1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144];
  currentIndex: number = 0;

  constructor(baseUnit: number = 25, targetProfit: number = 100, stopLoss: number = 500) {
    super(baseUnit, targetProfit, stopLoss);
    this.name = 'Fibonacci';
  }

  getNextBet(): number {
    const multiplier = this.fibSequence[Math.min(this.currentIndex, this.fibSequence.length - 1)];
    const bet = this.baseUnit * multiplier;
    this.maxBetReached = Math.max(this.maxBetReached, bet);
    return bet;
  }

  processResult(result: BetResult): void {
    this.totalWagered += result.amount;

    if (result.won) {
      this.wins++;
      this.totalWon += result.amount + result.payout;
      // Move back 2 steps in sequence
      this.currentIndex = Math.max(0, this.currentIndex - 2);
    } else if (result.payout === 0) {
      this.pushes++;
      this.totalWon += result.amount;
    } else {
      this.losses++;
      // Move forward 1 step in sequence
      this.currentIndex = Math.min(this.currentIndex + 1, this.fibSequence.length - 1);
    }

    this.sequence = [this.getNextBet()];
    this.checkLimits();
  }

  reset(): void {
    this.currentIndex = 0;
    this.sequence = [this.baseUnit];
    this.totalWagered = 0;
    this.totalWon = 0;
    this.wins = 0;
    this.losses = 0;
    this.pushes = 0;
    this.maxBetReached = 0;
    this.isActive = true;
  }
}

// Paroli (Reverse Martingale) Strategy
export class ParoliStrategy extends BettingStrategy {
  currentWinStreak: number = 0;
  maxWinStreak: number;

  constructor(baseUnit: number = 25, maxWinStreak: number = 3, targetProfit: number = 100, stopLoss: number = 500) {
    super(baseUnit, targetProfit, stopLoss);
    this.name = 'Paroli';
    this.maxWinStreak = maxWinStreak;
  }

  getNextBet(): number {
    const multiplier = Math.pow(2, this.currentWinStreak);
    const bet = this.baseUnit * multiplier;
    this.maxBetReached = Math.max(this.maxBetReached, bet);
    return bet;
  }

  processResult(result: BetResult): void {
    this.totalWagered += result.amount;

    if (result.won) {
      this.wins++;
      this.totalWon += result.amount + result.payout;
      this.currentWinStreak++;
      if (this.currentWinStreak >= this.maxWinStreak) {
        this.currentWinStreak = 0; // Reset after max streak
      }
    } else if (result.payout === 0) {
      this.pushes++;
      this.totalWon += result.amount;
    } else {
      this.losses++;
      this.currentWinStreak = 0;
    }

    this.sequence = [this.getNextBet()];
    this.checkLimits();
  }

  reset(): void {
    this.currentWinStreak = 0;
    this.sequence = [this.baseUnit];
    this.totalWagered = 0;
    this.totalWon = 0;
    this.wins = 0;
    this.losses = 0;
    this.pushes = 0;
    this.maxBetReached = 0;
    this.isActive = true;
  }
}

// 1-3-2-6 Strategy
export class OneTwoThreeSixStrategy extends BettingStrategy {
  betSequence: number[] = [1, 3, 2, 6];
  currentStep: number = 0;

  constructor(baseUnit: number = 25, targetProfit: number = 100, stopLoss: number = 500) {
    super(baseUnit, targetProfit, stopLoss);
    this.name = '1-3-2-6';
  }

  getNextBet(): number {
    const multiplier = this.betSequence[this.currentStep];
    const bet = this.baseUnit * multiplier;
    this.maxBetReached = Math.max(this.maxBetReached, bet);
    return bet;
  }

  processResult(result: BetResult): void {
    this.totalWagered += result.amount;

    if (result.won) {
      this.wins++;
      this.totalWon += result.amount + result.payout;
      this.currentStep++;
      if (this.currentStep >= this.betSequence.length) {
        this.currentStep = 0; // Completed cycle, restart
      }
    } else if (result.payout === 0) {
      this.pushes++;
      this.totalWon += result.amount;
    } else {
      this.losses++;
      this.currentStep = 0; // Reset on loss
    }

    this.sequence = [this.getNextBet()];
    this.checkLimits();
  }

  reset(): void {
    this.currentStep = 0;
    this.sequence = [this.baseUnit];
    this.totalWagered = 0;
    this.totalWon = 0;
    this.wins = 0;
    this.losses = 0;
    this.pushes = 0;
    this.maxBetReached = 0;
    this.isActive = true;
  }
}

// Oscar's Grind Strategy
export class OscarsGrindStrategy extends BettingStrategy {
  currentBetUnits: number = 1;
  sessionProfit: number = 0;

  constructor(baseUnit: number = 25, targetProfit: number = 100, stopLoss: number = 500) {
    super(baseUnit, targetProfit, stopLoss);
    this.name = "Oscar's Grind";
  }

  getNextBet(): number {
    const bet = this.baseUnit * this.currentBetUnits;
    this.maxBetReached = Math.max(this.maxBetReached, bet);
    return bet;
  }

  processResult(result: BetResult): void {
    this.totalWagered += result.amount;

    if (result.won) {
      this.wins++;
      this.totalWon += result.amount + result.payout;
      this.sessionProfit += result.payout;

      // If session profit is positive, increase bet by 1 unit
      // But never increase if we would exceed our target
      if (this.sessionProfit < this.baseUnit) {
        this.currentBetUnits++;
      } else {
        // Session complete, reset
        this.sessionProfit = 0;
        this.currentBetUnits = 1;
      }
    } else if (result.payout === 0) {
      this.pushes++;
      this.totalWon += result.amount;
    } else {
      this.losses++;
      this.sessionProfit -= result.amount;
      // Keep same bet after loss
    }

    this.sequence = [this.getNextBet()];
    this.checkLimits();
  }

  reset(): void {
    this.currentBetUnits = 1;
    this.sessionProfit = 0;
    this.sequence = [this.baseUnit];
    this.totalWagered = 0;
    this.totalWon = 0;
    this.wins = 0;
    this.losses = 0;
    this.pushes = 0;
    this.maxBetReached = 0;
    this.isActive = true;
  }
}

// Flat Betting Strategy (Control)
export class FlatBettingStrategy extends BettingStrategy {
  constructor(baseUnit: number = 25, targetProfit: number = 100, stopLoss: number = 500) {
    super(baseUnit, targetProfit, stopLoss);
    this.name = 'Flat Betting';
  }

  getNextBet(): number {
    this.maxBetReached = Math.max(this.maxBetReached, this.baseUnit);
    return this.baseUnit;
  }

  processResult(result: BetResult): void {
    this.totalWagered += result.amount;

    if (result.won) {
      this.wins++;
      this.totalWon += result.amount + result.payout;
    } else if (result.payout === 0) {
      this.pushes++;
      this.totalWon += result.amount;
    } else {
      this.losses++;
    }

    this.sequence = [this.baseUnit];
    this.checkLimits();
  }

  reset(): void {
    this.sequence = [this.baseUnit];
    this.totalWagered = 0;
    this.totalWon = 0;
    this.wins = 0;
    this.losses = 0;
    this.pushes = 0;
    this.maxBetReached = 0;
    this.isActive = true;
  }
}

// D'Alembert Strategy
export class DAlembertStrategy extends BettingStrategy {
  currentUnits: number = 1;

  constructor(baseUnit: number = 25, targetProfit: number = 100, stopLoss: number = 500) {
    super(baseUnit, targetProfit, stopLoss);
    this.name = "D'Alembert";
  }

  getNextBet(): number {
    const bet = this.baseUnit * this.currentUnits;
    this.maxBetReached = Math.max(this.maxBetReached, bet);
    return bet;
  }

  processResult(result: BetResult): void {
    this.totalWagered += result.amount;

    if (result.won) {
      this.wins++;
      this.totalWon += result.amount + result.payout;
      // Decrease bet by 1 unit on win (minimum 1)
      this.currentUnits = Math.max(1, this.currentUnits - 1);
    } else if (result.payout === 0) {
      this.pushes++;
      this.totalWon += result.amount;
    } else {
      this.losses++;
      // Increase bet by 1 unit on loss
      this.currentUnits++;
    }

    this.sequence = [this.getNextBet()];
    this.checkLimits();
  }

  reset(): void {
    this.currentUnits = 1;
    this.sequence = [this.baseUnit];
    this.totalWagered = 0;
    this.totalWon = 0;
    this.wins = 0;
    this.losses = 0;
    this.pushes = 0;
    this.maxBetReached = 0;
    this.isActive = true;
  }
}

// Factory function to create strategies
export type StrategyType =
  | 'labouchere'
  | 'martingale'
  | 'fibonacci'
  | 'paroli'
  | '1-3-2-6'
  | 'oscars-grind'
  | 'flat'
  | 'dalembert';

export function createStrategy(
  type: StrategyType,
  baseUnit: number = 25,
  targetProfit: number = 100,
  stopLoss: number = 500,
  labouchereSequence?: number[]
): BettingStrategy {
  switch (type) {
    case 'labouchere':
      return new LabouchereStrategy(labouchereSequence || [25, 50, 25, 50], targetProfit, stopLoss);
    case 'martingale':
      return new MartingaleStrategy(baseUnit, 64, targetProfit, stopLoss);
    case 'fibonacci':
      return new FibonacciStrategy(baseUnit, targetProfit, stopLoss);
    case 'paroli':
      return new ParoliStrategy(baseUnit, 3, targetProfit, stopLoss);
    case '1-3-2-6':
      return new OneTwoThreeSixStrategy(baseUnit, targetProfit, stopLoss);
    case 'oscars-grind':
      return new OscarsGrindStrategy(baseUnit, targetProfit, stopLoss);
    case 'flat':
      return new FlatBettingStrategy(baseUnit, targetProfit, stopLoss);
    case 'dalembert':
      return new DAlembertStrategy(baseUnit, targetProfit, stopLoss);
    default:
      return new FlatBettingStrategy(baseUnit, targetProfit, stopLoss);
  }
}

export const STRATEGY_DESCRIPTIONS: Record<StrategyType, { name: string; description: string; risk: 'Low' | 'Medium' | 'High' }> = {
  'labouchere': {
    name: 'Labouchere (Cancellation)',
    description: 'Bet sum of first and last numbers. Win: remove both. Lose: add amount to end.',
    risk: 'High'
  },
  'martingale': {
    name: 'Martingale',
    description: 'Double bet after each loss. Reset to base after win.',
    risk: 'High'
  },
  'fibonacci': {
    name: 'Fibonacci',
    description: 'Follow Fibonacci sequence. Move forward on loss, back 2 on win.',
    risk: 'Medium'
  },
  'paroli': {
    name: 'Paroli (Reverse Martingale)',
    description: 'Double bet after win up to 3 wins, then reset.',
    risk: 'Low'
  },
  '1-3-2-6': {
    name: '1-3-2-6',
    description: 'Follow 1-3-2-6 sequence on wins. Reset on any loss.',
    risk: 'Low'
  },
  'oscars-grind': {
    name: "Oscar's Grind",
    description: 'Increase by 1 unit after win. Goal: 1 unit profit per session.',
    risk: 'Low'
  },
  'flat': {
    name: 'Flat Betting',
    description: 'Same bet amount every hand. Control strategy.',
    risk: 'Low'
  },
  'dalembert': {
    name: "D'Alembert",
    description: 'Increase by 1 unit after loss, decrease by 1 after win.',
    risk: 'Medium'
  }
};
