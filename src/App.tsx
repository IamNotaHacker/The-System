import { useEffect, useState } from 'react';
import { useGameStore } from './store/gameStore';
import { Header } from './components/Header';
import { StrategyPanel } from './components/StrategyPanel';
import { Scoreboard } from './components/Scoreboard';
import { GameControls } from './components/GameControls';
import { Statistics } from './components/Statistics';
import { BetHistory } from './components/BetHistory';
import { ShoeImport } from './components/ShoeImport';
import { Settings } from './components/Settings';

type Tab = 'scoreboard' | 'statistics' | 'history';

function App() {
  const { shoeResults, generateNewShoe, initializeStrategy } = useGameStore();
  const [activeTab, setActiveTab] = useState<Tab>('scoreboard');

  // Initialize on mount
  useEffect(() => {
    if (shoeResults.length === 0) {
      generateNewShoe(80);
    }
    initializeStrategy();
  }, []);

  const tabs: { id: Tab; label: string }[] = [
    { id: 'scoreboard', label: 'Scoreboard' },
    { id: 'statistics', label: 'Statistics' },
    { id: 'history', label: 'Bet History' }
  ];

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      <Header />

      <main className="flex-1 p-6">
        <div className="max-w-[1800px] mx-auto grid grid-cols-12 gap-6">
          {/* Left Sidebar - Strategy Panel */}
          <div className="col-span-3">
            <StrategyPanel />
          </div>

          {/* Main Content Area */}
          <div className="col-span-6 space-y-6">
            {/* Game Controls */}
            <GameControls />

            {/* Tabs */}
            <div className="bg-slate-800 rounded-xl overflow-hidden">
              <div className="flex border-b border-slate-700">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'bg-slate-700 text-white'
                        : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              <div className="p-6">
                {activeTab === 'scoreboard' && <Scoreboard />}
                {activeTab === 'statistics' && <Statistics />}
                {activeTab === 'history' && <BetHistory />}
              </div>
            </div>
          </div>

          {/* Right Sidebar - Quick Stats & Info */}
          <div className="col-span-3 space-y-4">
            <QuickStats />
            <HouseEdgeInfo />
            <StrategyTips />
          </div>
        </div>
      </main>

      {/* Modals */}
      <ShoeImport />
      <Settings />
    </div>
  );
}

function QuickStats() {
  const { sessionStats, bankroll, initialBankroll, strategyState } = useGameStore();

  const profit = bankroll - initialBankroll;

  return (
    <div className="bg-slate-800 rounded-xl p-4">
      <h3 className="text-sm font-medium text-slate-400 mb-3">Quick Stats</h3>
      <div className="space-y-3">
        <div className="flex justify-between">
          <span className="text-sm text-slate-500">Session P/L</span>
          <span className={`font-semibold ${profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {profit >= 0 ? '+' : ''}${profit.toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-slate-500">Win Rate</span>
          <span className="font-semibold text-white">
            {sessionStats.handsPlayed > 0
              ? ((strategyState?.wins || 0) / sessionStats.handsPlayed * 100).toFixed(1)
              : '0.0'}%
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-slate-500">Hands Played</span>
          <span className="font-semibold text-white">{sessionStats.handsPlayed}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-slate-500">Next Bet</span>
          <span className="font-semibold text-amber-400">${strategyState?.currentBet || 0}</span>
        </div>
      </div>
    </div>
  );
}

function HouseEdgeInfo() {
  const { betType } = useGameStore();

  const edges = {
    player: { edge: 1.24, desc: 'No commission, slightly higher edge' },
    banker: { edge: 1.06, desc: '5% commission on wins, lowest edge' },
    tie: { edge: 14.36, desc: 'High payout (8:1) but poor odds' }
  };

  return (
    <div className="bg-slate-800 rounded-xl p-4">
      <h3 className="text-sm font-medium text-slate-400 mb-3">House Edge</h3>
      <div className={`p-3 rounded-lg ${
        betType === 'player' ? 'bg-blue-500/20' :
        betType === 'banker' ? 'bg-red-500/20' : 'bg-green-500/20'
      }`}>
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium text-white capitalize">{betType} Bet</span>
          <span className={`font-bold ${
            betType === 'player' ? 'text-blue-400' :
            betType === 'banker' ? 'text-red-400' : 'text-green-400'
          }`}>
            {edges[betType].edge}%
          </span>
        </div>
        <p className="text-xs text-slate-400">{edges[betType].desc}</p>
      </div>
    </div>
  );
}

function StrategyTips() {
  const { strategyType } = useGameStore();

  const tips: Record<string, string[]> = {
    'labouchere': [
      'Sequence resets when all numbers are crossed off',
      'Long losing streaks can rapidly increase bet size',
      'Consider using a conservative starting sequence'
    ],
    'martingale': [
      'Doubles bet after each loss',
      'Table limits can prevent recovery',
      'Works best with high bankroll relative to base bet'
    ],
    'fibonacci': [
      'Less aggressive than Martingale',
      'Move back 2 steps on win, forward 1 on loss',
      'Requires about 3 wins for every 4 losses to profit'
    ],
    'paroli': [
      'Capitalizes on winning streaks',
      'Limited downside risk',
      'Resets after 3 consecutive wins'
    ],
    '1-3-2-6': [
      'Designed to maximize winning streaks',
      'Only 2 units at risk per cycle',
      'Full cycle yields 12 units profit'
    ],
    'oscars-grind': [
      'Conservative progression',
      'Goal: 1 unit profit per session',
      'Only increases bet after a win'
    ],
    'flat': [
      'No progression - same bet every hand',
      'Good for tracking actual results',
      'Lower variance, lower risk'
    ],
    'dalembert': [
      'Increase by 1 unit on loss, decrease on win',
      'Gentler than Martingale',
      'Assumes wins and losses will balance'
    ]
  };

  return (
    <div className="bg-slate-800 rounded-xl p-4">
      <h3 className="text-sm font-medium text-slate-400 mb-3">Strategy Tips</h3>
      <ul className="space-y-2">
        {(tips[strategyType] || tips['flat']).map((tip, idx) => (
          <li key={idx} className="flex gap-2 text-xs text-slate-300">
            <span className="text-amber-500">•</span>
            {tip}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
