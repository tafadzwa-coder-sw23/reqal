import React, { useEffect, useState } from 'react';

interface RadarMapProps {
  progress: number; // 0 to 100
  eta: number;
  isActive: boolean;
}

const RadarMap: React.FC<RadarMapProps> = ({ progress, eta, isActive }) => {
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    if (!isActive) return;
    const interval = setInterval(() => {
      setRotation((prev) => (prev + 2) % 360);
    }, 50);
    return () => clearInterval(interval);
  }, [isActive]);

  // Calculate ambulance position based on progress
  // Path is roughly a curve from top-right to center
  const startX = 250;
  const startY = 50;
  const endX = 150; // Center
  const endY = 150; // Center

  const currentX = startX - ((startX - endX) * (progress / 100));
  const currentY = startY - ((startY - endY) * (progress / 100));

  return (
    <div className="relative w-full aspect-square max-w-md mx-auto bg-slate-900 rounded-full border-4 border-slate-700 overflow-hidden shadow-[0_0_50px_rgba(59,130,246,0.3)]">
      {/* Grid Lines */}
      <svg className="absolute inset-0 w-full h-full opacity-30" viewBox="0 0 300 300">
        <circle cx="150" cy="150" r="50" fill="none" stroke="#3b82f6" strokeWidth="1" />
        <circle cx="150" cy="150" r="100" fill="none" stroke="#3b82f6" strokeWidth="1" />
        <circle cx="150" cy="150" r="140" fill="none" stroke="#3b82f6" strokeWidth="1" />
        <line x1="150" y1="0" x2="150" y2="300" stroke="#3b82f6" strokeWidth="1" />
        <line x1="0" y1="150" x2="300" y2="150" stroke="#3b82f6" strokeWidth="1" />
        
        {/* Destination (User) */}
        <circle cx="150" cy="150" r="6" fill="#ef4444" className="animate-pulse" />
        <circle cx="150" cy="150" r="12" fill="none" stroke="#ef4444" strokeWidth="2" className="animate-ping" />
        
        {/* Ambulance Route Visualization (Dotted Line) */}
        <path d={`M${startX} ${startY} Q 200 100 150 150`} fill="none" stroke="#3b82f6" strokeWidth="2" strokeDasharray="4 4" opacity="0.5" />
        
        {/* The Ambulance */}
        {isActive && (
           <g transform={`translate(${currentX}, ${currentY})`}>
             <circle r="8" fill="#3b82f6" stroke="white" strokeWidth="2" />
             <text x="12" y="4" fill="#3b82f6" fontSize="12" fontWeight="bold">AMB-01</text>
           </g>
        )}
      </svg>

      {/* Radar Sweep Effect */}
      {isActive && (
        <div 
          className="absolute inset-0 origin-center pointer-events-none"
          style={{ 
            background: 'conic-gradient(from 0deg at 50% 50%, transparent 0deg, rgba(59, 130, 246, 0.1) 60deg, rgba(59, 130, 246, 0.4) 90deg, transparent 90.1deg)',
            transform: `rotate(${rotation}deg)`
          }}
        />
      )}

      {/* Map Overlay Info */}
      <div className="absolute bottom-4 left-0 right-0 text-center">
        <span className="bg-slate-800/80 text-blue-400 px-3 py-1 rounded-full text-xs font-mono backdrop-blur-sm border border-slate-700">
          LIVE TRACKING • GPS ACTIVE
        </span>
      </div>
    </div>
  );
};

export default RadarMap;
