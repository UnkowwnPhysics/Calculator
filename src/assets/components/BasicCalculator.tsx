import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './BasicCalculator.css';

const BasicCalculator: React.FC = () => {
  const [input, setInput] = useState('');
  const [result, setResult] = useState('');
  const navigate = useNavigate();

  const handleButtonClick = (value: string) => {
    if (value === '=') {
      try {
        setResult(eval(input).toString());
      } catch {
        setResult('Error');
      }
    } else if (value === 'C') {
      setInput('');
      setResult('');
    } else if (value === '←') {
      setInput(input.slice(0, -1));
    } else {
      setInput(input + value);
    }
  };

  return (
    <div className="calculator-container">
      <button className="back-btn" onClick={() => navigate('/dashboard')}>
        ← Back to Dashboard
      </button>
      
      <div className="calculator">
        <div className="display">
          <div className="input">{input}</div>
          <div className="result">{result}</div>
        </div>
        
        <div className="keypad">
          {['7', '8', '9', '/', '4', '5', '6', '*', '1', '2', '3', '-', '0', '.', '=', '+', 'C', '←'].map((btn) => (
            <button
              key={btn}
              className={`key ${btn === '=' ? 'equals' : ''} ${btn === 'C' ? 'clear' : ''}`}
              onClick={() => handleButtonClick(btn)}
            >
              {btn}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BasicCalculator;