import { useGameStore } from '../store/gameStore';
import { HOUSE_EDGE, PROBABILITIES } from '../engine/baccarat';

export function Statistics() {
  const { sessionStats, strategyState, bankroll, initialBankroll, betType } = useGameStore();

  const profit = bankroll - initialBankroll;
  const totalBets = sessionStats.handsPlayed;
  const winRate = totalBets > 0
    ? ((strategyState?.wins || 0) / totalBets * 100).toFixed(1)
    : '0.0';

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
