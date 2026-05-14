"use client";

import { useEffect, useState } from "react";
import Fretboard from "../../components/Fretboard";
import ModeToggle from "../../components/ModeToggle";
import ChordDisplay from "../../components/ChordDisplay";
import { chordIdentifier, ChordMatch, NOTES, STRINGS, getChordNotes, getChordPositions, getChordVoicings, Voicings, getScaleNotes, getScalePosition } from "../../lib/musicLogic";
import ScaleDisplay from "../../components/ScaleDisplay";
import { getMatchingScale, DiatonicChord } from "../../lib/progressionLogic";
import ProgressionBuilder from "../../components/ProgressionBuilder";
import { ProgressionTemplate, getDiatonicChords, buildProgression, PROGRESSION_TEMPLATES } from "../../lib/progressionLogic";
import build from "next/dist/build";
import { analyzeWithCohere } from "../../lib/aiAnalysis";
import AiAnalysis from "../../components/AiAnalysis";

// TODO: Make Grid for chord and scale section
// TODO: Create Chord Identification Logic

export default function Home() {
  const [mode, setMode] = useState<"chord" | "scale" | "progression">("chord");
  const [activeNotes, setActiveNotes] = useState<Set<string>>(new Set());
  const [chord, setChord] = useState<ChordMatch | null>(null);
  const [selectedRoot, setSelectedRoot] = useState<string | null>(null)
  const [selectedChordType, setSelectedChordType] = useState<string | null>(null)
  const [voicingIndex, setVoicingIndex] = useState<number>(0);
  const [voicings, setVoicings] = useState<Voicings[]>([])
  const [scaleType, setScaleType] = useState<string | null>(null);
  //progression 
  const [progression, setProgression] = useState<DiatonicChord[]>([])
  const [diatonicChords, setDiatonicChords] = useState<DiatonicChord[]>([])
  const [activeChordIndex, setActiveChordIndex] = useState<number | null>(null)
  const [progressionTemp, setProgressionTemp] = useState<ProgressionTemplate | null>(null)
  const [progressionKey, setProgressionKey] = useState<string>("C")
  const [progressionMode, setProgressionMode] = useState<"Major" | "Minor">("Major")
  const [analysis, setAnalysis] = useState<string>("");
  // const [scaleNotes, setScaleNotes] = useState<string[]>([])
  // console.log(scaleType)
  useEffect(() => {
    if (selectedRoot && selectedChordType) {
      
      const chordNotes = getChordNotes(selectedRoot, selectedChordType)
      const v = getChordVoicings(chordNotes);
      console.log(getChordVoicings(chordNotes, 4))
      setVoicings(v)
      setVoicingIndex(0)
      if (v.length > 0) setActiveNotes(new Set(v[0].positions))
    
        // setScaleNotes(scaleNotes)
        
      
      // setActiveNotes(new Set(patterns))
      
      // console.log("HELLOW WORLDDD")
      // console.log(getChordNotes(selectedRoot, selectedChordType)) 
      // console.log(getScaleNotes(selectedRoot, "Major"))
    }
  }, [selectedRoot, selectedChordType])

  useEffect(() => {
    if (scaleType && selectedRoot) {
      const scaleNotes = getScaleNotes(selectedRoot, scaleType)
      console.log(scaleNotes)
      const positions = getScalePosition(scaleNotes)
      setActiveNotes(new Set(positions))
      // setScaleNotes(scaleNotes)
    }
  }, [scaleType, selectedRoot])

  const shiftChordShape = (
    activeNotes: Set<string>,
    semitones: number
  ): Set<string> => {
    const shifted = new Set<string>();
    for (const note of activeNotes) {
      const [stringId, fretId] = note.split("-").map(Number);
      const newFretId = fretId + semitones;
      
      if (newFretId < 0 || newFretId > 15) {
        return activeNotes; // returns original shape
      }

      shifted.add(`${stringId}-${newFretId}`);
    }
    return shifted;
  }

  const onClickShifter = (direction: string) => {
    const semitones = direction === "up" ? 1 : -1;
    const shiftedNotes = shiftChordShape(activeNotes, semitones);
    setActiveNotes(shiftedNotes);
  }

  // const testFunction = async () => {
  //   const result = await analyzeWithCohere({
  //     type: "chord",
  //     chord: "E minor7",
  //     detectedNotes: ["E", "G", "B", "D"]
  //   })
  //   return result
  // }
  // console.log(testFunction())
  // useEffect(() => {
  //   if (progressionKey && progressionTemp){
  //   const diatonicChords = getDiatonicChords(progressionKey, progressionMode) 
  //   setProgression(diatonicChords) // default to diatonic chords of the key
  //   const newProgression = buildProgression(progressionTemp, progression)
  //   // console.log("progression temp: ", progressionTemp)
  //   // console.log("progression: ", progression)
  //   // console.log(buildProgression(progressionTemp, progression))
  //   // console.log("diatonic chords: ", diatonicChords)
  //   console.log("new progression PLSS: ", newProgression)
  //   }
  // }, [progressionKey, progressionTemp])


  // When a chord in the progression is clicked, show its scale on fretboard
  const handleProgressionChordClick = (chord: DiatonicChord, index: number, previewType: string) => {
    setActiveChordIndex(index)

  if (previewType === "scale") {
      const scaleName = getMatchingScale(chord.type)
      const scaleNotes = getScaleNotes(chord.root, scaleName)
      setActiveNotes(new Set(getScalePosition(scaleNotes)))
      setVoicings([]) //hide arrows when changing
    } else {
      // chord mode with voicings
      const chordNotes = getChordNotes(chord.root, chord.type)
      const v = getChordVoicings(chordNotes, 4)
      setVoicings(v)
      setVoicingIndex(0)
      if (v.length > 0) setActiveNotes(new Set(v[0].positions))
    }

    const scaleName = getMatchingScale(chord.type)
    const scaleNotes = getScaleNotes(chord.root, scaleName)
    setActiveNotes(new Set(getScalePosition(scaleNotes)))
  }

  const handlePlayProgressionChord = (root: string, type: string) => {
    setSelectedRoot(root);
    setSelectedChordType(type);
    // The existing useEffect in page.tsx will automatically catch this change, 
    // run getChordVoicings, and update the fretboard!
  }

  const getVoicings = (idx: number) => {
    setVoicingIndex(idx);
    setActiveNotes(new Set(voicings[idx].positions))
  }

  const handleResetFilter = () => {
    setSelectedRoot(null)
    setSelectedChordType(null)
    setActiveNotes(new Set())
    setVoicings([])
    setScaleType(null)
  }

  const handleModeChange = (newMode: "chord" | "scale" | "progression") => {
    setMode(newMode)
    handleResetFilter();
    setAnalysis("");
  }
  
  const activeNoteNames = Array.from(activeNotes).map(id => {
    const stringId = parseInt(id.split("-")[0]);
    const fretId = parseInt(id.split("-")[1]);

    const openNote = STRINGS[stringId];
    const openNoteIndex = NOTES.indexOf(openNote);
    return NOTES[(openNoteIndex + fretId) % 12];
  });
  console.log(mode)
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
        ): mode === "scale" ? (
          <h1 className="text-xl font-body mb-3">Add notes on Fretboard to create Scale</h1>
        ) : (
          <h1 className="text-xl font-body mb-3">Create Chord Progressions</h1>
        )}

        <div className="py-5 px-3 border-2 rounded-2xl border-border mb-5">
          <Fretboard 
            mode={mode}
            activeNotes={activeNotes}
            setActiveNotes={setActiveNotes}
            transparent={mode==="scale"}
          />
        </div>
        {/* change tmr, make a section using grid */}
        {/* <ChordDisplay />  */}
        <section className={`grid gap-6 ${mode === "progression" ? "grid-cols-1 lg:grid-cols-1" : "grid-cols-1 lg:grid-cols-2"}`}>
          {mode === "chord" ? (
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
              onClickShifter={onClickShifter}
            />
          ) : mode === "scale" ? (
            <ScaleDisplay 
              scaleType={scaleType}
              setScaleType={setScaleType}
              selectedRoot={selectedRoot}
              setSelectedRoot={setSelectedRoot}
            />
          ) : (
            <ProgressionBuilder 
              diatonicChords={diatonicChords}
              setDiatonicChords={setDiatonicChords}
              progression={progression}
              setProgression={setProgression}
              progressionKey={progressionKey}
              setProgressionKey={setProgressionKey}
              progressionMode={progressionMode}
              setProgressionMode={setProgressionMode}
              progressionTemp={progressionTemp}
              setProgressionTemp={setProgressionTemp}
              onChordClick={handleProgressionChordClick}
              activeChordIndex={activeChordIndex}
              voicings={voicings}
              voicingIndex={voicingIndex}
              goToVoicing={getVoicings}
            />
              // <ProgressionBuilder
              //   progression={progression}
              //   setProgression={setProgression}
              //   activeChordIndex={activeChordIndex}
              //   progressionKey={progressionKey}
              //   setProgressionKey={setProgressionKey}
              //   progressionMode={progressionMode}
              //   setProgressionMode={setProgressionMode}
              //   onChordClick={handleProgressionChordClick}
              // />
          )}
          <AiAnalysis 
            type={mode}
            matches={matches}
            keyStr={
              mode === "progression" 
                ? `${progressionKey} ${progressionMode}` 
                : (selectedRoot || undefined)
            }
            detectedNotes={uniqueNoteNames}
            progression={progression}
            progressionKey={progressionKey}
            progressionMode={progressionMode}
            analysis={analysis}
            setAnalysis={setAnalysis}
            scaleType={scaleType}
          />
        </section>

        {/* <button className="bg-accent text-background px-4 py-2 rounded">
          Analyze Chord
        </button> */}
      </div>
    </div>
  );
}
