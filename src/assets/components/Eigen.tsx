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
        { name: "Matriz 2x2 Simétrica", matrix: "[[1,2],[2,1]]", description: "Autovalores reais" },
        { name: "Matriz Rotação 2D", matrix: "[[0,-1],[1,0]]", description: "Autovalores complexos" },
        { name: "Sistema Massa-Mola", matrix: "[[2,-1],[-1,2]]", description: "Modos de vibração" },
        { name: "Matriz Diagonal", matrix: "[[3,0],[0,5]]", description: "Autovalores diretos" }
    ];

    useEffect(() => {
        const savedHistory = localStorage.getItem('eigenHistory');
        if (savedHistory) setHistory(JSON.parse(savedHistory));
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
        } catch {
            setError('Erro de conexão com o servidor');
            setEigenvalues([]);
            setEigenvectors([]);
        }
    };

    const loadExample = (m: string) => {
        setMatrix(m);
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
                    placeholder="Ex: [[1,2],[3,4]]"
                    rows={4}
                />
                <button onClick={calculateEigen}>Calcular</button>
            </div>

            <div className="action-buttons">
                <button onClick={() => setShowHistory(!showHistory)}>
                    {showHistory ? 'Esconder Histórico' : 'Mostrar Histórico'}
                </button>
                <button onClick={() => setShowExamples(!showExamples)}>
                    {showExamples ? 'Esconder Exemplos' : 'Mostrar Exemplos'}
                </button>
            </div>

            {showHistory && (
                <div className="history-section">
                    <h3>Histórico</h3>
                    {history.length === 0 ? (
                        <p>Sem histórico ainda</p>
                    ) : (
                        history.map((item, i) => (
                            <div key={i} className="history-item" onClick={() => loadHistoryItem(item)}>
                                <div><strong>Matriz:</strong> {item.matrix}</div>
                                <div><strong>λ:</strong> {item.eigenvalues.join(', ')}</div>
                                <small>{item.timestamp}</small>
                            </div>
                        ))
                    )}
                </div>
            )}

            {showExamples && (
                <div className="examples-section">
                    <h3>Exemplos</h3>
                    <div className="examples-grid">
                        {examples.map((ex, i) => (
                            <div key={i} className="example-card" onClick={() => loadExample(ex.matrix)}>
                                <h4>{ex.name}</h4>
                                <p>{ex.matrix}</p>
                                <small>{ex.description}</small>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {error && (
                <div className="error-section">
                    <h3>Erro</h3>
                    <p>{error}</p>
                </div>
            )}

            {eigenvalues.length > 0 && (
                <div className="results-section">
                    <h3>Resultados</h3>
                    <div className="eigenvalues">
                        <h4>Autovalores:</h4>
                        <ul>
                            {eigenvalues.map((val, i) => (
                                <li key={i}>λ{i + 1} = {val}</li>
                            ))}
                        </ul>
                    </div>

                    <div className="eigenvectors">
                        <h4>Autovetores:</h4>
                        {eigenvectors.map((vec, i) => (
                            <div key={i} className="eigenvector">
                                v{i + 1} = [{vec.join(', ')}]
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Eigen;
