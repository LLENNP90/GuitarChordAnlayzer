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
  analysis: string
  setAnalysis: (analysis: string) => void
  scaleType: string | null
}

export default function AiAnalysis({
  matches, type, keyStr, detectedNotes, progression, progressionKey, progressionMode
  , analysis, setAnalysis, scaleType
}: AiAnalysisProps
) {

  
  const [loading, setLoading] = useState(false);
  
  const isReadyToAnalyze = 
    type === "chord" ? matches.length > 0 :
    type === "scale" ? (!!keyStr && !!scaleType) :
    type === "progression" ? (progression && progression.length > 0) : false;

  const handleAnalyze = async () => {
    // if (matches.length === 0) return
    setLoading(true)
    try {
      console.log("Analyzing...");
      const result = 
        type === "chord"
        ? await analyzeWithCohere({
          type: "chord",
          chord: matches[0].fullName,
          detectedNotes: detectedNotes
        })
        : type === "scale"
        ? await analyzeWithCohere({
          type: "scale",
          scale: `${keyStr} ${scaleType}` || "unknown",
          key: keyStr
        })
        : await analyzeWithCohere({
          type: "progression",
          progression: progression?.map(c => c.fullName) || [],
          key: `${progressionKey} ${progressionMode}`
        })
      setAnalysis(result)  
    }
    catch (error) {
      console.error("Error occurred while analyzing:", error);
      setAnalysis("Oops! Something went wrong analyzing that.");
    }
    finally { 
      setLoading(false)
    }
  }

  // For progression mode:
  // const handleAnalyzeProgression = async () => {
  //   setLoading(true)
  //   const result = await analyzeWithCohere({
  //     type: "progression",
  //     progression: progression?.map(c => c.fullName) || [],
  //     key: `${progressionKey} ${progressionMode}`
  //   })
  //   setAnalysis(result)
  //   setLoading(false)
  // }

  return (
    <div className="p-4 bg-card rounded-lg border border-border">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xl font-bold text-primary flex items-center gap-2">
          ✨ AI Theory Assistant
        </h2>
        <button
          onClick={handleAnalyze}
          disabled={loading || !isReadyToAnalyze }
          className="w-50 p-3 bg-primary text-background rounded-lg disabled:opacity-50 cursor-pointer hover:bg-primary/90 transition-colors "
        >
          {loading ? "Analyzing..." : `✦ Explain This ${type.charAt(0).toUpperCase() + type.slice(1)}`}
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
