import React, { useState, useEffect } from 'react';
import './Eigen.css';

const Eigen: React.FC = () => {
    const [matrix, setMatrix] = useState<string>('[[1,2],[3,4]]');
    const [eigenvalues, setEigenvalues] = useState<string[]>([]);
    const [eigenvectors, setEigenvectors] = useState<string[][]>([]);
    const [error, setError] = useState<string>('');
    const [history, setHistory] = useState<any[]>([]);
    const [showHistory, setShowHistory] = useState<boolean>(false);
    const [showExamples, setShowExamples] = useState<boolean>(false);

    const examples = [
        {
            name: "Matriz 2x2 Simétrica",
            matrix: "[[1,2],[2,1]]",
            description: "Autovalores reais para matriz simétrica"
        },
        {
            name: "Matriz Rotação 2D",
            matrix: "[[0,-1],[1,0]]",
            description: "Autovalores complexos - rotação pura"
        },
        {
            name: "Sistema Massa-Mola",
            matrix: "[[2,-1],[-1,2]]",
            description: "Modos normais de vibração"
        },
        {
            name: "Matriz Diagonal",
            matrix: "[[3,0],[0,5]]",
            description: "Autovalores na diagonal"
        }
    ];

    useEffect(() => {
        const savedHistory = localStorage.getItem('eigenHistory');
        if (savedHistory) {
            setHistory(JSON.parse(savedHistory));
        }
    }, []);

    const calculateEigen = async () => {
        try {
            const response = await fetch(`${window.location.origin}/eigen`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ matrix }),
            });

            const data = await response.json();

            if (data.success) {
                setEigenvalues(data.eigenvalues);
                setEigenvectors(data.eigenvectors);
                setError('');

                // salvar histórico
                const newHistoryItem = {
                    matrix,
                    eigenvalues: data.eigenvalues,
                    eigenvectors: data.eigenvectors,
                    timestamp: new Date().toLocaleString()
                };
                const newHistory = [newHistoryItem, ...history.slice(0, 9)];
                setHistory(newHistory);
                localStorage.setItem('eigenHistory', JSON.stringify(newHistory));
            } else {
                setError(data.error);
                setEigenvalues([]);
                setEigenvectors([]);
            }
        } catch (err) {
            setError('Erro de conexão com o servidor');
            setEigenvalues([]);
            setEigenvectors([]);
        }
    };

    const loadExample = (exampleMatrix: string) => {
        setMatrix(exampleMatrix);
        setError('');
    };

    const loadHistoryItem = (item: any) => {
        setMatrix(item.matrix);
        setEigenvalues(item.eigenvalues);
        setEigenvectors(item.eigenvectors);
        setError('');
        setShowHistory(false);
    };

    return (
        <div className="eigen-calculator">
            <button className="back-button" onClick={() => window.history.back()}>
                ← Back to Dashboard
            </button>

            <h1>Eigenvalues & Eigenvectors Calculator</h1>

            <div className="input-section">
                <textarea
                    value={matrix}
                    onChange={(e) => setMatrix(e.target.value)}
                    placeholder="Enter matrix in JSON format e.g., [[1,2],[3,4]]"
                    rows={4}
                />
                <button onClick={calculateEigen}>Calculate</button>
            </div>

            <div className="action-buttons">
                <button onClick={() => setShowHistory(!showHistory)}>
                    {showHistory ? 'Hide History' : 'Show History'}
                </button>
                <button onClick={() => setShowExamples(!showExamples)}>
                    {showExamples ? 'Hide Examples' : 'Show Examples'}
                </button>
            </div>

            {showHistory && (
                <div className="history-section">
                    <h3>Calculation History</h3>
                    {history.length === 0 ? (
                        <p>No history yet</p>
                    ) : (
                        history.map((item, index) => (
                            <div key={index} className="history-item" onClick={() => loadHistoryItem(item)}>
                                <div><strong>Matrix:</strong> {item.matrix}</div>
                                <div><strong>Eigenvalues:</strong> {item.eigenvalues.join(', ')}</div>
                                <small>{item.timestamp}</small>
                            </div>
                        ))
                    )}
                </div>
            )}

            {showExamples && (
                <div className="examples-section">
                    <h3>Examples</h3>
                    <div className="examples-grid">
                        {examples.map((example, index) => (
                            <div key={index} className="example-card" onClick={() => loadExample(example.matrix)}>
                                <h4>{example.name}</h4>
                                <p>{example.matrix}</p>
                                <small>{example.description}</small>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {error && (
                <div className="error-section">
                    <h3>Error</h3>
                    <p>{error}</p>
                </div>
            )}

            {eigenvalues.length > 0 && (
                <div className="results-section">
                    <h3>Results</h3>
                    <div className="eigenvalues">
                        <h4>Eigenvalues:</h4>
                        <ul>
                            {eigenvalues.map((val, index) => (
                                <li key={index}>λ{index + 1} = {val}</li>
                            ))}
                        </ul>
                    </div>

                    <div className="eigenvectors">
                        <h4>Eigenvectors:</h4>
                        {eigenvectors.map((vector, index) => (
                            <div key={index} className="eigenvector">
                                <span>v{index + 1} = [</span>
                                {vector.map((comp, compIndex) => (
                                    <span key={compIndex}>
                                        {comp}
                                        {compIndex < vector.length - 1 ? ', ' : ''}
                                    </span>
                                ))}
                                <span>]</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Eigen;
