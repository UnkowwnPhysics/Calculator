import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Matrix.css";

interface Matrix {
  rows: number;
  cols: number;
  data: number[][];
}

const MatrixCalculator: React.FC = () => {
  const [matrixA, setMatrixA] = useState<Matrix>({ rows: 2, cols: 2, data: [[0, 0], [0, 0]] });
  const [matrixB, setMatrixB] = useState<Matrix>({ rows: 2, cols: 2, data: [[0, 0], [0, 0]] });
  const [result, setResult] = useState<Matrix | number | string>("");
  const [operation, setOperation] = useState<string>("add");
  const [history, setHistory] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showExamples, setShowExamples] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const savedHistory = localStorage.getItem("matrixHistory");
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("matrixHistory", JSON.stringify(history));
  }, [history]);

  const updateMatrixSize = (matrix: Matrix, setMatrix: React.Dispatch<React.SetStateAction<Matrix>>, rows: number, cols: number) => {
    const newData: number[][] = [];

    for (let i = 0; i < rows; i++) {
      newData[i] = [];
      for (let j = 0; j < cols; j++) {
        if (matrix.data[i] && matrix.data[i][j] !== undefined) {
          newData[i][j] = matrix.data[i][j];
        } else {
          newData[i][j] = 0;
        }
      }
    }

    setMatrix({ rows, cols, data: newData });
  };

  const updateMatrixValue = (matrix: Matrix, setMatrix: React.Dispatch<React.SetStateAction<Matrix>>, row: number, col: number, value: number) => {
    const newData = matrix.data.map((r, i) =>
      r.map((c, j) => (i === row && j === col ? value : c))
    );
    setMatrix({ ...matrix, data: newData });
  };

  const calculateDeterminant = (matrix: number[][]): number => {
    if (matrix.length === 1) return matrix[0][0];
    if (matrix.length === 2) {
      return matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0];
    }

    let det = 0;
    for (let i = 0; i < matrix.length; i++) {
      const minor = matrix
        .filter((_, idx) => idx !== 0)
        .map((row) => row.filter((_, j) => j !== i));
      det += matrix[0][i] * Math.pow(-1, i) * calculateDeterminant(minor);
    }
    return det;
  };

  const calculateInverse = (matrix: number[][], determinant: number): Matrix => {
    if (matrix.length === 1) {
      return { rows: 1, cols: 1, data: [[1 / matrix[0][0]]] };
    }

    if (matrix.length === 2) {
      return {
        rows: 2,
        cols: 2,
        data: [
          [matrix[1][1] / determinant, -matrix[0][1] / determinant],
          [-matrix[1][0] / determinant, matrix[0][0] / determinant],
        ],
      };
    }

    const cofactors: number[][] = [];

    for (let i = 0; i < matrix.length; i++) {
      cofactors[i] = [];
      for (let j = 0; j < matrix.length; j++) {
        const minor = matrix
          .filter((_, idx) => idx !== i)
          .map((row) => row.filter((_, k) => k !== j));
        cofactors[i][j] = Math.pow(-1, i + j) * calculateDeterminant(minor);
      }
    }

    const adjugate = cofactors[0].map((_, i) => cofactors.map((row) => row[i]));
    const inverseData = adjugate.map((row) => row.map((val) => val / determinant));

    return { rows: matrix.length, cols: matrix.length, data: inverseData };
  };

  const performOperation = () => {
    try {
      let operationResult: Matrix | number | string = "";
      let operationString = "";

      switch (operation) {
        case "add":
          if (matrixA.rows !== matrixB.rows || matrixA.cols !== matrixB.cols) {
            throw new Error("Matrices must have the same dimensions for addition");
          }
          operationResult = {
            rows: matrixA.rows,
            cols: matrixA.cols,
            data: matrixA.data.map((row, i) =>
              row.map((val, j) => val + matrixB.data[i][j])
            ),
          };
          operationString = "Matrix A + Matrix B";
          break;

        case "subtract":
          if (matrixA.rows !== matrixB.rows || matrixA.cols !== matrixB.cols) {
            throw new Error("Matrices must have the same dimensions for subtraction");
          }
          operationResult = {
            rows: matrixA.rows,
            cols: matrixA.cols,
            data: matrixA.data.map((row, i) =>
              row.map((val, j) => val - matrixB.data[i][j])
            ),
          };
          operationString = "Matrix A - Matrix B";
          break;

        case "multiply":
          if (matrixA.cols !== matrixB.rows) {
            throw new Error("Number of columns in Matrix A must equal number of rows in Matrix B for multiplication");
          }
          operationResult = {
            rows: matrixA.rows,
            cols: matrixB.cols,
            data: Array(matrixA.rows).fill(0).map(() => Array(matrixB.cols).fill(0)),
          };

          for (let i = 0; i < matrixA.rows; i++) {
            for (let j = 0; j < matrixB.cols; j++) {
              let sum = 0;
              for (let k = 0; k < matrixA.cols; k++) {
                sum += matrixA.data[i][k] * matrixB.data[k][j];
              }
              (operationResult as Matrix).data[i][j] = sum;
            }
          }
          operationString = "Matrix A × Matrix B";
          break;

        case "transpose":
          operationResult = {
            rows: matrixA.cols,
            cols: matrixA.rows,
            data: Array(matrixA.cols).fill(0).map((_, i) =>
              Array(matrixA.rows).fill(0).map((_, j) => matrixA.data[j][i])
            ),
          };
          operationString = "Transpose of Matrix A";
          break;

        case "determinant":
          if (matrixA.rows !== matrixA.cols) {
            throw new Error("Matrix must be square to calculate determinant");
          }
          operationResult = calculateDeterminant(matrixA.data);
          operationString = "det(Matrix A)";
          break;

        case "inverse":
          if (matrixA.rows !== matrixA.cols) {
            throw new Error("Matrix must be square to calculate inverse");
          }
          const determinantValue = calculateDeterminant(matrixA.data);
          if (determinantValue === 0) {
            throw new Error("Matrix is singular (determinant = 0), inverse does not exist");
          }
          operationResult = calculateInverse(matrixA.data, determinantValue);
          operationString = "Inverse of Matrix A";
          break;

        default:
          throw new Error("Unknown operation");
      }

      setResult(operationResult);

      const newHistoryItem = `${operationString} = ${
        typeof operationResult === "object"
          ? formatMatrix(operationResult as Matrix)
          : operationResult
      }`;
      setHistory((prev) => [newHistoryItem, ...prev.slice(0, 9)]);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      setResult(`Error: ${errorMessage}`);
    }
  };

  const formatMatrix = (matrix: Matrix): string => {
    return matrix.data.map((row) => `[${row.join(", ")}]`).join("; ");
  };

  const clearHistory = () => {
    setHistory([]);
  };

  const handleExampleClick = (example: { a: Matrix; b: Matrix; op: string }) => {
    setMatrixA(example.a);
    setMatrixB(example.b);
    setOperation(example.op);
  };

  const examples = [
    {
      name: "Simple Addition",
      description: "Add two 2x2 matrices",
      a: { rows: 2, cols: 2, data: [[1, 2], [3, 4]] },
      b: { rows: 2, cols: 2, data: [[5, 6], [7, 8]] },
      op: "add",
    },
    {
      name: "Matrix Multiplication",
      description: "Multiply a 2x3 matrix by a 3x2 matrix",
      a: { rows: 2, cols: 3, data: [[1, 2, 3], [4, 5, 6]] },
      b: { rows: 3, cols: 2, data: [[7, 8], [9, 10], [11, 12]] },
      op: "multiply",
    },
    {
      name: "Transpose",
      description: "Transpose a 3x2 matrix",
      a: { rows: 3, cols: 2, data: [[1, 2], [3, 4], [5, 6]] },
      b: { rows: 2, cols: 2, data: [[0, 0], [0, 0]] },
      op: "transpose",
    },
    {
      name: "Determinant",
      description: "Calculate determinant of a 3x3 matrix",
      a: { rows: 3, cols: 3, data: [[1, 2, 3], [4, 5, 6], [7, 8, 9]] },
      b: { rows: 2, cols: 2, data: [[0, 0], [0, 0]] },
      op: "determinant",
    },
    {
      name: "Inverse",
      description: "Calculate inverse of a 2x2 matrix",
      a: { rows: 2, cols: 2, data: [[4, 7], [2, 6]] },
      b: { rows: 2, cols: 2, data: [[0, 0], [0, 0]] },
      op: "inverse",
    },
    {
      name: "Physics: Transformation",
      description: "Rotation matrix in 2D",
      a: { rows: 2, cols: 2, data: [[0.866, -0.5], [0.5, 0.866]] },
      b: { rows: 2, cols: 1, data: [[3], [4]] },
      op: "multiply",
    },
  ];

  const renderMatrixInput = (
    matrix: Matrix,
    setMatrix: React.Dispatch<React.SetStateAction<Matrix>>,
    title: string
  ) => (
    <div className="matrix-input">
      <h3>{title}</h3>
      <div className="matrix-size">
        <label>
          Rows:
          <input
            type="number"
            min="1"
            max="6"
            value={matrix.rows}
            onChange={(e) =>
              updateMatrixSize(matrix, setMatrix, parseInt(e.target.value), matrix.cols)
            }
          />
        </label>
        <label>
          Columns:
          <input
            type="number"
            min="1"
            max="6"
            value={matrix.cols}
            onChange={(e) =>
              updateMatrixSize(matrix, setMatrix, matrix.rows, parseInt(e.target.value))
            }
          />
        </label>
      </div>
      <div className="matrix-grid">
        {matrix.data.map((row, i) => (
          <div key={i} className="matrix-row">
            {row.map((value, j) => (
              <input
                key={j}
                type="number"
                value={value}
                onChange={(e) =>
                  updateMatrixValue(matrix, setMatrix, i, j, parseFloat(e.target.value) || 0)
                }
                className="matrix-cell"
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );

  const renderResult = () => {
    if (typeof result === "string") {
      return <div className="result-text">{result}</div>;
    } else if (typeof result === "number") {
      return <div className="result-text">Result: {result}</div>;
    } else {
      return (
        <div className="matrix-result">
          <h3>Result</h3>
          <div className="matrix-grid">
            {result.data.map((row, i) => (
              <div key={i} className="matrix-row">
                {row.map((value, j) => (
                  <div key={j} className="matrix-cell result-cell">
                    {value.toFixed(2)}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      );
    }
  };

  return (
    <div className="matrix-calculator-container">
      <div className="matrix-header">
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

      <div className="matrix-content">
        <div className="matrix-operations">
          <div className="matrices-container">
            {renderMatrixInput(matrixA, setMatrixA, "Matrix A")}
            {renderMatrixInput(matrixB, setMatrixB, "Matrix B")}
          </div>

          <div className="operation-selector">
            <h3>Operation</h3>
            <select value={operation} onChange={(e) => setOperation(e.target.value)}>
              <option value="add">A + B (Addition)</option>
              <option value="subtract">A - B (Subtraction)</option>
              <option value="multiply">A × B (Multiplication)</option>
              <option value="transpose">Transpose A</option>
              <option value="determinant">Determinant of A</option>
              <option value="inverse">Inverse of A</option>
            </select>
            <button className="calculate-btn" onClick={performOperation}>
              Calculate
            </button>
          </div>

          {result && renderResult()}
        </div>

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

        {showExamples && (
          <div className="panel examples-panel">
            <h3>Matrix Examples</h3>
            <p>Click on an example to load it into the calculator:</p>
            <div className="examples-grid">
              {examples.map((example, index) => (
                <button
                  key={index}
                  className="example-btn"
                  onClick={() => handleExampleClick(example)}
                >
                  <strong>{example.name}</strong>
                  <span>{example.description}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MatrixCalculator;
