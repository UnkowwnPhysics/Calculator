import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./ScientificCalculator.css";

const ScientificCalculator: React.FC = () => {
  const [input, setInput] = useState("");
  const [result, setResult] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showExamples, setShowExamples] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Carregar histórico do localStorage ao inicializar
  useEffect(() => {
    const savedHistory = localStorage.getItem("calcHistory");
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  // Salvar histórico no localStorage sempre que mudar
  useEffect(() => {
    localStorage.setItem("calcHistory", JSON.stringify(history));
  }, [history]);

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
      if (input.startsWith("-")) {
        setInput(input.substring(1));
      } else {
        setInput("-" + input);
      }
    } else {
      setInput(input + value);
    }
  };

  const calculateExpression = async () => {
    if (!input) return;
    
    setLoading(true);
    try {
      const response = await fetch("https://calculator-b9q5.onrender.com/calculate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ expression: input }),
      });

      const data = await response.json();
      
      if (data.success) {
        const calculationResult = data.result.toString();
        setResult(calculationResult);
        
        // Adicionar ao histórico
        const newHistoryItem = `${input} = ${calculationResult}`;
        setHistory(prev => [newHistoryItem, ...prev.slice(0, 9)]); // Mantém apenas os últimos 10 itens
      } else {
        setResult("Error: " + data.error);
      }
    } catch (error) {
      setResult("Network Error");
    } finally {
      setLoading(false);
    }
  };

  const handleExampleClick = (example: string) => {
    setInput(example);
    setResult("");
  };

  const clearHistory = () => {
    setHistory([]);
  };

  const scientificButtons = [
    ["sin", "cos", "tan", "log", "ln"],
    ["π", "e", "x²", "xʸ", "√"],
    ["(", ")", "←", "C", "CE"],
    ["7", "8", "9", "/", "±"],
    ["4", "5", "6", "*", "abs"],
    ["1", "2", "3", "-", "exp"],
    ["0", ".", "=", "+", "10ˣ"]
  ];

  const examples = [
    "sin(π/2)",
    "cos(0)",
    "log(100)",
    "sqrt(16)",
    "2^3",
    "e^1",
    "abs(-5)",
    "3*π",
    "log(10)+ln(e)",
    "sin(30*π/180)"
  ];

  return (
    <div className="scientific-calculator-container">
      {/* Header */}
      <div className="scientific-header">
        <button className="back-button" onClick={() => navigate("/dashboard")}>
          ← Back to Dashboard
        </button>
        <div className="header-buttons">
          <button 
            className={`toggle-btn ${showHistory ? 'active' : ''}`}
            onClick={() => {
              setShowHistory(!showHistory);
              setShowExamples(false);
            }}
          >
            History
          </button>
          <button 
            className={`toggle-btn ${showExamples ? 'active' : ''}`}
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
        {/* Calculator */}
        <div className="scientific-calculator">
          <div className="calculator-display">
            <div className="calculator-input">{input}</div>
            <div className="calculator-result">
              {loading ? "Calculating..." : result}
            </div>
          </div>

          <div className="scientific-keypad">
            {scientificButtons.map((row, rowIndex) => (
              <div key={rowIndex} className="keypad-row">
                {row.map((btn) => (
                  <button
                    key={btn}
                    className={`scientific-key ${
                      btn === "=" ? "equals" : 
                      /\d/.test(btn) ? "number" : 
                      ["C", "CE", "←"].includes(btn) ? "function" : 
                      "operation"
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

        {/* History Panel */}
        {showHistory && (
          <div className="panel history-panel">
            <h3>Calculation History</h3>
            {history.length === 0 ? (
              <p>No history yet</p>
            ) : (
              <>
                <button className="clear-history-btn" onClick={clearHistory}>
                  Clear History
                </button>
                <ul>
                  {history.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </>
            )}
          </div>
        )}

        {/* Examples Panel */}
        {showExamples && (
          <div className="panel examples-panel">
            <h3>Example Problems</h3>
            <p>Click on an example to load it into the calculator:</p>
            <div className="examples-grid">
              {examples.map((example, index) => (
                <button
                  key={index}
                  className="example-btn"
                  onClick={() => handleExampleClick(example)}
                >
                  {example}
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
