
import React, { useEffect, useRef } from 'react';
// Chart.js types might be needed if we want stronger typing than 'any' from window.Chart
// For now, we rely on the global window.Chart object provided by the CDN script.

// Define more specific types if available or necessary from Chart.js documentation
type ChartJsData = any; 
type ChartJsOptions = any;
type ChartJsType = 'line' | 'bar' | 'doughnut' | 'pie' | 'radar' | 'polarArea' | 'bubble' | 'scatter';


interface ChartComponentProps {
  chartId: string;
  type: ChartJsType;
  data: ChartJsData;
  options?: ChartJsOptions;
  className?: string;
}

const ChartComponent: React.FC<ChartComponentProps> = ({ chartId, type, data, options, className }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<any | null>(null); // Holds the Chart.js instance

  useEffect(() => {
    if (!canvasRef.current) return;
    if (!window.Chart) {
      console.error("Chart.js is not loaded yet.");
      return;
    }

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    // Destroy previous chart instance if it exists
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    chartInstanceRef.current = new window.Chart(ctx, {
      type: type,
      data: data,
      options: {
        responsive: true,
        maintainAspectRatio: false, // Important for custom sizing via chart-container
        ...options,
      },
    });

    // Cleanup function to destroy chart on component unmount
    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, data, options, chartId]); // chartId included in case it's dynamically changed, though unlikely here

  return (
    <div className={`chart-container ${className || ''}`}>
      <canvas ref={canvasRef} id={chartId}></canvas>
    </div>
  );
};

export default ChartComponent;
