import { useMemo } from 'react';
import { useGameStore } from '../store/gameStore';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

export function BetHistory() {
  const sessionStats = useGameStore((state) => state.sessionStats);
  const initialBankroll = useGameStore((state) => state.initialBankroll);
  const strategyState = useGameStore((state) => state.strategyState);

  // Memoize chart data to prevent unnecessary recalculations
  const chartData = useMemo(() => {
    const data = sessionStats.betHistory.map((bet, idx) => ({
      hand: idx + 1,
      balance: bet.balance,
      profit: bet.balance - initialBankroll
    }));

    // Add starting point
    if (data.length > 0) {
      data.unshift({ hand: 0, balance: initialBankroll, profit: 0 });
    }

    return data;
  }, [sessionStats.betHistory, initialBankroll]);

  // Memoize reversed history
  const reversedHistory = useMemo(() => {
    return [...sessionStats.betHistory].reverse();
  }, [sessionStats.betHistory]);

  const getResultColor = (result: string) => {
    switch (result) {
      case 'banker': return 'text-red-400';
      case 'player': return 'text-blue-400';
      case 'tie': return 'text-green-400';
      default: return 'text-slate-400';
    }
  };

  const getPayoutColor = (payout: number) => {
    if (payout > 0) return 'text-green-400';
    if (payout < 0) return 'text-red-400';
    return 'text-slate-400';
  };

  return (
    <div className="space-y-4">
      {/* Profit Chart */}
      <div className="bg-slate-800 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Bankroll Chart</h2>
        {chartData.length > 1 ? (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis
                  dataKey="hand"
                  stroke="#64748b"
                  fontSize={12}
                />
                <YAxis
                  stroke="#64748b"
                  fontSize={12}
                  tickFormatter={(value) => `$${value.toLocaleString()}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '8px'
                  }}
                  labelStyle={{ color: '#94a3b8' }}
                  formatter={(value) => [`$${(value as number).toLocaleString()}`, 'Balance']}
                />
                <ReferenceLine y={initialBankroll} stroke="#f59e0b" strokeDasharray="5 5" />
                <Line
                  type="monotone"
                  dataKey="balance"
                  stroke="#22c55e"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center text-slate-500">
            Play some hands to see the chart
          </div>
        )}
      </div>

      {/* Sequence Progression */}
      {strategyState && strategyState.name === 'Labouchere' && (
        <div className="bg-slate-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Labouchere Sequence</h2>
          <div className="flex flex-wrap gap-2">
            {strategyState.sequence.map((num, idx) => (
              <div
                key={idx}
                className={`px-3 py-2 rounded-lg font-mono font-bold ${
                  idx === 0 || idx === strategyState.sequence.length - 1
                    ? 'bg-amber-500/30 text-amber-400 ring-2 ring-amber-500'
                    : 'bg-slate-700 text-slate-300'
                }`}
              >
                {num}
              </div>
            ))}
          </div>
          <div className="mt-3 text-sm text-slate-400">
            Next bet: <span className="text-amber-400 font-bold">${strategyState.currentBet}</span>
            {strategyState.sequence.length >= 2 && (
              <span className="text-slate-500"> ({strategyState.sequence[0]} + {strategyState.sequence[strategyState.sequence.length - 1]})</span>
            )}
          </div>
        </div>
      )}

      {/* Bet History Table */}
      <div className="bg-slate-800 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Bet History</h2>
        {sessionStats.betHistory.length > 0 ? (
          <div className="max-h-80 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-slate-800">
                <tr className="text-slate-400 text-left">
                  <th className="pb-3 font-medium">#</th>
                  <th className="pb-3 font-medium">Result</th>
                  <th className="pb-3 font-medium">Bet On</th>
                  <th className="pb-3 font-medium text-right">Amount</th>
                  <th className="pb-3 font-medium text-right">Payout</th>
                  <th className="pb-3 font-medium text-right">Balance</th>
                </tr>
              </thead>
              <tbody>
                {reversedHistory.map((bet) => (
                  <tr key={`bet-${bet.hand}`} className="border-t border-slate-700">
                    <td className="py-2 text-slate-500">{bet.hand}</td>
                    <td className={`py-2 font-medium ${getResultColor(bet.result)}`}>
                      {bet.result.charAt(0).toUpperCase() + bet.result.slice(1)}
                    </td>
                    <td className={`py-2 ${getResultColor(bet.betType)}`}>
                      {bet.betType.charAt(0).toUpperCase() + bet.betType.slice(1)}
                    </td>
                    <td className="py-2 text-right text-slate-300">${bet.betAmount}</td>
                    <td className={`py-2 text-right font-medium ${getPayoutColor(bet.payout)}`}>
                      {bet.payout >= 0 ? '+' : ''}{bet.payout.toFixed(2)}
                    </td>
                    <td className="py-2 text-right text-white font-medium">
                      ${bet.balance.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-slate-500">
            No bets placed yet. Start playing to see history.
          </div>
        )}
      </div>
    </div>
  );
}
