// src/assets/components/GraphicCalculator.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';

interface GraphData {
  x: number[];
  y: number[];
  expression: string;
}

export const GraphicCalculator: React.FC = () => {
  const [expression, setExpression] = useState('x^2');
  const [xRange, setXRange] = useState([-10, 10]);
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [loading, setLoading] = useState(false);

  const calculateGraph = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/graph', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          expression: expression,
          x_min: xRange[0],
          x_max: xRange[1],
          points: 200
        })
      });
      
      const data = await response.json();
      if (!data.error) {
        setGraphData(data);
      }
    } catch (error) {
      console.error('Error calculating graph:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    calculateGraph();
  }, []);

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Calculadora Gráfica</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Controles */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="space-y-2">
              <Label htmlFor="expression">Função (use 'x' como variável)</Label>
              <Input
                id="expression"
                value={expression}
                onChange={(e) => setExpression(e.target.value)}
                placeholder="ex: x^2, sin(x), 2*x+1"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Intervalo X: [{xRange[0]}, {xRange[1]}]</Label>
              <Slider
                value={xRange}
                onValueChange={setXRange}
                min={-20}
                max={20}
                step={1}
                className="w-full"
              />
            </div>
            
            <div className="flex items-end">
              <Button onClick={calculateGraph} disabled={loading}>
                {loading ? 'Calculando...' : 'Plotar Gráfico'}
              </Button>
            </div>
          </div>

          {/* Área do Gráfico */}
          <div className="border rounded-lg p-4 bg-white">
            {graphData ? (
              <GraphDisplay data={graphData} />
            ) : (
              <div className="h-96 flex items-center justify-center text-gray-500">
                {loading ? 'Calculando...' : 'Insira uma função para ver o gráfico'}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Componente para renderizar o gráfico
const GraphDisplay: React.FC<{ data: GraphData }> = ({ data }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Lógica de renderização do gráfico
    drawGraph(ctx, data);
  }, [data]);

  return <canvas ref={canvasRef} width={800} height={400} />;
};
