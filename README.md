# The System

**Master the sequence.**

A professional strategy simulator with multiple progression systems, real-time tracking, and statistical analysis. Set your bankroll, define your targets, and execute with precision.

---

## Features

### 8 Betting Strategies
- **Labouchere (Cancellation)** - The classic sequence system. Bet the sum of first + last numbers. Win = cross off both. Lose = add to end.
- **Martingale** - Double after each loss, reset on win.
- **Fibonacci** - Follow the Fibonacci sequence progression.
- **Paroli (Reverse Martingale)** - Capitalize on winning streaks.
- **1-3-2-6 System** - Fixed progression for controlled risk.
- **Oscar's Grind** - Conservative system targeting 1 unit profit per session.
- **D'Alembert** - Increase by 1 unit on loss, decrease on win.
- **Flat Betting** - Control strategy with no progression.

### Real-Time Tracking
- Live bankroll updates
- Profit/Loss tracking with percentage
- Win rate statistics
- Maximum bet reached
- Session history with full bet log

### Visual Scoreboards
- **Bead Plate** - Grid view of all results
- **Big Road** - Traditional column-based scoreboard
- **Result Strip** - Linear view with position tracking

### Bankroll Management
- Set starting bankroll
- Define target profit (auto-stop when reached)
- Set stop loss limits
- Track total wagered

### Data Import/Export
- Import real shoe data (B/P/T format)
- Generate random shoes using accurate probabilities
- Export results for later analysis

### Advanced Statistics
- Outcome distribution (Banker/Player/Tie %)
- Expected vs actual percentages
- Streak tracking (longest runs)
- House edge analysis per bet type

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/IamNotaHacker/The-System.git

# Navigate to project directory
cd The-System

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for Production

```bash
npm run build
```

---

## How to Use

### 1. Set Your Bankroll
Click the **Settings** (gear icon) to configure:
- Starting bankroll
- Base unit size
- Target profit
- Stop loss limit

### 2. Choose Your Strategy
Select from 8 different betting strategies in the left panel. Each shows risk level (Low/Medium/High).

### 3. Select Bet Type
Choose **Player**, **Banker**, or **Tie** for your bets.

### 4. Load Shoe Data
- Click **Upload** icon to import real shoe data
- Or click **Generate** for a random shoe (80 hands)
- Paste results in B/P/T format (e.g., `BBPBPPBBTBPPB`)

### 5. Run the Simulation
- **Play** - Auto-run through the shoe
- **Step Forward** - One hand at a time
- **Step Back** - Undo last hand
- Adjust speed from Slow (1s) to Turbo (0.05s)

### 6. Analyze Results
- View the **Statistics** tab for detailed breakdown
- Check **Bet History** for the bankroll chart and full log
- Watch the sequence update in real-time

---

## The Labouchere System Explained

The Labouchere (Cancellation) system is a negative progression betting strategy.

### Setup
Start with a sequence of numbers that sum to your desired profit:
```
25 - 50 - 100  (sum = $175 target)
```

### How It Works

| Outcome | Action |
|---------|--------|
| **WIN** | Cross off FIRST and LAST numbers |
| **LOSE** | Add the lost amount to the END |

### Example Session

Starting sequence: `25 - 50 - 100`

| Bet # | Calculation | Bet Amount | Result | New Sequence |
|-------|-------------|------------|--------|--------------|
| 1 | 25 + 100 | $125 | WIN | 50 |
| 2 | 50 | $50 | WIN | Complete! |

**Profit: $175** (the original sum)

### After a Losing Streak

| Bet # | Calculation | Bet Amount | Result | New Sequence |
|-------|-------------|------------|--------|--------------|
| 1 | 25 + 100 | $125 | LOSE | 25-50-100-125 |
| 2 | 25 + 125 | $150 | LOSE | 25-50-100-125-150 |
| 3 | 25 + 150 | $175 | WIN | 50-100-125 |
| 4 | 50 + 125 | $175 | WIN | 100 |
| 5 | 100 | $100 | WIN | Complete! |

---

## Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Zustand** - State management
- **Recharts** - Charts and graphs
- **Lucide React** - Icons

---

## House Edge Reference

| Bet Type | House Edge | Payout |
|----------|------------|--------|
| Banker | 1.06% | 0.95:1 (5% commission) |
| Player | 1.24% | 1:1 |
| Tie | 14.36% | 8:1 |

---

## License

MIT License - feel free to use and modify.

---

## Disclaimer

This software is for educational and simulation purposes only. Past results do not guarantee future outcomes. Always gamble responsibly.
