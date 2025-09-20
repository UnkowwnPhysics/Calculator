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
  const [isLoading, setIsLoading] = useState(false);

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

  const extractCoefficients = (expr: string) => {
    // Simplificar a expressão
    expr = expr.toLowerCase().replace(/\s+/g, '');
    
    // Encontrar todas as variáveis (letras) na expressão
    const variables = expr.match(/[a-z]/g);
    if (!variables || variables.length === 0) {
      return null; // Nenhuma variável encontrada
    }
    
    // Usar a primeira letra como variável
    const variable = variables[0];
    
    // Padrões para detectar coeficientes
    const quadraticPattern = new RegExp(`([-+]?[0-9]*\\.?[0-9]+)?${variable}\\^2|${variable}²`, 'g');
    const linearPattern = new RegExp(`([-+]?[0-9]*\\.?[0-9]+)?${variable}(?!\\^2|²)`, 'g');
    const constantPattern = /([-+]?[0-9]*\.?[0-9]+)(?![^]*[a-z])/g;
    
    let a = 0, b = 0, c = 0;
    
    // Extrair coeficiente a (quadrático)
    const aMatch = expr.match(quadraticPattern);
    if (aMatch) {
      a = aMatch[0].includes(variable) ? 
          (aMatch[0].replace(variable, '').replace('^2', '').replace('²', '') || '1') : '0';
      a = parseFloat(a) || 1;
      if (aMatch[0].startsWith('-')) a = -a;
    }
    
    // Extrair coeficiente b (linear)
    const bMatch = expr.match(linearPattern);
    if (bMatch) {
      // Filtrar matches que não são quadráticos
      const linearMatches = bMatch.filter(m => !m.includes('^2') && !m.includes('²'));
      if (linearMatches.length > 0) {
        b = linearMatches[0].includes(variable) ? 
            (linearMatches[0].replace(variable, '') || '1') : '0';
        b = parseFloat(b) || 1;
        if (linearMatches[0].startsWith('-')) b = -b;
      }
    }
    
    // Extrair coeficiente c (constante)
    const cMatch = expr.match(constantPattern);
    if (cMatch) {
      // Encontrar o termo constante que não está associado a uma variável
      for (const match of cMatch) {
        if (!expr.includes(match + variable)) {
          c = parseFloat(match);
          if (match.startsWith('-')) c = -c;
          break;
        }
      }
    }
    
    return { a, b, c, variable };
  };

  const handleCompute = async () => {
    setError(null);
    setResult(null);
    setIsLoading(true);

    if (!expression.trim()) {
      setError("Please enter a quadratic expression.");
      setIsLoading(false);
      return;
    }

    try {
      // Extrair coeficientes da expressão
      const coefficients = extractCoefficients(expression);
      
      if (!coefficients) {
        setError("Invalid expression. Please use a format like: ax² + bx + c");
        setIsLoading(false);
        return;
      }

      const { a, b, c, variable } = coefficients;

      // Verificar se 'a' é zero (equação não é quadrática)
      if (a === 0) {
        setError("The quadratic coefficient cannot be zero.");
        setIsLoading(false);
        return;
      }

      // Calcular discriminante
      const discriminant = b * b - 4 * a * c;

      if (discriminant < 0) {
        // Soluções complexas
        const realPart = -b / (2 * a);
        const imaginaryPart = Math.sqrt(-discriminant) / (2 * a);
        setResult(`${variable}₁ = ${realPart.toFixed(2)} + ${imaginaryPart.toFixed(2)}i, ${variable}₂ = ${realPart.toFixed(2)} - ${imaginaryPart.toFixed(2)}i`);
      } else {
        // Soluções reais
        const x1 = (-b + Math.sqrt(discriminant)) / (2 * a);
        const x2 = (-b - Math.sqrt(discriminant)) / (2 * a);
        setResult(`${variable}₁ = ${x1.toFixed(2)}, ${variable}₂ = ${x2.toFixed(2)}`);
      }

      // Adicionar ao histórico
      const newHistory = [`${expression} → ${result}`, ...history];
      setHistory(newHistory.slice(0, 10)); // Manter apenas os 10 mais recentes
      
    } catch (err) {
      setError("Error calculating the equation. Please check your expression.");
      console.error("Calculation error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const clearHistory = () => {
    setHistory([]);
  };

  const examples = [
    "x² + 5x + 6",
    "2x² - 4x - 6",
    "x² - 9",
    "3x² + 7x + 2",
    "x² + 4x + 4",
    "y² - 5y + 6 = 0",
    "2a² + 4a - 16 = 0"
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
              {history.length === 0 ? (
                <p>No history yet</p>
              ) : (
                <>
                  <ul>
                    {history.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                  <button className="clear-history-btn" onClick={clearHistory}>
                    Clear History
                  </button>
                </>
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
          disabled={isLoading}
        >
          {isLoading ? "Calculating..." : "Compute"}
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
