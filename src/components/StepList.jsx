import React, { useState } from 'react';
import MatrixGrid from './MatrixGrid';

export default function StepList({ steps, showFractions }) {
  const [currentStep, setCurrentStep] = useState(steps.length - 1);
  const [isExpanded, setIsExpanded] = useState(false);
  
  if (steps.length === 0) return null;
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between text-lg font-semibold 
                   text-gray-900 dark:text-gray-100 mb-4"
      >
        <span>Gauss-Jordan Steps ({steps.length})</span>
        <svg
          className={`w-5 h-5 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {isExpanded && (
        <>
          <div className="mb-4 flex items-center gap-4">
            <button
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 
                         disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Step {currentStep + 1} of {steps.length}
            </span>
            <button
              onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
              disabled={currentStep === steps.length - 1}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 
                         disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
          
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
              <p className="font-mono text-sm text-gray-800 dark:text-gray-200">
                {steps[currentStep].description}
              </p>
            </div>
            
            <div className="overflow-x-auto">
              <MatrixGrid 
                matrix={steps[currentStep].matrix} 
                readonly 
                showFractions={showFractions}
              />
            </div>
          </div>
          
          <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-4">
            <h4 className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-2">
              All Operations:
            </h4>
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {steps.map((step, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentStep(idx)}
                  className={`block w-full text-left px-3 py-2 rounded text-sm font-mono
                             transition-colors ${
                               idx === currentStep
                                 ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-900 dark:text-blue-200'
                                 : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                             }`}
                >
                  {idx + 1}. {step.description}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}