# Simplified UI Layer

This document describes the simplified UI modifications applied to TriliumNext to create a clean, focused, distraction-free note-taking experience inspired by Apple Notes and Bear Notes.

## Design Principles

- **Calm, focused design** - Reduced visual noise and distractions
- **Dark mode first** - Dark theme as default, light mode optional
- **Reading-optimized** - Maximum content width of 720px for comfortable reading
- **Progressive disclosure** - UI elements appear on hover/focus, not permanently visible
- **Minimal chrome** - Less permanent UI elements, more content space

## Architecture

All UI changes are implemented as a **separate CSS layer** (`simplify-ui.css`) that loads after all other stylesheets. This approach:

- Minimizes conflicts with upstream TriliumNext updates
- Makes it easy to revert changes (remove one file + one line)
- Keeps core files mostly untouched
- Uses CSS specificity to override default styles

### Files Modified

| File | Change |
|------|--------|
| `apps/client/src/stylesheets/simplify-ui.css` | **NEW** - Main UI simplification stylesheet |
| `apps/client/src/index.ts` | Added `simplify-ui.css` to stylesheet loading |
| `apps/server/src/services/options_init.ts` | Changed defaults: dark theme, centered content, reduced max width, plain headings |

### Upstream Merge Safety

- `simplify-ui.css` is a new file - no merge conflicts possible
- `index.ts` change is a single added line - easy to resolve if conflicted
- `options_init.ts` changes are default values only - existing installations unaffected

## UI Changes Detail

### Sidebar / Tree
- **Compact nodes** - Tree items reduced from 38px to 30px height
- **Subtle icons** - Icon opacity reduced, smaller size
- **Cleaner hover** - No border on hover, subtle background highlight
- **Reduced indentation** - 16px instead of 20px for cleaner hierarchy
- **Hidden action buttons** - Tree item buttons appear on hover only

### Editor / Content
- **Prominent title** - 1.8em, weight 700, system font stack
- **Max reading width** - 720px centered content area
- **Clean typography** - System font stack, 1.7 line height
- **Hidden metadata** - Title details fade in on hover
- **Better spacing** - More whitespace around content

### Toolbar / Ribbon
- **Auto-hide** - Ribbon hidden by default, appears on hover/focus
- **Compact buttons** - Smaller toolbar buttons
- **Subtle borders** - Minimal visual separation

### Tab Bar
- **Compact height** - Reduced from 50px to 36px
- **Clean tabs** - Rounded corners, smaller text
- **Hidden close buttons** - Tab close buttons appear on hover

### Context Menus
- **Modern styling** - Elevated background, rounded corners
- **Subtle shadows** - Deep shadows for depth
- **Compact items** - Better padding and spacing

### General
- **Dark color palette** - `#1a1a1e` primary background, warm accent color
- **Thin scrollbars** - 6px width, subtle coloring
- **Smooth transitions** - 150ms transitions on interactive elements
- **Flat buttons** - Clean, flat button design with accent color for primary

## Color Palette

| Variable | Value | Usage |
|----------|-------|-------|
| `--simplify-bg-primary` | `#1a1a1e` | Main background |
| `--simplify-bg-secondary` | `#141416` | Sidebar background |
| `--simplify-bg-elevated` | `#222226` | Menus, modals |
| `--simplify-text-primary` | `#e0e0e0` | Primary text |
| `--simplify-text-secondary` | `#8e8e93` | Secondary text |
| `--simplify-accent` | `#e8935a` | Accent/primary buttons |

## Reverting Changes

To fully revert to the default TriliumNext UI:

1. Delete `apps/client/src/stylesheets/simplify-ui.css`
2. Remove the `simplify-ui.css` line from `apps/client/src/index.ts`
3. Revert default option values in `apps/server/src/services/options_init.ts`
