"use client";

import React, { useState } from 'react'
import { analyzeWithCohere } from '../lib/aiAnalysis';
import { ChordMatch } from '../lib/musicLogic';
import { DiatonicChord } from '../lib/progressionLogic';

interface AiAnalysisProps{
  matches: ChordMatch[]
  type: "chord" | "scale" | "progression"
  keyStr?: string
  detectedNotes?: string[]
  progression?: DiatonicChord[]
  progressionKey?: string
  progressionMode?: string
}

export default function AiAnalysis({
  matches, type, keyStr, detectedNotes, progression, progressionKey, progressionMode
}: AiAnalysisProps
) {

  const [analysis, setAnalysis] = useState<string>("");
  const [loading, setLoading] = useState(false);
  
  const handleAnalyze = async () => {
    if (matches.length === 0) return
    setLoading(true)
    const result = await analyzeWithCohere({
      type: "chord",
      chord: matches[0].fullName,
      detectedNotes: detectedNotes
    })
    setAnalysis(result)
    setLoading(false)
  }

  // For progression mode:
  const handleAnalyzeProgression = async () => {
    setLoading(true)
    const result = await analyzeWithCohere({
      type: "progression",
      progression: progression?.map(c => c.fullName) || [],
      key: `${progressionKey} ${progressionMode}`
    })
    setAnalysis(result)
    setLoading(false)
  }

  return (
    <div className="p-4 bg-card rounded-lg border border-border">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xl font-bold text-primary flex items-center gap-2">
          ✨ AI Theory Assistant
        </h2>
        <button
          onClick={handleAnalyze}
          disabled={loading || matches.length === 0}
          className="w-50 p-3 bg-primary text-background rounded-lg disabled:opacity-50"
        >
          {loading ? "Analyzing..." : "✦ Explain This Chord"}
        </button>
      </div>

      <div className="p-4 bg-muted rounded border border-border min-h-[100px] text-foreground">
        {loading ? (
          <p className="text-muted-foreground animate-pulse">Consulting the music theory textbooks...</p>
        ) : analysis ? (
          <p className="whitespace-pre-wrap">{analysis}</p>
        ) : (
          <p className="text-muted-foreground text-sm text-center mt-6">
            Click analyze to get AI-powered insights about your {type}.
          </p>
        )}
      </div>
    </div>
  )
}
