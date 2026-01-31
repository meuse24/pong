# Projektuebersicht

## Ziel
Neon Pong ist ein minimalistisches, neon-inspiriertes Pong-Spiel im Browser. Fokus: schnelle Runden, klare Steuerung, optionale Accessibility-Verbesserungen (Haendigkeit, Sprache, Fullscreen).

## Tech-Stack
- Runtime: Browser (ES Modules)
- Game Engine: Phaser 3
- Build Tool: Vite
- Styling: Plain CSS (kein Framework)

## Implementierung (High-Level)
- `index.html`: App-Shell, UI-Overlays (Menue, Start/Info/Gameover), i18n-Container.
- `src/main.js`: Phaser Scene, Spiel-Logik, Input, Audio, UI-Events, i18n, Settings.
- `src/style.css`: Neon-Theme, Layout und UI-Komponenten.

## Build- & Dev-Prozess
- `npm run dev`: Lokale Entwicklung mit Hot Reload.
- `npm run build`: Produktions-Build nach `dist/`.
- `npm run preview`: Lokale Vorschau des Produktions-Builds.
- `npm run lint`: ESLint fuer Code-Checks.

## Einstellungen & Verhalten
- Schwierigkeit, Haendigkeit und Match-Ziel sind im Spiel gesperrt und vor dem Start einstellbar.
- Fullscreen ist optional und per Menue steuerbar.
- Sprache wird in `localStorage` gespeichert.
- Im Hochformat zeigt das UI einen Hinweis; das Spiel pausiert und fordert Querformat.
- Der Hinweis nutzt ein dezentes Rotationssymbol als visuelle Anleitung.
- Power-ups mit VFX (Phase-Ball, Pulse-Schild, Turbo-Serve, Ghost-Paddle, Invert-Spin) basieren auf In-Game-Triggern.
- Zusaetzliche Power-ups: Magnet-Fang, Dash-Paddle, Slow-Field, Laser-Serve, Barrier-Core.

## Performance
- Adaptives FX-Profil reduziert Partikel und Glow-Intensitaet bei niedriger FPS.
- Attract-Mode nutzt sparsame Partikel und Pulsringe, die bei Low-FX deaktiviert werden.

## Pflegehinweis
Diese Datei ist **nach jedem groesseren Entwicklungsschritt zu aktualisieren**, z. B. bei neuen Features, Architekturaenderungen oder Build-Workflow-Anpassungen.
