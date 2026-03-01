# Simplified UI Layer

A radical UI simplification that transforms TriliumNext into a clean, focused note-taking experience like Apple Notes / Bear.

## What Gets Hidden

The following UI elements are **completely removed** via `display: none`:

- Right pane (Table of Contents, Highlights)
- Ribbon / toolbar (formatting bar)
- Classic CKEditor toolbar
- Status bar / breadcrumbs
- Promoted attributes
- Note badges
- Floating buttons
- Content header (read-only bar, shared info)
- Tab scroll arrows
- Title row action buttons
- Note indicator icons (clone, shared)
- Note icon in title row

## What Gets Simplified

- **Launcher pane**: Narrowed to 44px, icons dimmed
- **Sidebar tree**: Nodes shrunk to 28px, 13px font, subtle colors
- **Tab bar**: Height 34px, tabs 28px, close button hidden until hover
- **Note title**: 28px bold, SF Pro Display font, no icon
- **Editor content**: 700px max width, centered, 15px text, 1.75 line height
- **Context menus**: Rounded 10px, blur backdrop, compact items

## Color Palette

| Color | Hex | Usage |
|-------|-----|-------|
| Background | `#1c1c1e` | Main editor area |
| Sidebar | `#161618` | Left pane, launcher, tab bar |
| Elevated | `#2c2c2e` | Menus, modals, dialogs |
| Text | `#e5e5e7` | Primary text, active items |
| Text dim | `#98989d` | Sidebar text, secondary |
| Accent | `#e8935a` | Primary buttons, selection |

## Files Modified

| File | Change |
|------|--------|
| `apps/client/src/stylesheets/simplify-ui.css` | **NEW** - All visual overrides (CSS only) |
| `apps/client/src/index.ts` | 1 line added: load simplify-ui.css last |
| `apps/server/src/services/options_init.ts` | Defaults: dark theme, right pane hidden, narrow left pane, centered content |

## Reverting

1. Delete `apps/client/src/stylesheets/simplify-ui.css`
2. Remove the `simplify-ui.css` line from `apps/client/src/index.ts`
3. Revert defaults in `apps/server/src/services/options_init.ts`
