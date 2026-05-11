import { list } from "postcss";
import { note } from "tonal";

export const NOTES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "Bb", "B"];
export const STRINGS = ["E", "B", "G", "D", "A", "E"];

const NOTE_TO_SEMITONE:Record<string, number> = Object.fromEntries(
  NOTES.map((note, i) => [note, i])
) //enumerate 

export interface ChordMatch {
  root: string
  type: string
  fullName: string
}

export interface Voicings {
  positions: string[]
  startFret: number
}

export const chordTemplate: Record<string, number[]> = {
  major: [0, 4, 7],
  minor: [0, 3, 7],
  major7: [0, 4, 7, 11],
  minor7: [0, 3, 7, 10],
  diminished: [0, 3, 6],
  augmented: [0, 4, 8],
  sus2: [0, 2, 7],
  sus4: [0, 5, 7],
  add9: [0, 2, 4, 7]
}

// get chord based on root & type
export function getChordNotes(root: string, chordType: string):string[] {
  const rootSemitone = NOTE_TO_SEMITONE[root]
  const cTemplate = chordTemplate[chordType]
  return cTemplate.map(interval => 
    NOTES[(rootSemitone + interval) % 12]
  );
}

//problem: gets all the possible notes, not realistic
//solution: add voicings? max 4 fret ig
export function getChordPositions(chordNotes: string[]): string[] {
  const noteSet = new Set(chordNotes);
  const positions: string[] = [];

  STRINGS.forEach((openNote, si) => {
    const openIndex = NOTES.indexOf(openNote);
    for (let fi = 0; fi <= 15; fi++) {
      const noteName = NOTES[(openIndex + fi) % 12];
      if (noteSet.has(noteName)) {
        positions.push(`${si}-${fi}`);
      }
    }
  });
  return positions;
}

export function getChordVoicings(chordNotes: string[], maxSpan: number = 4){
  const noteSet = new Set(chordNotes)
  const voicings:Voicings[] = []
  
  for (let windowStart = 0; windowStart < 12; windowStart++){
    const windowEnd = windowStart + maxSpan // first iteration: winS, winE = 0,4
    const positions: string[] = []
    const notesFound = new Set<string>();

    STRINGS.forEach((openNote, si) => {
      const openIndex = NOTES.indexOf(openNote);
      for (let fi = windowStart; fi <= windowEnd; fi++) {
        const noteName = NOTES[(openIndex + fi) % 12];
        if (noteSet.has(noteName)) {
          positions.push(`${si}-${fi}`);
          notesFound.add(noteName)
          break;
        }
      }
    })
    // console.log(notesFound)
    const hasAllNotes = chordNotes.every(n => notesFound.has(n));
    const isCompact = positions.length >= 3 && positions.length <= 6;

    if (hasAllNotes && isCompact) {
      const isDuplicate = voicings.some(v =>
        v.positions.join() === positions.join()
      );
      if (!isDuplicate){
        voicings.push({positions, startFret:windowStart})
      }
    }
  }

  return voicings
}

export function chordIdentifier(chord: string[]) {
  chord.map(note => {
    if (!(note in NOTE_TO_SEMITONE)) throw new Error(`Invalid Note: ${note}`)
  })
  
  const semitones = chord.map(note => NOTE_TO_SEMITONE[note])
  // console.log(semitones);
  const matches: ChordMatch[] = [];

  for (let i = 0; i < semitones.length; i++ ){
    const rootSemitone = semitones[i]
    const rootName = chord[i]

    const intervals = semitones
      .map(s => (s - rootSemitone + 12) % 12)
      .sort((a, b) => a - b);
      // console.log(intervals)

    for (const [chordType, template] of Object.entries(chordTemplate)) {
      
      // console.log(chordType, template)
      // console.log(intervals, template)
      
      if (template.length == intervals.length && template.every((val, idx) => val === intervals[idx])) {
        matches.push({
          root: rootName,
          type: chordType,
          fullName: `${rootName} ${chordType}`
        })
      }
    }
  }
  // console.log(matches)
  return matches
  
}