import React, { Dispatch, SetStateAction, useState } from 'react'
import { SavedItem } from '@/app/page';
import { getDiatonicChords } from '../lib/progressionLogic';
import { Trash2, Pencil, Check, X  } from 'lucide-react';


interface SavedPanelProp{
    type: "chord" | "scale" | "progression"
    title: string
    items: SavedItem[]
    onSave: () => void
    onSelect: (item: SavedItem) => void;
    onDelete: (type: "chord" | "scale" | "progression", item: SavedItem) => void;
    onRename: (type: "chord" | "scale" | "progression", item: SavedItem, newName: string) => void;
    loading?: boolean
    error?: string| null
    selectedSaved?: SavedItem | null
}

//helper function
function getRomanProgression(item: SavedItem) {
  if (!item.key || !item.mode || item.chord.length === 0) {
    return "";
  }

  const mode = item.mode === "Minor" ? "Minor" : "Major";
  const diatonic = getDiatonicChords(item.key, mode);

  return item.chord
    .map((label) => {
      const [root, ...typeParts] = label.split(" ");
      const chordType = typeParts.join(" ") || "major";

      const matched = diatonic.find(
        (chord) => chord.root === root && chord.type === chordType
      );

      return matched?.roman ?? "?";
    })
    .join(" - ");
}



export default function SavedPanel({
  type,
  title,
  items,
  onSave,
  onSelect,
  loading = false,
  error = null,
  selectedSaved,
  onDelete,
  onRename
}: SavedPanelProp) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftName, setDraftName] = useState("");

  const startEditing = (item: SavedItem) => {
    setEditingId(item.id);
    setDraftName(item.name);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setDraftName("");
  };

  const saveEditing = async (item: SavedItem) => {
    const nextName = draftName.trim();

    if (!nextName) return;

    await onRename(item.savedType, item, nextName);

    setEditingId(null);
    setDraftName("");
  };

  return (
    <aside className="rounded-lg border border-border bg-card p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-primary">{title}</h2>

        <button
          onClick={onSave}
          disabled={loading}
          className="rounded border border-border px-3 py-2 text-sm font-bold hover:bg-primary hover:text-background disabled:opacity-50"
        >
          {loading ? "Saving..." : `Save ${type}`}
        </button>
      </div>

      {error && (
        <p className="mb-3 rounded border border-red-500 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="max-h-[520px] space-y-2 overflow-y-auto">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No saved {type}s yet.
          </p>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelect(item)}
              className="w-full rounded border border-border bg-muted p-3 text-left hover:border-primary"
            >
            <div className="flex flex-row items-center gap-2">
              {editingId === item.id ? (
                <input
                  value={draftName}
                  onChange={(e) => setDraftName(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      saveEditing(item);
                    }

                    if (e.key === "Escape") {
                      cancelEditing();
                    }
                  }}
                  className="min-w-0 flex-1 rounded border border-border bg-background px-2 py-1 text-sm font-bold"
                  autoFocus
                />
              ) : (
                <p className="min-w-0 flex-1 font-bold">{item.name}</p>
              )}

              {editingId === item.id ? (
                <>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      saveEditing(item);
                    }}
                  >
                    <Check size={16} className="text-green-600" />
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      cancelEditing();
                    }}
                  >
                    <X size={16} className="text-muted-foreground" />
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(item.savedType, item);
                    }}
                  >
                    <Trash2 size={16} className="text-red-500 hover:text-red-700" />
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      startEditing(item);
                    }}
                  >
                    <Pencil size={16} className="text-primary hover:text-primary-700" />
                  </button>
                </>
              )}
            </div>

              

              {item.key && (
                <p className="text-xs text-muted-foreground">
                  {item.key} {item.mode ?? ""}
                </p>
              )}

              {item.notes.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  Notes: {item.notes.join(", ")}
                </p>
              )}
              {type === "progression" && (
                <p className="text-xs text-muted-foreground">
                  {getRomanProgression(item)}
                </p>
              )}

              {item.chord.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  Chords: {item.chord.join(" - ")}
                </p>
              )}
            </div>
          ))
        )}
      </div>
    </aside>
  );
}
