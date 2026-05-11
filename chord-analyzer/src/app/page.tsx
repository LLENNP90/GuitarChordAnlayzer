"use client";

import { useEffect, useState } from "react";
import Fretboard from "../../components/Fretboard";
import ModeToggle from "../../components/ModeToggle";
import ChordDisplay from "../../components/ChordDisplay";
import { chordIdentifier, ChordMatch, NOTES, STRINGS, getChordNotes, getChordPositions, getChordVoicings, Voicings } from "../../lib/musicLogic";

// TODO: Make Grid for chord and scale section
// TODO: Create Chord Identification Logic

export default function Home() {
  const [mode, setMode] = useState<"chord" | "scale">("chord");
  const [activeNotes, setActiveNotes] = useState<Set<string>>(new Set());
  const [chord, setChord] = useState<ChordMatch | null>(null);
  const [selectedRoot, setSelectedRoot] = useState<string | null>(null)
  const [selectedChordType, setSelectedChordType] = useState<string | null>(null)
  const [voicingIndex, setVoicingIndex] = useState<number>(0);
  const [voicings, setVoicings] = useState<Voicings[]>([])


  useEffect(() => {
    if (selectedRoot && selectedChordType) {
      const chordNotes = getChordNotes(selectedRoot, selectedChordType)
      const v = getChordVoicings(chordNotes);
      console.log(getChordVoicings(chordNotes, 4))
      setVoicings(v)
      setVoicingIndex(0)
      if (v.length > 0) setActiveNotes(new Set(v[0].positions))

      // setActiveNotes(new Set(patterns))
      
      // console.log("HELLOW WORLDDD")
      // console.log(getChordNotes(selectedRoot, selectedChordType)) 
    }
  }, [selectedRoot, selectedChordType])

  const getVoicings = (idx: number) => {
    setVoicingIndex(idx);
    setActiveNotes(new Set(voicings[idx].positions))
  }

  const handleResetFilter = () => {
    setSelectedRoot(null)
    setSelectedChordType(null)
    setActiveNotes(new Set())
    setVoicings([])
  }

  const handleModeChange = (newMode: "chord" | "scale") => {
    setMode(newMode)
    handleResetFilter();
  }
  
  const activeNoteNames = Array.from(activeNotes).map(id => {
    const stringId = parseInt(id.split("-")[0]);
    const fretId = parseInt(id.split("-")[1]);

    const openNote = STRINGS[stringId];
    const openNoteIndex = NOTES.indexOf(openNote);
    return NOTES[(openNoteIndex + fretId) % 12];
  });

  const uniqueNoteNames = Array.from(new Set(activeNoteNames));

  const matches: ChordMatch[] = uniqueNoteNames.length > 0 ? chordIdentifier(uniqueNoteNames) : []

  // console.log(matches.map(m => {
  //   m.fullName
  // }))
  return (
    <div className="bg-background font-sans min-h-screen ">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                {/* <Guitar className="w-6 h-6 text-primary" /> */}
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-foreground">
                  Fretboard Studio
                </h1>
                <p className="text-sm text-muted-foreground">
                  Chord & Scale Analyzer
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>
      {/* Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Button Selector */}
        <div className="mt-3 mb-5 ">
          <ModeToggle 
            mode={mode}
            onModeChange={handleModeChange}
          />
        </div>
        {mode === "chord" ? (
          <h1 className="text-xl font-body mb-3">Click on Fretboard to create Chord</h1>
        ): (
          <h1 className="text-xl font-body mb-3">Add notes on Fretboard to create Scale</h1>
        )}

        <div className="py-5 px-3 border-2 rounded-2xl border-border mb-5">
          <Fretboard 
            mode={mode}
            activeNotes={activeNotes}
            setActiveNotes={setActiveNotes}
          />
        </div>
        {/* change tmr, make a section using grid */}
        {/* <ChordDisplay />  */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {mode === "chord" && (
            <ChordDisplay 
              matches={matches}
              uniqueNoteNames={uniqueNoteNames}
              selectedRoot={selectedRoot}
              setSelectedRoot={setSelectedRoot}
              selectedChordType={selectedChordType}
              setSelectedChordType={setSelectedChordType}
              voicings={voicings}
              setVoicings={setVoicings}
              voicingIndex={voicingIndex}
              setVoicingIndex={setVoicingIndex}
              goToVoicing={getVoicings}
              handleResetFilter={handleResetFilter}
            />
          )}

        </section>

        {/* <button className="bg-accent text-background px-4 py-2 rounded">
          Analyze Chord
        </button> */}
      </div>
    </div>
  );
}
