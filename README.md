# soloRPG Writer

Desktop companion app for the soloRPG engine. Authors complete campaign packages — scenes, quests, items, and screen layout templates — and exports them ready for the engine to load.

Built with Tauri v2 + React 19 + TypeScript + Vite.

---

## Requirements

- Node.js 20+
- Rust (stable, via rustup)
- Tauri CLI v2 (`cargo install tauri-cli --version "^2"`)

---

## Setup

```bash
cd soloRPG-writer
npm install
```

---

## Development

```bash
npm run tauri dev
```

Starts the Vite dev server and the Tauri app with hot-reload.

---

## Tests

```bash
npm test
```

Runs the Vitest unit test suite. Tauri modules are mocked automatically — no desktop app needed to run tests.

---

## Build

```bash
npm run tauri build
```

Produces a signed `.app` (macOS) or installer (Windows/Linux) in `src-tauri/target/release/bundle/`.

---

## Features

### Story Workspace

The main authoring view. Create and edit:

- **Scenes** — title, body text, scene template, choices (with conditions and effects)
- **Items** — display names and descriptions
- **Quests** — name and description
- **Encounters** — monsters, win/lose/flee outcomes
- **Ability checks** — stat, DC, success/fail branches

Save as a `.json` project file or open an existing one. Open a `manifest.json` to import an exported campaign back into the editor.

**Export campaign** copies the story, assets, and custom templates into a folder structure the engine can load directly.

### Template Designer

A standalone canvas tool (accessible from the main menu) for designing custom screen layouts. Layouts are saved as JSON files in the campaign's `templates/` folder.

The designer works at 4× logical scale (a 250×122 engine screen renders as a 1000×488 px canvas). Slots are colour-coded by type:

| Colour | Slot type |
|---|---|
| Blue | `title` |
| Green | `narrative` |
| Amber | `asset` |
| Grey | `separator` |
| Purple | `menu` |

`asset` and `separator` slots are resizable on the canvas. `title`, `narrative`, and `menu` slots are positioned by dragging and edited in the inspector panel.

Templates are saved into any campaign folder you point the tool at. They are independent of any open story — the Template Designer is an engine tooling concern, not a per-story concern.

---

## File layout

```
src/
  app/              # Zustand stores, save/load, campaign exporter
  features/
    home/           # Landing page
    story/          # Story Workspace and all sub-editors
    templates/      # Template Designer (store, canvas, inspector, serializer)
  types/            # Shared TypeScript types
  assets/           # UI images
src-tauri/
  src/
    commands/       # Rust Tauri commands (file I/O, asset copy)
    lib.rs          # Command registration
  capabilities/     # Tauri v2 permission declarations
  tauri.conf.json
```

---

## Related

- `soloRPG/` — the Python engine that runs campaign packages
- `soloRPG/docs/campaign-package-format.md` — full reference for campaign JSON formats
- `soloRPG/docs/architecture.md` — system architecture overview
