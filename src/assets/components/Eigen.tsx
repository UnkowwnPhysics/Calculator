import React, { useState } from "react";

interface Example {
  name: string;
  matrix: string;
  description: string;
}

const examples: Example[] = [
  {
    name: "Diagonal Matrix",
    matrix: "1 0 0\n0 2 0\n0 0 3",
    description: "Simple diagonal matrix with eigenvalues on the diagonal.",
  },
  {
    name: "Symmetric Matrix",
    matrix: "2 1\n1 2",
    description: "Symmetric 2x2 matrix with real eigenvalues.",
  },
  {
    name: "Rotation Matrix",
    matrix: "0 -1\n1 0",
    description: "2D rotation matrix, eigenvalues are complex.",
  },
];

interface EigenResult {
  eigenvalues: number[];
  eigenvectors: number[][];
}

const EigenCalculator: React.FC = () => {
  const [matrix, setMatrix] = useState<string>("");
  const [result, setResult] = useState<EigenResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [showExamples, setShowExamples] = useState<boolean>(false);

  const calculateEigen = async () => {
    try {
      setError(null);
      setResult(null);

      const response = await fetch(`${window.location.origin}/eigen`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matrix }),
      });

      if (!response.ok) {
        throw new Error("Erro ao calcular autovalores e autovetores.");
      }

      const data: EigenResult = await response.json();
      setResult(data);

      // Atualiza histórico (máximo 5 itens)
      setHistory((prev) => [matrix, ...prev.slice(0, 4)]);
    } catch (err) {
      setError("Erro de conexão com o servidor.");
    }
  };

  const loadExample = (exampleMatrix: string) => {
    setMatrix(exampleMatrix);
    setResult(null);
    setError(null);
  };

  return (
    <div className="eigen-calculator">
      <button
        className="back-button"
        onClick={() => (window.location.href = "/")}
      >
        Back to Dashboard
      </button>

      <h2 style={{ color: "white", marginBottom: "20px" }}>
        Eigenvalue & Eigenvector Calculator
      </h2>

      {/* Botões extras */}
      <div className="action-buttons">
        <button onClick={() => setShowHistory(!showHistory)}>
          {showHistory ? "Hide History" : "Show History"}
        </button>
        <button onClick={() => setShowExamples(!showExamples)}>
          {showExamples ? "Hide Examples" : "Show Examples"}
        </button>
      </div>

      {/* Entrada */}
      <div className="input-section">
        <textarea
          rows={5}
          value={matrix}
          onChange={(e) => setMatrix(e.target.value)}
          placeholder="Enter matrix rows separated by newlines (e.g. '1 2\n3 4')"
        />
        <button onClick={calculateEigen}>Calculate</button>
      </div>

      {/* Histórico */}
      {showHistory && (
        <div className="history-section">
          <h3>History</h3>
          {history.length === 0 ? (
            <p>No history yet.</p>
          ) : (
            history.map((item, index) => (
              <div
                key={index}
                className="history-item"
                onClick={() => loadExample(item)}
              >
                <pre>{item}</pre>
              </div>
            ))
          )}
        </div>
      )}

      {/* Exemplos */}
      {showExamples && (
        <div className="examples-section">
          <h3>Examples</h3>
          <div className="examples-grid">
            {examples.map((example, index) => (
              <div
                key={index}
                className="example-card"
                onClick={() => loadExample(example.matrix)}
              >
                <h4>{example.name}</h4>
                <p>{example.matrix}</p>
                <small>{example.description}</small>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Resultados */}
      {result && (
        <div className="results-section">
          <h3>Results</h3>
          <div className="eigenvalues">
            <h4>Eigenvalues:</h4>
            <ul>
              {result.eigenvalues.map((val, i) => (
                <li key={i}>{val}</li>
              ))}
            </ul>
          </div>
          <div className="eigenvectors">
            <h4>Eigenvectors:</h4>
            {result.eigenvectors.map((vec, i) => (
              <div key={i} className="eigenvector">
                [{vec.join(", ")}]
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Erro */}
      {error && <div className="error-section">{error}</div>}
    </div>
  );
};

export default EigenCalculator;
