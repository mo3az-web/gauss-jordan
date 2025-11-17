import React, { useRef, useEffect } from 'react';
import clsx from 'clsx';

export default function MatrixGrid({ matrix, onChange, readonly = false, showFractions = false }) {
  const inputRefs = useRef([]);
  
  const handleKeyDown = (e, i, j) => {
    const rows = matrix.length;
    const cols = matrix[0].length;
    
    let nextI = i, nextJ = j;
    
    switch(e.key) {
      case 'ArrowUp':
        nextI = Math.max(0, i - 1);
        e.preventDefault();
        break;
      case 'ArrowDown':
      case 'Enter':
        nextI = Math.min(rows - 1, i + 1);
        e.preventDefault();
        break;
      case 'ArrowLeft':
        nextJ = Math.max(0, j - 1);
        e.preventDefault();
        break;
      case 'ArrowRight':
      case 'Tab':
        if (!e.shiftKey) {
          nextJ = Math.min(cols - 1, j + 1);
          if (e.key === 'Tab') e.preventDefault();
        }
        break;
    }
    
    if (nextI !== i || nextJ !== j) {
      const nextIndex = nextI * cols + nextJ;
      inputRefs.current[nextIndex]?.focus();
    }
  };
  
  const formatValue = (val) => {
    if (showFractions) {
      const { Fraction } = require('../utils/fraction.js');
      return Fraction.fromDecimal(val).toString();
    }
    return Math.abs(val) < 1e-10 ? '0' : val.toFixed(4).replace(/\.?0+$/, '');
  };
  
  return (
    <div className="inline-block">
      <div className="border-l-2 border-r-2 border-gray-400 dark:border-gray-500 px-2 py-1">
        {matrix.map((row, i) => (
          <div key={i} className="flex gap-1 mb-1">
            {row.map((val, j) => (
              <input
                key={j}
                ref={el => inputRefs.current[i * row.length + j] = el}
                type="text"
                value={readonly ? formatValue(val) : val}
                onChange={(e) => !readonly && onChange(i, j, e.target.value)}
                onKeyDown={(e) => !readonly && handleKeyDown(e, i, j)}
                readOnly={readonly}
                className={clsx(
                  'matrix-cell',
                  readonly && 'bg-gray-100 dark:bg-gray-700 cursor-default'
                )}
                aria-label={`Cell ${i + 1},${j + 1}`}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}