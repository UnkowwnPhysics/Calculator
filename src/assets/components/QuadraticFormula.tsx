import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./QuadraticFormula.css";

export default function QuadraticFormula() {
  const [expression, setExpression] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showExamples, setShowExamples] = useState(false);

  const navigate = useNavigate();

  // Carregar histórico do localStorage ao iniciar
  useEffect(() => {
    const savedHistory = localStorage.getItem("quadraticHistory");
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  // Salvar histórico no localStorage quando mudar
  useEffect(() => {
    localStorage.setItem("quadraticHistory", JSON.stringify(history));
  }, [history]);

  const handleCompute = async () => {
    setError(null);
    setResult(null);

    if (!expression) {
      setError("Please enter a quadratic expression.");
      return;
    }

    // Extrair coeficientes da expressão
    const coefficients = extractCoefficients(expression);
    
    if (!coefficients) {
      setError("Invalid quadratic expression format. Use format: ax² + bx + c");
      return;
    }

    const { a, b, c } = coefficients;

    // Verificar se 'a' é zero (equação não é quadrática)
    if (a === 0) {
      setError("The coefficient 'a' cannot be zero in a quadratic equation.");
      return;
    }

    try {
      const expr1 = `(-(${b}) + math.sqrt((${b})**2 - 4*(${a})*(${c})))/(2*(${a}))`;
      const expr2 = `(-(${b}) - math.sqrt((${b})**2 - 4*(${a})*(${c})))/(2*(${a}))`;

      const res1 = await fetch("http://127.0.0.1:8000/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ expression: expr1 }),
      }).then((r) => r.json());

      const res2 = await fetch("http://127.0.0.1:8000/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ expression: expr2 }),
      }).then((r) => r.json());

      if (res1.success && res2.success) {
        const resultText = `x₁ = ${res1.result}, x₂ = ${res2.result}`;
        setResult(resultText);
        
        // Adicionar ao histórico
        const newHistory = [`${expression} → ${resultText}`, ...history];
        setHistory(newHistory.slice(0, 10)); // Manter apenas os 10 mais recentes
      } else {
        setError(res1.error || res2.error || "Computation error");
      }
    } catch (err) {
      setError("Server connection error.");
    }
  };

  const extractCoefficients = (expr: string) => {
    // Simplificar a expressão
    expr = expr.toLowerCase().replace(/\s+/g, '');
    
    // Padrões para detectar coeficientes
    const aMatch = expr.match(/([-+]?[0-9]*\.?[0-9]+)?x²|x\^2/);
    const bMatch = expr.match(/([-+]?[0-9]*\.?[0-9]+)?x(?!²|\^)/);
    const cMatch = expr.match(/([-+]?[0-9]*\.?[0-9]+)(?!.*x)/);
    
    let a = 0, b = 0, c = 0;
    
    // Extrair coeficiente a
    if (aMatch) {
      a = aMatch[1] ? parseFloat(aMatch[1]) : 1;
      if (aMatch[0].startsWith('-')) a = -a;
    }
    
    // Extrair coeficiente b
    if (bMatch) {
      b = bMatch[1] ? parseFloat(bMatch[1]) : 1;
      if (bMatch[0].startsWith('-')) b = -b;
    }
    
    // Extrair coeficiente c
    if (cMatch) {
      c = parseFloat(cMatch[1]);
      if (cMatch[0].startsWith('-')) c = -c;
    }
    
    return { a, b, c };
  };

  const clearHistory = () => {
    setHistory([]);
  };

  const examples = [
    "x² + 5x + 6",
    "2x² - 4x - 6",
    "x² - 9",
    "3x² + 7x + 2",
    "x² + 4x + 4"
  ];

  const useExample = (example: string) => {
    setExpression(example);
    setShowExamples(false);
  };

  return (
    <div className="calculator-container">
      <button className="back-btn" onClick={() => navigate("/dashboard")}>
        ⬅ Back to Dashboard
      </button>

      <div className="calculator">
        <h2 className="title">Quadratic Formula</h2>

        <div className="nav-buttons">
          <button 
            className="nav-btn" 
            onClick={() => setShowHistory(!showHistory)}
          >
            History
          </button>
          <button 
            className="nav-btn" 
            onClick={() => setShowExamples(!showExamples)}
          >
            Examples
          </button>
        </div>

        {/* Modal de Histórico */}
        {showHistory && (
          <div className="modal">
            <div className="modal-content">
              <h3>Calculation History</h3>
              <ul>
                {history.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
              {history.length > 0 && (
                <button className="clear-history-btn" onClick={clearHistory}>
                  Clear History
                </button>
              )}
              <button className="close-modal-btn" onClick={() => setShowHistory(false)}>
                Close
              </button>
            </div>
          </div>
        )}

        {/* Modal de Exemplos */}
        {showExamples && (
          <div className="modal">
            <div className="modal-content">
              <h3>Example Equations</h3>
              <ul>
                {examples.map((example, index) => (
                  <li key={index}>
                    <button 
                      className="example-btn"
                      onClick={() => useExample(example)}
                    >
                      {example}
                    </button>
                  </li>
                ))}
              </ul>
              <button className="close-modal-btn" onClick={() => setShowExamples(false)}>
                Close
              </button>
            </div>
          </div>
        )}

        <div className="expression-input">
          <input
            type="text"
            placeholder="Enter quadratic expression (e.g., ax² + bx + c)"
            value={expression}
            onChange={(e) => setExpression(e.target.value)}
          />
        </div>

        <button 
          type="button" 
          className="calculate-btn" 
          onClick={handleCompute}
        >
          Compute
        </button>

        {error && <p className="error">{error}</p>}
        
        {result && (
          <div className="results">
            <h3>Solutions:</h3>
            <p className="result">{result}</p>
          </div>
        )}
      </div>
    </div>
  );
}
