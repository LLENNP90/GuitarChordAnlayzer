// lib/progressionLogic.ts
import { NOTES } from "./musicLogic"

const MAJOR_CHORD_TYPES = ["major","minor","minor","major","major","minor","diminished"]
const MINOR_CHORD_TYPES = ["minor","diminished","major","minor","minor","major","major"]
const ROMAN_NUMERALS_MAJOR = ["I","ii","iii","IV","V","vi","vii°"]
const ROMAN_NUMERALS_MINOR = ["i","ii°","III","iv","v","VI","VII"]

export interface DiatonicChord {
  roman: string
  root: string
  type: string
  fullName: string
  degree: number
}

export function getMatchingScale(chordType: string): string {
  const scaleMap: Record<string, string> = {
    major:      "Major",
    minor:      "Natural Minor",
    major7:     "Major",
    minor7:     "Dorian",
    diminished: "Locrian",
    augmented:  "Lydian",
    sus2:       "Major Pentatonic",
    sus4:       "Major Pentatonic",
  }
  return scaleMap[chordType] ?? "Major"
}

export function getDiatonicChords(root: string, mode: "Major" | "Minor"): DiatonicChord[] {
  const pattern = mode === "Major"
    ? [0,2,4,5,7,9,11] //major scale
    : [0,2,3,5,7,8,10] //minor scale

  const chordTypes = mode === "Major" ? MAJOR_CHORD_TYPES : MINOR_CHORD_TYPES
  const numerals   = mode === "Major" ? ROMAN_NUMERALS_MAJOR : ROMAN_NUMERALS_MINOR

  const rootIdx = NOTES.indexOf(root)
  return pattern.map((interval, i) => {
    const chordRoot = NOTES[(rootIdx + interval) % 12]
    return {
      roman:    numerals[i],
      root:     chordRoot,
      type:     chordTypes[i],
      fullName: `${chordRoot} ${chordTypes[i]}`,
      degree:   i
    }
  })
}

export interface ProgressionTemplate {
  name: string
//   genre: string
  degrees: number[]   // index into diatonic chords array
}

export const PROGRESSION_TEMPLATES: ProgressionTemplate[] = [
  { name: "Pop", degrees: [0,4,5,3] },   // I-V-vi-IV
  { name: "50s", degrees: [0,5,3,4] },   // I-vi-IV-V
  { name: "Jazz", degrees: [1,4,0] },   // ii-V-I
  { name: "Rock", degrees: [0,3,4,3] },   // I-IV-V-IV
  { name: "J-pop", degrees: [3,4,2,5] }, //IV-V-iii-vi
  { name: "Sad", degrees: [0,3,0,4]} // i-iv-i-V
]

// Apply a template to a key — returns actual chord names
export function buildProgression(
  template: ProgressionTemplate,
  diatonicChords: DiatonicChord[]
): DiatonicChord[] {
  return template.degrees.map(degree => diatonicChords[degree])
}