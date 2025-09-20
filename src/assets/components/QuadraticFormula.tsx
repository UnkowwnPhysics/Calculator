import { useState } from "react";
import { useNavigate } from "react-router-dom"; // <- IMPORT
import "./QuadraticFormula.css";

export default function QuadraticFormula() {
  const [a, setA] = useState("");
  const [b, setB] = useState("");
  const [c, setC] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate(); // <- INICIALIZA

  const handleCalculate = async () => {
    setError(null);
    setResult(null);

    if (!a || !b || !c) {
      setError("Preencha todos os coeficientes (a, b, c).");
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
        setResult(`x₁ = ${res1.result}, x₂ = ${res2.result}`);
      } else {
        setError(res1.error || res2.error || "Erro no cálculo");
      }
    } catch (err) {
      setError("Erro de conexão com o servidor.");
    }
  };

  return (
    <div className="calculator-container">
      {/* Botão voltar */}
      <button className="back-btn" onClick={() => navigate("/dashboard")}>
        ⬅ Back to Dashboard
      </button>

      <div className="calculator">
        <h2 className="title">Quadratic Formula</h2>

        <div className="nav-buttons">
          <button className="nav-btn">History</button>
          <button className="nav-btn">Examples</button>
        </div>

        <div className="inputs">
          <input
            type="number"
            placeholder="a"
            value={a}
            onChange={(e) => setA(e.target.value)}
          />
          <input
            type="number"
            placeholder="b"
            value={b}
            onChange={(e) => setB(e.target.value)}
          />
          <input
            type="number"
            placeholder="c"
            value={c}
            onChange={(e) => setC(e.target.value)}
          />
        </div>

        <button type="button" className="calculate-btn" onClick={handleCalculate}>
          Calcular
        </button>

        {error && <p className="error">{error}</p>}
        {result && <p className="result">{result}</p>}
      </div>
    </div>
  );
}
