"use client";
import React from 'react'

interface ModeToggleProps{
  mode: "chord" | "scale";
  onModeChange: (mode: "chord" | "scale") => void;
}

export default function ModeToggle({
  mode,
  onModeChange,
}: ModeToggleProps) {
  return (
    <div>
      <div className="bg-muted rounded-lg p-1 gap-1 flex max-w-33">
        <button
          onClick={() => onModeChange("chord")}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${
            mode === "chord"
              ? "bg-primary text-black"
              : "text-gray-400 hover:text-foreground"
          }`}
        >
          {/* <Guitar className="w-4 h-4" /> */}
          Chord
        </button>
        <button
          onClick={() => onModeChange("scale")}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${
            mode === "scale"
              ? "bg-primary text-black"
              : "text-gray-400 hover:text-foreground"
          }`}
        >
          {/* <Music className="w-4 h-4" /> */}
          Scale
        </button>
      </div>
    </div>
  )
}
