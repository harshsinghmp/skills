# 🛡️ 11 — The 5-State Anti-Slop Coverage Gate

> Inspired by `anti-ui-slop` and `gogh`.
> **Core Mandate**: Eliminates "happy-path only" frontend code by requiring explicit handling of all 5 UI lifecycle states.

AI coding assistants frequently produce components that look acceptable with mocked, perfect-length data, but break catastrophically in production:
- An empty table leaves users staring at a barren white box with no guidance.
- Slow network requests show blank screens or layout shift (CLS).
- Network errors fail silently or log red text to developer consoles without a retry button.
- A user with a long email or German translation blows out the sidebar width.

The **5-State Anti-Slop Coverage Gate** makes handling all 5 states a mandatory completion requirement for any UI refactor.

---

## 📋 The 5 Mandatory UI States

| State | Lifecycle Trigger | Visual Contract & Best Practice | Anti-Pattern to Reject |
| :--- | :--- | :--- | :--- |
| **1. Empty State** | Zero items returned (`data.length === 0`) | Soft icon/illustration, descriptive header explaining what belongs here, single direct CTA to create/import the first item. | Empty white container, unstyled "No data" text, or hiding the section entirely. |
| **2. Loading State** | Async query active (`isLoading === true`) | Geometry-preserving skeleton (`animate-pulse bg-muted rounded`) matching the final layout. Prevents Cumulative Layout Shift (CLS). | Fullscreen generic blocking spinners, or unstyled empty boxes that snap into place. |
| **3. Error State** | Query / mutation failed (`isError === true`) | Non-blocking inline banner with semantic destructive tint (`bg-destructive/10 text-destructive`), human-readable diagnosis, and a prominent "Retry" button. | Silent failure, blank screen, raw JSON stack trace dumps in UI. |
| **4. Success State** | Mutation / action resolved (`isSuccess === true`) | Immediate transient visual feedback (toast, green checkmark badge, brief animation) confirming completion. | Lack of feedback causing user to double-click buttons or wonder if action worked. |
| **5. Overflow State** | Extreme text lengths, narrow viewports | `truncate` with full text in a `title` attribute or tooltip, `line-clamp-2` for cards, `overflow-x-auto` for tables, flex wrap on tags. | Text clipping offscreen, broken layout grids, horizontal page scroll on mobile. |

---

## 💻 Canonical Implementation Pattern (React + Tailwind)

```tsx
import React, { useState } from "react";
import { AlertCircle, RefreshCw, Plus, CheckCircle2 } from "lucide-react";

interface Item {
  id: string;
  name: string;
  description: string;
}

interface ItemListProps {
  items: Item[] | undefined;
  isLoading: boolean;
  error: Error | null;
  onRetry: () => void;
  onCreate: () => void;
}

export function ItemList({
  items,
  isLoading,
  error,
  onRetry,
  onCreate,
}: ItemListProps) {
  // 1. LOADING STATE: Content-shaped skeleton matching final geometry
  if (isLoading) {
    return (
      <div className="space-y-3" role="status" aria-label="Loading items">
        {[1, 2, 3].map((n) => (
          <div
            key={n}
            className="flex items-center justify-between p-4 rounded-lg border border-border bg-card/50 animate-pulse"
          >
            <div className="space-y-2 flex-1 max-w-md">
              <div className="h-4 bg-muted rounded w-1/3" />
              <div className="h-3 bg-muted rounded w-2/3" />
            </div>
            <div className="h-8 w-20 bg-muted rounded" />
          </div>
        ))}
      </div>
    );
  }

  // 2. ERROR STATE: Inline non-blocking banner with human diagnosis and direct Retry CTA
  if (error) {
    return (
      <div
        role="alert"
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-lg border border-destructive/20 bg-destructive/10 text-destructive text-sm"
      >
        <div className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>Unable to load items. {error.message || "Please check your network."}</span>
        </div>
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium text-xs bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-destructive shrink-0"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Retry
        </button>
      </div>
    );
  }

  // 3. EMPTY STATE: Educational illustration, clear copy, direct action CTA
  if (!items || items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 rounded-xl border border-dashed border-border bg-muted/20 text-center">
        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center mb-3">
          <Plus className="h-5 w-5 text-muted-foreground" />
        </div>
        <h3 className="font-semibold text-foreground text-sm">No items yet</h3>
        <p className="text-xs text-muted-foreground mt-1 max-w-xs mb-4">
          Create your first item to begin tracking project assets.
        </p>
        <button
          onClick={onCreate}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md font-medium text-xs bg-primary text-primary-foreground hover:bg-primary/90 transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary"
        >
          <Plus className="h-3.5 w-3.5" />
          Create First Item
        </button>
      </div>
    );
  }

  // 4. LOADED & 5. OVERFLOW STATE: Defensive truncation and wrapping
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div
          key={item.id}
          className="flex items-center justify-between gap-4 p-4 rounded-lg border border-border bg-card hover:bg-muted/30 transition-colors"
        >
          {/* OVERFLOW PROTECTION: min-w-0 prevents flex children from expanding past parent */}
          <div className="min-w-0 flex-1">
            <h4
              className="font-medium text-sm text-foreground truncate"
              title={item.name}
            >
              {item.name}
            </h4>
            <p
              className="text-xs text-muted-foreground line-clamp-2 mt-0.5"
              title={item.description}
            >
              {item.description}
            </p>
          </div>
          <button className="shrink-0 text-xs font-medium text-primary hover:underline focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary rounded px-2 py-1">
            View
          </button>
        </div>
      ))}
    </div>
  );
}
```

---

## 🎯 Verification Gate

Before submitting any component refactor:
1. Does the component render properly when `items = []`?
2. Does the skeleton occupy the exact same dimensions as loaded rows to prevent CLS?
3. Does clicking `Retry` trigger the recovery handler without page reload?
4. When names exceed 60 characters, does the text truncate cleanly without pushing buttons offscreen?
5. Are all interactive targets accessible via keyboard tab with visible focus rings?
