# Quick Fix: "Kein Datenanbieter registriert"

## Problem
Extension lädt, aber Sidebar zeigt: "Es ist kein Datenanbieter registriert, der Sichtdaten bereitstellen kann."

## Lösung

### Schritt 1: Kompiliere neu
```bash
npm run build:all
```

### Schritt 2: Extension neu laden
**Im Extension Development Host Fenster:**
- Drücke **Cmd+R** (Mac) oder **Ctrl+R** (Windows/Linux)
- ODER: Command Palette → "Developer: Reload Window"

### Schritt 3: Logs überprüfen
**Im Extension Development Host:**
1. Help → Toggle Developer Tools
2. Console Tab
3. Suche nach:
   ```
   TT-Editor: Extension activating...
   TT-Editor: [OK] ttEditor Projekt  ODER  [ ] Standard Workspace
   TT-Editor: Sidebar provider registered for view ID "ttEditor.view"
   ```

### Schritt 4: Sidebar öffnen
1. Klicke auf TT-Editor Icon in Activity Bar (links)
2. Logs sollten zeigen:
   ```
   TT-Editor: Sidebar resolveWebviewView called
   TT-Editor: Sidebar HTML set
   ```

## Wenn Sidebar immer noch leer ist

### Check 1: package.json
Stelle sicher, dass `package.json` diese Struktur hat:
```json
{
  "contributes": {
    "viewsContainers": {
      "activitybar": [{
        "id": "ttEditor",
        "title": "TT-Editor",
        "icon": "resources/icon.svg"
      }]
    },
    "views": {
      "ttEditor": [{
        "id": "ttEditor.view",
        "name": "TT-Editor"
      }]
    }
  }
}
```

### Check 2: Icon existiert
```bash
ls resources/icon.svg
```
Sollte existieren! Wenn nicht:
```bash
# Icon wurde bereits erstellt, aber falls gelöscht:
mkdir -p resources
# Erstelle neues Icon in resources/icon.svg
```

### Check 3: Extension komplett neu laden
1. **Schließe** das Extension Development Host Fenster
2. **Im Original VSCode:**
   - Drücke **F5** neu
3. Neues Fenster öffnet sich
4. Prüfe Logs wie in Schritt 3

## Wenn Canvas nicht öffnet

### Check: Canvas Button
1. Sidebar sollte Button "Canvas öffnen" zeigen
2. Klick auf Button
3. Logs sollten zeigen:
   ```
   TT-Editor: Creating canvas webview for project: <name>
   TT-Editor: Canvas ready
   ```

### Check: Webview Assets
Im Canvas Panel → Rechtsklick → "Webview Developer Tools"
- Console sollte zeigen:
  ```
  React app starting, vscodeApi available: true
  Extension bridge: READY signal sent
  Extension bridge: INIT received
  ```
- Keine roten Fehler bei Asset-Loading

## Typische Fehlerquellen

### 1. Cache-Problem
**Symptom:** Alte Version läuft weiter

**Lösung:**
```bash
# Lösche dist/
rm -rf dist/
# Neu bauen
npm run build:all
# Extension Development Host: Cmd+R
```

### 2. Zwei VSCode-Instanzen
**Symptom:** Extension läuft in falscher Instanz

**Lösung:**
- Schließe ALLE VSCode Fenster
- Öffne DIESES Projekt
- Drücke F5
- NUR ein Extension Development Host sollte öffnen

### 3. Workspace-Problem
**Symptom:** "Kein Workspace" in Sidebar

**Lösung:**
- Im Extension Development Host: File → Open Folder
- Wähle einen Ordner (egal welchen für Test)
- Extension sollte Status neu berechnen

## Erfolgreicher Test

✅ Extension lädt (Console: "Extension activating")
✅ Icon in Activity Bar sichtbar
✅ Sidebar zeigt Projekt-Status
✅ Button "Canvas öffnen" funktioniert
✅ Canvas öffnet mit Toolbar + CanvasArea
✅ Keine roten Fehler in Console

## Debugging-Kommandos

```bash
# Vollständiger Rebuild
npm run build:all

# Nur Extension
npm run compile

# Nur UI
cd src/ui && npm run build && cd ../..

# Logs live ansehen (im Terminal während Extension läuft)
# -> Dann im Extension Development Host: Help → Toggle Developer Tools

# Check compilierte Größe
ls -lh dist/extension.js src/ui/dist/assets/index.js
```

## Nächste Schritte nach erfolgreichem Start

Wenn alles läuft:
1. **Test:** Scrolle durch Komponenten-Liste in Toolbar
2. **Test:** Klicke Action Buttons (noch keine Funktion, aber keine Errors)
3. **Test:** Keyboard Shortcut Cmd+S (sollte in Console loggen)
4. **Bereit für:** DOMAIN 5 - Card System Implementation

## Support

Falls weiterhin Probleme:
1. Kopiere komplette Console-Ausgabe (Extension + Webview)
2. Screenshot von Sidebar
3. Output von: `npm run build:all`
