import type { HandResult } from '../engine/baccarat';
import { useGameStore } from '../store/gameStore';

// Bead Plate - Simple grid showing all results
function BeadPlate({ results }: { results: HandResult[] }) {
  const cols = 6;
  const maxRows = 12;

  const grid: (HandResult | null)[][] = [];

  // Fill grid column by column
  let col = 0;
  let row = 0;

  for (const result of results) {
    if (!grid[col]) grid[col] = [];
    grid[col][row] = result;

    row++;
    if (row >= maxRows) {
      row = 0;
      col++;
    }
  }

  // Ensure we have enough columns
  while (grid.length < cols) {
    grid.push([]);
  }

  const getResultStyle = (result: HandResult | null) => {
    if (!result) return 'bg-slate-800';
    switch (result) {
      case 'banker':
        return 'bg-red-600 text-white';
      case 'player':
        return 'bg-blue-600 text-white';
      case 'tie':
        return 'bg-green-600 text-white';
    }
  };

  const getResultLabel = (result: HandResult | null) => {
    if (!result) return '';
    return result.charAt(0).toUpperCase();
  };

  return (
    <div className="bg-slate-800 rounded-xl p-4">
      <h3 className="text-sm font-medium text-slate-400 mb-3">Bead Plate</h3>
      <div className="flex gap-1">
        {grid.map((column, colIdx) => (
          <div key={colIdx} className="flex flex-col gap-1">
            {Array(maxRows)
              .fill(null)
              .map((_, rowIdx) => (
                <div
                  key={rowIdx}
                  className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold ${getResultStyle(
                    column[rowIdx] || null
                  )}`}
                >
                  {getResultLabel(column[rowIdx] || null)}
                </div>
              ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// Big Road - Traditional baccarat scoreboard
function BigRoad({ results }: { results: HandResult[] }) {
  const maxCols = 30;
  const maxRows = 6;

  // Build big road: new column on result change, continue down on same result
  const grid: { result: HandResult; isTie: boolean }[][] = [];
  let currentCol = -1;
  let currentRow = 0;
  let lastResult: HandResult | null = null;

  for (const result of results) {
    // Skip ties (they are marked on the previous cell)
    if (result === 'tie') {
      if (currentCol >= 0 && grid[currentCol]) {
        // Mark tie on current position
        const lastEntry = grid[currentCol][currentRow - 1] || grid[currentCol][currentRow];
        if (lastEntry) {
          lastEntry.isTie = true;
        }
      }
      continue;
    }

    if (result !== lastResult) {
      // New column
      currentCol++;
      currentRow = 0;
      lastResult = result;
    } else {
      // Continue down
      currentRow++;
      // Dragon tail: if we hit max rows, move right but stay at bottom
      if (currentRow >= maxRows) {
        currentCol++;
        currentRow = maxRows - 1;
      }
    }

    if (!grid[currentCol]) grid[currentCol] = [];
    grid[currentCol][currentRow] = { result, isTie: false };
  }

  // Ensure minimum columns for display
  while (grid.length < maxCols) {
    grid.push([]);
  }

  const getResultStyle = (entry: { result: HandResult; isTie: boolean } | null) => {
    if (!entry) return 'border-slate-700';
    switch (entry.result) {
      case 'banker':
        return 'border-red-500 bg-red-500/20';
      case 'player':
        return 'border-blue-500 bg-blue-500/20';
      default:
        return 'border-slate-700';
    }
  };

  return (
    <div className="bg-slate-800 rounded-xl p-4">
      <h3 className="text-sm font-medium text-slate-400 mb-3">Big Road</h3>
      <div className="overflow-x-auto">
        <div className="flex gap-0.5 min-w-max">
          {grid.slice(0, maxCols).map((column, colIdx) => (
            <div key={colIdx} className="flex flex-col gap-0.5">
              {Array(maxRows)
                .fill(null)
                .map((_, rowIdx) => {
                  const entry = column[rowIdx] || null;
                  return (
                    <div
                      key={rowIdx}
                      className={`w-5 h-5 rounded-full border-2 relative ${getResultStyle(entry)}`}
                    >
                      {entry?.isTie && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Result History Strip
function ResultStrip({ results, currentPosition }: { results: HandResult[]; currentPosition: number }) {
  const getResultColor = (result: HandResult) => {
    switch (result) {
      case 'banker':
        return 'text-red-500';
      case 'player':
        return 'text-blue-500';
      case 'tie':
        return 'text-green-500';
    }
  };

  return (
    <div className="bg-slate-800 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-slate-400">Shoe Results</h3>
        <span className="text-xs text-slate-500">
          Position: {currentPosition}/{results.length}
        </span>
      </div>
      <div className="flex flex-wrap gap-1 font-mono text-sm">
        {results.map((result, idx) => (
          <span
            key={idx}
            className={`${getResultColor(result)} ${
              idx < currentPosition ? 'opacity-100' : 'opacity-30'
            } ${idx === currentPosition - 1 ? 'ring-2 ring-amber-500 rounded px-0.5' : ''}`}
          >
            {result.charAt(0).toUpperCase()}
          </span>
        ))}
      </div>
    </div>
  );
}

export function Scoreboard() {
  const { shoeResults, shoeHistory, currentPosition } = useGameStore();

  return (
    <div className="space-y-4">
      <ResultStrip results={shoeResults} currentPosition={currentPosition} />
      <div className="grid grid-cols-2 gap-4">
        <BeadPlate results={shoeHistory} />
        <BigRoad results={shoeHistory} />
      </div>
    </div>
  );
}
