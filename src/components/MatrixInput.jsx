import React from 'react';

export default function MatrixInput({ rows, cols, onRowsChange, onColsChange, isAugmented, onAugmentedChange }) {
  return (
    <div className="flex flex-wrap gap-4 items-center">
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Rows:
        </label>
        <input
          type="number"
          min="1"
          max="10"
          value={rows}
          onChange={(e) => onRowsChange(Math.max(1, Math.min(10, parseInt(e.target.value) || 1)))}
          className="w-16 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded 
                     bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        />
      </div>
      
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Columns:
        </label>
        <input
          type="number"
          min="1"
          max="10"
          value={cols}
          onChange={(e) => onColsChange(Math.max(1, Math.min(10, parseInt(e.target.value) || 1)))}
          className="w-16 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded 
                     bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        />
      </div>
      
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={isAugmented}
          onChange={(e) => onAugmentedChange(e.target.checked)}
          className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
        />
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Augmented Matrix
        </span>
      </label>
    </div>
  );
}