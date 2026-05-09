"use client";

import { useState } from "react";

const STRINGS = ["e", "B", "G", "D", "A", "E"]; // high to low
const FRETS = 15;
const STRING_SPACING = 40;
const FRET_SPACING = 60;
const PADDING = 40;

export default function Fretboard() {
  const [activeNotes, setActiveNotes] = useState<Set<string>>(new Set());

  const toggleNotes = (id: string) => {
    setActiveNotes(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    })
  }
  return (
    <svg
      width={FRET_SPACING * FRETS + PADDING * 2}
      height={STRING_SPACING * (STRINGS.length - 1) + PADDING * 2}
    >
      {/* Strings */}
      {STRINGS.map((_,si) => ( //si = string index
      // for line it acts like a pen, 
      // x1 y1 = pen down, x2 y2 = pen up
        <line 
          key={si}
          x1={PADDING} x2={PADDING + FRET_SPACING * FRETS} // horizontal
          y1={PADDING + si * STRING_SPACING} y2={PADDING + si * STRING_SPACING} // vertical
          stroke="#888" strokeWidth={si + 1} // increase thickness
        />
      ))}

      {/* Frets */}
      {Array.from({length:FRETS+1}).map((_,fi) => ( //fret index
        <line 
          key={fi}
          x1={PADDING + fi * FRET_SPACING} x2={PADDING + fi * FRET_SPACING}
          y1={PADDING} y2={PADDING + STRING_SPACING * 5} 
          stroke="#888" strokeWidth={1}
        />
      ))}
    </svg>
  );
}