"use client";

import React, { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { ChordMatch, NOTES, chordTemplate, Voicings } from '../lib/musicLogic';

// TODO: CAGED LOGIC

interface ChordDisplayProp{
  matches: ChordMatch[]
  uniqueNoteNames: string[]
  selectedRoot: string | null
  setSelectedRoot: Dispatch<SetStateAction<string | null>>
  selectedChordType: string | null
  setSelectedChordType: Dispatch<SetStateAction<string | null>>
  voicings: Voicings[]
  setVoicings: Dispatch<SetStateAction<Voicings[]>>
  voicingIndex: number
  setVoicingIndex: Dispatch<SetStateAction<number>>
  goToVoicing: (idx: number) => void
  handleResetFilter: () => void
  onClickShifter: (direction: string) => void
}

export default function ChordDisplay({
  matches,
  uniqueNoteNames,
  selectedRoot, setSelectedRoot,
  selectedChordType, setSelectedChordType,
  voicings,setVoicings,
  voicingIndex, setVoicingIndex,
  goToVoicing, handleResetFilter, onClickShifter
}: ChordDisplayProp) {
  return ( 
    // idkif i should make it bg-card or bg-muted
    <div className="mb-4 p-4 bg-card rounded-lg border border-border">
      
      <h1 className="text-xl font-heading font-bold text-primary mb-3">
        {/* join the chord names if more than 1   */}
        Chords: 
      </h1>
      {/* <div className='flex flex-row '> */}
        
      {matches.length > 1 ? matches.map((m,mi) => (
        <div key={mi} className='flex flex-wrap mb-2 p-2 bg-muted rounded-lg border border-border'>
          <p className='font-bold text-s font-body'>{m.fullName}</p>
        </div>  
      )) : matches.length > 0 ? (
        <div className='flex flex-wrap p-2 mb-2 bg-muted rounded-lg border border-border'>
          <p className='font-bold text-s font-body'>{matches.map(m => m.fullName)}</p>
        </div>  
      ) : (
        <div className='flex flex-wrap p-2 mb-2 bg-muted rounded-lg border border-border'>
          <p>Can't Find Chord</p>
        </div>  
      )}
        

      {/* </div> */}
      

      {/* {matches.length > 1 && (
        <div className='flex flex-wrap p-2 bg-muted rounded-lg border border-border'>
          <p>{matches.map(m => m.fullName)}</p>
        </div>  
      )} */}

      
      <p className="text-sm text-muted-foreground mb-3">Detected Notes: {uniqueNoteNames.join(", ") || "None"}</p>
      
      {/* Shifter */}
      <div className='gap-2 font-body mb-6 p-3 bg-muted rounded-lg border border-border'>
        <div className="flex justify-between items-center mb-2">
          <h1 className='text-sm font-bold text-foreground uppercase tracking-wider'>Transpose Shape</h1>
        </div>
        <p className="text-xs text-muted-foreground mb-3">Slide this exact hand shape up or down the neck to discover new chords.</p>
        <div className='flex gap-2'>
          <button className='w-full border border-border hover:bg-primary hover:text-background transition-colors rounded px-4 py-2 font-bold' onClick={() => onClickShifter("down")}>← Shift Down</button>
          <button className='w-full border border-border hover:bg-primary hover:text-background transition-colors rounded px-4 py-2 font-bold' onClick={() => onClickShifter("up")}>Shift Up →</button>
        </div>
      </div>

      <div className='flex flex-row justify-between'>
        <h1 className="text-xl font-bold font-heading text-primary mb-3">
          {/* join the chord names if more than 1   */}
          Select Chord 
        </h1>
        <button
          onClick={handleResetFilter}
          className='px-2 py-1 bg-card font-body border-border border-2 mb-2 rounded-2xl'
        >
          Reset Filter
        </button>
      </div>

    
      <div className='grid grid-cols-1 lg:grid-cols-4 gap-1 border-border border-2 rounded-2xl overflow-hidden mb-4'>
        {NOTES.map(note => (
          <button 
            key={note} 
            className={`p-2 rounded-sm font-body text-center cursor-pointer hover:bg-primary transition-colors
                ${selectedRoot === note 
                  ? "bg-primary text-background border-primary"
                  : "bg-muted border-border hover:border-primary"
                }
              `}
            onClick={() => setSelectedRoot(note)}
          >
            {note}
          </button>
        ))}
      </div>
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-1 border-border border-2 rounded-2xl overflow-hidden mb-3'>
        {Object.keys(chordTemplate).map(chord => (
          <button 
            key={chord} 
            className={`p-2 rounded-sm font-body text-center cursor-pointer hover:bg-primary transition-colors 
                ${selectedChordType === chord 
                  ? "bg-primary text-background border-primary"
                  : "bg-muted border-border hover:border-primary"
                }
              `}
            onClick={() => setSelectedChordType(chord)}
          >
            {chord}
          </button>
        ))}
      </div>
     {voicings.length > 0 && (
      <div className='flex justify-end items-center gap-3'>
        <button
          onClick={() => goToVoicing(Math.max(0, voicingIndex - 1))}
          disabled={voicingIndex === 0}
          className='px-3 py-1 rounded border border-border disabled:opacity-30'
        >
          ←
        </button>
        <span className="text-muted-foreground text-sm">
          Voicing {voicingIndex + 1} of {voicings.length}
          {/* {voicings[voicingIndex] && (
            <span className="ml-2 text-primary">
              (Fret {voicings[voicingIndex].startFret})
            </span>
          )} */}
        </span>
        <button
          onClick={() => goToVoicing(Math.min(voicings.length - 1, voicingIndex + 1))}
          disabled={voicingIndex === voicings.length - 1 || !voicings}
          className='px-3 py-1 rounded border border-border disabled:opacity-30'
        >
          →
        </button>
      </div>
     )}

    </div>
  )
}
