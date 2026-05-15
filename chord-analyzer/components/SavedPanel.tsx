import React, { Dispatch, SetStateAction } from 'react'
import { SavedItem } from '@/app/page';



interface SavedPanelProp{
    type: "chord" | "scale" | "progression"
    title: string
    items: SavedItem[]
    onSave: () => void
    onSelect: (item: SavedItem) => void;
    loading?: boolean
    error?: string| null
    selectedSaved?: SavedItem | null
}

export default function SavedPanel({
  type,
  title,
  items,
  onSave,
  onSelect,
  loading = false,
  error = null,
  selectedSaved
}: SavedPanelProp) {
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
            <button
              key={item.id}
              onClick={() => onSelect(item)}
              className="w-full rounded border border-border bg-muted p-3 text-left hover:border-primary"
            >
              <p className="font-bold">{item.name}</p>

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

              {item.chord.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  Chords: {item.chord.join(" - ")}
                </p>
              )}
            </button>
          ))
        )}
      </div>
    </aside>
  );
}
