import React, { useEffect, useState } from 'react'
import { NOTES, Voicings } from '../lib/musicLogic'
import { buildProgression, DiatonicChord, getDiatonicChords, PROGRESSION_TEMPLATES, ProgressionTemplate } from '../lib/progressionLogic'
import {
  DndContext, DragEndEvent, DragOverEvent, DragStartEvent,
  DragOverlay, closestCenter, PointerSensor, useSensor, useSensors,
  useDroppable, pointerWithin
} from "@dnd-kit/core"
import {
  SortableContext, horizontalListSortingStrategy,
  useSortable, arrayMove
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
// import { pointerIntersection } from '@dnd-kit/collision';

interface ProgressionBuilderProps{
  diatonicChords: DiatonicChord[]
  setDiatonicChords: React.Dispatch<React.SetStateAction<DiatonicChord[]>>
  progression: DiatonicChord[]
  setProgression: React.Dispatch<React.SetStateAction<DiatonicChord[]>>
  progressionKey: string
  setProgressionKey: React.Dispatch<React.SetStateAction<string>>
  progressionMode: "Major" | "Minor"
  setProgressionMode: React.Dispatch<React.SetStateAction<"Major" | "Minor">>
  progressionTemp: ProgressionTemplate | null
  setProgressionTemp: React.Dispatch<React.SetStateAction<ProgressionTemplate | null>>
  onChordClick: (chord: DiatonicChord, index: number, previewType: "chord" | "scale") => void
  activeChordIndex: number | null
  voicings: Voicings[]
  voicingIndex: number
  goToVoicing: (idx: number) => void
}

function PaletteChordCard({ chord, id }: { chord: DiatonicChord; id: string }) {
  const { attributes, listeners, setNodeRef, isDragging } = useSortable({ id })

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={`flex flex-col items-center p-2 min-w-[64px] bg-muted rounded-lg border
                  border-border cursor-grab select-none transition-opacity
                  ${isDragging ? "opacity-30" : "hover:border-primary"}`}
    >
      <span className="text-xs opacity-60">{chord.roman}</span>
      <span className="font-bold text-sm">{chord.root}</span>
      <span className="text-xs opacity-60">{chord.type}</span>
    </div>
  )
}

function ProgressionChordCard({
  chord, id, isActive, onClick, onRemove
}: {
  chord: DiatonicChord; id: string; isActive: boolean
  onClick: () => void; onRemove: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`relative flex flex-col items-center p-3 min-w-[70px] rounded-lg border
                  select-none transition-all
                  ${isDragging ? "opacity-30 scale-95" : ""}
                    ${isActive
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card border-border hover:border-primary cursor-pointer"}`}
      onClick={onClick}
    >
      {/* Drag handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute top-1 right-1 cursor-grab opacity-30 hover:opacity-80 text-xs leading-none"
        onClick={e => e.stopPropagation()}
      >
        ⠿
      </div>

      <span className="text-xs opacity-60">{chord.roman}</span>
      <span className="font-bold">{chord.root}</span>
      <span className="text-xs opacity-70">{chord.type}</span>

      {/* Remove × */}
      <button
        onClick={e => { e.stopPropagation(); onRemove() }}
        className="absolute -top-2 -left-2 w-5 h-5 rounded-full bg-destructive text-white
                  text-xs flex items-center justify-center opacity-0 hover:opacity-100
                  transition-opacity"
      >
        ×
      </button>
    </div>
  )
}

// nice ghost card
function DragGhostCard({ chord }: { chord: DiatonicChord }) {
  return (
    <div className="flex flex-col items-center p-3 min-w-[70px] rounded-lg border
                    border-primary bg-primary/20 shadow-xl rotate-2 cursor-grabbing">
      <span className="text-xs opacity-60">{chord.roman}</span>
      <span className="font-bold">{chord.root}</span>
      <span className="text-xs opacity-70">{chord.type}</span>
    </div>
  )
}

// Droppable zone for progression bar
function ProgressionDropZone({ children, isEmpty }: { children: React.ReactNode; isEmpty: boolean }) {
  const { setNodeRef, isOver } = useDroppable({ id: "progression-drop-zone" })

  console.log("HERE")

  return (
    <div
      ref={setNodeRef}
      className={`flex gap-2 flex-wrap min-h-[90px] p-3 rounded-xl border-2 border-dashed
                  transition-colors duration-150
                  ${isOver ? "border-primary bg-primary/5" : "border-border"}
                  ${isEmpty ? "items-center justify-center" : ""}`}
    >
      {isEmpty && !isOver && (
        <p className="text-sm text-muted-foreground italic">
          Drag chords here or click a template
        </p>
      )}
      {isOver && isEmpty && (
        <p className="text-sm text-primary">Drop to add</p>
      )}
      {children}
    </div>
  )
}

export default function ProgressionBuilder({
  diatonicChords,
  setDiatonicChords,
  progression,
  setProgression,
  progressionKey,
  setProgressionKey,
  progressionMode,
  setProgressionMode, 
  progressionTemp,
  setProgressionTemp,
  onChordClick, activeChordIndex
}: ProgressionBuilderProps) {

  // const diatonicChords = getDiatonicChords(progressionKey, progressionMode)

  // console.log(progression)

  // const applyTemplate = () => {
  //   if (progressionTemp && progressionKey && progressionMode ){
  //     const diatonicChords = getDiatonicChords(progressionKey, progressionMode)
  //     setProgression(buildProgression(progressionTemp, diatonicChords))
  //     // const newProgression = buildProgression(progressionTemp, diatonicChords)
      
  //     // setProgression(buildProgression(progressionTemp, progression))
  //   }
    
  // }



  useEffect(() => {
    const chords = getDiatonicChords(progressionKey, progressionMode)
    setDiatonicChords(chords)
    console.log("diatonicChordS: ",diatonicChords)
    if (progressionTemp){
      const newProgression = buildProgression(progressionTemp, chords)
      setProgression(newProgression)
      console.log("new Prog",newProgression)
    }
  }, [progressionKey, progressionMode, progressionTemp])

  // const onChangeTemplate = () => {
  //   if (progressionTemp && progressionKey && progressionMode ){
  //     setProgression([])
  //     applyTemplate()
  //   } 
  // }

  const [activeId, setActiveId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 }  // prevents accidental drags on click
    })
  )

  // Figure out what's being dragged for the overlay
  const draggingChord = activeId
    ? activeId.startsWith("palette-")
      ? diatonicChords.find(c => `palette-${c.roman}` === activeId)
      : progression.find((_, i) => `prog-${i}` === activeId)
    : null

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(String(event.active.id))
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)

    if (!over) return

    const activeIdStr = String(active.id)
    const overIdStr = String(over.id)

    // Case 1: Dragging from palette to progression bar
    if (activeIdStr.startsWith("palette-")) {
      const chord = diatonicChords.find(c => `palette-${c.roman}` === activeIdStr)
      if (!chord) return

      // Drop onto the zone itself or onto an existing progression card
      const isDropOnZone = overIdStr === "progression-drop-zone"
      const isDropOnProgCard = overIdStr.startsWith("prog-")

      if (isDropOnZone || isDropOnProgCard) {
        if (isDropOnProgCard) {
          // Insert before the card it's dropped on
          const overIndex = progression.findIndex((_, i) => `prog-${i}` === overIdStr)
          setProgression(prev => {
            const next = [...prev]
            next.splice(overIndex, 0, chord)
            return next
          })
        } else {
          // Append to end
          setProgression(prev => [...prev, chord])
        }
      }
      return
    }

    //Case 2: Reordering inside the progression bar
    if (activeIdStr.startsWith("prog-") && overIdStr.startsWith("prog-")) {
      const oldIndex = progression.findIndex((_, i) => `prog-${i}` === activeIdStr)
      const newIndex = progression.findIndex((_, i) => `prog-${i}` === overIdStr)
      if (oldIndex !== newIndex) {
        setProgression(arrayMove(progression, oldIndex, newIndex))
      }
    }
  }

  return (
    <div className='mb-4 p-4 bg-card rounded-lg border border-border'>
      <div className='flex flex-row justify-between'>
        <h1 className="text-xl font-bold text-primary mb-3 items-center">
          Progressions: 
        </h1>
        <div className='flex flex-row py-1 px-3 gap-3 mb-2'>
          <button 
            onClick={() => setProgressionMode("Major")}
            className={`flex-1 py-0 px-5 rounded font-bold border transition-colors cursor-pointer ${progressionMode === "Major" ? "bg-primary text-background border-primary" : "bg-muted border-border hover:border-primary"}`}
          >
            Major Key
          </button>
          <button 
            onClick={() => setProgressionMode("Minor")}
            className={`flex-1 py-0 px-5 rounded font-bold border transition-colors cursor-pointer ${progressionMode === "Minor" ? "bg-primary text-background border-primary" : "bg-muted border-border hover:border-primary"}`}
          >
            Minor Key
          </button>
        </div>
      </div>
   
      <div className='flex flex-row py-2 px-3 gap-3 mb-4'>
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
                  ${progressionTemp?.degrees === p.degrees ? 'bg-primary text-primary-foreground' : "bg-muted border-border hover:border-primary"}
                `}
              onClick={() => {setProgressionTemp(p); }}
            >
              <p>{p.name}</p>
              <p className='text-xs opacity-60'>{p.degrees.map(d => diatonicChords[d]?.roman ?? "?").join(" - ")}</p>
            </button>
          ))}
        </div>
        
      </div>
      {/* <p className="text-xs text-muted-foreground mb-2">Your Progression</p> */}
      <DndContext
        sensors={sensors}
        collisionDetection={pointerWithin}
        // collisionDetection={pointerIntersection}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        {/* Progression bar */}
        <div className='mb-3'>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-muted-foreground">Your Progression</p>
            {/* To clear the progression */}
            {progression.length > 0 && (
              <button
                onClick={() => { setProgression([]); setProgressionTemp(null) }}
                className="text-xs text-muted-foreground hover:text-destructive transition-colors"
              >
                Clear
              </button>
            )}
          </div>

          <ProgressionDropZone isEmpty={progression.length === 0}>
            <SortableContext
              items={progression.map((_, i) => `prog-${i}`)}
              strategy={horizontalListSortingStrategy}
            >
              {progression.map((chord, i) => (
                <ProgressionChordCard
                  key={`prog-${i}`}
                  id={`prog-${i}`}
                  chord={chord}
                  isActive={activeChordIndex === i}
                  onClick={() => onChordClick(chord, i, "chord")}
                  onRemove={() => setProgression(prev => prev.filter((_, idx) => idx !== i))}
                />
              ))}
            </SortableContext>
          </ProgressionDropZone>
        </div>

        {/* Diatonic palette */}
        <div>
          <p className="text-xs text-muted-foreground mb-2">
            {progressionKey} {progressionMode} — drag to progression or click to add
          </p>
          <SortableContext
            items={diatonicChords.map(c => `palette-${c.roman}`)}
            strategy={horizontalListSortingStrategy}
          >
            <div className="flex gap-2 flex-wrap">
              {diatonicChords.map(chord => (
                <div
                  key={chord.roman}
                  onClick={() => setProgression(prev => [...prev, chord])}
                >
                  <PaletteChordCard
                    chord={chord}
                    id={`palette-${chord.roman}`}
                  />
                </div>
              ))}
            </div>
          </SortableContext>
        </div>

        {/* Drag overlay — the ghost card following cursor */}
        <DragOverlay>
          {draggingChord && <DragGhostCard chord={draggingChord} />}
        </DragOverlay>
      </DndContext>
    </div>
  )
}
