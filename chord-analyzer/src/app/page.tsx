import Fretboard from "../../components/Fretboard";

export default function Home() {
  return (
    <div className="bg-background font-sans min-h-screen p-8">
      <h1 className="text-primary text-4xl font-bold font-heading">Reverse Chord Analyzer</h1>
      <p className="text-text mt-4 font-body mb-4">Select your frets below:</p>
      <div className="">
        <Fretboard />
      </div>
      <button className="bg-accent text-background px-4 py-2 rounded">
        Analyze Chord
      </button>
    </div>
  );
}
