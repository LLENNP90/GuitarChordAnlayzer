import React from 'react'
import { NOTES } from '../lib/musicLogic'
import { buildProgression, DiatonicChord, getDiatonicChords, PROGRESSION_TEMPLATES } from '../lib/progressionLogic'

interface ProgressionBuilderProps{
  progression: DiatonicChord[]
  setProgression: React.Dispatch<React.SetStateAction<DiatonicChord[]>>
  progressionKey: string
  setProgressionKey: React.Dispatch<React.SetStateAction<string>>
  progressionMode: "Major" | "Minor"
  setProgressionMode: React.Dispatch<React.SetStateAction<"Major" | "Minor">>
}

export default function ProgressionBuilder({
  progression,
  setProgression,
  progressionKey,
  setProgressionKey,
  progressionMode,
  setProgressionMode
}: ProgressionBuilderProps) {

  const diatonicChords = getDiatonicChords(progressionKey, progressionMode)

  console.log(progression)

  const applyTemplate = (degrees: number[]) => {
    setProgression(buildProgression({ name: "", degrees }, diatonicChords))
  }

  return (
    <div className='mb-4 p-4 bg-card rounded-lg border border-border'>
      <h1 className="text-xl font-bold text-primary mb-3">
        Progressions: 
      </h1>
      <div className='flex flex-row py-2 px-3 gap-3'>
        <div className='flex-5 grid grid-cols-1 lg:grid-cols-4 gap-1 border-border border-2 rounded-2xl overflow-hidden'>
          {NOTES.map(note => (
            <button
              key={note}
              className={`p-2 rounded-sm text-center cursor-pointer hover:bg-primary transition-colors
                  ${progressionKey === note ? 'bg-primary text-primary-foreground' : "bg-muted border-border hover:border-primary"}
                `}
              onClick={() => setProgressionKey(note)}
            >
              {note}
            </button>
          ))}
        </div>
        <div className='border-border flex-3 grid grid-cols-1 lg:grid-cols-2 gap-1 border-2 rounded-2xl overflow-hidden'>
          {PROGRESSION_TEMPLATES.map(p => (
            <button 
              key={p.name}
              className={`p-2 rounded-sm text-center cursor-pointer hover:bg-primary transition-colors
                  ${progression.some(c => c.type === p.name) ? 'bg-primary text-primary-foreground' : "bg-muted border-border hover:border-primary"}
                `}
              onClick={() => applyTemplate(p.degrees)}
            >
              {p.name}
            </button>
          ))}
        </div>
        
      </div>
      <div className='flex border-border bg-muted rounded-2xl border-2 p-4 mt-4'>
        <p>FUCKKK</p>
      </div>  
    </div>
  )
}
