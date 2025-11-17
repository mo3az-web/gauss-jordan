import { Fraction } from './fraction.js';

export function gaussJordanElimination(matrix, showFractions = false) {
  const m = matrix.length;
  const n = matrix[0].length;
  const mat = matrix.map(row => [...row]); // Deep copy
  const steps = [];
  const pivots = [];
  
  let currentRow = 0;
  
  // Forward elimination with partial pivoting
  for (let col = 0; col < n && currentRow < m; col++) {
    // Find pivot (partial pivoting for numerical stability)
    let pivotRow = currentRow;
    let maxVal = Math.abs(mat[currentRow][col]);
    
    for (let i = currentRow + 1; i < m; i++) {
      if (Math.abs(mat[i][col]) > maxVal) {
        maxVal = Math.abs(mat[i][col]);
        pivotRow = i;
      }
    }
    
    // Skip if column is all zeros
    if (Math.abs(mat[pivotRow][col]) < 1e-10) {
      continue;
    }
    
    // Swap rows if needed
    if (pivotRow !== currentRow) {
      [mat[currentRow], mat[pivotRow]] = [mat[pivotRow], mat[currentRow]];
      steps.push({
        type: 'swap',
        row1: currentRow,
        row2: pivotRow,
        description: `R${currentRow + 1} ↔ R${pivotRow + 1}`,
        matrix: mat.map(r => [...r])
      });
    }
    
    pivots.push({ row: currentRow, col });
    
    // Scale pivot row to make pivot = 1
    const pivotVal = mat[currentRow][col];
    if (Math.abs(pivotVal - 1) > 1e-10) {
      for (let j = 0; j < n; j++) {
        mat[currentRow][j] /= pivotVal;
      }
      
      const frac = showFractions ? Fraction.fromDecimal(pivotVal).toString() : pivotVal.toFixed(4);
      steps.push({
        type: 'scale',
        row: currentRow,
        factor: 1 / pivotVal,
        description: `R${currentRow + 1} ← R${currentRow + 1} / ${frac}`,
        matrix: mat.map(r => [...r])
      });
    }
    
    // Eliminate all other entries in this column
    for (let i = 0; i < m; i++) {
      if (i === currentRow) continue;
      
      const factor = mat[i][col];
      if (Math.abs(factor) < 1e-10) continue;
      
      for (let j = 0; j < n; j++) {
        mat[i][j] -= factor * mat[currentRow][j];
      }
      
      const frac = showFractions ? Fraction.fromDecimal(factor).toString() : factor.toFixed(4);
      const sign = factor > 0 ? '-' : '+';
      const absVal = Math.abs(factor);
      const displayFrac = showFractions ? Fraction.fromDecimal(absVal).toString() : absVal.toFixed(4);
      
      steps.push({
        type: 'eliminate',
        targetRow: i,
        pivotRow: currentRow,
        factor: factor,
        description: `R${i + 1} ← R${i + 1} ${sign} ${displayFrac}·R${currentRow + 1}`,
        matrix: mat.map(r => [...r])
      });
    }
    
    currentRow++;
  }
  
  // Clean up near-zero values
  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      if (Math.abs(mat[i][j]) < 1e-10) {
        mat[i][j] = 0;
      }
    }
  }
  
  return { rref: mat, steps, pivots };
}

export function analyzeSolution(rref, isAugmented) {
  const m = rref.length;
  const n = rref[0].length;
  const numVars = isAugmented ? n - 1 : n;
  
  // Find pivot columns
  const pivotCols = [];
  for (let i = 0; i < m; i++) {
    for (let j = 0; j < numVars; j++) {
      if (Math.abs(rref[i][j] - 1) < 1e-10) {
        let isPivot = true;
        for (let k = 0; k < m; k++) {
          if (k !== i && Math.abs(rref[k][j]) > 1e-10) {
            isPivot = false;
            break;
          }
        }
        if (isPivot) {
          pivotCols.push(j);
          break;
        }
      }
    }
  }
  
  const rank = pivotCols.length;
  
  if (!isAugmented) {
    return { rank, pivotCols, solutionType: 'N/A' };
  }
  
  // Check for inconsistency (0 = non-zero)
  for (let i = 0; i < m; i++) {
    let allZero = true;
    for (let j = 0; j < numVars; j++) {
      if (Math.abs(rref[i][j]) > 1e-10) {
        allZero = false;
        break;
      }
    }
    if (allZero && Math.abs(rref[i][numVars]) > 1e-10) {
      return { rank, pivotCols, solutionType: 'no solution', solution: null };
    }
  }
  
  // Determine solution type
  const freeCols = [];
  for (let j = 0; j < numVars; j++) {
    if (!pivotCols.includes(j)) {
      freeCols.push(j);
    }
  }
  
  if (freeCols.length === 0) {
    // Unique solution
    const solution = new Array(numVars).fill(0);
    for (let i = 0; i < pivotCols.length; i++) {
      const col = pivotCols[i];
      solution[col] = rref[i][numVars];
    }
    return { 
      rank, 
      pivotCols, 
      solutionType: 'unique', 
      solution,
      freeCols: []
    };
  } else {
    // Infinite solutions - parametric form
    const parametric = [];
    for (let i = 0; i < pivotCols.length; i++) {
      const pivotCol = pivotCols[i];
      const expr = { var: pivotCol, constant: rref[i][numVars], params: {} };
      
      for (const freeCol of freeCols) {
        if (Math.abs(rref[i][freeCol]) > 1e-10) {
          expr.params[freeCol] = -rref[i][freeCol];
        }
      }
      parametric.push(expr);
    }
    
    return {
      rank,
      pivotCols,
      solutionType: 'infinite',
      solution: parametric,
      freeCols
    };
  }
}

export function computeDeterminant(matrix) {
  const n = matrix.length;
  if (n !== matrix[0].length) return null;
  
  const mat = matrix.map(row => [...row]);
  let det = 1;
  let swaps = 0;
  
  for (let col = 0; col < n; col++) {
    // Find pivot
    let pivotRow = col;
    for (let i = col + 1; i < n; i++) {
      if (Math.abs(mat[i][col]) > Math.abs(mat[pivotRow][col])) {
        pivotRow = i;
      }
    }
    
    if (Math.abs(mat[pivotRow][col]) < 1e-10) {
      return 0; // Singular matrix
    }
    
    if (pivotRow !== col) {
      [mat[col], mat[pivotRow]] = [mat[pivotRow], mat[col]];
      swaps++;
    }
    
    det *= mat[col][col];
    
    for (let i = col + 1; i < n; i++) {
      const factor = mat[i][col] / mat[col][col];
      for (let j = col; j < n; j++) {
        mat[i][j] -= factor * mat[col][j];
      }
    }
  }
  
  return swaps % 2 === 0 ? det : -det;
}

export function computeInverse(matrix) {
  const n = matrix.length;
  if (n !== matrix[0].length) return null;
  
  // Create augmented matrix [A | I]
  const augmented = matrix.map((row, i) => [
    ...row,
    ...Array(n).fill(0).map((_, j) => i === j ? 1 : 0)
  ]);
  
  const { rref } = gaussJordanElimination(augmented);
  
  // Check if left side is identity
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const expected = i === j ? 1 : 0;
      if (Math.abs(rref[i][j] - expected) > 1e-10) {
        return null; // Not invertible
      }
    }
  }
  
  // Extract inverse from right side
  return rref.map(row => row.slice(n));
}