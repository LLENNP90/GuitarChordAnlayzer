import { NOTES, STRINGS } from "./musicLogic";

type CagedShape = "C" | "A" | "G" | "E" | "D";

type Degree = "R" | "3" | "5";

type CagedTemplateNote = {
  string: number;
  fretOffset: number;
  degree: Degree;
};

type CagedTemplate = {
  shape: CagedShape;
  rootAnchor: {
    string: number;
    fretOffset: number;
  };
  mutedStrings: number[];
  notes: CagedTemplateNote[];
};

export type CagedVoicing = {
  shape: CagedShape;
  root: string;
  baseFret: number;
  positions: {
    string: number;
    fret: number;
    degree: Degree;
  }[];
};

const CAGED_TEMPLATES: CagedTemplate[] = [
  {
    shape: "E",
    rootAnchor: { string: 5, fretOffset: 0 },
    mutedStrings: [],
    notes: [
      { string: 5, fretOffset: 0, degree: "R" },
      { string: 4, fretOffset: 2, degree: "5" },
      { string: 3, fretOffset: 2, degree: "R" },
      { string: 2, fretOffset: 1, degree: "3" },
      { string: 1, fretOffset: 0, degree: "5" },
      { string: 0, fretOffset: 0, degree: "R" },
    ],
  },
  {
    shape: "A",
    rootAnchor: { string: 4, fretOffset: 0 },
    mutedStrings: [5],
    notes: [
      { string: 4, fretOffset: 0, degree: "R" },
      { string: 3, fretOffset: 2, degree: "5" },
      { string: 2, fretOffset: 2, degree: "R" },
      { string: 1, fretOffset: 2, degree: "3" },
      { string: 0, fretOffset: 0, degree: "5" },
    ],
  },
  {
    shape: "D",
    rootAnchor: { string: 3, fretOffset: 0 },
    mutedStrings: [4, 5],
    notes: [
      { string: 3, fretOffset: 0, degree: "R" },
      { string: 2, fretOffset: 2, degree: "5" },
      { string: 1, fretOffset: 3, degree: "R" },
      { string: 0, fretOffset: 2, degree: "3" },
    ],
  },
  {
    shape: "C",
    rootAnchor: { string: 4, fretOffset: 3 },
    mutedStrings: [5],
    notes: [
      { string: 4, fretOffset: 3, degree: "R" },
      { string: 3, fretOffset: 2, degree: "3" },
      { string: 2, fretOffset: 0, degree: "5" },
      { string: 1, fretOffset: 1, degree: "R" },
      { string: 0, fretOffset: 0, degree: "3" },
    ],
  },
  {
    shape: "G",
    rootAnchor: { string: 5, fretOffset: 3 },
    mutedStrings: [],
    notes: [
      { string: 5, fretOffset: 3, degree: "R" },
      { string: 4, fretOffset: 2, degree: "3" },
      { string: 3, fretOffset: 0, degree: "5" },
      { string: 2, fretOffset: 0, degree: "R" },
      { string: 1, fretOffset: 3, degree: "3" },
      { string: 0, fretOffset: 3, degree: "R" },
    ],
  },
];

function getNoteOnString(stringId: number, fret: number) {
  const openNote = STRINGS[stringId];
  const openIndex = NOTES.indexOf(openNote);

  return NOTES[(openIndex + fret) % 12];
}

function findFretsForNoteOnString(
  stringId: number,
  note: string,
  maxFret = 15
) {
  const frets: number[] = [];

  for (let fret = 0; fret <= maxFret; fret++) {
    if (getNoteOnString(stringId, fret) === note) {
      frets.push(fret);
    }
  }

  return frets;
}

function buildCagedVoicingsForTemplate(
  root: string,
  template: CagedTemplate,
  maxFret = 15
): CagedVoicing[] {
  const possibleRootFrets = findFretsForNoteOnString(
    template.rootAnchor.string,
    root,
    maxFret
  );

  return possibleRootFrets
    .map((rootFret) => {
      const baseFret = rootFret - template.rootAnchor.fretOffset;

      const positions = template.notes.map((note) => ({
        string: note.string,
        fret: baseFret + note.fretOffset,
        degree: note.degree,
      }));

      return {
        shape: template.shape,
        root,
        baseFret,
        positions,
      };
    })
    .filter((voicing) =>
      voicing.positions.every(
        (position) => position.fret >= 0 && position.fret <= maxFret
      )
    );
}

export function getCagedVoicings(root: string, maxFret = 15): CagedVoicing[] {
  return CAGED_TEMPLATES
    .flatMap((template) =>
      buildCagedVoicingsForTemplate(root, template, maxFret)
    )
    .sort((a, b) => a.baseFret - b.baseFret);
}

export function cagedVoicingToActiveNotes(voicing: CagedVoicing) {
  return new Set(
    voicing.positions.map((position) => {
      return `${position.string}-${position.fret}`;
    })
  );
}
