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
import { api } from "../../lib/api";
import { getAuthToken, removeAuthToken } from "../../lib/auth";
import SavedPanel from "../../components/SavedPanel";
import { Guitar } from "lucide-react";
import { useRouter } from "next/navigation";
import { getCagedVoicings, cagedVoicingToActiveNotes, CagedVoicing } from "../../lib/cagedLogic";

// TODO: Make Grid for chord and scale section
// TODO: Create Chord Identification Logic

export type SavedItem = {
  id: string;
  savedType: "chord" | "scale" | "progression";
  name: string;
  key?: string | null;
  mode?: string | null;
  notes: string[];
  chord: string[];
  voicingIndex?: number | null;
  createdAt: string;
};

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
  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveLoading, setSaveLoading] = useState<boolean>(false);
  const [selectedSaved, setSelectedSaved] = useState<SavedItem | null>(null);
  const [progressionName, setProgressionName] = useState("");
  const [currentUser, setCurrentUser] = useState<{
    id: string;
    username: string;
    email: string;
    name?: string | null;
  } | null>(null);

  const [authMenuOpen, setAuthMenuOpen] = useState(false);

  const [cagedVoicings, setCagedVoicings] = useState<CagedVoicing[]>([]);
  const [cagedIndex, setCagedIndex] = useState(0);

  const router = useRouter();
  // const [scaleNotes, setScaleNotes] = useState<string[]>([])
  // console.log(scaleType)

  //get current user
  useEffect(() => {
    async function loadCurrentUser() {
      try {
        if (!getAuthToken()) {
          setCurrentUser(null);
          return;
        }

        const data = await api.getMe();
        setCurrentUser(data.user);
      } catch {
        removeAuthToken();
        setCurrentUser(null);
      }
    }

    loadCurrentUser();
  }, []);

  const handleLogout = () => {
    removeAuthToken();
    setCurrentUser(null);
    setAuthMenuOpen(false);
    setSavedItems([]);
    setSelectedSaved(null);
  };

  useEffect(() => {
    if (!selectedRoot || selectedChordType !== "major") {
      setCagedVoicings([]);
      setCagedIndex(0);
      return;
    }

    const nextCagedVoicings = getCagedVoicings(selectedRoot);

    setCagedVoicings(nextCagedVoicings);
    setCagedIndex(0);
  }, [selectedRoot, selectedChordType]);

  const showCurrentCagedShape = () => {
    const currentVoicing = cagedVoicings[cagedIndex];
    if (!currentVoicing) return;

    setActiveNotes(cagedVoicingToActiveNotes(currentVoicing));
    setVoicings([]);
  };

  const goToNextCagedShape = () => {
    if (cagedVoicings.length === 0) return;

    const nextIndex = (cagedIndex + 1) % cagedVoicings.length;
    const nextVoicing = cagedVoicings[nextIndex];

    setCagedIndex(nextIndex);
    setActiveNotes(cagedVoicingToActiveNotes(nextVoicing));
    setVoicings([]);
  }

  const goToPreviousCagedShape = () => {
    if (cagedVoicings.length === 0) return;

    const nextIndex =
      cagedIndex === 0 ? cagedVoicings.length - 1 : cagedIndex - 1;

    const nextVoicing = cagedVoicings[nextIndex];

    setCagedIndex(nextIndex);
    setActiveNotes(cagedVoicingToActiveNotes(nextVoicing));
    setVoicings([]);
  };
  const currentCagedVoicing = cagedVoicings[cagedIndex];

  useEffect(() => {
    if (selectedRoot && selectedChordType) {
      
      const chordNotes = getChordNotes(selectedRoot, selectedChordType)
      const v = getChordVoicings(chordNotes);
      const safeIndex = Math.min(voicingIndex, Math.max(v.length - 1, 0));

      // console.log(getChordVoicings(chordNotes, 4))
      setVoicings(v)
      // setVoicingIndex(0)
      if (v.length > 0) setActiveNotes(new Set(v[safeIndex].positions))
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

  const loadSavedItems = async (type: "chord" | "scale" | "progression") => {
    try{
      const token = getAuthToken();
      if (!token) return

      const data = await api.getSaved(type)
      setSavedItems(data.saved);
    } catch (error) {
      console.error("Error loading saved items:", error);
      setSaveError("Failed to load saved items.");
    }
  } 

  useEffect(() => {
    loadSavedItems(mode);
  }, [mode]);

  const handleSaveItems = async (type: "chord" | "scale" | "progression") => {
    try{
      setSaveError(null);
      setSaveLoading(true);

      if (!getAuthToken()) {
        setSaveError("You must be logged in to save items.");
        setSaveLoading(false);
        return;
      }

      
      if (type === "chord") {
        const firstMatch = matches[0];
        if (!firstMatch) {
          setSaveError("No chord detected to save.");
          setSaveLoading(false);
          return;
        }

        await api.createSaved("chord", {
          name: `${firstMatch.fullName} - ${voicings.length > 0 ? `Voicing ${voicingIndex + 1}` : "No Voicing"}`,
          key: selectedRoot || firstMatch.root,
          mode: selectedChordType || firstMatch.type,
          notes: uniqueNoteNames,
          chord: [firstMatch.fullName],
          voicingIndex: voicingIndex
        });
      } else if(type === "scale") {
        if (!selectedRoot || !scaleType) {
          setSaveError("No scale detected to save.");
          setSaveLoading(false);
          return;
        } 

        await api.createSaved("scale", {
          name: `${selectedRoot} ${scaleType}`,
          key: selectedRoot,
          mode: scaleType,
          notes: getScaleNotes(selectedRoot, scaleType),
          chord: [],
        });

      } else if (type === "progression") {
        if (progression.length === 0) {
          setSaveError("No progression detected to save.");
          setSaveLoading(false);
          return;
        }
        console.log("Saving progression:", progression)
        await api.createSaved("progression", {
          name: progressionTemp?.name as string || `${progressionKey} ${progressionMode} Progression - ${new Date().toLocaleString()}`,
          key: progressionKey,
          mode: progressionMode,
          notes: [],
          chord: progression.map(chord => `${chord.root} ${chord.type}`)
        })
      }

      await loadSavedItems(type);
    }  catch (error) {
      console.error("Error saving item:", error);
      setSaveError("Failed to save item.");
    } finally {
      setSaveLoading(false)
    }
  }

  const handleSelectSaved = (item: SavedItem) => {
    setSelectedSaved(item);

    if (item.savedType === "chord") {
      const [root, chordType] = item.chord[0].split(" ");
      console.log(item)
      console.log(item.voicingIndex)
      console.log(root, chordType)
      setSelectedRoot(root);
      setSelectedChordType(chordType);
      setScaleType(null);
      setVoicings([]);

      

      if (root && chordType) {
        console.log(root, chordType)
        const chordNotes = getChordNotes(root, chordType)
        const v = getChordVoicings(chordNotes);
        const savedIndex = item.voicingIndex ?? 0;
        if (item.voicingIndex !== null){
          setVoicings(v)
          setVoicingIndex(savedIndex)
          if (v.length > 0) setActiveNotes(new Set(v[savedIndex].positions))
        }
        
      }

      return
    }

    if (item.savedType === "scale") {
      const root = item.key || item.notes[0];
      const scaleType = item.mode || null;

      setSelectedRoot(root);
      setScaleType(scaleType);
      setSelectedChordType(null);
      setVoicings([]);
      
      if (root && scaleType) {
        const scaleNotes = getScaleNotes(root, scaleType)
        setActiveNotes(new Set(getScalePosition(scaleNotes)))
      }

      return
    }

    if (item.savedType === "progression") {
      console.log(item)
      const key = item.key ?? "C";
      const mode = item.mode === "Minor" ? "Minor" : "Major";
      setProgressionKey(key);
      setProgressionMode(mode);
      setProgressionTemp(null);
      setVoicings([]);

      const diatonic = getDiatonicChords(key, mode)

      const savedProgression = item.chord.map((label, idx) => {
        const [root, ...type] = label.split(" ");
        const chordType = type.join(" ") || "major";

        const matched = diatonic.find((chord) => chord.root === root && chord.type === chordType)
        console.log(matched)
        return (
          matched ?? {
            root,
            type: chordType,
            fullName: `${root} ${chordType}`,
            roman: "?",
            degree: -1,
          }
        );
      })
      setDiatonicChords(diatonic);
      setProgression(savedProgression);
    }
  }

  const handleDeleteSaved = async (
    type: "chord" | "scale" | "progression",
    item: SavedItem
  ) => {
    try {
      setSaveError(null);

      if (!getAuthToken()) {
        setSaveError("You must be logged in to delete items.");
        return;
      }

      await api.deleteSaved(type, item.id);

      if (selectedSaved?.id === item.id) {
        setSelectedSaved(null);
      }

      await loadSavedItems(type);
    } catch (error) {
      console.error("Error deleting item:", error);
      setSaveError("Failed to delete item.");
    }
  };

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

  const handleRenameSaved = async (
    type: "chord" | "scale" | "progression",
    item: SavedItem,
    name: string
  ) => {
    try {
      setSaveError(null);

      if (!getAuthToken()) {
        setSaveError("You must be logged in to rename items.");
        return;
      }

      await api.updateSavedName(type, item.id, name);
      await loadSavedItems(type);
    } catch (error) {
      console.error("Error renaming item:", error);
      setSaveError("Failed to rename item.");
    }
  };

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
    setVoicingIndex(0);
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
  // console.log(mode)
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
                <Guitar className="w-6 h-6 text-primary" />
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
            <div className="relative">
              {currentUser ? (
                <>
                  <button
                    onClick={() => setAuthMenuOpen((open) => !open)}
                    className="rounded border border-border px-3 py-2 text-sm font-bold hover:bg-muted cursor-pointer"
                  >
                    {currentUser.name || currentUser.username}
                  </button>

                  {authMenuOpen && (
                    <div className="absolute right-0 mt-2 w-40 rounded border border-border bg-card shadow-lg z-20">
                      <button
                        onClick={() => {
                          setAuthMenuOpen(false);
                          router.push("/profile");
                        }}
                        className="block w-full px-3 py-2 text-left text-sm hover:bg-muted"
                      >
                        Profile
                      </button>

                      <button
                        onClick={handleLogout}
                        className="block w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-muted"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => router.push("/login")}
                    className="rounded border border-border px-3 py-2 text-sm font-bold hover:bg-muted"
                  >
                    Login
                  </button>

                  <button
                    onClick={() => router.push("/signup")}
                    className="rounded bg-primary px-3 py-2 text-sm font-bold text-background hover:opacity-90"
                  >
                    Sign Up
                  </button>
                </div>
              )}
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
        <section
          className={`grid gap-6 ${
            mode === "progression"
              ? "grid-cols-1 lg:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]"
              : "grid-cols-1 lg:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]"
          }`}
        >
          <div>
            {mode === "chord" ? (
              <>
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
                  currentCagedVoicing={currentCagedVoicing}
                  cagedIndex={cagedIndex}
                  cagedCount={cagedVoicings.length}
                  showCurrentCagedShape={showCurrentCagedShape}
                  goToPreviousCagedShape={goToPreviousCagedShape}
                  goToNextCagedShape={goToNextCagedShape}
                />
              </>
              
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
          </div>

          <SavedPanel
            type={mode}
            title={
              mode === "chord"
                ? "Saved Chords"
                : mode === "scale"
                ? "Saved Scales"
                : "Saved Progressions"
            }
            items={savedItems}
            onSave={() => handleSaveItems(mode)}
            onSelect={handleSelectSaved}
            onDelete={handleDeleteSaved}
            onRename={handleRenameSaved}
            loading={saveLoading}
            error={saveError}
            selectedSaved={selectedSaved}
          />
        </section>
        

        {/* <button className="bg-accent text-background px-4 py-2 rounded">
          Analyze Chord
        </button> */}
      </div>
    </div>
  );
}
