"use client";

import { useState } from "react";
import Fretboard from "../../components/Fretboard";
import ModeToggle from "../../components/ModeToggle";
import ChordDisplay from "../../components/ChordDisplay";

// TODO: Make Grid for chord and scale section
// TODO: Create Chord Identification Logic

export default function Home() {
  const [mode, setMode] = useState<"chord" | "scale">("chord");

  const handleModeChange = (newMode: "chord" | "scale") => {
    setMode(newMode)

  }

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
          />
        </div>
        {/* change tmr, make a section using grid */}
        <ChordDisplay /> 
        {/* <button className="bg-accent text-background px-4 py-2 rounded">
          Analyze Chord
        </button> */}
      </div>
    </div>
  );
}
