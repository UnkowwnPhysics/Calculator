import React, { useEffect, useRef } from 'react';
import './StarsBackground.css';

const StarsBackground: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const starsContainer = containerRef.current;
    if (!starsContainer) return;

    // Criar estrelas
    const starsCount = 200;
    const stars: HTMLDivElement[] = [];
    for (let i = 0; i < starsCount; i++) {
      const star = document.createElement('div');
      star.className = 'star';
      const size = Math.random() * 2 + 1;
      star.style.width = `${size}px`;
      star.style.height = `${size}px`;
      star.style.left = `${Math.random() * 100}%`;
      star.style.top = `${Math.random() * 100}%`;
      const duration = Math.random() * 5 + 5;
      star.style.animationDuration = `${duration}s`;
      starsContainer.appendChild(star);
      stars.push(star);
    }

    // Criar cometas
    const createComet = () => {
      const comet = document.createElement('div');
      comet.className = 'comet';
      const width = Math.random() * 100 + 50;
      comet.style.width = `${width}px`;
      comet.style.top = `${Math.random() * 100}%`;
      const duration = Math.random() * 3 + 3;
      comet.style.animationDuration = `${duration}s`;
      starsContainer.appendChild(comet);
      setTimeout(() => comet.remove(), duration * 1000);
    };

    const cometInterval = setInterval(createComet, 5000);

    return () => {
      stars.forEach(star => star.remove());
      clearInterval(cometInterval);
    };
  }, []);

  return <div ref={containerRef} className="stars-background"></div>;
};

export default StarsBackground;
