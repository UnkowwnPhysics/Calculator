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

  const mathFunctions = [
    "sin", "cos", "tan", "asin", "acos", "atan",
    "sinh", "cosh", "tanh", "log", "ln", "sqrt", "abs"
  ];

  useEffect(() => {
    const savedHistory = localStorage.getItem("calcHistory");
    if (savedHistory) setHistory(JSON.parse(savedHistory));
    if (inputRef.current) inputRef.current.focus();
  }, []);

  useEffect(() => {
    localStorage.setItem("calcHistory", JSON.stringify(history));
  }, [history]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    const cursorPosition = e.target.selectionStart ?? newValue.length;
    setInput(newValue);

    // Quando escreve a função manualmente, adiciona () e coloca cursor dentro
    mathFunctions.forEach((func) => {
      if (newValue.endsWith(func) && cursorPosition === newValue.length) {
        requestAnimationFrame(() => {
          const updatedValue = newValue + "()";
          setInput(updatedValue);
          setTimeout(() => {
            if (inputRef.current) {
              const newCursorPosition = updatedValue.length - 1;
              inputRef.current.selectionStart = newCursorPosition;
              inputRef.current.selectionEnd = newCursorPosition;
            }
          }, 10);
        });
      }
    });
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
    if (!inputRef.current) return;
    if (value === "=") {
      calculateExpression();
    } else if (value === "C") {
      setInput("");
      setResult("");
    } else if (value === "←") {
      const start = inputRef.current.selectionStart ?? 0;
      const end = inputRef.current.selectionEnd ?? 0;
      if (start === end && start > 0) {
        const newInput = input.slice(0, start - 1) + input.slice(end);
        setInput(newInput);
        setTimeout(() => {
          if (inputRef.current) {
            inputRef.current.selectionStart = start - 1;
            inputRef.current.selectionEnd = start - 1;
          }
        }, 0);
      } else if (start !== end) {
        const newInput = input.slice(0, start) + input.slice(end);
        setInput(newInput);
        setTimeout(() => {
          if (inputRef.current) {
            inputRef.current.selectionStart = start;
            inputRef.current.selectionEnd = start;
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
      insertFunctionWithParentheses("exp");
    } else if (value === "±") {
      setInput((prev) => (prev.startsWith("-") ? prev.slice(1) : "-" + prev));
    } else if (value === "i") {
      insertTextAtCursor("i");
    } else if (mathFunctions.includes(value)) {
      insertFunctionWithParentheses(value);
    } else {
      insertTextAtCursor(value);
    }
  };

  const insertTextAtCursor = (text: string) => {
    if (!inputRef.current) return;
    const start = inputRef.current.selectionStart ?? 0;
    const end = inputRef.current.selectionEnd ?? 0;
    const newInput = input.slice(0, start) + text + input.slice(end);
    setInput(newInput);
    setTimeout(() => {
      if (inputRef.current) {
        const newPos = start + text.length;
        inputRef.current.selectionStart = newPos;
        inputRef.current.selectionEnd = newPos;
      }
    }, 0);
  };

  const insertFunctionWithParentheses = (func: string) => {
    if (!inputRef.current) return;
    const start = inputRef.current.selectionStart ?? 0;
    const end = inputRef.current.selectionEnd ?? 0;
    const newInput = input.slice(0, start) + func + "()" + input.slice(end);
    setInput(newInput);
    setTimeout(() => {
      if (inputRef.current) {
        const newPos = start + func.length + 1; // dentro dos ()
        inputRef.current.selectionStart = newPos;
        inputRef.current.selectionEnd = newPos;
        inputRef.current.focus();
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
    ["sin", "cos", "tan", "asin", "acos", "atan"],
    ["sinh", "cosh", "tanh", "log", "ln", "√"],
    ["π", "e", "exp"],
    ["(", ")", "←", "C", "CE", "±"],
    ["abs", "x²", "xʸ", "10ˣ", "eˣ", "/"],
    ["*", "-", "+", ".", ",", "="],
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
