import React, { useState, useCallback, useEffect } from 'react';
import { Delete } from 'lucide-react';

export default function Calculator({ value, onChange, accent = '#6175f4' }) {
  const [expression, setExpression] = useState('');
  const [result, setResult] = useState(value || 0);
  const [justEvaluated, setJustEvaluated] = useState(false);

  // sync external value only on mount
  useEffect(() => {
    if (value && value > 0) {
      setExpression(value.toString());
      setResult(value);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const evaluate = (expr) => {
    if (!expr || expr === '') return 0;
    try {
      const cleaned = expr
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/--/g, '+')
        // prevent trailing operator
        .replace(/[+\-*/]$/, '');
      if (!cleaned) return 0;
      // eslint-disable-next-line no-new-func
      const res = Function('"use strict"; return (' + cleaned + ')')();
      if (typeof res !== 'number' || !isFinite(res)) return null;
      return Math.round(res * 100) / 100;
    } catch {
      return null;
    }
  };

  const handleKey = useCallback((key) => {
    if (key === 'C') {
      setExpression('');
      setResult(0);
      onChange(0);
      setJustEvaluated(false);
      return;
    }

    if (key === '⌫') {
      if (justEvaluated) { setExpression(''); setResult(0); onChange(0); setJustEvaluated(false); return; }
      const next = expression.slice(0, -1);
      setExpression(next);
      const res = evaluate(next);
      if (res !== null) { setResult(res); onChange(res); }
      return;
    }

    if (key === '=') {
      const res = evaluate(expression);
      if (res === null) { setExpression('Error'); setResult(0); return; }
      setExpression(res.toString());
      setResult(res);
      onChange(res);
      setJustEvaluated(true);
      return;
    }

    const isOperator = ['+', '-', '×', '÷'].includes(key);

    let nextExpr;
    if (justEvaluated) {
      // after =, if operator pressed continue with result, if number start fresh
      nextExpr = isOperator ? result.toString() + key : key;
      setJustEvaluated(false);
    } else {
      // prevent double operators
      const lastChar = expression.slice(-1);
      const lastIsOp = ['+', '-', '×', '÷'].includes(lastChar);
      if (isOperator && lastIsOp) {
        nextExpr = expression.slice(0, -1) + key;
      } else {
        nextExpr = expression + key;
      }
    }

    setExpression(nextExpr);

    // live result preview (only when expression ends with a number)
    const lastChar = nextExpr.slice(-1);
    if (!isOperator || lastChar === '-') {
      const res = evaluate(nextExpr);
      if (res !== null) { setResult(res); onChange(res); }
    }
  }, [expression, result, justEvaluated, onChange]);

  const keys = [
    ['7', '8', '9', '÷'],
    ['4', '5', '6', '×'],
    ['1', '2', '3', '-'],
    ['C', '0', '.', '+'],
    [null, null, '⌫', '='],
  ];

  const displayExpr = expression || '0';

  return (
    <div className="rounded-xl overflow-hidden border border-surface-700 bg-surface-900">
      {/* Display */}
      <div className="px-4 py-3 bg-surface-950 dark:bg-black/40 text-right select-none">
        <div className="text-surface-400 text-xs font-mono min-h-[18px] truncate">
          {expression && expression !== result.toString() ? expression : ''}
        </div>
        <div className="font-mono font-bold text-2xl mt-0.5 transition-colors" style={{ color: accent }}>
          {result.toLocaleString('en-BD', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
        </div>
      </div>

      {/* Keys */}
      <div className="grid grid-cols-4 gap-1 p-2 bg-surface-900">
        {keys.flat().map((key, i) => {
          if (!key) return <div key={i} />;
          const isOp = ['÷', '×', '-', '+'].includes(key);
          const isEq = key === '=';
          const isDel = key === '⌫';
          const isC = key === 'C';
          return (
            <button
              key={i}
              onClick={() => handleKey(key)}
              className={`h-11 rounded-lg font-semibold text-sm transition-all active:scale-95 select-none ${
                isEq
                  ? 'text-white'
                  : isOp
                  ? 'bg-surface-800 dark:bg-surface-700 hover:opacity-80'
                  : isDel
                  ? 'bg-red-900/40 text-red-400 hover:bg-red-900/60'
                  : isC
                  ? 'bg-surface-800 text-amber-400 hover:bg-surface-700'
                  : 'bg-surface-800 text-white hover:bg-surface-700'
              }`}
              style={isEq ? { backgroundColor: accent } : isOp ? { color: accent } : {}}
            >
              {isDel ? <Delete size={15} className="mx-auto" /> : key}
            </button>
          );
        })}
      </div>
    </div>
  );
}