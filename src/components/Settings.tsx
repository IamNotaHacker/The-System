import { useState } from 'react';
import { X } from 'lucide-react';
import { useGameStore } from '../store/gameStore';

export function Settings() {
  const {
    showSettings,
    toggleSettings,
    initialBankroll,
    setBankroll,
    baseUnit,
    setBaseUnit,
    targetProfit,
    setTargetProfit,
    stopLoss,
    setStopLoss,
    initializeStrategy,
    resetSession
  } = useGameStore();

  const [tempBankroll, setTempBankroll] = useState(initialBankroll || 6000);
  const [tempBaseUnit, setTempBaseUnit] = useState(baseUnit || 25);
  const [tempTarget, setTempTarget] = useState(targetProfit || 1500);
  const [tempStopLoss, setTempStopLoss] = useState(stopLoss || 1000);
  const [labSequence, setLabSequence] = useState('25, 50, 100');

  if (!showSettings) return null;

  const handleSave = () => {
    setBankroll(tempBankroll);
    setBaseUnit(tempBaseUnit);
    setTargetProfit(tempTarget);
    setStopLoss(tempStopLoss);

    // Parse Labouchere sequence
    const sequence = labSequence
      .split(',')
      .map(s => parseInt(s.trim()))
      .filter(n => !isNaN(n) && n > 0);

    initializeStrategy(sequence.length > 0 ? sequence : undefined);
    resetSession();
    toggleSettings();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-xl w-full max-w-lg mx-4 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <h2 className="text-lg font-semibold text-white">Settings</h2>
          <button
            onClick={toggleSettings}
            className="p-2 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Bankroll Settings */}
          <div>
            <h3 className="text-sm font-medium text-slate-300 mb-3">Bankroll Settings</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-400 mb-2">Starting Bankroll ($)</label>
                <input
                  type="number"
                  value={tempBankroll}
                  onChange={(e) => setTempBankroll(Math.max(100, parseInt(e.target.value) || 100))}
                  className="w-full bg-slate-900 rounded-lg px-4 py-2 text-white border border-slate-700 focus:border-amber-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-2">Base Unit ($)</label>
                <input
                  type="number"
                  value={tempBaseUnit}
                  onChange={(e) => setTempBaseUnit(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full bg-slate-900 rounded-lg px-4 py-2 text-white border border-slate-700 focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Strategy Limits */}
          <div>
            <h3 className="text-sm font-medium text-slate-300 mb-3">Strategy Limits</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-400 mb-2">Target Profit ($)</label>
                <input
                  type="number"
                  value={tempTarget}
                  onChange={(e) => setTempTarget(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full bg-slate-900 rounded-lg px-4 py-2 text-white border border-slate-700 focus:border-amber-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-2">Stop Loss ($)</label>
                <input
                  type="number"
                  value={tempStopLoss}
                  onChange={(e) => setTempStopLoss(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full bg-slate-900 rounded-lg px-4 py-2 text-white border border-slate-700 focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Labouchere Sequence */}
          <div>
            <h3 className="text-sm font-medium text-slate-300 mb-3">Labouchere Sequence</h3>
            <p className="text-xs text-slate-500 mb-2">
              Enter comma-separated numbers for the Labouchere betting sequence.
            </p>
            <input
              type="text"
              value={labSequence}
              onChange={(e) => setLabSequence(e.target.value)}
              placeholder="25, 50, 25, 50"
              className="w-full bg-slate-900 rounded-lg px-4 py-2 text-white font-mono border border-slate-700 focus:border-amber-500 focus:outline-none"
            />
          </div>

          {/* Preset Sequences */}
          <div>
            <h3 className="text-sm font-medium text-slate-300 mb-3">Preset Sequences</h3>
            <div className="flex flex-wrap gap-2">
              {[
                { name: 'His System', seq: '25, 50, 100' },
                { name: 'Standard', seq: '25, 50, 25, 50' },
                { name: 'Conservative', seq: '10, 20, 10, 20' },
                { name: 'Aggressive', seq: '50, 100, 50, 100' },
                { name: 'Long', seq: '10, 20, 30, 40, 50, 60' }
              ].map(preset => (
                <button
                  key={preset.name}
                  onClick={() => setLabSequence(preset.seq)}
                  className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded text-sm"
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
            <p className="text-sm text-amber-400">
              Note: Changing settings will reset your current session. All progress will be lost.
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3 p-4 border-t border-slate-700">
          <button
            onClick={toggleSettings}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg"
          >
            Save & Reset
          </button>
        </div>
      </div>
    </div>
  );
}
