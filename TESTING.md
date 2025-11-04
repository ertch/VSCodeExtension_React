# TT-Editor Extension - Testing Guide

## Voraussetzungen

✅ Alle Dateien kompiliert:
- `dist/extension.js` (17.7 kb)
- `src/ui/dist/index.html`
- `src/ui/dist/assets/index.js` (214.37 kB)
- `src/ui/dist/assets/index.css` (1.87 kB)
- `resources/icon.svg`

✅ VSCode Konfiguration:
- `.vscode/launch.json` (Extension Host Launch)
- `.vscode/tasks.json` (Build Tasks)

## Extension starten

### Methode 1: F5 Shortcut
1. Öffne dieses Projekt in VSCode
2. Drücke **F5**
3. Ein neues VSCode-Fenster öffnet sich (Extension Development Host)

### Methode 2: Run & Debug Panel
1. Öffne Run & Debug Panel (Ctrl+Shift+D)
2. Wähle "Run Extension"
3. Klicke auf grünen Play-Button
4. Ein neues VSCode-Fenster öffnet sich

## Was du sehen solltest

### 1. Extension Development Host startet
- Neues VSCode-Fenster öffnet sich
- Titel: `[Extension Development Host]`

### 2. Activity Bar (Links)
- **TT-Editor Icon** sollte sichtbar sein (blaues Quadrat mit "TT")
- Klicke darauf → Sidebar öffnet sich

### 3. Sidebar Content
Zeigt:
```
TT-Editor
Projekt: <dein-ordner-name>
Status: [ ] Standard Workspace  ODER  [OK] ttEditor Projekt

[Canvas öffnen] Button
[Code generieren] Button (disabled wenn nicht ttEditor Projekt)
```

### 4. Canvas öffnen
- Klicke auf "Canvas öffnen" Button
- **ODER** Command Palette (Cmd+Shift+P): `TT-Editor: Canvas öffnen`
- Canvas-Panel öffnet sich mit:
  - **Links:** Toolbar (Komponenten-Liste)
  - **Rechts:** CanvasArea (leer mit "Canvas ist leer")
  - **Unten:** Action Buttons (Speichern, Laden, Canvas leeren, Code generieren)

## Troubleshooting

### Extension lädt nicht
**Problem:** Nichts passiert beim F5 drücken

**Lösung:**
```bash
# Neu kompilieren
npm run compile
cd src/ui && npm run build && cd ../..

# Reload Window im Extension Development Host
Cmd+R (Mac) / Ctrl+R (Windows/Linux)
```

### Sidebar zeigt nichts
**Problem:** Icon ist da, aber Sidebar leer

**Check Console:**
1. Im Extension Development Host: Help → Toggle Developer Tools
2. Schaue nach Fehlern in der Console
3. Typische Fehler:
   - `Cannot find module` → npm install fehlt
   - `acquireVsCodeApi is not a function` → Webview nicht korrekt geladen

### Canvas zeigt nur "Lade Canvas..."
**Problem:** Canvas bleibt im Loading State

**Check:**
1. Console im Webview Developer Tools öffnen:
   - Im Canvas-Panel: Rechtsklick → "Webview Developer Tools"
2. Schaue nach Fehlern:
   - `vscodeApi is not defined` → Injection fehlt
   - `Failed to load resource` → Asset-Pfade falsch
   - React Errors → Component-Fehler

### "Canvas ist leer" anstatt Komponenten
**Das ist KORREKT!**
- Initial ist der Canvas leer
- Toolbar links sollte Komponenten-Liste zeigen
- Drag & Drop ist noch NICHT implementiert (STUB)

## Was FUNKTIONIERT (aktuell)

✅ Extension aktiviert
✅ Sidebar zeigt Projekt-Status
✅ Canvas öffnet
✅ Toolbar zeigt Komponenten-Liste
✅ CanvasArea zeigt Empty State
✅ Action Buttons sind sichtbar
✅ Keyboard Shortcuts (Cmd+S) funktionieren
✅ Message Protocol (READY → INIT)

## Was NICHT funktioniert (noch STUB)

❌ Drag & Drop von Komponenten
❌ Tree Rendering (Cards)
❌ Attribute Editing
❌ Drop Zones (above/below/inside)
❌ Nesting Visualization
❌ Save/Load (Backend funktioniert, aber kein Tree zum Speichern)
❌ Code Generation (kein Tree zum Generieren)

## Debugging-Tipps

### Extension Console
```
Extension Development Host → Help → Toggle Developer Tools → Console
```
Zeigt Extension-seitige Logs:
- `TT-Editor: Extension activating...`
- `TT-Editor: [OK] ttEditor Projekt` oder `[ ] Standard Workspace`
- `TT-Editor: Canvas ready`

### Webview Console
```
Canvas Panel → Rechtsklick → Webview Developer Tools → Console
```
Zeigt React-seitige Logs:
- `React app starting, vscodeApi available: true`
- `Extension bridge: INIT received`
- `Extension bridge: READY signal sent`

### Message Flow überprüfen
1. Öffne beide Consoles (Extension + Webview)
2. Öffne Canvas
3. Erwartete Messages:
   ```
   [Webview Console]
   → "Extension bridge: READY signal sent"

   [Extension Console]
   → "TT-Editor: Canvas ready"

   [Webview Console]
   → "Extension bridge: INIT received" {projectName: "...", isValidProject: false, config: null}
   ```

## Nächste Schritte nach erfolgreichem Test

1. **DOMAIN 5: Card System** implementieren
   - Card.tsx Component erstellen
   - CanvasArea mit rekursivem Tree-Rendering
   - Volle Drag & Drop Funktionalität
   - Drop Zone Indikatoren

2. **Testing & Bug Fixing**
   - Drag Komponente von Toolbar zu Canvas
   - Reorder via Drag & Drop
   - Max Depth Validation (5 Ebenen)
   - Circular Dependency Prevention

3. **Code Generator aktivieren**
   - Erst wenn alles läuft!

## Support

**Fehler gefunden?**
1. Kopiere Console-Ausgabe (Extension + Webview)
2. Beschreibe was du getan hast
3. Beschreibe was passiert ist vs. was passieren sollte

**Typische Fehler und Lösungen:**
- `Module not found` → `npm install` in Root UND src/ui
- `Cannot read property 'postMessage'` → vscodeApi nicht injiziert
- Webview bleibt weiß → Check Browser Console für Asset-Loading-Errors
- Extension lädt nicht → Check resources/icon.svg existiert
