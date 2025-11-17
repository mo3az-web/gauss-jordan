import React from 'react';

const examples = [
  {
    name: 'Simple 2×3 System',
    matrix: [[2, 1, 5], [1, -1, 1]],
    isAugmented: true
  },
  {
    name: 'Dependent System',
    matrix: [[1, 2, 3], [2, 4, 6]],
    isAugmented: true
  },
  {
    name: 'Inconsistent System',
    matrix: [[1, 2, 3], [2, 4, 5]],
    isAugmented: true
  },
  {
    name: 'Invertible 3×3',
    matrix: [[2, -1, 0], [-1, 2, -1], [0, -1, 2]],
    isAugmented: false
  },
  {
    name: 'Identity 3×3',
    matrix: [[1, 0, 0], [0, 1, 0], [0, 0, 1]],
    isAugmented: false
  },
  {
    name: 'Random 4×4',
    matrix: [[3, 2, -1, 4], [1, -1, 2, 3], [2, 3, -2, 1], [1, 2, 3, 2]],
    isAugmented: false
  }
];

export default function ExampleMatrices({ onSelect }) {
  return (
    <div className="flex flex-wrap gap-2">
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 self-center">
        Examples:
      </span>
      {examples.map((example, idx) => (
        <button
          key={idx}
          onClick={() => onSelect(example)}
          className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 
                     rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        >
          {example.name}
        </button>
      ))}
    </div>
  );
}