"use client";

import React from 'react'
import { NOTES, scaleTemplate } from '../lib/musicLogic';

interface ScaleDisplayProps{
  scaleType: string | null
  setScaleType: (type: string) => void
  selectedRoot: string | null;
  setSelectedRoot: (root: string) => void;
}

export default function ScaleDisplay({
  scaleType, setScaleType,
  selectedRoot, setSelectedRoot
}: ScaleDisplayProps) {
  return (
    <div className='mb-4 p-4 bg-card rounded-lg border border-border'>
      <h1 className="text-xl font-bold text-primary mb-3">
        Scales: 
      </h1>
      <div className='grid grid-cols-1 lg:grid-cols-4 gap-1 border-border border-2 rounded-2xl overflow-hidden mb-4'>
        {NOTES.map(note => (
          <button
            key={note}
            className={`p-2 rounded-sm text-center cursor-pointer hover:bg-primary transition-colors
                ${selectedRoot === note ? 'bg-primary text-primary-foreground' : "bg-muted border-border hover:border-primary"}
              `}
            onClick={() => setSelectedRoot(note)}
          >
            {note}
          </button>
        ))}
      </div>
      <h1 className="text-xl font-bold text-primary mb-3">
         Choose Scale Type
      </h1>
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-1 border-border border-2 rounded-2xl overflow-hidden mb-4'>
        {Object.keys(scaleTemplate).map(scale => (
          <button
            key={scale}
            className={`p-2 rounded-sm text-center cursor-pointer hover:bg-primary transition-colors bg-muted
                ${scaleType === scale ? 'bg-primary text-primary-foreground' : "bg-muted border-border hover:border-primary"}
              `}
            onClick={() => setScaleType(scale)}
          >
            {scale}
          </button>
        ))}
      </div>
    </div>
  )
}
