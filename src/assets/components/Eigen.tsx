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
    const [isCalculating, setIsCalculating] = useState<boolean>(false);

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
        setIsCalculating(true);
        setError('');
        
        try {
            // URL do backend - ajuste conforme necessário
            const backendUrl = 'http://localhost:8000';
            
            console.log('Enviando requisição para:', backendUrl);
            console.log('Matriz:', matrix);

            const response = await fetch(`${backendUrl}/eigen`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ matrix }),
            });

            console.log('Status da resposta:', response.status);
            console.log('Headers da resposta:', response.headers);

            // Verifica se a resposta é válida
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }

            // Tenta parsear o JSON
            const responseText = await response.text();
            console.log('Resposta bruta:', responseText);
            
            if (!responseText) {
                throw new Error('Resposta vazia do servidor');
            }

            const data = JSON.parse(responseText);
            console.log('Dados parseados:', data);

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
                setError(data.error || 'Erro desconhecido do servidor');
                setEigenvalues([]);
                setEigenvectors([]);
            }
        } catch (error: any) {
            console.error('Erro detalhado:', error);
            setError(`Erro: ${error.message}`);
            setEigenvalues([]);
            setEigenvectors([]);
        } finally {
            setIsCalculating(false);
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

    const validateMatrix = (matrixStr: string): boolean => {
        try {
            const parsed = JSON.parse(matrixStr);
            return Array.isArray(parsed) && 
                   parsed.every(row => Array.isArray(row)) &&
                   parsed.length > 0 &&
                   parsed[0].length === parsed.length;
        } catch {
            return false;
        }
    };

    return (
        <div className="eigen-calculator">
            <button className="back-button" onClick={() => window.history.back()}>
                ← Back to Dashboard
            </button>

            <div className="input-section">
                <textarea
                    value={matrix}
                    onChange={(e) => setMatrix(e.target.value)}
                    placeholder="Ex: [[1,2],[3,4]]"
                    rows={4}
                    className={!validateMatrix(matrix) ? 'invalid' : ''}
                />
                <button 
                    onClick={calculateEigen} 
                    disabled={isCalculating || !validateMatrix(matrix)}
                >
                    {isCalculating ? 'Calculating...' : 'Compute'}
                </button>
                {!validateMatrix(matrix) && (
                    <small style={{color: 'red'}}>Formato inválido. Use: [[1,2],[3,4]]</small>
                )}
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
                    <h3>History</h3>
                    {history.length === 0 ? (
                        <p>Empty</p>
                    ) : (
                        history.map((item, i) => (
                            <div key={i} className="history-item" onClick={() => loadHistoryItem(item)}>
                                <div><strong>Matrix:</strong> {item.matrix}</div>
                                <div><strong>λ:</strong> {item.eigenvalues.join(', ')}</div>
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
                            {eigenvalues.map((val, i) => (
                                <li key={i}>λ{i + 1} = {val}</li>
                            ))}
                        </ul>
                    </div>

                    <div className="eigenvectors">
                        <h4>Eigenvectors:</h4>
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
