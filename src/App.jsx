import React, { useState, useEffect } from 'react';
import MatrixInput from './components/MatrixInput';
import MatrixGrid from './components/MatrixGrid';
import StepList from './components/StepList';
import ResultCard from './components/ResultCard';
import ExampleMatrices from './components/ExampleMatrices';
import { 
  gaussJordanElimination, 
  analyzeSolution, 
  computeDeterminant, 
  computeInverse 
} from './utils/gaussJordan';

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [rows, setRows] = useState(3);
  const [cols, setCols] = useState(4);
  const [isAugmented, setIsAugmented] = useState(true);
  const [matrix, setMatrix] = useState([]);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [showFractions, setShowFractions] = useState(false);
  
  useEffect(() => {
    initializeMatrix(rows, cols);
  }, []);
  
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);
  
  const initializeMatrix = (r, c) => {
    setMatrix(Array(r).fill(0).map(() => Array(c).fill(0)));
    setResult(null);
    setError('');
  };
  
  const handleRowsChange = (newRows) => {
    setRows(newRows);
    initializeMatrix(newRows, cols);
  };
  
  const handleColsChange = (newCols) => {
    setCols(newCols);
    initializeMatrix(rows, newCols);
  };
  
  const handleCellChange = (i, j, value) => {
    const newMatrix = matrix.map(row => [...row]);
    const num = parseFloat(value);
    newMatrix[i][j] = isNaN(num) ? value : num;
    setMatrix(newMatrix);
    setError('');
  };
  
  const validateMatrix = () => {
    for (let i = 0; i < matrix.length; i++) {
      for (let j = 0; j < matrix[i].length; j++) {
        if (typeof matrix[i][j] === 'string' || isNaN(matrix[i][j])) {
          return `Invalid entry at row ${i + 1}, column ${j + 1}. Please enter a number.`;
        }
      }
    }
    return null;
  };
  
  const handleCalculate = () => {
    const validationError = validateMatrix();
    if (validationError) {
      setError(validationError);
      return;
    }
    
    try {
      const { rref, steps, pivots } = gaussJordanElimination(matrix, showFractions);
      const analysis = analyzeSolution(rref, isAugmented);
      
      let determinant = null;
      let inverse = null;
      
      if (rows === cols && !isAugmented) {
        determinant = computeDeterminant(matrix);
        if (Math.abs(determinant) > 1e-10) {
          inverse = computeInverse(matrix);
        }
      }
      
      setResult({
        rref,
        steps,
        pivots,
        analysis,
        determinant,
        inverse
      });
      setError('');
    } catch (err) {
      setError(`Calculation error: ${err.message}`);
    }
  };
  
  const handleClear = () => {
    initializeMatrix(rows, cols);
  };
  
  const handleRandomFill = () => {
    const newMatrix = Array(rows).fill(0).map(() =>
      Array(cols).fill(0).map(() => Math.floor(Math.random() * 20 - 10))
    );
    setMatrix(newMatrix);
    setResult(null);
    setError('');
  };
  
  const handleExampleSelect = (example) => {
    const newRows = example.matrix.length;
    const newCols = example.matrix[0].length;
    setRows(newRows);
    setCols(newCols);
    setIsAugmented(example.isAugmented);
    setMatrix(example.matrix.map(row => [...row]));
    setResult(null);
    setError('');
  };
  
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };
  
  const exportAsJSON = () => {
    if (!result) return;
    const data = {
      input: matrix,
      rref: result.rref,
      steps: result.steps.map(s => s.description),
      analysis: result.analysis
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'matrix-calculation.json';
    a.click();
  };
  
  const exportAsCSV = () => {
    if (!result) return;
    const csv = result.rref.map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'matrix-rref.csv';
    a.click();
  };
  
  const formatSolution = (analysis) => {
    if (!analysis.solution) return 'No solution exists.';
    
    if (analysis.solutionType === 'unique') {
      return (
        <div>
          <p className="mb-2 font-semibold">Unique solution:</p>
          {analysis.solution.map((val, idx) => (
            <div key={idx} className="font-mono">
              x<sub>{idx + 1}</sub> = {showFractions ? 
                require('./utils/fraction.js').Fraction.fromDecimal(val).toString() : 
                val.toFixed(4)}
            </div>
          ))}
        </div>
      );
    }
    
    if (analysis.solutionType === 'infinite') {
      return (
        <div>
          <p className="mb-2 font-semibold">Infinitely many solutions (parametric form):</p>
          {analysis.solution.map((expr, idx) => {
            const parts = [`x${expr.var + 1} = ${showFractions ? 
              require('./utils/fraction.js').Fraction.fromDecimal(expr.constant).toString() : 
              expr.constant.toFixed(4)}`];
            
            Object.entries(expr.params).forEach(([freeVar, coef]) => {
              const sign = coef > 0 ? '+' : '';
              const val = showFractions ? 
                require('./utils/fraction.js').Fraction.fromDecimal(coef).toString() : 
                coef.toFixed(4);
              parts.push(`${sign} ${val}·t${parseInt(freeVar) + 1}`);
            });
            
            return (
              <div key={idx} className="font-mono">
                {parts.join(' ')}
              </div>
            );
          })}
          {analysis.freeCols.length > 0 && (
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              where {analysis.freeCols.map(c => `t${c + 1}`).join(', ')} are free parameters
            </p>
          )}
        </div>
      );
    }
    
    return 'No solution';
  };
  
  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100">
            Matrix Calculator
            <span className="block text-sm md:text-base font-normal text-gray-600 dark:text-gray-400 mt-1">
              Gauss-Jordan Elimination
            </span>
          </h1>
          
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-3 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 
                       dark:hover:bg-gray-600 transition-colors"
            aria-label="Toggle dark mode"
          >
            {darkMode ? (
              <svg className="w-6 h-6 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-6 h-6 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              </svg>
            )}
          </button>
        </div>
        
        {/* Input Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Input Matrix
          </h2>
          
          <div className="space-y-4">
            <MatrixInput
              rows={rows}
              cols={cols}
              onRowsChange={handleRowsChange}
              onColsChange={handleColsChange}
              isAugmented={isAugmented}
              onAugmentedChange={setIsAugmented}
            />
            
            <ExampleMatrices onSelect={handleExampleSelect} />
            
            <div className="overflow-x-auto py-4">
              <MatrixGrid matrix={matrix} onChange={handleCellChange} />
            </div>
            
            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-red-800 dark:text-red-200">
                {error}
              </div>
            )}
            
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleCalculate}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                           transition-colors font-medium shadow-sm"
              >
                Calculate RREF
              </button>
              
              <button
                onClick={handleClear}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 
                           transition-colors font-medium shadow-sm"
              >
                Clear
              </button>
              
              <button
                onClick={handleRandomFill}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 
                           transition-colors font-medium shadow-sm"
              >
                Random Fill
              </button>
              
              <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 
                                rounded-lg cursor-pointer">
                <input
                  type="checkbox"
                  checked={showFractions}
                  onChange={(e) => setShowFractions(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Show Fractions
                </span>
              </label>
            </div>
          </div>
        </div>
        
        {/* Results Section */}
        {result && (
          <div className="space-y-6">
            {/* RREF Result */}
            <ResultCard 
              title="Reduced Row Echelon Form (RREF)"
              actions={
                <>
                  <button
                    onClick={() => {
                      const text = result.rref.map(row => row.join(' ')).join('\n');
                      copyToClipboard(text);
                    }}
                    className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 rounded 
                               hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  >
                    Copy
                  </button>
                  <button
                    onClick={exportAsCSV}
                    className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 rounded 
                               hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  >
                    Export CSV
                  </button>
                </>
              }
            >
              <div className="overflow-x-auto">
                <MatrixGrid matrix={result.rref} readonly showFractions={showFractions} />
              </div>
            </ResultCard>
            
            {/* Analysis */}
            <ResultCard title="Matrix Analysis">
              <div className="space-y-3">
                <div>
                  <span className="font-semibold">Rank: </span>
                  {result.analysis.rank}
                </div>
                
                {result.analysis.pivotCols.length > 0 && (
                  <div>
                    <span className="font-semibold">Pivot Columns: </span>
                    {result.analysis.pivotCols.map(c => c + 1).join(', ')}
                  </div>
                )}
                
                {isAugmented && (
                  <div>
                    <span className="font-semibold">Solution Type: </span>
                    {result.analysis.solutionType}
                  </div>
                )}
                
                {result.determinant !== null && (
                  <div>
                    <span className="font-semibold">Determinant: </span>
                    {showFractions ? 
                      require('./utils/fraction.js').Fraction.fromDecimal(result.determinant).toString() :
                      result.determinant.toFixed(6)}
                  </div>
                )}
              </div>
            </ResultCard>
            
            {/* Solution */}
            {isAugmented && result.analysis.solution && (
              <ResultCard title="Solution">
                {formatSolution(result.analysis)}
              </ResultCard>
            )}
            
            {/* Inverse */}
            {result.inverse && (
              <ResultCard 
                title="Matrix Inverse"
                actions={
                  <button
                    onClick={() => {
                      const text = result.inverse.map(row => row.join(' ')).join('\n');
                      copyToClipboard(text);
                    }}
                    className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 rounded 
                               hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  >
                    Copy
                  </button>
                }
              >
                <div className="overflow-x-auto">
                  <MatrixGrid matrix={result.inverse} readonly showFractions={showFractions} />
                </div>
              </ResultCard>
            )}
            
            {/* Steps */}
            {result.steps.length > 0 && (
              <StepList steps={result.steps} showFractions={showFractions} />
            )}
            
            {/* Export All */}
            <div className="flex justify-end">
              <button
                onClick={exportAsJSON}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 
                           transition-colors font-medium shadow-sm"
              >
                Export All Results (JSON)
              </button>
            </div>
          </div>
        )}
        
        {/* Footer */}
        <div className="mt-12 text-center text-sm text-gray-600 dark:text-gray-400">
          <p>
            Use arrow keys to navigate between cells. Press Enter to move down, Tab to move right.
          </p>
          <p className="mt-1">
            Matrix calculator with Gauss-Jordan elimination — Built with React + Tailwind CSS
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;