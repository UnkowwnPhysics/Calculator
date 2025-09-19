import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./ScientificCalculator.css";

const ScientificCalculator: React.FC = () => {
  const [input, setInput] = useState("");
  const [result, setResult] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showExamples, setShowExamples] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const savedHistory = localStorage.getItem("calcHistory");
    if (savedHistory) setHistory(JSON.parse(savedHistory));
    if (inputRef.current) inputRef.current.focus();
  }, []);

  useEffect(() => {
    localStorage.setItem("calcHistory", JSON.stringify(history));
  }, [history]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      calculateExpression();
    } else if (e.key === "Escape") {
      e.preventDefault();
      setInput("");
      setResult("");
    }
  };

  const handleButtonClick = (value: string) => {
    const inputEl = inputRef.current;
    if (!inputEl) return;

    const start = inputEl.selectionStart || 0;
    const end = inputEl.selectionEnd || 0;
    
    if (value === "=") {
        calculateExpression();
    } else if (value === "C") {
        setInput("");
        setResult("");
    } else if (value === "←") {
        if (start === end && start > 0) {
            const newInput = input.substring(0, start - 1) + input.substring(end);
            setInput(newInput);
            setTimeout(() => {
                if (inputEl) {
                    inputEl.selectionStart = start - 1;
                    inputEl.selectionEnd = start - 1;
                }
            }, 0);
        } else if (start !== end) {
            const newInput = input.substring(0, start) + input.substring(end);
            setInput(newInput);
            setTimeout(() => {
                if (inputEl) {
                    inputEl.selectionStart = start;
                    inputEl.selectionEnd = start;
                }
            }, 0);
        }
    } else if (value === "CE") {
        setInput("");
    } else if (value === "x²") {
        insertTextAtCursor("²");
    } else if (value === "xʸ") {
        insertTextAtCursor("^");
    } else if (value === "10ˣ") {
        insertTextAtCursor("10^");
    } else if (value === "eˣ") {
        insertTextAtCursor("e^");
    } else if (value === "exp") {
        insertTextAtCursor("exp(");
    } else if (value === "±") {
        setInput(prev => prev.startsWith("-") ? prev.substring(1) : "-" + prev);
    } else if (value === "i") {
        insertTextAtCursor("i");
    } else if ([
        'sin', 'cos', 'tan', 'asin', 'acos', 'atan',
        'sinh', 'cosh', 'tanh', 'log', 'ln', '√', 'abs'
    ].includes(value)) {
        // Para funções trigonométricas, insere com parênteses
        insertFunctionWithParentheses(value);
    } else {
        insertTextAtCursor(value);
    }
};


const insertFunctionWithParentheses = (func: string) => {
    const inputEl = inputRef.current;
    if (!inputEl) return;

    const start = inputEl.selectionStart || 0;
    const end = inputEl.selectionEnd || 0;
    
    const newInput = input.substring(0, start) + func + "()" + input.substring(end);
    setInput(newInput);
    

    setTimeout(() => {
        if (inputEl) {
            const newPos = start + func.length + 1;
            inputEl.selectionStart = newPos;
            inputEl.selectionEnd = newPos;
            inputEl.focus();
        }
    }, 0);
};

  const insertTextAtCursor = (text: string) => {
    const inputEl = inputRef.current;
    if (!inputEl) return;

    const start = inputEl.selectionStart || 0;
    const end = inputEl.selectionEnd || 0;
    
    const newInput = input.substring(0, start) + text + input.substring(end);
    setInput(newInput);
    
    // Move cursor to the end of inserted text
    setTimeout(() => {
      if (inputEl) {
        const newPos = start + text.length;
        inputEl.selectionStart = newPos;
        inputEl.selectionEnd = newPos;
      }
    }, 0);
  };

  const calculateExpression = async () => {
    if (!input) return;
    setLoading(true);
    try {
      const response = await fetch("https://calculator-b9q5.onrender.com/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ expression: input }),
      });
      const data = await response.json();
      if (data.success) {
        const calculationResult = data.result.toString();
        setResult(calculationResult);
        setHistory((prev) => [`${input} = ${calculationResult}`, ...prev.slice(0, 9)]);
      } else {
        setResult("Error: " + data.error);
      }
    } catch {
      setResult("Network Error");
    } finally {
      setLoading(false);
    }
  };

  const scientificButtons = [
    // Funções principais
    ["sin", "cos", "tan", "asin", "acos", "atan"],
    ["sinh", "cosh", "tanh", "log", "ln", "√"],

    // Constantes e especiais
    ["π", "e", "exp"],

    // Operações
    ["(", ")", "←", "C", "CE", "±"],
    ["abs", "x²", "xʸ", "10ˣ", "eˣ", "/"],
    ["*", "-", "+", ".", ",", "="],

    // Números
    ["1", "2", "3", "4", "5", "6"],
    ["7", "8", "9", "0"],
  ];

  return (
    <div className="scientific-calculator-container">
      <div className="scientific-header">
        <button className="back-button" onClick={() => navigate("/dashboard")}>
          ← Back to Dashboard
        </button>
        <div className="header-buttons">
          <button
            className={`toggle-btn ${showHistory ? "active" : ""}`}
            onClick={() => {
              setShowHistory(!showHistory);
              setShowExamples(false);
            }}
          >
            History
          </button>
          <button
            className={`toggle-btn ${showExamples ? "active" : ""}`}
            onClick={() => {
              setShowExamples(!showExamples);
              setShowHistory(false);
            }}
          >
            Examples
          </button>
        </div>
      </div>

      <div className="scientific-content">
        <div className="scientific-calculator">
          <div className="calculator-display">
            <input
              ref={inputRef}
              type="text"
              className="calculator-input-field"
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Type expression..."
            />
            <div className="calculator-result">
              {loading ? "Calculating..." : result}
            </div>
          </div>

          <div className="scientific-keypad">
            {scientificButtons.map((row, i) => (
              <div key={i} className="keypad-row">
                {row.map((btn) => (
                  <button
                    key={btn}
                    className={`scientific-key ${
                      btn === "="
                        ? "equals"
                        : /\d/.test(btn)
                        ? "number"
                        : ["C", "CE", "←"].includes(btn)
                        ? "function"
                        : "operation"
                    }`}
                    onClick={() => handleButtonClick(btn)}
                    disabled={btn === "=" && loading}
                  >
                    {btn}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>

        {showHistory && (
          <div className="panel history-panel">
            <button className="clear-history-btn" onClick={() => setHistory([])}>
              Clear History
            </button>
            <ul>
              {history.map((entry, i) => (
                <li key={i} onClick={() => setInput(entry.split(" = ")[0])}>
                  {entry}
                </li>
              ))}
            </ul>
          </div>
        )}

        {showExamples && (
          <div className="panel examples-panel">
            <h3>Examples</h3>
            <div className="examples-grid">
              {[
                "sin(π/2)",
                "cos(0)",
                "tan(π/4)",
                "asin(1)",
                "log(100)",
                "√16",
                "3^2",
                "e^2",
              ].map((ex, i) => (
                <button
                  key={i}
                  className="example-btn"
                  onClick={() => setInput(ex)}
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScientificCalculator;


