import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { HOUSE_EDGE, PROBABILITIES } from '../engine/baccarat';

export function Statistics() {
  const sessionStats = useGameStore((state) => state.sessionStats);
  const strategyState = useGameStore((state) => state.strategyState);
  const bankroll = useGameStore((state) => state.bankroll);
  const initialBankroll = useGameStore((state) => state.initialBankroll);
  const betType = useGameStore((state) => state.betType);

  // State for comp calculator
  const [hoursPlayed, setHoursPlayed] = useState('2');
  const [compRate, setCompRate] = useState('30');

  const profit = bankroll - initialBankroll;
  const totalBets = sessionStats.handsPlayed;
  const winRate = totalBets > 0
    ? ((strategyState?.wins || 0) / totalBets * 100).toFixed(1)
    : '0.0';

  // Comp calculations
  const totalWagered = strategyState?.totalWagered || 0;
  const avgBet = totalBets > 0 ? totalWagered / totalBets : 0;
  const houseEdgeDecimal = HOUSE_EDGE[betType] / 100;
  const theoreticalLoss = totalWagered * houseEdgeDecimal;

  // For projecting based on hours (assuming ~70 hands/hour for baccarat)
  const handsPerHour = 70;
  const hours = parseFloat(hoursPlayed) || 0;
  const projectedHands = hours * handsPerHour;
  const projectedWagered = avgBet * projectedHands;
  const projectedTheoLoss = projectedWagered * houseEdgeDecimal;

  // Comp estimates
  const compRateDecimal = (parseFloat(compRate) || 0) / 100;
  const estimatedComps = theoreticalLoss * compRateDecimal;
  const projectedComps = projectedTheoLoss * compRateDecimal;

  const bankerPercent = sessionStats.handsPlayed > 0
    ? ((sessionStats.bankerWins / sessionStats.handsPlayed) * 100).toFixed(1)
    : '0.0';
  const playerPercent = sessionStats.handsPlayed > 0
    ? ((sessionStats.playerWins / sessionStats.handsPlayed) * 100).toFixed(1)
    : '0.0';
  const tiePercent = sessionStats.handsPlayed > 0
    ? ((sessionStats.ties / sessionStats.handsPlayed) * 100).toFixed(1)
    : '0.0';

  // Expected house edge for current bet type
  const expectedHouseEdge = HOUSE_EDGE[betType];

  return (
    <div className="space-y-4">
      {/* Session Stats */}
      <div className="bg-slate-800 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Session Statistics</h2>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-900/50 rounded-lg p-4">
            <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Total Wagered</div>
            <div className="text-2xl font-bold text-white">
              ${strategyState?.totalWagered.toLocaleString() || 0}
            </div>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-4">
            <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Net Profit</div>
            <div className={`text-2xl font-bold ${profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {profit >= 0 ? '+' : ''}${profit.toLocaleString()}
            </div>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-4">
            <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Win Rate</div>
            <div className="text-2xl font-bold text-white">{winRate}%</div>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-4">
            <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Max Bet Reached</div>
            <div className="text-2xl font-bold text-white">
              ${strategyState?.maxBet.toLocaleString() || 0}
            </div>
          </div>
        </div>
      </div>

      {/* Theoretical Loss & Comp Calculator */}
      <div className="bg-gradient-to-br from-purple-900/30 to-slate-800 rounded-xl p-6 border border-purple-500/20">
        <h2 className="text-lg font-semibold text-purple-400 mb-4">Theoretical Loss & Comps</h2>

        {/* Theoretical Loss from Session */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-slate-900/50 rounded-lg p-4">
            <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Total Wagered</div>
            <div className="text-xl font-bold text-white">${totalWagered.toLocaleString()}</div>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-4">
            <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Average Bet</div>
            <div className="text-xl font-bold text-white">${avgBet.toFixed(0)}</div>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-4">
            <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Theoretical Loss</div>
            <div className="text-xl font-bold text-red-400">${theoreticalLoss.toFixed(2)}</div>
            <div className="text-xs text-slate-500 mt-1">Based on {betType} ({HOUSE_EDGE[betType]}% edge)</div>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-4">
            <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Estimated Comps</div>
            <div className="text-xl font-bold text-green-400">${estimatedComps.toFixed(2)}</div>
            <div className="text-xs text-slate-500 mt-1">At {compRate}% comp rate</div>
          </div>
        </div>

        {/* Comp Rate & Hours Adjustment */}
        <div className="bg-slate-900/50 rounded-lg p-4 mb-4">
          <div className="text-sm text-slate-400 mb-3">Projection Settings</div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-500 mb-1">Hours at Table</label>
              <input
                type="text"
                inputMode="decimal"
                value={hoursPlayed}
                onChange={(e) => setHoursPlayed(e.target.value.replace(/[^0-9.]/g, ''))}
                className="w-full bg-slate-800 rounded-lg px-3 py-2 text-white text-sm border border-slate-600 focus:border-purple-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Comp Rate %</label>
              <select
                value={compRate}
                onChange={(e) => setCompRate(e.target.value)}
                className="w-full bg-slate-800 rounded-lg px-3 py-2 text-white text-sm border border-slate-600 focus:border-purple-500 focus:outline-none"
              >
                <option value="15">15% (Tight)</option>
                <option value="20">20% (Standard)</option>
                <option value="25">25% (Good)</option>
                <option value="30">30% (Great)</option>
                <option value="40">40% (VIP)</option>
                <option value="50">50% (High Roller)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Projected Values */}
        {avgBet > 0 && hours > 0 && (
          <div className="bg-slate-900/50 rounded-lg p-4">
            <div className="text-sm text-slate-400 mb-3">Projected for {hours} Hours (~{handsPerHour} hands/hr)</div>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <div className="text-xs text-slate-500">Est. Hands</div>
                <div className="text-lg font-bold text-white">{Math.round(projectedHands)}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500">Theo Loss</div>
                <div className="text-lg font-bold text-red-400">${projectedTheoLoss.toFixed(0)}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500">Est. Comps</div>
                <div className="text-lg font-bold text-green-400">${projectedComps.toFixed(0)}</div>
              </div>
            </div>
          </div>
        )}

        {/* Comp Reference */}
        <div className="mt-4 p-3 bg-slate-900/30 rounded-lg text-xs text-slate-500">
          <div className="font-medium text-slate-400 mb-1">How Casinos Calculate Comps:</div>
          <div>Theo Loss = Average Bet × Hands × House Edge</div>
          <div>Comps = Theo Loss × Comp Rate (typically 20-40%)</div>
        </div>
      </div>

      {/* Outcome Distribution */}
      <div className="bg-slate-800 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Outcome Distribution</h2>

        {/* Actual vs Expected */}
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-red-400 font-medium">Banker</span>
              <span className="text-sm text-slate-400">
                {sessionStats.bankerWins} ({bankerPercent}%)
                <span className="text-slate-500"> / Expected: {PROBABILITIES.banker}%</span>
              </span>
            </div>
            <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-red-500 transition-all duration-500"
                style={{ width: `${bankerPercent}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-blue-400 font-medium">Player</span>
              <span className="text-sm text-slate-400">
                {sessionStats.playerWins} ({playerPercent}%)
                <span className="text-slate-500"> / Expected: {PROBABILITIES.player}%</span>
              </span>
            </div>
            <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 transition-all duration-500"
                style={{ width: `${playerPercent}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-green-400 font-medium">Tie</span>
              <span className="text-sm text-slate-400">
                {sessionStats.ties} ({tiePercent}%)
                <span className="text-slate-500"> / Expected: {PROBABILITIES.tie}%</span>
              </span>
            </div>
            <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 transition-all duration-500"
                style={{ width: `${tiePercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* House Edge Info */}
      <div className="bg-slate-800 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">House Edge Analysis</h2>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className={`p-4 rounded-lg ${betType === 'player' ? 'bg-blue-500/20 ring-2 ring-blue-500' : 'bg-slate-900/50'}`}>
            <div className="text-xs text-slate-400 uppercase mb-1">Player</div>
            <div className="text-xl font-bold text-blue-400">{HOUSE_EDGE.player}%</div>
            <div className="text-xs text-slate-500 mt-1">1:1 payout</div>
          </div>
          <div className={`p-4 rounded-lg ${betType === 'banker' ? 'bg-red-500/20 ring-2 ring-red-500' : 'bg-slate-900/50'}`}>
            <div className="text-xs text-slate-400 uppercase mb-1">Banker</div>
            <div className="text-xl font-bold text-red-400">{HOUSE_EDGE.banker}%</div>
            <div className="text-xs text-slate-500 mt-1">0.95:1 payout</div>
          </div>
          <div className={`p-4 rounded-lg ${betType === 'tie' ? 'bg-green-500/20 ring-2 ring-green-500' : 'bg-slate-900/50'}`}>
            <div className="text-xs text-slate-400 uppercase mb-1">Tie</div>
            <div className="text-xl font-bold text-green-400">{HOUSE_EDGE.tie}%</div>
            <div className="text-xs text-slate-500 mt-1">8:1 payout</div>
          </div>
        </div>

        <div className="mt-4 p-3 bg-slate-900/50 rounded-lg">
          <div className="text-xs text-slate-400 mb-1">Current Bet: {betType.charAt(0).toUpperCase() + betType.slice(1)}</div>
          <div className="text-sm text-slate-300">
            Expected loss per $100 wagered: <span className="text-amber-400 font-medium">${expectedHouseEdge.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Streak Info */}
      <div className="bg-slate-800 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Streaks</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-900/50 rounded-lg p-4">
            <div className="text-xs text-slate-400 uppercase mb-1">Longest Banker Streak</div>
            <div className="text-2xl font-bold text-red-400">
              {sessionStats.longestBankerStreak}
            </div>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-4">
            <div className="text-xs text-slate-400 uppercase mb-1">Longest Player Streak</div>
            <div className="text-2xl font-bold text-blue-400">
              {sessionStats.longestPlayerStreak}
            </div>
          </div>
        </div>
        {sessionStats.currentStreak.type && (
          <div className="mt-4 p-3 bg-slate-900/50 rounded-lg text-center">
            <span className="text-slate-400">Current Streak: </span>
            <span className={`font-bold ${
              sessionStats.currentStreak.type === 'banker' ? 'text-red-400' :
              sessionStats.currentStreak.type === 'player' ? 'text-blue-400' : 'text-green-400'
            }`}>
              {sessionStats.currentStreak.count} {sessionStats.currentStreak.type.charAt(0).toUpperCase() + sessionStats.currentStreak.type.slice(1)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
