"use client";

import { useState } from "react";

interface FretboardProps{
  mode: "chord" | "scale";
}

const STRINGS = ["E", "B", "G", "D", "A", "E"]; // high to low
const FRETS = 15;
const STRING_SPACING = 40;
const FRET_SPACING = 60;
const PADDING = 40;

const NOTES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "Bb", "B"];
const MARKERS = [3,5,7,9,12,15]

export default function Fretboard({
  mode,
}: FretboardProps) {
  const [activeNotes, setActiveNotes] = useState<Set<string>>(new Set());
  // const [clickedString, setClickedString] = useState<number | null>()
  const toggleNotes = (id: string) => {
    console.log(id)
    setActiveNotes(prev => {
      const next = new Set(prev);
      //rule 1
      if (next.has(id)) {
        next.delete(id);
      }
      // next.has(id) ? next.delete(id) : null;

      //rule 2
      else{
        if (mode === "chord") {
          Array.from(next).forEach(existingNoteId => {
            if (existingNoteId.startsWith(`${id.split("-")[0]}-`)){
              next.delete(existingNoteId);
            }
          })
        } 
        next.add(id);
      }

      
      return next;
    })
    let stringId: number = parseInt(id.split("-")[0])
    let fretId: number = parseInt(id.split("-")[1])
    console.log("String ID: ", stringId);
    console.log("Fret ID: ", fretId);
    let clickedString = STRINGS[stringId]
    console.log(clickedString)
    let clickedStringIndex = (NOTES.indexOf(clickedString) + fretId) % NOTES.length;
    console.log(NOTES[clickedStringIndex])
    // const string = NOTES.indexOf(STRINGS[])
  }
  //https://www.w3schools.com/graphics/svg_intro.asp
  return (
    <svg
      className=""
      width={FRET_SPACING * FRETS + PADDING * 2}
      height={STRING_SPACING * (STRINGS.length - 1) + PADDING * 2}
    >

      {/* Nut (first fret marker) */}
      <rect
        x={PADDING - 20 + FRET_SPACING - 3}
        y={PADDING - 5}
        width={6}
        height={STRING_SPACING * 5 + 10}
        fill="#8ba3a6"
        rx={2}
      />

      {/* Fretboard background */}
      <rect
        x={PADDING - 20 + FRET_SPACING}
        y={PADDING - 2}
        width={FRET_SPACING * FRETS}
        height={STRING_SPACING * 5 + 4}
        fill="#1a2a2e"
        rx={4}
      />
      {/* Strings */}
      {STRINGS.map((_,si) => ( //si = string index
      // for line it acts like a pen, 
      // x1 y1 = pen down, x2 y2 = pen up
        <line 
          key={si}
          x1={PADDING } x2={40 + PADDING + FRET_SPACING * FRETS} // horizontal
          y1={PADDING + si * STRING_SPACING} y2={PADDING + si * STRING_SPACING} // vertical
          stroke="#888" strokeWidth={si + 1} // increase thickness
        />
      ))}

      {/* Frets */}
      {Array.from({length:FRETS+1}).map((_,fi) => ( //fret index
        <line 
          key={fi}
          x1={40 + PADDING + fi * FRET_SPACING} x2={40+ PADDING + fi * FRET_SPACING}
          y1={PADDING} y2={PADDING + STRING_SPACING * 5} 
          stroke="#888" strokeWidth={1}
        />
      ))}
      {/* Put Markers */}
      {MARKERS.map((m,mi) => (
        <circle 
          key={mi}
          cx={PADDING/2 + 30 +(FRET_SPACING) * m} cy={(PADDING + STRING_SPACING * 5) / 2 + 20} r={10}
          stroke="gray" strokeWidth={1}
          fill="gray"
        />
      ))}
      {/* Make it Clickable (nested?) */}
      {STRINGS.map((openNote, si) => (
        Array.from({length: FRETS + 1}).map((_, fi) =>{
          const id = `${si}-${fi}`;
          const isActive = activeNotes.has(id);
          
          const openNoteIndex = NOTES.indexOf(openNote)
          const noteName: string = NOTES[(openNoteIndex + fi) % NOTES.length] 

          // const cx = 
          return (
            <g
              key={id}
              onClick={() => toggleNotes(id)}
              className="cursor-pointer group"
            >
              <circle 
                key={id}
                cx={(fi + 0.85) * FRET_SPACING} cy={PADDING + si * STRING_SPACING} r={14}
                stroke={isActive ? "#facc15" : "transparent"}
                fill={isActive ? "#facc15" : "transparent"}
                
                className="cursor-pointer hover:fill-yellow-400/30"
              />
              {isActive && (
                <text
                  x={(fi + 0.85) * FRET_SPACING}
                  y={PADDING + si * STRING_SPACING}
                  textAnchor="middle" // justify-center
                  alignmentBaseline="central" // items-center
                  fill="#0c1719"
                  className="font-bold text-xs pointer-events-none select-none font-heading"                 
                >
                  {noteName}
                </text>
              )}
            </g>

          )
        })
      ))}

      {STRINGS.map((note, si) => (
        <text
          key={`open-note-${si}`} 
          x={PADDING / 2 - 10}     //stays left
          y={PADDING + si * STRING_SPACING}
          textAnchor="middle"
          alignmentBaseline="central"
          fill="#e2f0f1" 
          className="font-bold text-m pointer-events-none select-none font-heading"
        >
          {si === 0 ? note.toLocaleLowerCase() : note}
        </text>
      ))}

      {Array.from({length: FRETS + 1}).map((_,fi) => (
        <text
          key={fi}
          x={(fi + 0.85) * FRET_SPACING}
          y={PADDING + STRING_SPACING * STRINGS.length - 10}
          textAnchor="middle" // justify-center
          alignmentBaseline="central" // items-center
          fill="#8ba3a6"
          className="font-bold text-xs pointer-events-none select-none font-heading"
        >
          {fi}
        </text>
      ))}

    </svg>
  );
}