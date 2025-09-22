import React, { useState, useEffect } from 'react';
import './Eigen.css';

interface HistoryItem {
    matrix: string;
    eigenvalues: string[];
    eigenvectors: string[][];
    timestamp: string;
}

const Eigen: React.FC = () => {
    const [matrix, setMatrix] = useState<string>('[[1,2],[3,4]]');
    const [eigenvalues, setEigenvalues] = useState<string[]>([]);
    const [eigenvectors, setEigenvectors] = useState<string[][]>([]);
    const [error, setError] = useState<string>('');
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [showHistory, setShowHistory] = useState<boolean>(false);
    const [showExamples, setShowExamples] = useState<boolean>(false);
    const [isCalculating, setIsCalculating] = useState<boolean>(false);

    const examples = [
        { name: "Symmetric 2x2 Matrix", matrix: "[[1,2],[2,1]]", description: "Real eigenvalues" },
        { name: "2D Rotation Matrix", matrix: "[[0,-1],[1,0]]", description: "Complex eigenvalues" },
        { name: "Mass-Spring System", matrix: "[[2,-1],[-1,2]]", description: "Vibration modes" },
        { name: "Diagonal Matrix", matrix: "[[3,0],[0,5]]", description: "Direct eigenvalues" }
    ];

    useEffect(() => {
        const savedHistory = localStorage.getItem('eigenHistory');
        if (savedHistory) {
            try {
                setHistory(JSON.parse(savedHistory));
            } catch (e) {
                console.error('Error parsing history:', e);
                localStorage.removeItem('eigenHistory');
            }
        }
    }, []);

    const calculateEigen = async () => {
        setIsCalculating(true);
        setError('');
        
        try {
            const backendUrl = 'https://calculator-b9q5.onrender.com';
            
            const response = await fetch(`${backendUrl}/eigen`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ matrix }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.success) {
                setEigenvalues(data.eigenvalues || []);
                setEigenvectors(data.eigenvectors || []);
                setError('');

                const newHistoryItem: HistoryItem = {
                    matrix,
                    eigenvalues: data.eigenvalues || [],
                    eigenvectors: data.eigenvectors || [],
                    timestamp: new Date().toLocaleString()
                };

                const newHistory = [newHistoryItem, ...history.slice(0, 9)];
                setHistory(newHistory);
                localStorage.setItem('eigenHistory', JSON.stringify(newHistory));
            } else {
                setError(data.error || 'Unknown server error');
                setEigenvalues([]);
                setEigenvectors([]);
            }
        } catch (error: any) {
            setError(`Error: ${error.message}`);
            setEigenvalues([]);
            setEigenvectors([]);
        } finally {
            setIsCalculating(false);
        }
    };

    const loadExample = (exampleMatrix: string) => {
        setMatrix(exampleMatrix);
        setError('');
    };

    const loadHistoryItem = (item: HistoryItem) => {
        setMatrix(item.matrix);
        setEigenvalues(item.eigenvalues);
        setEigenvectors(item.eigenvectors);
        setError('');
        setShowHistory(false);
    };

    const clearHistory = () => {
        setHistory([]);
        localStorage.removeItem('eigenHistory');
    };

    const validateMatrix = (matrixStr: string): boolean => {
        try {
            const parsed = JSON.parse(matrixStr);
            return Array.isArray(parsed) && 
                   parsed.every((row: any) => Array.isArray(row)) &&
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
                    <small style={{color: 'red'}}>Invalid format. Use: [[1,2],[3,4]]</small>
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
                    <div className="history-header">
                        <h3>History</h3>
                        {history.length > 0 && (
                            <button className="clear-history-btn" onClick={clearHistory}>
                                Clear History
                            </button>
                        )}
                    </div>
                    {history.length === 0 ? (
                        <p>No history yet</p>
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
