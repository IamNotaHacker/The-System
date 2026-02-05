import { useState } from 'react';
import { X, Upload, Shuffle, FileText } from 'lucide-react';
import { useGameStore } from '../store/gameStore';

export function ShoeImport() {
  const { showShoeImport, toggleShoeImport, importShoeData, generateNewShoe, shoeResults } = useGameStore();
  const [inputData, setInputData] = useState('');
  const [handCount, setHandCount] = useState(80);

  if (!showShoeImport) return null;

  const handleImport = () => {
    if (inputData.trim()) {
      importShoeData(inputData);
      setInputData('');
      toggleShoeImport();
    }
  };

  const handleGenerate = () => {
    generateNewShoe(handCount);
    toggleShoeImport();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setInputData(content);
      };
      reader.readAsText(file);
    }
  };

  const exportCurrentShoe = () => {
    const data = shoeResults.map(r => r.charAt(0).toUpperCase()).join('');
    const blob = new Blob([data], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `shoe-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-xl w-full max-w-2xl mx-4 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <h2 className="text-lg font-semibold text-white">Shoe Data</h2>
          <button
            onClick={toggleShoeImport}
            className="p-2 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Import Section */}
          <div>
            <h3 className="text-sm font-medium text-slate-300 mb-3">Import Shoe Data</h3>
            <p className="text-xs text-slate-500 mb-3">
              Paste shoe results using B (Banker), P (Player), T (Tie) format.
              Example: BBPBPPBBTBPPB
            </p>
            <textarea
              value={inputData}
              onChange={(e) => setInputData(e.target.value)}
              placeholder="Enter shoe data (B, P, T)..."
              className="w-full h-32 bg-slate-900 rounded-lg p-4 text-white font-mono text-sm border border-slate-700 focus:border-amber-500 focus:outline-none resize-none"
            />
            <div className="flex gap-3 mt-3">
              <button
                onClick={handleImport}
                disabled={!inputData.trim()}
                className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Upload size={16} />
                Import
              </button>
              <label className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg cursor-pointer">
                <FileText size={16} />
                Load File
                <input
                  type="file"
                  accept=".txt,.csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <div className="border-t border-slate-700" />

          {/* Generate Section */}
          <div>
            <h3 className="text-sm font-medium text-slate-300 mb-3">Generate Random Shoe</h3>
            <p className="text-xs text-slate-500 mb-3">
              Generate a random shoe using actual baccarat probabilities (45.86% Banker, 44.62% Player, 9.52% Tie).
            </p>
            <div className="flex items-center gap-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Number of Hands</label>
                <input
                  type="number"
                  value={handCount}
                  onChange={(e) => setHandCount(Math.max(1, Math.min(200, parseInt(e.target.value) || 80)))}
                  className="w-24 bg-slate-900 rounded-lg px-3 py-2 text-white border border-slate-700 focus:border-amber-500 focus:outline-none"
                />
              </div>
              <button
                onClick={handleGenerate}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg mt-5"
              >
                <Shuffle size={16} />
                Generate
              </button>
            </div>
          </div>

          <div className="border-t border-slate-700" />

          {/* Export Section */}
          <div>
            <h3 className="text-sm font-medium text-slate-300 mb-3">Export Current Shoe</h3>
            <p className="text-xs text-slate-500 mb-3">
              Save current shoe results to a file for later use.
            </p>
            <button
              onClick={exportCurrentShoe}
              disabled={shoeResults.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FileText size={16} />
              Export ({shoeResults.length} hands)
            </button>
          </div>

          {/* Sample Data */}
          <div className="bg-slate-900/50 rounded-lg p-4">
            <h4 className="text-xs font-medium text-slate-400 mb-2">Sample Shoe Data (Wizard of Odds Format)</h4>
            <code className="text-xs text-slate-500 break-all">
              BBPPBBBPBPPBBPBPTBPPBBBPPPBBPBPBBPPPBBBBPBPPPPBPBPBBPBBBPPBPPPBBPPPBBBPPBBPPBPPB
            </code>
          </div>
        </div>
      </div>
    </div>
  );
}
