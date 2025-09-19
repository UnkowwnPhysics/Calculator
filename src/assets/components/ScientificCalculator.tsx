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

  // Teclado só trata ENTER, ESC, BACKSPACE
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        calculateExpression();
      } else if (e.key === "Escape") {
        setInput("");
        setResult("");
      } else if (e.key === "Backspace") {
        setInput((prev) => prev.slice(0, -1));
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleButtonClick = (value: string) => {
    if (value === "=") {
      calculateExpression();
    } else if (value === "C") {
      setInput("");
      setResult("");
    } else if (value === "←") {
      setInput(input.slice(0, -1));
    } else if (value === "CE") {
      setInput("");
    } else if (value === "x²") {
      setInput(input + "²");
    } else if (value === "xʸ") {
      setInput(input + "^");
    } else if (value === "10ˣ") {
      setInput("10^");
    } else if (value === "eˣ") {
      setInput("e^");
    } else if (value === "exp") {
      setInput(input + "exp(");
    } else if (value === "±") {
      setInput(input.startsWith("-") ? input.substring(1) : "-" + input);
    } else if (value === "i") {
      setInput(input + "i");
    } else {
      setInput(input + value);
    }
    if (inputRef.current) inputRef.current.focus();
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
    ["π", "e", "φ", "γ", "i", "exp"],

    // Operações
    ["(", ")", "←", "C", "CE", "±"],
    ["abs", "x²", "xʸ", "10ˣ", "eˣ", "/"],
    ["*", "-", "+", ".", ",", "="],

    // Números
    ["7", "8", "9", "4", "5", "6"],
    ["1", "2", "3", "0"],
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
              onChange={(e) => setInput(e.target.value)}
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


