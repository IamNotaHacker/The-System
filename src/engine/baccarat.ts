// Baccarat Game Engine - Accurate casino rules

export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
export type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';

export interface Card {
  suit: Suit;
  rank: Rank;
  value: number;
}

export type BetType = 'player' | 'banker' | 'tie';
export type HandResult = 'player' | 'banker' | 'tie';

export interface Hand {
  cards: Card[];
  total: number;
  natural: boolean;
}

export interface GameResult {
  playerHand: Hand;
  bankerHand: Hand;
  winner: HandResult;
  playerThirdCard: Card | null;
  bankerThirdCard: Card | null;
}

// Card values in baccarat
function getCardValue(rank: Rank): number {
  if (['10', 'J', 'Q', 'K'].includes(rank)) return 0;
  if (rank === 'A') return 1;
  return parseInt(rank);
}

// Create a standard 52-card deck
function createDeck(): Card[] {
  const suits: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];
  const ranks: Rank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  const deck: Card[] = [];

  for (const suit of suits) {
    for (const rank of ranks) {
      deck.push({ suit, rank, value: getCardValue(rank) });
    }
  }
  return deck;
}

// Create a shoe with multiple decks (usually 8 decks in baccarat)
export function createShoe(numDecks: number = 8): Card[] {
  const shoe: Card[] = [];
  for (let i = 0; i < numDecks; i++) {
    shoe.push(...createDeck());
  }
  return shuffleArray(shoe);
}

// Fisher-Yates shuffle
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Calculate hand total (baccarat style - only ones digit)
export function calculateHandTotal(cards: Card[]): number {
  const sum = cards.reduce((acc, card) => acc + card.value, 0);
  return sum % 10;
}

// Check if hand is a natural (8 or 9 with two cards)
function isNatural(total: number, cardCount: number): boolean {
  return cardCount === 2 && (total === 8 || total === 9);
}

// Determine if Player draws third card
function playerDrawsThird(playerTotal: number): boolean {
  return playerTotal <= 5;
}

// Determine if Banker draws third card based on Banker's total and Player's third card
function bankerDrawsThird(bankerTotal: number, playerThirdCard: Card | null): boolean {
  // If player didn't draw, banker draws on 0-5
  if (!playerThirdCard) {
    return bankerTotal <= 5;
  }

  const p3 = playerThirdCard.value;

  // Banker drawing rules based on their total and player's third card value
  switch (bankerTotal) {
    case 0:
    case 1:
    case 2:
      return true;
    case 3:
      return p3 !== 8;
    case 4:
      return p3 >= 2 && p3 <= 7;
    case 5:
      return p3 >= 4 && p3 <= 7;
    case 6:
      return p3 === 6 || p3 === 7;
    default:
      return false;
  }
}

// Play a single hand of baccarat
export function playHand(shoe: Card[]): { result: GameResult; remainingShoe: Card[] } {
  const cards = [...shoe];

  // Deal initial cards (Player, Banker, Player, Banker)
  const playerCards: Card[] = [cards.shift()!, cards.shift()!];
  const bankerCards: Card[] = [cards.shift()!, cards.shift()!];

  // Swap to correct dealing order
  [playerCards[1], bankerCards[0]] = [bankerCards[0], playerCards[1]];

  let playerThirdCard: Card | null = null;
  let bankerThirdCard: Card | null = null;

  const playerTotal = calculateHandTotal(playerCards);
  const bankerTotal = calculateHandTotal(bankerCards);

  const playerNatural = isNatural(playerTotal, 2);
  const bankerNatural = isNatural(bankerTotal, 2);

  // No third cards if either has a natural
  if (!playerNatural && !bankerNatural) {
    // Player's third card rule
    if (playerDrawsThird(playerTotal)) {
      playerThirdCard = cards.shift()!;
      playerCards.push(playerThirdCard);
    }

    // Banker's third card rule
    if (bankerDrawsThird(bankerTotal, playerThirdCard)) {
      bankerThirdCard = cards.shift()!;
      bankerCards.push(bankerThirdCard);
    }
  }

  const finalPlayerTotal = calculateHandTotal(playerCards);
  const finalBankerTotal = calculateHandTotal(bankerCards);

  let winner: HandResult;
  if (finalPlayerTotal > finalBankerTotal) {
    winner = 'player';
  } else if (finalBankerTotal > finalPlayerTotal) {
    winner = 'banker';
  } else {
    winner = 'tie';
  }

  return {
    result: {
      playerHand: {
        cards: playerCards,
        total: finalPlayerTotal,
        natural: playerNatural
      },
      bankerHand: {
        cards: bankerCards,
        total: finalBankerTotal,
        natural: bankerNatural
      },
      winner,
      playerThirdCard,
      bankerThirdCard
    },
    remainingShoe: cards
  };
}

// Calculate payout based on bet type and result
export function calculatePayout(
  betType: BetType,
  betAmount: number,
  result: HandResult
): number {
  if (betType === result) {
    if (result === 'tie') {
      return betAmount * 8; // Tie pays 8:1
    } else if (result === 'banker') {
      return betAmount * 0.95; // Banker wins pay 0.95:1 (5% commission)
    } else {
      return betAmount; // Player wins pay 1:1
    }
  } else if (betType !== 'tie' && result === 'tie') {
    return 0; // Push on tie (get bet back, net 0)
  }
  return -betAmount; // Loss
}

// House edge percentages
export const HOUSE_EDGE = {
  banker: 1.06,
  player: 1.24,
  tie: 14.36
};

// Probability of outcomes (8 deck)
export const PROBABILITIES = {
  banker: 45.86,
  player: 44.62,
  tie: 9.52
};

// Parse shoe data from text (B/P format)
export function parseShoeData(data: string): HandResult[] {
  const results: HandResult[] = [];
  const cleaned = data.toUpperCase().replace(/[^BPT]/g, '');

  for (const char of cleaned) {
    if (char === 'B') results.push('banker');
    else if (char === 'P') results.push('player');
    else if (char === 'T') results.push('tie');
  }

  return results;
}

// Generate random shoe results (for simulation)
export function generateRandomShoe(hands: number = 80): HandResult[] {
  const results: HandResult[] = [];
  for (let i = 0; i < hands; i++) {
    const rand = Math.random() * 100;
    if (rand < PROBABILITIES.banker) {
      results.push('banker');
    } else if (rand < PROBABILITIES.banker + PROBABILITIES.player) {
      results.push('player');
    } else {
      results.push('tie');
    }
  }
  return results;
}

// Card display helper
export function getCardDisplay(card: Card): string {
  const suitSymbols: Record<Suit, string> = {
    hearts: '♥',
    diamonds: '♦',
    clubs: '♣',
    spades: '♠'
  };
  return `${card.rank}${suitSymbols[card.suit]}`;
}

export function getSuitColor(suit: Suit): string {
  return suit === 'hearts' || suit === 'diamonds' ? 'text-red-500' : 'text-slate-900';
}
